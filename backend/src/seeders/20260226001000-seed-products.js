// HEADER: Seeder that inserts sample products for realistic search practice.
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('products', [
      { name: 'Runner Pro Shoes', brand: 'Nike', category: 'Shoes', description: 'Lightweight running shoes with breathable mesh upper', price: 129.99, rating: 4.6, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Street Flex Sneakers', brand: 'Adidas', category: 'Shoes', description: 'Daily wear sneakers designed for city comfort', price: 99.99, rating: 4.2, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Trail Climber Boots', brand: 'Columbia', category: 'Shoes', description: 'Water-resistant boots made for mountain trails', price: 179.0, rating: 4.4, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Urban Denim Jacket', brand: 'Levis', category: 'Clothing', description: 'Classic denim jacket with modern fit', price: 89.5, rating: 4.1, inStock: true, createdAt: now, updatedAt: now },
      { name: 'WindShield Running Jacket', brand: 'Puma', category: 'Clothing', description: 'Windproof jacket for joggers and cyclists', price: 149.0, rating: 4.5, inStock: false, createdAt: now, updatedAt: now },
      { name: 'Cotton Comfort T-Shirt', brand: 'Uniqlo', category: 'Clothing', description: 'Soft cotton t-shirt for everyday wear', price: 19.99, rating: 4.0, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Noise Cancel Pro Headphones', brand: 'Sony', category: 'Electronics', description: 'Over-ear noise canceling headphones with rich bass', price: 349.99, rating: 4.8, inStock: true, createdAt: now, updatedAt: now },
      { name: 'SoundBeat Earbuds', brand: 'JBL', category: 'Electronics', description: 'Wireless earbuds with long battery life', price: 79.0, rating: 4.3, inStock: true, createdAt: now, updatedAt: now },
      { name: 'SmartFit Fitness Band', brand: 'Xiaomi', category: 'Electronics', description: 'Fitness tracker with heart rate and sleep monitoring', price: 59.99, rating: 4.1, inStock: true, createdAt: now, updatedAt: now },
      { name: 'HomeBrew Coffee Maker', brand: 'Philips', category: 'Home Appliances', description: 'Automatic coffee machine with reusable filter', price: 249.0, rating: 4.5, inStock: false, createdAt: now, updatedAt: now },
      { name: 'Kitchen Plus Blender', brand: 'Hamilton', category: 'Home Appliances', description: 'High-speed blender for smoothies and soups', price: 119.49, rating: 4.2, inStock: true, createdAt: now, updatedAt: now },
      { name: 'AirCool Table Fan', brand: 'Honeywell', category: 'Home Appliances', description: 'Compact oscillating fan with silent mode', price: 49.95, rating: 3.9, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Pixel View Smartphone', brand: 'Google', category: 'Mobiles', description: 'Android smartphone with AI camera tools', price: 799.0, rating: 4.7, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Galaxy Vision Phone', brand: 'Samsung', category: 'Mobiles', description: 'High refresh display and pro camera system', price: 999.99, rating: 4.6, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Budget Lite Phone', brand: 'Motorola', category: 'Mobiles', description: 'Affordable smartphone with all-day battery', price: 219.99, rating: 4.0, inStock: true, createdAt: now, updatedAt: now },
      { name: 'ProType Mechanical Keyboard', brand: 'Logitech', category: 'Computers', description: 'Mechanical keyboard with tactile switches', price: 139.99, rating: 4.5, inStock: true, createdAt: now, updatedAt: now },
      { name: 'UltraWide 27 Monitor', brand: 'Dell', category: 'Computers', description: '27 inch monitor with vivid colors and USB-C', price: 329.0, rating: 4.4, inStock: false, createdAt: now, updatedAt: now },
      { name: 'SwiftBook Laptop 14', brand: 'Acer', category: 'Computers', description: 'Portable laptop for students and office work', price: 649.0, rating: 4.2, inStock: true, createdAt: now, updatedAt: now },
      { name: 'Active Yoga Mat', brand: 'Reebok', category: 'Sports', description: 'Non-slip yoga mat with medium cushioning', price: 39.99, rating: 4.3, inStock: true, createdAt: now, updatedAt: now },
      { name: 'PowerGrip Dumbbell Set', brand: 'Decathlon', category: 'Sports', description: 'Adjustable dumbbell kit for home workouts', price: 189.0, rating: 4.6, inStock: true, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  }
};

/*
BOTTOM EXPLANATION
- Responsibility: Loads sample catalog data so search and filter features can be tested quickly.
- Key syntax: `bulkInsert` adds many rows in one DB call; `bulkDelete` removes them during rollback.
- Common mistakes: Forgetting `createdAt` and `updatedAt` values causes insert errors on timestamped tables.
*/
