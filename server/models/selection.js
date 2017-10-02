'use strict';
module.exports = function(sequelize, DataTypes) {
  var Selection = sequelize.define('Selection', {
    offset: DataTypes.INTEGER,
    length: DataTypes.INTEGER,
    comment: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
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