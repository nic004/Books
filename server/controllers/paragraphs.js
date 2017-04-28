'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  models.Paragraph.findAll({include: [{model: models.Sentence}], order: ['Paragraph.id', 'Sentences.id']})
  .then((paragraphs) => {
    paragraphs.forEach((p) => { console.log(
      p.Sentences.map((s) => { return {id: s.id, t: s.text} })); 
    })
    // console.log(paragraphs);
    res.json({paragraphs: paragraphs});
  });
});

router.post('/', (req, res) => {
  const paragraphs = req.body.paragraphs;
  paragraphs.forEach((ps, index) => {
    models.Paragraph.create(ps).then((p) => {
      let sentences = ps.sentences;
      sentences.forEach((s) => {
        s.ParagraphId = p.id;
      });

      const isLast = index == paragraphs.length - 1;
      models.Sentence.bulkCreate(sentences).then((ss) => {
        if (isLast) {
          res.end();
        }
      });
    });
  });

});

module.exports = router;