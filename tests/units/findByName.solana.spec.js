import { find } from 'dist/esm/index.solana'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(find({ blockchain: 'solana', name: 'orca' }).label).toEqual('Orca')
  });
});
