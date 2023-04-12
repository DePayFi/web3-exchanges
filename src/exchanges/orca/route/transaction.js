/*#if _EVM

/*#elif _SOLANA

import { getProvider } from '@depay/web3-client-solana'
import { Token } from '@depay/web3-tokens-solana'

//#else */

import { getProvider } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import exchange from '../basics'
import { Buffer, BN, Transaction, TransactionInstruction, SystemProgram, PublicKey, Keypair, struct, u64, u128, bool } from '@depay/solana-web3.js'
import { fixPath } from './path'
import { getBestPair } from './pairs'

const blockchain = Blockchains.solana
const SWAP_FUNCTION = new BN("14449647541112719096")

const getInstructionData = ({ amount, otherAmountThreshold, sqrtPriceLimit, amountSpecifiedIsInput, aToB })=> {
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
      anchorDiscriminator: SWAP_FUNCTION,
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
  exchange,
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
  fromAddress
}) => {

  console.log('getTransaction =======')
  console.log('amountIn', amountIn.toString())
  console.log('amountInMax', amountInMax.toString())
  console.log('amountOut', amountOut.toString())
  console.log('amountOutMin', amountOutMin.toString())

  let transaction = { blockchain: 'solana' }
  let instructions = []

  const fixedPath = fixPath(path)
  if(fixedPath.length > 3) { throw 'Orca can only handle fixed paths with a max length of 3 (2 pools)!' }
  const tokenIn = fixedPath[0]
  const tokenMiddle = fixedPath.length == 3 ? fixedPath[1] : undefined
  const tokenOut = fixedPath[fixedPath.length-1]

  let pairs, amountMiddle
  if(fixedPath.length == 2) {
    pairs = [await getBestPair({ tokenA: tokenIn, tokenB: tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })]
  } else {
    if(amountInInput || amountInMaxInput) {
      pairs = [await getBestPair({ tokenA: tokenIn, tokenB: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })]
      pairs.push(await getBestPair({ tokenA: tokenMiddle, tokenB: tokenOut, amountIn: pairs[0].price }))
    } else { // originally amountOut
      pairs = [await getBestPair({ tokenA: tokenMiddle, tokenB: tokenOut, amountOut: (amountOutInput || amountOutMinInput) })]
      pairs.unshift(await getBestPair({ tokenA: tokenIn, tokenB: tokenMiddle, amountOut: pairs[0].price }))
    }
  }

  let startsWrapped = (path[0] === blockchain.currency.address && fixedPath[0] === blockchain.wrapped.address)
  let endsUnwrapped = (path[path.length-1] === blockchain.currency.address && fixedPath[fixedPath.length-1] === blockchain.wrapped.address)
  let wrappedAccount
  const provider = await getProvider('solana')
  
  if(startsWrapped || endsUnwrapped) {
    const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span)
    wrappedAccount = Keypair.generate().publicKey.toString()
    const lamports = startsWrapped ? new BN(amountIn.toString()).add(new BN(rent)) :  new BN(rent)
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: new PublicKey(fromAddress),
        newAccountPubkey: new PublicKey(wrappedAccount),
        programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
        space: Token.solana.TOKEN_LAYOUT.span,
        lamports
      })
    )
    instructions.push(
      Token.solana.initializeAccountInstruction({
        account: wrappedAccount,
        token: blockchain.wrapped.address,
        owner: fromAddress
      })
    )
  }

  if(pairs.length === 1) {
    let aToB = pairs[0].aToB
    let amountSpecifiedIsInput = !!(amountInInput || amountInMaxInput)
    console.log('amountSpecifiedIsInput', amountSpecifiedIsInput.toString())
    let amount = amountSpecifiedIsInput ? (amountIn || amountInMax) : (amountOut || amountOutMin)
    console.log('amount', amount.toString())
    let otherAmountThreshold = amountSpecifiedIsInput ? (amountOut || amountOutMin) : (amountIn || amountInMax)
    console.log('otherAmountThreshold', otherAmountThreshold.toString())
    let tokenAccountIn = new PublicKey(await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenIn }))
    let tokenAccountOut = new PublicKey(await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenOut }))
    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey(exchange.router.v1.address),
        keys: [
          // token_program
          { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
          // token_authority
          { pubkey: new PublicKey(fromAddress), isWritable: false, isSigner: true },
          // whirlpool
          { pubkey: pairs[0].pubkey, isWritable: true, isSigner: false },
          // token_owner_account_a
          { pubkey: aToB ? tokenAccountIn : tokenAccountOut, isWritable: true, isSigner: false },
          // token_vault_a
          { pubkey: pairs[0].data.tokenVaultA, isWritable: true, isSigner: false },
          // token_owner_account_b
          { pubkey: aToB ? tokenAccountOut : tokenAccountIn, isWritable: true, isSigner: false },
          // token_vault_b
          { pubkey: pairs[0].data.tokenVaultB, isWritable: true, isSigner: false },
          // tick_array_0
          { pubkey: pairs[0].tickArrays[0].address, isWritable: true, isSigner: false },
          // tick_array_1
          { pubkey: pairs[0].tickArrays[1].address, isWritable: true, isSigner: false },
          // tick_array_2
          { pubkey: pairs[0].tickArrays[2].address, isWritable: true, isSigner: false },
          // oracle
          { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), pairs[0].pubkey.toBuffer() ], new PublicKey(exchange.router.v1.address)))[0], isWritable: false, isSigner: false },
        ],
        data: getInstructionData({
          amount,
          otherAmountThreshold,
          sqrtPriceLimit: pairs[0].sqrtPriceLimit,
          amountSpecifiedIsInput,
          aToB: pairs[0].aToB
        }),
      })
    )
  }
  
  // if(startsWrapped || endsUnwrapped) {
  //   instructions.push(
  //     Token.solana.closeAccountInstruction({
  //       account: wrappedAccount,
  //       owner: fromAddress
  //     })
  //   )
  // }

  // for DEBUGGING:
  // let ix = instructions[0]
  // console.log('INSTRUCTION.programId', ix.programId.toString())
  // console.log('INSTRUCTION.keys', ix.keys.map((k)=>k.pubkey.toString()))
  // const LAYOUT = struct([
  //   u64("anchorDiscriminator"),
  //   u64("amount"),
  //   u64("otherAmountThreshold"),
  //   u128("sqrtPriceLimit"),
  //   bool("amountSpecifiedIsInput"),
  //   bool("aToB"),
  // ])
  // let data = LAYOUT.decode(ix.data)
  // console.log('INSTRUCTION.data', data)
  // console.log('amount', data.amount.toString())
  // console.log('otherAmountThreshold', data.otherAmountThreshold.toString())
  // console.log('sqrtPriceLimit', data.sqrtPriceLimit.toString())
  
  // let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') })
  // console.log('instructions.length', instructions.length)
  // instructions.forEach((instruction)=>simulation.add(instruction))
  // let result
  // console.log('SIMULATE')
  // try{ result = await provider.simulateTransaction(simulation) } catch(e) { console.log('error', e) }
  // console.log('SIMULATION RESULT', result)
  // console.log('instructions.length', instructions.length)

  transaction.instructions = instructions
  return transaction
}

export {
  getTransaction
}
