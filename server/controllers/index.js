var express = require('express'), 
    router = express.Router(),
    path = require('path');

router.use('/api/paragraphs', require('./paragraphs'));
router.use('/api/sentences', require('./sentences'));
router.use('/api/documents', require('./documents'));
router.use('/api/users', require('./users'));

router.get('*', (req, res) => {
  const indexHtml = path.resolve(__dirname + '/../../dist/index.html');
  res.sendFile(indexHtml);
});

module.exports = router