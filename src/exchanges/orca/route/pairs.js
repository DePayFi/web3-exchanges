/*#if _EVM

/*#elif _SOLANA


import { request } from '@depay/web3-client-solana'
import { Token } from '@depay/web3-tokens-solana'

//#else */

import { request } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

//#endif

import exchange from '../basics'
import { getPrice } from './price'

// This method is cached dan is only to be used to generally existing pools every 24h
// Do not use for price calulations, fetch accounts for pools individually in order to calculate price 
let getAccounts = async (base, quote) => {
  let accounts = await request(`solana://${exchange.router.v1.address}/getProgramAccounts`, {
    params: { filters: [
      { dataSize: exchange.router.v1.api.span },
      { memcmp: { offset: 101, bytes: base }},
      { memcmp: { offset: 181, bytes: quote }}
    ]},
    api: exchange.router.v1.api,
    cache: 86400, // 24h
  })
  return accounts
}

let getPairsWithPrice = async({ tokenA, tokenB, amountIn, amountOut }) => {
  try {
    let accounts = await getAccounts(tokenA, tokenB)
    if(accounts.length === 0) { accounts = await getAccounts(tokenB, tokenA) }
    accounts = accounts.filter((account)=>account.data.liquidity.toString() !== '0')
    accounts = (await Promise.all(accounts.map(async(account)=>{
      const { price, tickArrays, sqrtPriceLimit, aToB } = await getPrice({ account, tokenA, tokenB, amountIn, amountOut })
      if(price === undefined) { return false }
      account.price = price
      account.tickArrays = tickArrays
      account.sqrtPriceLimit = sqrtPriceLimit
      account.aToB = aToB
      return account
    }))).filter(Boolean)
    return accounts
  } catch {
    return []
  }
}

let getBestPair = async({ tokenA, tokenB, amountIn, amountOut }) => {
  const pairs = await getPairsWithPrice({ tokenA, tokenB, amountIn, amountOut })

  let bestPair

  if(amountIn) {
    bestPair = pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  } else { // amount out
    bestPair = pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  }
  
  return bestPair
}

export {
  getPairsWithPrice,
  getBestPair,
}
