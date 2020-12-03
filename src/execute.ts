// eslint-disable-next-line import/no-extraneous-dependencies
import puppeteer from 'puppeteer';
import ZacClient from './zac-client';

const IS_DOCKER = process.env.IS_DOCKER === 'true';
console.log('start');

(async () => {
  console.log(IS_DOCKER);
  const browser = await puppeteer.launch(IS_DOCKER ? {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  } : {
    headless: false,
  });

  console.log('call start');
  const zac = new ZacClient(browser, '', '', true);
  try {
    await zac.register({
      workDate: new Date('2020/12/01'),
      workStartHour: 9,
      workStartMinute: 30,
      workEndHour: 18,
      workEndMinute: 0,
      workBreakHour: 1,
      workBreakMinute: 0,
      works: [{
        code: '999998',
        hour: 7,
        minute: 30,
      }],
    });
  } catch (err) {
    console.log(err);
    console.log('zac登録失敗！');
  } finally {
    await browser.close();
  }
})();
