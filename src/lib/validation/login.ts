import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi.").max(100),
  password: z.string().min(1, "Password wajib diisi.").max(1024),
});

export type LoginInput = z.infer<typeof loginSchema>;
