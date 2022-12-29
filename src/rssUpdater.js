import axios from 'axios';
import parser from './parser.js';

const updatePosts = (url, state) => {
  axios({
    method: 'get',
    url: 'https://allorigins.hexlet.app/raw',
    params: {
      url,
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
    })
    .then(() => {
      setTimeout(() => updatePosts(url, state), 5000);
    });
};

export default updatePosts;
