import { find } from 'dist/esm/index.solana'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(find('solana', 'raydium').label).toEqual('Raydium')
  });
});
