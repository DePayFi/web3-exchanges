import { all } from 'dist/esm/index.evm'

describe('all', () => {
  
  it('returns all available decentralized exchanges', () => {
    expect(all.ethereum.uniswap_v2.label).toEqual('Uniswap v2')
    expect(all.bsc.pancakeswap.label).toEqual('PancakeSwap')
    expect(all.polygon.quickswap.label).toEqual('QuickSwap')
  });
});
