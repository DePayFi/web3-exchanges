import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const blockchain = Blockchains.avalanche

const exchange = {
  blockchain: 'avalanche',
  name: 'wavax',
  label: 'Wrapped Avax',
  logo: blockchain.wrapped.logo,
  wrapper: {
    address: blockchain.wrapped.address,
    api: WETH.WETH
  },
  slippage: false,
}

export default new Exchange(

  Object.assign(exchange, {
    findPath: ({ tokenIn, tokenOut })=>
      WETH.findPath(blockchain, { tokenIn, tokenOut }),
    pathExists: (path)=>
      WETH.pathExists(blockchain, path),
    getAmounts: WETH.getAmounts,
    getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
      WETH.getTransaction(blockchain, exchange ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
  })
)
