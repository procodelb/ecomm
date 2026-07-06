import { NextResponse } from "next/server";
import { z } from "zod";

export function validateBody<T>(schema: z.ZodType<T>, body: unknown): { data?: T; error?: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return {
      error: NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}

export function validateQuery<T>(schema: z.ZodType<T>, query: URLSearchParams): { data?: T; error?: NextResponse } {
  const obj: Record<string, string> = {};
  query.forEach((value, key) => { obj[key] = value; });

  const result = schema.safeParse(obj);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return {
      error: NextResponse.json(
        { error: "Invalid query parameters", details: errors },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const emailSchema = z.string().email().max(255);

export const uuidSchema = z.string().uuid();

export type PaginationInput = z.infer<typeof paginationSchema>;
