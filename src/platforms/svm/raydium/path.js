import Blockchains from '@depay/web3-blockchains'
import { getPairsWithPrice } from './pairs'

const blockchain = Blockchains.solana

// Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
//
// We keep 11111111111111111111111111111111 internally
// to be able to differentiate between SOL<>Token and WSOL<>Token swaps
// as they are not the same!
//
let getExchangePath = ({ path }) => {
  if(!path) { return }
  let exchangePath = path.map((token, index) => {
    if (
      token === blockchain.currency.address && path[index+1] != blockchain.wrapped.address &&
      path[index-1] != blockchain.wrapped.address
    ) {
      return blockchain.wrapped.address
    } else {
      return token
    }
  })

  if(exchangePath[0] == blockchain.currency.address && exchangePath[1] == blockchain.wrapped.address) {
    exchangePath.splice(0, 1)
  } else if(exchangePath[exchangePath.length-1] == blockchain.currency.address && exchangePath[exchangePath.length-2] == blockchain.wrapped.address) {
    exchangePath.splice(exchangePath.length-1, 1)
  }

  return exchangePath
}

let pathExists = async ({ exchange, path, amountIn, amountInMax, amountOut, amountOutMin }) => {
  if(path.length == 1) { return false }
  path = getExchangePath({ path })
  let pairs = (await getPairsWithPrice({ exchange, tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin }))
  if(pairs.length > 0) {
    return true
  } else {
    return false
  }
}

let findPath = async ({ exchange, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, pairsData }) => {
  
  if(pairsData) {
    let path
    if(pairsData.length == 1) {
      path = [tokenIn, tokenOut]
    } else if(pairsData.length == 2) {
      const tokenMiddle = [pairsData[0].mintA, pairsData[0].mintB].includes(pairsData[1].mintA) ? pairsData[1].mintA : pairsData[1].mintB
      path = [tokenIn, tokenMiddle, tokenOut]
    }
    if(path) {
      return { path , exchangePath: getExchangePath({ path }) }
    }
  }

  if(
    [tokenIn, tokenOut].includes(blockchain.currency.address) &&
    [tokenIn, tokenOut].includes(blockchain.wrapped.address)
  ) { return { path: undefined, exchangePath: undefined } }

  let path, stablesIn, stablesOut, stable

  if (await pathExists({ exchange, path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != blockchain.wrapped.address &&
    tokenIn != blockchain.currency.address &&
    await pathExists({ exchange, path: [tokenIn, blockchain.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
    tokenOut != blockchain.wrapped.address &&
    tokenOut != blockchain.currency.address &&
    await pathExists({ exchange, path: [tokenOut, blockchain.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
  ) {
    // path via blockchain.wrapped.address
    path = [tokenIn, blockchain.wrapped.address, tokenOut]
  } else if (
    !blockchain.stables.usd.includes(tokenIn) &&
    (stablesIn = (await Promise.all(blockchain.stables.usd.map(async(stable)=>await pathExists({ exchange, path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
    !blockchain.stables.usd.includes(tokenOut) &&
    (stablesOut = (await Promise.all(blockchain.stables.usd.map(async(stable)=>await pathExists({ exchange, path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
    (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
  ) {
    // path via TOKEN_IN <> STABLE <> TOKEN_OUT
    path = [tokenIn, stable, tokenOut]
  }

  // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == blockchain.currency.address) {
    path.splice(1, 0, blockchain.wrapped.address)
  } else if(path?.length && path[path.length-1] == blockchain.currency.address) {
    path.splice(path.length-1, 0, blockchain.wrapped.address)
  }
  return { path, exchangePath: getExchangePath({ path }) }
}

export {
  findPath,
  getExchangePath,
  pathExists,
}
