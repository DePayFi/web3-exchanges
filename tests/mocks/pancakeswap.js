import { mock } from 'depay-web3-mock'
import PancakeSwap from '../../src/exchanges/pancakeswap'

function mockPair({ tokenIn, tokenOut, pair }) {
  return mock({
    blockchain: 'bsc',
    call: {
      to: PancakeSwap.contracts.factory.address,
      api: PancakeSwap.contracts.factory.api,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ method, params, amounts }){
  return mock({
    blockchain: 'bsc',
    call: {
      to: PancakeSwap.contracts.router.address,
      api: PancakeSwap.contracts.router.api,
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
