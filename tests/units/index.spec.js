import { DEX } from 'dist/cjs/index.js';

describe('depay-decentralized-exchanges', () => {
  
  it('should export a DEX object', () => {
    expect(typeof(DEX)).toBe('object');
  });
});
