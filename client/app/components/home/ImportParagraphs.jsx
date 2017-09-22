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
      }).join('\n\n');//.split('&&&');
      // this.paragraphJson(resultTexts);
      // const newResults = update(this.state.results, {[index]: {sourceText: {$set: resultTexts}}});
      // this.setState({results: newResults});
      this.onParagraphChange(index, resultTexts);
    });
  }

  paragraph(lines) {
    const substi = `\\1`;
    const path1 = lines.replace(/([^.\s])(\s*)\n/g, '$1');
    const path2 = path1.replace(/(\.\s*)\n/g, '\.\n\n');
    return path2;
  }

  groups(str, regex, groupToSelect = 0, preserveWhenEmpty = true) {
    let groups = [];
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      groups.push(m[groupToSelect]);
    }

    if (preserveWhenEmpty && groups.length <= 0) {
      groups.push(str);
    }

    return groups;
  }

  onParagraphChange(index, e) {
    const value = e.target ? e.target.value : e;
    const documentId = this.props.location.query.documentId;

    // const regexCode = /{code}\n*((.|\n)+)\n*{\/code}/g;
    const regexCode = /{code}\n*([\s\S]*?){\/code}/g;
    const codes = this.groups(value, regexCode, 1, false);

    const codeReplaced = value.replace(regexCode, "CODE");
    const paragraphRaws = this.groups(codeReplaced, /(^\n|.+)/g);
    let codeIndex = 0;
    const paragraphs = paragraphRaws.map((p) => { 
      if (p === 'CODE') {
        return {type: 'CODE', code: codes[codeIndex++], DocumentId: documentId};
      }
      const sentences = this.groups(p, /\S[^\.:\?]*[\.:\?]/g).map((s) => {return {text: s}});
      return {type: 'PLAIN', sentences: sentences, DocumentId: documentId};
    });

      console.log(paragraphs);

      const newResults = update(this.state.results, {[index]: {sourceText: {$set: value}, paragraphs: {$set: paragraphs}}});
      this.setState({results: newResults});

    // this.setState({value: e.target.value, paragraphs: paragraphs}, () => {
    //   const blocks = document.querySelectorAll('pre code');
    //   blocks.forEach((b) => {hljs.highlightBlock(b)});
    // });
  }

  paragraphMarkup(paragraph, index) {
    if (paragraph.type === 'CODE') {
      return <pre key={index}><code className="swift">{paragraph.code}</code></pre>;
    }
    else if (paragraph.type === 'PLAIN') {
      return (
        <p key={index} className="paragraph">{paragraph.sentences.map((s, si) => {
            return <span className="sentence" key={si}>{s.text}</span>;
          })}
        </p>
      );
    }
    return null;
  }

  onSubmit(index, e) {
    const paragraphs = this.state.results[index].paragraphs;
    if (!paragraphs) {
      return;
    }

    API.postParagraphs(paragraphs, () => {
      // this.props.router.push(`paragraphs?documentId=${this.props.location.query.documentId}`);
    }, (error) => {
      alert('데이터 저장 중 에러가 발생하였습니다.');
      console.log(error);
    });
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='import-paragraphs'>
        <section>Import Paragraphs</section>
        <section> 
          {this.state.results.map((item, index) => {
            const sourceText = item.sourceText;
            const paragraphs = item.paragraphs;
            return (
              <div className='row' key={index}>
                <div className='column source'>
                  <img className='capture' src={item.image} />
                  <a onClick={this.onParseImage.bind(this, item.image, index)}>parse</a>
                  <a onClick={this.onSubmit.bind(this, index)}>submit</a>
                </div>
                <div className='column result'>
                  {!sourceText ? null : <textarea value={sourceText} onChange={this.onParagraphChange.bind(this, index)} />}
                  {!paragraphs ? null : 
                    <div className='preview'>
                      {paragraphs.map((p, i) => { return this.paragraphMarkup(p, i); })}
                    </div>
                  }
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  }
}
