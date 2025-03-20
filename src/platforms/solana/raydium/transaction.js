/*#if _EVM

/*#elif _SVM

import { request, getProvider } from '@depay/web3-client-svm'
import Token from '@depay/web3-tokens-svm'

//#else */

import { request, getProvider } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { Buffer, BN, Transaction, TransactionInstruction, SystemProgram, PublicKey, Keypair, struct, u8, u64, u128, bool } from '@depay/solana-web3.js'
import { MIN_SQRT_PRICE_X64, MAX_SQRT_PRICE_X64, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, MEMO_PROGRAM_ID } from './clmm/constants'
import { getExchangePath } from './path'
import { getBestPair } from './pairs'
import { getPdaExBitmapAddress } from './clmm/pairs'

const blockchain = Blockchains.solana

const CP_PROGRAM_ID = new PublicKey('CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C')
const CL_PROGRAM_ID = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')

const swapBaseInputInstruction = [143, 190, 90, 218, 196, 30, 51, 222]
const swapBaseOutputInstruction = [55, 217, 98, 86, 163, 74, 180, 173]

const anchorDataBuf = {
  swap: [43, 4, 237, 11, 26, 201, 30, 98], // [248, 198, 158, 145, 225, 117, 135, 200],
};

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
      Buffer.from(poolId.toBuffer())
    ],
    programId
  )
  return publicKey
}

const getCPMMInstruction = async({
  account,
  tokenIn,
  tokenOut,
  tokenAccountIn,
  tokenAccountOut,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountInMaxInput,
  amountOutInput,
  amountOutMinInput,
  pool
})=>{
  const inputMint = tokenIn == pool.mintA ? pool.data.mintA : pool.data.mintB
  const outputMint = tokenIn == pool.mintA ? pool.data.mintB : pool.data.mintA
  const inputVault = tokenIn == pool.mintA ? pool.data.vaultA : pool.data.vaultB
  const outputVault = tokenIn == pool.mintA ? pool.data.vaultB : pool.data.vaultA
  const poolId = new PublicKey(pool.publicKey)

  if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

    const dataLayout = struct([u64("amountIn"), u64("amounOutMin")]);

      const keys = [
        // 0 payer
        { pubkey: new PublicKey(account), isSigner: true, isWritable: false },
        // 1 authority
        { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
        // 2 configId
        { pubkey: pool.data.configId, isSigner: false, isWritable: false },
        // 3 poolId
        { pubkey: poolId, isSigner: false, isWritable: true },
        // 4 userInputAccount
        { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
        // 5 userOutputAccount
        { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
        // 6 inputVault
        { pubkey: inputVault, isSigner: false, isWritable: true },
        // 7 outputVault
        { pubkey: outputVault, isSigner: false, isWritable: true },
        // 8 inputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // 9 outputTokenProgram
        { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // 10 inputMint
        { pubkey: inputMint, isSigner: false, isWritable: false },
        // 11 outputMint
        { pubkey: outputMint, isSigner: false, isWritable: false },
        // 12 observationId
        { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
      ]

      const data = Buffer.alloc(dataLayout.span)
      dataLayout.encode({ 
        amountIn: new BN((amountIn || amountInMax).toString()),
        amounOutMin: new BN((amountOut || amountOutMin).toString())
      }, data)

      return new TransactionInstruction({
        programId: CP_PROGRAM_ID,
        keys,
        data: Buffer.from([...swapBaseInputInstruction, ...data]),
      })

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

    return new TransactionInstruction({
      programId: CP_PROGRAM_ID,
      keys,
      data: Buffer.from([...swapBaseOutputInstruction, ...data]),
    })

  }
}

const getCLMMInstruction = async({
  account,
  tokenIn,
  tokenOut,
  tokenAccountIn,
  tokenAccountOut,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountInMaxInput,
  amountOutInput,
  amountOutMinInput,
  pool
})=>{
  const inputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintA : pool.data.mintB
  const outputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintB : pool.data.mintA
  const poolId = pool.data.id
  const exTickArrayBitmapAddress = new PublicKey(await getPdaExBitmapAddress(new PublicKey(CL_PROGRAM_ID), poolId))

  if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

    const remainingAccounts = [
      ...pool.data.allNeededAccounts.map((pubkey) => ({ pubkey, isSigner: false, isWritable: true })),
    ]

    const keys = [
      // payer
      { pubkey: new PublicKey(account), isSigner: true, isWritable: true },
      // ammConfigId
      { pubkey: pool.data.ammConfig.pubkey, isSigner: false, isWritable: true },

      // poolId
      { pubkey: pool.data.id, isSigner: false, isWritable: true },
      // inputTokenAccount
      { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
      // outputTokenAccount
      { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
      // inputVault
      { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultA : pool.data.vaultB, isSigner: false, isWritable: true },
      // outputVault
      { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultB : pool.data.vaultA, isSigner: false, isWritable: true },

      // observationId
      { pubkey: pool.data.observationId, isSigner: false, isWritable: true },

      // TOKEN_PROGRAM_ID
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // TOKEN_2022_PROGRAM_ID
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      // MEMO_PROGRAM_ID
      { pubkey: MEMO_PROGRAM_ID, isSigner: false, isWritable: false },

      // inputMint
      { pubkey: inputMint, isSigner: false, isWritable: false },
      // outputMint
      { pubkey: outputMint, isSigner: false, isWritable: false },
      
      // exTickArrayBitmapAddress
      { pubkey: exTickArrayBitmapAddress, isSigner: false, isWritable: true },

      ...remainingAccounts,
    ]

    const dataLayout = struct([
      u64("amount"),
      u64("otherAmountThreshold"),
      u128("sqrtPriceLimitX64"),
      bool("isBaseInput"),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        amount: new BN(amountIn.toString()),
        otherAmountThreshold: new BN(amountOut.toString()),
        sqrtPriceLimitX64: new BN('0'),
        isBaseInput: true, // exact input
      },
      data,
    );

    return new TransactionInstruction({
      programId: CL_PROGRAM_ID,
      keys,
      data: Buffer.from([...anchorDataBuf.swap, ...data]),
    })

  } else { // fixed amountOut, variable amountIn (amountInMax)

    // const remainingAccounts = [
    //   ...pool.data.allNeededAccounts.map((pubkey) => ({ pubkey, isSigner: false, isWritable: true })),
    // ]

    // const keys = [
    //   // payer
    //   { pubkey: new PublicKey(account), isSigner: true, isWritable: true },
    //   // ammConfigId
    //   { pubkey: pool.data.ammConfig.pubkey, isSigner: false, isWritable: true },

    //   // poolId
    //   { pubkey: pool.data.id, isSigner: false, isWritable: true },
    //   // inputTokenAccount
    //   { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
    //   // outputTokenAccount
    //   { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
    //   // inputVault
    //   { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultA : pool.data.vaultB, isSigner: false, isWritable: true },
    //   // outputVault
    //   { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultB : pool.data.vaultA, isSigner: false, isWritable: true },

    //   // observationId
    //   { pubkey: pool.data.observationId, isSigner: false, isWritable: true },

    //   // TOKEN_PROGRAM_ID
    //   { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    //   // TOKEN_2022_PROGRAM_ID
    //   { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    //   // MEMO_PROGRAM_ID
    //   { pubkey: MEMO_PROGRAM_ID, isSigner: false, isWritable: false },

    //   // inputMint
    //   { pubkey: inputMint, isSigner: false, isWritable: false },
    //   // outputMint
    //   { pubkey: outputMint, isSigner: false, isWritable: false },
      
    //   // exTickArrayBitmapAddress
    //   { pubkey: exTickArrayBitmapAddress, isSigner: false, isWritable: true },

    //   ...remainingAccounts,
    // ]

    //   console.log('// payer', { pubkey: new PublicKey(account).toString(), isSigner: true, isWritable: true })
    //   console.log('// ammConfigId', { pubkey: pool.data.ammConfig.pubkey.toString(), isSigner: false, isWritable: true })

    //   console.log('// poolId', { pubkey: pool.data.id.toString(), isSigner: false, isWritable: true })
    //   console.log('// inputTokenAccount', { pubkey: tokenAccountIn.toString(), isSigner: false, isWritable: true })
    //   console.log('// outputTokenAccount', { pubkey: tokenAccountOut.toString(), isSigner: false, isWritable: true })
    //   console.log('// inputVault', { pubkey: (tokenIn == pool.data.mintA.toString() ? pool.data.vaultA : pool.data.vaultB).toString(), isSigner: false, isWritable: true })
    //   console.log('// outputVault', { pubkey: (tokenIn == pool.data.mintA.toString() ? pool.data.vaultB : pool.data.vaultA).toString(), isSigner: false, isWritable: true })

    //   console.log('// observationId', { pubkey: (pool.data.observationId).toString(), isSigner: false, isWritable: true })

    //   console.log('// TOKEN_PROGRAM_ID', { pubkey: TOKEN_PROGRAM_ID.toString(), isSigner: false, isWritable: false })
    //   console.log('// TOKEN_2022_PROGRAM_ID', { pubkey: TOKEN_2022_PROGRAM_ID.toString(), isSigner: false, isWritable: false })
    //   console.log('// MEMO_PROGRAM_ID', { pubkey: MEMO_PROGRAM_ID.toString(), isSigner: false, isWritable: false })

    //   console.log('// inputMint', { pubkey: inputMint.toString(), isSigner: false, isWritable: false })
    //   console.log('// outputMint', { pubkey: outputMint.toString(), isSigner: false, isWritable: false })

    //   console.log('remainingAccounts', remainingAccounts.map((account)=>[account.pubkey.toString(), account]))

    // const dataLayout = struct([
    //   u64("amount"),
    //   u64("otherAmountThreshold"),
    //   u128("sqrtPriceLimitX64"),
    //   bool("isBaseInput"),
    // ]);

    // const data = Buffer.alloc(dataLayout.span);
    // dataLayout.encode(
    //   {
    //     amount: new BN(amountOut.toString()).neg(),
    //     otherAmountThreshold: new BN(amountInMax.toString()),
    //     sqrtPriceLimitX64,
    //     isBaseInput: baseIn,
    //   },
    //   data,
    // );

    // console.log('data', {
    //   amount: new BN(amountOut.toString()).neg(),
    //   otherAmountThreshold: new BN(amountInMax.toString()),
    //   sqrtPriceLimitX64,
    //   isBaseInput: baseIn,
    // })

    // const aData = Buffer.from([...anchorDataBuf.swap, ...data]);

    // return new TransactionInstruction({
    //   programId: CL_PROGRAM_ID,
    //   keys,
    //   data: Buffer.from([...swapBaseOutputInstruction, ...data]),
    // })

  }
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
  account,
  exchange,
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
    pairs = [await getBestPair({ exchange, tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })]
  } else {
    if(amountInInput || amountInMaxInput) {
      pairs = [await getBestPair({ exchange, tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })]
      pairs.push(await getBestPair({ exchange, tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }))
    } else { // originally amountOut
      pairs = [await getBestPair({ exchange, tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })]
      pairs.unshift(await getBestPair({ exchange, tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }))
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

  const tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }))
  const tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }))
  if(!endsUnwrapped) {
    await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut })
  }

  if(pairs.length == 1) { // single hop swap

    if(pairs[0].type === 'clmm') {
      instructions.push(
        await getCLMMInstruction({
          account,
          tokenIn,
          tokenOut,
          tokenAccountIn,
          tokenAccountOut,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          amountInInput,
          amountInMaxInput,
          amountOutInput,
          amountOutMinInput,
          pool: pairs[0],
        })
      )
    } else {
      instructions.push(
        await getCPMMInstruction({
          account,
          tokenIn,
          tokenOut,
          tokenAccountIn,
          tokenAccountOut,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          amountInInput,
          amountInMaxInput,
          amountOutInput,
          amountOutMinInput,
          pool: pairs[0],
        })
      )
    }

  } else if(pairs.length == 2) { // two hop swap

    const tokenMiddleAccount = new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }))
    await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenMiddle, account: tokenMiddleAccount })

    if(pairs[0].type === 'clmm') {
      instructions.push(
        await getCLMMInstruction({
          account,
          tokenIn,
          tokenOut: tokenMiddle,
          tokenAccountIn,
          tokenAccountOut: tokenMiddleAccount,
          amountIn: amounts[0],
          amountInMax: amounts[0],
          amountOut: amounts[1],
          amountOutMin: amounts[1],
          amountInInput: undefined,
          amountInMaxInput: undefined,
          amountOutInput: undefined,
          amountOutMinInput: amounts[1],
          pool: pairs[0],
        })
      )
    } else {
      instructions.push(
        await getCPMMInstruction({
          account,
          tokenIn,
          tokenOut: tokenMiddle,
          tokenAccountIn,
          tokenAccountOut: tokenMiddleAccount,
          amountIn: amounts[0],
          amountInMax: amounts[0],
          amountOut: amounts[1],
          amountOutMin: amounts[1],
          amountInInput: undefined,
          amountInMaxInput: undefined,
          amountOutInput: undefined,
          amountOutMinInput: amounts[1],
          pool: pairs[0],
        })
      )
    }

    if(pairs[1].type === 'clmm') {
      instructions.push(
        await getCLMMInstruction({
          account,
          tokenIn: tokenMiddle,
          tokenOut,
          tokenAccountIn: tokenMiddleAccount,
          tokenAccountOut,
          amountIn: amounts[1],
          amountInMax: amounts[1],
          amountOut: amounts[2],
          amountOutMin: amounts[2],
          amountInInput: undefined,
          amountInMaxInput: undefined,
          amountOutInput: undefined,
          amountOutMinInput: amounts[2],
          pool: pairs[1],
        })
      )
    } else {
      instructions.push(
        await getCPMMInstruction({
          account,
          tokenIn: tokenMiddle,
          tokenOut,
          tokenAccountIn: tokenMiddleAccount,
          tokenAccountOut,
          amountIn: amounts[1],
          amountInMax: amounts[1],
          amountOut: amounts[2],
          amountOutMin: amounts[2],
          amountInInput: undefined,
          amountInMaxInput: undefined,
          amountOutInput: undefined,
          amountOutMinInput: amounts[2],
          pool: pairs[1],
        })
      )
    }
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
