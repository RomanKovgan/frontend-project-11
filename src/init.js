import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import parser from './parser.js';
import updatePosts, {buildProxiedUrl} from './rssUpdater.js';
import render from './view.js';
import ru from './locales/ru.js';
import config from './locales/localeConfig.js';

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
  }).then(() => yup.setLocale(config));

  
  
  const state = onChange(initialState, render(elements, initialState, i18n));

  const schema = (value) => yup.string().url().notOneOf(value);

  const updateStateData = (response, url) => {
    const data = parser(response);
    const { feed, posts } = data;
    const postsWithId = posts.map((post) => {
      const id = uniqueId();
      post.id = id;
      return post;
    });
    const feedWithUrl = { ...feed, url };
    state.data.feeds.unshift(feedWithUrl);
    state.data.posts.unshift(...postsWithId);
  };

  const addData = () => {
    state.form.processState = 'sending';
    const proxuUrl = buildProxiedUrl(state.url);
    const pormise = axios.get(proxuUrl);
    pormise.then((response) => {
      state.form.feedback = 'success';
      state.form.processState = 'send';
      updateStateData(response.data.contents, state.url);
      state.form.processState = 'waiting';
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

  updatePosts(initialState.data.feeds, state);

  elements.formRss.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    state.url = formData.get('url');
    state.form.valid = 'valid';
    const usedUrls = state.data.feeds.map((feed) => feed.url);
    schema(usedUrls).validate(state.url)
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
  });
};
