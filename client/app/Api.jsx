import {get, post, put} from 'books/utils/Utils.jsx';

class Api {
  getDocuments(success, failure) {
    fetch(`${Api.baseUrl}/documents`)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

  postDocuments(title, success, failure) {
    const data = {
      title: title
    };

    post(`${Api.baseUrl}/documents`, data)
      .then(success)
      .catch(failure);
  }

  putDocuments(id, title, success, failure) {
    const data = {
      id: id,
      title: title
    };

    put(`${Api.baseUrl}/documents`, data)
      .then(success)
      .catch(failure);
  }

  postParagraphs(paragraphs, success, failure) {
    const data = {
      paragraphs: paragraphs
    };

    post(`${Api.baseUrl}/paragraphs`, data)
      .then(success)
      .catch(failure);
  }

  getParagraphs(success, failure) {
    fetch(`${Api.baseUrl}/paragraphs`)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

  postSentenceComment(id, comment, success, failure) {
    const data = {
      comment: comment 
    };

    post(`${Api.baseUrl}/sentences/${id}/comment`, data)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

}

Api.baseUrl = 'http://localhost:8080/api';

let API = new Api();
export default API;