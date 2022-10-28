import WagyuSwap from '../basics'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { request } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.velas.NATIVE && path[index+1] != CONSTANTS.velas.WRAPPED &&
      path[index-1] != CONSTANTS.velas.WRAPPED
    ) {
      return CONSTANTS.velas.WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == CONSTANTS.velas.NATIVE && fixedPath[1] == CONSTANTS.velas.WRAPPED) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.velas.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.velas.WRAPPED) {
    fixedPath.splice(fixedPath.length-1, 1)
  }

  return fixedPath
}

let minReserveRequirements = ({ reserves, min, token, token0, token1, decimals }) => {
  if(token0.toLowerCase() == token.toLowerCase()) {
    return reserves[0].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else if (token1.toLowerCase() == token.toLowerCase()) {
    return reserves[1].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else {
    return false
  }
}

let pathExists = async (path) => {
  if(fixPath(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'velas',
    address: WagyuSwap.factory.address,
    method: 'getPair',
    api: WagyuSwap.factory.api,
    cache: 3600000,
    params: fixPath(path) 
  })
  if(pair == CONSTANTS.velas.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'velas', address: pair, method: 'getReserves', api: WagyuSwap.pair.api, cache: 3600000 }),
    request({ blockchain: 'velas', address: pair, method: 'token0', api: WagyuSwap.pair.api, cache: 3600000 }),
    request({ blockchain: 'velas', address: pair, method: 'token1', api: WagyuSwap.pair.api, cache: 3600000 })
  ])
  if(path.includes(CONSTANTS.velas.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.velas.WRAPPED, decimals: CONSTANTS.velas.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.velas.USD)) {
    let token = new Token({ blockchain: 'velas', address: CONSTANTS.velas.USD })
    let decimals = await token.decimals()
    return minReserveRequirements({ min: 1000, token: CONSTANTS.velas.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.velas.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.velas.WRAPPED)
  ) { return }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.velas.WRAPPED]) &&
    tokenOut != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.velas.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.velas.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.velas.USD &&
    await pathExists([tokenIn, CONSTANTS.velas.USD]) &&
    tokenOut != CONSTANTS.velas.WRAPPED &&
    await pathExists([CONSTANTS.velas.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.velas.USD, CONSTANTS.velas.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.velas.WRAPPED]) &&
    tokenOut != CONSTANTS.velas.USD &&
    await pathExists([CONSTANTS.velas.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.velas.WRAPPED, CONSTANTS.velas.USD, tokenOut]
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == CONSTANTS.velas.NATIVE) {
    path.splice(1, 0, CONSTANTS.velas.WRAPPED)
  } else if(path?.length && path[path.length-1] == CONSTANTS.velas.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.velas.WRAPPED)
  }

  return { path, fixedPath: fixPath(path) }
}

export {
  fixPath,
  pathExists,
  findPath
}
