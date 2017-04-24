import {post} from 'books/utils/Utils.jsx';

class Api {

  postParagraphs(paragraphs, success, failure) {
    const data = {
      paragraphs: paragraphs
    };

    post(`${Api.baseUrl}/paragraphs`, data)
      .then(success)
      .catch(failure);
  }

}

Api.baseUrl = 'http://localhost:8080/api';

let API = new Api();
export default API;