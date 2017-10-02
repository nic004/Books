'use strict';
module.exports = function(sequelize, DataTypes) {
  var Selection = sequelize.define('Selection', {
    index: DataTypes.INTEGER,
    length: DataTypes.INTEGER,
    comment: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Sentence.hasMany(models.Selection);
        models.Selection.belongsTo(models.Sentence, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Selection;
};