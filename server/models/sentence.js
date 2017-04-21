'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sentence = sequelize.define('Sentence', {
    text: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Sentence;
};