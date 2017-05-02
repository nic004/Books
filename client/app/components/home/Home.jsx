import React, {Component} from 'react';
import update from 'react-addons-update';
import API from 'books/Api.jsx';
import {isBlankString, checkInViewport} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import scrollToElement from 'scroll-to-element';
import Sentence from './Sentence.jsx';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraphs: [],
    }
    this.componentConstructed = false;
    this.keyUpHandler = this.onKeyUp.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener("keyup", this.keyUpHandler);
    API.getParagraphs((response) => {
      this.components = {paragraphs: {}};
      this.setState({paragraphs: response.paragraphs}, () => {
        this.makeTree();
        this.componentConstructed = true;
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((b) => { hljs.highlightBlock(b) });
      });
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener("keyup", this.keyUpHandler);
  }

  addSentenceComponent(pi, si, s) {
    if (this.componentConstructed || !s || isBlankString(s.text())) {
      return;
    }

    if (!this.components.paragraphs[pi]) {
      this.components.paragraphs[pi] = {sentences: {}};
    }
    let p = this.components.paragraphs[pi];
    p.sentences[si] = s;
  } 

  makeTree() {
    let currentParagraph = null;
    let currentSentence = null;
    Object.keys(this.components.paragraphs).sort((a, b) => a - b).forEach((pk) => {
      const p = this.components.paragraphs[pk];
      if (currentParagraph) {
        currentParagraph.next = p;
        p.prev = currentParagraph;
      }
      currentParagraph = p;

      Object.keys(p.sentences).sort((a, b) => a - b).forEach((sk) => {
        // console.log(`${pk} - ${sk}`);
        const s = p.sentences[sk];
        if (currentSentence) {
          currentSentence.next = s;
          s.prev = currentSentence;
        } 
        s.paragraph = p;
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
    else if (e.key === 'j') {
      handled = true;
      if (!this.focusedSentence) {
        this.focusedSentence = this.sentenceComponent([0, 0]);
      } else {
        const nextParagraph = this.focusedSentence.paragraph.next;
        if (nextParagraph) {
          prevFocused = this.focusedSentence;
          this.focusedSentence = nextParagraph.sentences[0];
        }
      }
    }
    else if (e.key === 'k') {
      handled = true;
      const prevParagraph = this.focusedSentence.paragraph.prev;
      if (prevParagraph) {
        prevFocused = this.focusedSentence;
        this.focusedSentence = prevParagraph.sentences[0];
      }
    }

    if (handled) {
      if (prevFocused) {
        prevFocused.setFocus(false);
      }

      this.focusedSentence.setFocus(true, () => {
        const fse = document.querySelector('div.sentence.has-focus');
        if (!checkInViewport(fse)) {
          scrollToElement(fse, {duration: 500});
        }
      });

      e.stopPropagation();
      e.preventDefault();
    }

    return handled;
  }

  translateParagraph(e) {

    if (!this.focusedSentence) {
      return false;
    }
    
    // if (e.ctrlKey && e.keyCode == 67) { // ctrl+c
    if (e.ctrlKey && e.keyCode == 84) { // ctrl+t
      const currentParagraph = this.focusedSentence.paragraph;
      const currentSentences = Object.keys(currentParagraph.sentences).map((sk) => currentParagraph.sentences[sk]);
      const paragraphText = currentSentences.map((s) => s.text()).join(' ');
      const translateUri = `https://translate.google.com/?sl#en/ko/${paragraphText}`;
      window.open(encodeURI(translateUri), 'GoogleTranslate');
      return true;
    }
    return false;
  }

  onKeyUp(e) {
    if (!this.components || Object.keys(this.components.paragraphs).length <= 0) {
      return;
    }

    if (this.focusedSentence && this.focusedSentence.isEditMode()) {
      if (e.key === 'Escape') {
        this.focusedSentence.edit(false);
      }
      return;
    }

    if (this.translateParagraph(e)) {
      return;
    }

    if (this.moveFocus(e)) {
      return;
    }

    if (e.key === 'o' && this.focusedSentence && !this.focusedSentence.isEditMode()) {
      this.focusedSentence.edit(true);
    }
  }

  onMouseEnter(e) {
    const current = [...document.querySelectorAll('div.paragraph.mouse-over')];
    current.forEach((p) => {
      p.classList.remove('mouse-over');
    });
    e.target.classList.add('mouse-over');
  }

  // onMouseLeave(e) {
  //   e.target.classList.remove('mouse-over');
  // }

  sentenceIndex(sentence) {
    const pIndex = this.state.paragraphs.findIndex((p) => p.id === sentence.ParagraphId);
    const sIndex = this.state.paragraphs[pIndex].Sentences.findIndex((s) => s.id == sentence.id);
    return {paragraph: pIndex, sentence: sIndex};
  }

  didUpdateSentence(sentence) {
    const index = this.sentenceIndex(sentence);
    const newParagraphs = update(this.state.paragraphs, {[index.paragraph]: {Sentences: {[index.sentence]: {$set: sentence}}}});
    this.setState({paragraphs: newParagraphs});
  }

  onClickSentence(sentence) {
    const index = this.sentenceIndex(sentence);
    const targetSentenceComponent = this.components.paragraphs[index.paragraph].sentences[index.sentence];
    if (targetSentenceComponent) {
      if (this.focusedSentence) {
        this.focusedSentence.setFocus(false);
      }
      this.focusedSentence = targetSentenceComponent;
      this.focusedSentence.setFocus(true);
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
                    <div className='paragraph' key={index} onMouseEnter={this.onMouseEnter.bind(this)} >
                      {p.Sentences.map((s, si) => {
                        return <Sentence key={si} sentence={s} ref={this.addSentenceComponent.bind(this, index, si)} didUpdateSentence={this.didUpdateSentence.bind(this)} onClickSentence={this.onClickSentence.bind(this)} />
                      })}
                      <div className="sentence-comments">{p.Sentences.map((s) => `${s.comment || ''} `)}</div>
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
