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

  setFocus(hasFocus) {
    this.setState({hasFocus: hasFocus, editMode: false});
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
    this.setState({comment: value});
  }

  onSubmit(e) {
    API.postSentenceComment(this.props.sentence.id, this.state.comment, () => {
      console.log('success');
    }, (error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <div className={`sentence ${this.state.hasFocus ? 'has-focus' : ''} ${this.state.editMode ? 'edit' : ''}`}>
        {this.props.sentence.text}

        {this.state.editMode ? 
          <form onSubmit={this.onSubmit.bind(this)} className="edit-sentence-comment">
            <textarea value={this.state.comment} onChange={this.onChange.bind(this)} ref={(c) => this.textarea = c} />
            <input type="submit" value="Submit" />
          </form> : null
        }
      </div>
    );
  }
}

Sentence.propTypes = {
  sentence: PropTypes.object.isRequired
};