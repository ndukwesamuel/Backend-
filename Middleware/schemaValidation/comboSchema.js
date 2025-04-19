const { z } = require("zod");
const comboProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  image: z.string().optional(),
});

exports.comboSchema = z.object({
  name: z.string().min(1, "Combo name is required"),
  description: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  products: z
    .array(comboProductSchema)
    .min(1, "At least one product is required"),
  image: z.string().optional(),
});
