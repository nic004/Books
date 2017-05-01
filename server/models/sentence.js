'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sentence = sequelize.define('Sentence', {
    text: DataTypes.STRING,
    comment: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Sentence.belongsTo(models.Paragraph, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Sentence;
};