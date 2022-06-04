(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@depay/web3-tokens'), require('@depay/web3-constants'), require('ethers'), require('@depay/web3-client')) :
  typeof define === 'function' && define.amd ? define(['exports', '@depay/web3-tokens', '@depay/web3-constants', 'ethers', '@depay/web3-client'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Exchanges = {}, global.Web3Tokens, global.Web3Constants, global.ethers, global.Web3Client));
}(this, (function (exports, web3Tokens, web3Constants, ethers, web3Client) { 'use strict';

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
    return await web3Tokens.Token.BigNumber({ amount, blockchain, address })
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
    constructor({ name, blockchain, alternativeNames, label, logo, contracts, route }) {
      this.name = name;
      this.blockchain = blockchain;
      this.alternativeNames = alternativeNames;
      this.label = label;
      this.logo = logo;
      this.contracts = contracts;
      this._route = route;
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
        token === web3Constants.CONSTANTS.ethereum.NATIVE && path[index+1] != web3Constants.CONSTANTS.ethereum.WRAPPED &&
        path[index-1] != web3Constants.CONSTANTS.ethereum.WRAPPED
      ) {
        return web3Constants.CONSTANTS.ethereum.WRAPPED
      } else {
        return token
      }
    });

    if(fixedPath[0] == web3Constants.CONSTANTS.ethereum.NATIVE && fixedPath[1] == web3Constants.CONSTANTS.ethereum.WRAPPED) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == web3Constants.CONSTANTS.ethereum.NATIVE && fixedPath[fixedPath.length-2] == web3Constants.CONSTANTS.ethereum.WRAPPED) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  let minReserveRequirements$2 = ({ reserves, min, token, token0, token1, decimals }) => {
    if(token0.toLowerCase() == token.toLowerCase()) {
      return reserves[0].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else if (token1.toLowerCase() == token.toLowerCase()) {
      return reserves[1].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else {
      return false
    }
  };

  let pathExists$2 = async (path) => {
    if(fixUniswapPath$1(path).length == 1) { return false }
    let pair = await web3Client.request({
      blockchain: 'ethereum',
      address: basics$2.contracts.factory.address,
      method: 'getPair'
    }, { api: basics$2.contracts.factory.api, cache: 3600000, params: fixUniswapPath$1(path) });
    if(pair == web3Constants.CONSTANTS.ethereum.ZERO) { return false }
    let [reserves, token0, token1] = await Promise.all([
      web3Client.request({ blockchain: 'ethereum', address: pair, method: 'getReserves' }, { api: basics$2.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'ethereum', address: pair, method: 'token0' }, { api: basics$2.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'ethereum', address: pair, method: 'token1' }, { api: basics$2.contracts.pair.api, cache: 3600000 })
    ]);
    if(path.includes(web3Constants.CONSTANTS.ethereum.WRAPPED)) {
      return minReserveRequirements$2({ min: 1, token: web3Constants.CONSTANTS.ethereum.WRAPPED, decimals: web3Constants.CONSTANTS.ethereum.DECIMALS, reserves, token0, token1 })
    } else if (path.includes(web3Constants.CONSTANTS.ethereum.USD)) {
      let token = new web3Tokens.Token({ blockchain: 'ethereum', address: web3Constants.CONSTANTS.ethereum.USD });
      let decimals = await token.decimals();
      return minReserveRequirements$2({ min: 1000, token: web3Constants.CONSTANTS.ethereum.USD, decimals, reserves, token0, token1 })
    } else {
      return true 
    }
  };

  let findPath$2 = async ({ tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.ethereum.NATIVE) &&
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.ethereum.WRAPPED)
    ) { return }

    let path;
    if (await pathExists$2([tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.ethereum.WRAPPED &&
      await pathExists$2([tokenIn, web3Constants.CONSTANTS.ethereum.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.ethereum.WRAPPED &&
      await pathExists$2([tokenOut, web3Constants.CONSTANTS.ethereum.WRAPPED])
    ) {
      // path via WRAPPED
      path = [tokenIn, web3Constants.CONSTANTS.ethereum.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.ethereum.USD &&
      await pathExists$2([tokenIn, web3Constants.CONSTANTS.ethereum.USD]) &&
      tokenOut != web3Constants.CONSTANTS.ethereum.WRAPPED &&
      await pathExists$2([web3Constants.CONSTANTS.ethereum.WRAPPED, tokenOut])
    ) {
      // path via tokenIn -> USD -> WRAPPED -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.ethereum.USD, web3Constants.CONSTANTS.ethereum.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.ethereum.WRAPPED &&
      await pathExists$2([tokenIn, web3Constants.CONSTANTS.ethereum.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.ethereum.USD &&
      await pathExists$2([web3Constants.CONSTANTS.ethereum.USD, tokenOut])
    ) {
      // path via tokenIn -> WRAPPED -> USD -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.ethereum.WRAPPED, web3Constants.CONSTANTS.ethereum.USD, tokenOut];
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$2([path, 'optionalAccess', _ => _.length]) && path[0] == web3Constants.CONSTANTS.ethereum.NATIVE) {
      path.splice(1, 0, web3Constants.CONSTANTS.ethereum.WRAPPED);
    } else if(_optionalChain$2([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == web3Constants.CONSTANTS.ethereum.NATIVE) {
      path.splice(path.length-1, 0, web3Constants.CONSTANTS.ethereum.WRAPPED);
    }

    return path
  };

  let getAmountsOut$2 = ({ path, amountIn, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'ethereum',
        address: basics$2.contracts.router.address,
        method: 'getAmountsOut'
      },{
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

  let getAmountsIn$2 = ({ path, amountOut, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'ethereum',
        address: basics$2.contracts.router.address,
        method: 'getAmountsIn'
      },{
        api: basics$2.contracts.router.api,
        params: {
          amountOut: amountOut,
          path: fixUniswapPath$1(path),
        },
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
      amountIn = await getAmountsIn$2({ path, amountOut, tokenIn, tokenOut });
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
      amountIn = await getAmountsIn$2({ path, amountOut: amountOutMin, tokenIn, tokenOut });
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

    if (path[0] === web3Constants.CONSTANTS.ethereum.NATIVE) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactETHForTokens';
        transaction.value = amountIn.toString();
        transaction.params = { amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapETHForExactTokens';
        transaction.value = amountInMax.toString();
        transaction.params = { amountOut: amountOut.toString() };
      }
    } else if (path[path.length - 1] === web3Constants.CONSTANTS.ethereum.NATIVE) {
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
    return ethers.ethers.utils.getAddress(address)
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
    Object.assign(basics$2, { route: route$3 })
  );

  let PancakeRouter = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  let PancakeFactory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
  let PancakePair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

  var basics$1 = {
    blockchain: 'bsc',
    name: 'pancakeswap',
    alternativeNames: ['pancake'],
    label: 'PancakeSwap',
    logo:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAOVBMVEVHcExjMAH+3JBcJwCSb05+VC7RiE9qOg/EsZ+jhWpfLADXjlT/45Z5QxGVWiaubzi9fkXuxH3dqmiL4XhdAAAACnRSTlMA////msX/6i5cADBNDwAAGz9JREFUeNrsnOGSmzoMhcMYg60MhPd/2itjNrSNSQKWWPtyvj/d2bZbVT46lozJDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4CjO+9ba/om1tvXuVg7u7/j60uKrmZDbngwFmpnwFX+jKSPJc3xNDLCJLPH11pcQYNW4Nua2ScC/YahvfzXFztv38TUWGshafbPmdiPJze9pwLM1rYu/JQI2ghs4kN32ufofNfAbKWZ5Pkv/kwbsr2m0Wrw1Zs3h5xz3Jzute8rzS41CAruWv/86u8++qz/RBZzlJd0HJLArvevy76iyszaCUP3Nfkzf3sAXxPQeyTCdUmS+PxgfmTNdqlZm9z/KCRl2NiM+MjCBj+V/KL1rK2B1TWAp/5IlWjOxvDIzrKmANjs+IihArby0M+ysQHyNsTeQXn+2fwGIlDZaJ6HPoADlbapWfLa9/qDTarlGZv21t6laaaXSq+SyH/yJIutXUMDO9X+XsfUhMDN/cbrLvlv/EM8wjg9mmqbwyzgO83e3OPXcsgp8qP/3GR6GcYG/DN860wN4f9oOjiObunvk+ev0mKPc+kvwgG/Xf07i8Ji6jnP7k11O71xjZylgs/6DMh9dCOmFIIKR/wAU8EV+6U19xfJKpfcx8PHvGZ2ga7aufHBwf8b2GuRjIEIfsDO/K0t9beZ3GgdD6grYmv94+bt7954ogXP6lFpxPW1Wf6yvdyU2NpsKkGq0rEmLMyz/Z+YQdRVaOdZs+evjiwzfw0a7YR8yJdaadPlPz+A+h2gICtiX37XAPueXTVZxGPSUNKdndPtNYP0hEvHVjjPN4QJb80tqJptqUPhbjyW6r01gIIwC6Qcs+QU25zepI4EHQymDolWd34t0MDoKrZzWpO3/3glUGM9at5v8CUVc//0KIBWF1o2Mwcb8qvRZPSXWn/+1A9xH8/qzshVaOdak1n86lODRyE8CrRFb/xAhySu0bpyRqf8lv+K7rCOSkufMQNIKrZyUAfD6y+WXFeBEDeCf9c/vVC5tAckOi9dfsMI4waIGdSy89cji9T98ZQuwiQRz/59RYQ1JJvjVAMzB8NZGkHSfW1aFT3VYefl9kOCDYR5RZMNLm9R1zwNTHcAkXmFsAWIG8NOfiJrUZbsAfgoougH8VJjUU8GUAWSHF04DMAj87ADCG8CyCUgdtngj7U8zbAFCCq2dnmRb7EUBYhZgjXAH+JSoWJdSNTxjKTgs51do1HbiDcoPDaENnB1WwwBmCxDZA1oj36AsXQDawOiw8h1A7LNlLoe9xidkAMECJBRaOU74kO0PBokK4xlFRZ/RAqQm1Yrxr9NQJ8N9lNgDvNYOENoUzAHssGoJ5j1AoMJao9QCRo/CHNCTWoLZAvIv3ujtANgDlLdYttj8JoCPAZUMCnvActVCawcIe0D+AyGncEq9MonMKVWj2GMxQ/ac5fV2qCXA7Dmlbloj/qBNdI9tjdoOlTqsost1gdYoDYFxj83uAq2uAEa6+isiij2gjAAUe8AQYLZFVY7rNRN8n7KfB6nGxwFe/Q0RJ33Z7m9e89vuFqjSOXUkX6GV41WnrHAWmCkAtQcVGAOWywC6CW7+zW/pArjaGOBIN8G5BeYhAF08BNBc+nEQHODqAlA9CYYAisfrjoEQQOnoPmyrQADN1QXQk8KV8GoEEE4Crz0F6D4LqFEAFzsISrwYOnWClC4AgTtLldPqHgWWLgCJW4t143VevKtFAAMEoDsGFC6Abrj6fQDVW8HFC+A+Sb3CXjE9Kd4Jq04AVzsGYKzqtdvCBYAhQHsMKFwAI14MOfnFgMIEMEAAN6fwEWy1CABDQBwDFM8CixYAhgD9LrBsAeBjotS7wLIFgA8JUu8CKxPA5Q6C5xwrviBeuAAGwmeFcheo8DmhdQhA4O31/wOqY0DJAsB1oAWreDW8aAFgCIi0ilcCihYAhgD9MaBkAXS4DRJxKh8W/R9717bbuA4DIVC2ZRq+/P/XHinJJmnji3oiEZQ081CgfVh0yxE5w1BUAQQwMAHZJ4M1EwAa8B+6fDZAMQESrC+pBV2+ZrBmAmBLZPaN/LoJgGmQlw3IpgIVEwAmQKIZrJkApvkdgU/kawbrJQAawW/osu3kV0wA9AElZkKKIkCrEiBnM7gkArT5aFxmG6CXAJgIFrEBagkwbTABEg8H6SXAyjABAs1gvQSACRBpBpdEgHZNQMbJYLUEgAaUmQlRSwDcCpPZE6KVAGgEC9kAtQTAaggZG6CWADABMjagIAK0bAL8HzrTmgitBIAJ+AWXaVmYVgLABAitiVBKANwKk1KBWgkADSg0E1IMAZodCM08E6KVANCAQjZAKQFgAiJsQJLJYKUEgAmQWhOhkwCYBhHrBSolAEyAlApUSgDcCpMaCdBJAGhAsclgpQQw2A8ndEFQJQHwUIhcM1gnATANImYDdBIAJmAPI2dQgToJABMgpgJVEqA3MAFS2+I0EgAPhQi+I62SAJgGkRsJOCeAc+Nore1+wnqMo7tlZZeDABgIlbMBvwnA3ehh71EfBsNsiNgwPeB/hfBN+PkwBCqIEAAaMNuaiE+9HWIdvrD/yuYEzEzMGQiARrCgDfB/67RIQQCshpC7H6aQALgWKNkM1kgANIIFbYBGAsAECK6JUEgA7AiWnAkpgQDQgBltgEICbIahAcVsgD4CTCseChG0AQoJgGEAyWZwEQSABsw3E6KPAGgEi6pAdQQIfUCYgEMk3xNyRAC+g4jf8PgmLwEwDCD6dMjMH1G/h3ie52UH/sfPDwJ/IRsBoAEzNoMDAfiOEPR72NdtC6HYRTDq27r+Y8MLDwL5XwgaMB+SXxCczeO0rz+i3p9ihxZ3XnhOmOQEgAbMuSZi215x77/D1Id/4+sxxRkvRp/AmdRrIqZeFTAR/Oc1EZuyEPapNSBMQFYVqAxoBEurQGXArTD5mRBdAAHOYAeTvBmsDDutyQ4UuMHZgcJfJ7EN0IXNfIJpGGEFnTXEOZrvqhBMwD4FbNsUcN1A5oGaRcDNBIACvzHeTn8TBJiP/59kGqWAs0zmicpVYCAAKPAz+Rsf/kYIcG8EgwIvOLtT+9OvidCCoAEv0JQWcKMhzj6EpQg7BNiTg630Bcafvr8BFTgtPt+BAneMHbOJAc3VEKBfZ2aOoABX3x3ck/774KpUoKeAiaEAcd1SYDQUGX2z1KMBA6apX+YYCtRcB8Yurvgzz+v29SiXOvg0sESoX6ZK60Bk9mc286ptoisRpmkLaaDNOjAOFJn7Kzz8bxS4CcL26oCLyv7M1R7+F6Z+u64EzF1VSSDq+Fec+z8rgeGGkkDU8a889+9RgC/EYC1JIOL4M7UU/hsCBYgbSALOXmue9sIfcF0IuAI74DqKSP513QL5gx68ogCVvkTguvVHzYb/WQjOT0fJF0icJcbpjygElWrBy/TPPDdY+z8dwcxcoxYchyuf04jvj/mskLi6MnCl/nleEP44NchUoBu4SP9sEP53XNSB4oTARflnnhvXfp+YQh2oRQhcNP9Q/A/rQB1CYCRG9k9dB7iclRLn7p+Q/U8s4Wq4eCFgcfy/6gsxl80Ae37jr57rHnkwTYvhkj8aOJP/zDj+UUrg+Tcsb8P0WfwJx/9rO8C67aDrCMc/AXxPgI9OkeYNo6fxNzj+f0kCh2WA9e4XO4s/Wn9/xWK4sCrgOkL6T4aTlgAbnQzoCOk/JUJfsKQq0BF6f2nh3QBxMTnAHp//Gen/fyI0hQrpB1hC+c+ANyGg+70JSyj/WeCFQAk5YDSM+OdBYID6T4YcHcYf8s8jT09Iz5sjbmDI/3x4MkDt8+MdofuXE54BjxOm8+lBS7B/mTHNpNcKjHSQ/xH/hFhIqxVw5iA9VbTmTwMWVmoFBkL+l8B/7F3deqM6DDxE4U+KDcn7P+xikjY0uP26F8xoczQXvS0RY81INpYlcWkEW4n1D0ISh/tCo4T+g1BqAXdGcGg08j8KhQHe+kGtxPvHoXSFfdmAs0T/BwmbqxmXdjhgaDT6/1DY1FQgrEn0dQGI/b8DYVn8iMAobz7pxSOsXgwyKoH6HqDE+z8UxQg6qQRaefNpfz5RjKALERjCAHJgWV3sCrUSBpADS+IgBYwSBoCEb2wANgUMvYYBYMEmvg88SxgAHiwr+3xYr9EBYCIptx94lvce9eodNnFTwNBrCAAVlpVZCo5CnPZuBd4umTfwU9lMPSXeK6sCMJunnFLKnmbLWhkKm1PKeepQT1VNAahCYBRSC+g+hLvA04DZdR6s6IqFmSgKJKWlgF5JLaBpO2hNfdw6Z912/JuqgmbgWBZWL2DgOMD1JmV3l87vP+DXBrIYSgogbQu3wkgA5f07/Po0q9auxADAJlIK4CQAm1yeP8tC/CqClAJGIfQAy/v3dwPBXYdZxyJs4tjAVvE/t5yC8HcD5eP98w7Gpf2rOL4fTEkAj5/q6yu0zRFdTl/MMiMFnGWfhbuDcV9q3NVWwT0rMS/HSYo/GNIqvASwqfkRkFhX198PUMDemGWBa8AghPgnbdix/saCcUXAZvyGwFngGbiEmh7rHezJSl4lYFnRrYBe3SUATKz/mpWNHE9Lm9GbwgM++K8dLyefoyVtPNAyKbYXNAreAt5/oy8XcF96fGWyLNg6oBW0AnyE2lchUMTXBS3nRpGnAoZe0T+yEmoPXyTUegD4Bkk1PEfeGTMKPs2tCuBCb79aQCcaMCmyEDx7VYDDn6Oy7lxogM3Qr8RaQa+8L6H20w9O+ktadkfDsgI7Ab3C415C7U0D1rzrVgMO7AQM+Mw7N41DAmRt/OSlnR897u7IEa8Ahd9esq1TAiSFmYCzoF1OIYCbbLvtTfnJS0gT0MItQPl1jhbbB5KjvGSTwraEe0X34H0SYG4aR3lpblCtoIHQ6krqzwWaLwJ0SWkEONoCOCXApI2jvGQZVQYMhJ/3qHF8NN6dEmBCEWBUeIL7i2QL8FufS845AY6qA0dBE2BVWz+G++smvJPdgM5m1HfiZzgBuiDA784EYBoBraJjHhngl04Z0whoBe67/nkCADxApTGJIgCg8nJZBfgygZ1lFAEUT4DoAzgiQK94gQsCeCIA/tdZUld2y2Ur2KY3JoDLzaDiTBwdVbRJggCYtfYBT+cB1uuTOAQAHMa3ydVae9LSlS7dTknflQCzvyrQ25GwtyZAnAr+vxPA53cBc6OedIlIgMN/n03qaa09q1NPaemdCdB1zb/7bSAiRXIJcDv+B1pSdwqweFNPCvDmBJjUnQIsSOooLV15BLh1xyOpn1BvaOlHAd6cAJbFmwLcaennlCKPAFcEAWZfXaBPWrphpZ1YBJgv1+54WFYvuXaLRp1YwLcnQIm1LwfwSAFOEkB3u/AIcOoAsKzsGxnrLsCJLFEJgAl9Um8JoBQCXgpTKgEALnD1gUq+mL0uAj5syZVIgAuEAKXs9nRN7AeSuMhKVAJgXGCxAXSvVR1k5iAr2YlYBZxAJqDkW2/v/y5N9Pe/WAAqATAaUJ/Q1yj1/a85QOhzrK5UAoBMwJoD9vehEfX/DuuSasOdZ3qlSgDKBDyWmzIj/V01uH0qlQYyN3RrAagEgJmAx/BwFXU2PnwdHv4BaUCzo7cWgEsAnAasFJhzKofgU8oz4jjSb2CFmOWplj8T/qmubALgNKDgM77wQP/8VLSHshNbAiDbAYHvFYBOAKQGBHYKQCcAWAMCLwrAlwBgHRDYJwA+AaB1QOC1C7SAuBl0Cg2g4qEANyoBwgbysChAScGkG0IKASIFMFESQCEA6YaQlQBhA4m4XbAE0NfDmJdTpAAi7BF+AxGgrRAgUgAR14cEzygCyOvBx/IAUQnScDqBCaB7AkQK4OH2ocCoa+LOrwRIy38PF8CCfQY/C2degC4EiBRAw+IAHkigeQGjvh7Ju14iBbBgz9AnxWSA/cyguwpFO5CB69OBowbID7t/dLuECyDh9oz8TUBTw4bdbJquECBKQQY2ge92BDhqcGSv+15w+EAKtrl3FtDk0P/6WiMgRIAA28Y9wwjQ1urAEAECFgf4BGpoWGkEVOrAEAE8tmEvpwEwbYBKHVhcYIgAHEUAthYAVAWWMmBvAkIE4LDlEOBPFkAOqgIXtFo3AdEOQqIIwE8W4DAP+J0JCBsAxe0l6aJGRxecpdYLDBuAxGIAWBagMkC+mIBgABLFALwoAJAAw3546PUSNgCJz3g/i0BQI3hFW9WAsAEwLO9/pwCoNlDBKJWj4cEAGBYD+IKMtADrjnClEAwbAEJ5/zsFAO0FP9DrXgOCASA8C4BtFwjXBSg4V+qAP+xd67qiMAz8ShAx5f7+D7ukoOI2cIq2QCGz//Y7FyWTmUkKHtGAbaAT+1KX2x0EDMjRYlwrDNgETP0LDWq7PfCA22wMlFOBoNBco5X2DBDWAcgDmBgoDAgOrv50N+DGDsB4gAI9vDRZCAWEZo222t4B6ETQjoGiAYHB179DtbkDMLsghZ0wICwo/7ECsNUTAdYuyJIAHjILeMFM/VuFOziANQcQWmFAQJj68wKw6TnAQgysEgPZB4QAX38zAuwiACYGsvtgngFyMvTr/n/m2u4lABQDOQkQBgRBN3ddNag9IuD7RMi+P5zHRn9b8KR4pytmCbjxOZAlAdw6UFZCPqHbWWttdhSA4fkA/kRAFgIe8a4/OwJuei+YdSDAHgrKMOAT3cIFrfYUgPHmUD4H8tjqr0yfCe/6swawXwIYJYA3AYmCnsDJ//RTgXYVgHEQ4O4QFxvwA50sXcxqbwEwgwBrAiICXtAmybIB7C0AXAqgZYAwwAdY+Z8+DYhqj3PgT+ScCo0bYVkLhln+jm1UgtrrFGCKG2MCZVKIDfzc/skU/AS4/Z1gjiZAHyAvIhCu/V8BYKuPhXLIgfb9gSICgdzfBADE/RPgiPtMDBARCNX+wwbgAAmQPxIggLUN4EVAKODU/nwA3PhxwMV9IHeDYP82xAcCtP8QAA9jANwkwAdBHuIDq8rP/2kQAuxkAIScTSSNEwMKocAbHaP+/ABwiBXAsgkgmo2g+MCa0d+l/hrxWAYwZwLIPinCh1qhQJYx5efvAkZ1jBWQtQ5ih0FHXJ4CvPnzJwDHmQCX10EKS8MAiQK+ym/qf7gAwMcAA6A7xIQCvso/1P94AWDAbVYDhAK/R/93/Q8YAJ4xgNUAYoBQYLH8K+oP6mAbAGsbwLuAUMBJ/J0OgHa/C8w9CK6fBQjFZSYC3bVr1FHz+o8HCIBPpF4YkBRFe4FTIk3d/3v99zsCWsMAbd6qOMHU+pN1utgAqsMOAC/kN54B2JikI04wQK8uf1FHUf95BkBt3rE4wdj8Kz3RPAFw3AHQGgYZQGUYcHkZcGh+7v6faOpvMYC/R8gdxanuGLCq7zb+zdf/KAOgdS7080rogwPnsILO7HxWo8hUVPWf1wCEpviSAvFzYCr9fuLfYRaAKxjABAF3GYiYA3b13e2/AhVX/z8Z4NcGItaBSfU92v+h67/EAKX7Ol6HA5qb+dzfbYOo4sn/TgxAtGxgPQfimA2p+Px7dZd/VCqK/Q/PgAA28JoLDi4EuuNb3x2Fkf9o67/IAGz4xlhvBsckwdD6xY8cp/TPAzGC+g9bYR7oQQSGi3Q8JdBd+2z9UO1/pPPfZaTzFqbq30XgaCTQnZfiG/ev1bz832Opf88AxMAiQCj6a76zH2jdeZD9/9o/tvUPh4fC2TeCvkTgmQmIBTtogRF9X8Ufjv6ob6Ic//kouCAC3q7amwVtuxkNqO1J9H2+i6LIqP3jjn92FOQBULcer93UEQwLgpmCHuw+8Vt7+nnv2Z8DRmT/dhTkw6CHiXCeBkYOfIaDsfIBSj+qP4W/k9j/G487qAUfyEJcytcVHXlARPhWE7TW/fe2hP4nBqn8+GKbcqn9IY2z/u8gwAKgaoNd0wkReiQTLnT6L3SEtn01fMDSj9l/Sf0Vqhjlf0S+ZAMKcAMKvK+zWxPTlwQv+qf5I6jzyb9tA7wP1NtR4IAoxs3PGeV/Mg3gIgWyAANBHOjL3yhzdc6w/JtHqnCR42Xjb5kSEcbyn7v9XyIgFGDEn6L/6dt/QDo1Op4Cl8oC1P1/lB/VSdr/NRDiMgXUdSgwRL/l63Gm9p+KgEwEZu5/l58HqOhW/z8nAaMCdRdoQXwYFElX4V8XAiM7+fOyEyAgQNmdOA/27ywrAZS6mPpPFoMIahlwXid4Bf/rqf8bD8sHWCc4nwz01deD9V9T/ac+4ECBk42FdCdzY7T/uur/Rm7NA7wMVNlJZMAM/Vbz20CI+dxv3TzgRAEoT2AF9GkndQlW+W3AuTY/P0eBpxX4ud96H5D0W9XnAec3f44CLlYQqw70r7mrLennAXC7iPp/UACdKEBxoO7C3IsXCsWg/AioHIB4wfIT0juicgGYPNBGwgES/tH3pfy/z4QjqJmqrN3sVq2vi0+Zv1JD74v4O2UBUK4cAFUdWAhM8XVdKdP70v0rsgAodw5AWWXt8UhgXD+rFLDV5wFKym+Q32zFXBaCsmrakHfqr+78pGsqpWDN27jU3P8XHikfBpZJUHd7s6AohsRXlQgr38Bdyv+BnB8JlklgMoHvpzRdYWpPcZ+T/WUgSvlnwgCq9SRQZa3bZLtnOcZf1WZ1Saq//jVL8vPlBBMWlFXddG3gZ3rGn97qpq5Kcnxc/VpF+5eRpzdanq4HwkgD3bX+eVAQho+pG0oPX77IuzS/UxqwL687DVANctC1vz3bOf3mtuuo6c0v+P61ifOvsALrOrsDEWHIBmXVMyEzVChsWLWeYvysiYzqXhqvZxTfHQgi/auQP25cHFhPhAkV6qbJdGfQGkz+gHE7eXo8a5qmripTdgNkK79y6HtI+b+IA4jKB15UgGkjlxO8IhrBU9lHAKqbVP9rHVDgqQ4fQPo3Bf1HiN8DINX/WQfuAAFqEx4IKMrvA5QHfJnBZkBUMvL5Q06BIBohEOEPgjyNgQQUJ24i/KFg3MBXPPcOJN2X1g+M3JAAggwH3wNJ9iXybQaygzviMfwAEdRdZH9z5I+eBErtygL65VR8ift7IX88zMLQ297OveufcU8af3cQC9IhGATnAfYApK5PHyL6h0JOnnC73xX62+P/d55AKf9+k7Y/NIgHqeEBAsKP3oCm7s/KpxL04kHPA2MMt7vhgrEHwL93CEgAM9WN/W7EXno+YuQmI6S3Hncn0Ff23yBVFwgEAoFAIBAIBAKBQCAQCAQCwb/24JAAAAAAQND/166wAQAAAAAAAAAAAAAAAAAAAAAAswCsVemaah0CHgAAAABJRU5ErkJggg==',
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
        token === web3Constants.CONSTANTS.bsc.NATIVE && path[index+1] != web3Constants.CONSTANTS.bsc.WRAPPED &&
        path[index-1] != web3Constants.CONSTANTS.bsc.WRAPPED
      ) {
        return web3Constants.CONSTANTS.bsc.WRAPPED
      } else {
        return token
      }
    });

    if(fixedPath[0] == web3Constants.CONSTANTS.bsc.NATIVE && fixedPath[1] == web3Constants.CONSTANTS.bsc.WRAPPED) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == web3Constants.CONSTANTS.bsc.NATIVE && fixedPath[fixedPath.length-2] == web3Constants.CONSTANTS.bsc.WRAPPED) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  let minReserveRequirements$1 = ({ reserves, min, token, token0, token1, decimals }) => {
    if(token0.toLowerCase() == token.toLowerCase()) {
      return reserves[0].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else if (token1.toLowerCase() == token.toLowerCase()) {
      return reserves[1].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else {
      return false
    }
  };

  let pathExists$1 = async (path) => {
    if(fixUniswapPath(path).length == 1) { return false }
    let pair = await web3Client.request({
      blockchain: 'bsc',
      address: basics$1.contracts.factory.address,
      method: 'getPair'
    }, {
      api: basics$1.contracts.factory.api,
      cache: 3600000,
      params: fixUniswapPath(path),
    });
    if(pair == web3Constants.CONSTANTS.bsc.ZERO) { return false }
    let [reserves, token0, token1] = await Promise.all([
      web3Client.request({ blockchain: 'bsc', address: pair, method: 'getReserves' }, { api: basics$1.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'bsc', address: pair, method: 'token0' }, { api: basics$1.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'bsc', address: pair, method: 'token1' }, { api: basics$1.contracts.pair.api, cache: 3600000 })
    ]);
    if(path.includes(web3Constants.CONSTANTS.bsc.WRAPPED)) {
      return minReserveRequirements$1({ min: 1, token: web3Constants.CONSTANTS.bsc.WRAPPED, decimals: web3Constants.CONSTANTS.bsc.DECIMALS, reserves, token0, token1 })
    } else if (path.includes(web3Constants.CONSTANTS.bsc.USD)) {
      let token = new web3Tokens.Token({ blockchain: 'bsc', address: web3Constants.CONSTANTS.bsc.USD });
      let decimals = await token.decimals();
      return minReserveRequirements$1({ min: 1000, token: web3Constants.CONSTANTS.bsc.USD, decimals, reserves, token0, token1 })
    } else {
      return true 
    }
  };

  let findPath$1 = async ({ tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.bsc.NATIVE) &&
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.bsc.WRAPPED)
    ) { return }

    let path;
    if (await pathExists$1([tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.bsc.WRAPPED &&
      await pathExists$1([tokenIn, web3Constants.CONSTANTS.bsc.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.bsc.WRAPPED &&
      await pathExists$1([tokenOut, web3Constants.CONSTANTS.bsc.WRAPPED])
    ) {
      // path via WRAPPED
      path = [tokenIn, web3Constants.CONSTANTS.bsc.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.bsc.USD &&
      await pathExists$1([tokenIn, web3Constants.CONSTANTS.bsc.USD]) &&
      tokenOut != web3Constants.CONSTANTS.bsc.WRAPPED &&
      await pathExists$1([web3Constants.CONSTANTS.bsc.WRAPPED, tokenOut])
    ) {
      // path via tokenIn -> USD -> WRAPPED -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.bsc.USD, web3Constants.CONSTANTS.bsc.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.bsc.WRAPPED &&
      await pathExists$1([tokenIn, web3Constants.CONSTANTS.bsc.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.bsc.USD &&
      await pathExists$1([web3Constants.CONSTANTS.bsc.USD, tokenOut])
    ) {
      // path via tokenIn -> WRAPPED -> USD -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.bsc.WRAPPED, web3Constants.CONSTANTS.bsc.USD, tokenOut];
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$1([path, 'optionalAccess', _ => _.length]) && path[0] == web3Constants.CONSTANTS.bsc.NATIVE) {
      path.splice(1, 0, web3Constants.CONSTANTS.bsc.WRAPPED);
    } else if(_optionalChain$1([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == web3Constants.CONSTANTS.bsc.NATIVE) {
      path.splice(path.length-1, 0, web3Constants.CONSTANTS.bsc.WRAPPED);
    }

    return path
  };

  let getAmountsOut$1 = ({ path, amountIn, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'bsc',
        address: basics$1.contracts.router.address,
        method: 'getAmountsOut'
      },{
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

  let getAmountsIn$1 = ({ path, amountOut, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'bsc',
        address: basics$1.contracts.router.address,
        method: 'getAmountsIn'
      },{
        api: basics$1.contracts.router.api,
        params: {
          amountOut: amountOut,
          path: fixUniswapPath(path),
        },
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
      amountIn = await getAmountsIn$1({ path, amountOut, tokenIn, tokenOut });
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
      amountIn = await getAmountsIn$1({ path, amountOut: amountOutMin, tokenIn, tokenOut });
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

    if (path[0] === web3Constants.CONSTANTS[blockchain].NATIVE) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactETHForTokens';
        transaction.value = amountIn.toString();
        transaction.params = { amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapETHForExactTokens';
        transaction.value = amountInMax.toString();
        transaction.params = { amountOut: amountOut.toString() };
      }
    } else if (path[path.length - 1] === web3Constants.CONSTANTS[blockchain].NATIVE) {
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
    Object.assign(basics$1, { route: route$2 })
  );

  let CryptoSwapRouter = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let CryptoSwapFactory = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
let CryptoSwapPair = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var basics$3 = {
  blockchain: 'bsc',
  name: 'cryptoswap',
  alternativeNames: ['cryptoswap'],
  label: 'CryptoSwap',
  logo:'data:image/png;base64,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" /',
  contracts: {
    router: {
      address: '0xe4964c56f46063F25f2a77269B36a773140Ab325',
      api: CryptoSwapRouter
    },
    factory: {
      address: '0x4136A450861f5CFE7E860Ce93e678Ad12158695C',
      api: CryptoSwapFactory
    },
    pair: {
      api: CryptoSwapPair
    }
  }
};

function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
// Uniswap replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with
// the wrapped token 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 and implies wrapping.
//
// We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
// to be able to differentiate between ETH<>Token and WETH<>Token swaps
// as they are not the same!
//
let fixUniswapPath$2 = (path) => {
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
  if(fixUniswapPath$2(path).length == 1) { return false }
  let pair = await request({
    blockchain: 'bsc',
    address: basics$3.contracts.factory.address,
    method: 'getPair'
  }, {
    api: basics$3.contracts.factory.api,
    cache: 3600000,
    params: fixUniswapPath(path),
  });
  if(pair == CONSTANTS.bsc.ZERO) { return false }
  let [reserves, token0, token1] = await Promise.all([
    request({ blockchain: 'bsc', address: pair, method: 'getReserves' }, { api: basics$3.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token0' }, { api: basics$3.contracts.pair.api, cache: 3600000 }),
    request({ blockchain: 'bsc', address: pair, method: 'token1' }, { api: basics$3.contracts.pair.api, cache: 3600000 })
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

let findPath$3 = async ({ tokenIn, tokenOut }) => {
  if(
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.NATIVE) &&
    [tokenIn, tokenOut].includes(CONSTANTS.bsc.WRAPPED)
  ) { return }

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

  return path
};

let getAmountsOut$3 = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'bsc',
      address: basics$3.contracts.router.address,
      method: 'getAmountsOut'
    },{
      api: basics$3.contracts.router.api,
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

let getAmountsIn$3 = ({ path, amountOut, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'bsc',
      address: basics$3.contracts.router.address,
      method: 'getAmountsIn'
    },{
      api: basics$3.contracts.router.api,
      params: {
        amountOut: amountOut,
        path: fixUniswapPath(path),
      },
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve());
  })
};

let getAmounts$3 = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin
}) => {
  if (amountOut) {
    amountIn = await getAmountsIn$3({ path, amountOut, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amountOut = await getAmountsOut$3({ path, amountIn, tokenIn, tokenOut });
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amountIn = await getAmountsIn$3({ path, amountOut: amountOutMin, tokenIn, tokenOut });
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amountOut = await getAmountsOut$3({ path, amountIn: amountInMax, tokenIn, tokenOut });
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
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

let route$4 = ({
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
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts$3({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
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

var cryptoswap = new Exchange(
  Object.assign(basics$3, { route: route$4 })
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
        token === web3Constants.CONSTANTS.polygon.NATIVE && path[index+1] != web3Constants.CONSTANTS.polygon.WRAPPED &&
        path[index-1] != web3Constants.CONSTANTS.polygon.WRAPPED
      ) {
        return web3Constants.CONSTANTS.polygon.WRAPPED
      } else {
        return token
      }
    });

    if(fixedPath[0] == web3Constants.CONSTANTS.polygon.NATIVE && fixedPath[1] == web3Constants.CONSTANTS.polygon.WRAPPED) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == web3Constants.CONSTANTS.polygon.NATIVE && fixedPath[fixedPath.length-2] == web3Constants.CONSTANTS.polygon.WRAPPED) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  let minReserveRequirements = ({ reserves, min, token, token0, token1, decimals }) => {
    if(token0.toLowerCase() == token.toLowerCase()) {
      return reserves[0].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else if (token1.toLowerCase() == token.toLowerCase()) {
      return reserves[1].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else {
      return false
    }
  };

  let pathExists = async (path) => {
    if(fixPath(path).length == 1) { return false }
    let pair = await web3Client.request({
      blockchain: 'polygon',
      address: basics.contracts.factory.address,
      method: 'getPair'
    }, { api: basics.contracts.factory.api, cache: 3600000, params: fixPath(path) });
    if(pair == web3Constants.CONSTANTS.polygon.ZERO) { return false }
    let [reserves, token0, token1] = await Promise.all([
      web3Client.request({ blockchain: 'polygon', address: pair, method: 'getReserves' }, { api: basics.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'polygon', address: pair, method: 'token0' }, { api: basics.contracts.pair.api, cache: 3600000 }),
      web3Client.request({ blockchain: 'polygon', address: pair, method: 'token1' }, { api: basics.contracts.pair.api, cache: 3600000 })
    ]);
    if(path.includes(web3Constants.CONSTANTS.polygon.WRAPPED)) {
      return minReserveRequirements({ min: 1, token: web3Constants.CONSTANTS.polygon.WRAPPED, decimals: web3Constants.CONSTANTS.polygon.DECIMALS, reserves, token0, token1 })
    } else if (path.includes(web3Constants.CONSTANTS.polygon.USD)) {
      let token = new web3Tokens.Token({ blockchain: 'polygon', address: web3Constants.CONSTANTS.polygon.USD });
      let decimals = await token.decimals();
      return minReserveRequirements({ min: 1000, token: web3Constants.CONSTANTS.polygon.USD, decimals, reserves, token0, token1 })
    } else {
      return true 
    }
  };

  let findPath = async ({ tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.polygon.NATIVE) &&
      [tokenIn, tokenOut].includes(web3Constants.CONSTANTS.polygon.WRAPPED)
    ) { return }

    let path;
    if (await pathExists([tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.polygon.WRAPPED &&
      await pathExists([tokenIn, web3Constants.CONSTANTS.polygon.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.polygon.WRAPPED &&
      await pathExists([tokenOut, web3Constants.CONSTANTS.polygon.WRAPPED])
    ) {
      // path via WRAPPED
      path = [tokenIn, web3Constants.CONSTANTS.polygon.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.polygon.USD &&
      await pathExists([tokenIn, web3Constants.CONSTANTS.polygon.USD]) &&
      tokenOut != web3Constants.CONSTANTS.polygon.WRAPPED &&
      await pathExists([web3Constants.CONSTANTS.polygon.WRAPPED, tokenOut])
    ) {
      // path via tokenIn -> USD -> WRAPPED -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.polygon.USD, web3Constants.CONSTANTS.polygon.WRAPPED, tokenOut];
    } else if (
      tokenIn != web3Constants.CONSTANTS.polygon.WRAPPED &&
      await pathExists([tokenIn, web3Constants.CONSTANTS.polygon.WRAPPED]) &&
      tokenOut != web3Constants.CONSTANTS.polygon.USD &&
      await pathExists([web3Constants.CONSTANTS.polygon.USD, tokenOut])
    ) {
      // path via tokenIn -> WRAPPED -> USD -> tokenOut
      path = [tokenIn, web3Constants.CONSTANTS.polygon.WRAPPED, web3Constants.CONSTANTS.polygon.USD, tokenOut];
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == web3Constants.CONSTANTS.polygon.NATIVE) {
      path.splice(1, 0, web3Constants.CONSTANTS.polygon.WRAPPED);
    } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == web3Constants.CONSTANTS.polygon.NATIVE) {
      path.splice(path.length-1, 0, web3Constants.CONSTANTS.polygon.WRAPPED);
    }

    return path
  };

  let getAmountsOut = ({ path, amountIn, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'polygon',
        address: basics.contracts.router.address,
        method: 'getAmountsOut'
      },{
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

  let getAmountsIn = ({ path, amountOut, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: 'polygon',
        address: basics.contracts.router.address,
        method: 'getAmountsIn'
      },{
        api: basics.contracts.router.api,
        params: {
          amountOut: amountOut,
          path: fixPath(path),
        },
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
      amountIn = await getAmountsIn({ path, amountOut, tokenIn, tokenOut });
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
      amountIn = await getAmountsIn({ path, amountOut: amountOutMin, tokenIn, tokenOut });
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

    if (path[0] === web3Constants.CONSTANTS.polygon.NATIVE) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactETHForTokens';
        transaction.value = amountIn.toString();
        transaction.params = { amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapETHForExactTokens';
        transaction.value = amountInMax.toString();
        transaction.params = { amountOut: amountOut.toString() };
      }
    } else if (path[path.length - 1] === web3Constants.CONSTANTS.polygon.NATIVE) {
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
    Object.assign(basics, { route: route$1 })
  );

  let all = [
    uniswap_v2,
    pancakeswap,
    cryptoswap,
    quickswap,
  ];

  var findByName = (name) => {
    return all.find((exchange) => {
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
      all.map((exchange) => {
        if(exchange.blockchain !== blockchain) { return null }
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

  exports.all = all;
  exports.findByName = findByName;
  exports.route = route;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
