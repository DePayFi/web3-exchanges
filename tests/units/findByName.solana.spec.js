import Exchanges from 'dist/esm/index.solana'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(Exchanges.orca.label).toEqual('Orca')
  });
});
