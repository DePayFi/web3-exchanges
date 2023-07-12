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

export default (scope)=>{
  
  return new Exchange(

    Object.assign(exchange, {
      scope,
      findPath: (args)=>WETH.findPath({ ...args, exchange }),
      pathExists: (args)=>WETH.pathExists({ ...args, exchange }),
      getAmounts: (args)=>WETH.getAmounts({ ...args, exchange }),
      getPrep: (args)=>{},
      getTransaction: (args)=>WETH.getTransaction({ ...args, exchange }),
    })
  )
}
