'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Paragraphs',
      'rank', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Paragraphs', 'rank');
  }
};
