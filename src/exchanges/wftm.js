import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const exchange = {
  
  name: 'wftm',
  label: 'Wrapped Fantom',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTkyIDE5MiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTkyIDE5MjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iY2lyY2xlIj4KCTxnIGlkPSJGYW50b20tY2lyY2xlIj4KCQk8Y2lyY2xlIGlkPSJPdmFsIiBmaWxsUnVsZT0iZXZlbm9kZCIgY2xpcFJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMxOTY5RkYiIGNsYXNzPSJzdDAiIGN4PSI5NiIgY3k9Ijk2IiByPSI4MC40Ii8+CgkJPHBhdGggaWQ9IlNoYXBlIiBmaWxsPSIjRkZGRkZGIiBkPSJNOTEuMSw0MS4yYzIuNy0xLjQsNi44LTEuNCw5LjUsMGwyNy42LDE0LjZjMS42LDAuOSwyLjUsMi4xLDIuNywzLjVoMHY3My4zCgkJCWMwLDEuNC0wLjksMi45LTIuNywzLjhsLTI3LjYsMTQuNmMtMi43LDEuNC02LjgsMS40LTkuNSwwbC0yNy42LTE0LjZjLTEuOC0wLjktMi42LTIuNC0yLjctMy44YzAtMC4xLDAtMC4zLDAtMC40bDAtNzIuNAoJCQljMC0wLjEsMC0wLjIsMC0wLjNsMC0wLjJoMGMwLjEtMS4zLDEtMi42LDIuNi0zLjVMOTEuMSw0MS4yeiBNMTI2LjYsOTkuOWwtMjYsMTMuN2MtMi43LDEuNC02LjgsMS40LTkuNSwwTDY1LjIsMTAwdjMyLjMKCQkJbDI1LjksMTMuNmMxLjUsMC44LDMuMSwxLjYsNC43LDEuN2wwLjEsMGMxLjUsMCwzLTAuOCw0LjYtMS41bDI2LjItMTMuOVY5OS45eiBNNTYuNSwxMzAuOWMwLDIuOCwwLjMsNC43LDEsNgoJCQljMC41LDEuMSwxLjMsMS45LDIuOCwyLjlsMC4xLDAuMWMwLjMsMC4yLDAuNywwLjQsMS4xLDAuN2wwLjUsMC4zbDEuNiwwLjlsLTIuMiwzLjdsLTEuNy0xLjFsLTAuMy0wLjJjLTAuNS0wLjMtMC45LTAuNi0xLjMtMC44CgkJCWMtNC4yLTIuOC01LjctNS45LTUuNy0xMi4zbDAtMC4ySDU2LjV6IE05My44LDgwLjVjLTAuMiwwLjEtMC40LDAuMS0wLjYsMC4yTDY1LjYsOTUuM2MwLDAtMC4xLDAtMC4xLDBsMCwwbDAsMGwwLjEsMGwyNy42LDE0LjYKCQkJYzAuMiwwLjEsMC40LDAuMiwwLjYsMC4yVjgwLjV6IE05OC4yLDgwLjV2MjkuOGMwLjItMC4xLDAuNC0wLjEsMC42LTAuMmwyNy42LTE0LjZjMCwwLDAuMSwwLDAuMSwwbDAsMGwwLDBsLTAuMSwwTDk4LjgsODAuNwoJCQlDOTguNiw4MC42LDk4LjQsODAuNSw5OC4yLDgwLjV6IE0xMjYuNiw2NC40bC0yNC44LDEzbDI0LjgsMTNWNjQuNHogTTY1LjIsNjQuNHYyNi4xbDI0LjgtMTNMNjUuMiw2NC40eiBNOTguNyw0NS4xCgkJCWMtMS40LTAuOC00LTAuOC01LjUsMEw2NS42LDU5LjdjMCwwLTAuMSwwLTAuMSwwbDAsMGwwLDBsMC4xLDBsMjcuNiwxNC42YzEuNCwwLjgsNCwwLjgsNS41LDBsMjcuNi0xNC42YzAsMCwwLjEsMCwwLjEsMGwwLDBsMCwwCgkJCWwtMC4xLDBMOTguNyw0NS4xeiBNMTMwLjcsNDYuNWwxLjcsMS4xbDAuMywwLjJjMC41LDAuMywwLjksMC42LDEuMywwLjhjNC4yLDIuOCw1LjcsNS45LDUuNywxMi4zbDAsMC4yaC00LjNjMC0yLjgtMC4zLTQuNy0xLTYKCQkJYy0wLjUtMS4xLTEuMy0xLjktMi44LTIuOWwtMC4xLTAuMWMtMC4zLTAuMi0wLjctMC40LTEuMS0wLjdsLTAuNS0wLjNsLTEuNi0wLjlMMTMwLjcsNDYuNXoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
  protocol: 'weth',
  
  slippage: false,

  blockchains: ['fantom'],

  fantom: {
    router: {
      address: Blockchains.fantom.wrapped.address,
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
