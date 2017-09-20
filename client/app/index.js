import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import './components/bundle.scss';

import App from './components/App';
import Documents from './components/home/Documents';
import Paragraphs from './components/home/Paragraphs';
import AppendParagraphs from './components/home/AppendParagraphs';
import ImportParagraphs from './components/home/ImportParagraphs';
import EditParagraph from './components/home/EditParagraph';
import About from './components/about/About';

import reducers from './reducers';

const createStoreWithMiddleware = applyMiddleware()(createStore);
const store = createStoreWithMiddleware(reducers);

ReactDOM.render(
  <Provider store={store}>
    <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Documents} />;
        <Route path="/paragraphs" component={Paragraphs} />
        <Route path="/paragraphs/append" component={AppendParagraphs} />
        <Route path="/paragraphs/import" component={ImportParagraphs} />
        <Route path="/paragraphs/:id/edit" component={EditParagraph} />
        <Route path="/about" component={About} />
      </Route>
    </Router>
  </Provider>
  , document.getElementById('react-root'));
