/*#if _EVM

/*#elif _SOLANA

import { request, getProvider } from '@depay/web3-client-solana'
import Token from '@depay/web3-tokens-solana'

//#else */

import { request, getProvider } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { Buffer, BN, Transaction, TransactionInstruction, SystemProgram, PublicKey, Keypair, struct, u8, u64, u128, bool } from '@depay/solana-web3.js'
import { getExchangePath } from './path'
import { getBestPair } from './pairs'
import { MARKET_LAYOUT } from './layouts'

const blockchain = Blockchains.solana

const getAssociatedAuthority = async(programId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    // new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))
    [Buffer.from([97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121])],
    programId,
  )
  return publicKey
}

const getAssociatedMarketAuthority = async(programId, marketId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    // Seed is the marketId
    [marketId.toBuffer()],
    // Program ID for OpenBook/Serum
    programId
  )
  return publicKey
}

const getTransaction = async({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amounts,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  account
})=>{
  let transaction = { blockchain: 'solana' }
  let instructions = []

  const exchangePath = getExchangePath({ path })
  if(exchangePath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3 (2 pools)!' }
  const tokenIn = exchangePath[0]
  const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined
  const tokenOut = exchangePath[exchangePath.length-1]

  let pairs, amountMiddle
  if(exchangePath.length == 2) {
    pairs = [await getBestPair({ tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })]
  } else {
    if(amountInInput || amountInMaxInput) {
      pairs = [await getBestPair({ tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })]
      pairs.push(await getBestPair({ tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }))
    } else { // originally amountOut
      pairs = [await getBestPair({ tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })]
      pairs.unshift(await getBestPair({ tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }))
    }
  }

  let startsWrapped = (path[0] === blockchain.currency.address && exchangePath[0] === blockchain.wrapped.address)
  let endsUnwrapped = (path[path.length-1] === blockchain.currency.address && exchangePath[exchangePath.length-1] === blockchain.wrapped.address)
  let wrappedAccount
  const provider = await getProvider('solana')
  
  if(startsWrapped || endsUnwrapped) {
    const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span)
    const keypair = Keypair.generate()
    wrappedAccount = keypair.publicKey.toString()
    const lamports = startsWrapped ? new BN(amountIn.toString()).add(new BN(rent)) :  new BN(rent)
    let createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: new PublicKey(account),
      newAccountPubkey: new PublicKey(wrappedAccount),
      programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
      space: Token.solana.TOKEN_LAYOUT.span,
      lamports
    })
    createAccountInstruction.signers = [keypair]
    instructions.push(createAccountInstruction)
    instructions.push(
      Token.solana.initializeAccountInstruction({
        account: wrappedAccount,
        token: blockchain.wrapped.address,
        owner: account
      })
    )
  }

  if(pairs.length === 1) { // single hop
    const tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }))
    const tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }))
    const pool = pairs[0]
    const market = await request(`solana://${pool.data.marketId}/getAccountInfo`, { api: MARKET_LAYOUT })

    let LAYOUT, data
    LAYOUT = struct([
      u8('instruction'),
      u64('amountIn'),
      u64('minAmountOut')
    ])
    data = Buffer.alloc(LAYOUT.span)
    LAYOUT.encode(
      {
        instruction: 9,
        amountIn: new BN((amountIn || amountInMax).toString()),
        minAmountOut: new BN((amountOutMin || amountOut).toString()),
      },
      data,
    )

    // if(!endsUnwrapped) {
    //   await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
    // }

    // let keys = [
    //   // token_program
    //   { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    //   // amm
    //   { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
    //   // amm authority
    //   { pubkey: await getAssociatedAuthority(new PublicKey(pool.publicKey)), isWritable: false, isSigner: false },
    //   // amm openOrders
    //   { pubkey: new PublicKey(pool.data.openOrders), isWritable: true, isSigner: false },
    //   // amm baseVault
    //   { pubkey: new PublicKey(pool.data.baseVault), isWritable: true, isSigner: false },
    //   // amm quoteVault
    //   { pubkey: new PublicKey(pool.data.quoteVault), isWritable: true, isSigner: false },
    //   // openbook marketProgramId
    //   { pubkey: new PublicKey(pool.data.marketProgramId), isWritable: false, isSigner: false },
    //   // openbook marketId
    //   { pubkey: new PublicKey(pool.data.marketId), isWritable: true, isSigner: false },
    //   // openbook marketBids
    //   { pubkey: market.bids, isWritable: true, isSigner: false },
    //   // openbook marketAsks
    //   { pubkey: market.asks, isWritable: true, isSigner: false },
    //   // openbook eventQueue
    //   { pubkey: market.eventQueue, isWritable: true, isSigner: false },
    //   // openbook baseVault
    //   { pubkey: market.baseVault, isWritable: true, isSigner: false },
    //   // openbook quoteVault
    //   { pubkey: market.quoteVault, isWritable: true, isSigner: false },
    //   // openbook marketAuthority
    //   { pubkey: await getAssociatedMarketAuthority(pool.data.marketProgramId, pool.data.marketId), isWritable: false, isSigner: false },
    //   // user tokenAccountIn
    //   { pubkey: tokenAccountIn, isWritable: true, isSigner: false },
    //   // user tokenAccountOut
    //   { pubkey: tokenAccountOut, isWritable: true, isSigner: false },
    //   // user owner
    //   { pubkey: new PublicKey(account), isWritable: true, isSigner: true }
    // ]

    let keys = [
      // token_program
      { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // amm
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // amm authority
      { pubkey: new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'), isWritable: false, isSigner: false },
      // amm openOrders
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // amm baseVault
      { pubkey: new PublicKey(pool.data.baseVault), isWritable: true, isSigner: false },
      // amm quoteVault
      { pubkey: new PublicKey(pool.data.quoteVault), isWritable: true, isSigner: false },
      // openbook marketProgramId
      { pubkey: new PublicKey(pool.publicKey), isWritable: false, isSigner: false },
      // openbook marketId
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook marketBids
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook marketAsks
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook eventQueue
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook baseVault
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook quoteVault
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // openbook marketAuthority
      { pubkey: new PublicKey(pool.publicKey), isWritable: true, isSigner: false },
      // user tokenAccountIn
      { pubkey: tokenAccountIn, isWritable: true, isSigner: false },
      // user tokenAccountOut
      { pubkey: tokenAccountOut, isWritable: true, isSigner: false },
      // user owner
      { pubkey: new PublicKey(account), isWritable: true, isSigner: true }
    ]

    console.log('keys', JSON.stringify(keys))

    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
        keys,
        data,
      })
    )
  } else if (pairs.length === 2) { // two hop
    // // amount is NOT the precise part of the swap (otherAmountThreshold is)
    // let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput)
    // let amount = amountSpecifiedIsInput ? amountIn : amountOut
    // let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax
    // let tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }))
    // let tokenMiddle = exchangePath[1]
    // let tokenAccountMiddle = new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }))
    // await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenMiddle, account: tokenAccountMiddle })
    // let tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }))
    // if(!endsUnwrapped) {
    //   await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
    // }
    // instructions.push(
    //   new TransactionInstruction({
    //     programId: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
    //     keys: await getTwoHopSwapInstructionKeys({
    //       account,
    //       poolOne: pairs[0].pubkey,
    //       tickArraysOne: pairs[0].tickArrays,
    //       tokenAccountOneA: pairs[0].aToB ? tokenAccountIn : tokenAccountMiddle,
    //       tokenVaultOneA: pairs[0].data.tokenVaultA,
    //       tokenAccountOneB: pairs[0].aToB ? tokenAccountMiddle : tokenAccountIn,
    //       tokenVaultOneB: pairs[0].data.tokenVaultB,
    //       poolTwo: pairs[1].pubkey,
    //       tickArraysTwo: pairs[1].tickArrays,
    //       tokenAccountTwoA: pairs[1].aToB ? tokenAccountMiddle : tokenAccountOut,
    //       tokenVaultTwoA: pairs[1].data.tokenVaultA,
    //       tokenAccountTwoB: pairs[1].aToB ? tokenAccountOut : tokenAccountMiddle,
    //       tokenVaultTwoB: pairs[1].data.tokenVaultB,
    //     }),
    //     data: getTwoHopSwapInstructionData({
    //       amount,
    //       otherAmountThreshold,
    //       amountSpecifiedIsInput,
    //       aToBOne: pairs[0].aToB,
    //       aToBTwo: pairs[1].aToB,
    //       sqrtPriceLimitOne: pairs[0].sqrtPriceLimit,
    //       sqrtPriceLimitTwo: pairs[1].sqrtPriceLimit,
    //     }),
    //   })
    // )
  }
  
  if(startsWrapped || endsUnwrapped) {
    instructions.push(
      Token.solana.closeAccountInstruction({
        account: wrappedAccount,
        owner: account
      })
    )
  }

  // await debug(instructions, provider)

  transaction.instructions = instructions
  return transaction
}

const debug = async(instructions, provider)=>{
  console.log('instructions.length', instructions.length)
  let data
  instructions.forEach((instruction)=>{
    console.log('INSTRUCTION.programId', instruction.programId.toString())
    console.log('INSTRUCTION.keys', instruction.keys)
    try {
      const LAYOUT = struct([
        u64("anchorDiscriminator"),
        u64("amount"),
        u64("otherAmountThreshold"),
        u128("sqrtPriceLimit"),
        bool("amountSpecifiedIsInput"),
        bool("aToB"),
      ])
      data = LAYOUT.decode(instruction.data)
    } catch {}
  })
  if(data) {
    console.log('INSTRUCTION.data', data)
    console.log('amount', data.amount.toString())
    console.log('otherAmountThreshold', data.otherAmountThreshold.toString())
    console.log('sqrtPriceLimit', data.sqrtPriceLimit.toString())
  }
  let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') })
  instructions.forEach((instruction)=>simulation.add(instruction))
  let result
  console.log('SIMULATE')
  try{ result = await provider.simulateTransaction(simulation) } catch(e) { console.log('error', e) }
  console.log('SIMULATION RESULT', result)
}

export {
  getTransaction,
}
