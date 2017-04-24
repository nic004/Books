'use strict';
module.exports = function(sequelize, DataTypes) {
  var Paragraph = sequelize.define('Paragraph', {
    type: DataTypes.STRING,
    code: DataTypes.STRING,
    comment: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Paragraph.hasMany(models.Sentence);
      }
    }
  });
  return Paragraph;
};