import React, {Component} from 'react';

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
    console.log(sentences);
  }

  onChange(e) {
    this.setState({value: e.target.value}, () => {
      this.splitSentence();
    });
  }

  onSubmit(e) {
    console.log('An essay was submitted: ' + this.state.value);
    e.preventDefault();
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