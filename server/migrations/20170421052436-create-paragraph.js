'use strict';
module.exports = {
  classMethods: {
    associate: function(models) {
      Paragraphs.hasMany(models.Setence);
    }
  },
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Paragraphs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      comment: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Paragraphs');
  }
};