import { z } from 'zod';

// UK postcode validation regex - flexible pattern to handle various formats
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

// Name validation schema
export const nameSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: 'Enter your first name' })
    .max(100, { message: 'First name must be 100 characters or fewer' })
    .regex(/^[a-zA-Z\s\-']+$/, { message: 'Name must only include letters, spaces, hyphens and apostrophes' }),
  lastName: z.string()
    .trim()
    .min(1, { message: 'Enter your last name' })
    .max(100, { message: 'Last name must be 100 characters or fewer' })
    .regex(/^[a-zA-Z\s\-']+$/, { message: 'Name must only include letters, spaces, hyphens and apostrophes' })
});

// Date of birth schema with custom validation
export const dateOfBirthSchema = z.object({
  day: z.string().min(1, { message: 'Enter a day' }),
  month: z.string().min(1, { message: 'Enter a month' }),
  year: z.string().min(1, { message: 'Enter a year' })
}).superRefine((data, ctx) => {
  const day = parseInt(data.day);
  const month = parseInt(data.month);
  const year = parseInt(data.year);

  // Individual field validation
  if (isNaN(day) || day < 1 || day > 31) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['day'],
      message: 'Day must be between 1 and 31'
    });
  }

  if (isNaN(month) || month < 1 || month > 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['month'],
      message: 'Month must be between 1 and 12'
    });
  }

  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['year'],
      message: `Year must be between 1900 and ${currentYear}`
    });
  }

  // Date validity check
  if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['day'],
        message: 'Enter a real date'
      });
    } else {
      // Age validation (16+ years old)
      const today = new Date();
      const age = today.getFullYear() - year - (
        today.getMonth() < month - 1 ||
        (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0
      );

      if (age < 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['year'],
          message: 'You must be at least 16 years old'
        });
      }

      if (age > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['year'],
          message: 'Age must be 120 years or less'
        });
      }
    }
  }
});

// Address validation schema
export const addressSchema = z.object({
  address1: z.string()
    .trim()
    .min(1, { message: 'Enter address line 1' })
    .max(200, { message: 'Address line 1 must be 200 characters or fewer' }),
  address2: z.string()
    .trim()
    .max(200, { message: 'Address line 2 must be 200 characters or fewer' })
    .optional()
    .or(z.literal('')),
  townCity: z.string()
    .trim()
    .min(1, { message: 'Enter town or city' })
    .max(100, { message: 'Town or city must be 100 characters or fewer' }),
  county: z.string()
    .trim()
    .max(100, { message: 'County must be 100 characters or fewer' })
    .optional()
    .or(z.literal('')),
  postcode: z.string()
    .trim()
    .min(1, { message: 'Enter postcode' })
    .regex(UK_POSTCODE_REGEX, { message: 'Enter a real postcode' })
});

// Role validation schema
export const roleSchema = z.object({
  role: z.enum(['frontend', 'backend', 'testEngineer', 'other'], {
    errorMap: () => ({ message: 'Select your role' })
  }),
  otherRole: z.string().trim().optional()
}).superRefine((data, ctx) => {
  if (data.role === 'other') {
    if (!data.otherRole || data.otherRole.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Enter your role'
      });
    } else if (data.otherRole.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Role must be at least 2 characters'
      });
    } else if (data.otherRole.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Role must be 100 characters or fewer'
      });
    }
  }
});

// Schema type exports
export type NameFormData = z.infer<typeof nameSchema>;
export type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type RoleFormData = z.infer<typeof roleSchema>;

// Validation helper function
export function validateFormData<T>(schema: z.ZodSchema<T>, data: any): {
  success: boolean;
  data?: T;
  errors?: Record<string, { text: string; href: string }>;
  errorSummary?: Array<{ text: string; href: string }>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, { text: string; href: string }> = {};
  const errorSummary: Array<{ text: string; href: string }> = [];

  for (const error of result.error.errors) {
    const field = error.path[0] as string;
    const errorData = {
      text: error.message,
      href: `#${field}`
    };

    errors[field] = errorData;
    errorSummary.push(errorData);
  }

  return { success: false, errors, errorSummary };
}