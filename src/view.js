const renderFeeds = (container, feeds, i18n) => {
  container.innerHTML = '';

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('headlines.feeds');

  divCardBody.append(cardTitle);
  divCardBorder.append(divCardBody);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
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
  });

  divCardBody.append(listGroup);
  container.append(divCardBorder);
};

const renderPosts = (container, posts, uiPosts, i18n) => {
  container.innerHTML = '';

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('headlines.posts');
  divCardBody.append(cardTitle);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const itemPost = document.createElement('li');
    itemPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    itemPost.setAttribute('id', post.id);
    const postHref = document.createElement('a');
    postHref.classList.add('fw-bold');
    postHref.setAttribute('href', post.link);
    postHref.setAttribute('target', '_blank');
    postHref.setAttribute('data-id', post.id);
    postHref.setAttribute('rel', 'noopener noreferrer');
    postHref.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = 'Просмотр';
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-id', post.id);

    itemPost.append(postHref, button);
    listGroup.append(itemPost);
  });

  divCardBody.append(listGroup);
  divCardBorder.append(divCardBody);
  container.append(divCardBorder);
  uiPosts.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    if (!post) return;
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (value, state) => {
  const data = state.data.posts.find((el) => el.id === value);
  const header = document.querySelector('.modal-title');
  const body = document.querySelector('.modal-body');
  const fullArticle = document.querySelector('.full-article');
  fullArticle.setAttribute('href', data.link);
  header.textContent = data.title;
  body.textContent = data.description;
};

const renderUsedLinks = (state) => {
  state.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    if (!post) return;
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderFeedback = (container, feedback, i18n) => {
  container.textContent = i18n.t(feedback);
  container.classList.remove('text-danger');
  container.classList.add('text-success');
};

const renderInputValidation = (container, state) => {
  container.classList.remove('is-invalid');
  if (state === 'invalid') {
    container.classList.add('is-invalid');
  }
};

const renderErrors = (elementsError, error, prevError, i18n) => {
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
    elementsError.feedbackUrl.textContent = i18n.t(error);
    return;
  }

  elementsError.feedbackUrl.textContent = i18n.t(error);
};

const handlerProcessState = (elements, state) => {
  switch (state) {
    case 'filling':
      break;
    case 'sending':
      elements.addUrlButton.setAttribute('disabled', 'disabled');
      break;
    case 'send':
      elements.addUrlButton.removeAttribute('disabled');
      elements.inputUrl.value = '';
      elements.inputUrl.focus();
      break;
    case 'waiting':
    case 'failed':
      elements.addUrlButton.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

export default (elements, initialState, i18n) => (path, value, prevValue) => {
  switch (path) {
    case 'data.feeds':
      renderFeeds(elements.feedsContainer, value, i18n);
      break;
    case 'data.posts':
      renderPosts(elements.postsContainer, value, initialState.uiState.readedPostsId, i18n);
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
      renderFeedback(elements.feedbackUrl, value, i18n);
      break;
    case 'form.errors':
      renderErrors(elements, value, prevValue, i18n);
      break;
    case 'uiState.modal':
      renderModal(value, initialState);
      break;
    default:
      // console.log(`Unknoun path: ${path}`);
      break;
  }
};
