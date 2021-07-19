import { getAjv } from '@syuji6051/zac-job-library';
import register from './schema/register.json';

const ajv = getAjv({ removeAdditional: true });
const registerValidation = ajv.compile(register);

export {
  // eslint-disable-next-line import/prefer-default-export
  registerValidation,
};
