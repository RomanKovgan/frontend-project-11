const renderFeeds = (container, feeds) => {
  container.innerHTML = '';
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

const renderPosts = (container, posts) => {
  container.innerHTML = '';

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
};

const renderModal = (container, state) => {
  const header = document.querySelector('.modal-title');
  const body = document.querySelector('.modal-body');
  const fullArticle = document.querySelector('.full-article');
  fullArticle.setAttribute('href', state.link);
  header.textContent = state.title;
  body.textContent = state.description;
};

const renderUsedLinks = (state) => {
  state.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    if (!post) return;
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderFeedback = (container, feedback) => {
  container.textContent = feedback;
  container.classList.remove('text-danger');
  container.classList.add('text-success');
};

const renderInputValidation = (container, state) => {
  container.classList.remove('is-invalid');
  if (state === 'invalid') {
    container.classList.add('is-invalid');
  }
};

const handlerProcessState = (elements, state) => {
  console.log(state);
  switch (state) {
    case 'filling':
      break;
    case 'sending':
      console.log(state);
      elements.addUrlButton.setAttribute('disabled', 'disabled');
      break;
    case 'send':
      elements.addUrlButton.removeAttribute('disabled');
      elements.inputUrl.value = '';
      elements.inputUrl.focus();
      // elements.formRss.reset();
      break;
    case 'waiting':
    case 'failed':
      elements.addUrlButton.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

export {
  renderFeeds,
  renderPosts,
  renderModal,
  renderUsedLinks,
  renderFeedback,
  renderInputValidation,
  handlerProcessState,
};
