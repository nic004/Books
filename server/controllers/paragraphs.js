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
  // paragraphs.forEach((ps) => {
    const ps = paragraphs[0];
    models.Paragraph.create(ps, { include: [models.Sentence] }).then((p) => {
      console.log(p);
    }).catch((errors) => {
      console.log(errors);
    });
  // });


  // const Paragraph = models.Paragraph;
  // Paragraph.findAll().then((res) => {
    // console.log(res);
  // });

  // const regex = /\S[^.!?]+[.!?]"?/g
  // const str = req.body.content;
  // let sentences = [];

  // let m;
  // while ((m = regex.exec(str)) !== null) {
  //   if (m.index === regex.lastIndex) {
  //     regex.lastIndex++;
  //   }
  //   sentences.push(m[0]);
  // }

  // return res.json({sentences: sentences});
  // return res.end();
});

module.exports = router;