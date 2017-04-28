import React, {Component} from 'react';
import API from 'books/Api.jsx';
import {isBlankString} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import Sentence from './Sentence.jsx';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraphs: [],
    }
    this.keyUpHandler = this.onKeyUp.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener("keyup", this.keyUpHandler);
    API.getParagraphs((response) => {
      this.components = {paragraphs: {}};
      this.setState({paragraphs: response.paragraphs}, () => {
        this.makeTree();
        console.log(this.components);
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((b) => { hljs.highlightBlock(b) });
      });
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener("keyup", this.keyUpHandler);
  }

  addSentenceComponent(pi, si, s) {
    if (isBlankString(s.text())) {
      return;
    }

    if (!this.components.paragraphs[pi]) {
      this.components.paragraphs[pi] = {sentences: {}};
    }
    let p = this.components.paragraphs[pi];
    p.sentences[si] = s;
  } 

  makeTree() {
    let currentSentence = null;
    Object.keys(this.components.paragraphs).sort((a, b) => a - b).forEach((pk) => {
      const p = this.components.paragraphs[pk];
      Object.keys(p.sentences).sort((a, b) => a - b).forEach((sk) => {
        console.log(`${pk} - ${sk}`);
        const s = p.sentences[sk];
        if (currentSentence) {
          currentSentence.next = s;
          s.prev = currentSentence;
        } 
        currentSentence = s;
      });
    });
  }

  sentenceComponent(index) {
    return this.components.paragraphs[index[0]].sentences[index[1]];
  }

  moveFocus(e) {
    let handled = false;
    let prevFocused = null;
    if (e.key === 'h') {  
      handled = true;
      if (!this.focusedSentence || !this.focusedSentence.prev) {
        return;
      }        
      prevFocused = this.focusedSentence;
      this.focusedSentence = this.focusedSentence.prev;
    }
    else if (e.key === 'l') {
      handled = true;
      if (!this.focusedSentence) {
        this.focusedSentence = this.sentenceComponent([0, 0]);
      } else {
        if (!this.focusedSentence.next) {
          return;
        }
        prevFocused = this.focusedSentence;
        this.focusedSentence = this.focusedSentence.next;
      }
    }

    if (handled) {
      this.focusedSentence.setFocus(true);
      if (prevFocused) {
        prevFocused.setFocus(false);
      }

      console.log(this.focusedSentence);
      console.log(e);
      e.stopPropagation();
      e.preventDefault();
    }

    return handled;
  }

  onKeyUp(e) {
    if (!this.components || Object.keys(this.components.paragraphs).length <= 0) {
      return;
    }

    if (this.moveFocus(e)) {
      return;
    }

    if (e.key === 'o' && this.focusedSentence && !this.focusedSentence.isEditMode()) {
      this.focusedSentence.edit();
    }
  }

  render() {
    return (
      <div className="container home">
        <div className="content">
          {
            this.state.paragraphs.map((p, index) => {
              if (p.type === 'PLAIN') {
                if (p.Sentences) {
                  return (
                    <div className='paragraph' key={index}>
                      {p.Sentences.map((s, si) => {
                        return <Sentence key={si} sentence={s} ref={this.addSentenceComponent.bind(this, index, si)} />
                      })}
                    </div>
                  );
                }
              } else if (p.type === 'CODE') {
                return <pre key={index}><code className="swift">{p.code}</code></pre>;
              }
            })
          }
        </div>
      </div>
    );
  }
}
