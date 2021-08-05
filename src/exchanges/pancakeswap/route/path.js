import PancakeSwap from '../basics'
import { CONSTANTS } from 'depay-web3-constants'
import { request } from 'depay-web3-client'

// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixUniswapPath = (path) => {
  let fixedPath = path.map((token, index) => {
    if (token === CONSTANTS.bsc.NATIVE && path[index+1] != CONSTANTS.bsc.WRAPPED) {
      return CONSTANTS.bsc.WRAPPED
    } else {
      return token
    }
  })

  if(fixedPath[0] == CONSTANTS.bsc.NATIVE && fixedPath[1] == CONSTANTS.bsc.WRAPPED) {
    fixedPath.splice(0, 1)
  }

  return fixedPath
}

let pathExists = async (path) => {
  let pair = await request({
    blockchain: 'bsc',
    address: PancakeSwap.contracts.factory.address,
    method: 'getPair'
  }, {
    api: PancakeSwap.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath(path),
  })
  return pair != CONSTANTS.bsc.ZERO
}

let findPath = async ({ tokenIn, tokenOut }) => {
  let path
  
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut]
  } else if (
    (await pathExists([tokenIn, CONSTANTS.bsc.WRAPPED])) &&
    (await pathExists([tokenOut, CONSTANTS.bsc.WRAPPED]))
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, tokenOut]
  }

  // Add WRAPPED to route path if things start with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == CONSTANTS.bsc.NATIVE) {
    path.splice(1, 0, CONSTANTS.bsc.WRAPPED)
  }

  return path
}

export {
  fixUniswapPath,
  pathExists,
  findPath
}
