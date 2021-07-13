import * as puppeteer from 'puppeteer-core';
import * as winston from 'winston';
import Ajv from 'ajv';

import { workList, WorkDiv } from './work-list';

const avg = Ajv();
const logger = winston.createLogger();
const ZAC_BASE_URL = 'https://secure.zac.ai';

const zacWorkSchema = {
  required: [
    'workDate',
    'workStartHour',
    'workStartMinute',
    'workEndHour',
    'workEndMinute',
  ],
  type: 'object',
};
const zacWorkValidate = avg.compile(zacWorkSchema);

export type ZacRegisterParams = {
  workDate: Date
  workStartHour: number
  workStartMinute: WorkMinute
  workEndHour: number
  workEndMinute: WorkMinute
  workBreakHour: number
  workBreakMinute: WorkMinute
  works: Work[]
}

type WorkMinute = 0 | 15 | 30 | 45

export type Work = {
  hour: number;
  minute: WorkMinute;
  code: string;
  text?: string;
}
export class ZacClient {
  browser: puppeteer.Browser;

  page: puppeteer.Page;

  zacBaseUrl: string;

  userId: string;

  password: string;

  constructor(
    browser: puppeteer.Browser,
    tenantId: string, userId: string, password: string, debug: boolean = false,
  ) {
    this.browser = browser;
    this.userId = userId;
    this.password = password;
    this.zacBaseUrl = `${ZAC_BASE_URL}/${tenantId}`;
    logger.configure({
      level: debug ? 'debug' : 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  protected async zacVoidFunction(func: Function, params: ZacRegisterParams): Promise<void> {
    try {
      await this.open();
      await this.login();
      await func(params);
    } catch (e) {
      logger.error(e);
      logger.error(e.stack);
      await this.page.screenshot({
        path: 'error.png',
        type: 'jpeg',
      });
      throw Error(e);
    } finally {
      await this.close();
    }
  }

  public async register(params: ZacRegisterParams) {
    this.validation(params);
    await this.zacVoidFunction(this.innerRegister.bind(this), params);
  }

  private async innerRegister(params: ZacRegisterParams) {
    const frame = await this.getNippouFrame(params.workDate);
    await this.selectWorkDate(frame, params);
    await this.setWorkInputs(frame, params.works);
    await this.clickRegisterBtn(frame, params.workDate);
  }

  // public bulkRegister() {

  // }

  // public getResult() {

  // }

  // public getMonthResults() {

  // }

  private async open() {
    this.page = await this.browser.newPage();
  }

  private async close() {
    await this.page.close();
  }

  validation(params: ZacRegisterParams) {
    const valid = zacWorkValidate(params);
    console.log(params);
    // const workAll = params.works.reduce((pre, cur) => pre += cur.hour * 60 + cur.minute, 0);
    if (!valid) throw new Error('not require parameter');
  }

  async login() {
    await this.page.goto(`${this.zacBaseUrl}/User/user_logon.asp`);

    const isSecureConsole = await this.page.$('input[id="Login1_UserName"]') !== null;

    if (isSecureConsole) {
      await this.page.type('input[id="Login1_UserName"]', this.userId);
      await this.page.type('input[id="Login1_Password"]', this.password);
      await this.page.click('#Login1_LoginButton');
    }
    logger.debug('secure console login success');

    await this.page.waitForXPath("//input[@name='user_name']");
    await this.page.waitForXPath("//input[@name='password']");

    logger.debug(isSecureConsole);
    await this.page.waitFor(10);
    await this.page.type('input[name="password"]', this.password);
    console.log(this.password);
    await this.page.click('button.cv-button');
    await this.page.waitForSelector('.top-main_inner');
    logger.info('login success');
  }

  private async getNippouFrame(workDate: Date): Promise<puppeteer.Frame> {
    await this.page.goto(`${this.zacBaseUrl}/b/asp/Shinsei/Nippou`);
    await this.page.waitForSelector('#classic_window');
    logger.info('nippou opened');
    const frames = this.page.frames();
    const window = frames.find((frame) => {
      logger.info(frame.name());
      return frame.name() === 'classic_window';
    });
    if (window === undefined) {
      logger.info('classic window not found');
      throw new Error('classic window not found');
    }

    await window.waitForSelector('input[name="year_schedule"]');
    const yearInput = await window.$('input[name="year_schedule"]');
    await yearInput.click({ clickCount: 3 });
    await yearInput.type(workDate.getFullYear().toString());

    await window.waitForXPath('//select[@name=\'month_schedule\']');
    await window.select('select[name="month_schedule"]', (workDate.getMonth() + 1).toString());
    logger.info('month selected');

    await window.waitForNavigation({ timeout: 6000, waitUntil: 'domcontentloaded' });
    logger.debug(`day opened day: ${workDate.getDate().toString()}`);

    const messages = await window.$$('a.link_cell');
    logger.debug(`messages count: ${messages.length}`);

    const daysEl = await Promise.all(messages.map(async (message) => message.getProperty('textContent')
      .then(async (res) => (await res.jsonValue() as string).trim())))
      .then((bits) => messages.filter((_, i) => {
        const days = bits[i] as string;
        const wd = workDate.getDate();
        const reg = new RegExp(`^${wd}$|^${wd}[ |\n]`).test(days);
        logger.debug(`zac date list ${days}: ${reg}`);
        return reg;
      }));
    await daysEl[0].click();

    await window.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded' });
    logger.info('day selected');
    return window;
  }

  async selectWorkDate(window: puppeteer.Frame, params: ZacRegisterParams) {
    const {
      workStartHour, workStartMinute, workEndHour, workEndMinute, workBreakHour, workBreakMinute,
    } = params;
    await window.select('select[name="time_in_hour"]', workStartHour.toString());
    await window.select('select[name="time_in_minute"]', workStartMinute.toString());
    logger.info('time_in selected');

    await window.select('select[name="time_out_hour"]', workEndHour.toString());
    await window.select('select[name="time_out_minute"]', workEndMinute.toString());
    logger.info('time_out selected');

    await window.select('select[name="time_break_input_hour"]', workBreakHour.toString());
    await window.select('select[name="time_break_input_minute"]', workBreakMinute.toString());
    logger.info('time_break_input selected');
  }

  private async setWorkInputs(window: puppeteer.Frame, works: Work[]) {
    const maxRowCount = works.length < 5 ? 5 : Math.trunc(works.length / 5) * 5;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        await dialog.accept();
        await window.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded' });
        for (let i = 0; i < maxRowCount; i += 1) {
          const rowNum = i + 1;
          try {
            if (i < works.length) {
              await this.setWorkInput(window, works[i], rowNum);
            } else {
              await this.clearWorkInput(window, rowNum);
            }
          } catch (err) {
            reject(err);
          }
        }
        resolve();
      });
      await window.select('select[name="display_count"]', maxRowCount.toString());
    });
  }

  private async clearWorkInput(window: puppeteer.Frame, rowNum: number) {
    await window.waitForSelector(`select[name="time_required_hour${rowNum}"]`);
    await window.waitForSelector(`select[name="time_required_minute${rowNum}"]`);

    await window.select(`select[name="time_required_hour${rowNum}"]`, String(0));
    await window.select(`select[name="time_required_minute${rowNum}"]`, String(0));

    logger.info(`select[name="id_sagyou_naiyou${rowNum}"] clear`);
  }

  private async setWorkInput(window: puppeteer.Frame, work: Work, rowNum: number) {
    const {
      code, hour, minute, text,
    } = work;
    logger.info('order code execute', code, 'rowNumber', rowNum);

    const workCode = getWorkDiv(code);
    await window.waitForSelector(`select[name="id_sagyou_naiyou${rowNum}"]`);

    await window.select(`select[name="id_sagyou_naiyou${rowNum}"]`, workCode);
    logger.debug(`id_sagyou_naiyou${rowNum} selected: ${code}`);

    if (workCode === '1') {
      await window.type(`input[name="code_project${rowNum}"]`, code);
      await window.type(`input[name="code_project${rowNum}"]`, String.fromCharCode(13));
      logger.info(`code_project${rowNum} typed`);
    }

    await window.select(`select[name="time_required_hour${rowNum}"]`, hour.toString());
    await window.select(`select[name="time_required_minute${rowNum}"]`, minute.toString());
    logger.debug(`time_required hour ${hour.toString()} minute ${minute.toString()}`);
    logger.info('time_required selected');

    if (text !== undefined) {
      const textArea = await window.$(`textarea[name="memo${rowNum}"]`);
      await textArea.click({ clickCount: 3 });
      await textArea.type(text);
      logger.info('memo typed');
    }
  }

  private async clickRegisterBtn(window: puppeteer.Frame, workDate: Date) {
    let isOpenDialog: boolean = false;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        isOpenDialog = true;
        logger.debug(dialog);
        const message = dialog.message();
        logger.info(`dialog message: ${message}`);
        if (message) return reject(message);
        await dialog.accept();
        await window.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded' });
        return resolve();
      });
      await window.click('#button7');
      logger.info('button7 clicked');
      process.nextTick(() => {
        if (!isOpenDialog) {
          logger.info(`work register success workDate=${workDate}`);
          resolve();
        }
      });
    });
  }
}

function getWorkDiv(code: string) {
  const work = workList.find((w) => w.code === code);
  return work === undefined ? WorkDiv.normalWork : work.workDiv;
}
