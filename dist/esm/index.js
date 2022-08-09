import { Token } from '@depay/web3-tokens';
import { CONSTANTS } from '@depay/web3-constants';
import { ethers } from 'ethers';
import { request } from '@depay/web3-client';

let UniswapV2Router02$1 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let UniswapV2Factory$1 = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let UniswapV2Pair$1 = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$2 = {
  blockchain: 'ethereum',
  name: 'uniswap_v2',
  alternativeNames: [],
  label: 'Uniswap v2',
  logo: 'data:image/png;base64,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',
  contracts: {
    router: {
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      api: UniswapV2Router02$1
    },
    factory: {
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      api: UniswapV2Factory$1
    },
    pair: {
      api: UniswapV2Pair$1
    }
  }
};

let getAmount = async ({ amount, blockchain, address }) => {
  return await Token.BigNumber({ amount, blockchain, address })
};

let fixRouteParams = async ({
  blockchain,
  exchange,
  fromAddress,
  toAddress,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
}) => {
  let params = {
    exchange,
    fromAddress,
    toAddress,
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
  fromAddress,
  toAddress,
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

class Exchange {
  constructor({ name, blockchain, alternativeNames, label, logo, contracts, route, getAmountIn }) {
    this.name = name;
    this.blockchain = blockchain;
    this.alternativeNames = alternativeNames;
    this.label = label;
    this.logo = logo;
    this.contracts = contracts;
    this._route = route;
    this.getAmountIn = getAmountIn;
  }

  async route({
    fromAddress,
    toAddress,
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
      fromAddress,
      toAddress,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
      amountOutMax,
      amountInMin,
    });

    return await this._route(
      await fixRouteParams({
        blockchain: this.blockchain,
        exchange: this,
        fromAddress,
        toAddress,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      }),
    )
  }
}

function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
  constructor({
    tokenIn,
    tokenOut,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    fromAddress,
    toAddress,
    transaction,
    exchange,
  }) {
    this.tokenIn = tokenIn;
    this.tokenOut = tokenOut;
    this.path = path;
    this.amountIn = _optionalChain$3([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
    this.amountOutMin = _optionalChain$3([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
    this.amountOut = _optionalChain$3([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
    this.amountInMax = _optionalChain$3([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.transaction = transaction;
    this.exchange = exchange;
  }
}

function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixUniswapPath$1 = (path) => {
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
  if(fixUniswapPath$1(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'ethereum',
    address: basics$2.contracts.factory.address,
    method: 'getPair',
    api: basics$2.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath$1(path) 
  });
  if(pair == CONSTANTS.ethereum.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'ethereum', address: pair, method: 'getReserves', api: basics$2.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token0', api: basics$2.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'ethereum', address: pair, method: 'token1', api: basics$2.contracts.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.ethereum.WRAPPED)) {
    return minReserveRequirements$2({ min: 1, token: CONSTANTS.ethereum.WRAPPED, decimals: CONSTANTS.ethereum.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.ethereum.USD)) {
    let token = new Token({ blockchain: 'ethereum', address: CONSTANTS.ethereum.USD });
    let decimals = await token.decimals();
    return minReserveRequirements$2({ min: 1000, token: CONSTANTS.ethereum.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$2 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.ethereum.WRAPPED)
  ) { return }

  let path;
  if (await pathExists$2([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$2([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$2([tokenOut, CONSTANTS.ethereum.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.USD &&
    await pathExists$2([tokenIn, CONSTANTS.ethereum.USD]) &&
    tokenOut != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$2([CONSTANTS.ethereum.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.USD, CONSTANTS.ethereum.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.ethereum.WRAPPED &&
    await pathExists$2([tokenIn, CONSTANTS.ethereum.WRAPPED]) &&
    tokenOut != CONSTANTS.ethereum.USD &&
    await pathExists$2([CONSTANTS.ethereum.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.ethereum.WRAPPED, CONSTANTS.ethereum.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$2([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.ethereum.NATIVE) {
    path.splice(1, 0, CONSTANTS.ethereum.WRAPPED);
  } else if(_optionalChain$2([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.ethereum.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.ethereum.WRAPPED);
  }

  return path
};

let getAmountsOut$2 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'ethereum',
      address: basics$2.contracts.router.address,
      method: 'getAmountsOut',
      api: basics$2.contracts.router.api,
      params: {
        amountIn: amountIn,
        path: fixUniswapPath$1(path),
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
      blockchain: 'ethereum',
      address: basics$2.contracts.router.address,
      method: 'getAmountsIn',
      api: basics$2.contracts.router.api,
      params: {
        amountOut: amountOut,
        path: fixUniswapPath$1(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$2 = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn$2({ path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountsOut$2({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn$2({ path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountsOut$2({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
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
  toAddress,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'ethereum',
    from: fromAddress,
    to: basics$2.contracts.router.address,
    api: basics$2.contracts.router.api,
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
    path: fixUniswapPath$1(path),
    to: toAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

const fixCheckSum = (address)=>{
  return ethers.utils.getAddress(address)
};

let route$3 = ({
  exchange,
  tokenIn,
  tokenOut,
  fromAddress,
  toAddress,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
}) => {
  tokenIn = fixCheckSum(tokenIn);
  tokenOut = fixCheckSum(tokenOut);
  return new Promise(async (resolve)=> {
    let path = await findPath$2({ tokenIn, tokenOut });
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts$2({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    let transaction = getTransaction$2({
      path,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      amountInInput,
      amountOutInput,
      amountInMaxInput,
      amountOutMinInput,
      toAddress,
      fromAddress
    });

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction,
      })
    );
  })
};

var uniswap_v2 = new Exchange(
  Object.assign(basics$2, { route: route$3, getAmountIn: getAmountIn$2 })
);

let PancakeRouter = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let PancakeFactory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let PancakePair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$1 = {
  blockchain: 'bsc',
  name: 'pancakeswap',
  alternativeNames: ['pancake'],
  label: 'PancakeSwap',
  logo:'data:image/png;base64,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',
  contracts: {
    router: {
      address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      api: PancakeRouter
    },
    factory: {
      address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      api: PancakeFactory
    },
    pair: {
      api: PancakePair
    }
  }
};

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixUniswapPath = (path) => {
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
  if(fixUniswapPath(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'bsc',
    address: basics$1.contracts.factory.address,
    method: 'getPair',
    api: basics$1.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath(path),
  });
  if(pair == CONSTANTS.bsc.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'bsc', address: pair, method: 'getReserves', api: basics$1.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token0', api: basics$1.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token1', api: basics$1.contracts.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.bsc.WRAPPED)) {
    return minReserveRequirements$1({ min: 1, token: CONSTANTS.bsc.WRAPPED, decimals: CONSTANTS.bsc.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.bsc.USD)) {
    let token = new Token({ blockchain: 'bsc', address: CONSTANTS.bsc.USD });
    let decimals = await token.decimals();
    return minReserveRequirements$1({ min: 1000, token: CONSTANTS.bsc.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath$1 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.WRAPPED)
  ) { return }

  let path;
  if (await pathExists$1([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists$1([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists$1([tokenOut, CONSTANTS.bsc.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.USD &&
    await pathExists$1([tokenIn, CONSTANTS.bsc.USD]) &&
    tokenOut != CONSTANTS.bsc.WRAPPED &&
    await pathExists$1([CONSTANTS.bsc.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.USD, CONSTANTS.bsc.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.bsc.WRAPPED &&
    await pathExists$1([tokenIn, CONSTANTS.bsc.WRAPPED]) &&
    tokenOut != CONSTANTS.bsc.USD &&
    await pathExists$1([CONSTANTS.bsc.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.bsc.WRAPPED, CONSTANTS.bsc.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$1([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.bsc.NATIVE) {
    path.splice(1, 0, CONSTANTS.bsc.WRAPPED);
  } else if(_optionalChain$1([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.bsc.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.bsc.WRAPPED);
  }

  return path
};

let getAmountsOut$1 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'bsc',
      address: basics$1.contracts.router.address,
      method: 'getAmountsOut',
      api: basics$1.contracts.router.api,
      params: {
        amountIn: amountIn,
        path: fixUniswapPath(path),
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
      blockchain: 'bsc',
      address: basics$1.contracts.router.address,
      method: 'getAmountsIn',
      api: basics$1.contracts.router.api,
      params: {
        amountOut: amountOut,
        path: fixUniswapPath(path),
      },
      block
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$1 = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn$1({ path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountsOut$1({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn$1({ path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountsOut$1({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
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
  toAddress,
  fromAddress
}) => {

  let blockchain = 'bsc';
  
  let transaction = {
    blockchain,
    from: fromAddress,
    to: basics$1.contracts.router.address,
    api: basics$1.contracts.router.api,
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
    path: fixUniswapPath(path),
    to: toAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

let route$2 = ({
  exchange,
  tokenIn,
  tokenOut,
  fromAddress,
  toAddress,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
}) => {
  tokenIn = fixCheckSum(tokenIn);
  tokenOut = fixCheckSum(tokenOut);
  return new Promise(async (resolve)=> {
    let path = await findPath$1({ tokenIn, tokenOut });
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts$1({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    let transaction = getTransaction$1({
      path,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      amountInInput,
      amountOutInput,
      amountInMaxInput,
      amountOutMinInput,
      toAddress,
      fromAddress
    });

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction,
      })
    );
  })
};

var pancakeswap = new Exchange(
  Object.assign(basics$1, { route: route$2, getAmountIn: getAmountIn$1 })
);

let UniswapV2Router02 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let UniswapV2Factory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let UniswapV2Pair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics = {
  blockchain: 'polygon',
  name: 'quickswap',
  alternativeNames: [],
  label: 'QuickSwap',
  logo: 'data:image/png;base64,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',
  contracts: {
    router: {
      address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      api: UniswapV2Router02
    },
    factory: {
      address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
      api: UniswapV2Factory
    },
    pair: {
      api: UniswapV2Pair
    }
  }
};

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixPath = (path) => {
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
    blockchain: 'polygon',
    address: basics.contracts.factory.address,
    method: 'getPair',
    api: basics.contracts.factory.api, 
    cache: 3600000, 
    params: fixPath(path) 
  });
  if(pair == CONSTANTS.polygon.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'polygon', address: pair, method: 'getReserves', api: basics.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token0', api: basics.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'polygon', address: pair, method: 'token1', api: basics.contracts.pair.api, cache: 3600000 })
  ]);
  if(path.includes(CONSTANTS.polygon.WRAPPED)) {
    return minReserveRequirements({ min: 1, token: CONSTANTS.polygon.WRAPPED, decimals: CONSTANTS.polygon.DECIMALS, reserves, token0, token1 })
  } else if (path.includes(CONSTANTS.polygon.USD)) {
    let token = new Token({ blockchain: 'polygon', address: CONSTANTS.polygon.USD });
    let decimals = await token.decimals();
    return minReserveRequirements({ min: 1000, token: CONSTANTS.polygon.USD, decimals, reserves, token0, token1 })
  } else {
    return true 
  }
};

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.polygon.WRAPPED)
  ) { return }

  let path;
  if (await pathExists([tokenIn, tokenOut])) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenOut, CONSTANTS.polygon.WRAPPED])
  ) {
    // path via WRAPPED
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.USD &&
    await pathExists([tokenIn, CONSTANTS.polygon.USD]) &&
    tokenOut != CONSTANTS.polygon.WRAPPED &&
    await pathExists([CONSTANTS.polygon.WRAPPED, tokenOut])
  ) {
    // path via tokenIn -> USD -> WRAPPED -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.USD, CONSTANTS.polygon.WRAPPED, tokenOut];
  } else if (
    tokenIn != CONSTANTS.polygon.WRAPPED &&
    await pathExists([tokenIn, CONSTANTS.polygon.WRAPPED]) &&
    tokenOut != CONSTANTS.polygon.USD &&
    await pathExists([CONSTANTS.polygon.USD, tokenOut])
  ) {
    // path via tokenIn -> WRAPPED -> USD -> tokenOut
    path = [tokenIn, CONSTANTS.polygon.WRAPPED, CONSTANTS.polygon.USD, tokenOut];
  }

  // Add WRAPPED to route path if things start or end with NATIVE
  // because that actually reflects how things are routed in reality:
  if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == CONSTANTS.polygon.NATIVE) {
    path.splice(1, 0, CONSTANTS.polygon.WRAPPED);
  } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == CONSTANTS.polygon.NATIVE) {
    path.splice(path.length-1, 0, CONSTANTS.polygon.WRAPPED);
  }

  return path
};

let getAmountsOut = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'polygon',
      address: basics.contracts.router.address,
      method: 'getAmountsOut',
      api: basics.contracts.router.api,
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
      blockchain: 'polygon',
      address: basics.contracts.router.address,
      method: 'getAmountsIn',
      api: basics.contracts.router.api,
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

let getAmounts = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountIn({ path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountsOut({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn({ path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountsOut({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
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
  toAddress,
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'polygon',
    from: fromAddress,
    to: basics.contracts.router.address,
    api: basics.contracts.router.api,
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
    path: fixPath(path),
    to: toAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return transaction
};

let route$1 = ({
  exchange,
  tokenIn,
  tokenOut,
  fromAddress,
  toAddress,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
}) => {
  tokenIn = fixCheckSum(tokenIn);
  tokenOut = fixCheckSum(tokenOut);
  return new Promise(async (resolve)=> {
    let path = await findPath({ tokenIn, tokenOut });
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    let transaction = getTransaction({
      path,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      amountInInput,
      amountOutInput,
      amountInMaxInput,
      amountOutMinInput,
      toAddress,
      fromAddress
    });

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction,
      })
    );
  })
};

var quickswap = new Exchange(
  Object.assign(basics, { route: route$1, getAmountIn })
);

let all = {
  ethereum: [uniswap_v2],
  bsc: [pancakeswap],
  polygon: [quickswap],
  solana: [],
};

var findByName = (blockchain, name) => {
  return all[blockchain].find((exchange) => {
    return exchange.name == name || exchange.alternativeNames.includes(name)
  })
};

let route = ({
  blockchain,
  fromAddress,
  toAddress,
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
        fromAddress,
        toAddress,
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

export { all, findByName, route };
