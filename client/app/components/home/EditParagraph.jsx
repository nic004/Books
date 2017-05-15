import React, {Component} from 'react';
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

  onSave() {

  }

  onCancel() {

  }

  render() {
    return (
      <div className='edit-paragraph'>
        <form onSubmit={this.onSave.bind(this)}>
          {!this.state.paragraph ? null :
            <div className='sentences'>
              {
                this.state.paragraph.Sentences.map((s) => {
                  return (
                    <div className='sentence-info' key={s.id}>
                      <textarea className='input-sentence' type='text' value={s.text} />
                      <textarea className='input-sentence-comment' type='text' value={s.comment || ''} />
                    </div>
                  );
                })
              }
            </div>
          }
          <div className='buttons'>
            <a className='cancel' onClick={this.onCancel.bind(this)}>취소</a>
            <input type='submit' value='저장' />
          </div>
        </form>
      </div>
    );
  }
}