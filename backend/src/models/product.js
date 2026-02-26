// HEADER: Defines the Product Sequelize model that maps to the `products` table.
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      inStock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'products',
      timestamps: true
    }
  );

  return Product;
};

/*
BOTTOM EXPLANATION
- Responsibility: Describes product columns, data types, and table metadata for Sequelize runtime usage.
- Key syntax: `sequelize.define('Model', fields, options)` maps JS objects to SQL records.
- Common mistakes: Missing `allowNull: false` on required fields allows unexpected null data.
*/
