import { UniswapV2Factory, UniswapV2Router02 } from '../apis'
import { mock } from 'depay-web3mock'

function mockPair({ tokenIn, tokenOut, pair }) {
  return mock({
    blockchain: 'ethereum',
    call: {
      to: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      api: UniswapV2Factory,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ method, params, amounts }){
  return mock({
    blockchain: 'ethereum',
    call: {
      to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      api: UniswapV2Router02,
      method: method,
      params: params,
      return: amounts
    }
  })
}

export {
  mockPair,
  mockAmounts
}
