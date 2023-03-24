/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'

//#else */

import { request } from '@depay/web3-client'

//#endif

import Blockchains from '@depay/web3-blockchains'
import Raydium from '../basics'
import { anyPairs } from './pairs'

const blockchain = Blockchains.solana
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

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

let pathExists = async (path) => {
  if(path.length == 1) { return false }
  path = fixPath(path)
  let pairs = []
  if(await anyPairs(path[0], path[1]) || await anyPairs(path[1], path[0])) {
    return true
  } else {
    return false
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(blockchain.currency.address) &&
    [tokenIn, tokenOut].includes(blockchain.wrapped.address)
  ) { return { path: undefined, fixedPath: undefined } }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != blockchain.wrapped.address &&
    tokenIn != blockchain.currency.address &&
    await pathExists([tokenIn, blockchain.wrapped.address]) &&
    tokenOut != blockchain.wrapped.address &&
    tokenOut != blockchain.currency.address &&
    await pathExists([tokenOut, blockchain.wrapped.address])
  ) {
    // path via blockchain.wrapped.address
    path = [tokenIn, blockchain.wrapped.address, tokenOut]
  } else if (
    tokenIn != USDC &&
    await pathExists([tokenIn, USDC]) &&
    tokenOut != USDC &&
    await pathExists([tokenOut, USDC])
  ) {
    // path via USDC
    path = [tokenIn, USDC, tokenOut]
  } else if (
    tokenIn != USDT &&
    await pathExists([tokenIn, USDT]) &&
    tokenOut != USDT &&
    await pathExists([tokenOut, USDT])
  ) {
    // path via USDT
    path = [tokenIn, USDT, tokenOut]
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
