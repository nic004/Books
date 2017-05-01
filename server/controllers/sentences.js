'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

// router.get('/', (req, res) => {
//   models.Paragraph.findAll({include: [{model: models.Sentence}], order: ['Paragraph.id', 'Sentences.id']})
//   .then((paragraphs) => {
//     // paragraphs.forEach((p) => { console.log(
//     //   p.Sentences.map((s) => { return {id: s.id, t: s.text} })); 
//     // })
//     // console.log(paragraphs);
//     res.json({paragraphs: paragraphs});
//   });
// });

router.post('/:id/comment', (req, res) => {
  const c = req.body.comment;
  models.Sentence.update({comment: c}, {fields: ['comment'], where: {id: req.params.id}}).then((s) => {
    res.end();
  });
});

module.exports = router;