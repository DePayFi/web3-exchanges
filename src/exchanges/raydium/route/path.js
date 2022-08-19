import basics from '../basics'
import { CONSTANTS } from '@depay/web3-constants'
import { request } from '@depay/web3-client'

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
  let fixedPath = fixPath(path)
  let pairs = await request(`solana://${basics.pair.v4.address}/getProgramAccounts`, {
    params: { filters: [
      { dataSize: basics.pair.v4.api.span },
      { memcmp: { offset: 400, bytes: fixedPath[0] }}, // baseMint
      { memcmp: { offset: 432, bytes: fixedPath[1] }}  // quoteMint
    ]},
    api: basics.pair.v4.api
  })
  if(pairs.length == 0) { 
    return false
  } else {
    return true
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(NATIVE) &&
    [tokenIn, tokenOut].includes(WRAPPED)
  ) { return }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != WRAPPED &&
    await pathExists([tokenIn, WRAPPED]) &&
    tokenOut != WRAPPED &&
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

  return path
}

export {
  findPath,
  fixPath
}
