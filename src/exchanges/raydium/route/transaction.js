import Raydium from '../basics'
import { Buffer, BN, Transaction, TransactionInstruction, SystemProgram, PublicKey, Keypair, struct, u8, u64 } from '@depay/solana-web3.js'
import { CONSTANTS } from '@depay/web3-constants'
import { fixPath } from './path'
import { getBestPair } from './pairs'
import { getMarket, getMarketAuthority } from './markets'
import { getProvider } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

const getAssociatedMiddleStatusAccount = async ({ fromPoolId, middleMint, owner })=> {
  let result = await PublicKey.findProgramAddress(
    [
      (new PublicKey(fromPoolId)).toBuffer(),
      (new PublicKey(middleMint)).toBuffer(),
      (new PublicKey(owner)).toBuffer()
    ],
    new PublicKey(Raydium.router.v1.address)
  )
  return result[0]
}

const getInstructionData = ({ pair, amountIn, amountOutMin, amountOut, amountInMax, fix })=> {
  let LAYOUT, data
  
  if (fix === 'in') {
    LAYOUT = struct([u8("instruction"), u64("amountIn"), u64("minAmountOut")])
    data = Buffer.alloc(LAYOUT.span)
    LAYOUT.encode(
      {
        instruction: 9,
        amountIn: new BN(amountIn.toString()),
        minAmountOut: new BN(amountOutMin.toString()),
      },
      data,
    )
  } else if (fix === 'out') {
    LAYOUT = struct([u8("instruction"), u64("maxAmountIn"), u64("amountOut")])
    data = Buffer.alloc(LAYOUT.span)
    LAYOUT.encode(
      {
        instruction: 11,
        maxAmountIn: new BN(amountInMax.toString()),
        amountOut: new BN(amountOut.toString()),
      },
      data,
    )
  }

  return data
}

const getInstructionKeys = async ({ tokenIn, tokenInAccount, tokenOut, tokenOutAccount, pair, market, fromAddress, toAddress })=> {

  if(!tokenInAccount) {
    tokenInAccount = await Token.solana.findAccount({ owner: fromAddress, token: tokenIn })
  }
  console.log('existing tokenInAccount', tokenInAccount)
  if(!tokenInAccount) {
    tokenInAccount = await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenIn })
  }

  if(!tokenOutAccount) {
    tokenOutAccount = await Token.solana.findAccount({ owner: toAddress, token: tokenOut })
  }
  console.log('existing tokenOutAccount', tokenOutAccount)
  if(!tokenOutAccount) {
    tokenOutAccount = await Token.solana.findProgramAddress({ owner: toAddress, token: tokenOut })
  }

  let marketAuthority = await getMarketAuthority(pair.data.marketProgramId, pair.data.marketId)
  let keys = [
    // system
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    // amm
    { pubkey: pair.pubkey, isWritable: true, isSigner: false },
    { pubkey: new PublicKey(Raydium.pair.v4.authority), isWritable: false, isSigner: false },
    { pubkey: pair.data.openOrders, isWritable: true, isSigner: false },
    { pubkey: pair.data.targetOrders, isWritable: true, isSigner: false },
    { pubkey: pair.data.baseVault, isWritable: true, isSigner: false },
    { pubkey: pair.data.quoteVault, isWritable: true, isSigner: false },
    // serum
    { pubkey: pair.data.marketProgramId, isWritable: false, isSigner: false },
    { pubkey: pair.data.marketId, isWritable: true, isSigner: false },
    { pubkey: market.bids, isWritable: true, isSigner: false },
    { pubkey: market.asks, isWritable: true, isSigner: false },
    { pubkey: market.eventQueue, isWritable: true, isSigner: false },
    { pubkey: market.baseVault, isWritable: true, isSigner: false },
    { pubkey: market.quoteVault, isWritable: true, isSigner: false },
    { pubkey: marketAuthority, isWritable: false, isSigner: false },
    // user
    { pubkey: new PublicKey(tokenInAccount), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(tokenOutAccount), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(fromAddress), isWritable: false, isSigner: true },
  ]
  return keys
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
  toAddress,
  fromAddress
}) => {

  let transaction = { blockchain: 'solana' }
  let instructions = []

  const fixedPath = fixPath(path)
  if(fixedPath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3!' }
  const tokenIn = fixedPath[0]
  const tokenMiddle = fixedPath.length == 3 ? fixedPath[1] : undefined
  const tokenOut = fixedPath[fixedPath.length-1]

  let pairs, markets, amountMiddle
  if(fixedPath.length == 2) {
    pairs = [await getBestPair(tokenIn, tokenOut)]
    markets = [await getMarket(pairs[0].data.marketId.toString())]
  } else {
    pairs = [await getBestPair(tokenIn, tokenMiddle), await getBestPair(tokenMiddle, tokenOut)]
    markets = [await getMarket(pairs[0].data.marketId.toString()), await getMarket(pairs[1].data.marketId.toString())]
    amountMiddle = amounts[1]
  }

  let startsWrapped = (path[0] === CONSTANTS.solana.NATIVE && fixedPath[0] === CONSTANTS.solana.WRAPPED)
  let endsUnwrapped = (path[path.length-1] === CONSTANTS.solana.NATIVE && fixedPath[fixedPath.length-1] === CONSTANTS.solana.WRAPPED)
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
        token: CONSTANTS.solana.WRAPPED,
        owner: fromAddress
      })
    )
  }

  let swapInstructions = await Promise.all(pairs.map(async (pair, index)=>{
    let market = markets[index]
    let stepTokenIn = tokenIn
    let stepTokenOut = tokenOut
    let stepAmountIn = amountIn || amountInMax
    let stepAmountInMax = amountInMax || amountIn
    let stepAmountOut = amountOut || amountOutMin
    let stepAmountOutMin = amountOutMin || amountOut
    let stepFix = (amountInInput || amountOutMinInput) ? 'in' : 'out'
    let stepTokenInAccount = startsWrapped ? wrappedAccount : undefined
    let stepTokenOutAccount = endsUnwrapped ? wrappedAccount : undefined
    if(pairs.length === 2 && index === 0) {
      stepTokenIn = tokenIn
      stepTokenOut = tokenMiddle
      stepAmountOut = stepAmountOutMin = amountMiddle
      stepFix = 'out'
      if(wrappedAccount) { stepTokenOutAccount = wrappedAccount }
    } else if(pairs.length === 2 && index === 1) {
      stepTokenIn = tokenMiddle
      stepTokenOut = tokenOut
      stepAmountIn = stepAmountInMax = amountMiddle
      stepFix = 'in'
      if(wrappedAccount) { stepTokenInAccount = wrappedAccount }
    }
    return(
      new TransactionInstruction({
        programId: new PublicKey(Raydium.pair.v4.address),
        keys: await getInstructionKeys({
          tokenIn: stepTokenIn,
          tokenInAccount: stepTokenInAccount,
          tokenOut: stepTokenOut,
          tokenOutAccount: stepTokenOutAccount,
          pair,
          market,
          fromAddress,
          toAddress
        }),
        data: getInstructionData({
          pair,
          amountIn: stepAmountIn,
          amountOutMin: stepAmountOutMin,
          amountOut: stepAmountOut,
          amountInMax: stepAmountInMax,
          fix: stepFix
        }),
      })
    )
  }))
  swapInstructions.forEach((instruction)=>instructions.push(instruction))
  
  if(startsWrapped || endsUnwrapped) {
    instructions.push(
      Token.solana.closeAccountInstruction({
        account: wrappedAccount,
        owner: fromAddress
      })
    )
  }

  // // for DEBUGGING:
  // 
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
