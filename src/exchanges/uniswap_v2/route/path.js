import UniswapV2 from '../basics'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { request } from '@depay/web3-client'
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
      token === CONSTANTS.ethereum.NATIVE && path[index+1] != CONSTANTS.ethereum.WRAPPED &&
      path[index-1] != CONSTANTS.ethereum.WRAPPED
    ) {
      return CONSTANTS.ethereum.WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == CONSTANTS.ethereum.NATIVE && fixedPath[1] == CONSTANTS.ethereum.WRAPPED) {
    fixedPath.splice(0, 1)
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.ethereum.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.ethereum.WRAPPED) {
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
    blockchain: 'ethereum',
    address: UniswapV2.contracts.factory.address,
    method: 'getPair'
  }, { api: UniswapV2.contracts.factory.api, cache: 3600000, params: fixUniswapPath(path) })
  if(pair == CONSTANTS.ethereum.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'ethereum', address: pair, method: 'getReserves' }, { api: UniswapV2.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token0' }, { api: UniswapV2.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token1' }, { api: UniswapV2.contracts.pair.api, cache: 3600000 })
  ])
  if(path.includes(CONSTANTS.ethereum.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.ethereum.WRAPPED, decimals: CONSTANTS.ethereum.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.ethereum.USD)) {
    let token = new Token({ blockchain: 'ethereum', address: CONSTANTS.ethereum.USD })
    let decimals = await token.decimals()
    return minReserveRequirements({ min: 1000, token: CONSTANTS.ethereum.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.WRAPPED)
  ) { return }

  let path
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.ethereum.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.ethereum.USD &&
    await pathExists([tokenIn, CONSTANTS.ethereum.USD]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists([CONSTANTS.ethereum.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.USD, CONSTANTS.ethereum.WRAPPED, tokenOut]
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.USD &&
    await pathExists([CONSTANTS.ethereum.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, CONSTANTS.ethereum.USD, tokenOut]
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == CONSTANTS.ethereum.NATIVE) {
    path.splice(1, 0, CONSTANTS.ethereum.WRAPPED)
  } else if(path?.length && path[path.length-1] == CONSTANTS.ethereum.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.ethereum.WRAPPED)
  }

  return path
}

export {
  fixUniswapPath,
  pathExists,
  findPath
}
