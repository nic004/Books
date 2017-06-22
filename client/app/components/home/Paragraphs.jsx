import React, {Component} from 'react';
import {Link} from 'react-router';
import update from 'react-addons-update';
import API from 'books/Api.jsx';
import {isBlankString, checkInViewport} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import scrollToElement from 'scroll-to-element';
import Sentence from './Sentence.jsx';

export default class Paragraphs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraphs: [],
      commentEditingParagraphIndex: -1,
      typeEditingParagraphIndex: -1
    }
    this.componentConstructed = false;
    this.keyUpHandler = this.onKeyUp.bind(this);
    this.resizeWindowHandler = this.onResizeWindow.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("resize", this.resizeWindowHandler);
    this.load(() => {
      this.onResizeWindow();
      const paragraphId = this.props.location.query.paragraphId;
      if (paragraphId) {
        const paragraphElement = document.getElementById(`paragraph-${paragraphId}`);
        if (paragraphElement && !checkInViewport(paragraphElement)) {
          scrollToElement(paragraphElement);
        }
      }
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener("resize", this.keyUpHandler);
    window.removeEventListener("resize", this.resizeWindowHandler);
  }

  load(then) {
    API.getParagraphs(this.props.location.query.documentId, (response) => {
      this.components = {paragraphs: {}};
      this.setState({paragraphs: response.paragraphs}, () => {
        this.makeTree();
        this.componentConstructed = true;
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((b) => { hljs.highlightBlock(b) });
        if (then) {
          then();
        }
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
      this.components.paragraphs[pi] = {index: pi, sentences: {}};
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
      if (!this.focusedSentence || !this.focusedSentence.prev) {
        return;
      }        
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

  editParagraph(e) {
    if (!this.focusedSentence) {
      return false;
    }
    
    if (e.ctrlKey && e.keyCode == 69) { // ctrl+e
      const currentParagraphObject = this.focusedSentence.paragraph;
      const currentParagraph = this.state.paragraphs[currentParagraphObject.index]
      this.props.router.push(`paragraphs/${currentParagraph.id}/edit`);
      return true;
    }
    return false;
  }

  deleteParagraph(e) {
    if (!this.focusedSentence) {
      return false;
    }
    
    if (e.ctrlKey && e.keyCode == 68) { // ctrl+d
      if (!confirm("선택된 문단을 삭제합니다.")) {
        return true;
      }
      const currentParagraphObject = this.focusedSentence.paragraph;
      const currentParagraph = this.state.paragraphs[currentParagraphObject.index]
      API.deleteParagraph(currentParagraph.id, () => {
        this.componentConstructed = false;
        this.load();
      });
      return true;
    }
    return false;
  }

  selectSentence(e) {
    if (e.keyCode != 89) { // y
      return false;
    }

    if (!this.focusedSentence || this.focusedSentence.isEditMode()) {
      return false;
    }

    this.focusedSentence.select();
    return true;
  }

  editType(e) {
    if (!this.focusedSentence) {
      return false;
    }
    
    if (e.ctrlKey && e.keyCode == 87) { // ctrl+w
      // this.props.router.push(`paragraphs/${currentParagraph.id}/edit`);
      this.setState({typeEditingParagraphIndex: this.focusedSentence.paragraph.index});
      return true;
    }
    return false;
  }

  onKeyUp(e) {
    if (!this.components || Object.keys(this.components.paragraphs).length <= 0) {
      return;
    }

    if (this.state.commentEditingParagraphIndex >= 0) {
      if (e.key === 'Escape') {
        this.setState({commentEditingParagraphIndex: -1});
      }
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

    if (this.editParagraph(e)) {
      return;
    }

    if (this.deleteParagraph(e)) {
      return;
    }

    if (this.selectSentence(e)) {
      return;
    }

    if (this.editType(e)) {
      return;
    }

    if (this.moveFocus(e)) {
      return;
    }

    if (this.focusedSentence && !this.focusedSentence.isEditMode()) {
      if (e.key === 'i') {
        this.setState({commentEditingParagraphIndex: this.focusedSentence.paragraph.index}, () => {
          if (this.paragraphCommentTextarea) {
            this.paragraphCommentTextarea.focus();
          }
        });
      } else if (e.key === 'o') {
        this.focusedSentence.edit(true);
      }
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

  onCommentSubmit(e) {
    if (e) {
      e.preventDefault();
    }

    const paragraph = this.state.paragraphs[this.state.commentEditingParagraphIndex];
    API.putParagraph(paragraph, () => {
      console.log('paragraph saved ...');
      this.setState({commentEditingParagraphIndex: -1});
    });
  }

  onCommentChange(e) {
    const value = e.target.value;
    const paragraphs = update(this.state.paragraphs, {[this.state.commentEditingParagraphIndex]: {comment: {$set: value}}});
    this.setState({paragraphs: paragraphs});
  }

  onCommentKeyDown(e) {
    if (e.nativeEvent.shiftKey && e.nativeEvent.keyCode === 13) {
      e.nativeEvent.preventDefault();
      this.onCommentSubmit();
    }
  }

  onEditCode(p) {
    this.props.router.push(`paragraphs/${p.id}/edit`);
  }

  onChangeParagraphType(type, e) {
    const p = this.state.paragraphs[this.state.typeEditingParagraphIndex];
    if (p) {
      p.type = type;
      API.putParagraph(p, () => {
        this.componentConstructed = false;
        this.load();
      });
    }
    this.onCloseTypeSelectionDialog();
  }

  onCloseTypeSelectionDialog() {
    this.setState({typeEditingParagraphIndex: -1});
  }

  onClickOutline(p, e) {
    const paragraphElement = document.getElementById(`paragraph-${p.id}`);
    if (paragraphElement) {
      scrollToElement(paragraphElement);
    }
  }

  outlineDiv() {
    const headers = this.state.paragraphs.filter((p) => { return (['H1', 'H2', 'H3'].includes(p.type)); });
    return (
      <div className='outline-container' ref={(c) => this.outlineContainer = c }>
        <ul className='outline' ref={(c) => this.outline = c }>
          <li className='outline-item append-paragraph'>
            <Link to={`paragraphs/append?documentId=${this.props.location.query.documentId}`}>> 본문추가</Link>
          </li>
          {headers.map((p) => <li key={p.id} className={`outline-item ${p.type.toLowerCase()}`}><a onClick={this.onClickOutline.bind(this, p)}>{p.Sentences[0].text}</a></li>)}
        </ul>
      </div>
    );
  }

  onResizeWindow() {
    if (this.outlineContainer && this.outline) {
      this.outline.style.width = `${this.outlineContainer.offsetWidth}px`;
    }
  }

  render() {
    const currentParagraph = this.focusedSentence ? this.state.paragraphs[this.focusedSentence.paragraph.index] : null;
    return (
      <div className="paragraphs">
        {this.outlineDiv()}
        <div className="content-container">
          <div className="content">
            {
              this.state.paragraphs.map((p, index) => {
                if (p.type !== 'CODE') {
                  if (p.Sentences) {
                    return (
                      <div id={`paragraph-${p.id}`} className={`paragraph ${p.type.toLowerCase()}`} key={index} onMouseEnter={this.onMouseEnter.bind(this)} >
                        {p.Sentences.map((s, si) => {
                          return <Sentence key={si} sentence={s} ref={this.addSentenceComponent.bind(this, index, si)} didUpdateSentence={this.didUpdateSentence.bind(this)} onClickSentence={this.onClickSentence.bind(this)} />
                        })}

                        {this.state.commentEditingParagraphIndex === index ?
                          <form onSubmit={this.onCommentSubmit.bind(this)} className="edit-paragraph-comment">
                            <textarea value={p.comment || ''} onChange={this.onCommentChange.bind(this)} ref={(c) => this.paragraphCommentTextarea = c} onKeyDown={this.onCommentKeyDown.bind(this)} />
                            <input type="submit" value="Submit" />
                          </form> : null
                        }

                        <div className="sentence-comments">{p.Sentences.map((s) => `${s.comment || ''} `)}</div>

                        {p.comment ? <div className="paragraph-comments">{p.comment}</div> : null}
                      </div>
                    );
                  }
                } else if (p.type === 'CODE') {
                  return (
                    <div id={`paragraph-${p.id}`} className="code" key={index}>
                      <pre><code className="swift">{p.code}</code></pre>
                      <div className="context-menu">
                        <a onClick={this.onEditCode.bind(this, p)}>edit</a>
                      </div>
                    </div>
                  );
                }
              })
            }
          </div>
          { currentParagraph && this.state.typeEditingParagraphIndex > 0 ?
            <div className='dialog paragraph-type bg'>
              <div className='content'>
                <p>SELECT TYPE<a onClick={this.onCloseTypeSelectionDialog.bind(this)}>X</a></p>
                {['PLAIN', 'CODE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LISTITEM'].map((type) => {
                  return (
                    <a key={type} onClick={this.onChangeParagraphType.bind(this, type)}>{type}</a>
                  )
                })}
              </div>
            </div> : null
          }
        </div>
      </div>
    );
  }
}
