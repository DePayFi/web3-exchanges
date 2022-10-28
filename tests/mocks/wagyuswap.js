import WagyuSwap from 'src/exchanges/wagyuswap'
import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain: 'velas',
    request: {
      to: pair,
      api: WagyuSwap.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'velas',
    request: {
      to: pair,
      api: WagyuSwap.pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain: 'velas',
    request: {
      to: pair,
      api: WagyuSwap.pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider: provider,
    blockchain: 'velas',
    request: {
      to: WagyuSwap.factory.address,
      api: WagyuSwap.factory.api,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ provider, method, params, amounts }){
  return mock({
    provider,
    blockchain: 'velas',
    request: {
      to: WagyuSwap.router.address,
      api: WagyuSwap.router.api,
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
