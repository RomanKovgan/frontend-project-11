import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';


let schema = yup.object().shape({
  url: yup.string().url().required(),
});

const render = (elements) => (path, value, prevValue) => {
  switch (path) {
  //  case 'form.valid':
  //    renderList();
  //    break;
    case 'form.errors':
      renderErrors(elements, value, prevValue);
      break;
    default:
      console.log(`${path}`);
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

const state = onChange({
  url: '',
  form: {
    valid: true,
    processState: 'filling',
    processError: null,
    errors: null,
  },
}, render(elements));



elements.formRss.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  schema.validate( {url: state.url}).then(
    //@todo fetch(rss)
    () => {
      state.form.errors = null;
      state.form.valid = true;
      state.form.processState = 'send';
    }
  )
  .catch((e) => {
    state.form.errors = e.message;
    state.form.valid = false;
  });

});

elements.inputUrl.addEventListener('input', (e) => {
  const { value } = e.target;
  state.url = value;
});

