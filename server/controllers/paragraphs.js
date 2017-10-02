'use strict';

const express = require('express');
const models = require('../models');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res) => {
  models.Paragraph.findAll({where: {DocumentId: req.query.documentId}, include: [{model: models.Sentence, include: [{model: models.Selection}]}], order: ['Paragraph.id', 'Sentences.id']})
  .then((paragraphs) => {
    res.json({paragraphs: paragraphs});
  });
});

router.get('/captures', (req, res) => {
  const dir = path.resolve(__dirname + '/../../static/images/captures/');
  fs.readdir(dir, (err, files) => {
    const pngs = files.filter((file) => /.+\.(png|jpg|jpeg)/i.test(file)).map((img) => `/static/images/captures/${img}`);
    res.json({urls: pngs});
  });
});

router.get('/:id', (req, res) => {
  models.Paragraph.findAll({where: {id: req.params.id}, include: [{model: models.Sentence}], order: ['Paragraph.id', 'Sentences.id']})
  .then((paragraphs) => {
    res.json(paragraphs[0]);
  });
});


router.post('/', (req, res) => {
  const paragraphs = req.body.paragraphs;
  paragraphs.forEach((ps, index) => {
    models.Paragraph.create(ps).then((p) => {
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
            res.end();
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