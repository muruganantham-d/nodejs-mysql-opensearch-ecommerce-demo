// HEADER: Initializes all Sequelize models and exports a single DB object.
const sequelize = require('../config/database');
const createProductModel = require('./product');

const Product = createProductModel(sequelize);

module.exports = {
  sequelize,
  Product
};

/*
BOTTOM EXPLANATION
- Responsibility: Creates model instances once and shares them across the app.
- Key syntax: Model factory pattern (`createProductModel(sequelize)`) avoids circular init problems.
- Common mistakes: Creating multiple Sequelize instances can lead to duplicate connections.
*/
