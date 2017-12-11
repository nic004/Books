import React, {Component} from 'react';
import {Link} from 'react-router';
import update from 'react-addons-update';
import API from 'books/Api.jsx';
import {isBlankString, checkInViewport, getSelectedNodes} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import scrollToElement from 'scroll-to-element';
import Sentence from './Sentence.jsx';
import EditParagraph from './EditParagraph.jsx';

export default class Paragraphs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraphs: [],
      commentEditingParagraphIndex: -1,
      typeEditingParagraphIndex: -1,
      contextMenuParagraphIndex: -1,
      editingParagraphIndex: -1,
      insertingParagraph: false,
      newParagraphValue: '',
      outlineMode: false
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
      this.setState({paragraphs: response.paragraphs, insertingParagraph: false, newParagraphValue: ''}, () => {
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

      if (this.state.contextMenuParagraphIndex >= 0) {
        this.setState({contextMenuParagraphIndex: -1, insertingParagraph: false, newParagraphValue: ''});
      }

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
      this.setState({ editingParagraphIndex: currentParagraphObject.index });
      // const currentParagraph = this.state.paragraphs[currentParagraphObject.index]
      // this.props.router.push(`paragraphs/${currentParagraph.id}/edit`);
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
    // if (e.keyCode != 89) { // y
    //   return false;
    // }

    // if (!this.focusedSentence || this.focusedSentence.isEditMode()) {
    //   return false;
    // }

    // this.focusedSentence.select();
    // return true;
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

  selectSentences(e) {
    // if (e.ctrlKey && e.keyCode == 85) { // ctrl+u
    if (e.keyCode == 89) { // y
      let nodes = getSelectedNodes();
      if (nodes.length == 1) {
        const t = nodes[0];
        const sp = t.parentNode;
        const div = sp.parentNode;
        nodes.unshift(sp);
        nodes.unshift(div);
      } else if (nodes.length <= 0) {
        return false;
      }

      const ws = window.getSelection();
      const range = ws.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      let filtered = nodes
        .filter((v) => (v.tagName == "DIV" && v.className.includes("sentence") && v.innerText));
        
      const first = 0;
      const last = filtered.length - 1;
      let selections = filtered.map((div, index) => {
        let item = {};
        let text = div.innerText;
        if (index == first && index == last) {
          item.range = { offset: range.startOffset, length: range.endOffset - range.startOffset }
        } else if (index == first) {
          item.range = { offset: range.startOffset, length: text.length - (range.startOffset + 1) };
        } else if (index == last) {
          item.range = { offset: 0, length: range.endOffset };
        } else {
          item.range = { offset: 0, length: text.length };
        }
        item.text = text.substr(item.range.offset, item.range.length);
        item.node = div;
        item.sentenceId = div.getAttribute('sentence-id');
        return item;
      });

      selections.forEach((it) => {
        it.node.classList.add("selected");
      });

      const params = selections.map((s) => {
        return {
          offset: s.range.offset, 
          length: s.range.length,
          SentenceId: s.sentenceId
        };
      })

      API.postSelection(params,  () => {
        window.getSelection().removeAllRanges();
        this.componentConstructed = false;
        this.load();
      });

      return true;
    }
    return false;
  }

  paragraphContextMenu(e) {
    if (this.focusedSentence && e.key === 'm') {
      const currentParagraphObject = this.focusedSentence.paragraph;
      this.setState({contextMenuParagraphIndex: currentParagraphObject.index});
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

    if (this.paragraphContextMenu(e)) {
      return;
    }

    if (this.moveFocus(e)) {
      return;
    }

    if (this.selectSentences(e)) {
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

      if (this.state.contextMenuParagraphIndex >= 0) {
        this.setState({contextMenuParagraphIndex: -1, insertingParagraph: false, newParagraphValue: ''});
      }
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
          <li className='outline-item append-paragraph'>
            <Link to={`paragraphs/import?documentId=${this.props.location.query.documentId}`}>> 이미지 로딩</Link>
          </li>
          <li className='outline-item append-paragraph'>
            <a onClick={this.toggleOutlineMode.bind(this)}>> {this.state.outlineMode ? '전체 문장 보기' : '선택된 문장만 보기'}</a>
          </li>
          {headers.map((p) => <li key={p.id} className={`outline-item ${p.type.toLowerCase()}`}><a onClick={this.onClickOutline.bind(this, p)}>{p.Sentences[0].text}</a></li>)}
        </ul>
      </div>
    );
  }

  toggleOutlineMode() {
    const newMode = !this.state.outlineMode;
    this.setState({outlineMode: newMode});
  }

  onResizeWindow() {
    if (this.outlineContainer && this.outline) {
      this.outline.style.width = `${this.outlineContainer.offsetWidth}px`;
    }
  }

  onEditParagraph(index, e) {
    this.setState({editingParagraphIndex: index});
  }

  onAddParagraphToBelow(index, e) {
    this.setState({insertingParagraph: true});
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

  onInsertParagraphToBelow(index) {
    const value = this.state.newParagraphValue;
    if (!value || value.length <= 0) {
      return;
    }

    const sentences = this.groups(value, /\S[^\.:\?]*[\.:\?]/g).map((s) => { return { text: s } });
    if (!sentences || sentences.length <= 0) {
      return;
    }

    const currentParagraph = this.state.paragraphs[index];
    const position = currentParagraph.position;
    const rank= currentParagraph.rank;
    const documentId = this.props.location.query.documentId;
    if (!documentId) {
      return;
    }

    API.postParagraphsInsert(documentId, sentences, position, rank, () => {
      this.componentConstructed = false;
      this.load();
    });
  }

  onNewParagraphTextAreaChange(e) {
    this.setState({newParagraphValue: e.target.value});
  }

  onCancelNewParagraph(e) {
    this.setState({insertingParagraph: false, newParagraphValue: ''});
  }

  onCloseEditParagraph(paragraph) {
    if (paragraph) {
      const paragraphs = update(this.state.paragraphs, { [this.state.editingParagraphIndex]: { $set: paragraph } });
      this.setState({ paragraphs: paragraphs, editingParagraphIndex: -1 });
    } else {
      this.setState({ editingParagraphIndex: -1 });
    }
  }

  renderOutlineMode() {
    const isTitleParagraph = (p) => {
      return ['H1', 'H2', 'H3'].includes(p.type);
    }

    const hasSelectedSenteces = (p) => {
      if (!p.Sentences || p.Sentences.length <= 0) {
        return false;
      }

      const selectionCount = p.Sentences.filter((s) => {
        return (s.Selections && s.Selections.length > 0)
      }).length;

      return isTitleParagraph(p) || selectionCount > 0;
    }

    return (
      <div className="paragraphs">
        {this.outlineDiv()}
        <div className="content-container">
          <div className="content">
            {
              this.state.paragraphs.filter(hasSelectedSenteces).map((p, index) => {
                return (
                  <div id={`paragraph-${p.id}`} className={`paragraph ${p.type.toLowerCase()}`} key={index}>
                    {p.Sentences.filter((s) => { return isTitleParagraph(p) || (s.Selections && s.Selections.length > 0) }).map((s, si) => {
                      return <Sentence key={si} sentence={s} outlineMode={true} />
                    })}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }

  render() {
    const currentParagraph = this.focusedSentence ? this.state.paragraphs[this.focusedSentence.paragraph.index] : null;
    if (this.state.outlineMode) {
      return this.renderOutlineMode();
    }

    return (
      <div className="paragraphs">
        {this.outlineDiv()}
        <div className="content-container">
          <div className="content">
            {
              this.state.paragraphs.map((p, index) => {
                if (p.type !== 'CODE') {
                  if (p.Sentences && p.Sentences.length > 0) {
                    return (
                      <div id={`paragraph-${p.id}`} className={`paragraph ${p.type.toLowerCase()}`} key={index}>
                        {p.Sentences.map((s, si) => {
                          return <Sentence key={si} sentence={s} ref={this.addSentenceComponent.bind(this, index, si)} didUpdateSentence={this.didUpdateSentence.bind(this)} onClickSentence={this.onClickSentence.bind(this)} />
                        })}

                        {this.state.contextMenuParagraphIndex != index ? null : 
                          <ul className='paragraph-menu'>
                            <li>COMMENT</li>
                            <li><a onClick={this.onEditParagraph.bind(this, index)}>EDIT</a></li>
                            <li><a onClick={this.onAddParagraphToBelow.bind(this, index)}>ADD BELOW</a></li>
                          </ul>
                        }

                        {this.state.contextMenuParagraphIndex == index && this.state.insertingParagraph ? 
                          <form className="insert-paragraph">
                            <textarea value={this.state.newParagraphValue} onChange={this.onNewParagraphTextAreaChange.bind(this)} />
                              <a onClick={this.onInsertParagraphToBelow.bind(this, index)}>Submit</a>
                              <a onClick={this.onCancelNewParagraph.bind(this)}>Cancel</a>
                          </form> : null
                        }

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
          { currentParagraph && this.state.typeEditingParagraphIndex >= 0 ?
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
          { this.state.editingParagraphIndex >= 0 ? <EditParagraph paragraph={currentParagraph} onClose={this.onCloseEditParagraph.bind(this)} /> : null }
        </div>
      </div>
    );
  }
}
