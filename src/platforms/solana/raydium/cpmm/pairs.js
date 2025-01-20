/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'
import { BN } from '@depay/solana-web3.js'

//#else */

import { request } from '@depay/web3-client'
import { BN } from '@depay/solana-web3.js'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { CPMM_LAYOUT, CPMM_CONFIG_LAYOUT } from '../layouts'
import { CurveCalculator } from './price'

const getConfig = (address)=>{
  return request(`solana://${address}/getAccountInfo`, {
    api: CPMM_CONFIG_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/cpmm/config/', address.toString()].join('/')
  })
}

const getPairs = (base, quote)=>{
  return request(`solana://CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C/getProgramAccounts`, {
    params: { filters: [
      { dataSize: CPMM_LAYOUT.span },
      { memcmp: { offset: 168, bytes: base }},
      { memcmp: { offset: 200, bytes: quote }},
    ]},
    api: CPMM_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/cpmm/', base.toString(), quote.toString()].join('/')
  })
}

const getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{

  let accounts = await getPairs(tokenIn, tokenOut)

  if(accounts.length == 0) {
    accounts = await getPairs(tokenOut, tokenIn)
  }

  const pairs = await Promise.all(accounts.map(async(account)=>{

    let config = await getConfig(account.data.configId.toString())

    // BASE == A

    const baseVaultAmountData = await request(`solana://${account.data.vaultA.toString()}/getTokenAccountBalance`, { cache: 3 })
    const baseReserve = ethers.BigNumber.from(baseVaultAmountData.value.amount).sub(
      ethers.BigNumber.from(account.data.protocolFeesMintA.toString())
    ).sub(
      ethers.BigNumber.from(account.data.fundFeesMintA.toString())
    )

    if( // min liquidity SOL
      (
        tokenIn === Blockchains.solana.currency.address || 
        tokenIn === Blockchains.solana.wrapped.address
      ) && ( baseVaultAmountData.value.uiAmount < 50 )
    ) { return }

    if( // min liquidity stable usd
      (
        Blockchains.solana.stables.usd.includes(tokenIn)
      ) && ( baseVaultAmountData.value.uiAmount < 10000 )
    ) { return }

    // QUOTE == B

    const quoteVaultAmountData = await request(`solana://${account.data.vaultB.toString()}/getTokenAccountBalance`, { cache: 3 })
    const quoteReserve = ethers.BigNumber.from(quoteVaultAmountData.value.amount).sub(
      ethers.BigNumber.from(account.data.protocolFeesMintB.toString())
    ).sub(
      ethers.BigNumber.from(account.data.fundFeesMintB.toString())
    )

    if( // min liquidity SOL
      (
        tokenIn === Blockchains.solana.currency.address || 
        tokenIn === Blockchains.solana.wrapped.address
      ) && ( quoteVaultAmountData.value.uiAmount < 50 )
    ) { return }

    if( // min liquidity stable usd
      (
        Blockchains.solana.stables.usd.includes(tokenIn)
      ) && ( quoteVaultAmountData.value.uiAmount < 10000 )
    ) { return }

    let price = 0

    if(amountIn || amountInMax) { // uses CurveCalculator.swap: Given an input amount, compute how much comes out.

      const isBaseIn = tokenOut.toString() === account.data.mintB.toString()

      const swapResult = CurveCalculator.swap(
        new BN((amountIn || amountInMax).toString()),
        new BN((isBaseIn ? baseReserve : quoteReserve).toString()),
        new BN((isBaseIn ? quoteReserve : baseReserve).toString()),
        config.tradeFeeRate,
      );

      price = swapResult.destinationAmountSwapped.toString()

    } else { // uses CurveCalculator.swapBaseOut: Given a desired output amount, compute how much you need to put in (and some extra info like price impact).

      const swapResult = CurveCalculator.swapBaseOut({
        poolMintA: { decimals: account.data.mintDecimalA, address: account.data.mintA.toString() },
        poolMintB: { decimals: account.data.mintDecimalB, address: account.data.mintB.toString() },
        tradeFeeRate: config.tradeFeeRate,
        baseReserve: new BN(baseReserve.toString()),
        quoteReserve: new BN(quoteReserve.toString()),
        outputMint: tokenOut,
        outputAmount: new BN((amountOut || amountOutMin).toString())
      })

      price = swapResult.amountIn.toString()

    }

    return {
      publicKey: account.pubkey.toString(),
      mintA: account.data.mintA.toString(),
      mintB: account.data.mintB.toString(),
      price,
      data: account.data
    }
  }))

  return pairs.filter(Boolean)

}

export {
  getPairsWithPrice
}
