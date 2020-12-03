import * as puppeteer from 'puppeteer-core';

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
  constructor(browser: puppeteer.Browser, userId: string, password: string, debug?: boolean);
  register(param: ZacRegisterParams): void;
}
