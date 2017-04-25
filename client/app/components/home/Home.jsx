import React, {Component} from 'react';
import API from 'books/Api.jsx';
import hljs from 'highlight';
import 'highlight/styles/atom-one-light.css';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      paragraphs: [],
    }
  }

  componentDidMount() {
    hljs.initHighlightingOnLoad();

    API.getParagraphs((response) => {
      this.setState({paragraphs: response.paragraphs}, () => {
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((b) => { hljs.highlightBlock(b) });
      });
    });
  }

  render() {
    return (
      <div className="container home">
        <div className="content">
          {
            this.state.paragraphs.map((p, index) => {
              if (p.type === 'PLAIN') {
                if (p.Sentences) {
                  return (
                    <p className='paragraph' key={index}>
                      {p.Sentences.map((s, si) => {
                        return <span className='sentence' key={si}>{s.text}</span>
                      })}
                    </p>
                  );
                }
              } else if (p.type === 'CODE') {
                return <pre><code className="swift">{p.code}</code></pre>;
              }
            })
          }
        </div>
      </div>
    );
  }
}
