import { findByName } from 'src'

describe('findByName', () => {
  
  it('provides a dex by name', () => {
    expect(findByName('uniswap_v2').label).toEqual('Uniswap v2')
    expect(findByName('uniswap_v3').label).toEqual('Uniswap v3')
    expect(findByName('uniswap').label).toEqual('Uniswap v3')
    expect(findByName('curve').label).toEqual('Curve')
    expect(findByName('sushiswap').label).toEqual('SushiSwap')
    expect(findByName('sushi').label).toEqual('SushiSwap')
    expect(findByName('pancakeswap').label).toEqual('PancakeSwap')
    expect(findByName('pancake').label).toEqual('PancakeSwap')
  });
});
