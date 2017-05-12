import React, {Component} from 'react';
import {Link} from 'react-router';
import API from 'books/Api.jsx';
import {post} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import dateFormat from 'dateformat';

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
  
  onCancel() {
    this.setState({newDocumentTitle: ''});
  }

  onTitleKeyDown(e) {
    if (e.nativeEvent.shiftKey && e.nativeEvent.keyCode === 13) {
      e.nativeEvent.preventDefault();
      this.onSubmit();
    }
    else if (e.nativeEvent.keyCode === 27) {
      e.nativeEvent.preventDefault();
      this.onCancel();
    }
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



  onChangeTitleKeyDown(e) {
    if (e.nativeEvent.shiftKey && e.nativeEvent.keyCode === 13) {
      e.nativeEvent.preventDefault();
      this.onUpdate();
    }
    else if (e.nativeEvent.keyCode === 27) {
      e.nativeEvent.preventDefault();
      this.onCancelDocumentEdit();
    }
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

  onChangeTitle(e) {
    this.setState({editDocumentTitle: e.target.value});
  }

  onEditDocument(document, e) {
    this.setState({editDocumentId: document.id, editDocumentTitle: document.title});
  }

  onCancelDocumentEdit(e) {
    this.setState({editDocumentId: null, editDocumentTitle: null});
  }


  render() {
    let codeIndex = 0;
    return (
      <div className='documents'>
        <ul className='document-list'>
          {
            this.state.documents.map((d) => 
              <li key={d.id} className='document'>
                {this.state.editDocumentId === d.id ? 
                  <form className='edit-document-title' onSubmit={this.onUpdate.bind(this)}>
                    <input type="text" className='title' 
                      onKeyDown={this.onChangeTitleKeyDown.bind(this)} 
                      onChange={this.onChangeTitle.bind(this)} 
                      value={this.state.editDocumentTitle || ''} 
                      placeholder='document title' />
                    <p className='tip'>enter - 완료, esc - 취소</p>
                  </form> 
                  : 
                  <div className='title'>
                    <p className='title'><Link to={`paragraphs?documentId=${d.id}`}>{d.title}</Link></p>
                    <p className='info'>
                      <span className='updated-at'>{dateFormat(d.updatedAt, 'yyyy-mm-dd HH:MM')}</span>
                      <a className='edit' onClick={this.onEditDocument.bind(this, d)}>EDIT</a>
                    </p>
                  </div>
                 }
              </li>
            )
          }
        </ul>

        <form onSubmit={this.onSubmit.bind(this)} className='new-document'>
          <input className='new-document-title' 
                 type="text" 
                 onChange={this.onChange.bind(this)} 
                 value={this.state.newDocumentTitle || ''}  
                 onKeyDown={this.onTitleKeyDown.bind(this)} 
                 placeholder='document title'
          />
          <p className='tip'>enter - 완료, esc - 취소</p>
        </form>
      </div>
    );
  }
}