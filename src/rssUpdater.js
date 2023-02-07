import axios from 'axios';
import { uniqueId, differenceWith, isEqual } from 'lodash';
import parser from './parser.js';

const updateTime = 5000;

export const buildProxiedUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const proxyURL = new URL(`${proxy}/get?url=${encodeURIComponent(url)}`);
  proxyURL.searchParams.append('disableCache', 'true');
  return proxyURL.href;
};

const updatePosts = (feeds, state) => {
  if (feeds.length === 0) {
    setTimeout(() => updatePosts(feeds, state), updateTime);
    return;
  }

  const promises = feeds.map(({ url }) => axios.get(buildProxiedUrl(url))
    .then((response) => {
      const data = parser(response.data.contents);
      const { posts } = data;

      const viewedPosts = state.data.posts.map((post) => {
        const { title, link, description } = post;
        return { title, link, description };
      });

      const newPosts = differenceWith(posts, viewedPosts, isEqual);
      const postsWithId = newPosts.map((post) => {
        const id = uniqueId();
        post.id = id;
        return post;
      });

      state.data.posts.push(...postsWithId);
    }).catch((e) => {
      console.error(e.message);
    }));
  Promise.all(promises).finally(setTimeout(() => updatePosts(feeds, state), updateTime));
};

export default updatePosts;
