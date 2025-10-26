/**
 * Test file for analytics tracking
 * This file contains sample utility functions to test commit metrics
 */

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return calculateSum(numbers) / numbers.length;
}

export function findMax(numbers: number[]): number | null {
  if (numbers.length === 0) {
    return null;
  }
  return Math.max(...numbers);
}

export function findMin(numbers: number[]): number | null {
  if (numbers.length === 0) {
    return null;
  }
  return Math.min(...numbers);
}

export function sortNumbers(numbers: number[], ascending = true): number[] {
  const sorted = [...numbers].sort((a, b) => a - b);
  return ascending ? sorted : sorted.reverse();
}
