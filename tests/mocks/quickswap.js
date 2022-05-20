import QuickSwap from 'src/exchanges/quickswap'
import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain: 'polygon',
    call: {
      to: pair,
      api: QuickSwap.contracts.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'polygon',
    call: {
      to: pair,
      api: QuickSwap.contracts.pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain: 'polygon',
    call: {
      to: pair,
      api: QuickSwap.contracts.pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider,
    blockchain: 'polygon',
    call: {
      to: QuickSwap.contracts.factory.address,
      api: QuickSwap.contracts.factory.api,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ provider, method, params, amounts }){
  return mock({
    provider,
    blockchain: 'polygon',
    call: {
      to: QuickSwap.contracts.router.address,
      api: QuickSwap.contracts.router.api,
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
