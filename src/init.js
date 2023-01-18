import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import parser from './parser.js';
import updatePosts from './rssUpdater.js';

import {
  renderFeeds,
  renderPosts,
  renderModal,
  renderUsedLinks,
  renderFeedback,
  renderInputValidation,
  renderErrors,
  handlerProcessState,
} from './view.js';

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

  const render = () => (path, value, prevValue) => {
    switch (path) {
      case 'data.feeds':
        renderFeeds(elements.feedsContainer, value);
        break;
      case 'data.posts':
        renderPosts(elements.postsContainer, value, initialState.uiState.readedPostsId);
        break;
      case 'uiState.readedPostsId':
        renderUsedLinks(value);
        break;
      case 'form.valid':
        renderInputValidation(elements.inputUrl, value);
        break;
      case 'form.processState':
        handlerProcessState(elements, value);
        break;
      case 'form.feedback':
        renderFeedback(elements.feedbackUrl, value);
        break;
      case 'form.errors':
        renderErrors(elements, value, prevValue);
        break;
      default:
        // console.log(`Unknoun path: ${path}`);
        break;
    }
  };

  const state = onChange(initialState, render());

  const schema = (value) => yup.string().url().notOneOf(value);

  // const request = () => axios(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.url)}&disableCache=true`);

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
    const pormise = axios(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.url)}&disableCache=true`);
    pormise.then((response) => {
      state.usedUrls.push(state.url);
      state.form.feedback = 'success';
      state.form.processState = 'send';
      updateStateData(response.data.contents);
    }).then(() => {
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
    state.form.valid = 'valid';
    schema(state.usedUrls).validate(state.url)
      .then(() => {
        state.form.feedback = null;
        state.form.errors = null;
        state.form.processState = 'sending';
      })
      .then(() => addData())
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
    // addData();
  });

  elements.inputUrl.addEventListener('input', (ev) => {
    const { value } = ev.target;
    state.url = value;
  });

  const buttons = document.querySelector('.container-xxl');

  buttons.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId) { return; }
    state.uiState.modal = postId;
    state.uiState.readedPostsId.add(postId);
    const data = state.data.posts.find((el) => el.id === postId);
    renderModal(data);
  });

  const links = document.querySelector('.container-xxl');
  links.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId) { return; }
    state.uiState.readedPostsId.add(postId);
  });
};
