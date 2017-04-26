import 'whatwg-fetch';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

const wfetch = function (input, init) {
  let options = init || {};
  // if (!options['credentials']) {
  //   options['credentials'] = 'same-origin';
  // }

  return fetch(input, options).then(checkStatus);
}

const head = function (input, init) {
  let options = init || {};
  options['method'] = options['method'] || 'HEAD';
  return wfetch(input, options);
}

const post = function (input, bodyJson, init) {
  let options = init || {};
  options['method'] = options['method'] || 'POST';

  let currentHeaders = options['headers'] || {};
  currentHeaders['Accept'] = 'application/json';
  currentHeaders['Content-Type'] = 'application/json';
  options['headers'] = currentHeaders;

  options['body'] = JSON.stringify(bodyJson);

  return wfetch(input, options);
}

const put = function (input, bodyJson, init) {
  let options = init || {};
  options['method'] = 'PUT';
  return post(input, bodyJson, options);
}

const del = function (input, bodyJson, init) {
  let options = init || {};
  options['method'] = 'DELETE';
  return post(input, bodyJson, options);
}

  const isBlankString = function (str) {
    return (!str || /^\s*$/.test(str));
  }

export { wfetch as fetch, head, post, put, del, isBlankString };