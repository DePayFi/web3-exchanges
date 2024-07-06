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
  const scaledParams = [...params]
  scaledParams[scaledParams.length-1] = scaledParams[scaledParams.length-1].mul(ethers.BigNumber.from(10))
  mock({
    provider,
    blockchain,
    block,
    request: {
      to: exchange[blockchain].quoter.address,
      api: exchange[blockchain].quoter.api,
      method: method,
      params: scaledParams,
      return: [amount._hex ? amount.mul(ethers.BigNumber.from(10)) : amount*10, ['185849718823265608423170047175'], ['0'], '80518']
    }
  })
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
