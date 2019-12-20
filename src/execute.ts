import * as puppeteer from 'puppeteer';
import zacClient from './zac-client';

const works = [{
  code: '0402824',
  text: 'リリース作業 打合せ',
  hour: 6,
  minute: 30
}, {
  code: '999998',
  text: 'チームミーティング',
  hour: 1,
  minute: 0
}];

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  console.log('call start');
  const page = await browser.newPage();
  const zac = new zacClient(page, '0070', 'Syuji6051');
  try {
    await zac.login();
    await zac.nippou(12, 19, works);
  } catch (err) {
    console.log(err);
    console.log('zac登録失敗！');
  } finally {
    // await page.close();
  }
})();
