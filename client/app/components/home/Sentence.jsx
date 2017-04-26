import React, {Component, PropTypes} from 'react';
import API from 'books/Api.jsx';

export default class Sentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFocus: false
    }
  }

  componentDidMount() {
  }

  setFocus(hasFocus) {
    this.setState({hasFocus: hasFocus});
  }

  text() {
    return this.props.sentence.text;
  }

  render() {
    return (
      <span className={`sentence ${this.state.hasFocus ? 'has-focus' : ''}`}>{this.props.sentence.text}</span>
    );
  }
}

Sentence.propTypes = {
  sentence: PropTypes.object.isRequired
};