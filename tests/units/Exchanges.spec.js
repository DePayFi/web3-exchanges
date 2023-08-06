import Exchanges from 'src'

describe('Exchanges', () => {
  
  it('returns all available decentralized exchanges', () => {
    expect(Exchanges.ethereum.uniswap_v2.label).toEqual('Uniswap v2')
    expect(Exchanges.bsc.pancakeswap.label).toEqual('PancakeSwap')
    expect(Exchanges.polygon.quickswap.label).toEqual('QuickSwap')
  });
});
