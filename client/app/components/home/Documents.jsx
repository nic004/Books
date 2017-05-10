
import React, {Component} from 'react';
import API from 'books/Api.jsx';
import {post} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';

export default class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      newDocumentTitle: '',
      editDocumentId: null,
      editDocumentTitle: null
    }
  }
  
  componentDidMount() {
    this.load();
  }

  load() {
    API.getDocuments((res) => {
      this.setState({documents: res.documents});
    }, () => {});
  }

  onChange(e) {
    const value = e.target.value;
    this.setState({newDocumentTitle: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault();
    API.postDocuments(this.state.newDocumentTitle, () => {
      console.log('success');
      this.setState({newDocumentTitle: ''});
      this.load();
    }, (error) => {
      console.log(error);
    });
  }

  onChangeTitle(e) {
    this.setState({editDocumentTitle: e.target.value});
  }

  onUpdate(e) {
    e.preventDefault();
    API.putDocuments(this.state.editDocumentId, this.state.editDocumentTitle, () => {
      console.log('success');
      this.setState({editDocumentId: null, editDocumentTitle: null});
      this.load();
    }, (error) => {
      console.log(error);
    });
  }

  onEditDocument(document, e) {
    this.setState({editDocumentId: document.id, editDocumentTitle: document.title});
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='documents'>
        <ul className='document-list'>
          {
            this.state.documents.map((d) => 
              <li key={d.id} className='document'>
                {this.state.editDocumentId === d.id ? <form onSubmit={this.onUpdate.bind(this)}><input type="text" onChange={this.onChangeTitle.bind(this)} value={this.state.editDocumentTitle || ''} /></form> : d.title}
                {this.state.editDocumentId === d.id ? null : <a onClick={this.onEditDocument.bind(this, d)}>EDIT</a>}
              </li>
            )
          }
        </ul>

        <form onSubmit={this.onSubmit.bind(this)}>
          <textarea value={this.state.newDocumentTitle} onChange={this.onChange.bind(this)} />
          <input type="submit" value="Add" />
        </form>
      </div>
    );
  }
}