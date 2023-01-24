const extractFeed = (domEl) => {
  const titleEl = domEl.querySelector('channel > title');
  const title = titleEl.textContent;

  const descriptionEl = domEl.querySelector('channel > description');
  const description = descriptionEl.textContent;

  return { title, description };
};

const extractPosts = (domEl) => {
  const postElements = domEl.querySelectorAll('item');
  const posts = Array.from(postElements).map((postElement) => {
    const titleEl = postElement.querySelector('title');
    const title = titleEl.textContent;

    const linkEl = postElement.querySelector('link');
    const link = linkEl.textContent;

    const descriptionEl = postElement.querySelector('description');
    const description = descriptionEl.textContent;

    return { title, link, description };
  });

  return posts;
};

export default (content) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, 'application/xml');
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('ParserError');
  }

  const feed = extractFeed(xmlDoc);
  const posts = extractPosts(xmlDoc);

  return { feed, posts };
};
