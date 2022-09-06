import Raydium from 'src/exchanges/raydium'
import { Buffer } from '@depay/solana-web3.js'
import { mock } from '@depay/web3-mock'
import { provider } from '@depay/web3-client'

let blockchain = 'solana'

function mockPair({ tokenIn, tokenOut, pair }) {
  if(!pair) {
    mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenOut }},
          { memcmp: { offset: 432, bytes: tokenIn }},
        ]},
        return: []
      }
    })
    mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenIn }},
          { memcmp: { offset: 432, bytes: tokenOut }},
        ]},
        return: []
      }
    })
    return
  }
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      method: 'getProgramAccounts',
      to: Raydium.pair.v4.address,
      params: { filters: [
        { dataSize: Raydium.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: tokenIn }},
        { memcmp: { offset: 432, bytes: tokenOut }},
      ]},
      return: [{ account: { data: new Buffer([]), executable: false, lamports: 2039280, owner: tokenIn, rentEpoch: 327 }, pubkey: pair }]
    }
  })
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      method: 'getProgramAccounts',
      to: Raydium.pair.v4.address,
      params: { filters: [
        { dataSize: Raydium.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: tokenOut }},
        { memcmp: { offset: 432, bytes: tokenIn }},
      ]},
      return: []
    }
  })
}

export {
  mockPair
}
