import React, {Component} from 'react';
import API from 'books/Api.jsx';
import {post} from 'books/utils/Utils.jsx';

export default class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  splitSentence() {
    const regex = /\S[^.]*[\.:]/g;
    const str = this.state.value;
    let sentences = [];

    let m;
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      sentences.push(m[0]);
    }
    // console.log(sentences);
  }

  onChange(e) {
    this.setState({value: e.target.value}, () => {
      this.splitSentence();
    });
  }

  onSubmit(e) {
    e.preventDefault();
    API.postParagraphs(this.state.value, () => {
      console.log('success');
    }, (error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <div className='edit-chapter'>
        <form onSubmit={this.onSubmit.bind(this)}>
          <textarea value={this.state.value} onChange={this.onChange.bind(this)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}