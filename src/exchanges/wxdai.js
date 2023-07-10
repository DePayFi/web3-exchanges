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
      findPath: (args)=>WETH.findPath({ ...args, exchange }),
      pathExists: (args)=>WETH.pathExists({ ...args, exchange }),
      getAmounts: (args)=>WETH.getAmounts({ ...args, exchange }),
      getTransaction: (args)=>WETH.getTransaction({ ...args, exchange }),
    })
  )
}
