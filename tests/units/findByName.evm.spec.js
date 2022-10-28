import { find } from 'src/index.evm'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(find('ethereum', 'uniswap_v2').label).toEqual('Uniswap v2')
    expect(find('bsc', 'pancakeswap').label).toEqual('PancakeSwap')
    expect(find('polygon', 'quickswap').label).toEqual('QuickSwap')
  });
});
