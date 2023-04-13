/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'

//#else */

import { request } from '@depay/web3-client'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { getPairsWithPrice } from './pairs'

const blockchain = Blockchains.solana

// Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
//
// We keep 11111111111111111111111111111111 internally
// to be able to differentiate between SOL<>Token and WSOL<>Token swaps
// as they are not the same!
//
let fixPath = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === blockchain.currency.address && path[index+1] != blockchain.wrapped.address &&
      path[index-1] != blockchain.wrapped.address
    ) {
      return blockchain.wrapped.address
    } else {
      return token
    }
  })

  if(fixedPath[0] == blockchain.currency.address && fixedPath[1] == blockchain.wrapped.address) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == blockchain.currency.address && fixedPath[fixedPath.length-2] == blockchain.wrapped.address) {
    fixedPath.splice(fixedPath.length-1, 1)
  }

  return fixedPath
}

let pathExists = async ({ path, amountIn, amountInMax, amountOut, amountOutMin }) => {
  if(path.length == 1) { return false }
  path = fixPath(path)
  let pairs = []
  if((await getPairsWithPrice({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin })).length > 0) {
    return true
  } else {
    return false
  }
}

let findPath = async ({ tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
  if(
    [tokenIn, tokenOut].includes(blockchain.currency.address) &&
    [tokenIn, tokenOut].includes(blockchain.wrapped.address)
  ) { return { path: undefined, fixedPath: undefined } }

  let path, stablesIn, stablesOut, stable

  if (await pathExists({ path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != blockchain.wrapped.address &&
    tokenIn != blockchain.currency.address &&
    await pathExists({ path: [tokenIn, blockchain.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
    tokenOut != blockchain.wrapped.address &&
    tokenOut != blockchain.currency.address &&
    await pathExists({ path: [tokenOut, blockchain.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin })
  ) {
    // path via blockchain.wrapped.address
    path = [tokenIn, blockchain.wrapped.address, tokenOut]
  } else if (
    !blockchain.stables.usd.includes(tokenIn) &&
    (stablesIn = (await Promise.all(blockchain.stables.usd.map((stable)=>pathExists({ path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
    !blockchain.stables.usd.includes(tokenOut) &&
    (stablesOut = (await Promise.all(blockchain.stables.usd.map((stable)=>pathExists({ path: [tokenOut, stable], amountIn, amountInMax, amountOut, amountOutMin })  ? stable : undefined))).filter(Boolean)) &&
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
  return { path, fixedPath: fixPath(path) }
}

export {
  findPath,
  fixPath,
  pathExists,
}
