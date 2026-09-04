import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Full name is required.").max(120),
  company: z.string().trim().min(1, "Company is required.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  location: z.string().trim().max(120).optional(),
  preferredContact: z.enum(["Email", "Phone"]),
  notes: z.string().trim().max(2000).optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;