import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import parser from './parser.js';
import updatePosts from './rssUpdater.js';
import { render, renderModal } from './view.js';
import ru from './locales/ru.js';
import validationSetLocale from './locales/validationSetLocale.js';

export default () => {
  const elements = {
    formRss: document.querySelector('.rss-form'),
    inputUrl: document.querySelector('#url-input'),
    submitForm: document.querySelector('.btn'),
    feedbackUrl: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    addUrlButton: document.querySelector('[aria-label="add"]'),
    viewButtons: document.querySelectorAll('.btn-sm'),
    postsListener: document.querySelector('.container-xxl'),
  };

  const initialState = {
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
  };

  const i18n = i18next.createInstance();

  i18n.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then(() => validationSetLocale());

  const state = onChange(initialState, render(elements, initialState, i18n));

  const schema = (value) => yup.string().url().notOneOf(value);

  const updateStateData = (response) => {
    const data = parser(response);
    const { feeds, posts } = data;
    const postsWithId = posts.map((post) => {
      const id = uniqueId();
      post.id = id;
      return post;
    });
    state.data.feeds.unshift(feeds);
    state.data.posts.unshift(...postsWithId);
  };

  const addData = () => {
    state.form.processState = 'sending';
    const pormise = axios(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.url)}&disableCache=true`);
    pormise.then((response) => {
      state.usedUrls.push(state.url);
      state.form.feedback = 'success';
      state.form.processState = 'send';
      updateStateData(response.data.contents);
      state.form.processState = 'waiting';
      updatePosts(state.url, state);
    }).catch((e) => {
      state.form.processState = 'failed';
      switch (e.name) {
        case 'AxiosError':
          state.form.errors = 'networkError';
          break;
        case 'Error':
          state.form.errors = 'parserError';
          break;
        default:
      }
    });
  };

  elements.formRss.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    state.url = formData.get('url');
    state.form.valid = 'valid';
    schema(state.usedUrls).validate(state.url)
      .then(() => {
        state.form.feedback = null;
        state.form.errors = null;
        addData();
      })
      .catch((e) => {
        state.form.processState = 'failed';
        switch (e.name) {
          case 'ValidationError': {
            state.form.valid = 'invalid';
            const err = e.errors.map((error) => error.key);
            state.form.errors = err;
            break;
          }
          default:
        }
      });
  });

  elements.postsListener.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId) { return; }
    state.uiState.modal = postId;
    state.uiState.readedPostsId.add(postId);
    const data = state.data.posts.find((el) => el.id === postId);
    renderModal(data);
  });
};
