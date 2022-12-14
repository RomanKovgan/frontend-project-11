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

    const postHref = document.createElement('a');
    postHref.setAttribute('href', post.href);
    postHref.textContent = post.title;
    itemPost.append(postHref);
    listGroup.append(itemPost);
  });

  divCardBody.append(listGroup);
  divCardBorder.append(divCardBody);
  container.append(divCardBorder);
};

export { renderFeeds, renderPosts };
