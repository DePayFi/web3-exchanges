import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const exchange = {
  
  name: 'weth_arbitrum',
  label: 'Wrapped Ethereum',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
  
  slippage: false,

  blockchains: ['arbitrum'],

  arbitrum: {
    router: {
      address: Blockchains.arbitrum.wrapped.address,
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
