import { setLocale } from 'yup';

export default () => setLocale({
  string: {
    url: () => ({ key: 'validateErrors.invalidUrl' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'validateErrors.usedRSS' }),
  },
});
