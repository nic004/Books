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


const offset = function (el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

const checkInViewport = function (elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

const replaceURLWithHTMLLinks = function (text, format) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp, format);
}

function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}

function getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        rangeNodes.push( node = nextNode(node) );
    }

    // console.log("1st path visited");
    // console.log(rangeNodes);

    // console.log("commonAncestor => ");
    // console.log(range.commonAncestorContainer);

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
    }

    return rangeNodes;
}

function getSelectedNodes() {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (!sel.isCollapsed) {
            return getRangeSelectedNodes(sel.getRangeAt(0));
        }
    }
    return [];
}

export { wfetch as fetch, head, post, put, del, isBlankString, offset, checkInViewport, replaceURLWithHTMLLinks, getSelectedNodes };