'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  return res.json({hello: 'World'});
});

router.post('/', (req, res) => {
  const paragraphs = req.body.paragraphs;
  console.log(paragraphs);

  // paragraphs.forEach((p) => {
  //   if (p.type === 'PLAIN') {

  //   } 
  //   else if (p.type === 'CODE') {

  //   }
  // });

  // models.Paragraph.bulkCreate(paragraphs, {individualHooks: true}).then((ps) => {
  //   console.log(ps);
  //   res.end();
  // });
  paragraphs.forEach((ps, index) => {
    models.Paragraph.create(ps).then((p) => {
      let sentences = ps.sentences;
      sentences.forEach((s) => {
        s.ParagraphId = p.id;
      });

      const isLast = index == paragraphs.length - 1;
      models.Sentence.bulkCreate(sentences).then((ss) => {
        // console.log(ss);
        if (isLast) {
          res.end();
        }
      });
    });
  });

  // return res.json({sentences: sentences});
  // return res.end();
});

module.exports = router;