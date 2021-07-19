import { getAjv } from '@syuji6051/zac-job-library';
import login from './schema/login.json';

const ajv = getAjv({ removeAdditional: true });
const loginValidation = ajv.compile(login);

export {
  // eslint-disable-next-line import/prefer-default-export
  loginValidation,
};
