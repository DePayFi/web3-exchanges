(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ethers'), require('@depay/solana-web3.js'), require('@depay/web3-client-solana'), require('@depay/web3-tokens-solana'), require('@depay/web3-blockchains')) :
  typeof define === 'function' && define.amd ? define(['exports', 'ethers', '@depay/solana-web3.js', '@depay/web3-client-solana', '@depay/web3-tokens-solana', '@depay/web3-blockchains'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Exchanges = {}, global.ethers, global.SolanaWeb3js, global.Web3Client, global.Web3Tokens, global.Web3Blockchains));
}(this, (function (exports, ethers, solanaWeb3_js, web3ClientSolana, web3TokensSolana, Blockchains) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Blockchains__default = /*#__PURE__*/_interopDefaultLegacy(Blockchains);

  const LIQUIDITY_STATE_LAYOUT_V4 = solanaWeb3_js.struct([
    solanaWeb3_js.u64("status"),
    solanaWeb3_js.u64("nonce"),
    solanaWeb3_js.u64("maxOrder"),
    solanaWeb3_js.u64("depth"),
    solanaWeb3_js.u64("baseDecimal"),
    solanaWeb3_js.u64("quoteDecimal"),
    solanaWeb3_js.u64("state"),
    solanaWeb3_js.u64("resetFlag"),
    solanaWeb3_js.u64("minSize"),
    solanaWeb3_js.u64("volMaxCutRatio"),
    solanaWeb3_js.u64("amountWaveRatio"),
    solanaWeb3_js.u64("baseLotSize"),
    solanaWeb3_js.u64("quoteLotSize"),
    solanaWeb3_js.u64("minPriceMultiplier"),
    solanaWeb3_js.u64("maxPriceMultiplier"),
    solanaWeb3_js.u64("systemDecimalValue"),
    solanaWeb3_js.u64("minSeparateNumerator"),
    solanaWeb3_js.u64("minSeparateDenominator"),
    solanaWeb3_js.u64("tradeFeeNumerator"),
    solanaWeb3_js.u64("tradeFeeDenominator"),
    solanaWeb3_js.u64("pnlNumerator"),
    solanaWeb3_js.u64("pnlDenominator"),
    solanaWeb3_js.u64("swapFeeNumerator"),
    solanaWeb3_js.u64("swapFeeDenominator"),
    solanaWeb3_js.u64("baseNeedTakePnl"),
    solanaWeb3_js.u64("quoteNeedTakePnl"),
    solanaWeb3_js.u64("quoteTotalPnl"),
    solanaWeb3_js.u64("baseTotalPnl"),
    solanaWeb3_js.u128("quoteTotalDeposited"),
    solanaWeb3_js.u128("baseTotalDeposited"),
    solanaWeb3_js.u128("swapBaseInAmount"),
    solanaWeb3_js.u128("swapQuoteOutAmount"),
    solanaWeb3_js.u64("swapBase2QuoteFee"),
    solanaWeb3_js.u128("swapQuoteInAmount"),
    solanaWeb3_js.u128("swapBaseOutAmount"),
    solanaWeb3_js.u64("swapQuote2BaseFee"),
    // amm vault
    solanaWeb3_js.publicKey("baseVault"),
    solanaWeb3_js.publicKey("quoteVault"),
    // mint
    solanaWeb3_js.publicKey("baseMint"),
    solanaWeb3_js.publicKey("quoteMint"),
    solanaWeb3_js.publicKey("lpMint"),
    // market
    solanaWeb3_js.publicKey("openOrders"),
    solanaWeb3_js.publicKey("marketId"),
    solanaWeb3_js.publicKey("marketProgramId"),
    solanaWeb3_js.publicKey("targetOrders"),
    solanaWeb3_js.publicKey("withdrawQueue"),
    solanaWeb3_js.publicKey("lpVault"),
    solanaWeb3_js.publicKey("owner"),
    // true circulating supply without lock up
    solanaWeb3_js.u64("lpReserve"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 3, "padding"),
  ]);

  const POOL_INFO = solanaWeb3_js.struct([
    solanaWeb3_js.u8("instruction"),
    solanaWeb3_js.u8("simulateType"),
  ]);

  const MARKET_LAYOUT_V3 = solanaWeb3_js.struct([
    solanaWeb3_js.blob(5),
    solanaWeb3_js.blob(8), // accountFlagsLayout('accountFlags'),
    solanaWeb3_js.publicKey("ownAddress"),
    solanaWeb3_js.u64("vaultSignerNonce"),
    solanaWeb3_js.publicKey("baseMint"),
    solanaWeb3_js.publicKey("quoteMint"),
    solanaWeb3_js.publicKey("baseVault"),
    solanaWeb3_js.u64("baseDepositsTotal"),
    solanaWeb3_js.u64("baseFeesAccrued"),
    solanaWeb3_js.publicKey("quoteVault"),
    solanaWeb3_js.u64("quoteDepositsTotal"),
    solanaWeb3_js.u64("quoteFeesAccrued"),
    solanaWeb3_js.u64("quoteDustThreshold"),
    solanaWeb3_js.publicKey("requestQueue"),
    solanaWeb3_js.publicKey("eventQueue"),
    solanaWeb3_js.publicKey("bids"),
    solanaWeb3_js.publicKey("asks"),
    solanaWeb3_js.u64("baseLotSize"),
    solanaWeb3_js.u64("quoteLotSize"),
    solanaWeb3_js.u64("feeRateBps"),
    solanaWeb3_js.u64("referrerRebatesAccrued"),
    solanaWeb3_js.blob(7),
  ]);

  var basics = {
    blockchain: 'solana',
    name: 'raydium',
    alternativeNames: [],
    label: 'Raydium',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNi4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4wIiBpZD0ia2F0bWFuXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNjAwIDQ1MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAwIDQ1MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQ0KCS5zdDF7ZmlsbDp1cmwoI1NWR0lEXzAwMDAwMDk5NjIxNDI3ODc5NDI1NDQzODkwMDAwMDAxMjk5Nzc3ODIyNzkwMjc5MzE0Xyk7fQ0KCS5zdDJ7ZmlsbDp1cmwoI1NWR0lEXzAwMDAwMTgxODA0MDUxMjYwNjA1NDkxOTMwMDAwMDA5OTg4NDEyODAyMTYwMDU2MjI1Xyk7fQ0KCS5zdDN7ZmlsbDp1cmwoI1NWR0lEXzAwMDAwMDQ3MDMzMjgxMTM1MTk4MDAwMjYwMDAwMDAzMTIyNDk0Njg5NTA2Njk1MzU3Xyk7fQ0KPC9zdHlsZT4NCjxnPg0KCQ0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjU5MS40NDQxIiB5MT0iMjIyLjU0NDYiIHgyPSIyNTAuMTU1NCIgeTI9Ijg2LjA2NDEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTEyMC45NDQ5IDM3OS4zNjIyKSI+DQoJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3RDQ2OTUiLz4NCgkJPHN0b3AgIG9mZnNldD0iMC40ODk3IiBzdHlsZT0ic3RvcC1jb2xvcjojNDI2N0IwIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjAuNDg5OCIgc3R5bGU9InN0b3AtY29sb3I6IzQzNjhCMCIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNjBCRkJCIi8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDQ0LjEsMTc4Ljd2MTI5LjZMMzAwLDM5MS41bC0xNDQuMi04My4yVjE0MS44TDMwMCw1OC41bDExMC44LDY0bDE2LjctOS42TDMwMCwzOS4ybC0xNjAuOSw5Mi45djE4NS44DQoJCUwzMDAsNDEwLjhsMTYwLjktOTIuOVYxNjlMNDQ0LjEsMTc4Ljd6Ii8+DQoJDQoJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMDAwMDAwNTM1MzcwOTk5NTg1NjYzNDExNDAwMDAwMDkyNTE3MTczNzEyMzk2ODA0MTZfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjU4NC44NTUyIiB5MT0iMjM5LjAyMSIgeDI9IjI0My41NjY1IiB5Mj0iMTAyLjU0MDUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTEyMC45NDQ5IDM3OS4zNjIyKSI+DQoJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3RDQ2OTUiLz4NCgkJPHN0b3AgIG9mZnNldD0iMC40ODk3IiBzdHlsZT0ic3RvcC1jb2xvcjojNDI2N0IwIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjAuNDg5OCIgc3R5bGU9InN0b3AtY29sb3I6IzQzNjhCMCIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNjBCRkJCIi8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzAwMDAwMDUzNTM3MDk5OTU4NTY2MzQxMTQwMDAwMDA5MjUxNzE3MzcxMjM5NjgwNDE2Xyk7IiBkPSJNMjU5LjYsMzA4LjNoLTI0LjF2LTgwLjloODAuNA0KCQljNy42LTAuMSwxNC45LTMuMiwyMC4yLTguNmM1LjQtNS40LDguNC0xMi43LDguNC0yMC4zYzAtMy44LTAuNy03LjUtMi4xLTExYy0xLjUtMy41LTMuNi02LjYtNi4zLTkuMmMtMi42LTIuNy01LjgtNC44LTkuMi02LjMNCgkJYy0zLjUtMS41LTcuMi0yLjItMTEtMi4yaC04MC40di0yNC42SDMxNmMxNC4xLDAuMSwyNy42LDUuNywzNy41LDE1LjdjMTAsMTAsMTUuNiwyMy41LDE1LjcsMzcuNWMwLjEsMTAuOC0zLjIsMjEuMy05LjQsMzAuMQ0KCQljLTUuNyw4LjQtMTMuOCwxNS0yMy4yLDE5Yy05LjMsMy0xOSw0LjQtMjguOCw0LjNoLTQ4LjJMMjU5LjYsMzA4LjN6Ii8+DQoJDQoJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMDAwMDAwMDIzNDk4NDMwMDY3NzM4Mzg1NzAwMDAwMDE0NDYzNTY2MzI0NDUyMDM2MTlfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjYxOC45ODE0IiB5MT0iMTUzLjY4MzgiIHgyPSIyNzcuNjkyNiIgeTI9IjE3LjIwMzMiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTEyMC45NDQ5IDM3OS4zNjIyKSI+DQoJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3RDQ2OTUiLz4NCgkJPHN0b3AgIG9mZnNldD0iMC40ODk3IiBzdHlsZT0ic3RvcC1jb2xvcjojNDI2N0IwIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjAuNDg5OCIgc3R5bGU9InN0b3AtY29sb3I6IzQzNjhCMCIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNjBCRkJCIi8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzAwMDAwMDAyMzQ5ODQzMDA2NzczODM4NTcwMDAwMDAxNDQ2MzU2NjMyNDQ1MjAzNjE5Xyk7IiBkPSJNMzY4LjcsMzA2LjNoLTI4LjFsLTIxLjctMzcuOQ0KCQljOC42LTAuNSwxNy4xLTIuMywyNS4yLTUuMUwzNjguNywzMDYuM3oiLz4NCgkNCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8wMDAwMDE2OTUyMDEzODIyNDYzMjgxOTAzMDAwMDAxNTI5MzcyNzQyNjI3MTgxMjI1Ml8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNTgyLjU3MTEiIHkxPSIyNDQuNjYzNyIgeDI9IjI0MS4yODI0IiB5Mj0iMTA4LjE4MzMiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTEyMC45NDQ5IDM3OS4zNjIyKSI+DQoJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3RDQ2OTUiLz4NCgkJPHN0b3AgIG9mZnNldD0iMC40ODk3IiBzdHlsZT0ic3RvcC1jb2xvcjojNDI2N0IwIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjAuNDg5OCIgc3R5bGU9InN0b3AtY29sb3I6IzQzNjhCMCIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNjBCRkJCIi8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzAwMDAwMTY5NTIwMTM4MjI0NjMyODE5MDMwMDAwMDE1MjkzNzI3NDI2MjcxODEyMjUyXyk7IiBkPSJNNDI3LjMsMTUxLjdMNDQ0LDE2MWwxNi42LTkuMnYtMTkuNQ0KCQlsLTE2LjYtOS42bC0xNi42LDkuNlYxNTEuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K',
    pair: {
      v4: {
        address: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        api: LIQUIDITY_STATE_LAYOUT_V4,
        LIQUIDITY_FEES_NUMERATOR: ethers.ethers.BigNumber.from(25),
        LIQUIDITY_FEES_DENOMINATOR: ethers.ethers.BigNumber.from(10000),
      }
    },
    router: {
      v1: {
        address: 'routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS'
      }
    },
    market: {
      v3: {
        address: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
        api: MARKET_LAYOUT_V3
      }
    },
    slippage: true,
  };

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
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
      this.amountIn = _optionalChain$1([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
      this.amountOutMin = _optionalChain$1([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
      this.amountOut = _optionalChain$1([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
      this.amountInMax = _optionalChain$1([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
      this.exchange = exchange;
      this.getTransaction = getTransaction;
    }
  }

  let supported = ['solana'];
  supported.evm = [];
  supported.solana = ['solana'];

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

    const currentBlock = await web3ClientSolana.request({ blockchain: exchange.blockchain, method: 'latestBlockNumber' });

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

  const calculateAmountOutLessSlippage = async ({ exchange, fixedPath, amountOut, amountIn })=>{
    let defaultSlippage = getDefaultSlippage({ amountIn, amountOut });

    let newAmountOutWithoutDefaultSlippageBN = amountOut.sub(amountOut.mul(parseFloat(defaultSlippage)*100).div(10000));

    return newAmountOutWithoutDefaultSlippageBN
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
      } else if(supported.solana.includes(exchange.blockchain)){
        let amountsWithSlippage = [];
        await Promise.all(fixedPath.map((step, index)=>{
          if(index != 0) {
            let amountWithSlippage = calculateAmountInWithSlippage({ exchange, fixedPath: [fixedPath[index-1], fixedPath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
            amountWithSlippage.then((amount)=>amountsWithSlippage.push(amount));
            return amountWithSlippage
          }
        }));
        amountsWithSlippage.push(amounts[amounts.length-1]);
        amounts = amountsWithSlippage;
        amountIn = amountInMax = amounts[0];
      }
    } else if(amountInMaxInput || amountInInput) {
      if(supported.solana.includes(exchange.blockchain)){
        let amountsWithSlippage = [];
        await Promise.all(fixedPath.map((step, index)=>{
          if(index !== 0 && index < fixedPath.length-1) {
            amountsWithSlippage.unshift(amounts[index]);
          } else if(index === fixedPath.length-1) {
            let amountWithSlippage = calculateAmountOutLessSlippage({ exchange, fixedPath: [fixedPath[index-1], fixedPath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
            amountWithSlippage.then((amount)=>{
              amountsWithSlippage.unshift(amount);
              return amount
            });
            return amountWithSlippage
          }
        }));
        amountsWithSlippage.push(amounts[0]);
        amounts = amountsWithSlippage.slice().reverse();
        amountOut = amountOutMin = amounts[amounts.length-1];
      }
    }

    return({ amountIn, amountInMax, amountOut, amountOutMin, amounts })
  };

  const fixAddress = (address)=>{
    if(address.match('0x')) {
      return ethers.ethers.utils.getAddress(address)
    } else {
      return address
    }
  };

  let getAmount = async ({ amount, blockchain, address }) => {
    return await web3TokensSolana.Token.BigNumber({ amount, blockchain, address })
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
      pathExists,
      getAmounts,
      getTransaction,
      slippage,
      getPair,
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
      this.pathExists = pathExists;
      this.getAmounts = getAmounts;
      this.getTransaction = getTransaction;
      this.slippage = slippage;
      this.getPair = getPair;
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

  const INITIALIZED = 1;
  const SWAP = 6;

  let getAccounts = async (base, quote) => {
    let accounts = await web3ClientSolana.request(`solana://${basics.pair.v4.address}/getProgramAccounts`, {
      params: { filters: [
        { dataSize: basics.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: base }},
        { memcmp: { offset: 432, bytes: quote }}
      ]},
      api: basics.pair.v4.api,
      cache: 3600000,
    });
    return accounts
  };

  let getPairs = async(base, quote) => {
    try {
      let accounts = await getAccounts(base, quote);
      if(accounts.length == 0) { accounts = await getAccounts(quote, base); }
      return accounts
    } catch(e) {
      console.log(e);
      return []
    }
  };

  let getPair = async(base, quote) => {
    let accounts = await getPairs(base, quote);
    if(accounts.length == 1){ return accounts[0] }
    if(accounts.length < 1){ return null }
    let best = accounts.reduce((account, current) => {
      if(![INITIALIZED, SWAP].includes(current.data.status.toNumber())) { return }
      let currentReserve = current.data.lpReserve;
      let accountReserve = account.data.lpReserve;
      if(accountReserve.gte(currentReserve)) {
        return account
      } else {
        return current
      }
    });  
    return best
  };

  let anyPairs = async(base, quote) => {
    return (await getPairs(base, quote)).length > 0
  };

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  const blockchain$1 = Blockchains__default['default'].solana;
  const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

  // Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
  //
  // We keep 11111111111111111111111111111111 internally
  // to be able to differentiate between SOL<>Token and WSOL<>Token swaps
  // as they are not the same!
  //
  let fixPath = (path) => {
    if(!path) { return }
    let fixedPath = path.map((token, index) => {
      if (
        token === blockchain$1.currency.address && path[index+1] != blockchain$1.wrapped.address &&
        path[index-1] != blockchain$1.wrapped.address
      ) {
        return blockchain$1.wrapped.address
      } else {
        return token
      }
    });

    if(fixedPath[0] == blockchain$1.currency.address && fixedPath[1] == blockchain$1.wrapped.address) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == blockchain$1.currency.address && fixedPath[fixedPath.length-2] == blockchain$1.wrapped.address) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  let pathExists = async (path) => {
    if(path.length == 1) { return false }
    path = fixPath(path);
    if(await anyPairs(path[0], path[1]) || await anyPairs(path[1], path[0])) {
      return true
    } else {
      return false
    }
  };

  let findPath = async ({ tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(blockchain$1.currency.address) &&
      [tokenIn, tokenOut].includes(blockchain$1.wrapped.address)
    ) { return { path: undefined, fixedPath: undefined } }

    let path;
    if (await pathExists([tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != blockchain$1.wrapped.address &&
      tokenIn != blockchain$1.currency.address &&
      await pathExists([tokenIn, blockchain$1.wrapped.address]) &&
      tokenOut != blockchain$1.wrapped.address &&
      tokenOut != blockchain$1.currency.address &&
      await pathExists([tokenOut, blockchain$1.wrapped.address])
    ) {
      // path via blockchain.wrapped.address
      path = [tokenIn, blockchain$1.wrapped.address, tokenOut];
    } else if (
      tokenIn != USDC &&
      await pathExists([tokenIn, USDC]) &&
      tokenOut != USDC &&
      await pathExists([tokenOut, USDC])
    ) {
      // path via USDC
      path = [tokenIn, USDC, tokenOut];
    } else if (
      tokenIn != USDT &&
      await pathExists([tokenIn, USDT]) &&
      tokenOut != USDT &&
      await pathExists([tokenOut, USDT])
    ) {
      // path via USDT
      path = [tokenIn, USDT, tokenOut];
    }

    // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
    // because that actually reflects how things are routed in reality:
    if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$1.currency.address) {
      path.splice(1, 0, blockchain$1.wrapped.address);
    } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$1.currency.address) {
      path.splice(path.length-1, 0, blockchain$1.wrapped.address);
    }
    return { path, fixedPath: fixPath(path) }
  };

  const getMarket = async (marketId)=> {
    return await web3ClientSolana.request({
      blockchain: 'solana',
      address: marketId,
      api: basics.market.v3.api,
      cache: 3600000
    })
  };

  const getMarketAuthority = async (programId, marketId)=> {
    const seeds = [marketId.toBuffer()];

    let nonce = 0;
    let publicKey;

    while (nonce < 100) {
      try {
        // Buffer.alloc(7) nonce u64
        const seedsWithNonce = seeds.concat(solanaWeb3_js.Buffer.from([nonce]), solanaWeb3_js.Buffer.alloc(7));
        publicKey = await solanaWeb3_js.PublicKey.createProgramAddress(seedsWithNonce, programId);
      } catch (err) {
        if (err instanceof TypeError) { throw err }
        nonce++;
        continue
      }
      return publicKey
    }
  };

  const getInfo = async (pair)=>{
    const data = solanaWeb3_js.Buffer.alloc(POOL_INFO.span);
    POOL_INFO.encode({ instruction: 12, simulateType: 0 }, data);

    const market = await getMarket(pair.data.marketId.toString());
    const keys = [
      { pubkey: pair.pubkey, isWritable: false, isSigner: false },
      { pubkey: new solanaWeb3_js.PublicKey(basics.pair.v4.authority), isWritable: false, isSigner: false },
      { pubkey: pair.data.openOrders, isWritable: false, isSigner: false },
      { pubkey: pair.data.baseVault, isWritable: false, isSigner: false },
      { pubkey: pair.data.quoteVault, isWritable: false, isSigner: false },
      { pubkey: pair.data.lpMint, isWritable: false, isSigner: false },
      { pubkey: pair.data.marketId, isWritable: false, isSigner: false },
      { pubkey: market.eventQueue, isWritable: false, isSigner: false },
    ];

    const instruction = new solanaWeb3_js.TransactionInstruction({
      programId: new solanaWeb3_js.PublicKey(basics.pair.v4.address),
      keys,
      data,
    });

    const feePayer = new solanaWeb3_js.PublicKey("RaydiumSimuLateTransaction11111111111111111");

    let transaction = new solanaWeb3_js.Transaction({ feePayer });
    transaction.add(instruction);

    let result;
    const provider = await web3ClientSolana.getProvider('solana');
    try{ result = await provider.simulateTransaction(transaction); } catch (e) {}

    let info;
    if(result && result.value && result.value.logs) {
      let log = result.value.logs.find((log)=>log.match("GetPoolData:"));
      if(log) {
        info = JSON.parse(log.replace(/.*GetPoolData:\s/, ''));
      }
    }

    return info
  };

  let getAmountsOut = async ({ path, amountIn }) => {

    let amounts = [amountIn];  

    let computedAmounts = await Promise.all(path.map(async (step, i)=>{
      const nextStep = path[i+1];
      if(nextStep == undefined){ return }
      const pair = await getPair(step, nextStep);
      const info = await getInfo(pair);
      if(!info){ return }
      const baseMint = pair.data.baseMint.toString();
      const reserves = [ethers.ethers.BigNumber.from(info.pool_coin_amount.toString()), ethers.ethers.BigNumber.from(info.pool_pc_amount.toString())];
      const [reserveIn, reserveOut] = baseMint == step ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]];
      const feeRaw = amounts[i].mul(basics.pair.v4.LIQUIDITY_FEES_NUMERATOR).div(basics.pair.v4.LIQUIDITY_FEES_DENOMINATOR);
      const amountInWithFee = amounts[i].sub(feeRaw);
      const denominator = reserveIn.add(amountInWithFee);
      const amountOut = reserveOut.mul(amountInWithFee).div(denominator);
      amounts.push(amountOut);
    }));

    if(computedAmounts.length != path.length) { return }

    return amounts
  };

  let getAmountsIn = async({ path, amountOut }) => {

    path = path.slice().reverse();
    let amounts = [amountOut];
    
    let computedAmounts = await Promise.all(path.map(async (step, i)=>{
      const nextStep = path[i+1];
      if(nextStep == undefined){ return }
      const pair = await getPair(step, nextStep);
      const info = await getInfo(pair);
      if(!info){ return }
      pair.pubkey.toString();
      const baseMint = pair.data.baseMint.toString();
      pair.data.quoteMint.toString();
      const reserves = [ethers.ethers.BigNumber.from(info.pool_coin_amount.toString()), ethers.ethers.BigNumber.from(info.pool_pc_amount.toString())];
      const [reserveIn, reserveOut] = baseMint == step ? [reserves[1], reserves[0]] : [reserves[0], reserves[1]];
      const denominator = reserveOut.sub(amounts[i]);
      const amountInWithoutFee = reserveIn.mul(amounts[i]).div(denominator);
      const amountIn = amountInWithoutFee
        .mul(basics.pair.v4.LIQUIDITY_FEES_DENOMINATOR)
        .div(basics.pair.v4.LIQUIDITY_FEES_DENOMINATOR.sub(basics.pair.v4.LIQUIDITY_FEES_NUMERATOR));
      amounts.push(amountIn);
    }));

    if(computedAmounts.length != path.length) { return }

    return amounts.slice().reverse()
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
    path = fixPath(path);
    let amounts;
    if (amountOut) {
      amounts = await getAmountsIn({ path, amountOut, tokenIn, tokenOut });
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amounts = await getAmountsOut({ path, amountIn, tokenIn, tokenOut });
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amounts = await getAmountsIn({ path, amountOut: amountOutMin, tokenIn, tokenOut });
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amounts = await getAmountsOut({ path, amountIn: amountInMax, tokenIn, tokenOut });
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return {
      amountOut: (amountOut || amountOutMin),
      amountIn: (amountIn || amountInMax),
      amountInMax: (amountInMax || amountIn),
      amountOutMin: (amountOutMin || amountOut),
      amounts
    }
  };

  const blockchain = Blockchains__default['default'].solana;

  const getInstructionData = ({ pair, amountIn, amountOutMin, amountOut, amountInMax, fix })=> {
    let LAYOUT, data;
    
    if (fix === 'in') {
      LAYOUT = solanaWeb3_js.struct([solanaWeb3_js.u8("instruction"), solanaWeb3_js.u64("amountIn"), solanaWeb3_js.u64("minAmountOut")]);
      data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
      LAYOUT.encode(
        {
          instruction: 9,
          amountIn: new solanaWeb3_js.BN(amountIn.toString()),
          minAmountOut: new solanaWeb3_js.BN(amountOutMin.toString()),
        },
        data,
      );
    } else if (fix === 'out') {
      LAYOUT = solanaWeb3_js.struct([solanaWeb3_js.u8("instruction"), solanaWeb3_js.u64("maxAmountIn"), solanaWeb3_js.u64("amountOut")]);
      data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
      LAYOUT.encode(
        {
          instruction: 11,
          maxAmountIn: new solanaWeb3_js.BN(amountInMax.toString()),
          amountOut: new solanaWeb3_js.BN(amountOut.toString()),
        },
        data,
      );
    }

    return data
  };

  const getInstructionKeys = async ({ tokenIn, tokenInAccount, tokenOut, tokenOutAccount, pair, market, fromAddress })=> {

    if(!tokenInAccount) {
      tokenInAccount = await web3TokensSolana.Token.solana.findAccount({ owner: fromAddress, token: tokenIn });
    }
    if(!tokenInAccount) {
      tokenInAccount = await web3TokensSolana.Token.solana.findProgramAddress({ owner: fromAddress, token: tokenIn });
    }

    if(!tokenOutAccount) {
      tokenOutAccount = await web3TokensSolana.Token.solana.findAccount({ owner: fromAddress, token: tokenOut });
    }
    if(!tokenOutAccount) {
      tokenOutAccount = await web3TokensSolana.Token.solana.findProgramAddress({ owner: fromAddress, token: tokenOut });
    }

    let marketAuthority = await getMarketAuthority(pair.data.marketProgramId, pair.data.marketId);
    let keys = [
      // system
      { pubkey: new solanaWeb3_js.PublicKey(web3TokensSolana.Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // amm
      { pubkey: pair.pubkey, isWritable: true, isSigner: false },
      { pubkey: new solanaWeb3_js.PublicKey(basics.pair.v4.authority), isWritable: false, isSigner: false },
      { pubkey: pair.data.openOrders, isWritable: true, isSigner: false },
      { pubkey: pair.data.targetOrders, isWritable: true, isSigner: false },
      { pubkey: pair.data.baseVault, isWritable: true, isSigner: false },
      { pubkey: pair.data.quoteVault, isWritable: true, isSigner: false },
      // serum
      { pubkey: pair.data.marketProgramId, isWritable: false, isSigner: false },
      { pubkey: pair.data.marketId, isWritable: true, isSigner: false },
      { pubkey: market.bids, isWritable: true, isSigner: false },
      { pubkey: market.asks, isWritable: true, isSigner: false },
      { pubkey: market.eventQueue, isWritable: true, isSigner: false },
      { pubkey: market.baseVault, isWritable: true, isSigner: false },
      { pubkey: market.quoteVault, isWritable: true, isSigner: false },
      { pubkey: marketAuthority, isWritable: false, isSigner: false },
      // user
      { pubkey: new solanaWeb3_js.PublicKey(tokenInAccount), isWritable: true, isSigner: false },
      { pubkey: new solanaWeb3_js.PublicKey(tokenOutAccount), isWritable: true, isSigner: false },
      { pubkey: new solanaWeb3_js.PublicKey(fromAddress), isWritable: false, isSigner: true },
    ];
    return keys
  };

  const getTransaction = async ({
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
    fromAddress
  }) => {

    let transaction = { blockchain: 'solana' };
    let instructions = [];

    const fixedPath = fixPath(path);
    if(fixedPath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3!' }
    const tokenIn = fixedPath[0];
    const tokenMiddle = fixedPath.length == 3 ? fixedPath[1] : undefined;
    const tokenOut = fixedPath[fixedPath.length-1];

    let pairs, markets, amountMiddle;
    if(fixedPath.length == 2) {
      pairs = [await getPair(tokenIn, tokenOut)];
      markets = [await getMarket(pairs[0].data.marketId.toString())];
    } else {
      pairs = [await getPair(tokenIn, tokenMiddle), await getPair(tokenMiddle, tokenOut)];
      markets = [await getMarket(pairs[0].data.marketId.toString()), await getMarket(pairs[1].data.marketId.toString())];
      amountMiddle = amounts[1];
    }

    let startsWrapped = (path[0] === blockchain.currency.address && fixedPath[0] === blockchain.wrapped.address);
    let endsUnwrapped = (path[path.length-1] === blockchain.currency.address && fixedPath[fixedPath.length-1] === blockchain.wrapped.address);
    let wrappedAccount;
    const provider = await web3ClientSolana.getProvider('solana');
    if(startsWrapped || endsUnwrapped) {
      const rent = await provider.getMinimumBalanceForRentExemption(web3TokensSolana.Token.solana.TOKEN_LAYOUT.span);
      wrappedAccount = solanaWeb3_js.Keypair.generate().publicKey.toString();
      const lamports = startsWrapped ? new solanaWeb3_js.BN(amountIn.toString()).add(new solanaWeb3_js.BN(rent)) :  new solanaWeb3_js.BN(rent);
      instructions.push(
        solanaWeb3_js.SystemProgram.createAccount({
          fromPubkey: new solanaWeb3_js.PublicKey(fromAddress),
          newAccountPubkey: new solanaWeb3_js.PublicKey(wrappedAccount),
          programId: new solanaWeb3_js.PublicKey(web3TokensSolana.Token.solana.TOKEN_PROGRAM),
          space: web3TokensSolana.Token.solana.TOKEN_LAYOUT.span,
          lamports
        })
      );
      instructions.push(
        web3TokensSolana.Token.solana.initializeAccountInstruction({
          account: wrappedAccount,
          token: blockchain.wrapped.address,
          owner: fromAddress
        })
      );
    }

    let swapInstructions = await Promise.all(pairs.map(async (pair, index)=>{
      let market = markets[index];
      let stepTokenIn = tokenIn;
      let stepTokenOut = tokenOut;
      let stepAmountIn = amountIn || amountInMax;
      let stepAmountInMax = amountInMax || amountIn;
      let stepAmountOut = amountOut || amountOutMin;
      let stepAmountOutMin = amountOutMin || amountOut;
      let stepFix = (amountInInput || amountOutMinInput) ? 'in' : 'out';
      let stepTokenInAccount = startsWrapped ? wrappedAccount : undefined;
      let stepTokenOutAccount = endsUnwrapped ? wrappedAccount : undefined;
      if(pairs.length === 2 && index === 0) {
        stepTokenIn = tokenIn;
        stepTokenOut = tokenMiddle;
        stepAmountOut = stepAmountOutMin = amountMiddle;
        stepFix = 'out';
        if(wrappedAccount) { stepTokenOutAccount = wrappedAccount; }
      } else if(pairs.length === 2 && index === 1) {
        stepTokenIn = tokenMiddle;
        stepTokenOut = tokenOut;
        stepAmountIn = stepAmountInMax = amountMiddle;
        stepFix = 'in';
        if(wrappedAccount) { stepTokenInAccount = wrappedAccount; }
      }
      return(
        new solanaWeb3_js.TransactionInstruction({
          programId: new solanaWeb3_js.PublicKey(basics.pair.v4.address),
          keys: await getInstructionKeys({
            tokenIn: stepTokenIn,
            tokenInAccount: stepTokenInAccount,
            tokenOut: stepTokenOut,
            tokenOutAccount: stepTokenOutAccount,
            pair,
            market,
            fromAddress,
          }),
          data: getInstructionData({
            pair,
            amountIn: stepAmountIn,
            amountOutMin: stepAmountOutMin,
            amountOut: stepAmountOut,
            amountInMax: stepAmountInMax,
            fix: stepFix
          }),
        })
      )
    }));
    swapInstructions.forEach((instruction)=>instructions.push(instruction));
    
    if(startsWrapped || endsUnwrapped) {
      instructions.push(
        web3TokensSolana.Token.solana.closeAccountInstruction({
          account: wrappedAccount,
          owner: fromAddress
        })
      );
    }

    // // for DEBUGGING:
    // 
    // let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') })
    // console.log('instructions.length', instructions.length)
    // instructions.forEach((instruction)=>simulation.add(instruction))
    // let result
    // console.log('SIMULATE')
    // try{ result = await provider.simulateTransaction(simulation) } catch(e) { console.log('error', e) }
    // console.log('SIMULATION RESULT', result)
    // console.log('instructions.length', instructions.length)

    transaction.instructions = instructions;
    console.log('transaction.instructions[0]', transaction.instructions[0]);
    console.log('transaction.instructions[1]', transaction.instructions[0]);
    console.log('transaction.instructions[2]', transaction.instructions[2]);
    console.log('transaction.instructions[3]', transaction.instructions[3]);
    return transaction
  };

  var raydium = new Exchange(
    Object.assign(basics, {
      findPath,
      getPair,
      getAmounts,
      getTransaction,
    })
  );

  let all = {
    ethereum: [],
    bsc: [],
    polygon: [],
    solana: [raydium],
    velas: [],
    fantom: [],
  };

  var find = (blockchain, name) => {
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

  exports.all = all;
  exports.find = find;
  exports.route = route;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
