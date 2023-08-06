import Exchanges from 'dist/esm/index.solana'

describe('Exchanges', () => {
  
  it('returns all available decentralized exchanges on solana', () => {
    expect(Exchanges.solana[0].label).toEqual('Orca')
    expect(Exchanges.solana.orca.label).toEqual('Orca')
  });
});
