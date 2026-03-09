import { z } from "zod";

export const GetAdminVerificationRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const UpdateAdminVerificationStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});
