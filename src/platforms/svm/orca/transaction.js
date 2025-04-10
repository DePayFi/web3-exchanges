/*#if _EVM

/*#elif _SVM

import { request, getProvider } from '@depay/web3-client-svm'
import Token from '@depay/web3-tokens-svm'

//#else */

import { request, getProvider } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { Buffer, BN, Transaction, TransactionInstruction, SystemProgram, PublicKey, Keypair, struct, u64, u128, bool } from '@depay/solana-web3.js'
import { getExchangePath } from './path'
import { getBestPair } from './pairs'

const blockchain = Blockchains.solana
const SWAP_INSTRUCTION = new BN("14449647541112719096")
const TWO_HOP_SWAP_INSTRUCTION = new BN("16635068063392030915")

const createTokenAccountIfNotExisting = async ({ instructions, owner, token, account })=>{
  let outAccountExists
  try{ outAccountExists = !!(await request({ blockchain: 'solana', address: account.toString() })) } catch {}
  if(!outAccountExists) {
    instructions.push(
      await Token.solana.createAssociatedTokenAccountInstruction({
        token,
        owner,
        payer: owner,
      })
    )
  }
}

const getTwoHopSwapInstructionKeys = async ({
  account,
  poolOne,
  tickArraysOne,
  tokenAccountOneA,
  tokenVaultOneA,
  tokenAccountOneB,
  tokenVaultOneB,
  poolTwo,
  tickArraysTwo,
  tokenAccountTwoA,
  tokenVaultTwoA,
  tokenAccountTwoB,
  tokenVaultTwoB,
})=> {

  let lastInitializedTickOne = false
  const onlyInitializedTicksOne = tickArraysOne.map((tickArray, index)=>{
    if(lastInitializedTickOne !== false) {
      return tickArraysOne[lastInitializedTickOne]
    } else if(tickArray.data){
      return tickArray
    } else {
      lastInitializedTickOne = index-1
      return tickArraysOne[index-1]
    }
  })

  let lastInitializedTickTwo = false
  const onlyInitializedTicksTwo = tickArraysTwo.map((tickArray, index)=>{
    if(lastInitializedTickTwo !== false) {
      return tickArraysTwo[lastInitializedTickTwo]
    } else if(tickArray.data){
      return tickArray
    } else {
      lastInitializedTickTwo = index-1
      return tickArraysTwo[index-1]
    }
  })

  return [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    // token_authority
    { pubkey: new PublicKey(account), isWritable: false, isSigner: true },
    // whirlpool_one
    { pubkey: new PublicKey(poolOne.toString()), isWritable: true, isSigner: false },
    // whirlpool_two
    { pubkey: new PublicKey(poolTwo.toString()), isWritable: true, isSigner: false },
    // token_owner_account_one_a
    { pubkey: new PublicKey(tokenAccountOneA.toString()), isWritable: true, isSigner: false },
    // token_vault_one_a
    { pubkey: new PublicKey(tokenVaultOneA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_one_b
    { pubkey: new PublicKey(tokenAccountOneB.toString()), isWritable: true, isSigner: false },
    // token_vault_one_b
    { pubkey: new PublicKey(tokenVaultOneB.toString()), isWritable: true, isSigner: false },
    // token_owner_account_two_a
    { pubkey: new PublicKey(tokenAccountTwoA.toString()), isWritable: true, isSigner: false },
    // token_vault_two_a
    { pubkey: new PublicKey(tokenVaultTwoA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_two_b
    { pubkey: new PublicKey(tokenAccountTwoB.toString()), isWritable: true, isSigner: false },
    // token_vault_two_b
    { pubkey: new PublicKey(tokenVaultTwoB.toString()), isWritable: true, isSigner: false },
    // tick_array_one_0
    { pubkey: onlyInitializedTicksOne[0].address, isWritable: true, isSigner: false },
    // tick_array_one_1
    { pubkey: onlyInitializedTicksOne[1].address, isWritable: true, isSigner: false },
    // tick_array_one_2
    { pubkey: onlyInitializedTicksOne[2].address, isWritable: true, isSigner: false },
    // tick_array_two_0
    { pubkey: onlyInitializedTicksTwo[0].address, isWritable: true, isSigner: false },
    // tick_array_two_1
    { pubkey: onlyInitializedTicksTwo[1].address, isWritable: true, isSigner: false },
    // tick_array_two_2
    { pubkey: onlyInitializedTicksTwo[2].address, isWritable: true, isSigner: false },
    // oracle_one
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(poolOne.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
    // oracle_two
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(poolTwo.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
  ]
}
const getTwoHopSwapInstructionData = ({
  amount,
  otherAmountThreshold,
  amountSpecifiedIsInput,
  aToBOne,
  aToBTwo,
  sqrtPriceLimitOne,
  sqrtPriceLimitTwo,
})=> {
  let LAYOUT, data

  LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ])
  data = Buffer.alloc(LAYOUT.span)
  LAYOUT.encode(
    {
      anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION,
      amount: new BN(amount.toString()),
      otherAmountThreshold: new BN(otherAmountThreshold.toString()),
      amountSpecifiedIsInput,
      aToBOne,
      aToBTwo,
      sqrtPriceLimitOne,
      sqrtPriceLimitTwo,
    },
    data,
  )

  return data
}

const getSwapInstructionKeys = async ({
  account,
  pool,
  tokenAccountA,
  tokenVaultA,
  tokenAccountB,
  tokenVaultB,
  tickArrays,
})=> {

  let lastInitializedTick = false
  const onlyInitializedTicks = tickArrays.map((tickArray, index)=>{
    if(lastInitializedTick !== false) {
      return tickArrays[lastInitializedTick]
    } else if(tickArray.data){
      return tickArray
    } else {
      lastInitializedTick = index-1
      return tickArrays[index-1]
    }
  })

  return [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    // token_authority
    { pubkey: new PublicKey(account), isWritable: false, isSigner: true },
    // whirlpool
    { pubkey: new PublicKey(pool.toString()), isWritable: true, isSigner: false },
    // token_owner_account_a
    { pubkey: new PublicKey(tokenAccountA.toString()), isWritable: true, isSigner: false },
    // token_vault_a
    { pubkey: new PublicKey(tokenVaultA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_b
    { pubkey: new PublicKey(tokenAccountB.toString()), isWritable: true, isSigner: false },
    // token_vault_b
    { pubkey: new PublicKey(tokenVaultB.toString()), isWritable: true, isSigner: false },
    // tick_array_0
    { pubkey: onlyInitializedTicks[0].address, isWritable: true, isSigner: false },
    // tick_array_1
    { pubkey: onlyInitializedTicks[1].address, isWritable: true, isSigner: false },
    // tick_array_2
    { pubkey: onlyInitializedTicks[2].address, isWritable: true, isSigner: false },
    // oracle
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(pool.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
  ]
}

const getSwapInstructionData = ({ amount, otherAmountThreshold, sqrtPriceLimit, amountSpecifiedIsInput, aToB })=> {
  let LAYOUT, data
  
  LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ])
  data = Buffer.alloc(LAYOUT.span)
  LAYOUT.encode(
    {
      anchorDiscriminator: SWAP_INSTRUCTION,
      amount: new BN(amount.toString()),
      otherAmountThreshold: new BN(otherAmountThreshold.toString()),
      sqrtPriceLimit,
      amountSpecifiedIsInput,
      aToB,
    },
    data,
  )

  return data
}

const getTransaction = async ({
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
  account,
  pools
}) => {
  let transaction = { blockchain: 'solana' }
  let instructions = []

  const exchangePath = getExchangePath({ path })
  if(exchangePath.length > 3) { throw 'Orca can only handle fixed paths with a max length of 3 (2 pools)!' }
  const tokenIn = exchangePath[0]
  const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined
  const tokenOut = exchangePath[exchangePath.length-1]

  let pairs
  if(pools) {
    pairs = pools
  } else if(exchangePath.length == 2) {
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

  if(pairs.length === 1) {
    // amount is NOT the precise part of the swap (otherAmountThreshold is)
    let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput)
    let amount = amountSpecifiedIsInput ? amountIn : amountOut
    let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax
    let tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }))
    let tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }))
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
    }
    let aToB = tokenIn.toLowerCase() == pairs[0].tokenMintA.toString().toLowerCase()
    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
        keys: await getSwapInstructionKeys({
          account,
          pool: pairs[0].pubkey,
          tokenAccountA: aToB ? tokenAccountIn : tokenAccountOut,
          tokenVaultA: pairs[0].tokenVaultA,
          tokenAccountB: aToB ? tokenAccountOut : tokenAccountIn,
          tokenVaultB: pairs[0].tokenVaultB,
          tickArrays: pairs[0].tickArrays,
        }),
        data: getSwapInstructionData({
          amount,
          otherAmountThreshold,
          sqrtPriceLimit: pairs[0].sqrtPriceLimit,
          amountSpecifiedIsInput,
          aToB
        }),
      })
    )
  } else if (pairs.length === 2) {
    // amount is NOT the precise part of the swap (otherAmountThreshold is)
    let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput)
    let amount = amountSpecifiedIsInput ? amountIn : amountOut
    let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax
    let tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }))
    let tokenMiddle = exchangePath[1]
    let tokenAccountMiddle = new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }))
    await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenMiddle, account: tokenAccountMiddle })
    let tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }))
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
    }
    console.log('pairs[0].tokenMintA.toString()', pairs[0].tokenMintA.toString())
    console.log('tokenIn.toLowerCase()', tokenIn.toLowerCase())
    let aToBOne = tokenIn.toLowerCase() == pairs[0].tokenMintA.toString().toLowerCase()
    console.log('aToBOne', aToBOne)
    console.log('pairs[1].tokenMintB.toString()', pairs[1].tokenMintB.toString())
    console.log('tokenOut.toLowerCase()', tokenOut.toLowerCase())
    let aToBTwo = tokenOut.toLowerCase() == pairs[1].tokenMintB.toString().toLowerCase()
    console.log('aToBTwo', aToBTwo)
    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
        keys: await getTwoHopSwapInstructionKeys({
          account,
          poolOne: pairs[0].pubkey,
          tickArraysOne: pairs[0].tickArrays,
          tokenAccountOneA: aToBOne ? tokenAccountIn : tokenAccountMiddle,
          tokenVaultOneA: pairs[0].tokenVaultA,
          tokenAccountOneB: aToBOne ? tokenAccountMiddle : tokenAccountIn,
          tokenVaultOneB: pairs[0].tokenVaultB,
          poolTwo: pairs[1].pubkey,
          tickArraysTwo: pairs[1].tickArrays,
          tokenAccountTwoA: aToBTwo ? tokenAccountMiddle : tokenAccountOut,
          tokenVaultTwoA: pairs[1].tokenVaultA,
          tokenAccountTwoB: aToBTwo ? tokenAccountOut : tokenAccountMiddle,
          tokenVaultTwoB: pairs[1].tokenVaultB,
        }),
        data: getTwoHopSwapInstructionData({
          amount,
          otherAmountThreshold,
          amountSpecifiedIsInput,
          aToBOne,
          aToBTwo,
          sqrtPriceLimitOne: pairs[0].sqrtPriceLimit,
          sqrtPriceLimitTwo: pairs[1].sqrtPriceLimit,
        }),
      })
    )
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
  SWAP_INSTRUCTION,
  TWO_HOP_SWAP_INSTRUCTION,
  getSwapInstructionKeys,
  getTwoHopSwapInstructionKeys,
}
