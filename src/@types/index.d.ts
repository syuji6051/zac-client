import * as puppeteer from 'puppeteer';

export type work = [

]

export class ZacClient {
  constructor(Page: puppeteer.Page, userId: String, password: String);
  login(): Promise<void>;
  nippou(month: number, day: number, works: work[]): Promise<void>;
}

