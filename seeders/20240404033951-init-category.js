'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
        "categories",
        [
          {
            id: 1,
            name: "無分類"
          },
          {
            id: 2,
            name: "HTML"
          },
          {
            id: 3,
            name: "CSS"
          },
          {
            id: 4,
            name: "JavaScript"
          },
        ]
      );
  },

  async down (queryInterface, Sequelize) {    
    await queryInterface.bulkDelete("categories", null);
  }
};
