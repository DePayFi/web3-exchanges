import Raydium from '../basics'
import { Buffer, BN, Transaction, TransactionInstruction, PublicKey, struct, u8, u64 } from '@depay/solana-web3.js'
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

const getInstructionKeys = async ({ tokenIn, tokenOut, pair, market, fromAddress, toAddress })=> {

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
    { pubkey: new PublicKey(tokenAccountIn), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(tokenAccountOut), isWritable: true, isSigner: false },
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


  let instructions = []
  let transaction = { blockchain: 'solana', instructions }

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

  transaction.instructions = await Promise.all(pairs.map(async (pair, index)=>{
    let market = markets[index]
    let stepTokenIn = tokenIn
    let stepTokenOut = tokenOut
    let stepAmountIn = amountIn || amountInMax
    let stepAmountInMax = amountInMax || amountIn
    let stepAmountOut = amountOut || amountOutMin
    let stepAmountOutMin = amountOutMin || amountOut
    let stepFix = (amountInInput || amountOutMinInput) ? 'in' : 'out'
    if(pairs.length === 2 && index === 0) {
      stepTokenIn = tokenIn
      stepTokenOut = tokenMiddle
      stepAmountOut = stepAmountOutMin = amountMiddle
      stepFix = 'out'
    } else if(pairs.length === 2 && index === 1) {
      stepTokenIn = tokenMiddle
      stepTokenOut = tokenOut
      stepAmountIn = stepAmountInMax = amountMiddle
      stepFix = 'in'
    }
    return new TransactionInstruction({
      programId: new PublicKey(Raydium.pair.v4.address),
      keys: await getInstructionKeys({ tokenIn: stepTokenIn, tokenOut: stepTokenOut, pair, market, fromAddress, toAddress }),
      data: getInstructionData({
        pair,
        amountIn: stepAmountIn,
        amountOutMin: stepAmountOutMin,
        amountOut: stepAmountOut,
        amountInMax: stepAmountInMax,
        fix: stepFix
      }),
    })
  }))

  return transaction
}

export {
  getTransaction
}
