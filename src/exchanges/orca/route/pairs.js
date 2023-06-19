/*#if _EVM

/*#elif _SOLANA


import { request } from '@depay/web3-client-solana'
import Token from '@depay/web3-tokens-solana'

//#else */

import { request } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

//#endif

import exchange from '../basics'
import { ethers } from 'ethers'
import { getPrice } from './price'

// This method is cached and is only to be used to generally existing pools every 24h
// Do not use for price calulations, fetch accounts for pools individually in order to calculate price 
let getAccounts = async (base, quote) => {
  let accounts = await request(`solana://${exchange.router.v1.address}/getProgramAccounts`, {
    params: { filters: [
      { dataSize: exchange.router.v1.api.span },
      { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }}, // whirlpoolsConfig
      { memcmp: { offset: 101, bytes: base }}, // tokenMintA
      { memcmp: { offset: 181, bytes: quote }} // tokenMintB
    ]},
    api: exchange.router.v1.api,
    cache: 86400, // 24h,
    cacheKey: ['whirlpool', base.toString(), quote.toString()].join('-')
  })
  return accounts
}

let getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
  try {
    let accounts = await getAccounts(tokenIn, tokenOut)
    if(accounts.length === 0) { accounts = await getAccounts(tokenOut, tokenIn) }
    accounts = accounts.filter((account)=>account.data.liquidity.gt(1))
    accounts = (await Promise.all(accounts.map(async(account)=>{
      const { price, tickArrays, sqrtPriceLimit, aToB } = await getPrice({ account, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })
      if(price === undefined) { return false }

      return { // return a copy, do not mutate accounts
        pubkey: account.pubkey,
        price: price,
        tickArrays: tickArrays,
        sqrtPriceLimit: sqrtPriceLimit,
        aToB: aToB,
        data: {
          tokenVaultA: account.data.tokenVaultA, 
          tokenVaultB: account.data.tokenVaultB
        }
      }
    }))).filter(Boolean)
    return accounts
  } catch {
    return []
  }
}

let getHighestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getLowestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getBestPair = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
  const pairs = await getPairsWithPrice({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })

  if(!pairs || pairs.length === 0) { return }

  let bestPair

  if(amountIn || amountInMax) {
    bestPair = getHighestPrice(pairs)
  } else { // amount out
    bestPair = getLowestPrice(pairs)
  }

  return bestPair
}

export {
  getPairsWithPrice,
  getBestPair,
}
