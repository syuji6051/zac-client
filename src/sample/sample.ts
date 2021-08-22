/* eslint-disable import/no-extraneous-dependencies */
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import dayjs from 'dayjs';
import { ZacClient } from '../zac-client';

dotenv.config();
console.log(puppeteer);

const IS_DOCKER = process.env.IS_DOCKER === 'true';

(async () => {
  console.log(IS_DOCKER);
  const browser = await puppeteer.launch(IS_DOCKER ? {
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox'
    ],
  } : {
    headless: false,
  });

  console.log('call start');
  const { TENANT_ID, USER_ID, PASSWORD, CODE } = process.env;
  if (TENANT_ID === undefined || USER_ID === undefined || PASSWORD === undefined) {
    throw new TypeError('TENANT_ID');
  }
  const zac = new ZacClient(browser, TENANT_ID, USER_ID, PASSWORD, true, 'zac-work-input-capture');
  try {
    zac.register({
      workDate: dayjs('2021-08-20').toDate(),
      workStartHour: 9,
      workStartMinute: 45,
      workEndHour: 18,
      workEndMinute: 0,
      workBreakHour: 0,
      workBreakMinute: 45,
      works: [{
        code: CODE!,
        hour: 7,
        minute: 30,
      }],
    });
  } catch (err) {
    console.log(err);
    // console.log('zac登録失敗！');
  } finally {
    console.log('call end');
  }
})();
