'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try{
      // articles
      await queryInterface.bulkInsert(
        "articles",
        Array.from({ length: 50 }).map((_, i) => {
          return {
            id: i+1,
            userId: i%5+1,
            title: `Article-${i}`,
            category: i%4,
            content: `This is content ${i}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        })
      );   
      // messages   
      await queryInterface.bulkInsert(
        "messages",
        Array.from({ length: 50 }).map((_, i) => {
          return {
            id: i+1,
            userId: i%5+1,
            articleId: i%10,
            content: `This is message ${i}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
        {
          transaction,
        }
      );
      await transaction.commit();
    } catch (error) {
      console.log(`執行 seeder 失敗, error: ${error}`);
      await transaction.rollback();
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("articles", null);
  }
};
