import Raydium from '../basics'
import { Buffer, BN, TransactionInstruction, PublicKey, struct, u8, u64 } from '@depay/solana-web3.js'
import { CONSTANTS } from '@depay/web3-constants'
import { fixPath } from './path'
import { getBestPair } from './pairs'
import { getMarket, getMarketAuthority } from './markets'
import { Token } from '@depay/web3-tokens'

let getTransaction = async ({
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
  const tokenIn = fixedPath[0]
  const tokenOut = fixedPath[fixedPath.length-1]

  const existingTokenAccountIn = await Token.solana.findAccount({ owner: toAddress, token: tokenIn })
  const associatedTokenAccountIn = await Token.solana.findProgramAddress({ owner: toAddress, token: tokenIn })
  const tokenAccountIn = existingTokenAccountIn || associatedTokenAccountIn

  const existsingTokenAccountOut = await Token.solana.findAccount({ owner: toAddress, token: tokenOut })
  const associatedTokenAccountOut = await Token.solana.findProgramAddress({ owner: toAddress, token: tokenOut })
  const tokenAccountOut = existsingTokenAccountOut || associatedTokenAccountOut

  // if(!existingTokenAccountIn) {
  //   instructions.unshift(
  //     Token.solana.createAssociatedTokenAccountInstruction({ token: tokenIn, owner: toAddress, payer: fromAddress })
  //   )
  // }

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

  let pair = await getBestPair(fixedPath[0], fixedPath[1])
  let market = await getMarket(pair.data.marketId.toString())
  let marketAuthority = await getMarketAuthority(pair.data.marketProgramId, pair.data.marketId)

  const keys = [
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

  instructions.push(new TransactionInstruction({
    programId: new PublicKey(Raydium.pair.v4.address),
    keys,
    data,
  }))
  
  return transaction
}

export {
  getTransaction
}
