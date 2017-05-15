'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  models.Paragraph.findAll({where: {DocumentId: req.query.documentId}, include: [{model: models.Sentence}], order: ['Paragraph.id', 'Sentences.id']})
  .then((paragraphs) => {
    res.json({paragraphs: paragraphs});
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

module.exports = router;