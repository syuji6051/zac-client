/* eslint-disable import/no-extraneous-dependencies */
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import dayjs from 'dayjs';
import { ZacClient } from '../zac-client';

dotenv.config();
console.log(puppeteer);

const { TENANT_ID, USER_ID, PASSWORD, CODE, IS_DOCKER = true } = process.env;

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
  if (TENANT_ID === undefined || USER_ID === undefined || PASSWORD === undefined) {
    throw new TypeError('TENANT_ID');
  }
  const zac = new ZacClient(browser, {
    zacTenantId: TENANT_ID,
    zacLoginId: USER_ID,
    zacPassword: PASSWORD, 
  }, true, 'zac-work-input-capture');

  try {
    zac.register({
      workDate: dayjs('2023-01-27').toDate(),
      workStartHour: 9,
      workStartMinute: '30',
      workEndHour: 18,
      workEndMinute: '0',
      workBreakHour: 1,
      workBreakMinute: '0',
      works: [{
        code: CODE!,
        hour: 7,
        minute: '30',
      }],
    });
  } catch (err) {
    console.log(err);
    // console.log('zac登録失敗！');
  } finally {
    console.log('call end');
  }
})();
