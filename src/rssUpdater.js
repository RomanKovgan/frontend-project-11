import axios from 'axios';
import { uniqueId } from 'lodash';
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
      const newPosts = posts.reduce((acc, item) => {
        const newLink = item.link;
        const link = state.data.posts.find((el) => (el.link === newLink));
        if (!link) {
          acc.push(item);
        }
        return acc;
      }, []);
      const postsWithId = newPosts.map((post) => {
        const id = uniqueId();
        post.id = id;
        return post;
      });
      state.data.posts.push(...postsWithId);
    });

  promise.finally(setTimeout(() => updatePosts(url, state), 5000));
};

export default updatePosts;
