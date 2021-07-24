import { mock } from 'depay-web3mock'
import UniswapV2 from '../../src/exchanges/uniswap_v2'

function mockPair({ tokenIn, tokenOut, pair }) {
  return mock({
    blockchain: 'ethereum',
    call: {
      to: UniswapV2.contracts.factory.address,
      api: UniswapV2.contracts.factory.api,
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
      to: UniswapV2.contracts.router.address,
      api: UniswapV2.contracts.router.api,
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
