import { all } from 'dist/esm/index.solana'

describe('all', () => {
  
  it('returns all available decentralized exchanges on solana', () => {
    expect(all[0].label).toEqual('Orca')
    expect(all.solana.orca.label).toEqual('Orca')
  });
});
