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
    ],
  } : {
    headless: false,
  });

  console.log('call start');
  const { TENANT_ID, USER_ID, PASSWORD, CODE } = process.env;
  if (TENANT_ID === undefined || USER_ID === undefined || PASSWORD === undefined) {
    throw new TypeError('TENANT_ID');
  }
  const zac = new ZacClient(browser, TENANT_ID, USER_ID, PASSWORD, true);
  try {
    zac.register({
      workDate: dayjs('2021-07-16').toDate(),
      workStartHour: 9,
      workStartMinute: 30,
      workEndHour: 17,
      workEndMinute: 45,
      workBreakHour: 1,
      workBreakMinute: 0,
      works: [{
        code: CODE!,
        hour: 7,
        minute: 15,
      }],
    });
  } catch (err) {
    console.log(err);
    // console.log('zac登録失敗！');
  } finally {
    console.log('call end');
  }
})();
