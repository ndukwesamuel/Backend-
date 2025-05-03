const z = require("zod");
exports.orderSchema = z.object({
  selectedCartItems: z
    .array(
      z.object({
        productId: z.object({
          _id: z.string(),
          name: z.string(),
          description: z.string(),
          image: z.string().url(),
          price: z.number(),
          slug: z.string(),
          country: z.string(),
        }),
        quantity: z.number().min(1),
      })
    )
    .nonempty(),
  deliveryFee: z.number().min(0),
  shippingDetails: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    street: z.string().min(1, "Street is required"),
    area: z.string().min(1, "Area is required"),
    additionalInfo: z.string().optional(),
  }),
  paymentMethod: z.enum(["wallet", "bnpl"]),
});
