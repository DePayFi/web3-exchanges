import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, pair }) {
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange[blockchain].pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('99999', 18), ethers.utils.parseUnits('99999', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange[blockchain].pair.api,
      method: 'token0',
      return: tokenIn
    }
  })
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange[blockchain].pair.api,
      method: 'token1',
      return: tokenOut
    }
  })
  return mock({
    provider: provider,
    blockchain,
    request: {
      to: exchange[blockchain].factory.address,
      api: exchange[blockchain].factory.api,
      method: 'getPair',
      params: [tokenIn, tokenOut],
      return: pair
    }
  })
}

function mockAmounts({ blockchain, exchange, block, provider, method, params, amounts }){
  return mock({
    provider,
    blockchain,
    block,
    request: {
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api,
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
