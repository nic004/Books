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

    const aaa = `
있으며, 이 화면은 굉장히 간단하게 구성되어 있어 대중이 사용하기 편했다. 조금 더 기술적인 수치들을 확인하고 싶다 
면 간단한 인터페이스를 통해 블록제인에서 뿌려지는 기술 데이터도 볼 수 있다. 짧은 금발 머리와 - 
0 어 
굴 덕분에 
나단은 십 대 프로게이머처럼 보였지만 벤처업계의 자금을 빨아들이는 성공한 사업가이자 누군가의 남편이자 아버지였 
다. 그는 이미 30살 때 몇 개의 사업체를 만들었고, 팔았고, 잃었고, 잃었고, 또 잃어버렸다. 그리고 또다시 사업체를 만 
들고 있다. 
나단 랜즈는 15살 때 비디오 게임인 에버퀘스트에서 대형 '길드'를 운영하고 가상 물건을 실제 돈을 받고 판매하며 
처음으로 돈을 버는 경험을 했다. 그는 이미 그때 사업가가 된 것이다. 하지만 랜즈 자신은 정작 그 사실을 인지하지 못 
하고 있었다. “나는 사업하는 사람들과 인맥도 없었고, 스프레드시트도 아닌 메모장에 기록을 하고 있었습니다." 
이 시기는 콜럼바인 총격 사건이 일어났던 때였다. 당시 머리가 길고 검은색 옷을 즐겨 입었던 그는 학교 사람들에게 
콜럼바인 총격 사건의 살인범으로 오해받지는 않을까 하는 걱정을 했다. 그는 벌어둔 돈이 있었기에 학교에서 괴롭힘을 
당할 바에야 학교를 그만두려는 용기가 있었다. 그는 전국을 여행하면서 플로리다의 부동산에 뛰어들었다가 모든 것을 
잃어버렸고 다시 게임으로 돌아와 게임 관련 회사를 시작하며 자신감을 쌓았다. 그러다 게임 관련 사업자 정기적으로 
샌프란시스코에 올 기회가 생겼고 그는 결국 샌프란시스코로 다시 돌아왔다. 
랜즈는 잇따른 성공으로 새로운 게임 회사인 게임스트리머를 설립할 때 1 ,000만 달러를 투자받을 수 있었다. 그는 
시장조사자 경쟁 업체를 염탐하는 조사 작업을 했는데, 이때 패트릭 머크Patrick Murck와 처음으로 인연을 맺었다. 머 
크는 현재 비트코인 재단의 고문 이사이며 비트코인 업계의 복잡하고도 중요한 정부 규제 당국 및 국회의원과의 네트워 
크에서 핵심 인사이다. 이렇게 두 사람은 우정을 쌓아나갔다. 랜즈에게 비트코인에 대해 처음 이야기한 사람이 바로 머 
크였다. 
게임스트리머는 결국 세상에 나오진 않았다. 2013년 여름, 랜즈는 조용히 해당 프로젝트를 종료했다. 그는 아내의 
식당을 도와가며 시간을 때우면서 다음 할 일에 대해 생각하기 시작했다. 그의 생각은 점점 좋은 투자라고 여겨지는 비 
트코인으로 계속 기울었다. 랜즈는 온라인 마켓에서 비트코인을 사기 시작했으며 그곳에서 앞으로 그의 비즈니스 파트 
너가 될 하이너를 만났다. 그들은 라멘언더그라운드에서 만나며 아이디어를 스케치하기 시작했다. 그 아이디어 중 하나 
가퀵코인이었다.`;
    
    // this.paragraph(aaa);

    return fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    }).then(this.processStatus).then(this.json).then((json) => {
      console.log(json);
      const resultTexts = json.ParsedResults.map((item) => { return this.paragraph(item.ParsedText); });
      this.setState({parsedTexts: resultTexts});
    });
  }

  paragraph(lines) {
    const path1 = lines.replace(/([^.])\W\n/g, (match, p1) => { 
      console.log(p1);
      return p1;
    });
    // const path2 = path1.replace(/(\.\W)\n/g, (match, p1) => {
    //   return `${p1}\n\n`;
    // })

    console.log(path1);

    return path1;
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

