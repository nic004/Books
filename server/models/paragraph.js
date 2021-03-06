'use strict';
module.exports = function(sequelize, DataTypes) {
  var Paragraph = sequelize.define('Paragraph', {
    type: DataTypes.STRING,
    code: DataTypes.STRING,
    comment: DataTypes.STRING,
    position: DataTypes.INTEGER,
    rank: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Paragraph.hasMany(models.Sentence);
        models.Paragraph.belongsTo(models.Document, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Paragraph;
};