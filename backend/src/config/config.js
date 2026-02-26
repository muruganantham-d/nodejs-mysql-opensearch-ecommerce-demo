// HEADER: Sequelize environment config used by sequelize-cli for migrations and seeders.
require('dotenv').config();

const sharedConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false
};

module.exports = {
  development: {
    ...sharedConfig,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  },
  test: {
    ...sharedConfig,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  },
  production: {
    ...sharedConfig,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  }
};

/*
BOTTOM EXPLANATION
- Responsibility: Supplies DB connection settings per environment for sequelize-cli commands.
- Key syntax: `module.exports = { development, test, production }` is the expected sequelize-cli shape.
- Common mistakes: Mismatched DB credentials here cause migrations and seeders to fail.
*/
