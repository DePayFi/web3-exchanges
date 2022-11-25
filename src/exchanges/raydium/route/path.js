import Raydium from '../basics'
import { CONSTANTS } from '@depay/web3-constants'
import { request } from '@depay/web3-client'
import { anyPairs } from './pairs'

const NATIVE = CONSTANTS.solana.NATIVE
const WRAPPED = CONSTANTS.solana.WRAPPED
const USD = CONSTANTS.solana.USD

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
      token === NATIVE && path[index+1] != WRAPPED &&
      path[index-1] != WRAPPED
    ) {
      return WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == NATIVE && fixedPath[1] == WRAPPED) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == NATIVE && fixedPath[fixedPath.length-2] == WRAPPED) {
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
    [tokenIn, tokenOut].includes(NATIVE) &&
    [tokenIn, tokenOut].includes(WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != WRAPPED &&
    tokenIn != NATIVE &&
    await pathExists([tokenIn, WRAPPED]) &&
    tokenOut != WRAPPED &&
    tokenOut != NATIVE &&
    await pathExists([tokenOut, WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, WRAPPED, tokenOut]
  } else if (
    tokenIn != USD &&
    await pathExists([tokenIn, USD]) &&
    tokenOut != USD &&
    await pathExists([tokenOut, USD])
  ) {
    // path via USD
    path = [tokenIn, USD, tokenOut]
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == NATIVE) {
    path.splice(1, 0, WRAPPED)
  } else if(path?.length && path[path.length-1] == NATIVE) {
    path.splice(path.length-1, 0, WRAPPED)
  }
  return { path, fixedPath: fixPath(path) }
}

export {
  findPath,
  fixPath,
  pathExists,
}
