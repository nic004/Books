import {post} from 'books/utils/Utils.jsx';

class Api {

  postParagraphs(content, success, failure) {
    const data = {
      content: content
    };

    post(`${Api.baseUrl}/paragraphs`, data)
      .then(success)
      .catch(failure);
  }

}

Api.baseUrl = 'http://localhost:8080/api';

let API = new Api();
export default API;