import React, {Component, PropTypes} from 'react';
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
  }

  setFocus(hasFocus, then) {
    this.setState({hasFocus: hasFocus, editMode: false}, then);
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
    return (
      <div className={`sentence ${this.state.hasFocus ? 'has-focus' : ''} ${this.state.editMode ? 'edit' : ''}`} 
           onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)} onClick={this.onClick.bind(this)}>

        {this.props.sentence.text}

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
  didUpdateSentence: PropTypes.func.isRequired,
  onClickSentence: PropTypes.func.isRequired
};