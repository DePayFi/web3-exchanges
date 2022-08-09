import { findByName } from 'src'

describe('findByName', () => {
  
  it('provides a dex by name', () => {
    expect(findByName('ethereum', 'uniswap_v2').label).toEqual('Uniswap v2')
    expect(findByName('bsc', 'pancakeswap').label).toEqual('PancakeSwap')
    expect(findByName('polygon', 'quickswap').label).toEqual('QuickSwap')
  });
});
