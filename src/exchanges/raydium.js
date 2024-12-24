import Exchange from '../classes/Exchange'
import Raydium from '../platforms/solana/raydium'

const exchange = {
  
  name: 'raydium',
  label: 'Raydium',
  logo: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMjkgMzMiIHdpZHRoPSIyOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjI4LjMxNjgiIHgyPSItMS43MzMzNiIgeTE9IjguMTkxNjIiIHkyPSIyMC4yMDg2Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjMjAwZmIiLz48c3RvcCBvZmZzZXQ9Ii40ODk2NTgiIHN0b3AtY29sb3I9IiMzNzcyZmYiLz48c3RvcCBvZmZzZXQ9Ii40ODk3NTgiIHN0b3AtY29sb3I9IiMzNzczZmUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1YWM0YmUiLz48L2xpbmVhckdyYWRpZW50PjxnIGZpbGw9InVybCgjYSkiPjxwYXRoIGQ9Im0yNi44NjI1IDEyLjI4MXYxMS40MTA0bC0xMi42OTE2IDcuMzI2MS0xMi42OTg1OS03LjMyNjF2LTE0LjY1OTM3bDEyLjY5ODU5LTcuMzMzMjIgOS43NTQxIDUuNjM0NDEgMS40NzIzLS44NDk0MS0xMS4yMjY0LTYuNDgzODEtMTQuMTcwOSA4LjE4MjYydjE2LjM1ODE4bDE0LjE3MDkgOC4xODI2IDE0LjE3MS04LjE4MjZ2LTEzLjEwOTJ6Ii8+PHBhdGggZD0ibTEwLjYxNzYgMjMuNjk4NWgtMi4xMjM1M3YtNy4xMjA5aDcuMDc4NDNjLjY2OTctLjAwNzQgMS4zMDk1LS4yNzgyIDEuNzgxMS0uNzUzOC40NzE2LS40NzU1LjczNy0xLjExNzYuNzM4OC0xLjc4NzQuMDAzOC0uMzMxMS0uMDYwMS0uNjU5Ni0uMTg3OS0uOTY1MS0uMTI3OS0uMzA1Ni0uMzE2OC0uNTgxNy0uNTU1NC0uODExNS0uMjMwOC0uMjM3Mi0uNTA3MS0uNDI1My0uODEyNC0uNTUzLS4zMDUzLS4xMjc4LS42MzMzLS4xOTI1LS45NjQyLS4xOTAzaC03LjA3ODQzdi0yLjE2NTk1aDcuMDg1NDNjMS4yNDA1LjAwNzQzIDIuNDI4MS41MDM1MSAzLjMwNTMgMS4zODA2NS44NzcxLjg3NzIgMS4zNzMyIDIuMDY0OCAxLjM4MDYgMy4zMDUyLjAwNzYuOTQ5Ni0uMjgxOSAxLjg3NzctLjgyODEgMi42NTQ0LS41MDI3Ljc0MzItMS4yMTExIDEuMzIzNy0yLjAzODYgMS42NzA1LS44MTk0LjI1OTktMS42NzQ1LjM4ODktMi41MzQxLjM4MjNoLTQuMjQ3eiIvPjxwYXRoIGQ9Im0yMC4yMTU5IDIzLjUyMTVoLTIuNDc3NWwtMS45MTExLTMuMzMzOWMuNzU2MS0uMDQ2MyAxLjUwMTktLjE5ODggMi4yMTU1LS40NTN6Ii8+PHBhdGggZD0ibTI1LjM4MzEgOS45MDk3NSAxLjQ2NTIuODE0MDUgMS40NjUzLS44MTQwNXYtMS43MjAwNWwtMS40NjUzLS44NDk0MS0xLjQ2NTIuODQ5NDF6Ii8+PC9nPjwvc3ZnPg==',
  protocol: 'raydium',
  
  slippage: true,

  blockchains: ['solana'],

  solana: {
    
    router_amm: {
      address: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
      api: Raydium.AMM_LAYOUT,
    },

    router_cpamm: {
      address: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
      api: Raydium.CPAMM_LAYOUT
    },

    router_clmm: {
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
