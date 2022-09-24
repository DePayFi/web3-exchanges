import UniswapV2 from 'src/exchanges/uniswap_v2'
import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain: 'ethereum',
    request: {
      to: pair,
      api: UniswapV2.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'ethereum',
    request: {
      to: pair,
      api: UniswapV2.pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain: 'ethereum',
    request: {
      to: pair,
      api: UniswapV2.pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider,
    blockchain: 'ethereum',
    request: {
      to: UniswapV2.factory.address,
      api: UniswapV2.factory.api,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ provider, method, params, amounts, block }){
  return mock({
    provider,
    blockchain: 'ethereum',
    request: {
      to: UniswapV2.router.address,
      api: UniswapV2.router.api,
      method: method,
      params: params,
      return: amounts
    },
    block
  })
}

export {
  mockPair,
  mockAmounts
}
