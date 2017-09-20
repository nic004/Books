import React, {Component} from 'react';
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
      paragraph: null,
      parsedTexts: []
    }
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

  onParseImage(imageUrl, e) {
    fetch(imageUrl)
      .then(this.processStatus)
      .then(this.blob)
      .then((blob) => {
        this.blobToBase64(blob, (base64) => {
          this.parseBlob(base64);
        });
      });
  }

  parseBlob(base64) {
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
      const resultTexts = json.ParsedResults.map((item) => { return item.ParsedText; });
      this.setState({parsedTexts: resultTexts});
    });
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='import-paragraphs'>
        <section>Import Paragraphs</section>
        <section> 
          <div>
            <img className='capture' src='/static/images/captures/0001.png' />
            <a onClick={this.onParseImage.bind(this, '/static/images/captures/0001.png')}>parse</a>
            {this.state.parsedTexts.map((text, index) => <div className='parsed-text' key={index}>{text}</div>)}
          </div>
        </section>
      </div>
    );
  }
}

// function uploadImageToImgur(blob) {
//   var formData = new FormData();
//   formData.append('type', 'file');
//   formData.append('image', blob);

//   return fetch('https://api.imgur.com/3/upload.json', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       Authorization: 'Client-ID dc708f3823b7756'// imgur specific
//     },
//     body: formData
//   })
//     .then(processStatus)
//     .then(parseJson);
// }

// // --- ACTION ---
// var sourceImageUrl = 'https://hospodarets.com/images/img/about.jpeg';
// console.log('Started downloading image from <a href="' + sourceImageUrl + '">hospodarets.com url</a>');

// downloadFile(sourceImageUrl)// download file from one resource
//   .then(uploadImageToImgur)// upload it to another
//   .then(function (data) {
//     console.log('Image successfully uploaded to <a href="https://imgur.com/' + data.data.id + '">imgur.com url</a>');
//     //console.log('<img src="' + data.data.link.replace('http:', 'https:') + '"/>');// for demo
//   })
//   .catch(function (error) {
//     console.error(error.message ? error.message : error);
//   });

