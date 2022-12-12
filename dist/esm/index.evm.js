import { ethers } from 'ethers';
import { request } from '@depay/web3-client-evm';
import { Token } from '@depay/web3-tokens-evm';
import { CONSTANTS } from '@depay/web3-constants';

let PancakeRouter$1 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let PancakeFactory$1 = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let PancakePair$1 = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$7 = {
  blockchain: 'bsc',
  name: 'pancakeswap',
  alternativeNames: ['pancake'],
  label: 'PancakeSwap',
  logo:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk4IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OCAxOTkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTguNTUyIDE5OC42MDdDNjkuMDYxMyAxOTguNTg1IDQ1LjMwNiAxOTEuNTggMjguNzA3OSAxNzguOTk4QzExLjkxMDggMTY2LjI2NSAzIDE0OC4xOTUgMyAxMjcuNzQ4QzMgMTA4LjA0NyAxMS44OTEzIDkzLjg0MTEgMjEuOTUxNyA4NC4yMzg1QzI5LjgzNTkgNzYuNzEzMiAzOC41MzYzIDcxLjg5MzYgNDQuNTk0NSA2OS4xMjEzQzQzLjIyNDUgNjQuOTU5NCA0MS41MTUzIDU5LjUxMDggMzkuOTg2MSA1My44ODMyQzM3LjkzOTkgNDYuMzUyNyAzNS45MzI1IDM3LjUxNzQgMzUuOTMyNSAzMS4wNDI5QzM1LjkzMjUgMjMuMzc5NSAzNy42MjA0IDE1LjY4MzMgNDIuMTcxNCA5LjcwMzA2QzQ2Ljk3OTcgMy4zODQ3NiA1NC4yMTgyIDAgNjIuOTI2NCAwQzY5LjczMjIgMCA3NS41MTAzIDIuNDk5MDMgODAuMDMzOSA2LjgxMDExQzg0LjM1NzkgMTAuOTMwOSA4Ny4yMzU3IDE2LjQwMzQgODkuMjIyNyAyMi4xMDgyQzkyLjcxNDMgMzIuMTMyNSA5NC4wNzM4IDQ0LjcyNjQgOTQuNDU1MSA1Ny4yOTQ1SDEwMi43OTZDMTAzLjE3OCA0NC43MjY0IDEwNC41MzcgMzIuMTMyNSAxMDguMDI5IDIyLjEwODJDMTEwLjAxNiAxNi40MDM0IDExMi44OTQgMTAuOTMwOSAxMTcuMjE4IDYuODEwMTFDMTIxLjc0MSAyLjQ5OTAzIDEyNy41MTkgMCAxMzQuMzI1IDBDMTQzLjAzMyAwIDE1MC4yNzIgMy4zODQ3NiAxNTUuMDggOS43MDMwNkMxNTkuNjMxIDE1LjY4MzMgMTYxLjMxOSAyMy4zNzk1IDE2MS4zMTkgMzEuMDQyOUMxNjEuMzE5IDM3LjUxNzQgMTU5LjMxMiA0Ni4zNTI3IDE1Ny4yNjUgNTMuODgzMkMxNTUuNzM2IDU5LjUxMDggMTU0LjAyNyA2NC45NTk0IDE1Mi42NTcgNjkuMTIxM0MxNTguNzE1IDcxLjg5MzYgMTY3LjQxNiA3Ni43MTMyIDE3NS4zIDg0LjIzODVDMTg1LjM2IDkzLjg0MTEgMTk0LjI1MiAxMDguMDQ3IDE5NC4yNTIgMTI3Ljc0OEMxOTQuMjUyIDE0OC4xOTUgMTg1LjM0MSAxNjYuMjY1IDE2OC41NDQgMTc4Ljk5OEMxNTEuOTQ1IDE5MS41OCAxMjguMTkgMTk4LjU4NSA5OC42OTk2IDE5OC42MDdIOTguNTUyWiIgZmlsbD0iIzYzMzAwMSIvPgo8cGF0aCBkPSJNNjIuOTI2MiA3LjI4ODMzQzUwLjE3MTYgNy4yODgzMyA0NC4zMDA0IDE2LjgwMzcgNDQuMzAwNCAyOS45NjMyQzQ0LjMwMDQgNDAuNDIzMSA1MS4xMjIyIDYxLjM3MTUgNTMuOTIxMiA2OS41MjYzQzU0LjU1MDggNzEuMzYwNSA1My41NjE2IDczLjM3MDEgNTEuNzU3NCA3NC4wODE0QzQxLjUzNTEgNzguMTEyMSAxMS4zNjc5IDkyLjg3IDExLjM2NzkgMTI2LjY2OUMxMS4zNjc5IDE2Mi4yNzIgNDIuMDI0NiAxODkuMTE3IDk4LjU1ODEgMTg5LjE2Qzk4LjU4MDYgMTg5LjE2IDk4LjYwMzEgMTg5LjE1OSA5OC42MjU2IDE4OS4xNTlDOTguNjQ4MSAxODkuMTU5IDk4LjY3MDYgMTg5LjE2IDk4LjY5MzEgMTg5LjE2QzE1NS4yMjcgMTg5LjExNyAxODUuODgzIDE2Mi4yNzIgMTg1Ljg4MyAxMjYuNjY5QzE4NS44ODMgOTIuODcgMTU1LjcxNiA3OC4xMTIxIDE0NS40OTQgNzQuMDgxNEMxNDMuNjkgNzMuMzcwMSAxNDIuNyA3MS4zNjA1IDE0My4zMyA2OS41MjYzQzE0Ni4xMjkgNjEuMzcxNSAxNTIuOTUxIDQwLjQyMzEgMTUyLjk1MSAyOS45NjMyQzE1Mi45NTEgMTYuODAzNyAxNDcuMDggNy4yODgzMyAxMzQuMzI1IDcuMjg4MzNDMTE1Ljk2NSA3LjI4ODMzIDExMS4zODkgMzMuMjk1NSAxMTEuMDYyIDYxLjIwNzVDMTExLjA0IDYzLjA3MDkgMTA5LjUzNCA2NC41ODI4IDEwNy42NyA2NC41ODI4SDg5LjU4MDdDODcuNzE3MiA2NC41ODI4IDg2LjIxMDggNjMuMDcwOSA4Ni4xODkgNjEuMjA3NUM4NS44NjI2IDMzLjI5NTUgODEuMjg2IDcuMjg4MzMgNjIuOTI2MiA3LjI4ODMzWiIgZmlsbD0iI0QxODg0RiIvPgo8cGF0aCBkPSJNOTguNjkzMSAxNzcuNzU1QzU3LjE1NTEgMTc3Ljc1NSAxMS40Mzk3IDE1NS41MiAxMS4zNjgxIDEyNi43MzdDMTEuMzY4IDEyNi43ODEgMTEuMzY3OSAxMjYuODI2IDExLjM2NzkgMTI2Ljg3MUMxMS4zNjc5IDE2Mi41MDMgNDIuMDczNCAxODkuMzYyIDk4LjY5MzEgMTg5LjM2MkMxNTUuMzEzIDE4OS4zNjIgMTg2LjAxOCAxNjIuNTAzIDE4Ni4wMTggMTI2Ljg3MUMxODYuMDE4IDEyNi44MjYgMTg2LjAxOCAxMjYuNzgxIDE4Ni4wMTggMTI2LjczN0MxODUuOTQ2IDE1NS41MiAxNDAuMjMxIDE3Ny43NTUgOTguNjkzMSAxNzcuNzU1WiIgZmlsbD0iI0ZFREM5MCIvPgo8cGF0aCBkPSJNNzUuNjEzNSAxMTcuODk2Qzc1LjYxMzUgMTI3LjYxNCA3MS4wMjEgMTMyLjY3NSA2NS4zNTU4IDEzMi42NzVDNTkuNjkwNyAxMzIuNjc1IDU1LjA5ODEgMTI3LjYxNCA1NS4wOTgxIDExNy44OTZDNTUuMDk4MSAxMDguMTc4IDU5LjY5MDcgMTAzLjExNyA2NS4zNTU4IDEwMy4xMTdDNzEuMDIxIDEwMy4xMTcgNzUuNjEzNSAxMDguMTc4IDc1LjYxMzUgMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPHBhdGggZD0iTTE0Mi4yODggMTE3Ljg5NkMxNDIuMjg4IDEyNy42MTQgMTM3LjY5NiAxMzIuNjc1IDEzMi4wMzEgMTMyLjY3NUMxMjYuMzY1IDEzMi42NzUgMTIxLjc3MyAxMjcuNjE0IDEyMS43NzMgMTE3Ljg5NkMxMjEuNzczIDEwOC4xNzggMTI2LjM2NSAxMDMuMTE3IDEzMi4wMzEgMTAzLjExN0MxMzcuNjk2IDEwMy4xMTcgMTQyLjI4OCAxMDguMTc4IDE0Mi4yODggMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPC9zdmc+Cg==',
  router: {
    address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    api: PancakeRouter$1
  },
  factory: {
    address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    api: PancakeFactory$1
  },
  pair: {
    api: PancakePair$1
  },
  slippage: true,
};

function _optionalChain$4(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
  constructor({
    tokenIn,
    tokenOut,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    exchange,
    getTransaction,
  }) {
    this.tokenIn = tokenIn;
    this.tokenOut = tokenOut;
    this.path = path;
    this.amountIn = _optionalChain$4([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
    this.amountOutMin = _optionalChain$4([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
    this.amountOut = _optionalChain$4([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
    this.amountInMax = _optionalChain$4([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
    this.exchange = exchange;
    this.getTransaction = getTransaction;
  }
}

let supported = ['ethereum', 'bsc', 'polygon', 'velas'];
supported.evm = ['ethereum', 'bsc', 'polygon', 'velas'];
supported.solana = [];

const DEFAULT_SLIPPAGE = '0.5'; // percent

const getDefaultSlippage = ({ amountIn, amountOut })=>{
  return DEFAULT_SLIPPAGE
};

const calculateAmountInWithSlippage = async ({ exchange, fixedPath, amountIn, amountOut })=>{

  let defaultSlippage = getDefaultSlippage({ amountIn, amountOut });

  let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000));

  if(!supported.evm.includes(exchange.blockchain)) { 
    return newAmountInWithDefaultSlippageBN
  }

  const currentBlock = await request({ blockchain: exchange.blockchain, method: 'latestBlockNumber' });

  let blocks = [];
  for(var i = 0; i <= 2; i++){
    blocks.push(currentBlock-i);
  }

  const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
    let { amountIn } = await exchange.getAmounts({
      path: fixedPath,
      amountOut,
      block
    });
    return amountIn
  }));

  if(!lastAmountsIn[0] || !lastAmountsIn[1] || !lastAmountsIn[2]) { return newAmountInWithDefaultSlippageBN }

  let newAmountInWithExtremeSlippageBN;
  
  if(
    (lastAmountsIn[0].gt(lastAmountsIn[1])) &&
    (lastAmountsIn[1].gt(lastAmountsIn[2]))
  ) {
    // EXTREME DIRECTIONAL PRICE CHANGE

    const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1]);
    const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2]);

    // velocity (avg. step size)
    const slippage = difference1.add(difference2).div(2);

    newAmountInWithExtremeSlippageBN = lastAmountsIn[0].add(slippage);

    if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
      return newAmountInWithExtremeSlippageBN
    }
  } else if (
    !(
      lastAmountsIn[0].eq(lastAmountsIn[1]) ||
      lastAmountsIn[1].eq(lastAmountsIn[2])
    )
  ) {
    // EXTREME BASE VOLATILITIES

    const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1]).abs();
    const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2]).abs();

    let slippage;
    if(difference1.lt(difference2)) {
      slippage = difference1;
    } else {
      slippage = difference2;
    }

    let highestAmountBN;
    if(lastAmountsIn[0].gt(lastAmountsIn[1]) && lastAmountsIn[0].gt(lastAmountsIn[2])) {
      highestAmountBN = lastAmountsIn[0];
    } else if(lastAmountsIn[1].gt(lastAmountsIn[2]) && lastAmountsIn[1].gt(lastAmountsIn[0])) {
      highestAmountBN = lastAmountsIn[1];
    } else {
      highestAmountBN = lastAmountsIn[2];
    }

    newAmountInWithExtremeSlippageBN = highestAmountBN.add(slippage);

    if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
      return newAmountInWithExtremeSlippageBN
    }
  }

  return newAmountInWithDefaultSlippageBN
};

const calculateAmountsWithSlippage = async ({
  exchange,
  fixedPath,
  amounts,
  tokenIn, tokenOut,
  amountIn, amountInMax, amountOut, amountOutMin,
  amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
})=>{
  if(amountOutMinInput || amountOutInput) {
    if(supported.evm.includes(exchange.blockchain)) {
      amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, fixedPath, amountIn, amountOut: (amountOutMinInput || amountOut) });
    }
  }

  return({ amountIn, amountInMax, amountOut, amountOutMin, amounts })
};

const fixAddress = (address)=>{
  if(address.match('0x')) {
    return ethers.utils.getAddress(address)
  } else {
    return address
  }
};

let getAmount = async ({ amount, blockchain, address }) => {
  return await Token.BigNumber({ amount, blockchain, address })
};

let fixRouteParams = async ({
  blockchain,
  exchange,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
}) => {
  let params = {
    exchange,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
  };
  
  if (amountOut && typeof amountOut === 'number') {
    params.amountOut = await getAmount({ amount: amountOut, blockchain, address: tokenOut });
  }

  if (amountOutMin && typeof amountOutMin === 'number') {
    params.amountOutMin = await getAmount({ amount: amountOutMin, blockchain, address: tokenOut });
  }

  if (amountIn && typeof amountIn === 'number') {
    params.amountIn = await getAmount({ amount: amountIn, blockchain, address: tokenIn });
  }

  if (amountInMax && typeof amountInMax === 'number') {
    params.amountInMax = await getAmount({ amount: amountInMax, blockchain, address: tokenIn });
  }
  
  return params
};

let preflight = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
  amountOutMax,
  amountInMin,
}) => {
  if (typeof amountOutMax !== 'undefined') {
    throw 'You cannot not set amountOutMax! Only amountInMax or amountOutMin!'
  }

  if (typeof amountInMin !== 'undefined') {
    throw 'You cannot not set amountInMin! Only amountInMax or amountOutMin!'
  }

  if (typeof amountOut !== 'undefined' && typeof amountIn !== 'undefined') {
    throw 'You cannot set amountIn and amountOut at the same time, use amountInMax or amountOutMin to describe the non exact part of the swap!'
  }

  if (typeof amountInMax !== 'undefined' && typeof amountOutMin !== 'undefined') {
    throw 'You cannot set amountInMax and amountOutMin at the same time, use amountIn or amountOut to describe the part of the swap that needs to be exact!'
  }

  if (typeof amountIn !== 'undefined' && typeof amountInMax !== 'undefined') {
    throw 'Setting amountIn and amountInMax at the same time makes no sense. Decide if amountIn needs to be exact or not!'
  }

  if (typeof amountOut !== 'undefined' && typeof amountOutMin !== 'undefined') {
    throw 'Setting amountOut and amountOutMin at the same time makes no sense. Decide if amountOut needs to be exact or not!'
  }
};

const route$1 = ({
  exchange,
  tokenIn,
  tokenOut,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
  findPath,
  getAmounts,
  getTransaction,
  slippage,
}) => {
  tokenIn = fixAddress(tokenIn);
  tokenOut = fixAddress(tokenOut);
  return new Promise(async (resolve)=> {
    let { path, fixedPath } = await findPath({ tokenIn, tokenOut });
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

    let amounts; // includes intermediary amounts for longer routes
    ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    if(slippage) {
      ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
        exchange,
        fixedPath,
        amounts,
        tokenIn, tokenOut,
        amountIn, amountInMax, amountOut, amountOutMin,
        amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
      }));
    }

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        exchange,
        getTransaction: async ({ from })=> await getTransaction({
          exchange,
          path,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          amounts,
          amountInInput,
          amountOutInput,
          amountInMaxInput,
          amountOutMinInput,
          fromAddress: from
        }),
      })
    );
  })
};

class Exchange {
  constructor({
    name,
    blockchain,
    alternativeNames,
    label,
    logo,
    router,
    factory,
    wrapper,
    pair,
    market,
    findPath,
    getAmounts,
    getTransaction,
    slippage,
  }) {
    this.name = name;
    this.blockchain = blockchain;
    this.alternativeNames = alternativeNames;
    this.label = label;
    this.logo = logo;
    this.router = router;
    this.factory = factory;
    this.wrapper = wrapper;
    this.pair = pair;
    this.market = market;
    this.findPath = findPath;
    this.getAmounts = getAmounts;
    this.getTransaction = getTransaction;
    this.slippage = slippage;
  }

  async route({
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
    amountOutMax,
    amountInMin,
  }) {
    if(tokenIn === tokenOut){ return Promise.resolve() }
    
    preflight({
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
      amountOutMax,
      amountInMin,
    });

    return await route$1({
      ...
      await fixRouteParams({
        blockchain: this.blockchain,
        exchange: this,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      }),
      findPath: this.findPath,
      getAmounts: this.getAmounts,
      getTransaction: this.getTransaction,
      slippage: this.slippage,
    })
  }
}

function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath$3 = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.bsc.NATIVE && path[index+1] != CONSTANTS.bsc.WRAPPED &&
      path[index-1] != CONSTANTS.bsc.WRAPPED
    ) {
      return CONSTANTS.bsc.WRAPPED
    } else {
      return token
    }
  });

  if(fixedPath[0] == CONSTANTS.bsc.NATIVE && fixedPath[1] == CONSTANTS.bsc.WRAPPED) {
    fixedPath.splice(0, 1);
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.bsc.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.bsc.WRAPPED) {
    fixedPath.splice(fixedPath.length-1, 1);
  }

  return fixedPath
};

let minReserveRequirements$3 = ({ reserves, min, token, token0, token1, decimals }) => {
  if(token0.toLowerCase() == token.toLowerCase()) {
    return reserves[0].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else if (token1.toLowerCase() == token.toLowerCase()) {
    return reserves[1].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else {
    return false
  }
};

let pathExists$3 = async (path) => {
  if(fixPath$3(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'bsc',
    address: basics$7.factory.address,
    method: 'getPair',
    api: basics$7.factory.api,
    cache: 3600000,
    params: fixPath$3(path),
  });
  if(pair == CONSTANTS.bsc.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'bsc', address: pair, method: 'getReserves', api: basics$7.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token0', api: basics$7.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token1', api: basics$7.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.bsc.WRAPPED)) {
    return minReserveRequirements$3({ min: 1, token: CONSTANTS.bsc.WRAPPED, decimals: CONSTANTS.bsc.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.bsc.USD)) {
    let token = new Token({ blockchain: 'bsc', address: CONSTANTS.bsc.USD });
    let decimals = await token.decimals();
    return minReserveRequirements$3({ min: 1000, token: CONSTANTS.bsc.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$7 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path;
  if (await pathExists$3([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists$3([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists$3([tokenOut, CONSTANTS.bsc.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.USD &&
    await pathExists$3([tokenIn, CONSTANTS.bsc.USD]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists$3([CONSTANTS.bsc.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.USD, CONSTANTS.bsc.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists$3([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.USD &&
    await pathExists$3([CONSTANTS.bsc.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, CONSTANTS.bsc.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$3([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.bsc.NATIVE) {
    path.splice(1, 0, CONSTANTS.bsc.WRAPPED);
  } else if(_optionalChain$3([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.bsc.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.bsc.WRAPPED);
  }

  return { path, fixedPath: fixPath$3(path) }
};

let getAmountOut$3 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'bsc',
      address: basics$7.router.address,
      method: 'getAmountsOut',
      api: basics$7.router.api,
      params: {
        amountIn: amountIn,
        path: fixPath$3(path),
      },
    })
    .then((amountsOut)=>{
      resolve(amountsOut[amountsOut.length - 1]);
    })
    .catch(()=>resolve());
  })
};

let getAmountIn$3 = ({ path, amountOut, block }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'bsc',
      address: basics$7.router.address,
      method: 'getAmountsIn',
      api: basics$7.router.api,
      params: {
        amountOut: amountOut,
        path: fixPath$3(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$7 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn$3({ block, path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountOut$3({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn$3({ block, path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut$3({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$7 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {

  let blockchain = 'bsc';
  
  let transaction = {
    blockchain,
    from: fromAddress,
    to: basics$7.router.address,
    api: basics$7.router.api,
  };

  if (path[0] === CONSTANTS[blockchain].NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens';
      transaction.value = amountIn.toString();
      transaction.params = { amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens';
      transaction.value = amountInMax.toString();
      transaction.params = { amountOut: amountOut.toString() };
    }
  } else if (path[path.length - 1] === CONSTANTS[blockchain].NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixPath$3(path),
    to: fromAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

var pancakeswap = new Exchange(
  Object.assign(basics$7, {
    findPath: findPath$7,
    getAmounts: getAmounts$7,
    getTransaction: getTransaction$7,
  })
);

let UniswapV2Router02$1 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let UniswapV2Factory$1 = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let UniswapV2Pair$1 = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$6 = {
  blockchain: 'polygon',
  name: 'quickswap',
  alternativeNames: [],
  label: 'QuickSwap',
  logo: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzAyLjQ1IDcwMi40NyI+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIj48cmVjdCB3aWR0aD0iNzUwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0ibm9uZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwLXBhdGgpIj48cGF0aCBkPSJNMzU0Ljc0LDI0LjM3YTM1MS4yNywzNTEuMjcsMCwwLDEsMzYzLjc0LDI3NywzNTQsMzU0LDAsMCwxLDEuMjMsMTQxLjI2QTM1MS43NiwzNTEuNzYsMCwwLDEsNTEwLjEyLDY5OS4zYy03My43NywzMS0xNTguMjUsMzUuMzUtMjM0LjkxLDEyLjU0QTM1MiwzNTIsMCwwLDEsNDYuNTEsNDk5LjU2Yy0yOC03My40NS0zMC4xNi0xNTYuMzgtNi4yNC0yMzEuMjVBMzUwLjg4LDM1MC44OCwwLDAsMSwzNTQuNzQsMjQuMzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE1OC44MSwzNDkuNThjMS4zOSw2LjQxLDIuMjMsMTIuOTIsMy42MSwxOS4zNS44NSwzLjkzLDIuMTMsMyw0LjE1LDEuMjgsMy44Ny0zLjI1LDcuNTktNi42OSwxMS45NC05LjMxLDEuMjMuMjQsMS44NiwxLjIyLDIuNTMsMi4xLDExLjM5LDE0Ljg3LDI2LjUzLDI0LDQ0LjM3LDI4Ljk0YTE0Ny4yMywxNDcuMjMsMCwwLDAsMjUuMTcsNC42Nyw0Mi42OCw0Mi42OCwwLDAsMS02LjYxLTkuOTVjLTIuODUtNi40MS0xLjg1LTEyLjE1LDIuOTUtMTcuMjIsNS44Ny02LjE5LDEzLjYyLTguNzYsMjEuNDgtMTAuOCwxNi40OC00LjMsMzMuMjctNC43Myw1MC4xOC0zLjUzQTIwMi4xMSwyMDIuMTEsMCwwLDEsMzU4Ljc1LDM2MmMxMSwzLjA2LDIxLjcyLDYuNzMsMzEuNDQsMTIuODgsMS4zNiwxLjA5LDIuMywyLjYsMy42MSwzLjc0LDEyLjQ5LDEzLjQxLDE5Ljc4LDI5LjI1LDIwLjI4LDQ3LjU1LjM0LDEyLjY1LTMuMTYsMjQuNzItOS41LDM1LjgyLTExLjQyLDIwLTI4LjA5LDM0LjU2LTQ4LDQ1LjcxQTE3MC41LDE3MC41LDAsMCwxLDI5MSw1MjguNDJjLTQxLjI0LDQuNDctNzkuNDUtNC40Ny0xMTQuNTktMjYuMzYtMjkuMjEtMTguMTktNTEuNjUtNDMuMDgtNzAtNzEuOTJhMzM5LjU3LDMzOS41NywwLDAsMS0yMi41Mi00Mi43NWMtLjgxLTEuOC0xLTMuODEtMS44Mi01LjI5LjUyLDEuNzUsMS40OSwzLjczLS40Myw1LjYtLjU4LTcuNDUuMDgtMTQuOS40Ny0yMi4zMWEyODcuMTMsMjg3LjEzLDAsMCwxLDkuNDgtNjAuNTRBMjkyLjkxLDI5Mi45MSwwLDAsMSwyNjYuMDYsMTA5LjA5LDI4Ny4yLDI4Ny4yLDAsMCwxLDM0Ni41OSw4OS45YzQzLjU3LTQsODUuNzksMS43MywxMjcsMTYuMzQtNi4yNywxMS44OS00Miw0My43Mi02OS44LDYyLjE1YTk0LjExLDk0LjExLDAsMCwwLTUuNDQtMjMuNTFjLS4xNC0yLDEuNjYtMi42NSwyLjc4LTMuNjFxOC42Ny03LjQ2LDE3LjQzLTE0Ljc3YTE3LjE0LDE3LjE0LDAsMCwwLDEuNjktMS40OWMuNjYtLjcxLDEuNzctMS4zLDEuNTQtMi40cy0xLjU1LTEuMTUtMi40Ny0xLjNhNDYuODIsNDYuODIsMCwwLDAtOC4xNy0xYy0zLjgxLS40NS03LjU2LTEuMy0xMS40LTEuMzgtMi45NS0uMTgtNS44NS0uOTMtOC44My0uNjlhMjguMjIsMjguMjIsMCwwLDEtNC41LS4zMmMtMi41LS43OS01LjA3LS40NC03LjYxLS40My0xLjUyLDAtMy0uMTEtNC41NiwwLTQuMzUuMjUtOC43My0uNDgtMTMuMDcuMzRhMTIuODcsMTIuODcsMCwwLDEtMy4yMS4zMmMtMS4yNiwwLTIuNTEuMDYtMy43NywwYTEyLjM1LDEyLjM1LDAsMCwwLTQuODcuNDdjLTQuNTkuNDEtOS4xOS43OC0xMy43MywxLjYxLTUuNDgsMS4xNi0xMS4wOSwxLjQ0LTE2LjUzLDIuNzktNSwxLjMtMTAuMTMsMi0xNSwzLjc0LTYuNTEsMS43OS0xMi45NSwzLjg0LTE5LjM1LDYtOS4zNCwzLjcxLTE4LjgyLDcuMS0yNy43MSwxMS44NmEyNDguNzQsMjQ4Ljc0LDAsMCwwLTU1LjY2LDM2Ljk0QTI2Ni41NSwyNjYuNTUsMCwwLDAsMTU5LjY4LDIyN2EyNTQuODcsMjU0Ljg3LDAsMCwwLTE2LjU0LDI2LjE2Yy0zLjE3LDUuOS02LjIyLDExLjg1LTksMTgtMiw0LjcxLTQuNDIsOS4yNy02LDE0LjE4LTIsNC45LTMuNjQsOS45Mi01LjIyLDE1LTEuODgsNS4wNi0zLDEwLjM1LTQuNDUsMTUuNTMtLjYzLDItMSw0LjExLTEuNTMsNi4xOC0uNjMsMi40OS0xLDUtMS40Nyw3LjU1LS43Nyw0LjI1LTEuNDgsOC41LTIuMDksMTIuNzhhMTE4LjY0LDExOC42NCwwLDAsMC0xLjU3LDEzLjI5Yy0uNzQsMi45NC0uMiw2LS43NCw5LS44MiwzLjY5LS4yOCw3LjQ1LS41MiwxMS4xNi0uMTEsMi42MS0uMTYsNS4yMy0uMDksNy44NSwwLDEuMDctLjQ5LDIuNTcuNjQsMy4wOSwxLjI5LjYsMi4yMy0uNzcsMy4xNi0xLjUzLDMuMTgtMi42LDYuMjktNS4yOSw5LjQtOCwxMC40Ny05LDIxLjA3LTE3Ljg4LDMxLjU4LTI2Ljg1LjkxLS43NywxLjktMi43OSwzLjUyLS43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNMzkwLjExLDM3NS43OGMtMTIuMzctNy4zNS0yNS44OS0xMS42My0zOS43Ny0xNC45MmExOTcuMjUsMTk3LjI1LDAsMCwwLTU1LjY4LTUuMWMtMTMuMjEuNjYtMjYuMzEsMi41LTM4LjQ4LDguM2EzMi42MSwzMi42MSwwLDAsMC00LjIxLDIuNDNjLTkuODUsNi42LTExLjM1LDE1LjQtNC4yMywyNC45MSwxLjQ4LDIsMy4xMiwzLjgxLDUuMSw2LjIyLTYuMzksMC0xMi4wNS0xLjE5LTE3LjY5LTIuMzEtMTUuMTItMy0yOS4zMi04LjI0LTQxLjUtMTgtNS44Ni00LjY4LTExLjIyLTkuOTMtMTUuMTQtMTYuNDUsMS42LTIuNjEsNC4yOC0zLjgzLDYuNzgtNS4yNyw0LjgyLTIsOS4xOS00LjkxLDE0LTcuMDlhMjA3LjU1LDIwNy41NSwwLDAsMSw2Ny40LTE4YzkuMzItLjg3LDE4LjY1LTEuNzYsMjgtMS40MUEzMTEuMzgsMzExLjM4LDAsMCwxLDM3NiwzNDMuMjVjNi44LDIuMTIsMTMuNTIsNC40NSwyMC41OSw2Ljg0LDAtMi0xLjE0LTMuMTktMS45LTQuNDhBOTYuMTgsOTYuMTgsMCwwLDAsMzg1LDMzMS44OGMtMS4zMy0xLjU2LTMuMTgtMi45My0zLjE0LTUuMzMsMy43My44NSw3LjQ2LDEuNjgsMTEuMTgsMi41NiwxLC4yMywyLjE3LjgzLDIuODEsMCwuODUtMS4wOC0uNDMtMi0xLTIuODQtNS40OS04LjE5LTEyLjMzLTE1LjE3LTE5LjY3LTIxLjY4LDMuODktMi4yNiw3Ljg5LS40MiwxMS42OC4wNiwzOC44Nyw1LDc0LjI5LDE4LjgxLDEwNS4xOCw0Myw0MC45LDMyLjA5LDY3LjMzLDczLjU0LDc4LjQ3LDEyNC41MUExODAuNTQsMTgwLjU0LDAsMCwxLDU3My44Nyw1MjRjLTIuMTksMzAuMTEtMTEuNjUsNTcuOS0yOS40NSw4Mi41OC0xLjE3LDEuNjItMi43NSwyLjkxLTMuNjEsNC43Ni00LDYtMTAsMTAuMDgtMTUuNDQsMTQuNTItMjkuNTUsMjQtNjQsMzYuNDYtMTAxLjE0LDQyLjI4YTMxMC4zNCwzMTAuMzQsMCwwLDEtODcuMzEsMS41NCwyODguMTcsMjg4LjE3LDAsMCwxLTEyNy4zOS00OC4xNGMtOS4yNy02LjI5LTE4LjM2LTEyLjg1LTI2LjUxLTIwLjYyYS42NS42NSwwLDAsMSwwLTFjMS43NC0uNjksMi44NC41Nyw0LDEuNDNhMTg5LjA4LDE4OS4wOCwwLDAsMCw2NSwzMS41NiwyMjguNDYsMjI4LjQ2LDAsMCwwLDIzLjg3LDQuNzVjMS44Mi42NiwzLjc1LjM1LDUuNjIuNjZhNy41NSw3LjU1LDAsMCwxLDEuMTMuMjNjMTguMjQsMi4xNiwzNi4zNy44OSw1NC4zNi0yLjI4LDM5LjU0LTcsNzQuNjYtMjMuNTUsMTA0Ljc1LTUwLjE1LDIwLjUtMTguMTIsMzYuNjgtMzkuNTMsNDUuMjQtNjUuOTVzNy4zNS01Mi4xLTQuNjctNzcuNDhjLTIuNDcsMTEuMzgtOC40NCwyMC44LTE1LjkxLDI5LjM4YTEwNi4wOSwxMDYuMDksMCwwLDEtMjYuMDcsMjEuMTljLTEuMTQuNjYtMi40LDEuOTEtMy43MS45LTEuMTMtLjg2LS40NS0yLjM3LS4xLTMuNTFhMTM5LjY0LDEzOS42NCwwLDAsMCw0Ljk0LTI0LjJjMy41LTM0LjUxLTkuODItNjEuMzctMzcuMy04MS43NGExMTkuOCwxMTkuOCwwLDAsMC0xNC4wNi05IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzI2MmY3MSIvPjxwYXRoIGQ9Ik0yNzYuMDgsNjM4LjQxYTE1MS4xNiwxNTEuMTYsMCwwLDEtMjkuODYtNi4xQTE5OC41MywxOTguNTMsMCwwLDEsMTk0LjM1LDYwOGMtMy44My0yLjUxLTcuMDctNS44Ni0xMS4yNC03Ljg5LTIuMzktLjM0LTMuMzktMi42OC01LjMtMy43LTQwLjM4LTM1LjktNjgtODAtODMuODMtMTMxLjQ4QTI4MC41NCwyODAuNTQsMCwwLDEsODEuNjMsMzg3LjdjLjEtMiwuMi0zLjkzLjM2LTcsMiw0LjM2LDMuNDgsNy44Miw1LjA1LDExLjI2LDE0LjUzLDMxLjg2LDMzLjEzLDYwLjkzLDU4Ljc0LDg1LjEyQzE3Myw1MDIuODIsMjA0LjY4LDUyMCwyNDIsNTI2YzQzLjcxLDcuMTEsODQuNjEtLjUxLDEyMi4yMi0yNC4wNiwxOC43NS0xMS43NSwzNC4xNC0yNi45NCw0My00Ny42NSwxMC43Mi0yNS4xMSw2LjY4LTQ4LjQ0LTkuNjUtNjkuOTUtMS40My0xLjg4LTIuOTUtMy42OS00LjQzLTUuNTQsMS45NC0xLjY2LDMsLjI2LDQuMDcsMS4xOGE4My4yMiw4My4yMiwwLDAsMSwyMi42LDI5LjksODgsODgsMCwwLDEsNy44NSwzNS4xOSw3OS43NSw3OS43NSwwLDAsMS04LDM1Ljg3LDUuMzksNS4zOSwwLDAsMCwzLjI0LTEuMTcsOTguMzQsOTguMzQsMCwwLDAsMTQuNjUtMTAuMzVjMS40Mi0xLjIzLDIuNjctMy4wOCw1LTIuOGExNjUuMywxNjUuMywwLDAsMS02LjA5LDI3Ljc1LDEzMS43NCwxMzEuNzQsMCwwLDAsMTcuMjctMTEuNDhjNC4zMy0zLjM4LDcuODMtNy42MiwxMi4wOC0xMS4wNiwxLjgxLjc3LDEuODEsMi41NiwyLjIzLDQuMDgsNi45MiwyNSwxLjkxLDQ4LjI4LTEwLjQyLDcwLjMtMTUsMjYuNy0zNyw0Ni41Ny02Mi42Miw2Mi42NWEyMTMuMzMsMjEzLjMzLDAsMCwxLTY3LjI3LDI3LjU1LDE0Mi4yLDE0Mi4yLDAsMCwxLTQ1LjY3LDIuNjloMGMtMS45LTEtNC4wNy4xOS02LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNNjU0LjE3LDQ1My4wN2EyMTIsMjEyLDAsMCwwLTIwLjc3LTgyLjM1QTIxOC45LDIxOC45LDAsMCwwLDYwMywzMjRjLTEwLjktMTIuOTEtMjMuNDItMjMuOTMtMzYuNTYtMzQuMzgsMS4yMy0xLjIxLDIuNzYtMSw0LjI0LS44YTIzNi4yOCwyMzYuMjgsMCwwLDEsNTMuNzksMTIuNzhBODAuMiw4MC4yLDAsMCwxLDYzNywzMDcuNDNhNDAuMzgsNDAuMzgsMCwwLDEsNC4xNiwyLjQ0Yy4zNC4xOS41My42OSwxLC41OGExLjI3LDEuMjcsMCwwLDEtLjIxLTEuMzdjLTExLjg0LTE1LjQyLTI2LjE1LTI4LjI4LTQxLjE3LTQwLjVhMzAyLDMwMiwwLDAsMC01OC4xOC0zNi45LDI4Ny42NCwyODcuNjQsMCwwLDAtOTEuNTctMjcuNDVjLTIuODMtLjM1LTUuNzUsMC04LjUxLTEtLjI0LTEuODksMS4zNS0yLjUyLDIuNDUtMy40NCwxOC42Ny0xNS41NSwzMy42OS0zNCw0NC4yOC01NS45NGExNTcuMSwxNTcuMSwwLDAsMCw4LjE0LTIwLjUzYy42NC0yLDEtNC4xNywzLTUuNDRhMjg4LjE2LDI4OC4xNiwwLDAsMSw4OC40Nyw2NiwyOTIuMSwyOTIuMSwwLDAsMSw2Ni42NCwyNzBjLS44NC40Ni0xLS4yNi0xLjM0LS43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNNTQwLjgxLDYxMS4zN2MwLTIuOTQsMi4zNC00LjYsMy43OS02LjY2LDEzLjY2LTE5LjUxLDIyLTQxLjEyLDI2LjMxLTY0LjQ4LDIuNjctMTQuNDcsMi45LTI5LjA4LDItNDMuNTctMS40Ny0yMi4zNC03LjE4LTQzLjgzLTE2LjE5LTY0LjQyYTIxMi4yNSwyMTIuMjUsMCwwLDAtMjQuNzMtNDIuNTcsMjIxLjI0LDIyMS4yNCwwLDAsMC0zNi4xNi0zNy42MkEyMDcuNTYsMjA3LjU2LDAsMCwwLDQyNS4xOSwzMTRhMTk4LjEsMTk4LjEsMCwwLDAtNDIuMjUtOC42OWMtMi41OS0uMjMtNS4xNS0uODUtNy43OC0uNjktOS4xMy02LjczLTE4LjM5LTEzLjI0LTI4Ljc5LTE3Ljk0LDAtLjMzLDAtLjY3LjA3LTEsMy43NCwwLDcuNDkuMDYsMTEuMjMsMCw1Mi40My0uOTQsMTAwLjc1LDExLjkxLDE0Myw0My44NEM1NDQuNCwzNjIuNTksNTcxLjc0LDQwNi4zMiw1ODIsNDYwLjNjOC43Myw0Ni4wNSwyLDg5LjU0LTIzLjU2LDEyOS40NC01LDcuODUtMTAuNTMsMTUuNDEtMTcuNjEsMjEuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTUwMC40LDExNy45MWMtNS4yNSwxNi4wNS0xMS44NCwzMS40Ny0yMS4yNyw0NS41OWExNzIuNzgsMTcyLjc4LDAsMCwxLTM0LjQyLDM3LjczYy0uNzYuNjMtMS40NSwxLjM1LTIuMTcsMi00LjU4LDIuMzMtOC4zNSw1Ljg1LTEyLjU5LDguNjhhMjY3LjY4LDI2Ny42OCwwLDAsMS00OS4zOSwyNS41Myw4LjA5LDguMDksMCwwLDEtMS4yOS4zMmMtLjc2LTEuMTIuMTQtMS41My42LTIsOS44Mi05LjM1LDE1LjkxLTIwLjkyLDIwLTMzLjY2YTUsNSwwLDAsMSwzLjE3LTMuNjVjMzAuNTEtMTIuMDgsNTQuODYtMzIuMTUsNzQuOC01Ny45LDEuODEtMi4zNCwzLjU4LTQuNzEsNS44Mi03LjY2LTYuMTctLjEyLTEwLjksMy0xNi4xMiwzLjgyLTEsLjA2LTIuMjcuODgtMi41LTFhMjE1LjI3LDIxNS4yNywwLDAsMCw0MS44NC03NS42NWMuNTUtMS43OCwwLTQuMjMsMi40OC01LjEzYS40NC40NCwwLDAsMSwuMjUuNDVjMCwuMTgtLjA4LjI2LS4xMy4yNmEyMzAuNDksMjMwLjQ5LDAsMCwxLTguMzUsNTguNTYsMzYuODgsMzYuODgsMCwwLDAtLjY5LDMuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTM4MS44MiwzMjYuNTRhMTIwLDEyMCwwLDAsMSwxNi4wNiwyMi40Yy40My43OSwxLjU0LDEuNjguNTUsMi42MS0uNzUuNy0xLjYyLS4xNi0yLjQxLS40NmEzNDksMzQ5LDAsMCwwLTYyLjU2LTE3Yy0xMC43NS0xLjg1LTIxLjY2LTIuNjYtMzIuNTgtMy40NWExOTQuMDksMTk0LjA5LDAsMCwwLTI5LjQ1LjQyYy0yMi40MiwxLjgtNDQuMjQsNi41OS02NSwxNS41Ni02LjQsMi43Ny0xMi45NCw1LjI1LTE4Ljg5LDktLjY4LjQzLTEuNDksMS4xMy0yLjI3LjA2YTE5OS41OSwxOTkuNTksMCwwLDEsNTkuMi0yOC40MWMyOS4xNS04LjcsNTguOTMtMTAuODQsODkuMTUtOC40NmEzMjguNDIsMzI4LjQyLDAsMCwxLDQ1Ljc0LDYuOTUsMjEuOTIsMjEuOTIsMCwwLDEsMi40NC44MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzc0LjMyLDExNi4zOGg0LjVjMi40MiwxLDUuMDctLjI4LDcuNS43NGg0LjQ5Yy4zOCwyLjE3LTEuNDEsMy4wOC0yLjY1LDQuMTMtMjAuNzgsMTcuNTYtNDEuNDEsMzUuMjktNjIuMiw1Mi44My02Ljg3LDUuNzktMTMuNjgsMTEuNjUtMjAuNTQsMTcuNDVhNi4xNCw2LjE0LDAsMCwwLTIuMzUsMi44M2MtOSwzLjM3LTE3LjM2LDcuNi0yNCwxNC45NC0zLjEzLDMuNDgtNS4xOCw3LjUtNy40NCwxMS40Ni02LjE3LDQtMTEuMzYsOS4yNi0xNywxNC0xNC43NywxMi40Mi0yOS4zNSwyNS4wNi00NC4xNiwzNy40My0xLjI1LDEtMi4wNywyLjUtMy41MiwzLjMxLTIuNTUtMy44LTItOC0xLjM5LTEyLjEyLDEuODYtMy4wNiw0LjgtNSw3LjQ0LTcuMjhxMjEuNTQtMTguMjcsNDMtMzYuNTljMTQtMTEuODUsMjcuOTItMjMuNzcsNDEuOS0zNS42M3EyNC4xMi0yMC40NSw0OC4xNy00MWM4LjkzLTcuNiwxNy44LTE1LjI2LDI2Ljg2LTIyLjcxLDEuMzctMS4xMywyLjMzLTIsMS4yOC0zLjgxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzVjOTRjZSIvPjxwYXRoIGQ9Ik02MzcuNTEsMzA4LjQxYy0xNy42My04LjU2LTM2LjI3LTEzLjc4LTU1LjU0LTE2LjktNS4xNS0uODQtMTAuMy0xLjg3LTE1LjU1LTEuOTEtNi43Mi00LjI1LTEzLjMxLTguNzMtMjAuMTktMTIuN2EyMDkuNzMsMjA5LjczLDAsMCwwLTcyLjE4LTI1Ljc1LDkuMDksOS4wOSwwLDAsMS0xLjY1LS42NGM3LjY1LTEuNCwzMy42OSwyLjUxLDUxLjcyLDcuNDdhMjQzLjA3LDI0My4wNywwLDAsMSw0OC40NywxOWMtMS42Mi00Ljg1LTQuNTgtOC4xMy02LjM5LTEyLS4xOC0xLTEuNjMtMS45NC0uNjYtM3MyLjA3LjA4LDMsLjQ5YzIuNiwxLjE4LDUuMDgsMi42MSw3LjY5LDMuNzdhMzQ3LjUyLDM0Ny41MiwwLDAsMSw2MS40LDQwLjQ5YzEuMDYsMS40LDEuMDYsMS40LS4xMSwxLjY5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzE2MWY0MiIvPjxwYXRoIGQ9Ik0zNzQuMzIsMTE2LjM4Yy40NiwxLjEsMS45Mi4zLDIuNjEsMS41My00LjE4LDMuNjItOC4zNiw3LjMtMTIuNjEsMTAuOTFxLTExLjUxLDkuNzgtMjMuMDcsMTkuNDhRMzI0Ljg3LDE2Mi4xMywzMDguNSwxNzZjLTcuNTgsNi40NC0xNS4wNSwxMy0yMi42MywxOS40Ni05LjE4LDcuOC0xOC40NSwxNS41MS0yNy42NSwyMy4zLTcuMyw2LjE5LTE0LjUzLDEyLjQ3LTIxLjgyLDE4LjY4LTcuNjcsNi41Mi0xNS4zNywxMy0yMy4wNiwxOS40OWwtNy43MSw2LjQ3LDIuMTktOS43NmMtMS4yNC0zLjE5LDEuMzUtNC42MywzLjEzLTYuMSw3LTUuODQsMTMuODgtMTEuODEsMjAuODMtMTcuNzFxMjQuMjUtMjAuNTgsNDguNDktNDEuMjIsMjAuODQtMTcuNyw0MS42Ni0zNS4zOWMxMi45Mi0xMSwyNS45My0yMS45MSwzOC43Mi0zMy4wNywxLS44NiwyLjg1LTEuODcuMTUtMyw0LjQzLTEuNjEsOS0uMzMsMTMuNTItLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzY0OTdkMCIvPjxwYXRoIGQ9Ik0zNjAuOCwxMTcuMTFjMS4wNS4xOSwyLjItLjM3LDMuMy40OS0yLjY1LDMuOS02LjU1LDYuNDUtMTAsOS40NC05LjgyLDguNTYtMTkuNzksMTctMjkuNzQsMjUuMzctOS4xLDcuNjgtMTguMjksMTUuMjYtMjcuMzcsMjNzLTE4LjIzLDE1Ljc0LTI3LjQsMjMuNTQtMTguMjksMTUuMjctMjcuMzYsMjNTMjI0LDIzNy41OCwyMTQuODcsMjQ1LjQ1Yy0yLjc0LDIuMzctNi4zNyw0LTcuMDUsOC4xNS00Ljg0LjU1LTcuNCw0LjY0LTEwLjk0LDcuMTYtNS41OSw0LTkuODQsOS40Ny0xNSwxMy45NS01LjE5LDMuNjktOS43Nyw4LjEtMTQuNjEsMTIuMi0xNC4zOCwxMi4xOS0yOC43LDI0LjQ2LTQzLjEzLDM2LjU5LTIsMS42OC0zLjc3LDMuNjYtNiw1LjA2LTEsLjYyLTEuOTEsMS43OS0zLjMyLjgxYTE2LjksMTYuOSwwLDAsMSwxLjUxLTcuNTFjNy4xOS00LjU5LDEzLjE3LTEwLjY3LDE5LjY2LTE2LjEsMTcuODgtMTUsMzUuNjEtMzAuMTYsNTMuMzgtNDUuMjlzMzUuMy0zMC4xMyw1My00NS4xNXEyNi0yMiw1MS45NC00NC4wOGMxNy42OC0xNSwzNS40NC0zMCw1My00NS4xNSwzLjQ5LTMsNy4xNi01LjgzLDEwLjU2LTloMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMzk5LjgxLDExNy44N2M0LjA3LS4wNSw4LDEsMTIsMS41LDEuMDksMi4zOS0xLDMuMzItMi4yMyw0LjQzLTUsNC4zNy0xMC4yMyw4LjQ4LTE1LjEsMTMtLjUyLS42OS0xLjA4LTEuMzYtMS41Ni0yLjA5LTEuMTEtMS42NS0xLjg5LTEuMjEtMi42MS4zMy01LjksMTIuNjYtMTYuMDUsMjEuNDYtMjcuMSwyOS4zYTIwMi4xNCwyMDIuMTQsMCwwLDEtMzkuODcsMjEuNzljLS43Ni0xLjQ0LS44My0xLjUuNDctMi44NCwyLjY5LTIuNzgsNS43Ny01LjE0LDguNzItNy42NCwyMS4yOS0xOC4xLDQyLjY0LTM2LjEyLDYzLjgxLTU0LjM3LDEuMjMtMS4wNywyLjI5LTIuMywzLjQ3LTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTM5OS44MSwxMTcuODdhNC41NSw0LjU1LDAsMCwxLTEuNzUsMy4xNHEtMjAuNiwxNy40My00MS4xMywzNC45My0xNS43MiwxMy40LTMxLjM2LDI2Ljg5Yy0uOTQuODItMi43MSwxLjQtMi4yMywzLjNhMTg3LjQsMTg3LjQsMCwwLDEtMjAuMjcsOC4yNGMtMi4zMy0uNjQtLjQtMS40NywwLTEuODUsNC4wOS0zLjYyLDguMjMtNy4xOCwxMi4zOS0xMC43MnExMS40Ny05Ljc1LDIzLTE5LjQ3YzcuNTctNi40LDE1LjE4LTEyLjc3LDIyLjczLTE5LjE5czE1LjEyLTEyLjg3LDIyLjU3LTE5LjQyYzIuNDEtMi4xMiw1LjM2LTMuNjgsNy02LjU5LDMuMDYtLjQ0LDYsLjYsOSwuNzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTM0Ni42MSwyMDhjNy45Mi0zLjkyLDE2LjE5LTcuMjEsMjMuMS0xMi45MywxLjQ0LS4wNiwxLjI4Ljc2Ljk0LDEuNjktNi4zOCwyNi40Mi0yNi40Miw0My43Ny01My41Miw0Ni4zLTUuMjIuNDktMTAuNDMsMS4wOS0xNS42OS41OS42OC0xLjkzLDIuNTEtMS43Niw0LTIuMTcsNS44OC0xLjYsMTEuNzEtMy4zMSwxNy4xNi02LjEzLDEwLjIyLTUuMjgsMTcuNzEtMTMuMDcsMjItMjMuODRhOC4yMiw4LjIyLDAsMCwxLDIuMDUtMy41MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzQ2LjYxLDIwOGMtMy4yNiwxMi42LTExLjI5LDIxLjMxLTIyLjM5LDI3LjU1LTcuMTMsNC0xNSw1Ljg2LTIyLjc3LDguMS0xLjkxLTUuNTkuMTYtMTAuMzIsMy41Mi0xNC41NywzLjk0LTUsOS4zLTguMDgsMTUtMTAuNjlBMjc3LjA4LDI3Ny4wOCwwLDAsMSwzNDYuNjEsMjA4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQxOGFjOSIvPjxwYXRoIGQ9Ik0xMTQuOCwzMjkuMzdjNC40NS0xLjY1LDcuMzEtNS40MSwxMC44MS04LjI4LDExLjI5LTkuMjcsMjIuMzgtMTguNzgsMzMuNTEtMjguMjQsNS44NS01LDExLjYxLTEwLjA1LDE3LjQxLTE1LjA4LDEuNTgtMS4zNywzLjA1LTIuOTQsNS4zNC0zLjA2LTYsNy41Mi0xMS43MywxNS4yNC0xNiwyMy45M3EtMTcuMjUsMTQuNi0zNC40NCwyOS4yN2MtNS4zLDQuNTMtMTAuNzEsOC45NC0xNS45MywxMy41Ny0uOC43MS0xLjcsMS42LTIuOTQuNjRhNTQuMTMsNTQuMTMsMCwwLDEsMi4yNC0xMi43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2NDk3ZDAiLz48cGF0aCBkPSJNMTU4LjgxLDM0OS41OGMtMy41NC4yNy01LjE0LDMuNDQtNy40OCw1LjMzLTkuODUsNy45NS0xOS40NSwxNi4yMi0yOSwyNC40OS0zLjIsMi43Ni02LjMsNS42Mi05LjY5LDguMTYtMi4yMywxLjY4LTMuMDcsMS0zLTEuNTgsMC0zLjEyLDAtNi4yNCwwLTkuMzYsMy40Ni0zLjc1LDcuNjEtNi43MiwxMS40OC0xMCwxMS4xNy05LjQ4LDIyLjIzLTE5LjEsMzMuNTUtMjguNDIsMS0uOCwxLjc5LTIuMjYsMy40Ni0xLjMxbC43NSwxMi42OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA3LDI3NS40OGE0LjE3LDQuMTcsMCwwLDEsMS45MS0zLjA4YzktNy42LDE4LTE1LjE1LDI3LTIyLjc2LDcuMzktNi4yNSwxNC43Mi0xMi41NiwyMi4wNy0xOC44NywzLjg2LTMuMzEsNy42OS02LjY2LDExLjUyLTEwLC43My0uNjQsMS40MS0xLjEyLDIuMTIsMC0uODMsMy40MS0xLjgyLDYuNzktMS43MiwxMC4zNS00LDQuNDMtOC44OSw3LjkzLTEzLjQyLDExLjgtMTQsMTItMjcuOTUsMjMuOTMtNDIsMzUuNzZhMTEuMzQsMTEuMzQsMCwwLDAtMS40OCwxLjY4LDcuOTMsNy45MywwLDAsMS02LTQuODgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTExMi41NiwzNDIuMTJjMy4yNC0xLDUuMTMtMy44MSw3LjU2LTUuODIsMTMuMTctMTAuODksMjYuMTMtMjIsMzkuMTctMzMuMDgsMi4wNS0xLjczLDMuNDktNC4zMyw2LjU4LTQuNThhMTUwLjg5LDE1MC44OSwwLDAsMC02LDE4Yy0yLjM0LS4yMy0zLjUzLDEuNjQtNSwyLjg4LTEzLjU4LDExLjY3LTI3LjI4LDIzLjItNDAuOTIsMzQuOC0uODIuNjktMS41NSwxLjcxLTIuODksMS4yNmE0NC44OCw0NC44OCwwLDAsMSwxLjUtMTMuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1Yzk0Y2UiLz48cGF0aCBkPSJNMjEzLDI4MC4zNmMtLjkzLTEuNjguNjUtMi4yMywxLjQ3LTIuOTNxMTcuMi0xNC43MSwzNC40OS0yOS4zNCw5Ljc3LTguMjgsMTkuNTktMTYuNDlhNC4xNiw0LjE2LDAsMCwxLDEuMzgtLjQ3LDI5LjkyLDI5LjkyLDAsMCwwLDEuMzgsOWMtMy45Myw0LjU2LTguODcsOC0xMy4zOSwxMS44NnEtMTUuMTMsMTMtMzAuNDUsMjUuOTNhMy41LDMuNSwwLDAsMC0xLjU0LDJjLTQuMjYsMS41OC04LjU2LDIuMjEtMTIuOTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC4wNiwzMzYuODljLTQuMjEsMi40MS03LjU3LDUuOTEtMTEuMjcsOS05Ljc2LDgtMTkuMzcsMTYuMjUtMjguOTQsMjQuNS0yLjY0LDIuMjgtNSw0LjgyLTguMjgsNi4yNy4zOS00LS44NC04LjA4Ljc0LTEycTIyLjE3LTE4Ljk0LDQ0LjQ2LTM3Ljc2YzEtLjg2LDIuMDYtMS45MSwzLjY0LTEuMjMtLjEyLDMuNzUtLjIzLDcuNS0uMzUsMTEuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC40MSwzMjUuNjNjLTQuNzUsMi41NS04LjQyLDYuNS0xMi41Miw5Ljg4LTkuNjgsNy45NS0xOS4xNCwxNi4xNi0yOC43MywyNC4yMi0yLjE0LDEuODEtMy42NCw0LjU2LTYuODUsNC44OS4zOC0zLS44LTYuMTEuNzUtOXExNC0xMiwyOC4wNi0yMy45MmM2LjM0LTUuMzksMTIuNzQtMTAuNzEsMTkuMDctMTYuMSwyLTEuNzIsMS40Ny4xNywxLjY1LDEuMDhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1OTFjZCIvPjxwYXRoIGQ9Ik0yMjYsMjgwYy0xLjM4LTEtLjQxLTEuNzQuMzItMi4zNSw4LjgyLTcuNCwxNy42OC0xNC43NSwyNi40OS0yMi4xNiw1LjUtNC42MywxMC45My05LjM0LDE2LjM3LTE0YTMuNjYsMy42NiwwLDAsMSwyLjItMS4yOGwyLjI1LDQuNDljLTEuNzMsMi42Ny00LjUsNC4zMy02LjQ1LDYuNzktMTAuODMsMTItMjIuOTUsMjIuMTQtMzguMjksMjcuOTFBMTkuNTMsMTkuNTMsMCwwLDEsMjI2LDI4MCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0ODhkY2EiLz48cGF0aCBkPSJNMzk0LjQ4LDEzNi44YzEuMzYtNC4yNSw1Ljc3LTUuNDcsOC4zOC04LjQ3LDIuNzgtMy4xOSw3LjMzLTQuNjEsOC45NS05LDMuMjYsMCw2LjM4Ljg2LDkuNTUsMS40NSwyLjc0LjUxLDIuODYsMS43LDEsMy4zOS00LjA4LDMuNjQtOC4yLDcuMjYtMTIuMzQsMTAuODItMy44NiwzLjMyLTcuNzgsNi41Ny0xMS42OCw5Ljg1WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA5LjM3LDMwNy44MWMuNjYsMS42Ni0xLjMzLDIuNDktMS4xLDQtMS00LjU2LTMuNTEtNi4zMy04LjA4LTUuNDJhMjMuNjUsMjMuNjUsMCwwLDAtMTIuNjQsNy4zNWMtLjk0LDEtMiwxLjg5LTMsMi44NC0uODItMSwwLTEuODcuMzMtMi43NiwyLTYuNTEsNi4zOS0xMS4xNCwxMS45My0xNC44M2ExMi41NywxMi41NywwLDAsMSw0LjA2LTEuODVjNi40Mi0xLjUzLDkuOTQsMS42MSw5LjA2LDguMTJhOC4yOCw4LjI4LDAsMCwxLS42MSwyLjUzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyOGFjOSIvPjxwYXRoIGQ9Ik0yMDkuMzcsMzA3LjgxYzAtMSwuMDYtMiwuMDctMywuMTEtNi41NC0zLjYtOS05LjY3LTYuMjUtNywzLjItMTEuNDIsOC45Mi0xNC40OSwxNS43OS0uNzEuMTMtMS4wOC0uMDctLjg2LS44NiwyLjIxLTguMTYsNi40Ny0xNC45MiwxMy41Ni0xOS43M2ExNC44MiwxNC44MiwwLDAsMSw1Ljg1LTIuMjgsNi4yNSw2LjI1LDAsMCwxLDcuNDEsNC42MSwxNC44OCwxNC44OCwwLDAsMS0xLjg3LDExLjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTgyMTQ0Ii8+PHBhdGggZD0iTTI2Ny4xMywyNTEuNDFjLTEuMjYtMS0uMTUtMS40LjUyLTEuODcsMi4xMS0xLjQ3LDMuMjctNC4xLDUuOTMtNC45MiwzLjQsNS4zOCw4LjgzLDcuNzUsMTQuNDksOS43NywxLjE0LjQxLDIuMzMuNjcsNC4xOSwxLjE5LTguNzIsMi4yNy0xNi4yNCwxLjM5LTIzLjE1LTMuMzNhMywzLDAsMCwwLTItLjg0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQ1OGNjYSIvPjxwYXRoIGQ9Ik01NzYuMjIsMjY2LjIzYy0yLjc1LS4zMi00Ljg0LTIuMi03LjM0LTMuMTMtMS0uMzYtMS44OS0xLjY0LTIuOTItLjgtLjg1LjcuNTQsMS43NC4yNCwyLjcxLTEuNTMtMS4zNC0yLjA2LTMuMjYtMi44Ni01LjIxLDQuNDYsMS44NSw4LjkxLDMuNjQsMTIuODgsNi40MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2MzY1N2QiLz48cGF0aCBkPSJNNjM3LjUxLDMwOC40MWMuODEtLjUxLDAtMS4xMy4xMS0xLjY5bDQuMzUsMi4zNiwyLjM0LDNjLTIuODUtLjc2LTQuNzgtMi4zMS02LjgtMy42NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMyNjMxNTQiLz48cGF0aCBkPSJNNDY1LjE5LDI0OS4yNmExNC4yNiwxNC4yNiwwLDAsMSw2LC40NWMtMi4zMiwxLjI2LTMuOTIsMS4wOS02LS40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiNhMDlhYTkiLz48cGF0aCBkPSJNMTc3LjgxLDU5Ni4zNmMyLjMzLjQyLDMuMzksMi42Nyw1LjMsMy43TDE4Myw2MDFhMTQuMjIsMTQuMjIsMCwwLDEtNS4yMS00LjU5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyNGE3ZiIvPjxwYXRoIGQ9Ik02NTQuMTcsNDUzLjA3bDEuMzQuNzVjLjE5LDEuNTEtLjQ1LDIuNzUtMS4zNCw0LjZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzhjYjdkZSIvPjxwYXRoIGQ9Ik00NjUsMTM1Ljc5Yy41MSwxLjE1LDEuNjYuNjgsMi41LDFsLTQsMS41NWMtLjMxLTEuNTkuNzctMS45NSwxLjUxLTIuNTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNWE1ZDc2Ii8+PHBhdGggZD0iTTE4NC40MiwzMTMuNTFsLjg2Ljg2Yy0uMjMuNzQtLjQ1LDEuNDktLjY4LDIuMjNMMTgzLDMxOC42N2MuNDgtMi40Mi41MS0zLjksMS40My01LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzRmNjY4YSIvPjxwYXRoIGQ9Ik0zNzAuNjUsMTk2LjczYy0uMjItLjYyLS4xMy0xLjQtLjk0LTEuNjkuMjQtLjU4Ljg5LTEuMzksMS4xOS0xLjEuOS44Ny41MiwxLjkxLS4yNSwyLjc5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1NWE3MyIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZhNjEuNDQsNjEuNDQsMCwwLDEsNC41LTE1Ljc3YzguODItNi4xNSwxNi41OC0xMy42LDI0Ljc5LTIwLjVxMjEuMzUtMTgsNDIuNTMtMzYuMTQsMTkuMzUtMTYuNTUsMzguNzktMzMsMjEtMTcuOCw0Mi0zNS42NmMxMi43NC0xMC44MywyNS41Mi0yMS42MywzOC4yMS0zMi41Myw4LjktNy42NSwxOC0xNS4wNywyNi43NC0yMi44OGE1Myw1MywwLDAsMSwxNC4yNC0xLjUyLDEuNDQsMS40NCwwLDAsMSwxLjU0LS4xOGMxLjA2LDEuODEtLjI5LDIuODQtMS4zOSwzLjc2cS0xOC4xMywxNS4zNi0zNi4xOSwzMC44MVEyOTQuMjgsMTY4LjYzLDI3NSwxODVxLTE3Ljc5LDE1LjE4LTM1LjY0LDMwLjI5UTIxNy43LDIzMy42NywxOTYsMjUyLjFjLTE4LDE1LjI1LTM1Ljg4LDMwLjU5LTUzLjksNDUuNzktNyw1Ljg3LTEzLjgxLDExLjg4LTIwLjg3LDE3LjYzLS44OC43MS0yLjA3LDMtMy40Ny4zNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ZDljZDIiLz48cGF0aCBkPSJNMzM1LjMxLDExOS4zOGMtMS4yNiw0LjIxLTUuMzMsNS43OS04LjIyLDguMzYtOS40Nyw4LjQyLTE5LjI2LDE2LjQ5LTI4Ljk0LDI0LjY3LTEwLjgzLDkuMTMtMjEuNzIsMTguMi0zMi41MSwyNy4zOC05LjM4LDgtMTguNjIsMTYuMTEtMjgsMjQuMS05LjA5LDcuNzQtMTguMjksMTUuMzQtMjcuMzgsMjMuMDZzLTE4LjExLDE1LjU1LTI3LjIxLDIzLjI4LTE4LjI1LDE1LjM3LTI3LjM1LDIzLjA5Yy03LjQ5LDYuMzYtMTQuOTIsMTIuNzktMjIuMzksMTkuMTYtMywyLjU4LTYuMTEsNS4xLTkuMTYsNy42NS0uNjYuNTUtMS4yNi44Mi0xLjg2LDBhNjAsNjAsMCwwLDEsNS4yNS0xNWM2LjktNC4zNSwxMi42Ny0xMC4xLDE4Ljg2LTE1LjMycTIxLjMzLTE4LDQyLjUxLTM2LjEzLDIxLjkyLTE4Ljc1LDQzLjkyLTM3LjM5LDE4LjEtMTUuNDIsMzYuMjUtMzAuNzljMTUuNzMtMTMuMywzMS4zMy0yNi43Niw0Ny4xMy00MGE2Ljk0LDYuOTQsMCwwLDAsMi41OC0zLjEzYzUuMzEtMi4wNiwxMS0xLjkzLDE2LjUxLTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNzI5ZmQ0Ii8+PHBhdGggZD0iTTMxOC44LDEyMi4zNmMyLjMzLjYxLjQzLDEuNDYsMCwxLjg1LTQuMjUsMy44Mi04LjU0LDcuNjEtMTIuODksMTEuMzEtNy41Nyw2LjQzLTE1LjIsMTIuNzktMjIuNzksMTkuMnEtMTYuNjcsMTQtMzMuMjksMjguMTNjLTkuMDksNy43My0xOC4wOCwxNS41Ni0yNy4xNiwyMy4yOS05LjM2LDgtMTguNzksMTUuODUtMjguMTYsMjMuODItOS4wOCw3LjczLTE4LjA5LDE1LjU0LTI3LjE3LDIzLjI3UzE0OS4xLDI2OC42MSwxNDAsMjc2LjI5Yy0zLjMzLDIuOC02LjY0LDUuNjItMTAsOC4zNy0uNjYuNTQtMS4zNywxLjc2LTIuNDQuNDQsMS01LjE2LDMuNzItOS42MSw2LTE0LjI0LDEyLjMzLTEwLjU0LDI0LjcyLTIxLDM3LjA2LTMxLjU2cTE5LjA4LTE2LjI5LDM4LjIxLTMyLjUyLDE4LjI1LTE1LjUzLDM2LjUzLTMxUTI2NC42LDE1OS4zOSwyODMuODYsMTQzYzYuNjUtNS42NCwxMy4wOS0xMS41NCwxOS45NS0xNyw0Ljc1LTIuMjEsOS45LTIuODMsMTUtMy43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM3OGEyZDUiLz48cGF0aCBkPSJNMzAzLjgxLDEyNi4wN2MtNC43Niw2LjE5LTExLjIyLDEwLjU1LTE3LDE1LjYzLTcuNTcsNi42NC0xNS4zMiwxMy4wNS0yMywxOS41NS03LjQ5LDYuMzQtMTUsMTIuNjUtMjIuNDksMTlTMjI2LjM5LDE5MywyMTguOSwxOTkuNHMtMTUuMjEsMTIuOC0yMi43OSwxOS4yM2MtNy4zOSw2LjI4LTE0LjcxLDEyLjYzLTIyLjEsMTguOTFxLTE0LjA2LDEyLTI4LjE3LDIzLjg1Yy0zLjMyLDIuODEtNi42Niw1LjYtMTAsOC40YTMuNDMsMy40MywwLDAsMS0yLjMyLDEuMDcsOTkuOTMsOTkuOTMsMCwwLDEsOS0xOGMxNy4xMi0xMy45MSwzMy43Ny0yOC40LDUwLjU3LTQyLjcsMTkuNDUtMTYuNTcsMzktMzMsNTguMzQtNDkuNzMsMTAuOTQtOS40NSwyMi4zLTE4LjQxLDMyLjg1LTI4LjMyYTExMy40MywxMTMuNDMsMCwwLDEsMTkuNS02IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzdkYTVkNiIvPjxwYXRoIGQ9Ik0yODQuMzEsMTMyLjExYy43NSwxLjM0LS42LDEuNzQtMS4xOCwyLjI2cS0xMi40OCwxMC45NC0yNS4wNiwyMS43M2MtNy4zNSw2LjMxLTE0Ljc3LDEyLjU0LTIyLjE2LDE4LjhxLTEzLjc4LDExLjY3LTI3LjU4LDIzLjM0Yy03LjQ3LDYuMzUtMTQuOSwxMi43Ni0yMi4zOCwxOS4xMS05LjM3LDgtMTguNzgsMTUuODctMjguMTUsMjMuODJxLTUuODQsNS0xMS42MSwxMGE2LjQ1LDYuNDUsMCwwLDEtMy42NCwxLjc0LDE1OS4yNiwxNTkuMjYsMCwwLDEsMTYuNTItMjYuMjRjNS44LTQuMjcsMTEuMS05LjE2LDE2LjU5LTEzLjgxcTIxLjM5LTE4LjEyLDQyLjcyLTM2LjMyLDE2LjUtMTQuMDYsMzMtMjguMTRjMS43LTEuNDUsMy44My0yLjM4LDUuMTMtNC4yOSw4LjcyLTUuMjgsMTguMy04LjUzLDI3LjgyLTExLjk1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzgxYTdkOCIvPjxwYXRoIGQ9Ik00NDIuNTUsNDY2LjY0Yy03LjU1LDYuMTYtMTQuOTUsMTIuNTQtMjUsMTYuODFhODguODYsODguODYsMCwwLDAsNi42My0xOC4yNGM1LjkyLTI2LC40My00OS42Ni0xNC44Ny03MS4yNC0zLjc4LTUuMzItOC44Ni05LjQ0LTEzLjM2LTE0LjA5LS43My0uNzUtMS41Mi0xLjY5LTIuODMtMS4wNi0xLjM1LS42Ni0yLTItMy0zLC42NS0uODMsMS4zMi0uMzcsMiwwLDE4LjEzLDEwLjI4LDMzLjI0LDIzLjYyLDQyLjQ3LDQyLjY5YTg1LjIzLDg1LjIzLDAsMCwxLDguMTgsMzAsODYuODYsODYuODYsMCwwLDEtLjE3LDE4LjE3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzBlMWY2NiIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZjMywxLjA4LDQtMS45MSw1LjU0LTMuMTQsMTUuMjEtMTIuNTksMzAuMjEtMjUuNDQsNDUuMjMtMzguMjYsMTQuMTctMTIuMSwyOC4yNS0yNC4zMSw0Mi40NS0zNi4zOCwxNS44MS0xMy40MywzMS43NC0yNi43LDQ3LjU1LTQwLjEzLDE0LjItMTIuMDcsMjguMjgtMjQuMjcsNDIuNDQtMzYuMzhRMzI0LDE0MiwzNDcsMTIyLjRjMS41Ny0xLjM0LDMuODMtMiw0LjExLTQuNTMuODYtLjgyLDIuMTMuMDgsMy0uNzNsMy43NiwwYy0xLjE1LDQtNSw1LjM5LTcuNyw3LjgxLTcuNzYsNy0xNS44NSwxMy41OS0yMy44MiwyMC4zMy05LjExLDcuNy0xOC4yNiwxNS4zNi0yNy4zNiwyMy4wOC03LjM5LDYuMjctMTQuNzIsMTIuNjItMjIuMTIsMTguOS0xMC45LDkuMjQtMjEuODUsMTguNDItMzIuNzQsMjcuNjctNy40LDYuMjgtMTQuNzIsMTIuNjQtMjIuMSwxOC45Mi05LjM4LDgtMTguOCwxNS44OC0yOC4xOCwyMy44NS03LjM5LDYuMjgtMTQuNzEsMTIuNjQtMjIuMSwxOC45Mi03LjU3LDYuNDQtMTUuMjEsMTIuODEtMjIuNzgsMTkuMjVzLTE1LjA4LDEzLTIyLjY1LDE5LjQzYy0yLjY0LDIuMjUtNS4zOCw0LjQtOC4wOCw2LjYtLjY0LjUyLTEuMjUuODUtMS44NywwYTExLjc1LDExLjc1LDAsMCwxLDEuNDktNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2OTlhZDEiLz48cGF0aCBkPSJNMjU2LjQ5LDE0NC4wNmMtLjYzLDMuNTUtNC4wOSw0LjQ4LTYuMjksNi40Ni03LjY2LDYuODktMTUuNjMsMTMuNDMtMjMuNDksMjAuMDgtOS4yLDcuNzctMTguNDIsMTUuNS0yNy42LDIzLjI5LTcuMzksNi4yNi0xNC43MywxMi41OS0yMi4wOCwxOC44OXEtOC4wNiw2LjktMTYuMSwxMy44M2MtLjYzLjU0LTEuMjQuODctMS44NiwwYTE0MS43MiwxNDEuNzIsMCwwLDEsMTMuMTQtMTcuMTFjMTcuNjUtMjAuNSwzNy43LTM4LjMsNjAuNzMtNTIuNiw3LjYtNC43MSwxNS4xNC05LjYsMjMuNTUtMTIuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjODhhYmQ5Ii8+PHBhdGggZD0iTTM4Ni4zMiwxMTcuMTJjLTIuNDktLjMzLTUuMTMuNzctNy41LS43NCwyLjQ5LjMyLDUuMTItLjc4LDcuNS43NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1NTkxY2QiLz48cGF0aCBkPSJNMzU0LjA1LDExNy4xNGMtLjc5LDEuMDctMiwuNjItMywuNzNoLTEuNTFjMS4zMy0xLjMsMy0uNTIsNC41LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMjgyLjA2LDYzOS4xMmExODIuMywxODIuMywwLDAsMCw3MS44MS0xMS4zMSwyMTQsMjE0LDAsMCwwLDYxLjYxLTM0LjY3YzE4LjA5LTE0LjY4LDMzLjY2LTMxLjUzLDQ0LjA2LTUyLjYxYTEwMS4zNiwxMDEuMzYsMCwwLDAsMTAuMjItMzZjMS0xMS4zMS0uODgtMjItMy45NS0zMi42NC4zNC0yLjYxLDIuNzItMy44LDQuMTEtNS42Myw1LjM4LTcuMDcsOS4zNS0xNC42OSwxMS0yMy40NmEyNy40MywyNy40MywwLDAsMSwxLjIxLTMuNDMsMTExLDExMSwwLDAsMSw4LDIxLjE2YzIuNjMsMTAuMzEsNC4xMSwyMC44LDMuMzMsMzEuNGExMjMuMzEsMTIzLjMxLDAsMCwxLTE2LjA2LDUyLjMyYy05LjE2LDE2LjE1LTIxLDMwLTM0LjYsNDIuMzdhMTk5Ljg5LDE5OS44OSwwLDAsMS0zOS4zNywyNy41NCwyMTkuNSwyMTkuNSwwLDAsMS01NC4yNiwyMC43MSwyMDkuMjcsMjA5LjI3LDAsMCwxLTM2LjA1LDUuMmMtNS44NS4zMy0xMS43MS44My0xNy41Mi40Ni00LjUxLS4yOS05LjE0LDAtMTMuNTYtMS4zNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMwZTFmNjYiLz48L2c+PC9zdmc+',
  router: {
    address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    api: UniswapV2Router02$1
  },
  factory: {
    address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    api: UniswapV2Factory$1
  },
  pair: {
    api: UniswapV2Pair$1
  },
  slippage: true,
};

function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath$2 = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.polygon.NATIVE && path[index+1] != CONSTANTS.polygon.WRAPPED &&
      path[index-1] != CONSTANTS.polygon.WRAPPED
    ) {
      return CONSTANTS.polygon.WRAPPED
    } else {
      return token
    }
  });

  if(fixedPath[0] == CONSTANTS.polygon.NATIVE && fixedPath[1] == CONSTANTS.polygon.WRAPPED) {
    fixedPath.splice(0, 1);
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.polygon.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.polygon.WRAPPED) {
    fixedPath.splice(fixedPath.length-1, 1);
  }

  return fixedPath
};

let minReserveRequirements$2 = ({ reserves, min, token, token0, token1, decimals }) => {
  if(token0.toLowerCase() == token.toLowerCase()) {
    return reserves[0].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else if (token1.toLowerCase() == token.toLowerCase()) {
    return reserves[1].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else {
    return false
  }
};

let pathExists$2 = async (path) => {
  if(fixPath$2(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'polygon',
    address: basics$6.factory.address,
    method: 'getPair',
    api: basics$6.factory.api, 
    cache: 3600000, 
    params: fixPath$2(path) 
  });
  if(pair == CONSTANTS.polygon.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'polygon', address: pair, method: 'getReserves', api: basics$6.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token0', api: basics$6.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token1', api: basics$6.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.polygon.WRAPPED)) {
    return minReserveRequirements$2({ min: 1, token: CONSTANTS.polygon.WRAPPED, decimals: CONSTANTS.polygon.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.polygon.USD)) {
    let token = new Token({ blockchain: 'polygon', address: CONSTANTS.polygon.USD });
    let decimals = await token.decimals();
    return minReserveRequirements$2({ min: 1000, token: CONSTANTS.polygon.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$6 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path;
  if (await pathExists$2([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists$2([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists$2([tokenOut, CONSTANTS.polygon.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.USD &&
    await pathExists$2([tokenIn, CONSTANTS.polygon.USD]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists$2([CONSTANTS.polygon.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.USD, CONSTANTS.polygon.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists$2([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.USD &&
    await pathExists$2([CONSTANTS.polygon.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, CONSTANTS.polygon.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$2([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.polygon.NATIVE) {
    path.splice(1, 0, CONSTANTS.polygon.WRAPPED);
  } else if(_optionalChain$2([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.polygon.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.polygon.WRAPPED);
  }

  return { path, fixedPath: fixPath$2(path) }
};

let getAmountOut$2 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'polygon',
      address: basics$6.router.address,
      method: 'getAmountsOut',
      api: basics$6.router.api,
      params: {
        amountIn: amountIn,
        path: fixPath$2(path),
      },
    })
    .then((amountsOut)=>{
      resolve(amountsOut[amountsOut.length - 1]);
    })
    .catch(()=>resolve());
  })
};

let getAmountIn$2 = ({ path, amountOut, block }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'polygon',
      address: basics$6.router.address,
      method: 'getAmountsIn',
      api: basics$6.router.api,
      params: {
        amountOut: amountOut,
        path: fixPath$2(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$6 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn$2({ block, path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountOut$2({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn$2({ block, path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut$2({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$6 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'polygon',
    from: fromAddress,
    to: basics$6.router.address,
    api: basics$6.router.api,
  };

  if (path[0] === CONSTANTS.polygon.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens';
      transaction.value = amountIn.toString();
      transaction.params = { amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens';
      transaction.value = amountInMax.toString();
      transaction.params = { amountOut: amountOut.toString() };
    }
  } else if (path[path.length - 1] === CONSTANTS.polygon.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixPath$2(path),
    to: fromAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

var quickswap = new Exchange(
  Object.assign(basics$6, {
    findPath: findPath$6,
    getAmounts: getAmounts$6,
    getTransaction: getTransaction$6,
  })
);

let UniswapV2Router02 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let UniswapV2Factory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let UniswapV2Pair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$5 = {
  blockchain: 'ethereum',
  name: 'uniswap_v2',
  alternativeNames: [],
  label: 'Uniswap v2',
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQxIiBoZWlnaHQ9IjY0MCIgdmlld0JveD0iMCAwIDY0MSA2NDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMjQuNTM0IDEyMy4yMjZDMjE4LjY5MiAxMjIuMzIgMjE4LjQ0NSAxMjIuMjEzIDIyMS4xOTUgMTIxLjc5MUMyMjYuNDY0IDEyMC45OCAyMzguOTA1IDEyMi4wODUgMjQ3LjQ3OSAxMjQuMTIzQzI2Ny40OTQgMTI4Ljg4MSAyODUuNzA3IDE0MS4wNjkgMzA1LjE0OCAxNjIuNzE0TDMxMC4zMTMgMTY4LjQ2NUwzMTcuNzAxIDE2Ny4yNzdDMzQ4LjgyOCAxNjIuMjc1IDM4MC40OTMgMTY2LjI1IDQwNi45NzggMTc4LjQ4NUM0MTQuMjY0IDE4MS44NTEgNDI1Ljc1MiAxODguNTUyIDQyNy4xODcgMTkwLjI3NEM0MjcuNjQ1IDE5MC44MjIgNDI4LjQ4NSAxOTQuMzU1IDQyOS4wNTMgMTk4LjEyNEM0MzEuMDIgMjExLjE2NCA0MzAuMDM2IDIyMS4xNiA0MjYuMDQ3IDIyOC42MjVDNDIzLjg3NyAyMzIuNjg4IDQyMy43NTYgMjMzLjk3NSA0MjUuMjE1IDIzNy40NTJDNDI2LjM4IDI0MC4yMjcgNDI5LjYyNyAyNDIuMjggNDMyLjg0MyAyNDIuMjc2QzQzOS40MjUgMjQyLjI2NyA0NDYuNTA5IDIzMS42MjcgNDQ5Ljc5MSAyMTYuODIzTDQ1MS4wOTUgMjEwLjk0M0w0NTMuNjc4IDIxMy44NjhDNDY3Ljg0NiAyMjkuOTIgNDc4Ljk3NCAyNTEuODExIDQ4MC44ODUgMjY3LjM5M0w0ODEuMzgzIDI3MS40NTVMNDc5LjAwMiAyNjcuNzYyQzQ3NC45MDMgMjYxLjQwNyA0NzAuNzg1IDI1Ny4wOCA0NjUuNTEyIDI1My41OTFDNDU2LjAwNiAyNDcuMzAxIDQ0NS45NTUgMjQ1LjE2MSA0MTkuMzM3IDI0My43NThDMzk1LjI5NiAyNDIuNDkxIDM4MS42OSAyNDAuNDM4IDM2OC4xOTggMjM2LjAzOEMzNDUuMjQ0IDIyOC41NTQgMzMzLjY3MiAyMTguNTg3IDMwNi40MDUgMTgyLjgxMkMyOTQuMjk0IDE2Ni45MjMgMjg2LjgwOCAxNTguMTMxIDI3OS4zNjIgMTUxLjA1MUMyNjIuNDQyIDEzNC45NjQgMjQ1LjgxNiAxMjYuNTI3IDIyNC41MzQgMTIzLjIyNloiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTQzMi42MSAxNTguNzA0QzQzMy4yMTUgMTQ4LjA1NyA0MzQuNjU5IDE0MS4wMzMgNDM3LjU2MiAxMzQuNjJDNDM4LjcxMSAxMzIuMDgxIDQzOS43ODggMTMwLjAwMyA0MzkuOTU0IDEzMC4wMDNDNDQwLjEyIDEzMC4wMDMgNDM5LjYyMSAxMzEuODc3IDQzOC44NDQgMTM0LjE2N0M0MzYuNzMzIDE0MC4zOTIgNDM2LjM4NyAxNDguOTA1IDQzNy44NCAxNTguODExQzQzOS42ODYgMTcxLjM3OSA0NDAuNzM1IDE3My4xOTIgNDU0LjAxOSAxODYuNzY5QzQ2MC4yNSAxOTMuMTM3IDQ2Ny40OTcgMjAxLjE2OCA0NzAuMTI0IDIwNC42MTZMNDc0LjkwMSAyMTAuODg2TDQ3MC4xMjQgMjA2LjQwNUM0NjQuMjgyIDIwMC45MjYgNDUwLjg0NyAxOTAuMjQgNDQ3Ljg3OSAxODguNzEyQzQ0NS44OSAxODcuNjg4IDQ0NS41OTQgMTg3LjcwNSA0NDQuMzY2IDE4OC45MjdDNDQzLjIzNSAxOTAuMDUzIDQ0Mi45OTcgMTkxLjc0NCA0NDIuODQgMTk5Ljc0MUM0NDIuNTk2IDIxMi4yMDQgNDQwLjg5NyAyMjAuMjA0IDQzNi43OTcgMjI4LjIwM0M0MzQuNTggMjMyLjUyOSA0MzQuMjMgMjMxLjYwNiA0MzYuMjM3IDIyNi43MjNDNDM3LjczNSAyMjMuMDc3IDQzNy44ODcgMjIxLjQ3NCA0MzcuODc2IDIwOS40MDhDNDM3Ljg1MyAxODUuMTY3IDQzNC45NzUgMTc5LjMzOSA0MTguMDk3IDE2OS4zNTVDNDEzLjgyMSAxNjYuODI2IDQwNi43NzYgMTYzLjE3OCA0MDIuNDQyIDE2MS4yNDlDMzk4LjEwNyAxNTkuMzIgMzk0LjY2NCAxNTcuNjM5IDM5NC43ODkgMTU3LjUxNEMzOTUuMjY3IDE1Ny4wMzggNDExLjcyNyAxNjEuODQyIDQxOC4zNTIgMTY0LjM5QzQyOC4yMDYgMTY4LjE4MSA0MjkuODMzIDE2OC42NzIgNDMxLjAzIDE2OC4yMTVDNDMxLjgzMiAxNjcuOTA5IDQzMi4yMiAxNjUuNTcyIDQzMi42MSAxNTguNzA0WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMjM1Ljg4MyAyMDAuMTc1QzIyNC4wMjIgMTgzLjg0NiAyMTYuNjg0IDE1OC44MDkgMjE4LjI3MiAxNDAuMDkzTDIxOC43NjQgMTM0LjMwMUwyMjEuNDYzIDEzNC43OTRDMjI2LjUzNCAxMzUuNzE5IDIzNS4yNzUgMTM4Ljk3MyAyMzkuMzY5IDE0MS40NTlDMjUwLjYwMiAxNDguMjgxIDI1NS40NjUgMTU3LjI2MyAyNjAuNDEzIDE4MC4zMjhDMjYxLjg2MiAxODcuMDgzIDI2My43NjMgMTk0LjcyOCAyNjQuNjM4IDE5Ny4zMTdDMjY2LjA0NyAyMDEuNDgzIDI3MS4zNjkgMjExLjIxNCAyNzUuNjk2IDIxNy41MzRDMjc4LjgxMyAyMjIuMDg1IDI3Ni43NDMgMjI0LjI0MiAyNjkuODUzIDIyMy42MkMyNTkuMzMxIDIyMi42NyAyNDUuMDc4IDIxMi44MzQgMjM1Ljg4MyAyMDAuMTc1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNNDE4LjIyMyAzMjEuNzA3QzM2Mi43OTMgMjk5LjM4OSAzNDMuMjcxIDI4MC4wMTcgMzQzLjI3MSAyNDcuMzMxQzM0My4yNzEgMjQyLjUyMSAzNDMuNDM3IDIzOC41ODUgMzQzLjYzOCAyMzguNTg1QzM0My44NCAyMzguNTg1IDM0NS45ODUgMjQwLjE3MyAzNDguNDA0IDI0Mi4xMTNDMzU5LjY0NCAyNTEuMTI4IDM3Mi4yMzEgMjU0Ljk3OSA0MDcuMDc2IDI2MC4wNjJDNDI3LjU4IDI2My4wNTQgNDM5LjExOSAyNjUuNDcgNDQ5Ljc2MyAyNjlDNDgzLjU5NSAyODAuMjIgNTA0LjUyNyAzMDIuOTkgNTA5LjUxOCAzMzQuMDA0QzUxMC45NjkgMzQzLjAxNiA1MTAuMTE4IDM1OS45MTUgNTA3Ljc2NiAzNjguODIyQzUwNS45MSAzNzUuODU3IDUwMC4yNDUgMzg4LjUzNyA0OTguNzQyIDM4OS4wMjNDNDk4LjMyNSAzODkuMTU4IDQ5Ny45MTcgMzg3LjU2MiA0OTcuODEgMzg1LjM4OUM0OTcuMjQgMzczLjc0NCA0OTEuMzU1IDM2Mi40MDYgNDgxLjQ3MiAzNTMuOTEzQzQ3MC4yMzUgMzQ0LjI1NyA0NTUuMTM3IDMzNi41NjkgNDE4LjIyMyAzMjEuNzA3WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMzc5LjMxIDMzMC45NzhDMzc4LjYxNSAzMjYuODQ2IDM3Ny40MTEgMzIxLjU2OCAzNzYuNjMzIDMxOS4yNUwzNzUuMjE5IDMxNS4wMzZMMzc3Ljg0NiAzMTcuOTg1QzM4MS40ODEgMzIyLjA2NSAzODQuMzU0IDMyNy4yODcgMzg2Ljc4OSAzMzQuMjQxQzM4OC42NDcgMzM5LjU0OSAzODguODU2IDM0MS4xMjcgMzg4Ljg0MiAzNDkuNzUzQzM4OC44MjggMzU4LjIyMSAzODguNTk2IDM1OS45OTYgMzg2Ljg4IDM2NC43NzNDMzg0LjE3NCAzNzIuMzA3IDM4MC44MTYgMzc3LjY0OSAzNzUuMTgxIDM4My4zODNDMzY1LjA1NiAzOTMuNjg4IDM1Mi4wMzggMzk5LjM5MyAzMzMuMjUzIDQwMS43NkMzMjkuOTg3IDQwMi4xNzEgMzIwLjQ3IDQwMi44NjQgMzEyLjEwMyA0MDMuMjk5QzI5MS4wMTYgNDA0LjM5NSAyNzcuMTM4IDQwNi42NjEgMjY0LjY2OCA0MTEuMDRDMjYyLjg3NSA0MTEuNjcgMjYxLjI3NCA0MTIuMDUyIDI2MS4xMTIgNDExLjg5QzI2MC42MDcgNDExLjM4OCAyNjkuMDk4IDQwNi4zMjYgMjc2LjExMSA0MDIuOTQ4QzI4NS45OTkgMzk4LjE4NSAyOTUuODQyIDM5NS41ODYgMzE3Ljg5NyAzOTEuOTEzQzMyOC43OTIgMzkwLjA5OCAzNDAuMDQzIDM4Ny44OTcgMzQyLjkgMzg3LjAyMUMzNjkuODggMzc4Ljc0OSAzODMuNzQ4IDM1Ny40MDIgMzc5LjMxIDMzMC45NzhaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGQ9Ik00MDQuNzE5IDM3Ni4xMDVDMzk3LjM1NSAzNjAuMjczIDM5NS42NjQgMzQ0Ljk4OCAzOTkuNjk4IDMzMC43MzJDNDAwLjEzIDMyOS4yMDkgNDAwLjgyNCAzMjcuOTYyIDQwMS4yNDIgMzI3Ljk2MkM0MDEuNjU5IDMyNy45NjIgNDAzLjM5NyAzMjguOTAyIDQwNS4xMDMgMzMwLjA1QzQwOC40OTcgMzMyLjMzNSA0MTUuMzAzIDMzNi4xODIgNDMzLjQzNyAzNDYuMDY5QzQ1Ni4wNjUgMzU4LjQwNiA0NjguOTY2IDM2Ny45NTkgNDc3Ljc0IDM3OC44NzNDNDg1LjQyMyAzODguNDMyIDQ5MC4xNzggMzk5LjMxOCA0OTIuNDY3IDQxMi41OTNDNDkzLjc2MiA0MjAuMTEzIDQ5My4wMDMgNDM4LjIwNiA0OTEuMDc0IDQ0NS43NzhDNDg0Ljk5IDQ2OS42NTMgNDcwLjg1IDQ4OC40MDYgNDUwLjY4MiA0OTkuMzQ5QzQ0Ny43MjcgNTAwLjk1MiA0NDUuMDc1IDUwMi4yNjkgNDQ0Ljc4OCA1MDIuMjc1QzQ0NC41MDEgNTAyLjI4IDQ0NS41NzcgNDk5LjU0MyA0NDcuMTggNDk2LjE5MUM0NTMuOTY1IDQ4Mi4wMDkgNDU0LjczNyA0NjguMjE0IDQ0OS42MDggNDUyLjg1OUM0NDYuNDY3IDQ0My40NTcgNDQwLjA2NCA0MzEuOTg1IDQyNy4xMzUgNDEyLjU5NkM0MTIuMTAzIDM5MC4wNTQgNDA4LjQxNyAzODQuMDU0IDQwNC43MTkgMzc2LjEwNVoiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTE5Ni41MTkgNDYxLjUyNUMyMTcuMDg5IDQ0NC4xNTcgMjQyLjY4MiA0MzEuODE5IDI2NS45OTYgNDI4LjAzMkMyNzYuMDQzIDQyNi4zOTkgMjkyLjc4IDQyNy4wNDcgMzAyLjA4NCA0MjkuNDI4QzMxNi45OTggNDMzLjI0NSAzMzAuMzM4IDQ0MS43OTMgMzM3LjI3NiA0NTEuOTc4QzM0NC4wNTcgNDYxLjkzMiAzNDYuOTY2IDQ3MC42MDYgMzQ5Ljk5NSA0ODkuOTA2QzM1MS4xODkgNDk3LjUxOSAzNTIuNDg5IDUwNS4xNjQgMzUyLjg4MiA1MDYuODk1QzM1NS4xNTYgNTE2Ljg5NyAzNTkuNTgzIDUyNC44OTIgMzY1LjA2NyA1MjguOTA3QzM3My43NzkgNTM1LjI4MyAzODguNzggNTM1LjY4IDQwMy41MzYgNTI5LjkyNEM0MDYuMDQxIDUyOC45NDcgNDA4LjIxNSA1MjguMjcxIDQwOC4zNjggNTI4LjQyNEM0MDguOTAzIDUyOC45NTUgNDAxLjQ3MyA1MzMuOTMgMzk2LjIzIDUzNi41NDhDMzg5LjE3NyA1NDAuMDcxIDM4My41NjggNTQxLjQzNCAzNzYuMTE1IDU0MS40MzRDMzYyLjYgNTQxLjQzNCAzNTEuMzc5IDUzNC41NTggMzQyLjAxNiA1MjAuNTM5QzM0MC4xNzQgNTE3Ljc4IDMzNi4wMzIgNTA5LjUxNiAzMzIuODEzIDUwMi4xNzZDMzIyLjkyOCA0NzkuNjI4IDMxOC4wNDYgNDcyLjc1OSAzMDYuNTY4IDQ2NS4yNDJDMjk2LjU3OSA0NTguNzAxIDI4My42OTcgNDU3LjUzIDI3NC4wMDYgNDYyLjI4MkMyNjEuMjc2IDQ2OC41MjMgMjU3LjcyNCA0ODQuNzkxIDI2Ni44NDIgNDk1LjEwMUMyNzAuNDY1IDQ5OS4xOTggMjc3LjIyMyA1MDIuNzMyIDI4Mi43NDkgNTAzLjQxOUMyOTMuMDg2IDUwNC43MDUgMzAxLjk3IDQ5Ni44NDEgMzAxLjk3IDQ4Ni40MDRDMzAxLjk3IDQ3OS42MjcgMjk5LjM2NSA0NzUuNzYgMjkyLjgwOCA0NzIuODAxQzI4My44NTIgNDY4Ljc2IDI3NC4yMjYgNDczLjQ4MyAyNzQuMjcyIDQ4MS44OTdDMjc0LjI5MiA0ODUuNDg0IDI3NS44NTQgNDg3LjczNyAyNzkuNDUgNDg5LjM2NEMyODEuNzU3IDQ5MC40MDggMjgxLjgxMSA0OTAuNDkxIDI3OS45MjkgNDkwLjFDMjcxLjcxMiA0ODguMzk2IDI2OS43ODcgNDc4LjQ5IDI3Ni4zOTQgNDcxLjkxM0MyODQuMzI2IDQ2NC4wMTggMzAwLjcyOSA0NjcuNTAyIDMwNi4zNjIgNDc4LjI3OUMzMDguNzI4IDQ4Mi44MDUgMzA5LjAwMyA0OTEuODIgMzA2Ljk0IDQ5Ny4yNjRDMzAyLjMyMiA1MDkuNDQ4IDI4OC44NTkgNTE1Ljg1NSAyNzUuMjAxIDUxMi4zNjhDMjY1LjkwMyA1MDkuOTk0IDI2Mi4xMTcgNTA3LjQyNCAyNTAuOTA2IDQ5NS44NzZDMjMxLjQyNSA0NzUuODA5IDIyMy44NjIgNDcxLjkyIDE5NS43NzcgNDY3LjUzNkwxOTAuMzk1IDQ2Ni42OTZMMTk2LjUxOSA0NjEuNTI1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQ5LjYyMDIgMTIuMDAzMUMxMTQuNjc4IDkwLjk2MzggMjE0Ljk3NyAyMTMuOTAxIDIxOS45NTcgMjIwLjc4NEMyMjQuMDY4IDIyNi40NjcgMjIyLjUyMSAyMzEuNTc2IDIxNS40NzggMjM1LjU4QzIxMS41NjEgMjM3LjgwNyAyMDMuNTA4IDI0MC4wNjMgMTk5LjQ3NiAyNDAuMDYzQzE5NC45MTYgMjQwLjA2MyAxODkuNzc5IDIzNy44NjcgMTg2LjAzOCAyMzQuMzE4QzE4My4zOTMgMjMxLjgxIDE3Mi43MjEgMjE1Ljg3NCAxNDguMDg0IDE3Ny42NDZDMTI5LjIzMyAxNDguMzk2IDExMy40NTcgMTI0LjEzMSAxMTMuMDI3IDEyMy43MjVDMTEyLjAzMiAxMjIuNzg1IDExMi4wNDkgMTIyLjgxNyAxNDYuMTYyIDE4My44NTRDMTY3LjU4MiAyMjIuMTgxIDE3NC44MTMgMjM1LjczMSAxNzQuODEzIDIzNy41NDNDMTc0LjgxMyAyNDEuMjI5IDE3My44MDggMjQzLjE2NiAxNjkuMjYxIDI0OC4yMzhDMTYxLjY4MSAyNTYuNjk0IDE1OC4yOTMgMjY2LjE5NSAxNTUuODQ3IDI4NS44NTlDMTUzLjEwNCAzMDcuOTAyIDE0NS4zOTQgMzIzLjQ3MyAxMjQuMDI2IDM1MC4xMjJDMTExLjUxOCAzNjUuNzIyIDEwOS40NzEgMzY4LjU4MSAxMDYuMzE1IDM3NC44NjlDMTAyLjMzOSAzODIuNzg2IDEwMS4yNDYgMzg3LjIyMSAxMDAuODAzIDM5Ny4yMTlDMTAwLjMzNSA0MDcuNzkgMTAxLjI0NyA0MTQuNjE5IDEwNC40NzcgNDI0LjcyNkMxMDcuMzA0IDQzMy41NzUgMTEwLjI1NSA0MzkuNDE3IDExNy44IDQ1MS4xMDRDMTI0LjMxMSA0NjEuMTg4IDEyOC4wNjEgNDY4LjY4MyAxMjguMDYxIDQ3MS42MTRDMTI4LjA2MSA0NzMuOTQ3IDEyOC41MDYgNDczLjk1IDEzOC41OTYgNDcxLjY3MkMxNjIuNzQxIDQ2Ni4yMTkgMTgyLjM0OCA0NTYuNjI5IDE5My4zNzUgNDQ0Ljg3N0MyMDAuMTk5IDQzNy42MDMgMjAxLjgwMSA0MzMuNTg2IDIwMS44NTMgNDIzLjYxOEMyMDEuODg3IDQxNy4wOTggMjAxLjY1OCA0MTUuNzMzIDE5OS44OTYgNDExLjk4MkMxOTcuMDI3IDQwNS44NzcgMTkxLjgwNCA0MDAuODAxIDE4MC4yOTIgMzkyLjkzMkMxNjUuMjA5IDM4Mi42MjEgMTU4Ljc2NyAzNzQuMzIgMTU2Ljk4NyAzNjIuOTA0QzE1NS41MjcgMzUzLjUzNyAxNTcuMjIxIDM0Ni45MjggMTY1LjU2NSAzMjkuNDRDMTc0LjIwMiAzMTEuMzM4IDE3Ni4zNDIgMzAzLjYyNCAxNzcuNzkgMjg1LjM3OEMxNzguNzI1IDI3My41ODkgMTgwLjAyIDI2OC45NCAxODMuNDA3IDI2NS4yMDlDMTg2LjkzOSAyNjEuMzE3IDE5MC4xMTkgMjYwIDE5OC44NjEgMjU4LjgwNUMyMTMuMTEzIDI1Ni44NTggMjIyLjE4OCAyNTMuMTcxIDIyOS42NDggMjQ2LjI5N0MyMzYuMTE5IDI0MC4zMzQgMjM4LjgyNyAyMzQuNTg4IDIzOS4yNDMgMjI1LjkzOEwyMzkuNTU4IDIxOS4zODJMMjM1Ljk0MiAyMTUuMTY2QzIyMi44NDYgMTk5Ljg5NiA0MC44NSAwIDQwLjA0NCAwQzM5Ljg3MTkgMCA0NC4xODEzIDUuNDAxNzggNDkuNjIwMiAxMi4wMDMxWk0xMzUuNDEyIDQwOS4xOEMxMzguMzczIDQwMy45MzcgMTM2LjggMzk3LjE5NSAxMzEuODQ3IDM5My45MDJDMTI3LjE2NyAzOTAuNzkgMTE5Ljg5NyAzOTIuMjU2IDExOS44OTcgMzk2LjMxMUMxMTkuODk3IDM5Ny41NDggMTIwLjU4MiAzOTguNDQ5IDEyMi4xMjQgMzk5LjI0M0MxMjQuNzIgNDAwLjU3OSAxMjQuOTA5IDQwMi4wODEgMTIyLjg2NiA0MDUuMTUyQzEyMC43OTcgNDA4LjI2MiAxMjAuOTY0IDQxMC45OTYgMTIzLjMzNyA0MTIuODU0QzEyNy4xNjIgNDE1Ljg0OSAxMzIuNTc2IDQxNC4yMDIgMTM1LjQxMiA0MDkuMThaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjQ4LjU1MiAyNjIuMjQ0QzI0MS44NjIgMjY0LjI5OSAyMzUuMzU4IDI3MS4zOSAyMzMuMzQ0IDI3OC44MjZDMjMyLjExNiAyODMuMzYyIDIzMi44MTMgMjkxLjMxOSAyMzQuNjUzIDI5My43NzZDMjM3LjYyNSAyOTcuNzQ1IDI0MC40OTkgMjk4Ljc5MSAyNDguMjgyIDI5OC43MzZDMjYzLjUxOCAyOTguNjMgMjc2Ljc2NCAyOTIuMDk1IDI3OC4zMDQgMjgzLjkyNUMyNzkuNTY3IDI3Ny4yMjkgMjczLjc0OSAyNjcuOTQ4IDI2NS43MzYgMjYzLjg3NEMyNjEuNjAxIDI2MS43NzIgMjUyLjgwNyAyNjAuOTM4IDI0OC41NTIgMjYyLjI0NFpNMjY2LjM2NCAyNzYuMTcyQzI2OC43MTQgMjcyLjgzNCAyNjcuNjg2IDI2OS4yMjUgMjYzLjY5IDI2Ni43ODVDMjU2LjA4IDI2Mi4xMzggMjQ0LjU3MSAyNjUuOTgzIDI0NC41NzEgMjczLjE3M0MyNDQuNTcxIDI3Ni43NTIgMjUwLjU3MiAyODAuNjU2IDI1Ni4wNzQgMjgwLjY1NkMyNTkuNzM1IDI4MC42NTYgMjY0Ljc0NiAyNzguNDczIDI2Ni4zNjQgMjc2LjE3MloiIGZpbGw9IiNGRjAwN0EiLz4KPC9zdmc+Cg==',
  router: {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    api: UniswapV2Router02
  },
  factory: {
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    api: UniswapV2Factory
  },
  pair: {
    api: UniswapV2Pair
  },
  slippage: true,
};

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath$1 = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.ethereum.NATIVE && path[index+1] != CONSTANTS.ethereum.WRAPPED &&
      path[index-1] != CONSTANTS.ethereum.WRAPPED
    ) {
      return CONSTANTS.ethereum.WRAPPED
    } else {
      return token
    }
  });

  if(fixedPath[0] == CONSTANTS.ethereum.NATIVE && fixedPath[1] == CONSTANTS.ethereum.WRAPPED) {
    fixedPath.splice(0, 1);
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.ethereum.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.ethereum.WRAPPED) {
    fixedPath.splice(fixedPath.length-1, 1);
  }

  return fixedPath
};

let minReserveRequirements$1 = ({ reserves, min, token, token0, token1, decimals }) => {
  if(token0.toLowerCase() == token.toLowerCase()) {
    return reserves[0].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else if (token1.toLowerCase() == token.toLowerCase()) {
    return reserves[1].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else {
    return false
  }
};

let pathExists$1 = async (path) => {
  if(fixPath$1(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'ethereum',
    address: basics$5.factory.address,
    method: 'getPair',
    api: basics$5.factory.api,
    cache: 3600000,
    params: fixPath$1(path) 
  });
  if(pair == CONSTANTS.ethereum.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'ethereum', address: pair, method: 'getReserves', api: basics$5.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token0', api: basics$5.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token1', api: basics$5.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.ethereum.WRAPPED)) {
    return minReserveRequirements$1({ min: 1, token: CONSTANTS.ethereum.WRAPPED, decimals: CONSTANTS.ethereum.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.ethereum.USD)) {
    let token = new Token({ blockchain: 'ethereum', address: CONSTANTS.ethereum.USD });
    let decimals = await token.decimals();
    return minReserveRequirements$1({ min: 1000, token: CONSTANTS.ethereum.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$5 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path;
  if (await pathExists$1([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$1([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$1([tokenOut, CONSTANTS.ethereum.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.USD &&
    await pathExists$1([tokenIn, CONSTANTS.ethereum.USD]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$1([CONSTANTS.ethereum.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.USD, CONSTANTS.ethereum.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$1([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.USD &&
    await pathExists$1([CONSTANTS.ethereum.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, CONSTANTS.ethereum.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$1([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.ethereum.NATIVE) {
    path.splice(1, 0, CONSTANTS.ethereum.WRAPPED);
  } else if(_optionalChain$1([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.ethereum.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.ethereum.WRAPPED);
  }

  return { path, fixedPath: fixPath$1(path) }
};

let getAmountOut$1 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'ethereum',
      address: basics$5.router.address,
      method: 'getAmountsOut',
      api: basics$5.router.api,
      params: {
        amountIn: amountIn,
        path: fixPath$1(path),
      },
    })
    .then((amountsOut)=>{
      resolve(amountsOut[amountsOut.length - 1]);
    })
    .catch(()=>resolve());
  })
};

let getAmountIn$1 = ({ path, amountOut, block }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'ethereum',
      address: basics$5.router.address,
      method: 'getAmountsIn',
      api: basics$5.router.api,
      params: {
        amountOut: amountOut,
        path: fixPath$1(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$5 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn$1({ block, path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountOut$1({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn$1({ block, path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut$1({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$5 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'ethereum',
    from: fromAddress,
    to: basics$5.router.address,
    api: basics$5.router.api,
  };

  if (path[0] === CONSTANTS.ethereum.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens';
      transaction.value = amountIn.toString();
      transaction.params = { amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens';
      transaction.value = amountInMax.toString();
      transaction.params = { amountOut: amountOut.toString() };
    }
  } else if (path[path.length - 1] === CONSTANTS.ethereum.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixPath$1(path),
    to: fromAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

var uniswap_v2 = new Exchange(
  Object.assign(basics$5, {
    findPath: findPath$5,
    getAmounts: getAmounts$5,
    getTransaction: getTransaction$5,
  })
);

let PancakeRouter = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let PancakeFactory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let PancakePair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$4 = {
  blockchain: 'velas',
  name: 'wagyuswap',
  alternativeNames: [],
  label: 'WagyuSwap',
  logo: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NC45MSAxMzAuMjYiPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxwYXRoIGQ9Ik0xMTcuMjgsOTYuNDVjMCwyNC42Mi0yMS4yNCw0NC42LTQ3LjQ1LDQ0LjZzLTQ3LjQ2LTIwLTQ3LjQ2LTQ0LjZjMC0zLjE5LDAtMTkuODUsNy40My0zMy40NSw3LjA4LTEzLDE5LjUyLTIxLjY5LDE5LjUyLTIxLjY5cy4xNywzLjgxLjY2LDcuODJhMjQuMSwyNC4xLDAsMCwwLDEsNGMuMDYtMy40NCwxLjM2LTExLjcsNi41Ny0yMS42Myw2LTExLjQ2LDE3LTIwLjcyLDE3LTIwLjcyYTEwOC41MSwxMDguNTEsMCwwLDAsLjMsMTYuOTFjLjg1LDcuNzIsNC4xNSwxNC45MSw1LjA3LDE1LjU5YTI1LjgyLDI1LjgyLDAsMCwxLC44Ni00Ljg1LDE3LjM0LDE3LjM0LDAsMCwxLDIuNTctNC42NWMuMi0uOC40Miw2LjE1LDIuODcsMTAuNDQsNS43LDEwLDIwLjE0LDIzLjEsMjMuNTEsMjhBNDIuNDQsNDIuNDQsMCwwLDEsMTE3LjI4LDk2LjQ1WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyLjM3IC0xMC43OSkiIGZpbGw9IiNjYTQwNGYiLz48cGF0aCBkPSJNNzMsMTM1LjU5Yy0yNi4yMSwwLTQ3LjQ1LTIwLTQ3LjQ1LTQ0LjYsMC0zLjA2LDAtMTguMzksNi40Ny0zMS42My0uNzYsMS4xNi0xLjQ4LDIuMzUtMi4xNSwzLjYtNy40NywxMy42NC03LjQ3LDMwLjMtNy40NywzMy40OSwwLDI0LjYyLDIxLjI0LDQ0LjYsNDcuNDYsNDQuNiwxOS4yOCwwLDM1Ljg3LTEwLjgsNDMuMy0yNi4zMUE0OC4yNSw0OC4yNSwwLDAsMSw3MywxMzUuNTlaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjIuMzcgLTEwLjc5KSIgZmlsbD0iIzkyMzg0YiIvPjxwYXRoIGQ9Ik01MCw0OS4yNmEyMy4wNiwyMy4wNiwwLDAsMCwxLDRDNTEsNDkuOTQsNTIuNSw0MS40OCw1Ny4xOSwzMi4xYy0uODYsMS4zNy0yLDMuNTMtMi43Niw1QTY1LDY1LDAsMCwwLDQ5Ljg3LDQ4QzQ5LjkyLDQ4LjQzLDUwLDQ4Ljg0LDUwLDQ5LjI2WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyLjM3IC0xMC43OSkiIGZpbGw9IiM5MjM4NGIiLz48cGF0aCBkPSJNNzguNDQsODIuNmMtOS4yOCwxMS4zNC0yMi4zLDE4LjA2LTE5LjEyLDIxLjE3LDMuMzQsMy4yNywyMy4wOSwxMy45MiwzOC4zLTEuNzEsOC04LjI0LDcuMzMtMjEuMTgsMi44Ni0yOS4wNiwwLDAsMi43LTcuOCwyLjU3LTguMzYtLjQ3LTEuOS0xMC0xMi0xMS4zMy0xMi42MkE4Ny4yMyw4Ny4yMywwLDAsMSw4OSw2NC43MUM4Ny43LDY4LjU1LDgzLjkyLDc1Ljg5LDc4LjQ0LDgyLjZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjIuMzcgLTEwLjc5KSIgZmlsbD0iI2VjZDBjZiIvPjxwYXRoIGQ9Ik04My43OSw4Ny4xM2MtNiw3LjMtMTMuNzksMTIuMjUtMTEuNDcsMTMuOTRzMTAuNzYsNiwyMC41OS00YzcuMzItNy41MSw0LjIzLTE3LjQzLDEuOS0xOS4xMlM4OC44LDgxLDgzLjc5LDg3LjEzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyLjM3IC0xMC43OSkiIGZpbGw9IiNkYWIyYjUiLz48cGF0aCBkPSJNODYuMTMsOTEuMzVjLTIuNDMsMy4zNi0zLjQzLDYuNzUtMi4zMiw3LjU3czQtMS4yMyw2LjQ1LTQuNTgsMy40NC02Ljc0LDIuMzMtNy41N1M4OC41Niw4OCw4Ni4xMyw5MS4zNVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMi4zNyAtMTAuNzkpIiBmaWxsPSIjYzk5NDljIi8+PHBhdGggZD0iTTg2LjIyLDQ0LjI0YTE1LjQzLDE1LjQzLDAsMCwxLTEtMi4wNkE2My4xOSw2My4xOSwwLDAsMSw2OC44LDU4LjY1QzYwLjYxLDY0LjM2LDU2LDY4LjYsNTMuNzUsODEsNTIuNTQsODcuNDYsMzUsNzcuNzQsMjkuMzIsODZjLTIuNDEsMy41Mi0yLjI1LDcuMDktMy41OCw5LjMxLjQzLDEwLjE4LDcuNDQsMjAsNy40NCwyMC0xLjE5LTEuNzItLjM3LTEyLDMuNjQtMTguNzQsMy44My02LjQ1LDE3LjEyLTYuOSwyMy4yOS0xMy43NkM2Ni41Nyw3NS43LDY2LjM2LDY5LjM4LDcxLDYzLjY5YzYuNS04LDE1LTE1LjEzLDE5LjcyLTEyLjg2QTU2LjQ0LDU2LjQ0LDAsMCwxLDg2LjIyLDQ0LjI0WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyLjM3IC0xMC43OSkiIGZpbGw9IiNmNGVhZTYiLz48cGF0aCBkPSJNMTE3LjI4LDk2LjQ1Yy0uNDMsMy0zLjY4LDkuMzEtNy44OCwxMC4yOS03LjY3LDEuNzctMTAuNzktMy0xNS42NywyYTI5LjgyLDI5LjgyLDAsMCwxLTI5LjY2LDcuMTFjLTkuNDMtMi45NC0yMC4xOCw2LjQzLTI3LDQuMzksNS4yOSw2Ljg2LDE3LjUzLDEyLDE4LjkyLDEyLjQyLTEtMS4xNi00LjA4LTUuODQtMS4xMi03LjM3LDUuNjQtMi45MSwxNCwyLjc1LDIwLjA4LDEuMDYsNy4yMS0yLDEwLjI5LTgsMTQuMS0xMC4zNSwxLjktMS4xOSwxMi05LjMxLDI0LjExLTEuNDZBNDIuMDYsNDIuMDYsMCwwLDAsMTE3LjI4LDk2LjQ1WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyLjM3IC0xMC43OSkiIGZpbGw9IiNmNGVhZTYiLz48L2c+PC9zdmc+',
  router: {
    address: '0x3D1c58B6d4501E34DF37Cf0f664A58059a188F00',
    api: PancakeRouter
  },
  factory: {
    address: '0x69f3212344a38b35844cce4864c2af9c717f35e3',
    api: PancakeFactory
  },
  pair: {
    api: PancakePair
  },
  slippage: true,
};

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath = (path) => {
  if(!path) { return }
  let fixedPath = path.map((token, index) => {
    if (
      token === CONSTANTS.velas.NATIVE && path[index+1] != CONSTANTS.velas.WRAPPED &&
      path[index-1] != CONSTANTS.velas.WRAPPED
    ) {
      return CONSTANTS.velas.WRAPPED
    } else {
      return token
    }
  });

  if(fixedPath[0] == CONSTANTS.velas.NATIVE && fixedPath[1] == CONSTANTS.velas.WRAPPED) {
    fixedPath.splice(0, 1);
  } else if(fixedPath[fixedPath.length-1] == CONSTANTS.velas.NATIVE && fixedPath[fixedPath.length-2] == CONSTANTS.velas.WRAPPED) {
    fixedPath.splice(fixedPath.length-1, 1);
  }

  return fixedPath
};

let minReserveRequirements = ({ reserves, min, token, token0, token1, decimals }) => {
  if(token0.toLowerCase() == token.toLowerCase()) {
    return reserves[0].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else if (token1.toLowerCase() == token.toLowerCase()) {
    return reserves[1].gte(ethers.utils.parseUnits(min.toString(), decimals))
  } else {
    return false
  }
};

let pathExists = async (path) => {
  if(fixPath(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'velas',
    address: basics$4.factory.address,
    method: 'getPair',
    api: basics$4.factory.api,
    cache: 3600000,
    params: fixPath(path) 
  });
  if(pair == CONSTANTS.velas.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'velas', address: pair, method: 'getReserves', api: basics$4.pair.api, cache: 3600000 }),
    request({ blockchain: 'velas', address: pair, method: 'token0', api: basics$4.pair.api, cache: 3600000 }),
    request({ blockchain: 'velas', address: pair, method: 'token1', api: basics$4.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.velas.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.velas.WRAPPED, decimals: CONSTANTS.velas.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.velas.USD)) {
    let token = new Token({ blockchain: 'velas', address: CONSTANTS.velas.USD });
    let decimals = await token.decimals();
    return minReserveRequirements({ min: 1000, token: CONSTANTS.velas.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$4 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.velas.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.velas.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path;
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.velas.WRAPPED]) &&
    tokenOut != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.velas.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.velas.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.velas.USD &&
    await pathExists([tokenIn, CONSTANTS.velas.USD]) &&
    tokenOut != CONSTANTS.velas.WRAPPED &&
    await pathExists([CONSTANTS.velas.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.velas.USD, CONSTANTS.velas.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.velas.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.velas.WRAPPED]) &&
    tokenOut != CONSTANTS.velas.USD &&
    await pathExists([CONSTANTS.velas.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.velas.WRAPPED, CONSTANTS.velas.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.velas.NATIVE) {
    path.splice(1, 0, CONSTANTS.velas.WRAPPED);
  } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.velas.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.velas.WRAPPED);
  }

  return { path, fixedPath: fixPath(path) }
};

let getAmountOut = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'velas',
      address: basics$4.router.address,
      method: 'getAmountsOut',
      api: basics$4.router.api,
      params: {
        amountIn: amountIn,
        path: fixPath(path),
      },
    })
    .then((amountsOut)=>{
      resolve(amountsOut[amountsOut.length - 1]);
    })
    .catch(()=>resolve());
  })
};

let getAmountIn = ({ path, amountOut, block }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'velas',
      address: basics$4.router.address,
      method: 'getAmountsIn',
      api: basics$4.router.api,
      params: {
        amountOut: amountOut,
        path: fixPath(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$4 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn({ block, path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountOut({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn({ block, path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$4 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'velas',
    from: fromAddress,
    to: basics$4.router.address,
    api: basics$4.router.api,
  };

  if (path[0] === CONSTANTS.velas.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens';
      transaction.value = amountIn.toString();
      transaction.params = { amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens';
      transaction.value = amountInMax.toString();
      transaction.params = { amountOut: amountOut.toString() };
    }
  } else if (path[path.length - 1] === CONSTANTS.velas.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens';
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens';
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixPath(path),
    to: fromAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

var wagyuswap = new Exchange(
  Object.assign(basics$4, {
    findPath: findPath$4,
    getAmounts: getAmounts$4,
    getTransaction: getTransaction$4,
  })
);

let WBNB = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

var basics$3 = {
  blockchain: 'bsc',
  name: 'wbnb',
  alternativeNames: [],
  label: 'Wrapped BNB',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOTIgMTkyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxOTIgMTkyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0YwQjkwQjt9Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NCw0MS4xbDQyLTI0LjJsNDIsMjQuMmwtMTUuNCw4LjlMOTYsMzQuOUw2OS40LDUwTDU0LDQxLjF6IE0xMzgsNzEuN2wtMTUuNC04LjlMOTYsNzhMNjkuNCw2Mi43bC0xNS40LDl2MTgKCUw4MC42LDEwNXYzMC41bDE1LjQsOWwxNS40LTlWMTA1TDEzOCw4OS43VjcxLjd6IE0xMzgsMTIwLjN2LTE4bC0xNS40LDguOXYxOEMxMjIuNiwxMjkuMSwxMzgsMTIwLjMsMTM4LDEyMC4zeiBNMTQ4LjksMTI2LjQKCWwtMjYuNiwxNS4zdjE4bDQyLTI0LjJWODdsLTE1LjQsOUMxNDguOSw5NiwxNDguOSwxMjYuNCwxNDguOSwxMjYuNHogTTEzMy41LDU2LjRsMTUuNCw5djE4bDE1LjQtOXYtMThsLTE1LjQtOUwxMzMuNSw1Ni40CglMMTMzLjUsNTYuNHogTTgwLjYsMTQ4LjN2MThsMTUuNCw5bDE1LjQtOXYtMThMOTYsMTU3LjFMODAuNiwxNDguM3ogTTU0LDEyMC4zbDE1LjQsOXYtMTguMUw1NCwxMDIuM0w1NCwxMjAuM0w1NCwxMjAuM3oKCSBNODAuNiw1Ni40bDE1LjQsOWwxNS40LTlMOTYsNDcuNUM5Niw0Ny40LDgwLjYsNTYuNCw4MC42LDU2LjRMODAuNiw1Ni40eiBNNDMuMSw2NS40bDE1LjQtOWwtMTUuNC05bC0xNS40LDl2MThsMTUuNCw5TDQzLjEsNjUuNAoJTDQzLjEsNjUuNHogTTQzLjEsOTUuOUwyNy43LDg3djQ4LjVsNDIsMjQuMnYtMThsLTI2LjYtMTUuM1Y5NS45TDQzLjEsOTUuOXoiLz4KPC9zdmc+Cg==',
  wrapper: {
    address: CONSTANTS.bsc.WRAPPED,
    api: WBNB
  }
};

let findPath$3 = async ({ tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(CONSTANTS.bsc.NATIVE) ||
    ![tokenIn, tokenOut].includes(CONSTANTS.bsc.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
};

let getAmounts$3 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {

  if (amountOut) {
    amountIn = amountInMax = amountOutMin = amountOut;
  } else if (amountIn) {
    amountOut = amountInMax = amountOutMin = amountIn;
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut = amountOutMin;
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn = amountInMax;
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$3 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'bsc',
    from: fromAddress,
    to: basics$3.wrapper.address,
    api: basics$3.wrapper.api,
  };

  if (path[0] === CONSTANTS.bsc.NATIVE && path[1] === CONSTANTS.bsc.WRAPPED) {
    transaction.method = 'deposit';
    transaction.value = amountIn.toString();
    return transaction
  } else if (path[0] === CONSTANTS.bsc.WRAPPED && path[1] === CONSTANTS.bsc.NATIVE) {
    transaction.method = 'withdraw';
    transaction.value = 0;
    transaction.params = { wad: amountIn };
    return transaction
  }
};

var wbnb = new Exchange(
  Object.assign(basics$3, {
    findPath: findPath$3,
    getAmounts: getAmounts$3,
    getTransaction: getTransaction$3,
  })
);

let WETH = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

var basics$2 = {
  blockchain: 'ethereum',
  name: 'weth',
  alternativeNames: [],
  label: 'Wrapped Ethereum',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
  wrapper: {
    address: CONSTANTS.ethereum.WRAPPED,
    api: WETH
  }
};

let findPath$2 = async ({ tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(CONSTANTS.ethereum.NATIVE) ||
    ![tokenIn, tokenOut].includes(CONSTANTS.ethereum.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
};

let getAmounts$2 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {

  if (amountOut) {
    amountIn = amountInMax = amountOutMin = amountOut;
  } else if (amountIn) {
    amountOut = amountInMax = amountOutMin = amountIn;
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut = amountOutMin;
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn = amountInMax;
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$2 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'ethereum',
    from: fromAddress,
    to: basics$2.wrapper.address,
    api: basics$2.wrapper.api,
  };

  if (path[0] === CONSTANTS.ethereum.NATIVE && path[1] === CONSTANTS.ethereum.WRAPPED) {
    transaction.method = 'deposit';
    transaction.value = amountIn.toString();
    return transaction
  } else if (path[0] === CONSTANTS.ethereum.WRAPPED && path[1] === CONSTANTS.ethereum.NATIVE) {
    transaction.method = 'withdraw';
    transaction.value = 0;
    transaction.params = { wad: amountIn };
    return transaction
  }
};

var weth = new Exchange(
  Object.assign(basics$2, {
    findPath: findPath$2,
    getAmounts: getAmounts$2,
    getTransaction: getTransaction$2,
  })
);

let WMATIC = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

var basics$1 = {
  blockchain: 'polygon',
  name: 'wmatic',
  alternativeNames: [],
  label: 'Wrapped MATIC',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0NS40IDQ1LjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM4MjQ3RTU7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzEuOSwxNi42Yy0wLjctMC40LTEuNi0wLjQtMi4yLDBsLTUuMywzLjFsLTMuNSwybC01LjEsMy4xYy0wLjcsMC40LTEuNiwwLjQtMi4yLDBsLTQtMi40CgljLTAuNi0wLjQtMS4xLTEuMS0xLjEtMnYtNC42YzAtMC45LDAuNS0xLjYsMS4xLTJsNC0yLjNjMC43LTAuNCwxLjUtMC40LDIuMiwwbDQsMi40YzAuNywwLjQsMS4xLDEuMSwxLjEsMnYzLjFsMy41LTIuMXYtMy4yCgljMC0wLjktMC40LTEuNi0xLjEtMmwtNy41LTQuNGMtMC43LTAuNC0xLjUtMC40LTIuMiwwTDYsMTEuN2MtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjh2OC43YzAsMC45LDAuNCwxLjYsMS4xLDJsNy42LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw1LjEtMi45bDMuNS0yLjFsNS4xLTIuOWMwLjctMC40LDEuNi0wLjQsMi4yLDBsNCwyLjNjMC43LDAuNCwxLjEsMS4xLDEuMSwydjQuNmMwLDAuOS0wLjQsMS42LTEuMSwyCglsLTMuOSwyLjNjLTAuNywwLjQtMS41LDAuNC0yLjIsMGwtNC0yLjNjLTAuNy0wLjQtMS4xLTEuMS0xLjEtMnYtMi45TDIxLDI4Ljd2My4xYzAsMC45LDAuNCwxLjYsMS4xLDJsNy41LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw3LjUtNC40YzAuNy0wLjQsMS4xLTEuMSwxLjEtMlYyM2MwLTAuOS0wLjQtMS42LTEuMS0yQzM5LjIsMjEsMzEuOSwxNi42LDMxLjksMTYuNnoiLz4KPC9zdmc+Cg==',
  wrapper: {
    address: CONSTANTS.polygon.WRAPPED,
    api: WMATIC
  }
};

let findPath$1 = async ({ tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(CONSTANTS.polygon.NATIVE) ||
    ![tokenIn, tokenOut].includes(CONSTANTS.polygon.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
};

let getAmounts$1 = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {

  if (amountOut) {
    amountIn = amountInMax = amountOutMin = amountOut;
  } else if (amountIn) {
    amountOut = amountInMax = amountOutMin = amountIn;
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut = amountOutMin;
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn = amountInMax;
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction$1 = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'polygon',
    from: fromAddress,
    to: basics$1.wrapper.address,
    api: basics$1.wrapper.api,
  };

  if (path[0] === CONSTANTS.polygon.NATIVE && path[1] === CONSTANTS.polygon.WRAPPED) {
    transaction.method = 'deposit';
    transaction.value = amountIn.toString();
    return transaction
  } else if (path[0] === CONSTANTS.polygon.WRAPPED && path[1] === CONSTANTS.polygon.NATIVE) {
    transaction.method = 'withdraw';
    transaction.value = 0;
    transaction.params = { wad: amountIn };
    return transaction
  }
};

var wmatic = new Exchange(
  Object.assign(basics$1, {
    findPath: findPath$1,
    getAmounts: getAmounts$1,
    getTransaction: getTransaction$1,
  })
);

let WVLX = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

var basics = {
  blockchain: 'velas',
  name: 'wvlx',
  alternativeNames: [],
  label: 'Wrapped Velas',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDUuNCA0NS40IgoJIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiMwMDM3QzE7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjguOCwyMi44bC02LjEsMTAuNmwtNi4xLTEwLjdMMjguOCwyMi44TDI4LjgsMjIuOHogTTM0LjksMTkuMkgxMC41bDEyLjIsMjEuNEwzNC45LDE5LjJ6IE02LjUsMTIuMWwyLDMuNgoJaDI4LjNsMi4xLTMuNkg2LjV6Ii8+Cjwvc3ZnPgo=',
  wrapper: {
    address: CONSTANTS.velas.WRAPPED,
    api: WVLX
  }
};

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(CONSTANTS.velas.NATIVE) ||
    ![tokenIn, tokenOut].includes(CONSTANTS.velas.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
};

let getAmounts = async ({
  path,
  block,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {

  if (amountOut) {
    amountIn = amountInMax = amountOutMin = amountOut;
  } else if (amountIn) {
    amountOut = amountInMax = amountOutMin = amountIn;
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut = amountOutMin;
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn = amountInMax;
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
};

let getTransaction = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'velas',
    from: fromAddress,
    to: basics.wrapper.address,
    api: basics.wrapper.api,
  };

  if (path[0] === CONSTANTS.velas.NATIVE && path[1] === CONSTANTS.velas.WRAPPED) {
    transaction.method = 'deposit';
    transaction.value = amountIn.toString();
    return transaction
  } else if (path[0] === CONSTANTS.velas.WRAPPED && path[1] === CONSTANTS.velas.NATIVE) {
    transaction.method = 'withdraw';
    transaction.value = 0;
    transaction.params = { wad: amountIn };
    return transaction
  }
};

var wvlx = new Exchange(
  Object.assign(basics, {
    findPath,
    getAmounts,
    getTransaction,
  })
);

let all = {
  ethereum: [uniswap_v2, weth],
  bsc: [pancakeswap, wbnb],
  polygon: [quickswap, wmatic],
  solana: [],
  velas: [wagyuswap, wvlx],
};

var find_evm = (blockchain, name) => {
  return all[blockchain].find((exchange) => {
    return exchange.name == name || exchange.alternativeNames.includes(name)
  })
};

let route = ({
  blockchain,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
  amountOutMax,
  amountInMin,
}) => {
  return Promise.all(
    all[blockchain].map((exchange) => {
      return exchange.route({
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
        amountOutMax,
        amountInMin,
      })
    }),
  )
  .then((routes)=>routes.filter(Boolean))
};

export { all, find_evm as find, route };
