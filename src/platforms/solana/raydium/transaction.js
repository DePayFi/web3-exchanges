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

const blockchain = Blockchains.solana

const CP_PROGRAM_ID = new PublicKey('CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C')

const swapBaseInputInstruction = [143, 190, 90, 218, 196, 30, 51, 222]
const swapBaseOutputInstruction = [55, 217, 98, 86, 163, 74, 180, 173]

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

const getPdaPoolAuthority = async(programId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    [Buffer.from("vault_and_lp_mint_auth_seed", "utf8")],
    programId
  )
  return publicKey
}

const getPdaObservationId = async(programId, poolId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from("observation", "utf8"),
      poolId.toBuffer()
    ],
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
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
    }
    const pool = pairs[0]
    const inputMint = tokenIn == pool.mintA ? pool.data.mintA : pool.data.mintB
    const outputMint = tokenIn == pool.mintA ? pool.data.mintB : pool.data.mintA
    const inputVault = tokenIn == pool.mintA ? pool.data.vaultA : pool.data.vaultB
    const outputVault = tokenIn == pool.mintA ? pool.data.vaultB : pool.data.vaultA
    const poolId = new PublicKey(pool.publicKey)

    if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

      const dataLayout = struct([u64("amountIn"), u64("amounOutMin")]);

      const keys = [
        // payer
        { pubkey: new PublicKey(account), isSigner: true, isWritable: false },
        // authority
        { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
        // configId
        { pubkey: pool.data.configId, isSigner: false, isWritable: false },
        // poolId
        { pubkey: poolId, isSigner: false, isWritable: true },
        // userInputAccount
        { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
        // userOutputAccount
        { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
        // inputVault
        { pubkey: inputVault, isSigner: false, isWritable: true },
        // outputVault
        { pubkey: outputVault, isSigner: false, isWritable: true },
        // inputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // outputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // inputMint
        { pubkey: inputMint, isSigner: false, isWritable: false },
        // outputMint
        { pubkey: outputMint, isSigner: false, isWritable: false },
        // observationId
        { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
      ]

      const data = Buffer.alloc(dataLayout.span)
      dataLayout.encode({ 
        amountIn: new BN((amountIn || amountInMax).toString()),
        amounOutMin: new BN((amountOut || amountOutMin).toString())
      }, data)

      instructions.push(
        new TransactionInstruction({
          programId: CP_PROGRAM_ID,
          keys,
          data: Buffer.from([...swapBaseInputInstruction, ...data]),
        })
      )

    } else { // fixed amountOut, variable amountIn (amountInMax)

      const dataLayout = struct([u64("amountInMax"), u64("amountOut")]);

      const keys = [
        // payer
        { pubkey: new PublicKey(account), isSigner: true, isWritable: false },
        // authority
        { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
        // configId
        { pubkey: pool.data.configId, isSigner: false, isWritable: false },
        // poolId
        { pubkey: poolId, isSigner: false, isWritable: true },
        // userInputAccount
        { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
        // userOutputAccount
        { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
        // inputVault
        { pubkey: inputVault, isSigner: false, isWritable: true },
        // outputVault
        { pubkey: outputVault, isSigner: false, isWritable: true },
        // inputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // outputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // inputMint
        { pubkey: inputMint, isSigner: false, isWritable: false },
        // outputMint
        { pubkey: outputMint, isSigner: false, isWritable: false },
        // observationId
        { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
      ]

      const data = Buffer.alloc(dataLayout.span)
      dataLayout.encode({ 
        amountInMax: new BN((amountIn || amountInMax).toString()),
        amountOut: new BN((amountOut || amountOutMin).toString())
      }, data)

      instructions.push(
        new TransactionInstruction({
          programId: CP_PROGRAM_ID,
          keys,
          data: Buffer.from([...swapBaseOutputInstruction, ...data]),
        })
      )
    }

  } else if (pairs.length === 2) { // two hop

  }
  
  if(startsWrapped || endsUnwrapped) {
    instructions.push(
      Token.solana.closeAccountInstruction({
        account: wrappedAccount,
        owner: account
      })
    )
  }

  await debug(instructions, provider)

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
