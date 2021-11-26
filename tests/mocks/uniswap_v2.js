import UniswapV2 from 'src/exchanges/uniswap_v2'
import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain: 'ethereum',
    call: {
      to: pair,
      api: UniswapV2.contracts.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'ethereum',
    call: {
      to: pair,
      api: UniswapV2.contracts.pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain: 'ethereum',
    call: {
      to: pair,
      api: UniswapV2.contracts.pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider,
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

function mockAmounts({ provider, method, params, amounts }){
  return mock({
    provider,
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
