import Raydium from '../basics'
import { Buffer, BN, TransactionInstruction, PublicKey, struct, u8, u64 } from '@depay/solana-web3.js'
import { CONSTANTS } from '@depay/web3-constants'
import { fixPath } from './path'
import { getBestPair } from './pairs'
import { getMarket, getMarketAuthority } from './markets'
import { Token } from '@depay/web3-tokens'

const getAssociatedMiddleStatusAccount = ({ fromPoolId, middleMint, owner })=> {
  return PublicKey.findProgramAddress(
    [
      (new PublicKey(fromPoolId)).toBuffer(),
      (new PublicKey(middleMint)).toBuffer(),
      (new PublicKey(owner)).toBuffer()
    ],
    new PublicKey(Raydium.router.v1.address)
  )
}

const getInstructionData = ({ amountIn, amountOutMin, amountOut, amountInMax, amountInInput, amountOutInput, amountOutMinInput, amountInMaxInput })=> {
  let LAYOUT, data
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
  return data
}

const getInstructionKeys = ({ pair, market, marketAuthority, tokenAccountIn, tokenAccountOut, fromAddress })=> {
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
  amountsIn,
  amountsOut,
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

  let pairs = fixedPath.length == await getBestPair(fixedPath[0], fixedPath[1])
  let market = await getMarket(pair.data.marketId.toString())
  let marketAuthority = await getMarketAuthority(pair.data.marketProgramId, pair.data.marketId)

  let tokenAccountMiddle, statusAccountMiddle
  if(tokenMiddle) {
    tokenAccountMiddle = await Token.solana.findAccount({ owner: fromAddress, token: tokenMiddle })
    if(!tokenAccountMiddle) {
      tokenAccountMiddle = await Token.solana.findProgramAddress({ owner: fromAddress, token: tokenMiddle })
    }
    statusAccountMiddle = getAssociatedMiddleStatusAccount({ fromPoolId, middleMint, owner })
  }

  instructions.push(new TransactionInstruction({
    programId: new PublicKey(Raydium.pair.v4.address),
    keys: getInstructionKeys({ pairs, market, marketAuthority, tokenAccountIn, tokenAccountOut, fromAddress }),
    data: getInstructionData({ amountIn, amountOutMin, amountOut, amountInMax, amountInInput, amountOutInput, amountOutMinInput, amountInMaxInput }),
  }))
  
  return transaction
}

export {
  getTransaction
}
