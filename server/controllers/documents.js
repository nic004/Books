'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  models.Document.findAll().then((documents) => {
    res.json({documents: documents});
  });
});

router.post('/', (req, res) => {
  let params = req.body;
  models.Document.create(params).then((d) => {
    res.end();
  });
});

router.put('/', (req, res) => {
  let params = req.body;
  models.Document.findById(params.id).then((d) => {
    d.update({title: params.title}).then(() => {
      res.end();
    });
  });
});

module.exports = router;