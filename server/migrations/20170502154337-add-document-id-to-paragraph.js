'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Paragraphs',
      'DocumentId', {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        allowNull: true,
        references: {
          model: 'Documents',
          key: 'id'
        }
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Paragraphs', 'DocumentId');
  }
};
