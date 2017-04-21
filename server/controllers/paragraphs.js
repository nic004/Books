'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  return res.json({hello: 'World'});
});

router.post('/', (req, res) => {
  console.log(req.body);
  // const Paragraph = models.Paragraph;
  // Paragraph.findAll().then((res) => {
    // console.log(res);
  // });

  const regex = /\S[^.!?]+[.!?]"?/g
  const str = req.body.content;
  let sentences = [];

  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    sentences.push(m[0]);
  }

  return res.json({sentences: sentences});
});

module.exports = router;