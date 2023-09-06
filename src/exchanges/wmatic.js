import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const exchange = {
  
  name: 'wmatic',
  label: 'Wrapped MATIC',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0NS40IDQ1LjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM4MjQ3RTU7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzEuOSwxNi42Yy0wLjctMC40LTEuNi0wLjQtMi4yLDBsLTUuMywzLjFsLTMuNSwybC01LjEsMy4xYy0wLjcsMC40LTEuNiwwLjQtMi4yLDBsLTQtMi40CgljLTAuNi0wLjQtMS4xLTEuMS0xLjEtMnYtNC42YzAtMC45LDAuNS0xLjYsMS4xLTJsNC0yLjNjMC43LTAuNCwxLjUtMC40LDIuMiwwbDQsMi40YzAuNywwLjQsMS4xLDEuMSwxLjEsMnYzLjFsMy41LTIuMXYtMy4yCgljMC0wLjktMC40LTEuNi0xLjEtMmwtNy41LTQuNGMtMC43LTAuNC0xLjUtMC40LTIuMiwwTDYsMTEuN2MtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjh2OC43YzAsMC45LDAuNCwxLjYsMS4xLDJsNy42LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw1LjEtMi45bDMuNS0yLjFsNS4xLTIuOWMwLjctMC40LDEuNi0wLjQsMi4yLDBsNCwyLjNjMC43LDAuNCwxLjEsMS4xLDEuMSwydjQuNmMwLDAuOS0wLjQsMS42LTEuMSwyCglsLTMuOSwyLjNjLTAuNywwLjQtMS41LDAuNC0yLjIsMGwtNC0yLjNjLTAuNy0wLjQtMS4xLTEuMS0xLjEtMnYtMi45TDIxLDI4Ljd2My4xYzAsMC45LDAuNCwxLjYsMS4xLDJsNy41LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw3LjUtNC40YzAuNy0wLjQsMS4xLTEuMSwxLjEtMlYyM2MwLTAuOS0wLjQtMS42LTEuMS0yQzM5LjIsMjEsMzEuOSwxNi42LDMxLjksMTYuNnoiLz4KPC9zdmc+Cg==',
  protocol: 'weth',
  
  slippage: false,

  blockchains: ['polygon'],
  
  polygon: {
    router: {
      address: Blockchains.polygon.wrapped.address,
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
