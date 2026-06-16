import { describe, it, expect } from 'vitest';
import { calculateDistance } from './calculateDistance';

describe('calculateDistance', () => {
  it('should return 0 for the same point', () => {
    expect(calculateDistance(13.4, 120.6, 13.4, 120.6)).toBe(0);
  });

  it('should calculate distance between two points correctly', () => {
    // Mamburao to Abra de Ilog (approximate)
    const dist = calculateDistance(13.2201, 120.5976, 13.4542, 120.7291);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(40);
  });
});
