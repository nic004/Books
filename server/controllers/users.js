'use strict';

const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(req.body);
  res.json({name: 'nathan', age: 38})
});

router.post('/', (req, res) => {
  console.log(req.body);
  // res.json({name: 'nathan', age: 38})
  res.end();
});

module.exports = router;