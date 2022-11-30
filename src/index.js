import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';






const render = (elements) => (path, value, prevValue) => {
  switch (path) {
  //  case 'form.valid':
  //    renderList();
  //    break;
    case 'form.errors':
      renderErrors(elements, value, prevValue);
      break;
    default:
      //console.log(`${path}`);
  }
};

const elements = {
  formRss: document.querySelector('.rss-form'),
  inputUrl: document.querySelector('#url-input'),
  submitForm: document.querySelector('.btn'),
  feedbackUrl: document.querySelector('.feedback'),
};

const renderErrors = (elements, error, prevError) => {
  if (!error && !prevError) {
    return;
  }

  if (!error && prevError) {
    elements.inputUrl.classList.remove('is-invalid');
    elements.feedbackUrl.classList.remove('text-danger');
    elements.feedbackUrl.textContent = '';
    return;
  }

  if (error && !prevError) {
    elements.inputUrl.classList.add('is-invalid');
    elements.feedbackUrl.classList.add('text-danger');
    elements.feedbackUrl.textContent = error;
    return;
  }

  elements.feedbackUrl.textContent = error;
  return;
  
};
yup.setLocale({
  string: {
    url: ({ url }) => ({ key:'invalidUrl' }), 
  },
  mixed: {
    notOneOf: ({ notOneOf }) => ({key: 'usedRSS'})
  }
})
const i18n = i18next.createInstance();
i18n.init({
  lng: 'ru',
  debug: false,
  resources: {
   ru: {
     translation: {
       invalidUrl: 'Ссылка должна быть валидным URL',
       usedRSS: 'RSS уже существует',
       sucsess: 'Rss успешно загружен',
     }
   }
  },
});



const state = onChange({
  usedUrls: [],
  url: '',
  form: {
    valid: true,
    processState: 'filling',
    processError: null,
    errors: null,
  },
}, render(elements));

const schema = (value) => yup.string().url().notOneOf(value);

elements.formRss.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  schema(state.usedUrls).validate(state.url).then(
    //@todo fetch(rss)
    () => {
      state.form.errors = null;
      state.form.valid = true;
      state.form.processState = 'send';
      state.usedUrls.push(state.url);
    }
  )
  .catch((e) => {
    const err = e.errors.map((err) => err.key)
    state.form.errors = i18n.t(err);
    console.log(state.form.errors);
    state.form.valid = false;
  });

});

elements.inputUrl.addEventListener('input', (e) => {
  const { value } = e.target;
  state.url = value;
  
});

