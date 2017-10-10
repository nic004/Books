import {get, post, put, del} from 'books/utils/Utils.jsx';

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

  postParagraphsInsert(documentId, position, rank, success, failure) {
    const data = {DocumentId: documentId, position: position, rank: rank};
    post(`${Api.baseUrl}/paragraphs/insert`, data)
      .then(success)
      .catch(failure);
  }

  putParagraph(paragraph, success, failure) {
    const data = {
      paragraph: paragraph
    };

    put(`${Api.baseUrl}/paragraphs`, data)
      .then(success)
      .catch(failure);
  }

  getParagraphs(documentId, success, failure) {
    fetch(`${Api.baseUrl}/paragraphs?documentId=${documentId}`)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

  getCaptures(success, failure) {
    fetch(`${Api.baseUrl}/paragraphs/captures`)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

  getParagraph(paragraphId, success, failure) {
    fetch(`${Api.baseUrl}/paragraphs/${paragraphId}`)
      .then((response) => response.json())
      .then(success)
      .catch(failure);
  }

  deleteParagraph(paragraphId, success, failure) {
    del(`${Api.baseUrl}/paragraphs/${paragraphId}`)
      .then(success)
      .catch(failure)
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

  postSelection(selections, success, failure) {
    const data = {
      selections: selections
    };

    post(`${Api.baseUrl}/selections`, data)
      .then(success)
      .catch(failure);
  }

}

Api.baseUrl = 'http://localhost:8080/api';

let API = new Api();
export default API;