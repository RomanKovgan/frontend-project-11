import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';





const render = (elements) => (path, value, prevValue) => {
  switch (path) {
  //  case 'form.valid':
  //    renderList();
  //    break;
    case 'data.feeds':
      renderFeeds(elements, state);
      break;
    case 'data.posts': 
      renderPosts(elements,state);
      break;
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
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
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

const renderFeeds = (elements, state) => {
  elements.feedsContainer.innerHTML = '';
  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Фиды';

  divCardBody.append(cardTitle);
  divCardBorder.append(divCardBody);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('lsit-group', 'border-0', 'rounded-0');
  console.log(state.data.feeds);
  state.data.feeds.forEach((feed) => {
    const itemFeed = document.createElement('li');
    itemFeed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    itemFeed.append(feedTitle, feedDescription);
    listGroup.append(itemFeed);
    console.log(itemFeed);
  });
  divCardBody.append(listGroup);
  elements.feedsContainer.append(divCardBorder)

}

const renderPosts = (elements, state) => {
  elements.postsContainer.innerHTML = '';
  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Посты';
  divCardBody.append(cardTitle);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  state.data.posts.forEach((post) => {
    const itemPost =  document.createElement('li');
    itemPost.classList
    .add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    
    const postHref = document.createElement('a');
    postHref.setAttribute('href', post.href);
    postHref.textContent = post.title;
    itemPost.append(postHref);
    listGroup.append(itemPost);
  });

  divCardBody.append(listGroup);
  divCardBorder.append(divCardBody);
  const postsContainer = elements.postsContainer;
  postsContainer.append(divCardBorder);
}

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
  data: {
    feeds: [],
    posts: []
  },
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
    state.form.valid = false;
  });
  axios({
    method: 'get',
    url: 'https://allorigins.hexlet.app/raw',
    params: {
      url: state.url, 
      disableCash: true,
    }
  }) 
    .then(response => {
      const parser = new DOMParser();
      const htmlString = parser.parseFromString(response.data,"application/xml");
      const xml = htmlString.documentElement;
      const fidTitle = htmlString.documentElement.querySelector('channel').querySelector('title');
      const fidDescription = htmlString.querySelector('channel').querySelector('description');
      const posts = htmlString.querySelectorAll('item');
      const titlePosts = Array.from(posts).map((post) => {
        const titlePost = post.querySelector('title').innerHTML;
        const hrefPost = post.querySelector('link').innerHTML;
        return {title: titlePost, href: hrefPost};
      });
      
      state.data.feeds.unshift({ title: fidTitle.textContent, description: fidDescription.textContent });
      state.data.posts.unshift(...titlePosts);
    });
});

elements.inputUrl.addEventListener('input', (e) => {
  const { value } = e.target;
  state.url = value;
  
});

