import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import Dropdown from 'react-dropdown';
import update from 'react-addons-update';
import API from 'books/Api.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';

export default class EditParagraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paragraph: null
    }
  }

  componentDidMount() {
    console.log(this.props.params);
    API.getParagraph(this.props.params.id, (response) => {
      this.setState({paragraph: response});
    });
  }

  onSave(e) {
    e.preventDefault();
    API.putParagraph(this.state.paragraph, () => {
      browserHistory.push(`/paragraphs?documentId=${this.state.paragraph.DocumentId}&paragraphId=${this.state.paragraph.id}`);
    });
  }

  onCancel() {
    browserHistory.goBack();
  }

  onChange(index, sentence, key, e) {
    const p = update(this.state.paragraph, {Sentences: {[index]: {[key]: {$set: e.target.value}}}});
    this.setState({paragraph: p});
  }

  onNewSentence() {
    const p = update(this.state.paragraph, {Sentences: {$push: [{text: null, comment: null}]}});
    this.setState({paragraph: p});
  }

  onChangeCode(e) {
    const p = update(this.state.paragraph, {code: {$set: e.target.value}, type: {$set: (e.target.value ? 'CODE' : this.state.paragraph.type)}});
    this.setState({paragraph: p});
  }

  onChangeParagraphType(item) {
    const p = update(this.state.paragraph, {type: {$set: item.value}});
    this.setState({paragraph: p});
  }

  render() {
    return (
      <div className='edit-paragraph'>
        <form onSubmit={this.onSave.bind(this)}>
          {!this.state.paragraph ? null :
            <div className='sentences'>
              <Dropdown onChange={this.onChangeParagraphType.bind(this)} value={this.state.paragraph.type} options={['PLAIN', 'CODE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LISTITEM']}/>
              <div className='sentence-info'>
                <textarea className='input-code' type='text' onChange={this.onChangeCode.bind(this)} value={this.state.paragraph.code || ''} />
              </div>
              {
                this.state.paragraph.Sentences.map((s, index) => {
                  return (
                    <div className='sentence-info' key={index}>
                      <textarea className='input-sentence' type='text' onChange={this.onChange.bind(this, index, s, 'text')} value={s.text || ''} />
                      <textarea className='input-sentence-comment' type='text' onChange={this.onChange.bind(this, index, s, 'comment')} value={s.comment || ''} />
                    </div>
                  );
                })
              }
              <div className='new-sentence'>
                <a onClick={this.onNewSentence.bind(this)} className='new-sentence'>ADD</a> 
              </div>
            </div>
          }
          <div className='buttons'>
            <a className='button cancel' onClick={this.onCancel.bind(this)}>취소</a>
            <a className='button submit' onClick={this.onSave.bind(this)}>저장</a>
          </div>
        </form>
      </div>
    );
  }
}