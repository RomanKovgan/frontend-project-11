import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import parser from './parser.js';
import {
  renderFeeds, renderPosts, renderModal, renderUsedLinks,
} from './view.js';

const elements = {
  formRss: document.querySelector('.rss-form'),
  inputUrl: document.querySelector('#url-input'),
  submitForm: document.querySelector('.btn'),
  feedbackUrl: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  viewButtons: document.querySelectorAll('.btn-sm'),
};

const renderErrors = (elementsError, error, prevError) => {
  if (!error && !prevError) {
    return;
  }

  if (!error && prevError) {
    elementsError.inputUrl.classList.remove('is-invalid');
    elementsError.feedbackUrl.classList.remove('text-danger');
    elementsError.feedbackUrl.textContent = '';
    return;
  }

  if (error && !prevError) {
    elementsError.inputUrl.classList.add('is-invalid');
    elementsError.feedbackUrl.classList.add('text-danger');
    elementsError.feedbackUrl.textContent = error;
    return;
  }

  elementsError.feedbackUrl.textContent = error;
};

const updatePosts = (href) => {
  axios({
    method: 'get',
    url: 'https://allorigins.hexlet.app/raw',
    params: {
      url: href,
      disableCash: true,
    },
  })
    .then((response) => {
      const data = parser(response.data);
      const { posts } = data;
      const newPosts = posts.reduce((acc, item) => {
        const newLink = item.link;
        const link = state.data.posts.find((el) => (el.link === newLink));
        if (!link) {
          acc.push(item);
        }
        return acc;
      }, []);
      state.data.posts.push(...newPosts);
    }).then(setTimeout(() => updatePosts(href), 5000));
};

const updateData = (urls) => {
  urls.forEach((url) => updatePosts(url));
};

const render = () => (path, value, prevValue) => {
  switch (path) {
  //  case 'form.valid':
  //    renderList();
  //    break;
    case 'data.feeds':
      renderFeeds(elements.feedsContainer, state.data.feeds);
      updateData(state.usedUrls);
      break;
    case 'data.posts':
      renderPosts(elements.postsContainer, state.data.posts);

      break;
    case 'uiState.readedPostsId':
      renderUsedLinks(state.uiState.readedPostsId);
      break;
    case 'form.errors':
      renderErrors(elements, value, prevValue);
      break;
    default:
      // console.log(`${path}`);
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
    valid: true,
    processState: 'filling',
    processError: null,
    errors: null,
  },
}, render(elements));

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
        sucsess: 'Rss успешно загружен',
      },
    },
  },
});

const schema = (value) => yup.string().url().notOneOf(value);

elements.formRss.addEventListener('submit', (event) => {
  event.preventDefault();
  state.form.processState = 'sending';
  schema(state.usedUrls).validate(state.url).then(() => {
    state.form.errors = null;
    state.form.valid = true;
    state.form.processState = 'send';
    state.usedUrls.push(state.url);
  }).then(() => axios({
    method: 'get',
    url: 'https://allorigins.hexlet.app/raw',
    params: {
      url: state.url,
      disableCash: true,
    },
  })
    .then((response) => {
      const data = parser(response.data);
      const { feeds, posts } = data;

      state.data.feeds.unshift(feeds);
      state.data.posts.unshift(...posts);
    }))
    .catch((e) => {
      const err = e.errors.map((error) => error.key);
      state.form.errors = i18n.t(err);
      state.form.valid = false;
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
