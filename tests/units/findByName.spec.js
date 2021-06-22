import { DEX } from 'dist/cjs/index.js';

describe('findByName', () => {
  
  it('provides a dex by name', () => {
    expect(DEX.findByName('uniswap_v2').label).toEqual('Uniswap v2')
    expect(DEX.findByName('uniswap_v3').label).toEqual('Uniswap v3')
    expect(DEX.findByName('uniswap').label).toEqual('Uniswap v3')
    expect(DEX.findByName('curve').label).toEqual('Curve')
    expect(DEX.findByName('sushiswap').label).toEqual('SushiSwap')
    expect(DEX.findByName('sushi').label).toEqual('SushiSwap')
    expect(DEX.findByName('pancakeswap').label).toEqual('PancakeSwap')
    expect(DEX.findByName('pancake').label).toEqual('PancakeSwap')
  });
});
