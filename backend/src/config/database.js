// HEADER: Creates and exports the Sequelize instance used by runtime services.
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;

/*
BOTTOM EXPLANATION
- Responsibility: Initializes the runtime MySQL connection through Sequelize ORM.
- Key syntax: `new Sequelize(database, username, password, options)` creates a reusable DB client.
- Common mistakes: Using string for port is okay, but invalid host/user/password breaks authenticate/query calls.
*/
