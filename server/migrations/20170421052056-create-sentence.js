'use strict';
module.exports = {
  classMethods: {
    associate: function(models) {
      Sentences.belongsTo(models.Paragraph, {
        onDelete: "CASCADE",
        foreignKey: {
          allowNull: false
        }
      });
    }
  },
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Sentences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      text: {
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
    return queryInterface.dropTable('Sentences');
  }
};