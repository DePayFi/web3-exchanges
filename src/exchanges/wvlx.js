import Blockchains from '@depay/web3-blockchains'
import Exchange from '../classes/Exchange'
import WETH from '../platforms/evm/weth'

const blockchain = Blockchains.velas

const exchange = {
  blockchain: 'velas',
  name: 'wvlx',
  alternativeNames: [],
  label: 'Wrapped Velas',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDUuNCA0NS40IgoJIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiMwMDM3QzE7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjguOCwyMi44bC02LjEsMTAuNmwtNi4xLTEwLjdMMjguOCwyMi44TDI4LjgsMjIuOHogTTM0LjksMTkuMkgxMC41bDEyLjIsMjEuNEwzNC45LDE5LjJ6IE02LjUsMTIuMWwyLDMuNgoJaDI4LjNsMi4xLTMuNkg2LjV6Ii8+Cjwvc3ZnPgo=',
  wrapper: {
    address: blockchain.wrapped.address,
    api: WETH.WETH
  },
  slippage: false,
}

export default new Exchange(

  Object.assign(exchange, {
    findPath: ({ tokenIn, tokenOut })=>
      WETH.findPath(blockchain, { tokenIn, tokenOut }),
    pathExists: (path)=>
      WETH.pathExists(blockchain, path),
    getAmounts: WETH.getAmounts,
    getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
      WETH.getTransaction(blockchain, exchange ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
  })
)