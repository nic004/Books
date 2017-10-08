'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Paragraphs',
      'position', {
        type: Sequelize.STRING
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Paragraphs', 'position');
  }
};
