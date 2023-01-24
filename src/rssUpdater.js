import axios from 'axios';
import { uniqueId, differenceWith, isEqual } from 'lodash';
import parser from './parser.js';

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
      const newPosts = differenceWith(posts, state.data.posts, isEqual);
      const postsWithId = newPosts.map((post) => {
        const id = uniqueId();
        post.id = id;
        return post;
      });
      state.data.posts.push(...postsWithId);
    }).catch((e) => {
      console.error(e.message);
    });

  promise.finally(setTimeout(() => updatePosts(url, state), 5000));
};

export default updatePosts;
