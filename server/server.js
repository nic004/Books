const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('./models');
const path = require('path');
const controllers = require('./controllers');

app.use(express.static(path.resolve(__dirname + '/../')));
app.use(express.static(path.resolve(__dirname + '/../dist')));
app.use('static', express.static(path.resolve(__dirname + '/../static')));

console.log(path.resolve(__dirname + '/../static'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    next();
});

app.use(function (req, res, next) {
  res.header("Content-Type",'application/json');
  next();
});

app.use(controllers);

const port = process.env.PORT || 3000;

models.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log('app listening on', port);
  });
});
