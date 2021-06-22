import { DEX } from 'dist/cjs/index.js';

describe('all', () => {
  
  it('returns all decentralized exchanges', () => {
    expect(Array.isArray(DEX.all)).toEqual(true)
    expect(DEX.all.length).toEqual(5)
  });
});
