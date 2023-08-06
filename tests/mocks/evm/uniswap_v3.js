import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, fee, pair }) {
  mock({
    provider,
    blockchain,
    request: {
      to: exchange[blockchain].factory.address,
      api: exchange[blockchain].factory.api,
      method: 'getPool',
      params: [tokenIn, tokenOut, fee],
      return: pair
    }
  })
  mock({
    provider,
    blockchain,
    request: {
      to: exchange[blockchain].factory.address,
      api: exchange[blockchain].factory.api,
      method: 'getPool',
      params: [tokenOut, tokenIn, fee],
      return: pair
    }
  })
}

function mockAmounts({ blockchain, exchange, block, provider, method, params, amount }){
  return mock({
    provider,
    blockchain,
    block,
    request: {
      to: exchange[blockchain].quoter.address,
      api: exchange[blockchain].quoter.api,
      method: method,
      params: params,
      return: [amount, ['185849718823265608423170047175'], ['0'], '80518']
    }
  })
}

export {
  mockPair,
  mockAmounts
}
