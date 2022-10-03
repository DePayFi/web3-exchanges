import Raydium from '../basics'
import { Buffer, BN, SystemProgram, Transaction, TransactionInstruction, PublicKey, struct, u8, u64 } from '@depay/solana-web3.js'
import { CONSTANTS } from '@depay/web3-constants'
import { fixPath } from './path'
import { getBestPair } from './pairs'
import { getMarket, getMarketAuthority } from './markets'
import { provider } from '@depay/web3-client'
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

const getInstructionData = ({ pairs, amountIn, amountOutMin, amountOut, amountInMax, amountInInput, amountOutInput, amountOutMinInput, amountInMaxInput })=> {
  let LAYOUT, data
  if(pairs.length == 1) {
    
    if (amountInInput || amountOutMinInput) {
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

    } else if (amountOutInput || amountInMaxInput) {
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

  } else if(pairs.length == 2) {

    if (amountInInput || amountOutMinInput) {
      LAYOUT = struct([u8("instruction"), u64("amountIn"), u64("amountOut")])
      data = Buffer.alloc(LAYOUT.span)
      LAYOUT.encode(
        {
          instruction: 0,
          amountIn: new BN(amountIn.toString()),
          amountOut: new BN(amountOutMin.toString()),
        },
        data,
      )
    } else if (amountOutInput || amountInMaxInput) {
      LAYOUT = struct([u8("instruction")])
      data = Buffer.alloc(LAYOUT.span)
      LAYOUT.encode(
        {
          instruction: 1,
        },
        data,
      )
    }
  }
  return data
}

const getInstructionKeys = async ({ tokenIn, tokenMiddle, tokenOut, pairs, markets, fromAddress, toAddress })=> {

  let tokenAccountIn
  tokenAccountIn = await Token.solana.findAccount({ owner: fromAddress, token: tokenIn })
  if(!tokenAccountIn) {
    tokenAccountIn = await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenIn })
  }

  let tokenAccountOut
  tokenAccountOut = await Token.solana.findAccount({ owner: toAddress, token: tokenOut })
  if(!tokenAccountOut) {
    tokenAccountOut = await Token.solana.findProgramAddress({ owner: toAddress, token: tokenOut })
  }

  if(pairs.length == 1) {
    let pair = pairs[0]
    let market = markets[0]
    let marketAuthority = await getMarketAuthority(pair.data.marketProgramId, pair.data.marketId)
    return [
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
      { pubkey: new PublicKey(tokenAccountIn), isWritable: true, isSigner: false },
      { pubkey: new PublicKey(tokenAccountOut), isWritable: true, isSigner: false },
      { pubkey: new PublicKey(fromAddress), isWritable: false, isSigner: false },
    ]
  } else if (pairs.length == 2) {
    let tokenAccountMiddle, statusAccountMiddle

    tokenAccountMiddle = await Token.solana.findAccount({ owner: fromAddress, token: tokenMiddle })
    if(!tokenAccountMiddle) {
      tokenAccountMiddle = await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenMiddle })
    }
    statusAccountMiddle = await getAssociatedMiddleStatusAccount({ fromPoolId: pairs[0].pubkey.toString(), middleMint: tokenMiddle, owner: fromAddress })
    console.log('statusAccountMiddle', statusAccountMiddle.toString())

    let fromMarketAuthority = await getMarketAuthority(pairs[0].data.marketProgramId, pairs[0].data.marketId)

    let keys = [
      // system
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // amm
      { pubkey: new PublicKey(Raydium.pair.v4.address), isWritable: false, isSigner: false },
      { pubkey: pairs[0].pubkey, isWritable: true, isSigner: false },
      { pubkey: pairs[1].pubkey, isWritable: false, isSigner: false },
      { pubkey: new PublicKey(Raydium.pair.v4.authority), isWritable: false, isSigner: false },
      { pubkey: pairs[0].data.openOrders, isWritable: true, isSigner: false },
      { pubkey: pairs[0].data.baseVault, isWritable: true, isSigner: false },
      { pubkey: pairs[0].data.quoteVault, isWritable: true, isSigner: false },
      // serum
      { pubkey: pairs[0].data.marketProgramId, isWritable: false, isSigner: false },
      { pubkey: pairs[0].data.marketId, isWritable: true, isSigner: false },
      { pubkey: markets[0].bids, isWritable: true, isSigner: false },
      { pubkey: markets[0].asks, isWritable: true, isSigner: false },
      { pubkey: markets[0].eventQueue, isWritable: true, isSigner: false },
      { pubkey: markets[0].baseVault, isWritable: true, isSigner: false },
      { pubkey: markets[0].quoteVault, isWritable: true, isSigner: false },
      { pubkey: fromMarketAuthority, isWritable: false, isSigner: false },
      // user
      { pubkey: new PublicKey(tokenAccountIn), isWritable: true, isSigner: false },
      { pubkey: new PublicKey(tokenAccountMiddle), isWritable: true, isSigner: false },
      { pubkey: new PublicKey(statusAccountMiddle), isWritable: true, isSigner: false },
      { pubkey: new PublicKey(fromAddress), isWritable: false, isSigner: true },
    ]

    return keys
  }
}

const getTransaction = async ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  toAddress,
  fromAddress
}) => {

  let instructions = []
  let transaction = { blockchain: 'solana', instructions }

  const fixedPath = fixPath(path)
  if(fixedPath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3!' }
  const tokenIn = fixedPath[0]
  const tokenMiddle = fixedPath.length == 3 ? fixedPath[1] : undefined
  const tokenOut = fixedPath[fixedPath.length-1]

  let pairs, markets
  if(fixedPath.length == 2) {
    pairs = [await getBestPair(tokenIn, tokenOut)]
    markets = [await getMarket(pairs[0].data.marketId.toString())]
  } else {
    pairs = [await getBestPair(tokenIn, tokenMiddle), await getBestPair(tokenMiddle, tokenOut)]
    markets = [await getMarket(pairs[0].data.marketId.toString()), await getMarket(pairs[1].data.marketId.toString())]
  }

  let instruction = new TransactionInstruction({
    programId: pairs.length == 1 ? new PublicKey(Raydium.pair.v4.address) : new PublicKey(Raydium.router.v1.address),
    keys: await getInstructionKeys({ tokenIn, tokenMiddle, tokenOut, pairs, markets, fromAddress, toAddress }),
    data: getInstructionData({ pairs, amountIn, amountOutMin, amountOut, amountInMax, amountInInput, amountOutInput, amountOutMinInput, amountInMaxInput }),
  })
  instructions.push(instruction)

  let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') })
  simulation.add(instruction)

  let result
  console.log('SIMULATE')
  try{ result = await provider('solana').simulateTransaction(simulation) } catch(e) { console.log('error', e) }
  console.log('SIMULATION RESULT', result)
  
  return transaction
}

export {
  getTransaction
}
