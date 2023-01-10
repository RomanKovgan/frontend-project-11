import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import parser from './parser.js';
import updatePosts from './rssUpdater.js';
import {
  renderFeeds,
  renderPosts,
  renderModal,
  renderUsedLinks,
  renderFeedback,
  renderInputValidation,
  handlerProcessState,
} from './view.js';

const elements = {
  formRss: document.querySelector('.rss-form'),
  inputUrl: document.querySelector('#url-input'),
  submitForm: document.querySelector('.btn'),
  feedbackUrl: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  addUrlButton: document.querySelector('[aria-label="add"]'),
  viewButtons: document.querySelectorAll('.btn-sm'),
};

export default () => {
  const renderErrors = (elementsError, error, prevError) => {
    if (!error && !prevError) {
      return;
    }

    if (!error && prevError) {
      elementsError.feedbackUrl.classList.remove('text-danger');
      elementsError.feedbackUrl.textContent = '';
      return;
    }

    if (error && !prevError) {
      elementsError.feedbackUrl.classList.add('text-danger');
      elementsError.feedbackUrl.textContent = error;
      return;
    }

    elementsError.feedbackUrl.textContent = error;
  };

  const render = () => (path, value, prevValue) => {
    switch (path) {
    //  case 'form.valid':
    //    renderList();
    //    break;
      case 'form.feedback':
        renderFeedback(elements.feedbackUrl, value);
        break;
      case 'data.feeds':
        renderFeeds(elements.feedsContainer, value);
        break;
      case 'data.posts':
        renderPosts(elements.postsContainer, value);
        break;
      case 'uiState.readedPostsId':
        renderUsedLinks(value);
        break;
      case 'form.errors':
        renderErrors(elements, value, prevValue);
        break;
      case 'form.valid':
        renderInputValidation(elements.inputUrl, value);
        break;
      case 'form.processState':
        handlerProcessState(elements, value);
        break;
      default:
        // console.log(`Unknoun path: ${path}`);
        break;
    }
  };

  const state = onChange({
    usedUrls: [],
    url: '',
    data: {
      feeds: [],
      posts: [],
    },
    uiState: {
      modal: null,
      readedPostsId: new Set(),
    },
    form: {
      valid: 'valid',
      processState: 'filling',
      feedback: null,
      errors: null,
    },
  }, render());

  yup.setLocale({
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'usedRSS' }),
    },
  });

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          invalidUrl: 'Ссылка должна быть валидным URL',
          usedRSS: 'RSS уже существует',
          success: 'Rss успешно загружен',
          networkError: 'Ошибка сети',
          parserError: 'Ресурс не содержит валидный RSS',
        },
      },
    },
  });

  const schema = (value) => yup.string().url().notOneOf(value);

  elements.formRss.addEventListener('submit', (event) => {
    event.preventDefault();
    state.form.valid = 'valid';
    schema(state.usedUrls).validate(state.url).then(() => {
      state.form.feedback = null;
      state.form.errors = null;
      state.form.processState = 'sending';
      // to do: save data with axios
    }).then(() => (axios(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.url)}&disableCache=true`)))
      // .then(() => axios({
      //   method: 'get',
      //   url: 'https://allorigins.hexlet.app/raw',
      //   params: {
      //     url: state.url,
      //     disableCache: true,
      //   },
      // })
      .then((response) => {
        state.usedUrls.push(state.url);
        state.form.feedback = i18n.t('success');
        const data = parser(response.data.contents);
        const { feeds, posts } = data;
        state.form.processState = 'send';
        state.data.feeds.unshift(feeds);
        state.data.posts.unshift(...posts);
      })
      .then(() => {
        state.form.processState = 'waiting';
        updatePosts(state.url, state);
      })
      .catch((e) => {
        console.log(e);
        state.form.processState = 'failed';
        switch (e.name) {
          case 'ValidationError': {
            state.form.valid = 'invalid';
            const err = e.errors.map((error) => error.key);
            state.form.errors = i18n.t(err);
            break;
          }
          case 'AxiosError':
            state.form.errors = i18n.t('networkError');
            break;
          case 'Error':
            state.form.errors = i18n.t('parserError');
            break;
          default:
        }
      });
  });

  elements.inputUrl.addEventListener('input', (ev) => {
    const { value } = ev.target;
    state.url = value;
  });

  const buttons = document.querySelector('.container-xxl');

  buttons.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) { return; }
    if (!buttons.contains(button)) { return; }
    const postId = button.getAttribute('data-id');
    state.uiState.modal = postId;
    state.uiState.readedPostsId.add(postId);
    const data = state.data.posts.find((el) => el.id === postId);
    renderModal(button, data);
  });

  const links = document.querySelector('.container-xxl');
  links.addEventListener('click', (e) => {
    e.stopPropagation();
    const link = e.target.closest('li');
    if (!link) { return; }
    if (!links.contains(link)) { return; }
    const postID = link.id;
    state.uiState.readedPostsId.add(postID);
  });
};
