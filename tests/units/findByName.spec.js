import Exchanges from 'src'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(Exchanges.uniswap_v2.label).toEqual('Uniswap v2')
    expect(Exchanges.pancakeswap.label).toEqual('PancakeSwap')
    expect(Exchanges.quickswap.label).toEqual('QuickSwap')
  });
});
