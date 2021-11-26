import PancakeSwap from 'src/exchanges/pancakeswap'
import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: PancakeSwap.contracts.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: PancakeSwap.contracts.pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: PancakeSwap.contracts.pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider: provider,
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

function mockAmounts({ provider, method, params, amounts }){
  return mock({
    provider,
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
