/*#if _EVM

import Token from '@depay/web3-tokens-evm'
import { request } from '@depay/web3-client-evm'

/*#elif _SVM

//#else */

import Token from '@depay/web3-tokens'
import { request } from '@depay/web3-client'

//#endif

import Blockchains from '@depay/web3-blockchains'

// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
const getExchangePath = ({ blockchain, path }) => {
  if(!path) { return }
  let exchangePath = path.map((token, index) => {
    if (
      token === Blockchains[blockchain].currency.address && path[index+1] != Blockchains[blockchain].wrapped.address &&
      path[index-1] != Blockchains[blockchain].wrapped.address
    ) {
      return Blockchains[blockchain].wrapped.address
    } else {
      return token
    }
  })

  if(exchangePath[0] == Blockchains[blockchain].currency.address && exchangePath[1] == Blockchains[blockchain].wrapped.address) {
    exchangePath.splice(0, 1)
  } else if(exchangePath[exchangePath.length-1] == Blockchains[blockchain].currency.address && exchangePath[exchangePath.length-2] == Blockchains[blockchain].wrapped.address) {
    exchangePath.splice(exchangePath.length-1, 1)
  }

  return exchangePath
}

const getBestPool = async ({ exchange, blockchain, path, amountIn, amountOut, block }) => {
  path = getExchangePath({ blockchain, path })
  
  let bestPool
    
  if(amountIn) {

    bestPool = await request({
      blockchain: Blockchains[blockchain].name,
      address: exchange[blockchain].quoter.address,
      method: 'findBestPathFromAmountIn',
      api: exchange[blockchain].quoter.api,
      cache: 5,
      block,
      params: {
        route: path,
        amountIn,
      },
    }).catch(()=>{})

  } else { // amountOut

    bestPool = await request({
      blockchain: Blockchains[blockchain].name,
      address: exchange[blockchain].quoter.address,
      method: 'findBestPathFromAmountOut',
      api: exchange[blockchain].quoter.api,
      cache: 5,
      block,
      params: {
        route: path,
        amountOut
      },
    }).catch(()=>{})
  }

  if(!bestPool || bestPool.virtualAmountsWithoutSlippage.some((amount)=>amount.toString() === '0')) {
    return
  }

  return bestPool
}

const pathExists = async ({ exchange, blockchain, path, amountIn, amountOut, amountInMax, amountOutMin }) => {
  return !!(await getBestPool({ exchange, blockchain, path, amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) }))
}

const findPath = async ({ exchange, blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
  if(
    [tokenIn, tokenOut].includes(Blockchains[blockchain].currency.address) &&
    [tokenIn, tokenOut].includes(Blockchains[blockchain].wrapped.address)
  ) { return { path: undefined, exchangePath: undefined } }

  let path
  let pools = []

  // DIRECT PATH
  pools = [
    await getBestPool({ exchange, blockchain, path: [tokenIn, tokenOut], amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) })
  ]
  if (pools.filter(Boolean).length) {
    path = [tokenIn, tokenOut]
  }

  // PATH VIA WRAPPED
  if(
    !path &&
    tokenIn != Blockchains[blockchain].wrapped.address &&
    tokenOut != Blockchains[blockchain].wrapped.address
  ) {
    pools = []
    if(amountOut || amountOutMin){
      pools.push(await getBestPool({ exchange, blockchain, path: [Blockchains[blockchain].wrapped.address, tokenOut], amountOut: (amountOut || amountOutMin) }))
      if(pools.filter(Boolean).length) {
        pools.unshift(await getBestPool({ exchange, blockchain, path: [tokenIn, Blockchains[blockchain].wrapped.address], amountOut: pools[0].virtualAmountsWithoutSlippage[0] }))
      }
    } else { // amountIn
      pools.push(await getBestPool({ exchange, blockchain, path: [tokenIn, Blockchains[blockchain].wrapped.address], amountIn: (amountIn || amountInMax) }))
      if(pools.filter(Boolean).length) {
        pools.push(await getBestPool({ exchange, blockchain, path: [Blockchains[blockchain].wrapped.address, tokenOut], amountIn: pools[0].virtualAmountsWithoutSlippage[1] }))
      }
    }
    if (pools.filter(Boolean).length === 2) {
      // path via WRAPPED
      path = [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]
    }
  }

  // PATH VIA USD STABLE
  if(
    !path
  ) {
    pools = []
    let allPoolsForAllUSD = await Promise.all(Blockchains[blockchain].stables.usd.map(async(stable)=>{
      let pools = []
      if(amountOut || amountOutMin){
        pools.push(await getBestPool({ exchange, blockchain, path: [stable, tokenOut], amountOut: (amountOut || amountOutMin) }))
        if(pools.filter(Boolean).length) {
          pools.unshift(await getBestPool({ exchange, blockchain, path: [tokenIn, stable], amountOut: pools[0].virtualAmountsWithoutSlippage[0] }))
        }
      } else { // amountIn
        pools.push(await getBestPool({ exchange, blockchain, path: [tokenIn, stable], amountIn: (amountIn || amountInMax) }))
        if(pools.filter(Boolean).length) {
          pools.push(await getBestPool({ exchange, blockchain, path: [stable, tokenOut], amountIn: pools[0].virtualAmountsWithoutSlippage[1] }))
        }
      }
      if(pools.filter(Boolean).length === 2) {
        return [stable, pools]
      }
    }))

    let usdPath = allPoolsForAllUSD.filter(Boolean)[0]
    if(usdPath) {
      path = [tokenIn, usdPath[0], tokenOut]
      pools = usdPath[1]
    }
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(path?.length && path[0] == Blockchains[blockchain].currency.address) {
    path.splice(1, 0, Blockchains[blockchain].wrapped.address)
  } else if(path?.length && path[path.length-1] == Blockchains[blockchain].currency.address) {
    path.splice(path.length-1, 0, Blockchains[blockchain].wrapped.address)
  }

  if(!path) { pools = [] }
  return { path, pools, exchangePath: getExchangePath({ blockchain, path }) }
}

let getAmountOut = async({ exchange, blockchain, path, pools, amountIn }) => {
  let bestPath = await request({
    blockchain: Blockchains[blockchain].name,
    address: exchange[blockchain].quoter.address,
    method: 'findBestPathFromAmountIn',
    api: exchange[blockchain].quoter.api,
    cache: 5,
    params: {
      route: getExchangePath({ blockchain, path }),
      amountIn,
    },
  }).catch(()=>{})
  if(bestPath) {
    return bestPath.virtualAmountsWithoutSlippage[bestPath.virtualAmountsWithoutSlippage.length-1]
  }
}

let getAmountIn = async ({ exchange, blockchain, path, pools, amountOut, block }) => {
  let bestPath = await request({
    blockchain: Blockchains[blockchain].name,
    address: exchange[blockchain].quoter.address,
    method: 'findBestPathFromAmountOut',
    api: exchange[blockchain].quoter.api,
    cache: 5,
    block,
    params: {
      route: getExchangePath({ blockchain, path }),
      amountOut
    },
  }).catch(()=>{})
  if(bestPath) {
    return bestPath.virtualAmountsWithoutSlippage[0]
  }
}

let getAmounts = async ({
  exchange,
  blockchain,
  path,
  pools,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn({ exchange, blockchain, block, path, pools, amountOut, tokenIn, tokenOut })
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    amountOut = await getAmountOut({ exchange, blockchain, path, pools, amountIn, tokenIn, tokenOut })
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn({ exchange, blockchain, block, path, pools, amountOut: amountOutMin, tokenIn, tokenOut })
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut({ exchange, blockchain, path, pools, amountIn: amountInMax, tokenIn, tokenOut })
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
}

let getPrep = async({
  exchange,
  blockchain,
  tokenIn,
  amountIn,
  account
})=> {

  if(tokenIn === Blockchains[blockchain].currency.address) { return } // NATIVE

  const allowance = await request({
    blockchain,
    address: tokenIn,
    method: 'allowance',
    api: Token[blockchain]['20'],
    params: [account, exchange[blockchain].router.address]
  })

  if(allowance.gte(amountIn)) { return }

  let transaction = {
    blockchain,
    from: account,
    to: tokenIn,
    api: Token[blockchain]['20'],
    method: 'approve',
    params: [exchange[blockchain].router.address, amountIn.sub(allowance)]
  }
  
  return { transaction }
}

let getTransaction = async({
  exchange,
  blockchain,
  pools,
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  account
}) => {

  const transaction = {
    blockchain,
    from: account,
    to: exchange[blockchain].router.address,
    api: exchange[blockchain].router.api
  }

  const deadline = Math.round(Date.now() / 1000) + 60 * 60 * 24 // 24 hours

  const fullPath = [
    pools.map((pool)=>pool.binSteps[0]),
    pools.map((pool)=>pool.versions[0]),
    getExchangePath({ blockchain, path })
  ]

  if(path[0] === Blockchains[blockchain].currency.address) { // NATIVE START
    if(amountInMaxInput) {
      transaction.method = 'swapNATIVEForExactTokens'
      transaction.params = {
        amountOut,
        path: fullPath,
        to: account,
        deadline,
      }
      transaction.value = amountInMax
    } else {
      transaction.method = 'swapExactNATIVEForTokens'
      transaction.params = {
        amountOutMin: (amountOutMin || amountOut),
        path: fullPath,
        to: account,
        deadline,
      }
      transaction.value = amountIn
    }
  } else if (path[path.length-1] === Blockchains[blockchain].currency.address) { // NATIVE END
    if(amountInMaxInput) {
      transaction.method = 'swapTokensForExactNATIVE'
      transaction.params = {
        amountNATIVEOut: amountOut,
        amountInMax,
        path: fullPath,
        to: account,
        deadline,
      }
    } else {
      transaction.method = 'swapExactTokensForNATIVE'
      transaction.params = {
        amountIn,
        amountOutMinNATIVE: (amountOutMin || amountOut),
        path: fullPath,
        to: account,
        deadline,
      }
    }
  } else { // TOKENS
    if(amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens'
      transaction.params = {
        amountOut,
        amountInMax,
        path: fullPath,
        to: account,
        deadline,
      }
    } else {
      transaction.method = 'swapExactTokensForTokens'
      transaction.params = {
        amountIn,
        amountOutMin: (amountOutMin || amountOut),
        path: fullPath,
        to: account,
        deadline,
      }
    }
  }

  return transaction
}

const ROUTER = [{"inputs":[{"internalType":"contract ILBFactory","name":"factory","type":"address"},{"internalType":"contract IJoeFactory","name":"factoryV1","type":"address"},{"internalType":"contract ILBLegacyFactory","name":"legacyFactory","type":"address"},{"internalType":"contract ILBLegacyRouter","name":"legacyRouter","type":"address"},{"internalType":"contract IWNATIVE","name":"wnative","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AddressHelper__CallFailed","type":"error"},{"inputs":[],"name":"AddressHelper__NonContract","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientAmount","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientLiquidity","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountSlippage","type":"uint256"}],"name":"LBRouter__AmountSlippageBPTooBig","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"}],"name":"LBRouter__AmountSlippageCaught","type":"error"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"LBRouter__BinReserveOverflows","type":"error"},{"inputs":[],"name":"LBRouter__BrokenSwapSafetyCheck","type":"error"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"currentTimestamp","type":"uint256"}],"name":"LBRouter__DeadlineExceeded","type":"error"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LBRouter__FailedToSendNATIVE","type":"error"},{"inputs":[{"internalType":"uint256","name":"idDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"}],"name":"LBRouter__IdDesiredOverflows","type":"error"},{"inputs":[{"internalType":"int256","name":"id","type":"int256"}],"name":"LBRouter__IdOverflows","type":"error"},{"inputs":[{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"uint256","name":"activeId","type":"uint256"}],"name":"LBRouter__IdSlippageCaught","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"LBRouter__InsufficientAmountOut","type":"error"},{"inputs":[{"internalType":"address","name":"wrongToken","type":"address"}],"name":"LBRouter__InvalidTokenPath","type":"error"},{"inputs":[{"internalType":"uint256","name":"version","type":"uint256"}],"name":"LBRouter__InvalidVersion","type":"error"},{"inputs":[],"name":"LBRouter__LengthsMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"name":"LBRouter__MaxAmountInExceeded","type":"error"},{"inputs":[],"name":"LBRouter__NotFactoryOwner","type":"error"},{"inputs":[{"internalType":"address","name":"tokenX","type":"address"},{"internalType":"address","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBRouter__PairNotCreated","type":"error"},{"inputs":[],"name":"LBRouter__SenderIsNotWNATIVE","type":"error"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"LBRouter__SwapOverflows","type":"error"},{"inputs":[{"internalType":"uint256","name":"excess","type":"uint256"}],"name":"LBRouter__TooMuchTokensIn","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"reserve","type":"uint256"}],"name":"LBRouter__WrongAmounts","type":"error"},{"inputs":[{"internalType":"address","name":"tokenX","type":"address"},{"internalType":"address","name":"tokenY","type":"address"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"msgValue","type":"uint256"}],"name":"LBRouter__WrongNativeLiquidityParameters","type":"error"},{"inputs":[],"name":"LBRouter__WrongTokenOrder","type":"error"},{"inputs":[],"name":"TokenHelper__TransferFailed","type":"error"},{"inputs":[{"components":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"int256[]","name":"deltaIds","type":"int256[]"},{"internalType":"uint256[]","name":"distributionX","type":"uint256[]"},{"internalType":"uint256[]","name":"distributionY","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"refundTo","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ILBRouter.LiquidityParameters","name":"liquidityParameters","type":"tuple"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountXAdded","type":"uint256"},{"internalType":"uint256","name":"amountYAdded","type":"uint256"},{"internalType":"uint256","name":"amountXLeft","type":"uint256"},{"internalType":"uint256","name":"amountYLeft","type":"uint256"},{"internalType":"uint256[]","name":"depositIds","type":"uint256[]"},{"internalType":"uint256[]","name":"liquidityMinted","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"int256[]","name":"deltaIds","type":"int256[]"},{"internalType":"uint256[]","name":"distributionX","type":"uint256[]"},{"internalType":"uint256[]","name":"distributionY","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"refundTo","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ILBRouter.LiquidityParameters","name":"liquidityParameters","type":"tuple"}],"name":"addLiquidityNATIVE","outputs":[{"internalType":"uint256","name":"amountXAdded","type":"uint256"},{"internalType":"uint256","name":"amountYAdded","type":"uint256"},{"internalType":"uint256","name":"amountXLeft","type":"uint256"},{"internalType":"uint256","name":"amountYLeft","type":"uint256"},{"internalType":"uint256[]","name":"depositIds","type":"uint256[]"},{"internalType":"uint256[]","name":"liquidityMinted","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint24","name":"activeId","type":"uint24"},{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"createLBPair","outputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getFactory","outputs":[{"internalType":"contract ILBFactory","name":"lbFactory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"getIdFromPrice","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyFactory","outputs":[{"internalType":"contract ILBLegacyFactory","name":"legacyLBfactory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyRouter","outputs":[{"internalType":"contract ILBLegacyRouter","name":"legacyRouter","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint24","name":"id","type":"uint24"}],"name":"getPriceFromId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapIn","outputs":[{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"uint128","name":"amountOutLeft","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapOut","outputs":[{"internalType":"uint128","name":"amountInLeft","type":"uint128"},{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getV1Factory","outputs":[{"internalType":"contract IJoeFactory","name":"factoryV1","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWNATIVE","outputs":[{"internalType":"contract IWNATIVE","name":"wnative","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountNATIVEMin","type":"uint256"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityNATIVE","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountNATIVE","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactNATIVEForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactNATIVEForTokensSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinNATIVE","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForNATIVE","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinNATIVE","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForNATIVESupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapNATIVEForExactTokens","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountNATIVEOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactNATIVE","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"sweep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ILBToken","name":"lbToken","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"sweepLBToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
const FACTORY = [{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"},{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"LBFactory__AddressZero","type":"error"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__BinStepHasNoPreset","type":"error"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__BinStepTooLow","type":"error"},{"inputs":[{"internalType":"uint256","name":"fees","type":"uint256"},{"internalType":"uint256","name":"maxFees","type":"uint256"}],"name":"LBFactory__FlashLoanFeeAboveMax","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"LBFactory__IdenticalAddresses","type":"error"},{"inputs":[],"name":"LBFactory__ImplementationNotSet","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"_binStep","type":"uint256"}],"name":"LBFactory__LBPairAlreadyExists","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__LBPairDoesNotExist","type":"error"},{"inputs":[],"name":"LBFactory__LBPairIgnoredIsAlreadyInTheSameState","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__LBPairNotCreated","type":"error"},{"inputs":[{"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBFactory__LBPairSafetyCheckFailed","type":"error"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__PresetIsLockedForUsers","type":"error"},{"inputs":[],"name":"LBFactory__PresetOpenStateIsAlreadyInTheSameState","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"LBFactory__QuoteAssetAlreadyWhitelisted","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"LBFactory__QuoteAssetNotWhitelisted","type":"error"},{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"LBFactory__SameFeeRecipient","type":"error"},{"inputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"name":"LBFactory__SameFlashLoanFee","type":"error"},{"inputs":[{"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBFactory__SameImplementation","type":"error"},{"inputs":[],"name":"PairParametersHelper__InvalidParameter","type":"error"},{"inputs":[],"name":"PendingOwnable__AddressZero","type":"error"},{"inputs":[],"name":"PendingOwnable__NoPendingOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__NotOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__NotPendingOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__PendingOwnerAlreadySet","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds16Bits","type":"error"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"int256","name":"y","type":"int256"}],"name":"Uint128x128Math__PowUnderflow","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":false,"internalType":"address","name":"newRecipient","type":"address"}],"name":"FeeRecipientSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFlashLoanFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFlashLoanFee","type":"uint256"}],"name":"FlashLoanFeeSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"tokenX","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"tokenY","type":"address"},{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":false,"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"indexed":false,"internalType":"uint256","name":"pid","type":"uint256"}],"name":"LBPairCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"indexed":false,"internalType":"bool","name":"ignored","type":"bool"}],"name":"LBPairIgnoredStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldLBPairImplementation","type":"address"},{"indexed":false,"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBPairImplementationSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"pendingOwner","type":"address"}],"name":"PendingOwnerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":true,"internalType":"bool","name":"isOpen","type":"bool"}],"name":"PresetOpenStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"PresetRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"baseFactor","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"filterPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"decayPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"reductionFactor","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"variableFeeControl","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"protocolShare","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxVolatilityAccumulator","type":"uint256"}],"name":"PresetSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"QuoteAssetAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"QuoteAssetRemoved","type":"event"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"addQuoteAsset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"becomeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint24","name":"activeId","type":"uint24"},{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"createLBPair","outputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"name":"forceDecay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllBinSteps","outputs":[{"internalType":"uint256[]","name":"binStepWithPreset","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"}],"name":"getAllLBPairs","outputs":[{"components":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"internalType":"bool","name":"createdByOwner","type":"bool"},{"internalType":"bool","name":"ignoredForRouting","type":"bool"}],"internalType":"struct ILBFactory.LBPairInformation[]","name":"lbPairsAvailable","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeRecipient","outputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFlashLoanFee","outputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getLBPairAtIndex","outputs":[{"internalType":"contract ILBPair","name":"lbPair","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLBPairImplementation","outputs":[{"internalType":"address","name":"lbPairImplementation","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenA","type":"address"},{"internalType":"contract IERC20","name":"tokenB","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"getLBPairInformation","outputs":[{"components":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"internalType":"bool","name":"createdByOwner","type":"bool"},{"internalType":"bool","name":"ignoredForRouting","type":"bool"}],"internalType":"struct ILBFactory.LBPairInformation","name":"lbPairInformation","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMaxFlashLoanFee","outputs":[{"internalType":"uint256","name":"maxFee","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getMinBinStep","outputs":[{"internalType":"uint256","name":"minBinStep","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getNumberOfLBPairs","outputs":[{"internalType":"uint256","name":"lbPairNumber","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNumberOfQuoteAssets","outputs":[{"internalType":"uint256","name":"numberOfQuoteAssets","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOpenBinSteps","outputs":[{"internalType":"uint256[]","name":"openBinStep","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"getPreset","outputs":[{"internalType":"uint256","name":"baseFactor","type":"uint256"},{"internalType":"uint256","name":"filterPeriod","type":"uint256"},{"internalType":"uint256","name":"decayPeriod","type":"uint256"},{"internalType":"uint256","name":"reductionFactor","type":"uint256"},{"internalType":"uint256","name":"variableFeeControl","type":"uint256"},{"internalType":"uint256","name":"protocolShare","type":"uint256"},{"internalType":"uint256","name":"maxVolatilityAccumulator","type":"uint256"},{"internalType":"bool","name":"isOpen","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getQuoteAssetAtIndex","outputs":[{"internalType":"contract IERC20","name":"asset","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"isQuoteAsset","outputs":[{"internalType":"bool","name":"isQuote","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"removePreset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"removeQuoteAsset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"revokePendingOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"setFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"}],"name":"setFeesParametersOnPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"name":"setFlashLoanFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"bool","name":"ignored","type":"bool"}],"name":"setLBPairIgnored","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newLBPairImplementation","type":"address"}],"name":"setLBPairImplementation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"pendingOwner_","type":"address"}],"name":"setPendingOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"},{"internalType":"bool","name":"isOpen","type":"bool"}],"name":"setPreset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"bool","name":"isOpen","type":"bool"}],"name":"setPresetOpenState","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const PAIR = [{"inputs":[{"internalType":"contract ILBFactory","name":"factory_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AddressHelper__CallFailed","type":"error"},{"inputs":[],"name":"AddressHelper__NonContract","type":"error"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"BinHelper__CompositionFactorFlawed","type":"error"},{"inputs":[],"name":"BinHelper__LiquidityOverflow","type":"error"},{"inputs":[],"name":"FeeHelper__FeeTooLarge","type":"error"},{"inputs":[],"name":"LBPair__AddressZero","type":"error"},{"inputs":[],"name":"LBPair__AlreadyInitialized","type":"error"},{"inputs":[],"name":"LBPair__EmptyMarketConfigs","type":"error"},{"inputs":[],"name":"LBPair__FlashLoanCallbackFailed","type":"error"},{"inputs":[],"name":"LBPair__FlashLoanInsufficientAmount","type":"error"},{"inputs":[],"name":"LBPair__InsufficientAmountIn","type":"error"},{"inputs":[],"name":"LBPair__InsufficientAmountOut","type":"error"},{"inputs":[],"name":"LBPair__InvalidInput","type":"error"},{"inputs":[],"name":"LBPair__InvalidStaticFeeParameters","type":"error"},{"inputs":[],"name":"LBPair__MaxTotalFeeExceeded","type":"error"},{"inputs":[],"name":"LBPair__OnlyFactory","type":"error"},{"inputs":[],"name":"LBPair__OnlyProtocolFeeRecipient","type":"error"},{"inputs":[],"name":"LBPair__OutOfLiquidity","type":"error"},{"inputs":[],"name":"LBPair__TokenNotSupported","type":"error"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"LBPair__ZeroAmount","type":"error"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"LBPair__ZeroAmountsOut","type":"error"},{"inputs":[],"name":"LBPair__ZeroBorrowAmount","type":"error"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"LBPair__ZeroShares","type":"error"},{"inputs":[],"name":"LBToken__AddressThisOrZero","type":"error"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LBToken__BurnExceedsBalance","type":"error"},{"inputs":[],"name":"LBToken__InvalidLength","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"LBToken__SelfApproval","type":"error"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"LBToken__SpenderNotApproved","type":"error"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LBToken__TransferExceedsBalance","type":"error"},{"inputs":[],"name":"LiquidityConfigurations__InvalidConfig","type":"error"},{"inputs":[],"name":"OracleHelper__InvalidOracleId","type":"error"},{"inputs":[],"name":"OracleHelper__LookUpTimestampTooOld","type":"error"},{"inputs":[],"name":"OracleHelper__NewLengthTooSmall","type":"error"},{"inputs":[],"name":"PackedUint128Math__AddOverflow","type":"error"},{"inputs":[],"name":"PackedUint128Math__MultiplierTooLarge","type":"error"},{"inputs":[],"name":"PackedUint128Math__SubUnderflow","type":"error"},{"inputs":[],"name":"PairParametersHelper__InvalidParameter","type":"error"},{"inputs":[],"name":"ReentrancyGuard__ReentrantCall","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds128Bits","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds24Bits","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds40Bits","type":"error"},{"inputs":[],"name":"TokenHelper__TransferFailed","type":"error"},{"inputs":[],"name":"Uint128x128Math__LogUnderflow","type":"error"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"int256","name":"y","type":"int256"}],"name":"Uint128x128Math__PowUnderflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulDivOverflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulShiftOverflow","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"feeRecipient","type":"address"},{"indexed":false,"internalType":"bytes32","name":"protocolFees","type":"bytes32"}],"name":"CollectedProtocolFees","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint24","name":"id","type":"uint24"},{"indexed":false,"internalType":"bytes32","name":"totalFees","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"protocolFees","type":"bytes32"}],"name":"CompositionFees","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"bytes32[]","name":"amounts","type":"bytes32[]"}],"name":"DepositedToBins","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"contract ILBFlashLoanCallback","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint24","name":"activeId","type":"uint24"},{"indexed":false,"internalType":"bytes32","name":"amounts","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"totalFees","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"protocolFees","type":"bytes32"}],"name":"FlashLoan","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint24","name":"idReference","type":"uint24"},{"indexed":false,"internalType":"uint24","name":"volatilityReference","type":"uint24"}],"name":"ForcedDecay","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint16","name":"oracleLength","type":"uint16"}],"name":"OracleLengthIncreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint16","name":"baseFactor","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"indexed":false,"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"indexed":false,"internalType":"uint16","name":"protocolShare","type":"uint16"},{"indexed":false,"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"}],"name":"StaticFeeParametersSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint24","name":"id","type":"uint24"},{"indexed":false,"internalType":"bytes32","name":"amountsIn","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"amountsOut","type":"bytes32"},{"indexed":false,"internalType":"uint24","name":"volatilityAccumulator","type":"uint24"},{"indexed":false,"internalType":"bytes32","name":"totalFees","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"protocolFees","type":"bytes32"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"bytes32[]","name":"amounts","type":"bytes32[]"}],"name":"WithdrawnFromBins","type":"event"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"approveForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"batchBalances","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"batchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amountsToBurn","type":"uint256[]"}],"name":"burn","outputs":[{"internalType":"bytes32[]","name":"amounts","type":"bytes32[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"collectProtocolFees","outputs":[{"internalType":"bytes32","name":"collectedProtocolFees","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ILBFlashLoanCallback","name":"receiver","type":"address"},{"internalType":"bytes32","name":"amounts","type":"bytes32"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"flashLoan","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"forceDecay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getActiveId","outputs":[{"internalType":"uint24","name":"activeId","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"getBin","outputs":[{"internalType":"uint128","name":"binReserveX","type":"uint128"},{"internalType":"uint128","name":"binReserveY","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBinStep","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getFactory","outputs":[{"internalType":"contract ILBFactory","name":"factory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"getIdFromPrice","outputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bool","name":"swapForY","type":"bool"},{"internalType":"uint24","name":"id","type":"uint24"}],"name":"getNextNonEmptyBin","outputs":[{"internalType":"uint24","name":"nextId","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOracleParameters","outputs":[{"internalType":"uint8","name":"sampleLifetime","type":"uint8"},{"internalType":"uint16","name":"size","type":"uint16"},{"internalType":"uint16","name":"activeSize","type":"uint16"},{"internalType":"uint40","name":"lastUpdated","type":"uint40"},{"internalType":"uint40","name":"firstTimestamp","type":"uint40"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint40","name":"lookupTimestamp","type":"uint40"}],"name":"getOracleSampleAt","outputs":[{"internalType":"uint64","name":"cumulativeId","type":"uint64"},{"internalType":"uint64","name":"cumulativeVolatility","type":"uint64"},{"internalType":"uint64","name":"cumulativeBinCrossed","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"id","type":"uint24"}],"name":"getPriceFromId","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getProtocolFees","outputs":[{"internalType":"uint128","name":"protocolFeeX","type":"uint128"},{"internalType":"uint128","name":"protocolFeeY","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint128","name":"reserveX","type":"uint128"},{"internalType":"uint128","name":"reserveY","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getStaticFeeParameters","outputs":[{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapIn","outputs":[{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"uint128","name":"amountOutLeft","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapOut","outputs":[{"internalType":"uint128","name":"amountInLeft","type":"uint128"},{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTokenX","outputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getTokenY","outputs":[{"internalType":"contract IERC20","name":"tokenY","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getVariableFeeParameters","outputs":[{"internalType":"uint24","name":"volatilityAccumulator","type":"uint24"},{"internalType":"uint24","name":"volatilityReference","type":"uint24"},{"internalType":"uint24","name":"idReference","type":"uint24"},{"internalType":"uint40","name":"timeOfLastUpdate","type":"uint40"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"newLength","type":"uint16"}],"name":"increaseOracleLength","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"},{"internalType":"uint24","name":"activeId","type":"uint24"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes32[]","name":"liquidityConfigs","type":"bytes32[]"},{"internalType":"address","name":"refundTo","type":"address"}],"name":"mint","outputs":[{"internalType":"bytes32","name":"amountsReceived","type":"bytes32"},{"internalType":"bytes32","name":"amountsLeft","type":"bytes32"},{"internalType":"uint256[]","name":"liquidityMinted","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"}],"name":"setStaticFeeParameters","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"swapForY","type":"bool"},{"internalType":"address","name":"to","type":"address"}],"name":"swap","outputs":[{"internalType":"bytes32","name":"amountsOut","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
const QUOTER = [{"inputs":[{"internalType":"address","name":"factoryV1","type":"address"},{"internalType":"address","name":"legacyFactoryV2","type":"address"},{"internalType":"address","name":"factoryV2","type":"address"},{"internalType":"address","name":"legacyRouterV2","type":"address"},{"internalType":"address","name":"routerV2","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"JoeLibrary__AddressZero","type":"error"},{"inputs":[],"name":"JoeLibrary__IdenticalAddresses","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientAmount","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientLiquidity","type":"error"},{"inputs":[],"name":"LBQuoter_InvalidLength","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds128Bits","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds24Bits","type":"error"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"int256","name":"y","type":"int256"}],"name":"Uint128x128Math__PowUnderflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulDivOverflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulShiftOverflow","type":"error"},{"inputs":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"uint128","name":"amountIn","type":"uint128"}],"name":"findBestPathFromAmountIn","outputs":[{"components":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"address[]","name":"pairs","type":"address[]"},{"internalType":"uint256[]","name":"binSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint128[]","name":"virtualAmountsWithoutSlippage","type":"uint128[]"},{"internalType":"uint128[]","name":"fees","type":"uint128[]"}],"internalType":"struct LBQuoter.Quote","name":"quote","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"uint128","name":"amountOut","type":"uint128"}],"name":"findBestPathFromAmountOut","outputs":[{"components":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"address[]","name":"pairs","type":"address[]"},{"internalType":"uint256[]","name":"binSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint128[]","name":"virtualAmountsWithoutSlippage","type":"uint128[]"},{"internalType":"uint128[]","name":"fees","type":"uint128[]"}],"internalType":"struct LBQuoter.Quote","name":"quote","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFactoryV1","outputs":[{"internalType":"address","name":"factoryV1","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFactoryV2","outputs":[{"internalType":"address","name":"factoryV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyFactoryV2","outputs":[{"internalType":"address","name":"legacyFactoryV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyRouterV2","outputs":[{"internalType":"address","name":"legacyRouterV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRouterV2","outputs":[{"internalType":"address","name":"routerV2","type":"address"}],"stateMutability":"view","type":"function"}]

export default {
  findPath,
  pathExists,
  getAmounts,
  getTransaction,
  getPrep,
  ROUTER,
  FACTORY,
  PAIR,
  QUOTER,
}
