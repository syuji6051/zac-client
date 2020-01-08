import * as puppeteer from 'puppeteer-core';

export type Work = {
  hour: number;
  minute: number;
  code: string;
  text?: string;
}

export class ZacClient {
  constructor(Page: puppeteer.Page, userId: String, password: String);
  login(): Promise<void>;
  nippou(year: number, month: number, day: number, works: Work[]): Promise<void>;
}

