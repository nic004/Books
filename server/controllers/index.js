var express = require('express'), 
    router = express.Router(),
    path = require('path');

router.use('/api/paragraphs', require('./paragraphs'));
router.use('/api/sentences', require('./sentences'));

router.get('*', (req, res) => {
  const indexHtml = path.resolve(__dirname + '/../../dist/index.html');
  res.sendFile(indexHtml);
});

module.exports = router