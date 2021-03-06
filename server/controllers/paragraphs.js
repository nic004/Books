'use strict';

const express = require('express');
const models = require('../models');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');

const router = express.Router();

router.get('/', (req, res) => {
  models.Paragraph.findAll({where: {DocumentId: req.query.documentId}, include: [{model: models.Sentence, include: [{model: models.Selection}]}], order: ['Paragraph.position', 'Paragraph.rank', 'Sentences.id']})
  .then((paragraphs) => {
    res.json({paragraphs: paragraphs});
  });
});

function naturalCompare(a, b) {
    var ax = [], bx = [];

    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}

router.get('/captures', (req, res) => {
  const dir = path.resolve(__dirname + '/../../static/images/captures/');
  fs.readdir(dir, (err, files) => {
    const pngs = files.filter((file) => /.+\.(png|jpg|jpeg)/i.test(file)).map((img) => `/static/images/captures/${img}`).sort(naturalCompare);
    res.json({urls: pngs});
  });
});

router.get('/:id', (req, res) => {
  models.Paragraph.findAll({where: {id: req.params.id}, include: [{model: models.Sentence, include: [{model: models.Selection}]}], order: ['Paragraph.id', 'Sentences.id']})
  .then((paragraphs) => {
    res.json(paragraphs[0]);
  });
});

function addSentneces(paragraphs, index, ps, p, res) {
  const isLast = index == paragraphs.length - 1;
  let sentences = ps.sentences;
  if (sentences) {
    sentences.forEach((s) => { s.ParagraphId = p.id; });
    models.Sentence.bulkCreate(sentences).then((ss) => {
      if (isLast) {
        res.end();
      }
    });
  } else {
    if (isLast) {
      res.end();
    }
  }
}

router.post('/', (req, res) => {
  const paragraphs = req.body.paragraphs;
  paragraphs.forEach((ps, index) => {
    models.Paragraph.create(ps).then((p) => {
      p.update({position: p.id}).then(() => {
        addSentneces(paragraphs, index, ps, p, res);
      });
    });
  });
});

router.post('/insert', (req, res) => {
  const params = req.body;
  if (!params.position) {
    res.end();
  }

  models.Paragraph.update({rank: Sequelize.literal('rank + 1')}, {where: {DocumentId: params.DocumentId, position: params.position, rank: {$gt: params.rank}}}).then((affectedCount, affectedRows) => {
    let data = params;
    data.type = 'PLAIN';
    data.rank += 1;
    models.Paragraph.create(data).then((p) => {
      const sentences = data.sentences;
      if (sentences) {
        sentences.forEach((s) => { s.ParagraphId = p.id; });
        models.Sentence.bulkCreate(sentences).then((ss) => {
          res.end();
        });
      } else {
        res.end();
      }
    });
  });
});

router.put('/', (req, res) => {
  const paragraph = req.body.paragraph;
  models.Paragraph.findById(paragraph.id).then((p) => {
    p.update({comment: paragraph.comment, code: paragraph.code, type: paragraph.type}).then(() => {
      if (!paragraph.Sentences || paragraph.Sentences.length <= 0) {
        res.end();
      }
      paragraph.Sentences.forEach((sentence, index) => {
        const doOnLast = () => {
          if (index == paragraph.Sentences.length - 1) {
            console.log(p);
            res.end();
            // models.Paragraph.findById(paragraph.id, {include: [{model: models.Sentence, include: [{model: models.Selection}]}], order: ['Sentences.id']}).then((result) => {
            //   res.json(result);
            // });
          }
        };
        if (!sentence['id']) {
          sentence.ParagraphId = paragraph.id;
          models.Sentence.create(sentence).then(doOnLast);
        } else {
          models.Sentence.findById(sentence.id).then((s) => {
            if (!sentence.text && !sentence.comment) {
              s.destroy().then(doOnLast)
            } else {
              s.update({ text: sentence.text, comment: sentence.comment }).then(doOnLast);
            }
          });
        }
      });
    });
  });
});

router.delete('/:id', (req, res) => {
  models.Paragraph.findById(req.params.id).then((p) => {
    return p.destroy();
  }).then(() => {
    res.end();
  });
});

module.exports = router;