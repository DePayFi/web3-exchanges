import PancakeSwap from '../basics'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { request } from 'depay-web3-client'
import { Token } from '@depay/web3-tokens'

// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixUniswapPath = (path) => {
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.bsc.NATIVE && path[index+1] != CONSTANTS.bsc.WRAPPED &&
      path[index-1] != CONSTANTS.bsc.WRAPPED
    ) {
      return CONSTANTS.bsc.WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == CONSTANTS.bsc.NATIVE && fixedPath[1] == CONSTANTS.bsc.WRAPPED) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.bsc.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.bsc.WRAPPED) {
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
  if(fixUniswapPath(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'bsc',
    address: PancakeSwap.contracts.factory.address,
    method: 'getPair'
  }, {
    api: PancakeSwap.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath(path),
  })
  if(pair == CONSTANTS.bsc.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'bsc', address: pair, method: 'getReserves' }, { api: PancakeSwap.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token0' }, { api: PancakeSwap.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token1' }, { api: PancakeSwap.contracts.pair.api, cache: 3600000 })
  ])
  if(path.includes(CONSTANTS.bsc.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.bsc.WRAPPED, decimals: CONSTANTS.bsc.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.bsc.USD)) {
    let token = new Token({ blockchain: 'bsc', address: CONSTANTS.bsc.USD })
    let decimals = await token.decimals()
    return minReserveRequirements({ min: 1000, token: CONSTANTS.bsc.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.WRAPPED)
  ) { return }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.bsc.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.bsc.USD &&
    await pathExists([tokenIn, CONSTANTS.bsc.USD]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists([CONSTANTS.bsc.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.USD, CONSTANTS.bsc.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.USD &&
    await pathExists([CONSTANTS.bsc.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, CONSTANTS.bsc.USD, tokenOut]
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == CONSTANTS.bsc.NATIVE) {
    path.splice(1, 0, CONSTANTS.bsc.WRAPPED)
  } else if(path?.length && path[path.length-1] == CONSTANTS.bsc.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.bsc.WRAPPED)
  }

  return path
}

export {
  fixUniswapPath,
  pathExists,
  findPath
}
