import { all } from 'dist/cjs/index.js';

describe('all', () => {
  
  it('returns all decentralized exchanges', () => {
    expect(Array.isArray(all)).toEqual(true)
    expect(all.length).toEqual(5)
  });
});
