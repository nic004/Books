'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.post('/', (req, res) => {
  // const c = req.body.comment;
  // const sentenceId = req.params.id;
  const selections = req.body.selections;
  selections.forEach((s, index) => {
    models.Selection.create(s).then((selection) => {
      const isLast = index == selections.length - 1;
      if (isLast) {
        res.end();
      }
    });
  });
});

module.exports = router;