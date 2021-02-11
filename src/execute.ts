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
  const { TENANT_ID, USER_ID, PASSWORD } = process.env;
  const zac = new ZacClient(
    browser, TENANT_ID, USER_ID, PASSWORD, true,
  );
  try {
    await zac.register({
      workDate: new Date('2021/02/10'),
      workStartHour: 9,
      workStartMinute: 15,
      workEndHour: 16,
      workEndMinute: 45,
      workBreakHour: 0,
      workBreakMinute: 45,
      works: [{
        code: '0503707',
        hour: 6,
        minute: 45,
      }],
    });
  } catch (err) {
    console.log(err);
    console.log('zac登録失敗！');
  } finally {
    // await browser.close();
  }
})();
