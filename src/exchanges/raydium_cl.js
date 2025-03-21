import Exchange from '../classes/Exchange'
import Raydium from '../platforms/solana/raydium'

const exchange = {
  
  name: 'raydium_cl',
  label: 'Raydium',
  logo: Raydium.LOGO,
  protocol: 'raydium_cl',
  
  slippage: true,

  blockchains: ['solana'],

  solana: {
    
    router: {
      address: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
      api: Raydium.CLMM_LAYOUT
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
    })
  )
}
