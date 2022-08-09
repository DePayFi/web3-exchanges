import { all } from 'src'

describe('all', () => {
  
  it('returns all available decentralized exchanges', () => {
    expect(all.ethereum[0].label).toEqual('Uniswap v2')
    expect(all.bsc[0].label).toEqual('PancakeSwap')
    expect(all.polygon[0].label).toEqual('QuickSwap')
  });
});
