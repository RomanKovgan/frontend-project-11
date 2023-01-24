import axios from 'axios';
import { uniqueId, differenceWith, isEqual } from 'lodash';
import parser from './parser.js';

const updateTime = 5000;

const updatePosts = (url, state) => {
  const promise = axios({
    method: 'get',
    url: 'https://allorigins.hexlet.app/raw',
    params: {
      url,
      disableCache: true,
    },
  })
    .then((response) => {
      const data = parser(response.data);
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
    });

  promise.finally(setTimeout(() => updatePosts(url, state), updateTime));
};

export default updatePosts;
