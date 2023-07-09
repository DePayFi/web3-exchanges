import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const exchange = {
  
  name: 'wxdai',
  label: 'Wrapped XDAI',
  logo: Blockchains.gnosis.wrapped.logo,

  slippage: false,

  blockchain: 'gnosis',
  
  gnosis: {
    router: {
      address: Blockchains.gnosis.wrapped.address,
      api: WETH.WETH
    },
  }
}

export default (scope)=>{
  
  return new Exchange(

    Object.assign(exchange, {
      scope,
      findPath: ({ blockchain, tokenIn, tokenOut })=>
        WETH.findPath(blockchain, { tokenIn, tokenOut }),
      pathExists: (blockchain, path)=>
        WETH.pathExists(blockchain, path),
      getAmounts: WETH.getAmounts,
      getTransaction: ({ blockchain, path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        WETH.getTransaction(blockchain, exchange ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  )
}
