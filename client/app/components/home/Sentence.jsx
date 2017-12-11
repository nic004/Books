import React, {Component, PropTypes} from 'react';
import {fetch, replaceURLWithHTMLLinks} from 'books/utils/Utils.jsx';
import API from 'books/Api.jsx';

export default class Sentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFocus: false,
      editMode: false,
      comment: props.sentence.comment || ''
    }
  }

  componentDidMount() {
    if (this.textSpan) {
      this.textSpan.innerHTML = replaceURLWithHTMLLinks(this.textSpan.innerText, "<a href='$1' class='sentence-link' target='_blank'>$1</a>");
    }
    if (this.sentenceElement) {
      this.sentenceElement.setAttribute('sentence-id', this.props.sentence.id);
    }
  }

  setFocus(hasFocus, then) {
    this.setState({hasFocus: hasFocus, editMode: false}, then);
    if (!hasFocus) {
      this.deselect();
    }
  }

  select() {
    if (this.sentenceElement) {
      var rangeObj, selection;
      if (document.createRange) { // IE 9+ and all other browsers
        rangeObj = document.createRange();
        rangeObj.selectNodeContents(this.sentenceElement);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeObj);
      } else if (document.body.createTextRange) { // IE <=8
        rangeObj = document.body.createTextRange();
        rangeObj.moveToElementText(this.sentenceElement);
        rangeObj.select();
      }
    }
  }

  deselect() {
    if (window.getSelection) { // IE 9+ and all other browsers
      window.getSelection().removeAllRanges();
    } else if (document.selection) { // IE <=8
      document.selection.empty();
    }
  }

  edit(toEdit) {
    this.setState({editMode: toEdit}, () => {
      if (toEdit && this.textarea) {
        this.textarea.focus();
      }
    });
  }

  isEditMode() {
    return this.state.editMode;
  }

  text() {
    return this.props.sentence.text;
  }

  onChange(e) {
    const value = e.target.value;
    this.setState({ comment: value });
  }

  onKeyDown(e) {
    // if (e.nativeEvent.ctrlKey && e.nativeEvent.keyCode === 84) {
    //   this.translateFromGoogle();
    //   return;
    // }
    if (e.nativeEvent.shiftKey && e.nativeEvent.keyCode === 13) {
      e.nativeEvent.preventDefault();
      this.submit();
    }
  }

  onSubmit(e) {
    this.submit();
  }

  submit() {
    this.edit(false);
    API.postSentenceComment(this.props.sentence.id, this.state.comment, (response) => {
      this.props.didUpdateSentence(response.sentence);
    }, (error) => {
      console.log(error);
    });
  }

  onMouseEnter(e) {
    e.target.classList.add('mouse-over');
  }

  onMouseLeave(e) {
    e.target.classList.remove('mouse-over');
  }

  onClick(e) {
    this.props.onClickSentence(this.props.sentence);
  }

  render() {
    var text = this.props.sentence.text;
    let texts = [{text: text, selected: false}];
    if (this.props.sentence.Selections.length > 0) {
      const selections = this.props.sentence.Selections;
      const offsets = selections.map((s) => s.offset);
      const indices = selections.reduce((arr, s) => { 
        arr.push(s.offset);
        arr.push(s.offset + s.length);
        return arr;
      }, []);

      if (indices.length > 1) {
        if (indices[0] > 0)  {
          indices.unshift(0);
        }
        if (indices[indices.length - 1] == text.length - 1) {
          indices.pop();
        }


        let splited = [];
        for (var i = 0; i < indices.length; i++) {
          let t = null;
          var index = indices[i];
          if (i < indices.length - 1) {
            t = text.slice(index, indices[i + 1]);
          } else {
            t = text.slice(index);
          }
          splited.push({text: t, selected: offsets.includes(index)});
        }

        texts = splited;
      }
    }

    if (this.props.outlineMode) {
      return (

        <div className={`sentence`} ref={(c) => { this.sentenceElement = c }}>
          {texts.map((t) => <span className={`${t.selected ? 'selected' : ''}`} ref={(c) => {this.textSpan = c}}>{t.text}</span>)}
        </div>
      );
    }

    return (
      <div className={`sentence ${this.state.hasFocus ? 'has-focus' : ''} ${this.state.editMode ? 'edit' : ''}`} 
           ref={(c) => { this.sentenceElement = c }} 
           onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)} onClick={this.onClick.bind(this)}>

        {texts.map((t) => <span className={`${t.selected ? 'selected' : ''}`} ref={(c) => {this.textSpan = c}}>{t.text}</span>)}
        
        {!this.state.editMode && this.state.hasFocus && this.props.sentence.comment ? <div className="sentence-comment">{this.props.sentence.comment}</div> :null}

        {this.state.editMode ? 
          <form onSubmit={this.onSubmit.bind(this)} className="edit-sentence-comment">
            <textarea value={this.state.comment} onChange={this.onChange.bind(this)} ref={(c) => this.textarea = c} onKeyDown={this.onKeyDown.bind(this)} />
            <input type="submit" value="Submit" />
          </form> : null
        }
      </div>
    );
  }
}

Sentence.propTypes = {
  sentence: PropTypes.object.isRequired,
  didUpdateSentence: PropTypes.func,
  onClickSentence: PropTypes.func,
  outlineMode: PropTypes.bool
};