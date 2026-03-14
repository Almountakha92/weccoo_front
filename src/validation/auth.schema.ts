import { z } from 'zod'

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Le nom complet doit contenir au moins 3 caracteres.'),
  university: z
    .string()
    .trim()
    .min(2, "Le nom de l'universite est requis."),
  email: z
    .string()
    .trim()
    .email('Email universitaire invalide.'),
  whatsappPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Numero WhatsApp invalide.'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres.')
})

export type SignupFormSchema = z.infer<typeof signupSchema>
