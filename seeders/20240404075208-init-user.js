'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      // uers
      await queryInterface.bulkInsert(
        'users',
        [
          {
            id: 1,
            name: 'Henry',
            email: 'henry@articlecamp.com',
            password: 'password',
            image: 'icons8-h-100.png',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            name: 'Alex',
            email: 'alex@articlecamp.com',
            password: 'password',
            image: 'icons8-a-100.png',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 3,
            name: 'ShangRuey',
            email: 'shang-ruey@articlecamp.com',
            password: 'password',
            image: 'icons8-s-100.png',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 4,
            name: 'Louis',
            email: 'louis@articlecamp.com',
            password: 'password',
            image: 'icons8-l-100.png',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 5,
            name: 'Peggy',
            email: 'peggy@articlecamp.com',
            password: 'password',
            image: 'icons8-p-100.png',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          transaction,
        }
      )
      // follows
      await queryInterface.bulkInsert(
        'follows',
        [
          {
            id: 1,
            userId: 2,
            followTo: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            userId: 3,
            followTo: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 3,
            userId: 4,
            followTo: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 4,
            userId: 5,
            followTo: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 5,
            userId: 3,
            followTo: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 6,
            userId: 3,
            followTo: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 7,
            userId: 2,
            followTo: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          transaction,
        }
      )
      await transaction.commit()
    } catch (error) {
      console.log(`執行 seeder 失敗, error: ${error}`)
      await transaction.rollback()
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null)
    await queryInterface.bulkDelete('follows', null)
  },
}
