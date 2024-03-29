import Exchange from '../classes/Exchange'
import UniswapV2 from '../platforms/evm/uniswap_v2'

const exchange = {
  
  name: 'honeyswap',
  label: 'Honeyswap',
  logo: 'data:image/png;base64,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',
  protocol: 'uniswap_v2',

  slippage: true,

  blockchains: ['gnosis'],
  
  gnosis: {
    router: {
      address: '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77',
      api: UniswapV2.ROUTER
    },
    factory: {
      address: '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7',
      api: UniswapV2.FACTORY
    },
    pair: {
      api: UniswapV2.PAIR
    },
  }
}

export default (scope)=>{
  
  return new Exchange(

    Object.assign(exchange, {
      scope,
      findPath: (args)=>UniswapV2.findPath({ ...args, exchange }),
      pathExists: (args)=>UniswapV2.pathExists({ ...args, exchange }),
      getAmounts: (args)=>UniswapV2.getAmounts({ ...args, exchange }),
      getPrep: (args)=>UniswapV2.getPrep({ ...args, exchange }),
      getTransaction: (args)=>UniswapV2.getTransaction({ ...args, exchange }),
    })
  )
}
