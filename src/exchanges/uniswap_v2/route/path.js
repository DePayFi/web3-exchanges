import UniswapV2 from '../basics'
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

let pathExists = async (path) => {
  let pair = await request({
    blockchain: 'ethereum',
    address: UniswapV2.contracts.factory.address,
    method: 'getPair'
  }, {
    api: UniswapV2.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath(path),
  })
  return pair != CONSTANTS.ethereum.ZERO
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
    (await pathExists([tokenIn, CONSTANTS.ethereum.WRAPPED])) &&
    (await pathExists([tokenOut, CONSTANTS.ethereum.WRAPPED]))
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, tokenOut]
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
