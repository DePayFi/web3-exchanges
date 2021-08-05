import { all } from 'src'

describe('all', () => {
  
  it('returns all decentralized exchanges', () => {
    expect(Array.isArray(all)).toEqual(true)
    expect(all.length).toEqual(7)
  });
});
