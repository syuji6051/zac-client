import * as puppeteer from 'puppeteer';
import { workList, workDiv } from './work-list';

const ZAC_BASE_URL = 'https://secure.zac.ai/beex';

type work = {
  hour: number;
  minute: number;
  code: string;
  text?: string;
}

export default class ZacClient {
  page: puppeteer.Page;
  userId: string;
  password: string;
  isOpenDialog: boolean;
  constructor(page: puppeteer.Page, userId: string, password: string) {
    this.page = page;
    this.userId = userId;
    this.password = password;
    this.isOpenDialog = false;
  }
  async init() {
    await this.eventRegister();
  }
  async login() {
    await this.init();
    await this.page.goto(`${ZAC_BASE_URL}/User/user_logon.asp`);
    
    const isSecureConsole = await this.page.$('input[id="Login1_UserName"]') !== null;

    if (isSecureConsole) {
      await this.page.type('input[id="Login1_UserName"]', this.userId);
      await this.page.type('input[id="Login1_Password"]', this.password);
      await this.page.click('#Login1_LoginButton');  
    }

    await this.page.waitForXPath("//input[@name='user_name']");
    await this.page.waitForXPath("//input[@name='password']");

    console.log(isSecureConsole);
    await this.page.type('input[name="password"]', this.password);
    await this.page.click('#submit1');
    await this.page.waitForSelector('.top-main_inner');
    console.log('login success');
  }

  async nippou(year: number, month: number, day: number, works: work[]) {
    await this.page.goto(`${ZAC_BASE_URL}/b/asp/Shinsei/Nippou`);
    await this.page.waitForSelector('#classic_window');
    console.log('nippou opened');
    const frames = await this.page.frames();
    const window = frames.find(frame => {
      console.log(frame.name());
      return frame.name() === 'classic_window';
    });
    if(window === undefined) {
      console.log('classic window not found');
      return;
    }

    await window.waitForSelector('input[name="year_schedule"]');
    const yearInput = await window.$(`input[name="year_schedule"]`);
    await yearInput.click({ clickCount: 3 });
    await yearInput.type(String(year));

    await window.waitForXPath(`//select[@name='month_schedule']`);
    await window.select('select[name="month_schedule"]', month.toString());
    console.log('month selected');

    await window.waitForNavigation({timeout: 6000, waitUntil: "domcontentloaded"});
    console.log('day opened day:', day);

    const messages = await window.$$('a.link_cell');
    console.log('messages count:', messages.length);

    const daysEl = await Promise.all(messages.map(async message =>
      await message.getProperty('textContent')
        .then(async res =>
          (await res.jsonValue() as string).trim())
        ))
        .then(bits => messages.filter((_, i) => {
          const days = bits[i] as string;
          return days.match(new RegExp(day.toString()))
        }));

    console.log('daysEl count', daysEl.length);

    if (daysEl.length === 1) {
      await daysEl[0].click();
    } else {
      if (day <= 7) {
        await daysEl[0].click();
      } else {
        await daysEl[1].click();
      }
    }

    await window.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"});
    console.log('day selected');

    await window.select('select[name="time_in_hour"]', '9');
    await window.select('select[name="time_in_minute"]', '30');
    console.log('time_in selected');

    await window.select('select[name="time_out_hour"]', '18');
    await window.select('select[name="time_out_minute"]', '0');
    console.log('time_out selected');

    await window.select('select[name="time_break_input_hour"]', '1');
    await window.select('select[name="time_break_input_minute"]', '0');
    console.log('time_break_input selected');

    const maxRowCount = works.length < 5 ? 5 : Math.trunc(works.length / 5) * 5;
    await window.select('select[name="display_count"]', maxRowCount.toString());
    this.isOpenDialog = false;
    await window.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"});

    for(let i = 0; i < maxRowCount; i += 1) {
      const rowNum = i + 1;

      if(i < works.length) {
        console.log('works record', works[i]);
        const { code, text, hour, minute } = works[i];
        await this.workInput(window, code, text, hour, minute, rowNum);
      } else {
        await this.clearWorkInput(window, rowNum);
      }
    }

    await window.click('#button7');
    console.log('button7 clicked');

    if(!this.isOpenDialog){
      await window.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } else {
      await this.page.screenshot({
        path: './error.png'
      });
      return Promise.reject('dialog open error');
    }
  }

  async workInput(window: puppeteer.Frame, orderCode: string, freeText: string = '', hour: number, minute: number, rowNum: number) {
    console.log('order code execute', orderCode, 'rowNumber', rowNum);
    
    const workCode = getWorkDiv(orderCode);
    await window.waitForSelector(`select[name="id_sagyou_naiyou${rowNum}"]`);
  
    await window.select(`select[name="id_sagyou_naiyou${rowNum}"]`, workCode);
    console.log(`id_sagyou_naiyou${rowNum} selected`, workCode);

    if(workCode === '1') {
      await window.type(`input[name="code_project${rowNum}"]`, orderCode);
      await window.type(`input[name="code_project${rowNum}"]`, String.fromCharCode(13));
      console.log(`code_project${rowNum} typed`);
    }  
  
    await window.select(`select[name="time_required_hour${rowNum}"]`, String(hour));
    await window.select(`select[name="time_required_minute${rowNum}"]`, String(minute));
    console.log('time_required selected');
  
    const textArea = await window.$(`textarea[name="memo${rowNum}"]`);
    await textArea.click({ clickCount: 3 });
    await textArea.type(freeText);
    console.log('memo typed');
  }

  async clearWorkInput(window: puppeteer.Frame, rowNum: number) {
    await window.waitForSelector(`select[name="time_required_hour${rowNum}"]`);
    await window.waitForSelector(`select[name="time_required_minute${rowNum}"]`);

    await window.select(`select[name="time_required_hour${rowNum}"]`, String(0));
    await window.select(`select[name="time_required_minute${rowNum}"]`, String(0));

    console.log(`select[name="id_sagyou_naiyou${rowNum}"]`, String(0))
  }

  async workOutput(month: number) {
    await this.page.goto(`${ZAC_BASE_URL}/b/output/asp/output/Output/ASP/SagyouJikanShukei`);
    await this.page.waitForSelector('#classic_window');
    console.log('nippou opened');

    const frames = await this.page.frames();
    const window = frames.find(frame => {
      console.log(frame.name());
      return frame.name() === 'classic_window';
    });
    if(window === undefined) {
      console.log('classic window not found');
      return;
    }

    await window.click('input[id="table-firsttr-td-inp"]');
  }

  async eventRegister() {
    this.page.on('dialog', async dialog => {
      console.log('dialog message:', dialog.message());
      this.isOpenDialog = true;
      await dialog.accept();
      return;
    });
  }
}

function getWorkDiv(code: string) {
  const work = workList.find(work => work.code === code);
  return work === undefined ? workDiv.normalWork : work.workDiv;
}
