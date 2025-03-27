import Exchange from '../classes/Exchange'
import Raydium from '../platforms/solana/raydium'
import { CurveCalculator } from '../platforms/solana/raydium/cpmm/price'

const exchange = {
  
  name: 'raydium_cp',
  label: 'Raydium',
  logo: Raydium.LOGO,
  protocol: 'raydium_cp',
  
  slippage: true,

  blockchains: ['solana'],

  solana: {
    
    router: {
      address: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
      api: Raydium.CPMM_LAYOUT
    },
  }
}

export default (scope)=>{
  
  return new Exchange(

    Object.assign(exchange, {
      scope,

      findPath: (args)=>Raydium.findPath({ ...args, exchange }),
      pathExists: (args)=>Raydium.pathExists({ ...args, exchange }),
      getAmounts: (args)=>Raydium.getAmounts({ ...args, exchange }),
      getPrep: (args)=>{},
      getTransaction: (args)=>Raydium.getTransaction({ ...args, exchange }),
      CurveCalculator,
    })
  )
}
