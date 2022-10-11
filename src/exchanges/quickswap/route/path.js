import QuickSwap from '../basics'
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
      token === CONSTANTS.polygon.NATIVE && path[index+1] != CONSTANTS.polygon.WRAPPED &&
      path[index-1] != CONSTANTS.polygon.WRAPPED
    ) {
      return CONSTANTS.polygon.WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == CONSTANTS.polygon.NATIVE && fixedPath[1] == CONSTANTS.polygon.WRAPPED) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.polygon.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.polygon.WRAPPED) {
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
    blockchain: 'polygon',
    address: QuickSwap.factory.address,
    method: 'getPair',
    api: QuickSwap.factory.api, 
    cache: 3600000, 
    params: fixPath(path) 
  })
  if(pair == CONSTANTS.polygon.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'polygon', address: pair, method: 'getReserves', api: QuickSwap.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token0', api: QuickSwap.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token1', api: QuickSwap.pair.api, cache: 3600000 })
  ])
  if(path.includes(CONSTANTS.polygon.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.polygon.WRAPPED, decimals: CONSTANTS.polygon.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.polygon.USD)) {
    let token = new Token({ blockchain: 'polygon', address: CONSTANTS.polygon.USD })
    let decimals = await token.decimals()
    return minReserveRequirements({ min: 1000, token: CONSTANTS.polygon.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.WRAPPED)
  ) { return }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.polygon.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.polygon.USD &&
    await pathExists([tokenIn, CONSTANTS.polygon.USD]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists([CONSTANTS.polygon.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.USD, CONSTANTS.polygon.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.USD &&
    await pathExists([CONSTANTS.polygon.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, CONSTANTS.polygon.USD, tokenOut]
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == CONSTANTS.polygon.NATIVE) {
    path.splice(1, 0, CONSTANTS.polygon.WRAPPED)
  } else if(path?.length && path[path.length-1] == CONSTANTS.polygon.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.polygon.WRAPPED)
  }

  return { path, fixedPath: fixPath(path) }
}

export {
  fixPath,
  pathExists,
  findPath
}
