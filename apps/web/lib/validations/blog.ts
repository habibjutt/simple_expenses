import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const BlogCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .transform(sanitizeString),
  description: z
    .string()
    .max(500, "Description is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  color: z.string().min(1, "Color is required"),
});

export const UpdateBlogCategorySchema = BlogCategorySchema.partial();

export type BlogCategoryInput = z.infer<typeof BlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof UpdateBlogCategorySchema>;

export const BlogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug is too long")
    .transform(sanitizeString),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt is too long")
    .transform(sanitizeString),
  content: z.string().min(1, "Content is required"),
  featuredImage: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"] as const, {
    error: 'Status must be "draft" or "published"',
  }),
  categoryId: z.string().optional().nullable(),
  metaTitle: z
    .string()
    .max(70, "Meta title is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  ogImage: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional()
    .nullable(),
});

export const UpdateBlogPostSchema = BlogPostSchema.partial();

export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>;
