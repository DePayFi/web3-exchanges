import { findByName } from 'src'

describe('findByName', () => {
  
  it('provides a dex by name', () => {
    expect(findByName('uniswap_v2').label).toEqual('Uniswap v2')
    expect(findByName('pancakeswap').label).toEqual('PancakeSwap')
  });
});
