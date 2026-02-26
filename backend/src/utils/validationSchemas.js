// HEADER: Zod schemas for validating product API request payloads.
const { z } = require('zod');

const baseProductShape = {
  name: z.string().trim().min(1, 'name is required'),
  brand: z.string().trim().min(1, 'brand is required'),
  category: z.string().trim().min(1, 'category is required'),
  description: z.string().trim().optional(),
  price: z.number({ invalid_type_error: 'price must be a number' }).positive('price must be greater than 0'),
  rating: z.number({ invalid_type_error: 'rating must be a number' }).min(0).max(5).optional(),
  inStock: z.boolean({ invalid_type_error: 'inStock must be a boolean' }).optional()
};

const createProductSchema = z.object({
  body: z.object(baseProductShape)
});

const updateProductSchema = z.object({
  body: z
    .object({
      name: baseProductShape.name.optional(),
      brand: baseProductShape.brand.optional(),
      category: baseProductShape.category.optional(),
      description: baseProductShape.description,
      price: baseProductShape.price.optional(),
      rating: baseProductShape.rating,
      inStock: baseProductShape.inStock
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
});

module.exports = {
  createProductSchema,
  updateProductSchema
};

/*
BOTTOM EXPLANATION
- Responsibility: Ensures product create/update payloads are clean and beginner-friendly error messages are returned.
- Key syntax: `z.object({...}).refine(...)` adds custom rules after field-level validation.
- Common mistakes: Passing numbers as strings in JSON causes type errors unless converted before validation.
*/
