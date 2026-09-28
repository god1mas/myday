import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

export const areaInputSchema = z.object({
  name: z.string().trim().min(1, "Nama area wajib diisi.").max(120, "Nama area terlalu panjang."),
  icon: optionalText(100),
});

export type AreaInput = z.infer<typeof areaInputSchema>;
