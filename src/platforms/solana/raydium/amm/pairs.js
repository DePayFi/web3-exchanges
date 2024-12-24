/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'
import { BN } from '@depay/solana-web3.js'

//#else */

import { request } from '@depay/web3-client'
import { BN } from '@depay/solana-web3.js'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { AMM_LAYOUT } from '../layouts'

export const LIQUIDITY_FEES_NUMERATOR = new BN(25)
export const LIQUIDITY_FEES_DENOMINATOR = new BN(10000)

const BNDivCeil = (bn1, bn2)=> {
  const { div, mod } = bn1.divmod(bn2)

  if (mod.gt(new BN(0))) {
    return div.add(new BN(1))
  } else {
    return div
  }
}

const getPairs = (base, quote)=>{
  return request(`solana://675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8/getProgramAccounts`, {
    params: { filters: [
      { dataSize: AMM_LAYOUT.span },
      { memcmp: { offset: 0, bytes: [6,0,0] }}, // filters for status 6 (Swap)
      { memcmp: { offset: 400, bytes: base }},
      { memcmp: { offset: 432, bytes: quote }},
    ]},
    api: AMM_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium', base.toString(), quote.toString()].join('-')
  })
}

const getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{

  let accounts = await getPairs(tokenIn, tokenOut)

  if(accounts.length == 0) {
    accounts = await getPairs(tokenOut, tokenIn)
  }

  const pairs = await Promise.all(accounts.map(async(account)=>{

    const baseMint = account.data.baseMint.toString()
    const quoteMint = account.data.quoteMint.toString()

    const balances = await Promise.all([
      request(`solana://${account.data.baseVault.toString()}/getTokenAccountBalance`, { cache: 5 }),
      request(`solana://${account.data.quoteVault.toString()}/getTokenAccountBalance`, { cache: 5 })
    ])
    const baseReserve = (balances[0]?.value?.amount ? new BN(balances[0]?.value?.amount) : new BN(0)).sub(account.data.baseNeedTakePnl)
    const quoteReserve = (balances[1]?.value?.amount ? new BN(balances[1]?.value?.amount) : new BN(0)).sub(account.data.quoteNeedTakePnl)

    if(baseMint === Blockchains.solana.wrapped.address) {
      if(baseReserve.lt(new BN(50_000_000))) {
        return // to little liquidity
      }
    } else if (quoteMint === Blockchains.solana.wrapped.address) {
      if(quoteReserve.lt(new BN(50_000_000))) {
        return // to little liquidity
      }
    } else if (Blockchains.solana.stables.usd.includes(baseMint)) {
      if((parseFloat(baseReserve.toString()) / 10 ** account.data.baseDecimal.toNumber()) < 10_000) {
        return // to little liquidity
      }
    } else if (Blockchains.solana.stables.usd.includes(quoteMint)) {
      if((parseFloat(quoteReserve.toString()) / 10 ** account.data.quoteDecimal.toNumber()) < 10_000) {
        return // to little liquidity
      }
    }

    const reserves = [baseReserve, quoteReserve]

    if(tokenOut === baseMint) {
      reserves.reverse()
    }

    const [reserveIn, reserveOut] = reserves

    let price
    if(amountOut || amountOutMin) { // compute amountIn

      const amountInRaw = new BN(0)
      let amountOutRaw = new BN((amountOut || amountOutMin).toString())

      if (amountOutRaw.gt(reserveOut)) {
        amountOutRaw = reserveOut.sub(new BN(1))
      }

      const denominator = reserveOut.sub(amountOutRaw)
      const amountInWithoutFee = reserveIn.mul(amountOutRaw).div(denominator)

      price = amountInWithoutFee
        .mul(LIQUIDITY_FEES_DENOMINATOR)
        .div(LIQUIDITY_FEES_DENOMINATOR.sub(LIQUIDITY_FEES_NUMERATOR))
        .toString()

    } else { // compute amountOut

      const amountOutRaw = new BN(0)
      const amountInRaw = new BN((amountIn || amountInMin).toString())
      const feeRaw = BNDivCeil(amountInRaw.mul(LIQUIDITY_FEES_NUMERATOR), LIQUIDITY_FEES_DENOMINATOR)
      
      const amountInWithFee = amountInRaw.sub(feeRaw)
      const denominator = reserveIn.add(amountInWithFee)

      price = reserveOut.mul(amountInWithFee).div(denominator).toString()
    }

    return {
      publicKey: account.pubkey.toString(),
      baseMint,
      quoteMint,
      price,
      data: account.data
    }

  }))

  return pairs.filter(Boolean)
}

export {
  getPairsWithPrice
}
