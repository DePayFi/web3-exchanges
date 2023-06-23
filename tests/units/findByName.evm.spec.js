import { find } from 'dist/esm/index.evm'

describe('find', () => {
  
  it('provides a dex by name', () => {
    expect(find({ blockchain: 'ethereum', name: 'uniswap_v2' }).label).toEqual('Uniswap v2')
    expect(find({ blockchain: 'bsc', name: 'pancakeswap' }).label).toEqual('PancakeSwap')
    expect(find({ blockchain: 'polygon', name: 'quickswap' }).label).toEqual('QuickSwap')
  });
});
