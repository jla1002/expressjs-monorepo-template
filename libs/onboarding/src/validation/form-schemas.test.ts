import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  nameSchema,
  dateOfBirthSchema,
  addressSchema,
  roleSchema,
  validateFormData
} from './form-schemas.js';

describe('nameSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid names', () => {
      const validNames = [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Mary-Jane', lastName: "O'Connor" },
        { firstName: 'Jean Claude', lastName: 'Van Damme' },
        { firstName: 'José', lastName: 'García' },
        { firstName: 'A', lastName: 'B' }, // minimum length
      ];

      validNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });

    it('should trim whitespace from names', () => {
      const input = { firstName: '  John  ', lastName: '  Doe  ' };
      const result = nameSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty names', () => {
      const result = nameSchema.safeParse({ firstName: '', lastName: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(2);
        expect(result.error.errors[0].message).toBe('Enter your first name');
        expect(result.error.errors[1].message).toBe('Enter your last name');
      }
    });

    it('should reject names with invalid characters', () => {
      const invalidNames = [
        { firstName: 'John123', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Doe@email' },
        { firstName: 'John!', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Doe&Co' },
      ];

      invalidNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message.includes('Name must only include letters')
          )).toBe(true);
        }
      });
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      const result = nameSchema.safeParse({ firstName: longName, lastName: 'Doe' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('First name must be 100 characters or fewer');
      }
    });
  });
});

describe('dateOfBirthSchema', () => {
  beforeAll(() => {
    // Mock current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-06-15'));
  });

  describe('valid inputs', () => {
    it('should accept valid dates', () => {
      const validDates = [
        { day: '15', month: '6', year: '1990' }, // 33 years old
        { day: '1', month: '1', year: '2007' },  // 16 years old (minimum)
        { day: '31', month: '12', year: '1950' }, // 72 years old
      ];

      validDates.forEach(date => {
        const result = dateOfBirthSchema.safeParse(date);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty fields', () => {
      const result = dateOfBirthSchema.safeParse({ day: '', month: '', year: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(3);
        expect(result.error.errors.some(e => e.message === 'Enter a day')).toBe(true);
        expect(result.error.errors.some(e => e.message === 'Enter a month')).toBe(true);
        expect(result.error.errors.some(e => e.message === 'Enter a year')).toBe(true);
      }
    });

    it('should reject invalid day values', () => {
      const invalidDays = ['0', '32', 'abc', '-5'];

      invalidDays.forEach(day => {
        const result = dateOfBirthSchema.safeParse({ day, month: '6', year: '1990' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message.includes('Day must be between 1 and 31')
          )).toBe(true);
        }
      });
    });

    it('should reject invalid month values', () => {
      const invalidMonths = ['0', '13', 'abc', '-2'];

      invalidMonths.forEach(month => {
        const result = dateOfBirthSchema.safeParse({ day: '15', month, year: '1990' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message.includes('Month must be between 1 and 12')
          )).toBe(true);
        }
      });
    });

    it('should reject invalid year values', () => {
      const invalidYears = ['1899', '2024', 'abc', '-1990'];

      invalidYears.forEach(year => {
        const result = dateOfBirthSchema.safeParse({ day: '15', month: '6', year });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message.includes('Year must be between 1900 and 2023')
          )).toBe(true);
        }
      });
    });

    it('should reject invalid dates', () => {
      const invalidDates = [
        { day: '31', month: '2', year: '2000' }, // February 31st
        { day: '30', month: '2', year: '2000' }, // February 30th
        { day: '31', month: '4', year: '2000' }, // April 31st
      ];

      invalidDates.forEach(date => {
        const result = dateOfBirthSchema.safeParse(date);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message === 'Enter a real date'
          )).toBe(true);
        }
      });
    });

    it('should reject dates for people under 16', () => {
      const result = dateOfBirthSchema.safeParse({ day: '16', month: '6', year: '2023' }); // Today

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e =>
          e.message === 'You must be at least 16 years old'
        )).toBe(true);
      }
    });

    it('should reject dates for people over 120 years old', () => {
      const result = dateOfBirthSchema.safeParse({ day: '1', month: '1', year: '1900' }); // 123 years old

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e =>
          e.message === 'Age must be 120 years or less'
        )).toBe(true);
      }
    });
  });
});

describe('addressSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid addresses with all fields', () => {
      const address = {
        address1: '123 Test Street',
        address2: 'Apartment 4B',
        townCity: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA'
      };

      const result = addressSchema.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should accept addresses without optional fields', () => {
      const address = {
        address1: '456 Main Road',
        townCity: 'Birmingham',
        postcode: 'B1 1AA'
      };

      const result = addressSchema.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should accept various UK postcode formats', () => {
      const validPostcodes = [
        'SW1A 1AA', 'M1 1AA', 'B33 8TH', 'W1A 0AX', 'EC1A 1BB',
        'SW1A1AA', 'M11AA', 'B338TH' // No spaces
      ];

      validPostcodes.forEach(postcode => {
        const address = {
          address1: '123 Test Street',
          townCity: 'London',
          postcode
        };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(true);
      });
    });

    it('should trim whitespace from fields', () => {
      const address = {
        address1: '  123 Test Street  ',
        address2: '  Apartment 4B  ',
        townCity: '  London  ',
        county: '  Greater London  ',
        postcode: '  SW1A 1AA  '
      };

      const result = addressSchema.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.address1).toBe('123 Test Street');
        expect(result.data.address2).toBe('Apartment 4B');
        expect(result.data.townCity).toBe('London');
        expect(result.data.county).toBe('Greater London');
        expect(result.data.postcode).toBe('SW1A 1AA');
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing required fields', () => {
      const result = addressSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Enter address line 1')).toBe(true);
        expect(result.error.errors.some(e => e.message === 'Enter town or city')).toBe(true);
        expect(result.error.errors.some(e => e.message === 'Enter postcode')).toBe(true);
      }
    });

    it('should reject invalid postcodes', () => {
      const invalidPostcodes = [
        'INVALID', '12345', 'ABC DEF', 'SW1A 1AAA', 'SW1A', 'A1A 1A'
      ];

      invalidPostcodes.forEach(postcode => {
        const address = {
          address1: '123 Test Street',
          townCity: 'London',
          postcode
        };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e =>
            e.message === 'Enter a real postcode'
          )).toBe(true);
        }
      });
    });

    it('should reject fields that are too long', () => {
      const longAddress = {
        address1: 'a'.repeat(201),
        address2: 'b'.repeat(201),
        townCity: 'c'.repeat(101),
        county: 'd'.repeat(101),
        postcode: 'SW1A 1AA'
      };

      const result = addressSchema.safeParse(longAddress);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e =>
          e.message === 'Address line 1 must be 200 characters or fewer'
        )).toBe(true);
        expect(result.error.errors.some(e =>
          e.message === 'Address line 2 must be 200 characters or fewer'
        )).toBe(true);
        expect(result.error.errors.some(e =>
          e.message === 'Town or city must be 100 characters or fewer'
        )).toBe(true);
        expect(result.error.errors.some(e =>
          e.message === 'County must be 100 characters or fewer'
        )).toBe(true);
      }
    });
  });
});

describe('roleSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid role selections', () => {
      const validRoles = [
        { role: 'frontend' },
        { role: 'backend' },
        { role: 'testEngineer' },
      ];

      validRoles.forEach(roleData => {
        const result = roleSchema.safeParse(roleData);
        expect(result.success).toBe(true);
      });
    });

    it('should accept other role with valid description', () => {
      const roleData = { role: 'other', otherRole: 'DevOps Engineer' };
      const result = roleSchema.safeParse(roleData);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing role selection', () => {
      const result = roleSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Select your role')).toBe(true);
      }
    });

    it('should reject invalid role values', () => {
      const result = roleSchema.safeParse({ role: 'invalid-role' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Select your role')).toBe(true);
      }
    });

    it('should reject other role without description', () => {
      const result = roleSchema.safeParse({ role: 'other' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Enter your role')).toBe(true);
      }
    });

    it('should reject other role with empty description', () => {
      const result = roleSchema.safeParse({ role: 'other', otherRole: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Enter your role')).toBe(true);
      }
    });

    it('should reject other role description that is too short', () => {
      const result = roleSchema.safeParse({ role: 'other', otherRole: 'A' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e =>
          e.message === 'Role must be at least 2 characters'
        )).toBe(true);
      }
    });

    it('should reject other role description that is too long', () => {
      const longRole = 'a'.repeat(101);
      const result = roleSchema.safeParse({ role: 'other', otherRole: longRole });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e =>
          e.message === 'Role must be 100 characters or fewer'
        )).toBe(true);
      }
    });
  });
});

describe('validateFormData', () => {
  it('should return success for valid data', () => {
    const validName = { firstName: 'John', lastName: 'Doe' };
    const result = validateFormData(nameSchema, validName);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validName);
    expect(result.errors).toBeUndefined();
    expect(result.errorSummary).toBeUndefined();
  });

  it('should return formatted errors for invalid data', () => {
    const invalidName = { firstName: '', lastName: 'Doe123' };
    const result = validateFormData(nameSchema, invalidName);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errorSummary).toBeDefined();

    if (result.errors && result.errorSummary) {
      expect(result.errors.firstName).toEqual({
        text: 'Enter your first name',
        href: '#firstName'
      });
      expect(result.errors.lastName).toEqual({
        text: 'Name must only include letters, spaces, hyphens and apostrophes',
        href: '#lastName'
      });
      expect(result.errorSummary).toHaveLength(2);
      expect(result.errorSummary[0]).toEqual({
        text: 'Enter your first name',
        href: '#firstName'
      });
    }
  });

  it('should handle multiple errors per field correctly', () => {
    const invalidDate = { day: '', month: '13', year: '1800' };
    const result = validateFormData(dateOfBirthSchema, invalidDate);

    expect(result.success).toBe(false);
    if (result.errors && result.errorSummary) {
      expect(Object.keys(result.errors)).toContain('day');
      expect(Object.keys(result.errors)).toContain('month');
      expect(Object.keys(result.errors)).toContain('year');
      expect(result.errorSummary.length).toBeGreaterThan(0);
    }
  });
});