import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const reviewSchema = z
  .object({
    dealershipId: z.string().cuid(),
    reviewCategory: z.enum(["SALES_FINANCING", "SERVICE_PARTS"]),
    overallRating: z.number().int().min(1).max(5),
    ratingTransparency: z.number().int().min(1).max(5).optional(),
    ratingPricing: z.number().int().min(1).max(5).optional(),
    ratingService: z.number().int().min(1).max(5).optional(),
    ratingDelivery: z.number().int().min(1).max(5).optional(),
    ratingAfterSales: z.number().int().min(1).max(5).optional(),
    wouldRecommend: z.boolean().optional(),
    title: z.string().min(5).max(200),
    body: z.string().min(50).max(5000),
    salesConsultantName: z.string().min(1).max(100).optional(),
    serviceAdvisorName: z.string().min(1).max(100).optional(),
    serviceRendered: z.string().min(1).max(200).optional(),
    vehicleMake: z.string().max(100).optional(),
    vehicleModel: z.string().max(100).optional(),
    vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
    vehicleVin: z.string().max(17).optional(),
    visitDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reviewCategory === "SALES_FINANCING") {
      if (!data.salesConsultantName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sales consultant name is required",
          path: ["salesConsultantName"],
        });
      }
      if (!data.vehicleModel?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vehicle model bought is required",
          path: ["vehicleModel"],
        });
      }
    }
    if (data.reviewCategory === "SERVICE_PARTS") {
      if (!data.serviceAdvisorName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Service advisor name is required",
          path: ["serviceAdvisorName"],
        });
      }
      if (!data.serviceRendered?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Service rendered is required",
          path: ["serviceRendered"],
        });
      }
    }
  });

export const reviewResponseSchema = z.object({
  body: z.string().min(10).max(2000),
  isResolved: z.boolean().optional(),
});

export const dealershipSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  category: z.enum(["NEW_VEHICLE", "USED_VEHICLE", "LUXURY", "COMMERCIAL", "MOTORCYCLE", "EV", "MULTI_BRAND"]),
  logoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  coverImageUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  businessHours: z.string().max(1000).optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  inventoryUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  address: z.string().max(500).optional(),
  cityName: z.string().max(100).optional(),
  stateName: z.string().max(100).optional(),
  countryId: z.string().cuid(),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  brandIds: z.array(z.string().cuid()).optional(),
  yearEstablished: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

export const claimSchema = z.object({
  dealershipId: z.string().cuid(),
  businessEmail: z.string().email(),
  businessPhone: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  documentUrl: z.string().url("Please upload a proof of ownership document"),
});

export const reportSchema = z.object({
  reason: z.enum(["FAKE_REVIEW", "SPAM", "OFFENSIVE_CONTENT", "CONFLICT_OF_INTEREST", "WRONG_BUSINESS", "OTHER"]),
  description: z.string().max(1000).optional(),
  reviewId: z.string().cuid().optional(),
  dealerId: z.string().cuid().optional(),
});

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  location: z.string().max(120).optional(),
  country: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  category: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["rating", "reviews", "newest", "relevance", "reputation"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;
export type DealershipInput = z.infer<typeof dealershipSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
