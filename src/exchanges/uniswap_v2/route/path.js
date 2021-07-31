import UniswapV2 from '../basics'
import { CONSTANTS } from 'depay-web3-constants'
import { request } from 'depay-web3-client'

// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
// we keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
let fixUniswapPath = (path) => {
  return path.map((token) => {
    if (token === CONSTANTS.ethereum.NATIVE) {
      return CONSTANTS.ethereum.WRAPPED
    } else {
      return token
    }
  })
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
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    return [tokenIn, tokenOut]
  } else if (
    (await pathExists([tokenIn, CONSTANTS.ethereum.WRAPPED])) &&
    (await pathExists([tokenOut, CONSTANTS.ethereum.WRAPPED]))
  ) {
    // path via WRAPPED
    return [tokenIn, CONSTANTS.ethereum.WRAPPED, tokenOut]
  }
}

export {
  fixUniswapPath,
  pathExists,
  findPath
}
