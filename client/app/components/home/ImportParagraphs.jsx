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
      results: [],
      sourceText: '',
      paragraphs: [],
      foldImagePreview: false
    }
  }

  componentDidMount() {
    API.getCaptures((response) => {
      const items = response.urls.map((url) => { return {image: url, selected: false}; });
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

  onParseImage(imageUrl, index, then) {
    fetch(imageUrl)
      .then(this.processStatus)
      .then(this.blob)
      .then((blob) => {
        this.blobToBase64(blob, (base64) => {
          this.parseBlob(base64, index, then);
        });
      });
  }

  parseBlob(base64, index, then) {
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
      // this.onParagraphChange(index, resultTexts);
      then(resultTexts);
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

  onParagraphChange(e) {
    const value = e ? (e.target ? e.target.value : e) : this.state.sourceText;
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

      // const newResults = update(this.state.results, {[index]: {sourceText: {$set: value}, paragraphs: {$set: paragraphs}}});
      // this.setState({results: newResults});
      this.setState({sourceText: value, paragraphs: paragraphs});

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
    const paragraphs = this.state.paragraphs;
    if (!paragraphs) {
      return;
    }

    API.postParagraphs(paragraphs, () => {
      // this.props.router.push(`paragraphs?documentId=${this.props.location.query.documentId}`);
      this.setState({sourceText: '', paragraphs: []});
      alert('저장완료');
    }, (error) => {
      alert('데이터 저장 중 에러가 발생하였습니다.');
      console.log(error);
    });
  }

  onSelectImage(index, e) {
    const current = this.state.results[index].selected;
    const newResults = update(this.state.results, {[index]: {selected: {$set: !current}}});
    this.setState({results: newResults});
  }

  onParseSelected(e) {
    this.parseFirstSelectedImage();
  }

  parseFirstSelectedImage() {
    const selectedIndex = this.state.results.findIndex((item) => { return item.selected; });
    if (selectedIndex < 0) {
      this.onParagraphChange();
      return;
    }

    const selectedItem = this.state.results[selectedIndex];
    this.onParseImage(selectedItem.image, selectedIndex, (resultTexts) => {
      const newResults = update(this.state.results, { [selectedIndex]: { selected: { $set: false } } });
      const newSourceText = this.state.sourceText + '\n\n<<<<< Parsed Item >>>>>\n' + resultTexts;
      this.setState({results: newResults, sourceText: newSourceText}, () => {
        console.log('----------------------------');
        console.log(resultTexts);
        this.parseFirstSelectedImage();
      });
    });
  }

  onFold() {
    this.setState({foldImagePreview: !this.state.foldImagePreview});
  }

  render() {
    let codeIndex = 0;
    return (
      <div className='import-paragraphs'>
        <section>Import Paragraphs</section>
        <section className={`source-images ${this.state.foldImagePreview ? 'folded' : ''}`}> 
          <div className='row'>
            {this.state.results.map((item, index) => {
              const sourceText = item.sourceText;
              const paragraphs = item.paragraphs;
              return (
                <div className={`column source ${item.selected ? 'selected' : ''}`} onClick={this.onSelectImage.bind(this, index)}>
                  <img className='capture' src={item.image} />
                </div>
              );
            })}
          </div>
        </section>

        <section className='import-menus'>
          <div>
            <a onClick={this.onParseSelected.bind(this)}>PARSE</a>
            <a onClick={this.onSubmit.bind(this)}>SUBMIT</a>
            <a onClick={this.onFold.bind(this)}>{this.state.foldImagePreview ? 'UNFOLD': 'FOLD'}</a>
          </div>
        </section>

        <section className='parsed'>
          <div className='container'>
            <div className='column editor'>
              <textarea value={this.state.sourceText} onChange={this.onParagraphChange.bind(this)} />
            </div>
            <div className='column preview'>
              {this.state.paragraphs.map((p, i) => { return this.paragraphMarkup(p, i); })}
            </div>
          </div>
        </section>
      </div>
    );
  }
}
