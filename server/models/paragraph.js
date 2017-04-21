'use strict';
module.exports = function(sequelize, DataTypes) {
  var Paragraph = sequelize.define('Paragraph', {
    comment: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Paragraph;
};