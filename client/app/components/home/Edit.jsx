import React, {Component} from 'react';
import API from 'books/Api.jsx';
import {post} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';

export default class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraph: null,
    }
  }

  groups(str, regex, groupToSelect = 0, preserveWhenEmpty = true) {
    let groups = [];
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      groups.push(m[groupToSelect]);
    }

    if (preserveWhenEmpty && groups.length <= 0) {
      groups.push(str);
    }

    return groups;
  }

  onChange(e) {
    const value = e.target.value;

    // const regexCode = /{code}\n*((.|\n)+)\n*{\/code}/g;
    const regexCode = /{code}([\s\S]*?){\/code}/g;
    const codes = this.groups(value, regexCode, 1, false);

    const codeReplaced = value.replace(regexCode, "CODE");
    const paragraphRaws = this.groups(codeReplaced, /(^\n|.+)/g);
    let codeIndex = 0;
    const paragraphs = paragraphRaws.map((p) => { 
      if (p === 'CODE') {
        return {type: 'CODE', code: codes[codeIndex++]};
      }
      const sentences = this.groups(p, /\S[^.]*[\.:]/g).map((s) => {return {text: s}});
      return {type: 'PLAIN', sentences: sentences};
    });

    this.setState({value: e.target.value, paragraphs: paragraphs}, () => {
      const blocks = document.querySelectorAll('pre code');
      blocks.forEach((b) => {hljs.highlightBlock(b)});
    });
  }

  onSubmit(e) {
    e.preventDefault();
    console.log(this.state.paragraphs);
    API.postParagraphs(this.state.paragraphs, () => {
      console.log('success');
    }, (error) => {
      console.log(error);
    });
  }

  paragraphMarkup(paragraph, index) {
    if (paragraph.type === 'CODE') {
      return <pre key={index}><code className="swift">{paragraph.code}</code></pre>;
    }
    else if (paragraph.type === 'PLAIN') {
      return (
        <p key={index} className="paragraph">{paragraph.sentences.map((s, si) => {
            return <span className="sentence" key={si}>{s.text}</span>;
          })}
        </p>
      );
    }
    return null;
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='edit-chapter'>
        <div className='preview'>
          {
            this.state.paragraphs ? this.state.paragraphs.map((p, i) => {
              return this.paragraphMarkup(p, i);
            }) : null
          }
        </div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <textarea value={this.state.value} onChange={this.onChange.bind(this)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}