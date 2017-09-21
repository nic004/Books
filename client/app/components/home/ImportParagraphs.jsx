import React, {Component} from 'react';
import update from 'react-addons-update';
import API from 'books/Api.jsx';
import {post} from 'books/utils/Utils.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';
import download from 'downloadjs';

const OCR_API_KEY = 'b626c4daa488957';

export default class ImportParagraphs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      results: [],
      paragraph: null,
      parsedTexts: []
    }
  }

  componentDidMount() {
    API.getCaptures((response) => {
      const items = response.urls.map((url) => { return {image: url}; });
      this.setState({results: items});
    });
  }

  processStatus(response) {// process status
    if (response.status === 200 || response.status === 0) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error('Error loading: ' + url))
    }
  };

  blob(response) {
    return response.blob();
  };

  json(response) {
    return response.json();
  };

  blobToBase64(blob, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = reader.result;
      var base64 = dataUrl;
      cb(base64);
    };
    reader.readAsDataURL(blob);
  }

  // download/upload
  downloadFile(url) {
    return fetch(url)
      .then(blob)
      .then(parseBlob);
  };

  onParseImage(imageUrl, index, e) {
    fetch(imageUrl)
      .then(this.processStatus)
      .then(this.blob)
      .then((blob) => {
        this.blobToBase64(blob, (base64) => {
          this.parseBlob(base64, index);
        });
      });
  }

  parseBlob(base64, index) {
    var formData = new FormData();
    formData.append('base64Image', base64);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'kor');

    return fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    }).then(this.processStatus).then(this.json).then((json) => {
      console.log(json);
      const resultTexts = json.ParsedResults.map((item) => { 
        return this.paragraph(item.ParsedText); 
      }).join('&&&').split('&&&');
      const newResults = update(this.state.results, {[index]: {paragraphs: {$set: resultTexts}}});
      this.setState({results: newResults});
    });
  }

  paragraph(lines) {
    const substi = `\\1`;
    const path1 = lines.replace(/([^.\s])(\s*)\n/g, '$1');
    const path2 = path1.replace(/(\.\s*)\n/g, '.&&&');
    return path2;
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='import-paragraphs'>
        <section>Import Paragraphs</section>
        <section> 
          {this.state.results.map((item, index) => {
            const paragraphs = item.paragraphs;
            return (
              <div className='row' key={index}>
                <div className='column source'>
                  <img className='capture' src={item.image} />
                  <a onClick={this.onParseImage.bind(this, item.image, index)}>parse</a>
                </div>
                <div className='column result'>
                  {paragraphs ? paragraphs.map((text, index) => <div className='paragraph' key={index}>{text}</div>) : null}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  }
}
