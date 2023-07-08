import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const exchange = {
  
  name: 'wavax',
  label: 'Wrapped Avax',
  logo: Blockchains.avalanche.wrapped.logo,
  
  slippage: false,
  
  blockchains: ['avalanche'],

  avalanche: {
    router: {
      address: Blockchains.avalanche.wrapped.address,
      api: WETH.WETH
    },
  }
}

export default new Exchange(

  Object.assign(exchange, {
    findPath: ({ blockchain, tokenIn, tokenOut })=>
      WETH.findPath(blockchain, { tokenIn, tokenOut }),
    pathExists: (blockchain, path)=>
      WETH.pathExists(blockchain, path),
    getAmounts: WETH.getAmounts,
    getTransaction: ({ blockchain, path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
      WETH.getTransaction(blockchain, exchange ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
  })
)
