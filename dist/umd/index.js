(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@depay/solana-web3.js'), require('@depay/web3-client'), require('ethers'), require('@depay/web3-tokens'), require('@depay/web3-blockchains'), require('decimal.js')) :
  typeof define === 'function' && define.amd ? define(['exports', '@depay/solana-web3.js', '@depay/web3-client', 'ethers', '@depay/web3-tokens', '@depay/web3-blockchains', 'decimal.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Exchanges = {}, global.SolanaWeb3js, global.Web3Client, global.ethers, global.Web3Tokens, global.Web3Blockchains, global.Decimal));
}(this, (function (exports, solanaWeb3_js, web3Client, ethers, Token, Blockchains, Decimal) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Token__default = /*#__PURE__*/_interopDefaultLegacy(Token);
  var Blockchains__default = /*#__PURE__*/_interopDefaultLegacy(Blockchains);
  var Decimal__default = /*#__PURE__*/_interopDefaultLegacy(Decimal);

  const WHIRLPOOL_REWARD_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.publicKey("mint"),
    solanaWeb3_js.publicKey("vault"),
    solanaWeb3_js.publicKey("authority"),
    solanaWeb3_js.u128("emissionsPerSecondX64"),
    solanaWeb3_js.u128("growthGlobalX64"),
  ]);

  const WHIRLPOOL_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u64("anchorDiscriminator"),
    solanaWeb3_js.publicKey("whirlpoolsConfig"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 1, "whirlpoolBump"),
    solanaWeb3_js.u16("tickSpacing"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 2, "tickSpacingSeed"),
    solanaWeb3_js.u16("feeRate"),
    solanaWeb3_js.u16("protocolFeeRate"),
    solanaWeb3_js.u128("liquidity"),
    solanaWeb3_js.u128("sqrtPrice"),
    solanaWeb3_js.i32("tickCurrentIndex"),
    solanaWeb3_js.u64("protocolFeeOwedA"),
    solanaWeb3_js.u64("protocolFeeOwedB"),
    solanaWeb3_js.publicKey("tokenMintA"),
    solanaWeb3_js.publicKey("tokenVaultA"),
    solanaWeb3_js.u128("feeGrowthGlobalA"),
    solanaWeb3_js.publicKey("tokenMintB"),
    solanaWeb3_js.publicKey("tokenVaultB"),
    solanaWeb3_js.u128("feeGrowthGlobalB"),
    solanaWeb3_js.u64("rewardLastUpdatedTimestamp"),
    solanaWeb3_js.seq(WHIRLPOOL_REWARD_LAYOUT, 3, "rewardInfos"),
  ]);

  const TICK_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.bool("initialized"),
    solanaWeb3_js.i128("liquidityNet"),
    solanaWeb3_js.u128("liquidityGross"),
    solanaWeb3_js.u128("feeGrowthOutsideA"),
    solanaWeb3_js.u128("feeGrowthOutsideB"),
    solanaWeb3_js.seq(solanaWeb3_js.u128(), 3, "reward_growths_outside"),
  ]);

  const TICK_ARRAY_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u64("anchorDiscriminator"),
    solanaWeb3_js.i32("startTickIndex"),
    solanaWeb3_js.seq(TICK_LAYOUT, 88, "ticks"),
    solanaWeb3_js.publicKey("whirlpool"),
  ]);

  var basics = {
    blockchain: 'solana',
    name: 'orca',
    alternativeNames: [],
    label: 'Orca',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImthdG1hbl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNjAwIDQ1MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAwIDQ1MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjRkZEMTVDIiBkPSJNNDg4LjQsMjIyLjljMCwxMDMuOC04NC4xLDE4Ny45LTE4Ny45LDE4Ny45Yy0xMDMuOCwwLTE4Ny45LTg0LjEtMTg3LjktMTg3LjlDMTEyLjYsMTE5LjEsMTk2LjcsMzUsMzAwLjUsMzUKCUM0MDQuMiwzNSw0ODguNCwxMTkuMSw0ODguNCwyMjIuOXoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjE3LjY3NTUiIGQ9Ik0yMDkuNSwyOTkuOGMxLjYtMS4xLDMuMS0yLjgsMy45LTUuMWMwLjgtMi42LDAuMy00LjksMC02LjJjMCwwLDAtMC4xLDAtMC4xbDAuMy0xLjhjMC45LDAuNSwxLjksMS4xLDMsMS45CgljMC4zLDAuMiwwLjcsMC41LDEuMSwwLjdjMC41LDAuNCwxLjEsMC44LDEuNCwxYzAuNiwwLjQsMS41LDEsMi41LDEuNWMyNS4xLDE1LjYsNDUuOCwyMiw2Mi4yLDIxLjJjMTctMC44LDI4LjktOS40LDM1LjEtMjEuOQoJYzUuOS0xMi4xLDYuMi0yNywyLTQwLjljLTQuMi0xMy45LTEzLTI3LjUtMjYuMi0zNi45Yy0yMi4yLTE1LjgtNDIuNS0zOS44LTUyLjctNjAuM2MtNS4yLTEwLjQtNy4zLTE4LjctNi43LTI0LjIKCWMwLjMtMi41LDEtNC4xLDItNS4xYzAuOS0xLDIuNi0yLjEsNS45LTIuNmM2LjktMS4xLDE1LTMuNiwyMy4xLTYuMmMzLjItMSw2LjMtMiw5LjUtMi45YzExLjctMy40LDI0LjItNi4zLDM3LjItNi4zCgljMjUuMywwLDU1LDExLDg2LjMsNTYuOGM0MC4yLDU4LjgsMTguMSwxMjQuNC0yOC4yLDE1OC45Yy0yMy4xLDE3LjItNTEuOSwyNi4zLTgxLjUsMjIuOUMyNjIuOSwzNDEuMywyMzQuOSwzMjcuOSwyMDkuNSwyOTkuOHoKCSBNMjE0LjIsMjg0LjZDMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjcsMjE0LjIsMjg0LjZDMjE0LjEsMjg0LjcsMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjZ6IE0yMTEuNiwyODUuOAoJQzIxMS42LDI4NS44LDIxMS43LDI4NS44LDIxMS42LDI4NS44QzIxMS43LDI4NS44LDIxMS42LDI4NS44LDIxMS42LDI4NS44eiIvPgo8cGF0aCBkPSJNMjMyLjUsMTI0LjNjMCwwLDcxLjgtMTkuMSw4Ny41LTE5LjFjMTUuNywwLDc4LjYsMzAuNSw5Ni45LDg2LjNjMjYsNzktNDQuNywxMzAuOS01Mi43LDEyNS44CgljNzYuMS02Mi45LTQ4LjQtMTc5LjEtMTA5LjYtMTcwLjRjLTcuNiwxLjEtMy40LDcuNi0zLjQsNy42bC0xLjcsMTdsLTEyLjctMjEuMkwyMzIuNSwxMjQuM3oiLz4KPHBhdGggZD0iTTQwNi41LDE2Ny42YzIyLjcsMzkuOSwxOCwxNy4xLDEyLjksNjIuN2M5LjMtMTUuMSwyMy45LTMuOCwyOS45LDJjMS4xLDEsMi45LDAuNCwyLjgtMS4xYy0wLjItNi44LTIuMi0yMS40LTEzLjQtMzcuMQoJQzQyMy40LDE3Mi42LDQwNi41LDE2Ny42LDQwNi41LDE2Ny42eiIvPgo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC45OTMiIGQ9Ik00MTkuNCwyMzAuM2M1LTQ1LjYsOS43LTIyLjgtMTIuOS02Mi43YzAsMCwxNi45LDUsMzIuMywyNi41YzExLjIsMTUuNywxMy4xLDMwLjMsMTMuNCwzNy4xCgljMC4xLDEuNS0xLjcsMi4xLTIuOCwxLjFDNDQzLjMsMjI2LjUsNDI4LjcsMjE1LjMsNDE5LjQsMjMwLjN6IE00MTkuNCwyMzAuM2MwLjktMi4xLDIuMi01LjUsMi4yLTUuNSIvPgo8cGF0aCBkPSJNMjI0LDIyNC4yYy05LjYsMTYuMi0yOS4yLDE1LTI4LjgsMzQuM2MxNy41LDM5LDE3LjYsMzYuMiwxNy42LDM2LjJjMzIuNS0xOC4yLDE5LjEtNTguNSwxNC4zLTcwLjQKCUMyMjYuNiwyMjMsMjI0LjcsMjIzLDIyNCwyMjQuMnoiLz4KPHBhdGggZD0iTTE1MC40LDI2MC4xYzE4LjcsMi40LDI5LjgtMTMuOCw0NC44LTEuNmMxOS45LDM3LjgsMTcuNiwzNi4yLDE3LjYsMzYuMmMtMzQuNCwxNC40LTU3LjktMjEtNjQuMy0zMi4xCglDMTQ3LjgsMjYxLjMsMTQ5LDI1OS45LDE1MC40LDI2MC4xeiIvPgo8cGF0aCBkPSJNMzA2LjksMjM2YzAsMCwxOC43LDE5LjEsOC45LDIyLjFjLTEyLjItNy41LTM0LTEuNy00NC43LDEuOWMtMi42LDAuOS01LjItMS40LTQuMy00LjFjMy42LTEwLDEyLjYtMjguNiwyOS45LTMxCglDMzA2LjksMjIyLjQsMzA2LjksMjM2LDMwNi45LDIzNnoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTMxOC4zLDE0Mi41Yy0yLjEtMy02LjQtMTEsNi44LTExYzEzLjIsMCwzMy4zLDE0LjksMzcuNCwyMC40Yy0xLjMsMy40LTkuOCw0LjEtMTQsMy44Yy00LjItMC4zLTExLjUtMS0xNy0zLjgKCUMzMjYsMTQ5LjIsMzIwLjUsMTQ1LjUsMzE4LjMsMTQyLjV6Ii8+Cjwvc3ZnPgo=',
    router: {
      v1: {
        address: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
        api: WHIRLPOOL_LAYOUT,
      },
    },
    slippage: true,
  };

  function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
    constructor({
      tokenIn,
      tokenOut,
      path,
      pools,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      exchange,
      approvalRequired,
      getApproval,
      getTransaction,
    }) {
      this.tokenIn = tokenIn;
      this.tokenOut = tokenOut;
      this.path = path;
      this.pools = pools;
      this.amountIn = _optionalChain$3([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
      this.amountOutMin = _optionalChain$3([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
      this.amountOut = _optionalChain$3([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
      this.amountInMax = _optionalChain$3([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
      this.exchange = exchange;
      this.getTransaction = getTransaction;
    }
  }

  let supported = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism'];
  supported.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism'];
  supported.solana = ['solana'];

  const DEFAULT_SLIPPAGE = '0.5'; // percent

  const getDefaultSlippage = ({ amountIn, amountOut })=>{
    return DEFAULT_SLIPPAGE
  };

  const calculateAmountInWithSlippage = async ({ exchange, blockchain, pools, fixedPath, amountIn, amountOut })=>{

    let defaultSlippage = getDefaultSlippage({ amountIn, amountOut });

    let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000));

    if(!supported.evm.includes(exchange.blockchain || blockchain)) { 
      return newAmountInWithDefaultSlippageBN
    }

    const currentBlock = await web3Client.request({ blockchain: (exchange.blockchain || blockchain), method: 'latestBlockNumber' });

    let blocks = [];
    for(var i = 0; i <= 2; i++){
      blocks.push(currentBlock-i);
    }

    const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
      let { amountIn } = await exchange.getAmounts({
        blockchain,
        path: fixedPath,
        pools,
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
    blockchain,
    pools,
    fixedPath,
    amounts,
    tokenIn, tokenOut,
    amountIn, amountInMax, amountOut, amountOutMin,
    amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
  })=>{
    if(amountOutMinInput || amountOutInput) {
      if(supported.evm.includes(exchange.blockchain || blockchain)) {
        amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, blockchain, pools, fixedPath, amountIn, amountOut: (amountOutMinInput || amountOut) });
      } else if(supported.solana.includes(exchange.blockchain || blockchain)){
        let amountsWithSlippage = [];
        await Promise.all(fixedPath.map((step, index)=>{
          if(index != 0) {
            let amountWithSlippage = calculateAmountInWithSlippage({ exchange, pools, fixedPath: [fixedPath[index-1], fixedPath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
            amountWithSlippage.then((amount)=>amountsWithSlippage.push(amount));
            return amountWithSlippage
          }
        }));
        amountsWithSlippage.push(amounts[amounts.length-1]);
        amounts = amountsWithSlippage;
        amountIn = amountInMax = amounts[0];
      }
    } else if(amountInMaxInput || amountInInput) {
      if(supported.solana.includes(exchange.blockchain || blockchain)){
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
    return await Token__default['default'].BigNumber({ amount, blockchain, address })
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
    blockchain,
    exchange,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
    amountOutMax,
    amountInMin,
  }) => {
    if(blockchain === undefined && exchange.blockchains != undefined) {
      throw 'You need to provide a blockchain when calling route on an exchange that supports multiple blockchains!'
    }

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
    blockchain,
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

    if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length > 1) { throw('You can only pass one: amountIn, amountOut, amountInMax or amountOutMin') }
    if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length < 1) { throw('You need to pass exactly one: amountIn, amountOut, amountInMax or amountOutMin') }

    return new Promise(async (resolve)=> {
      let { path, fixedPath, pools } = await findPath({ blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin });
      if (path === undefined || path.length == 0) { return resolve() }
      let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

      let amounts; // includes intermediary amounts for longer routes
      ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await getAmounts({ blockchain, path, pools, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
      if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

      if(slippage || exchange.slippage) {
        ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
          exchange,
          blockchain,
          pools,
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
          pools,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          exchange,
          getTransaction: async ({ from })=> await getTransaction({
            exchange,
            blockchain,
            pools,
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
    constructor(...args) {
      Object.assign(this, ...args);
    }

    async route({
      blockchain,
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
        blockchain,
        exchange: this,
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
          blockchain: blockchain || this.blockchain,
          exchange: this,
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          amountInMax,
          amountOutMin,
        }),
        blockchain,
        findPath: this.findPath,
        getAmounts: this.getAmounts,
        getTransaction: this.getTransaction,
        slippage: this.slippage,
      })
    }
  }

  const MAX_SQRT_PRICE = "79226673515401279992447579055";
  const MIN_SQRT_PRICE = "4295048016";
  const BIT_PRECISION = 14;
  const LOG_B_2_X32 = "59543866431248";
  const LOG_B_P_ERR_MARGIN_LOWER_X64 = "184467440737095516";
  const LOG_B_P_ERR_MARGIN_UPPER_X64 = "15793534762490258745";

  const toX64 = (num) => {
    return new solanaWeb3_js.BN(num.mul(Decimal__default['default'].pow(2, 64)).floor().toFixed());
  };

  const fromX64 = (num) => {
    return new Decimal__default['default'](num.toString()).mul(Decimal__default['default'].pow(2, -64));
  };

  const getInitializableTickIndex = (tickIndex, tickSpacing) => {
    return tickIndex - (tickIndex % tickSpacing)
  };

  const invertTick = (tick) => {
    return -tick
  };

  /**
   * A collection of utility functions to convert between price, tickIndex and sqrtPrice.
   *
   * @category Whirlpool Utils
   */
  class PriceMath {

    static priceToSqrtPriceX64(price, decimalsA, decimalsB) {
      return toX64(price.mul(Decimal__default['default'].pow(10, decimalsB - decimalsA)).sqrt());
    }

    static sqrtPriceX64ToPrice(
      sqrtPriceX64,
      decimalsA,
      decimalsB
    ) {
      return fromX64(sqrtPriceX64)
        .pow(2)
        .mul(Decimal__default['default'].pow(10, decimalsA - decimalsB));
    }

    /**
     * @param tickIndex
     * @returns
     */
    static tickIndexToSqrtPriceX64(tickIndex) {
      if (tickIndex > 0) {
        return new solanaWeb3_js.BN(tickIndexToSqrtPricePositive(tickIndex));
      } else {
        return new solanaWeb3_js.BN(tickIndexToSqrtPriceNegative(tickIndex));
      }
    }

    /**
     *
     * @param sqrtPriceX64
     * @returns
     */
    static sqrtPriceX64ToTickIndex(sqrtPriceX64) {
      if (sqrtPriceX64.gt(new solanaWeb3_js.BN(MAX_SQRT_PRICE)) || sqrtPriceX64.lt(new solanaWeb3_js.BN(MIN_SQRT_PRICE))) {
        throw new Error("Provided sqrtPrice is not within the supported sqrtPrice range.");
      }

      const msb = sqrtPriceX64.bitLength() - 1;
      const adjustedMsb = new solanaWeb3_js.BN(msb - 64);
      const log2pIntegerX32 = signedShiftLeft(adjustedMsb, 32, 128);

      let bit = new solanaWeb3_js.BN("8000000000000000", "hex");
      let precision = 0;
      let log2pFractionX64 = new solanaWeb3_js.BN(0);

      let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);

      while (bit.gt(new solanaWeb3_js.BN(0)) && precision < BIT_PRECISION) {
        r = r.mul(r);
        let rMoreThanTwo = r.shrn(127);
        r = r.shrn(63 + rMoreThanTwo.toNumber());
        log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
        bit = bit.shrn(1);
        precision += 1;
      }

      const log2pFractionX32 = log2pFractionX64.shrn(32);

      const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
      const logbpX64 = log2pX32.mul(new solanaWeb3_js.BN(LOG_B_2_X32));

      const tickLow = signedShiftRight(
        logbpX64.sub(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_LOWER_X64)),
        64,
        128
      ).toNumber();
      const tickHigh = signedShiftRight(
        logbpX64.add(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_UPPER_X64)),
        64,
        128
      ).toNumber();

      if (tickLow == tickHigh) {
        return tickLow;
      } else {
        const derivedTickHighSqrtPriceX64 = PriceMath.tickIndexToSqrtPriceX64(tickHigh);
        if (derivedTickHighSqrtPriceX64.lte(sqrtPriceX64)) {
          return tickHigh;
        } else {
          return tickLow;
        }
      }
    }

    static tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
      return PriceMath.sqrtPriceX64ToPrice(
        PriceMath.tickIndexToSqrtPriceX64(tickIndex),
        decimalsA,
        decimalsB
      );
    }

    static priceToTickIndex(price, decimalsA, decimalsB) {
      return PriceMath.sqrtPriceX64ToTickIndex(
        PriceMath.priceToSqrtPriceX64(price, decimalsA, decimalsB)
      );
    }

    static priceToInitializableTickIndex(
      price,
      decimalsA,
      decimalsB,
      tickSpacing
    ) {
      return getInitializableTickIndex(
        PriceMath.priceToTickIndex(price, decimalsA, decimalsB),
        tickSpacing
      );
    }

    /**
     * Utility to invert the price Pb/Pa to Pa/Pb
     * @param price Pb / Pa
     * @param decimalsA Decimals of original token A (i.e. token A in the given Pb / Pa price)
     * @param decimalsB Decimals of original token B (i.e. token B in the given Pb / Pa price)
     * @returns inverted price, i.e. Pa / Pb
     */
    static invertPrice(price, decimalsA, decimalsB) {
      const tick = PriceMath.priceToTickIndex(price, decimalsA, decimalsB);
      const invTick = invertTick(tick);
      return PriceMath.tickIndexToPrice(invTick, decimalsB, decimalsA);
    }

    /**
     * Utility to invert the sqrtPriceX64 from X64 repr. of sqrt(Pb/Pa) to X64 repr. of sqrt(Pa/Pb)
     * @param sqrtPriceX64 X64 representation of sqrt(Pb / Pa)
     * @returns inverted sqrtPriceX64, i.e. X64 representation of sqrt(Pa / Pb)
     */
    static invertSqrtPriceX64(sqrtPriceX64) {
      const tick = PriceMath.sqrtPriceX64ToTickIndex(sqrtPriceX64);
      const invTick = invertTick(tick);
      return PriceMath.tickIndexToSqrtPriceX64(invTick);
    }
  }

  // Private Functions

  function tickIndexToSqrtPricePositive(tick) {
    let ratio;

    if ((tick & 1) != 0) {
      ratio = new solanaWeb3_js.BN("79232123823359799118286999567");
    } else {
      ratio = new solanaWeb3_js.BN("79228162514264337593543950336");
    }

    if ((tick & 2) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79236085330515764027303304731")), 96, 256);
    }
    if ((tick & 4) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79244008939048815603706035061")), 96, 256);
    }
    if ((tick & 8) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79259858533276714757314932305")), 96, 256);
    }
    if ((tick & 16) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79291567232598584799939703904")), 96, 256);
    }
    if ((tick & 32) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79355022692464371645785046466")), 96, 256);
    }
    if ((tick & 64) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79482085999252804386437311141")), 96, 256);
    }
    if ((tick & 128) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79736823300114093921829183326")), 96, 256);
    }
    if ((tick & 256) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("80248749790819932309965073892")), 96, 256);
    }
    if ((tick & 512) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("81282483887344747381513967011")), 96, 256);
    }
    if ((tick & 1024) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("83390072131320151908154831281")), 96, 256);
    }
    if ((tick & 2048) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("87770609709833776024991924138")), 96, 256);
    }
    if ((tick & 4096) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("97234110755111693312479820773")), 96, 256);
    }
    if ((tick & 8192) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("119332217159966728226237229890")), 96, 256);
    }
    if ((tick & 16384) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("179736315981702064433883588727")), 96, 256);
    }
    if ((tick & 32768) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("407748233172238350107850275304")), 96, 256);
    }
    if ((tick & 65536) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("2098478828474011932436660412517")), 96, 256);
    }
    if ((tick & 131072) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("55581415166113811149459800483533")), 96, 256);
    }
    if ((tick & 262144) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("38992368544603139932233054999993551")), 96, 256);
    }

    return signedShiftRight(ratio, 32, 256);
  }

  function tickIndexToSqrtPriceNegative(tickIndex) {
    let tick = Math.abs(tickIndex);
    let ratio;

    if ((tick & 1) != 0) {
      ratio = new solanaWeb3_js.BN("18445821805675392311");
    } else {
      ratio = new solanaWeb3_js.BN("18446744073709551616");
    }

    if ((tick & 2) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18444899583751176498")), 64, 256);
    }
    if ((tick & 4) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18443055278223354162")), 64, 256);
    }
    if ((tick & 8) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18439367220385604838")), 64, 256);
    }
    if ((tick & 16) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18431993317065449817")), 64, 256);
    }
    if ((tick & 32) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18417254355718160513")), 64, 256);
    }
    if ((tick & 64) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18387811781193591352")), 64, 256);
    }
    if ((tick & 128) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18329067761203520168")), 64, 256);
    }
    if ((tick & 256) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18212142134806087854")), 64, 256);
    }
    if ((tick & 512) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("17980523815641551639")), 64, 256);
    }
    if ((tick & 1024) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("17526086738831147013")), 64, 256);
    }
    if ((tick & 2048) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("16651378430235024244")), 64, 256);
    }
    if ((tick & 4096) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("15030750278693429944")), 64, 256);
    }
    if ((tick & 8192) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("12247334978882834399")), 64, 256);
    }
    if ((tick & 16384) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("8131365268884726200")), 64, 256);
    }
    if ((tick & 32768) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("3584323654723342297")), 64, 256);
    }
    if ((tick & 65536) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("696457651847595233")), 64, 256);
    }
    if ((tick & 131072) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("26294789957452057")), 64, 256);
    }
    if ((tick & 262144) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("37481735321082")), 64, 256);
    }

    return ratio;
  }

  function signedShiftLeft(n0, shiftBy, bitWidth) {
    let twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
    twosN0.imaskn(bitWidth + 1);
    return twosN0.fromTwos(bitWidth);
  }

  function signedShiftRight(n0, shiftBy, bitWidth) {
    let twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
    twoN0.imaskn(bitWidth - shiftBy + 1);
    return twoN0.fromTwos(bitWidth - shiftBy);
  }

  const PROTOCOL_FEE_RATE_MUL_VALUE = new solanaWeb3_js.BN(10000);
  const FEE_RATE_MUL_VALUE = new solanaWeb3_js.BN(1000000);
  const ZERO = new solanaWeb3_js.BN(0);
  const ONE = new solanaWeb3_js.BN(1);
  const TWO = new solanaWeb3_js.BN(2);
  const U64_MAX = TWO.pow(new solanaWeb3_js.BN(64)).sub(ONE);

  const fromX64_BN = (num)=>{
    return num.div(new solanaWeb3_js.BN(2).pow(new solanaWeb3_js.BN(64)))
  };

  class u64 extends solanaWeb3_js.BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
      const a = super.toArray().reverse();
      const b = buffer.Buffer.from(a);

      if (b.length === 8) {
        return b;
      }

      assert__default['default'](b.length < 8, 'u64 too large');
      const zeroPad = buffer.Buffer.alloc(8);
      b.copy(zeroPad);
      return zeroPad;
    }
    /**
     * Construct a u64 from Buffer representation
     */


    static fromBuffer(buffer) {
      assert__default['default'](buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
      return new u64([...buffer].reverse().map(i => `00${i.toString(16)}`.slice(-2)).join(''), 16);
    }

  }

  class BitMath {

    static mul(n0, n1, limit) {
      const result = n0.mul(n1);
      if (this.isOverLimit(result, limit)) {
        throw new Error(
          `Mul result higher than u${limit}`
        );
      }
      return result;
    }

    static mulDiv(n0, n1, d, limit) {
      return this.mulDivRoundUpIf(n0, n1, d, false, limit);
    }

    static mulDivRoundUp(n0, n1, d, limit) {
      return this.mulDivRoundUpIf(n0, n1, d, true, limit);
    }

    static mulDivRoundUpIf(n0, n1, d, roundUp, limit) {
      if (d.eq(ZERO)) {
        throw new Error("mulDiv denominator is zero");
      }

      const p = this.mul(n0, n1, limit);
      const n = p.div(d);

      return roundUp && p.mod(d).gt(ZERO) ? n.add(ONE) : n;
    }

    static checked_mul_shift_right(n0, n1, limit) {
      return this.checked_mul_shift_right_round_up_if(n0, n1, false, limit);
    }

    static checked_mul_shift_right_round_up_if(n0, n1, roundUp, limit) {
      if (n0.eq(ZERO) || n1.eq(ZERO)) {
        return ZERO;
      }

      const p = this.mul(n0, n1, limit);
      if (this.isOverLimit(p, limit)) {
        throw new Error(
          `MulShiftRight overflowed u${limit}.`
        );
      }
      const result = fromX64_BN(p);
      const shouldRound = roundUp && result.and(U64_MAX).gt(ZERO);
      if (shouldRound && result.eq(U64_MAX)) {
        throw new Error(
          `MulShiftRight overflowed u${limit}.`
        );
      }

      return shouldRound ? result.add(ONE) : result;
    }

    static isOverLimit(n0, limit) {
      const limitBN = TWO.pow(new solanaWeb3_js.BN(limit)).sub(ONE);
      return n0.gt(limitBN);
    }

    static divRoundUp(n, d) {
      return this.divRoundUpIf(n, d, true);
    }

    static divRoundUpIf(n, d, roundUp) {
      if (d.eq(ZERO)) {
        throw new Error("divRoundUpIf - divide by zero");
      }

      let q = n.div(d);

      return roundUp && n.mod(d).gt(ZERO) ? q.add(ONE) : q;
    }
  }

  const getNextSqrtPriceFromBRoundDown = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput
  ) => {
    let amountX64 = amount.shln(64);

    let delta = BitMath.divRoundUpIf(amountX64, currLiquidity, !amountSpecifiedIsInput);

    if (amountSpecifiedIsInput) {
      sqrtPrice = sqrtPrice.add(delta);
    } else {
      sqrtPrice = sqrtPrice.sub(delta);
    }

    return sqrtPrice;
  };

  const getNextSqrtPriceFromARoundUp = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput
  ) => {
    if (amount.eq(ZERO)) {
      return sqrtPrice;
    }

    let p = BitMath.mul(sqrtPrice, amount, 256);
    let numerator = BitMath.mul(currLiquidity, sqrtPrice, 256).shln(64);
    if (BitMath.isOverLimit(numerator, 256)) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - numerator overflow u256"
      );
    }

    let currLiquidityShiftLeft = currLiquidity.shln(64);
    if (!amountSpecifiedIsInput && currLiquidityShiftLeft.lte(p)) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - Unable to divide currLiquidityX64 by product"
      );
    }

    let denominator = amountSpecifiedIsInput
      ? currLiquidityShiftLeft.add(p)
      : currLiquidityShiftLeft.sub(p);

    let price = BitMath.divRoundUp(numerator, denominator);

    if (price.lt(new solanaWeb3_js.BN(MIN_SQRT_PRICE))) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - price less than min sqrt price"
      );
    } else if (price.gt(new solanaWeb3_js.BN(MAX_SQRT_PRICE))) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - price less than max sqrt price"
      );
    }

    return price;
  };

  const getNextSqrtPrices = (nextTick, sqrtPriceLimit, aToB) => {
    const nextTickPrice = PriceMath.tickIndexToSqrtPriceX64(nextTick);
    const nextSqrtPriceLimit = aToB ? solanaWeb3_js.BN.max(sqrtPriceLimit, nextTickPrice) : solanaWeb3_js.BN.min(sqrtPriceLimit, nextTickPrice);
    return { nextTickPrice, nextSqrtPriceLimit }
  };

  const toIncreasingPriceOrder = (sqrtPrice0, sqrtPrice1) => {
    if (sqrtPrice0.gt(sqrtPrice1)) {
      return [sqrtPrice1, sqrtPrice0];
    } else {
      return [sqrtPrice0, sqrtPrice1];
    }
  };

  const getAmountDeltaA = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    roundUp
  ) => {
    let [sqrtPriceLower, sqrtPriceUpper] = toIncreasingPriceOrder(currSqrtPrice, targetSqrtPrice);
    let sqrtPriceDiff = sqrtPriceUpper.sub(sqrtPriceLower);

    let numerator = currLiquidity.mul(sqrtPriceDiff).shln(64);
    let denominator = sqrtPriceLower.mul(sqrtPriceUpper);

    let quotient = numerator.div(denominator);
    let remainder = numerator.mod(denominator);

    let result = roundUp && !remainder.eq(ZERO) ? quotient.add(ONE) : quotient;

    if (result.gt(U64_MAX)) {
      throw new Error("Results larger than U64");
    }

    return result;
  };

  const getAmountDeltaB = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    roundUp
  ) => {
    let [sqrtPriceLower, sqrtPriceUpper] = toIncreasingPriceOrder(currSqrtPrice, targetSqrtPrice);
    let sqrtPriceDiff = sqrtPriceUpper.sub(sqrtPriceLower);
    return BitMath.checked_mul_shift_right_round_up_if(currLiquidity, sqrtPriceDiff, roundUp, 128);
  };

  const getNextSqrtPrice = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (amountSpecifiedIsInput === aToB) {
      return getNextSqrtPriceFromARoundUp(sqrtPrice, currLiquidity, amount, amountSpecifiedIsInput);
    } else {
      return getNextSqrtPriceFromBRoundDown(sqrtPrice, currLiquidity, amount, amountSpecifiedIsInput);
    }
  };

  const getAmountUnfixedDelta = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (aToB === amountSpecifiedIsInput) {
      return getAmountDeltaB(currSqrtPrice, targetSqrtPrice, currLiquidity, !amountSpecifiedIsInput)
    } else {
      return getAmountDeltaA(currSqrtPrice, targetSqrtPrice, currLiquidity, !amountSpecifiedIsInput)
    }
  };

  const getAmountFixedDelta = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (aToB === amountSpecifiedIsInput) {
      return getAmountDeltaA(currSqrtPrice, targetSqrtPrice, currLiquidity, amountSpecifiedIsInput)
    } else {
      return getAmountDeltaB(currSqrtPrice, targetSqrtPrice, currLiquidity, amountSpecifiedIsInput)
    }
  };

  const computeSwapStep = (
    amountRemaining,
    feeRate,
    currLiquidity,
    currSqrtPrice,
    targetSqrtPrice,
    amountSpecifiedIsInput,
    aToB
  ) => {
    let amountFixedDelta = getAmountFixedDelta(
      currSqrtPrice,
      targetSqrtPrice,
      currLiquidity,
      amountSpecifiedIsInput,
      aToB
    );

    let amountCalc = amountRemaining;
    if (amountSpecifiedIsInput) {
      const result = BitMath.mulDiv(
        amountRemaining,
        FEE_RATE_MUL_VALUE.sub(new solanaWeb3_js.BN(feeRate)),
        FEE_RATE_MUL_VALUE,
        128
      );
      amountCalc = result;
    }

    let nextSqrtPrice = amountCalc.gte(amountFixedDelta)
      ? targetSqrtPrice
      : getNextSqrtPrice(currSqrtPrice, currLiquidity, amountCalc, amountSpecifiedIsInput, aToB);

    let isMaxSwap = nextSqrtPrice.eq(targetSqrtPrice);

    let amountUnfixedDelta = getAmountUnfixedDelta(
      currSqrtPrice,
      nextSqrtPrice,
      currLiquidity,
      amountSpecifiedIsInput,
      aToB
    );

    if (!isMaxSwap) {
      amountFixedDelta = getAmountFixedDelta(
        currSqrtPrice,
        nextSqrtPrice,
        currLiquidity,
        amountSpecifiedIsInput,
        aToB
      );
    }

    let amountIn = amountSpecifiedIsInput ? amountFixedDelta : amountUnfixedDelta;
    let amountOut = amountSpecifiedIsInput ? amountUnfixedDelta : amountFixedDelta;

    if (!amountSpecifiedIsInput && amountOut.gt(amountRemaining)) {
      amountOut = amountRemaining;
    }

    let feeAmount;
    if (amountSpecifiedIsInput && !isMaxSwap) {
      feeAmount = amountRemaining.sub(amountIn);
    } else {
      const feeRateBN = new solanaWeb3_js.BN(feeRate);
      feeAmount = BitMath.mulDivRoundUp(amountIn, feeRateBN, FEE_RATE_MUL_VALUE.sub(feeRateBN), 128);
    }

    return {
      amountIn,
      amountOut,
      nextPrice: nextSqrtPrice,
      feeAmount,
    };
  };

  const calculateNextLiquidity = (tickNetLiquidity, currLiquidity, aToB) => {
    return aToB ? currLiquidity.sub(tickNetLiquidity) : currLiquidity.add(tickNetLiquidity);
  };

  const calculateProtocolFee = (globalFee, protocolFeeRate) => {
    return globalFee.mul(new u64(protocolFeeRate).div(PROTOCOL_FEE_RATE_MUL_VALUE));
  };

  const calculateFees = (
    feeAmount,
    protocolFeeRate,
    currLiquidity,
    currProtocolFee,
    currFeeGrowthGlobalInput
  ) => {
    let nextProtocolFee = currProtocolFee;
    let nextFeeGrowthGlobalInput = currFeeGrowthGlobalInput;
    let globalFee = feeAmount;

    if (protocolFeeRate > 0) {
      let delta = calculateProtocolFee(globalFee, protocolFeeRate);
      globalFee = globalFee.sub(delta);
      nextProtocolFee = nextProtocolFee.add(currProtocolFee);
    }

    if (currLiquidity.gt(ZERO)) {
      const globalFeeIncrement = globalFee.shln(64).div(currLiquidity);
      nextFeeGrowthGlobalInput = nextFeeGrowthGlobalInput.add(globalFeeIncrement);
    }

    return {
      nextProtocolFee,
      nextFeeGrowthGlobalInput,
    };
  };

  const compute = ({
    tokenAmount,
    aToB,
    freshWhirlpoolData,
    tickSequence,
    sqrtPriceLimit,
    amountSpecifiedIsInput,
  })=> {
    
    let amountRemaining = tokenAmount;
    let amountCalculated = ZERO;
    let currSqrtPrice = freshWhirlpoolData.sqrtPrice;
    let currLiquidity = freshWhirlpoolData.liquidity;
    let currTickIndex = freshWhirlpoolData.tickCurrentIndex;
    let totalFeeAmount = ZERO;
    const feeRate = freshWhirlpoolData.feeRate;
    const protocolFeeRate = freshWhirlpoolData.protocolFeeRate;
    let currProtocolFee = new u64(0);
    let currFeeGrowthGlobalInput = aToB ? freshWhirlpoolData.feeGrowthGlobalA : freshWhirlpoolData.feeGrowthGlobalB;

    while (amountRemaining.gt(ZERO) && !sqrtPriceLimit.eq(currSqrtPrice)) {
      let { nextIndex: nextTickIndex } = tickSequence.findNextInitializedTickIndex(currTickIndex);

      let { nextTickPrice, nextSqrtPriceLimit: targetSqrtPrice } = getNextSqrtPrices(
        nextTickIndex,
        sqrtPriceLimit,
        aToB
      );

      const swapComputation = computeSwapStep(
        amountRemaining,
        feeRate,
        currLiquidity,
        currSqrtPrice,
        targetSqrtPrice,
        amountSpecifiedIsInput,
        aToB
      );

      totalFeeAmount = totalFeeAmount.add(swapComputation.feeAmount);

      if (amountSpecifiedIsInput) {
        amountRemaining = amountRemaining.sub(swapComputation.amountIn);
        amountRemaining = amountRemaining.sub(swapComputation.feeAmount);
        amountCalculated = amountCalculated.add(swapComputation.amountOut);
      } else {
        amountRemaining = amountRemaining.sub(swapComputation.amountOut);
        amountCalculated = amountCalculated.add(swapComputation.amountIn);
        amountCalculated = amountCalculated.add(swapComputation.feeAmount);
      }

      let { nextProtocolFee, nextFeeGrowthGlobalInput } = calculateFees(
        swapComputation.feeAmount,
        protocolFeeRate,
        currLiquidity,
        currProtocolFee,
        currFeeGrowthGlobalInput
      );
      currProtocolFee = nextProtocolFee;
      currFeeGrowthGlobalInput = nextFeeGrowthGlobalInput;

      if (swapComputation.nextPrice.eq(nextTickPrice)) {
        const nextTick = tickSequence.getTick(nextTickIndex);
        if (nextTick.initialized) {
          currLiquidity = calculateNextLiquidity(nextTick.liquidityNet, currLiquidity, aToB);
        }
        currTickIndex = aToB ? nextTickIndex - 1 : nextTickIndex;
      } else {
        currTickIndex = PriceMath.sqrtPriceX64ToTickIndex(swapComputation.nextPrice);
      }

      currSqrtPrice = swapComputation.nextPrice;
    }

    return amountCalculated
  };

  const MAX_SWAP_TICK_ARRAYS = 3;
  const MAX_TICK_INDEX = 443636; // i32
  const MIN_TICK_INDEX = -443636; // i32
  const TICK_ARRAY_SIZE = 88; // i32

  const getStartTickIndex = (tickIndex, tickSpacing, offset) => {
    const realIndex = Math.floor(tickIndex / tickSpacing / TICK_ARRAY_SIZE);
    const startTickIndex = (realIndex + offset) * tickSpacing * TICK_ARRAY_SIZE;

    const ticksInArray = TICK_ARRAY_SIZE * tickSpacing;
    const minTickIndex = MIN_TICK_INDEX - ((MIN_TICK_INDEX % ticksInArray) + ticksInArray);
    if(startTickIndex < minTickIndex) { throw(`startTickIndex is too small - - ${startTickIndex}`) }
    if(startTickIndex > MAX_TICK_INDEX) { throw(`startTickIndex is too large - ${startTickIndex}`) }
    return startTickIndex
  };

  const getTickArrayAddresses = async({ aToB, pool, tickSpacing, tickCurrentIndex })=>{
    const shift = aToB ? 0 : tickSpacing;
    let offset = 0;
    let tickArrayAddresses = [];
    for (let i = 0; i < MAX_SWAP_TICK_ARRAYS; i++) {
      let startIndex;
      try {
        startIndex = getStartTickIndex(tickCurrentIndex + shift, tickSpacing, offset);
      } catch (e) {
        return tickArrayAddresses
      }

      const pda = (
        await solanaWeb3_js.PublicKey.findProgramAddress([
            solanaWeb3_js.Buffer.from('tick_array'),
            new solanaWeb3_js.PublicKey(pool.toString()).toBuffer(),
            solanaWeb3_js.Buffer.from(startIndex.toString())
          ],
          new solanaWeb3_js.PublicKey(basics.router.v1.address)
        )
      )[0];
      tickArrayAddresses.push(pda);
      offset = aToB ? offset - 1 : offset + 1;
    }

    return tickArrayAddresses
  };

  const getTickArrays = async ({ 
    pool, // stale whirlpool pubkey
    freshWhirlpoolData, // fresh whirlpool account data
    aToB, // direction
  })=>{

    const tickArrayAddresses = await getTickArrayAddresses({ aToB, pool, tickSpacing: freshWhirlpoolData.tickSpacing, tickCurrentIndex: freshWhirlpoolData.tickCurrentIndex });

    return (
      await Promise.all(tickArrayAddresses.map(async(address, index) => {

        let data;
        try {
          data = await web3Client.request({ blockchain: 'solana' , address: address.toString(), api: TICK_ARRAY_LAYOUT, cache: 10 });
        } catch (e2) {}

        return { address, data }
      }))
    )
  };

  class TickArrayIndex {
    
    static fromTickIndex(index, tickSpacing) {
      const arrayIndex = Math.floor(Math.floor(index / tickSpacing) / TICK_ARRAY_SIZE);
      let offsetIndex = Math.floor((index % (tickSpacing * TICK_ARRAY_SIZE)) / tickSpacing);
      if (offsetIndex < 0) {
        offsetIndex = TICK_ARRAY_SIZE + offsetIndex;
      }
      return new TickArrayIndex(arrayIndex, offsetIndex, tickSpacing)
    }

    constructor(arrayIndex, offsetIndex, tickSpacing) {
      if (offsetIndex >= TICK_ARRAY_SIZE) {
        throw new Error("Invalid offsetIndex - value has to be smaller than TICK_ARRAY_SIZE")
      }
      if (offsetIndex < 0) {
        throw new Error("Invalid offsetIndex - value is smaller than 0")
      }

      if (tickSpacing < 0) {
        throw new Error("Invalid tickSpacing - value is less than 0")
      }

      this.arrayIndex = arrayIndex;
      this.offsetIndex = offsetIndex;
      this.tickSpacing = tickSpacing;
    }

    toTickIndex() {
      return (
        this.arrayIndex * TICK_ARRAY_SIZE * this.tickSpacing + this.offsetIndex * this.tickSpacing
      );
    }

    toNextInitializableTickIndex() {
      return TickArrayIndex.fromTickIndex(this.toTickIndex() + this.tickSpacing, this.tickSpacing)
    }

    toPrevInitializableTickIndex() {
      return TickArrayIndex.fromTickIndex(this.toTickIndex() - this.tickSpacing, this.tickSpacing)
    }
  }

  class TickArraySequence {

    constructor(tickArrays, tickSpacing, aToB) {
      if (!tickArrays[0] || !tickArrays[0].data) {
        throw new Error("TickArray index 0 must be initialized");
      }

      // If an uninitialized TickArray appears, truncate all TickArrays after it (inclusive).
      this.sequence = [];
      for (const tickArray of tickArrays) {
        if (!tickArray || !tickArray.data) {
          break;
        }
        this.sequence.push({
          address: tickArray.address,
          data: tickArray.data,
        });
      }

      this.tickArrays = tickArrays;
      this.tickSpacing = tickSpacing;
      this.aToB = aToB;

      this.touchedArrays = [...Array(this.sequence.length).fill(false)];
      this.startArrayIndex = TickArrayIndex.fromTickIndex(
        this.sequence[0].data.startTickIndex,
        this.tickSpacing
      ).arrayIndex;
    }

    isValidTickArray0(tickCurrentIndex) {
      const shift = this.aToB ? 0 : this.tickSpacing;
      const tickArray = this.sequence[0].data;
      return this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, tickCurrentIndex + shift);
    }

    getNumOfTouchedArrays() {
      return this.touchedArrays.filter((val) => !!val).length;
    }

    getTouchedArrays(minArraySize) {
      let result = this.touchedArrays.reduce((prev, curr, index) => {
        if (curr) {
          prev.push(this.sequence[index].address);
        }
        return prev;
      }, []);

      // Edge case: nothing was ever touched.
      if (result.length === 0) {
        return [];
      }

      // The quote object should contain the specified amount of tick arrays to be plugged
      // directly into the swap instruction.
      // If the result does not fit minArraySize, pad the rest with the last touched array
      const sizeDiff = minArraySize - result.length;
      if (sizeDiff > 0) {
        result = result.concat(Array(sizeDiff).fill(result[result.length - 1]));
      }

      return result;
    }

    getTick(index) {
      const targetTaIndex = TickArrayIndex.fromTickIndex(index, this.tickSpacing);

      if (!this.isArrayIndexInBounds(targetTaIndex, this.aToB)) {
        throw new Error("Provided tick index is out of bounds for this sequence.");
      }

      const localArrayIndex = this.getLocalArrayIndex(targetTaIndex.arrayIndex, this.aToB);
      const tickArray = this.sequence[localArrayIndex].data;

      this.touchedArrays[localArrayIndex] = true;

      if (!tickArray) {
        throw new Error(
          `TickArray at index ${localArrayIndex} is not initialized.`
        );
      }

      if (!this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, index)) {
        throw new Error(
          `TickArray at index ${localArrayIndex} is unexpected for this sequence.`
        );
      }

      return tickArray.ticks[targetTaIndex.offsetIndex];
    }
    /**
     * if a->b, currIndex is included in the search
     * if b->a, currIndex is always ignored
     * @param currIndex
     * @returns
     */
    findNextInitializedTickIndex(currIndex) {
      const searchIndex = this.aToB ? currIndex : currIndex + this.tickSpacing;
      let currTaIndex = TickArrayIndex.fromTickIndex(searchIndex, this.tickSpacing);

      // Throw error if the search attempted to search for an index out of bounds
      if (!this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
        throw new Error(
          `Swap input value traversed too many arrays. Out of bounds at attempt to traverse tick index - ${currTaIndex.toTickIndex()}.`
        );
      }

      while (this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
        const currTickData = this.getTick(currTaIndex.toTickIndex());
        if (currTickData.initialized) {
          return { nextIndex: currTaIndex.toTickIndex(), nextTickData: currTickData };
        }
        currTaIndex = this.aToB
          ? currTaIndex.toPrevInitializableTickIndex()
          : currTaIndex.toNextInitializableTickIndex();
      }

      const lastIndexInArray = Math.max(
        Math.min(
          this.aToB ? currTaIndex.toTickIndex() + this.tickSpacing : currTaIndex.toTickIndex() - 1,
          MAX_TICK_INDEX
        ),
        MIN_TICK_INDEX
      );

      return { nextIndex: lastIndexInArray, nextTickData: null };
    }

    getLocalArrayIndex(arrayIndex, aToB) {
      return aToB ? this.startArrayIndex - arrayIndex : arrayIndex - this.startArrayIndex;
    }

    /**
     * Check whether the array index potentially exists in this sequence.
     * Note: assumes the sequence of tick-arrays are sequential
     * @param index
     */
    isArrayIndexInBounds(index, aToB) {
      // a+0...a+n-1 array index is ok
      const localArrayIndex = this.getLocalArrayIndex(index.arrayIndex, aToB);
      const seqLength = this.sequence.length;
      return localArrayIndex >= 0 && localArrayIndex < seqLength;
    }

    checkIfIndexIsInTickArrayRange(startTick, tickIndex) {
      const upperBound = startTick + this.tickSpacing * TICK_ARRAY_SIZE;
      return tickIndex >= startTick && tickIndex < upperBound;
    }
  }

  const getPrice = async ({
    account, // stale whirlpool account
    tokenIn,
    tokenOut,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
  })=>{

    try {
      
      const freshWhirlpoolData = await web3Client.request({
        blockchain: 'solana',
        address: account.pubkey.toString(),
        api: basics.router.v1.api,
        cache: 10,
      });

      const aToB = (freshWhirlpoolData.tokenMintA.toString() === tokenIn);

      const tickArrays = await getTickArrays({ pool: account.pubkey, freshWhirlpoolData, aToB });

      const tickSequence = new TickArraySequence(tickArrays, freshWhirlpoolData.tickSpacing, aToB);

      const sqrtPriceLimit = new solanaWeb3_js.BN(aToB ? MIN_SQRT_PRICE : MAX_SQRT_PRICE);

      const amount = amountIn || amountInMax || amountOut || amountOutMin;

      const amountSpecifiedIsInput = !!(amountIn || amountInMax);

      const amountCalculated = compute({
        tokenAmount: new solanaWeb3_js.BN(amount.toString()),
        aToB,
        freshWhirlpoolData,
        tickSequence,
        sqrtPriceLimit,
        amountSpecifiedIsInput,
      });

      return {
        price: amountCalculated.toString(),
        tickArrays,
        aToB,
        sqrtPriceLimit,
      }

    } catch (e) {
      return {
        price: undefined,
        tickArrays: undefined,
        aToB: undefined,
        sqrtPriceLimit: undefined,
      }
    }
  };

  // This method is cached and is only to be used to generally existing pools every 24h
  // Do not use for price calulations, fetch accounts for pools individually in order to calculate price 
  let getAccounts = async (base, quote) => {
    let accounts = await web3Client.request(`solana://${basics.router.v1.address}/getProgramAccounts`, {
      params: { filters: [
        { dataSize: basics.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }}, // whirlpoolsConfig
        { memcmp: { offset: 101, bytes: base }}, // tokenMintA
        { memcmp: { offset: 181, bytes: quote }} // tokenMintB
      ]},
      api: basics.router.v1.api,
      cache: 86400, // 24h,
      cacheKey: ['whirlpool', base.toString(), quote.toString()].join('-')
    });
    return accounts
  };

  let getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
    try {
      let accounts = await getAccounts(tokenIn, tokenOut);
      if(accounts.length === 0) { accounts = await getAccounts(tokenOut, tokenIn); }
      accounts = accounts.filter((account)=>account.data.liquidity.gt(1));
      accounts = (await Promise.all(accounts.map(async(account)=>{
        const { price, tickArrays, sqrtPriceLimit, aToB } = await getPrice({ account, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin });
        if(price === undefined) { return false }

        return { // return a copy, do not mutate accounts
          pubkey: account.pubkey,
          price: price,
          tickArrays: tickArrays,
          sqrtPriceLimit: sqrtPriceLimit,
          aToB: aToB,
          data: {
            tokenVaultA: account.data.tokenVaultA, 
            tokenVaultB: account.data.tokenVaultB
          }
        }
      }))).filter(Boolean);
      return accounts
    } catch (e) {
      return []
    }
  };

  let getHighestPrice = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).gt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getLowestPrice = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).lt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getBestPair = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
    const pairs = await getPairsWithPrice({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin });

    if(!pairs || pairs.length === 0) { return }

    let bestPair;

    if(amountIn || amountInMax) {
      bestPair = getHighestPrice(pairs);
    } else { // amount out
      bestPair = getLowestPrice(pairs);
    }

    return bestPair
  };

  function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const blockchain$9 = Blockchains__default['default'].solana;

  // Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
  //
  // We keep 11111111111111111111111111111111 internally
  // to be able to differentiate between SOL<>Token and WSOL<>Token swaps
  // as they are not the same!
  //
  let fixPath$3 = (path) => {
    if(!path) { return }
    let fixedPath = path.map((token, index) => {
      if (
        token === blockchain$9.currency.address && path[index+1] != blockchain$9.wrapped.address &&
        path[index-1] != blockchain$9.wrapped.address
      ) {
        return blockchain$9.wrapped.address
      } else {
        return token
      }
    });

    if(fixedPath[0] == blockchain$9.currency.address && fixedPath[1] == blockchain$9.wrapped.address) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == blockchain$9.currency.address && fixedPath[fixedPath.length-2] == blockchain$9.wrapped.address) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  let pathExists$3 = async ({ path, amountIn, amountInMax, amountOut, amountOutMin }) => {
    if(path.length == 1) { return false }
    path = fixPath$3(path);
    if((await getPairsWithPrice({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin })).length > 0) {
      return true
    } else {
      return false
    }
  };

  let findPath$3 = async ({ tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
    if(
      [tokenIn, tokenOut].includes(blockchain$9.currency.address) &&
      [tokenIn, tokenOut].includes(blockchain$9.wrapped.address)
    ) { return { path: undefined, fixedPath: undefined } }

    let path, stablesIn, stablesOut, stable;

    if (await pathExists$3({ path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != blockchain$9.wrapped.address &&
      tokenIn != blockchain$9.currency.address &&
      await pathExists$3({ path: [tokenIn, blockchain$9.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
      tokenOut != blockchain$9.wrapped.address &&
      tokenOut != blockchain$9.currency.address &&
      await pathExists$3({ path: [tokenOut, blockchain$9.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
    ) {
      // path via blockchain.wrapped.address
      path = [tokenIn, blockchain$9.wrapped.address, tokenOut];
    } else if (
      !blockchain$9.stables.usd.includes(tokenIn) &&
      (stablesIn = (await Promise.all(blockchain$9.stables.usd.map(async(stable)=>await pathExists$3({ path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
      !blockchain$9.stables.usd.includes(tokenOut) &&
      (stablesOut = (await Promise.all(blockchain$9.stables.usd.map(async(stable)=>await pathExists$3({ path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
      (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
    ) {
      // path via TOKEN_IN <> STABLE <> TOKEN_OUT
      path = [tokenIn, stable, tokenOut];
    }

    // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$2([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$9.currency.address) {
      path.splice(1, 0, blockchain$9.wrapped.address);
    } else if(_optionalChain$2([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$9.currency.address) {
      path.splice(path.length-1, 0, blockchain$9.wrapped.address);
    }
    return { path, fixedPath: fixPath$3(path) }
  };

  let getAmountsOut = async ({ path, amountIn, amountInMax }) => {

    let amounts = [ethers.ethers.BigNumber.from(amountIn || amountInMax)];

    amounts.push(ethers.ethers.BigNumber.from((await getBestPair({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax })).price));
    
    if (path.length === 3) {
      amounts.push(ethers.ethers.BigNumber.from((await getBestPair({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined })).price));
    }

    if(amounts.length != path.length) { return }

    return amounts
  };

  let getAmountsIn = async({ path, amountOut, amountOutMin }) => {

    path = path.slice().reverse();
    let amounts = [ethers.ethers.BigNumber.from(amountOut || amountOutMin)];

    amounts.push(ethers.ethers.BigNumber.from((await getBestPair({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin })).price));
    
    if (path.length === 3) {
      amounts.push(ethers.ethers.BigNumber.from((await getBestPair({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined })).price));
    }
    
    if(amounts.length != path.length) { return }

    return amounts.slice().reverse()
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
    path = fixPath$3(path);
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
      amounts = await getAmountsIn({ path, amountOutMin, tokenIn, tokenOut });
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amounts = await getAmountsOut({ path, amountInMax, tokenIn, tokenOut });
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

  const blockchain$8 = Blockchains__default['default'].solana;
  const SWAP_INSTRUCTION = new solanaWeb3_js.BN("14449647541112719096");
  const TWO_HOP_SWAP_INSTRUCTION = new solanaWeb3_js.BN("16635068063392030915");

  const createTokenAccountIfNotExisting = async ({ instructions, owner, token, account })=>{
    let outAccountExists;
    try{ outAccountExists = !!(await web3Client.request({ blockchain: 'solana', address: account.toString() })); } catch (e2) {}
    if(!outAccountExists) {
      instructions.push(
        await Token__default['default'].solana.createAssociatedTokenAccountInstruction({
          token,
          owner,
          payer: owner,
        })
      );
    }
  };

  const getTwoHopSwapInstructionKeys = async ({
    fromAddress,
    poolOne,
    tickArraysOne,
    tokenAccountOneA,
    tokenVaultOneA,
    tokenAccountOneB,
    tokenVaultOneB,
    poolTwo,
    tickArraysTwo,
    tokenAccountTwoA,
    tokenVaultTwoA,
    tokenAccountTwoB,
    tokenVaultTwoB,
  })=> {

    let lastInitializedTickOne = false;
    const onlyInitializedTicksOne = tickArraysOne.map((tickArray, index)=>{
      if(lastInitializedTickOne !== false) {
        return tickArraysOne[lastInitializedTickOne]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTickOne = index-1;
        return tickArraysOne[index-1]
      }
    });

    let lastInitializedTickTwo = false;
    const onlyInitializedTicksTwo = tickArraysTwo.map((tickArray, index)=>{
      if(lastInitializedTickTwo !== false) {
        return tickArraysTwo[lastInitializedTickTwo]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTickTwo = index-1;
        return tickArraysTwo[index-1]
      }
    });

    return [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(Token__default['default'].solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // token_authority
      { pubkey: new solanaWeb3_js.PublicKey(fromAddress), isWritable: false, isSigner: true },
      // whirlpool_one
      { pubkey: new solanaWeb3_js.PublicKey(poolOne.toString()), isWritable: true, isSigner: false },
      // whirlpool_two
      { pubkey: new solanaWeb3_js.PublicKey(poolTwo.toString()), isWritable: true, isSigner: false },
      // token_owner_account_one_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountOneA.toString()), isWritable: true, isSigner: false },
      // token_vault_one_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultOneA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_one_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountOneB.toString()), isWritable: true, isSigner: false },
      // token_vault_one_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultOneB.toString()), isWritable: true, isSigner: false },
      // token_owner_account_two_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountTwoA.toString()), isWritable: true, isSigner: false },
      // token_vault_two_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultTwoA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_two_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountTwoB.toString()), isWritable: true, isSigner: false },
      // token_vault_two_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultTwoB.toString()), isWritable: true, isSigner: false },
      // tick_array_one_0
      { pubkey: onlyInitializedTicksOne[0].address, isWritable: true, isSigner: false },
      // tick_array_one_1
      { pubkey: onlyInitializedTicksOne[1].address, isWritable: true, isSigner: false },
      // tick_array_one_2
      { pubkey: onlyInitializedTicksOne[2].address, isWritable: true, isSigner: false },
      // tick_array_two_0
      { pubkey: onlyInitializedTicksTwo[0].address, isWritable: true, isSigner: false },
      // tick_array_two_1
      { pubkey: onlyInitializedTicksTwo[1].address, isWritable: true, isSigner: false },
      // tick_array_two_2
      { pubkey: onlyInitializedTicksTwo[2].address, isWritable: true, isSigner: false },
      // oracle_one
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(poolOne.toString()).toBuffer() ], new solanaWeb3_js.PublicKey(basics.router.v1.address)))[0], isWritable: false, isSigner: false },
      // oracle_two
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(poolTwo.toString()).toBuffer() ], new solanaWeb3_js.PublicKey(basics.router.v1.address)))[0], isWritable: false, isSigner: false },
    ]
  };
  const getTwoHopSwapInstructionData = ({
    amount,
    otherAmountThreshold,
    amountSpecifiedIsInput,
    aToBOne,
    aToBTwo,
    sqrtPriceLimitOne,
    sqrtPriceLimitTwo,
  })=> {
    let LAYOUT, data;
    
    LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToBOne"),
      solanaWeb3_js.bool("aToBTwo"),
      solanaWeb3_js.u128("sqrtPriceLimitOne"),
      solanaWeb3_js.u128("sqrtPriceLimitTwo"),
    ]);
    data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
    LAYOUT.encode(
      {
        anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION,
        amount: new solanaWeb3_js.BN(amount.toString()),
        otherAmountThreshold: new solanaWeb3_js.BN(otherAmountThreshold.toString()),
        amountSpecifiedIsInput,
        aToBOne,
        aToBTwo,
        sqrtPriceLimitOne,
        sqrtPriceLimitTwo,
      },
      data,
    );

    return data
  };

  const getSwapInstructionKeys = async ({
    fromAddress,
    pool,
    tokenAccountA,
    tokenVaultA,
    tokenAccountB,
    tokenVaultB,
    tickArrays,
  })=> {

    let lastInitializedTick = false;
    const onlyInitializedTicks = tickArrays.map((tickArray, index)=>{
      if(lastInitializedTick !== false) {
        return tickArrays[lastInitializedTick]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTick = index-1;
        return tickArrays[index-1]
      }
    });

    return [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(Token__default['default'].solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // token_authority
      { pubkey: new solanaWeb3_js.PublicKey(fromAddress), isWritable: false, isSigner: true },
      // whirlpool
      { pubkey: new solanaWeb3_js.PublicKey(pool.toString()), isWritable: true, isSigner: false },
      // token_owner_account_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountA.toString()), isWritable: true, isSigner: false },
      // token_vault_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountB.toString()), isWritable: true, isSigner: false },
      // token_vault_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultB.toString()), isWritable: true, isSigner: false },
      // tick_array_0
      { pubkey: onlyInitializedTicks[0].address, isWritable: true, isSigner: false },
      // tick_array_1
      { pubkey: onlyInitializedTicks[1].address, isWritable: true, isSigner: false },
      // tick_array_2
      { pubkey: onlyInitializedTicks[2].address, isWritable: true, isSigner: false },
      // oracle
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(pool.toString()).toBuffer() ], new solanaWeb3_js.PublicKey(basics.router.v1.address)))[0], isWritable: false, isSigner: false },
    ]
  };

  const getSwapInstructionData = ({ amount, otherAmountThreshold, sqrtPriceLimit, amountSpecifiedIsInput, aToB })=> {
    let LAYOUT, data;
    
    LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.u128("sqrtPriceLimit"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToB"),
    ]);
    data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
    LAYOUT.encode(
      {
        anchorDiscriminator: SWAP_INSTRUCTION,
        amount: new solanaWeb3_js.BN(amount.toString()),
        otherAmountThreshold: new solanaWeb3_js.BN(otherAmountThreshold.toString()),
        sqrtPriceLimit,
        amountSpecifiedIsInput,
        aToB,
      },
      data,
    );

    return data
  };

  const getTransaction$3 = async ({
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

    const fixedPath = fixPath$3(path);
    if(fixedPath.length > 3) { throw 'Orca can only handle fixed paths with a max length of 3 (2 pools)!' }
    const tokenIn = fixedPath[0];
    const tokenMiddle = fixedPath.length == 3 ? fixedPath[1] : undefined;
    const tokenOut = fixedPath[fixedPath.length-1];

    let pairs;
    if(fixedPath.length == 2) {
      pairs = [await getBestPair({ tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })];
    } else {
      if(amountInInput || amountInMaxInput) {
        pairs = [await getBestPair({ tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })];
        pairs.push(await getBestPair({ tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }));
      } else { // originally amountOut
        pairs = [await getBestPair({ tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })];
        pairs.unshift(await getBestPair({ tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }));
      }
    }

    let startsWrapped = (path[0] === blockchain$8.currency.address && fixedPath[0] === blockchain$8.wrapped.address);
    let endsUnwrapped = (path[path.length-1] === blockchain$8.currency.address && fixedPath[fixedPath.length-1] === blockchain$8.wrapped.address);
    let wrappedAccount;
    const provider = await web3Client.getProvider('solana');
    
    if(startsWrapped || endsUnwrapped) {
      const rent = await provider.getMinimumBalanceForRentExemption(Token__default['default'].solana.TOKEN_LAYOUT.span);
      const keypair = solanaWeb3_js.Keypair.generate();
      wrappedAccount = keypair.publicKey.toString();
      const lamports = startsWrapped ? new solanaWeb3_js.BN(amountIn.toString()).add(new solanaWeb3_js.BN(rent)) :  new solanaWeb3_js.BN(rent);
      let createAccountInstruction = solanaWeb3_js.SystemProgram.createAccount({
        fromPubkey: new solanaWeb3_js.PublicKey(fromAddress),
        newAccountPubkey: new solanaWeb3_js.PublicKey(wrappedAccount),
        programId: new solanaWeb3_js.PublicKey(Token__default['default'].solana.TOKEN_PROGRAM),
        space: Token__default['default'].solana.TOKEN_LAYOUT.span,
        lamports
      });
      createAccountInstruction.signers = [keypair];
      instructions.push(createAccountInstruction);
      instructions.push(
        Token__default['default'].solana.initializeAccountInstruction({
          account: wrappedAccount,
          token: blockchain$8.wrapped.address,
          owner: fromAddress
        })
      );
    }

    if(pairs.length === 1) {
      // amount is NOT the precise part of the swap (otherAmountThreshold is)
      let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput);
      let amount = amountSpecifiedIsInput ? amountIn : amountOut;
      let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax;
      let tokenAccountIn = startsWrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token__default['default'].solana.findProgramAddress({ owner: fromAddress, token: tokenIn }));
      let tokenAccountOut = endsUnwrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token__default['default'].solana.findProgramAddress({ owner: fromAddress, token: tokenOut }));
      if(!endsUnwrapped) {
        await createTokenAccountIfNotExisting({ instructions, owner: fromAddress, token: tokenOut, account: tokenAccountOut });
      }
      instructions.push(
        new solanaWeb3_js.TransactionInstruction({
          programId: new solanaWeb3_js.PublicKey(exchange.router.v1.address),
          keys: await getSwapInstructionKeys({
            fromAddress,
            pool: pairs[0].pubkey,
            tokenAccountA: pairs[0].aToB ? tokenAccountIn : tokenAccountOut,
            tokenVaultA: pairs[0].data.tokenVaultA,
            tokenAccountB: pairs[0].aToB ? tokenAccountOut : tokenAccountIn,
            tokenVaultB: pairs[0].data.tokenVaultB,
            tickArrays: pairs[0].tickArrays,
          }),
          data: getSwapInstructionData({
            amount,
            otherAmountThreshold,
            sqrtPriceLimit: pairs[0].sqrtPriceLimit,
            amountSpecifiedIsInput,
            aToB: pairs[0].aToB
          }),
        })
      );
    } else if (pairs.length === 2) {
      // amount is NOT the precise part of the swap (otherAmountThreshold is)
      let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput);
      let amount = amountSpecifiedIsInput ? amountIn : amountOut;
      let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax;
      let tokenAccountIn = startsWrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token__default['default'].solana.findProgramAddress({ owner: fromAddress, token: tokenIn }));
      let tokenMiddle = fixedPath[1];
      let tokenAccountMiddle = new solanaWeb3_js.PublicKey(await Token__default['default'].solana.findProgramAddress({ owner: fromAddress, token: tokenMiddle }));
      await createTokenAccountIfNotExisting({ instructions, owner: fromAddress, token: tokenMiddle, account: tokenAccountMiddle });
      let tokenAccountOut = endsUnwrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token__default['default'].solana.findProgramAddress({ owner: fromAddress, token: tokenOut }));
      if(!endsUnwrapped) {
        await createTokenAccountIfNotExisting({ instructions, owner: fromAddress, token: tokenOut, account: tokenAccountOut });
      }
      instructions.push(
        new solanaWeb3_js.TransactionInstruction({
          programId: new solanaWeb3_js.PublicKey(exchange.router.v1.address),
          keys: await getTwoHopSwapInstructionKeys({
            fromAddress,
            poolOne: pairs[0].pubkey,
            tickArraysOne: pairs[0].tickArrays,
            tokenAccountOneA: pairs[0].aToB ? tokenAccountIn : tokenAccountMiddle,
            tokenVaultOneA: pairs[0].data.tokenVaultA,
            tokenAccountOneB: pairs[0].aToB ? tokenAccountMiddle : tokenAccountIn,
            tokenVaultOneB: pairs[0].data.tokenVaultB,
            poolTwo: pairs[1].pubkey,
            tickArraysTwo: pairs[1].tickArrays,
            tokenAccountTwoA: pairs[1].aToB ? tokenAccountMiddle : tokenAccountOut,
            tokenVaultTwoA: pairs[1].data.tokenVaultA,
            tokenAccountTwoB: pairs[1].aToB ? tokenAccountOut : tokenAccountMiddle,
            tokenVaultTwoB: pairs[1].data.tokenVaultB,
          }),
          data: getTwoHopSwapInstructionData({
            amount,
            otherAmountThreshold,
            amountSpecifiedIsInput,
            aToBOne: pairs[0].aToB,
            aToBTwo: pairs[1].aToB,
            sqrtPriceLimitOne: pairs[0].sqrtPriceLimit,
            sqrtPriceLimitTwo: pairs[1].sqrtPriceLimit,
          }),
        })
      );
    }
    
    if(startsWrapped || endsUnwrapped) {
      instructions.push(
        Token__default['default'].solana.closeAccountInstruction({
          account: wrappedAccount,
          owner: fromAddress
        })
      );
    }

    // await debug(instructions, provider)

    transaction.instructions = instructions;
    return transaction
  };

  var orca = new Exchange(
    Object.assign(basics, {
      findPath: findPath$3,
      pathExists: pathExists$3,
      getAmounts: getAmounts$3,
      getTransaction: getTransaction$3,
    })
  );

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const fixPath$2 = (blockchain, exchange, path) => {
    if(!path) { return }
    let fixedPath = path.map((token, index) => {
      if (
        token === blockchain.currency.address && path[index+1] != blockchain.wrapped.address &&
        path[index-1] != blockchain.wrapped.address
      ) {
        return blockchain.wrapped.address
      } else {
        return token
      }
    });

    if(fixedPath[0] == blockchain.currency.address && fixedPath[1] == blockchain.wrapped.address) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == blockchain.currency.address && fixedPath[fixedPath.length-2] == blockchain.wrapped.address) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  const minReserveRequirements = ({ reserves, min, token, token0, token1, decimals }) => {
    if(token0.toLowerCase() == token.toLowerCase()) {
      return reserves[0].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else if (token1.toLowerCase() == token.toLowerCase()) {
      return reserves[1].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else {
      return false
    }
  };

  const pathExists$2 = async (blockchain, exchange, path) => {
    if(fixPath$2(blockchain, exchange, path).length == 1) { return false }
    try {
      let pair = await web3Client.request({
        blockchain: blockchain.name,
        address: exchange.factory.address,
        method: 'getPair',
        api: exchange.factory.api,
        cache: 3600000,
        params: fixPath$2(blockchain, exchange, path),
      });
      if(!pair || pair == blockchain.zero) { return false }
      let [reserves, token0, token1] = await Promise.all([
        web3Client.request({ blockchain: blockchain.name, address: pair, method: 'getReserves', api: exchange.pair.api, cache: 3600000 }),
        web3Client.request({ blockchain: blockchain.name, address: pair, method: 'token0', api: exchange.pair.api, cache: 3600000 }),
        web3Client.request({ blockchain: blockchain.name, address: pair, method: 'token1', api: exchange.pair.api, cache: 3600000 })
      ]);
      if(path.includes(blockchain.wrapped.address)) {
        return minReserveRequirements({ min: 1, token: blockchain.wrapped.address, decimals: blockchain.currency.decimals, reserves, token0, token1 })
      } else if (path.find((step)=>blockchain.stables.usd.includes(step))) {
        let address = path.find((step)=>blockchain.stables.usd.includes(step));
        let token = new Token__default['default']({ blockchain: blockchain.name, address });
        let decimals = await token.decimals();
        return minReserveRequirements({ min: 1000, token: address, decimals, reserves, token0, token1 })
      } else {
        return true
      }
    } catch (e) { return false }
  };

  const findPath$2 = async (blockchain, exchange, { tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(blockchain.currency.address) &&
      [tokenIn, tokenOut].includes(blockchain.wrapped.address)
    ) { return { path: undefined, fixedPath: undefined } }

    let path;
    if (await pathExists$2(blockchain, exchange, [tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != blockchain.wrapped.address &&
      await pathExists$2(blockchain, exchange, [tokenIn, blockchain.wrapped.address]) &&
      tokenOut != blockchain.wrapped.address &&
      await pathExists$2(blockchain, exchange, [tokenOut, blockchain.wrapped.address])
    ) {
      // path via WRAPPED
      path = [tokenIn, blockchain.wrapped.address, tokenOut];
    } else if (
      !blockchain.stables.usd.includes(tokenIn) &&
      (await Promise.all(blockchain.stables.usd.map((stable)=>pathExists$2(blockchain, exchange, [tokenIn, stable])))).filter(Boolean).length &&
      tokenOut != blockchain.wrapped.address &&
      await pathExists$2(blockchain, exchange, [blockchain.wrapped.address, tokenOut])
    ) {
      // path via tokenIn -> USD -> WRAPPED -> tokenOut
      let USD = (await Promise.all(blockchain.stables.usd.map(async (stable)=>{ return(await pathExists$2(blockchain, exchange, [tokenIn, stable]) ? stable : undefined) }))).find(Boolean);
      path = [tokenIn, USD, blockchain.wrapped.address, tokenOut];
    } else if (
      tokenIn != blockchain.wrapped.address &&
      await pathExists$2(blockchain, exchange, [tokenIn, blockchain.wrapped.address]) &&
      !blockchain.stables.usd.includes(tokenOut) &&
      (await Promise.all(blockchain.stables.usd.map((stable)=>pathExists$2(blockchain, exchange, [stable, tokenOut])))).filter(Boolean).length
    ) {
      // path via tokenIn -> WRAPPED -> USD -> tokenOut
      let USD = (await Promise.all(blockchain.stables.usd.map(async (stable)=>{ return(await pathExists$2(blockchain, exchange, [stable, tokenOut]) ? stable : undefined) }))).find(Boolean);
      path = [tokenIn, blockchain.wrapped.address, USD, tokenOut];
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$1([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain.currency.address) {
      path.splice(1, 0, blockchain.wrapped.address);
    } else if(_optionalChain$1([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain.currency.address) {
      path.splice(path.length-1, 0, blockchain.wrapped.address);
    }

    return { path, fixedPath: fixPath$2(blockchain, exchange, path) }
  };

  let getAmountOut$1 = (blockchain, exchange, { path, amountIn, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: blockchain.name,
        address: exchange.router.address,
        method: 'getAmountsOut',
        api: exchange.router.api,
        params: {
          amountIn: amountIn,
          path: fixPath$2(blockchain, exchange, path),
        },
      })
      .then((amountsOut)=>{
        resolve(amountsOut[amountsOut.length - 1]);
      })
      .catch(()=>resolve());
    })
  };

  let getAmountIn$1 = (blockchain, exchange, { path, amountOut, block }) => {
    return new Promise((resolve) => {
      web3Client.request({
        blockchain: blockchain.name,
        address: exchange.router.address,
        method: 'getAmountsIn',
        api: exchange.router.api,
        params: {
          amountOut: amountOut,
          path: fixPath$2(blockchain, exchange, path),
        },
        block
      })
      .then((amountsIn)=>resolve(amountsIn[0]))
      .catch(()=>resolve());
    })
  };

  let getAmounts$2 = async (blockchain, exchange, {
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
      amountIn = await getAmountIn$1(blockchain, exchange, { block, path, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut$1(blockchain, exchange, { path, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn$1(blockchain, exchange, { block, path, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut$1(blockchain, exchange, { path, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin }
  };

  let getTransaction$2 = (blockchain, exchange, {
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
      blockchain: blockchain.name,
      from: fromAddress,
      to: exchange.router.address,
      api: exchange.router.api,
    };

    if (path[0] === blockchain.currency.address) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactETHForTokens';
        transaction.value = amountIn.toString();
        transaction.params = { amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapETHForExactTokens';
        transaction.value = amountInMax.toString();
        transaction.params = { amountOut: amountOut.toString() };
      }
    } else if (path[path.length - 1] === blockchain.currency.address) {
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
      path: fixPath$2(blockchain, exchange, path),
      to: fromAddress,
      deadline: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    });

    return transaction
  };

  const ROUTER$1 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY$1 = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
  const PAIR = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

  var UniswapV2 = {
    findPath: findPath$2,
    pathExists: pathExists$2,
    getAmounts: getAmounts$2,
    getTransaction: getTransaction$2,
    ROUTER: ROUTER$1,
    FACTORY: FACTORY$1,
    PAIR,
  };

  const blockchain$7 = Blockchains__default['default'].bsc;

  const exchange$8 = {
    blockchain: 'bsc',
    name: 'pancakeswap',
    alternativeNames: ['pancake'],
    label: 'PancakeSwap',
    logo:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk4IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OCAxOTkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTguNTUyIDE5OC42MDdDNjkuMDYxMyAxOTguNTg1IDQ1LjMwNiAxOTEuNTggMjguNzA3OSAxNzguOTk4QzExLjkxMDggMTY2LjI2NSAzIDE0OC4xOTUgMyAxMjcuNzQ4QzMgMTA4LjA0NyAxMS44OTEzIDkzLjg0MTEgMjEuOTUxNyA4NC4yMzg1QzI5LjgzNTkgNzYuNzEzMiAzOC41MzYzIDcxLjg5MzYgNDQuNTk0NSA2OS4xMjEzQzQzLjIyNDUgNjQuOTU5NCA0MS41MTUzIDU5LjUxMDggMzkuOTg2MSA1My44ODMyQzM3LjkzOTkgNDYuMzUyNyAzNS45MzI1IDM3LjUxNzQgMzUuOTMyNSAzMS4wNDI5QzM1LjkzMjUgMjMuMzc5NSAzNy42MjA0IDE1LjY4MzMgNDIuMTcxNCA5LjcwMzA2QzQ2Ljk3OTcgMy4zODQ3NiA1NC4yMTgyIDAgNjIuOTI2NCAwQzY5LjczMjIgMCA3NS41MTAzIDIuNDk5MDMgODAuMDMzOSA2LjgxMDExQzg0LjM1NzkgMTAuOTMwOSA4Ny4yMzU3IDE2LjQwMzQgODkuMjIyNyAyMi4xMDgyQzkyLjcxNDMgMzIuMTMyNSA5NC4wNzM4IDQ0LjcyNjQgOTQuNDU1MSA1Ny4yOTQ1SDEwMi43OTZDMTAzLjE3OCA0NC43MjY0IDEwNC41MzcgMzIuMTMyNSAxMDguMDI5IDIyLjEwODJDMTEwLjAxNiAxNi40MDM0IDExMi44OTQgMTAuOTMwOSAxMTcuMjE4IDYuODEwMTFDMTIxLjc0MSAyLjQ5OTAzIDEyNy41MTkgMCAxMzQuMzI1IDBDMTQzLjAzMyAwIDE1MC4yNzIgMy4zODQ3NiAxNTUuMDggOS43MDMwNkMxNTkuNjMxIDE1LjY4MzMgMTYxLjMxOSAyMy4zNzk1IDE2MS4zMTkgMzEuMDQyOUMxNjEuMzE5IDM3LjUxNzQgMTU5LjMxMiA0Ni4zNTI3IDE1Ny4yNjUgNTMuODgzMkMxNTUuNzM2IDU5LjUxMDggMTU0LjAyNyA2NC45NTk0IDE1Mi42NTcgNjkuMTIxM0MxNTguNzE1IDcxLjg5MzYgMTY3LjQxNiA3Ni43MTMyIDE3NS4zIDg0LjIzODVDMTg1LjM2IDkzLjg0MTEgMTk0LjI1MiAxMDguMDQ3IDE5NC4yNTIgMTI3Ljc0OEMxOTQuMjUyIDE0OC4xOTUgMTg1LjM0MSAxNjYuMjY1IDE2OC41NDQgMTc4Ljk5OEMxNTEuOTQ1IDE5MS41OCAxMjguMTkgMTk4LjU4NSA5OC42OTk2IDE5OC42MDdIOTguNTUyWiIgZmlsbD0iIzYzMzAwMSIvPgo8cGF0aCBkPSJNNjIuOTI2MiA3LjI4ODMzQzUwLjE3MTYgNy4yODgzMyA0NC4zMDA0IDE2LjgwMzcgNDQuMzAwNCAyOS45NjMyQzQ0LjMwMDQgNDAuNDIzMSA1MS4xMjIyIDYxLjM3MTUgNTMuOTIxMiA2OS41MjYzQzU0LjU1MDggNzEuMzYwNSA1My41NjE2IDczLjM3MDEgNTEuNzU3NCA3NC4wODE0QzQxLjUzNTEgNzguMTEyMSAxMS4zNjc5IDkyLjg3IDExLjM2NzkgMTI2LjY2OUMxMS4zNjc5IDE2Mi4yNzIgNDIuMDI0NiAxODkuMTE3IDk4LjU1ODEgMTg5LjE2Qzk4LjU4MDYgMTg5LjE2IDk4LjYwMzEgMTg5LjE1OSA5OC42MjU2IDE4OS4xNTlDOTguNjQ4MSAxODkuMTU5IDk4LjY3MDYgMTg5LjE2IDk4LjY5MzEgMTg5LjE2QzE1NS4yMjcgMTg5LjExNyAxODUuODgzIDE2Mi4yNzIgMTg1Ljg4MyAxMjYuNjY5QzE4NS44ODMgOTIuODcgMTU1LjcxNiA3OC4xMTIxIDE0NS40OTQgNzQuMDgxNEMxNDMuNjkgNzMuMzcwMSAxNDIuNyA3MS4zNjA1IDE0My4zMyA2OS41MjYzQzE0Ni4xMjkgNjEuMzcxNSAxNTIuOTUxIDQwLjQyMzEgMTUyLjk1MSAyOS45NjMyQzE1Mi45NTEgMTYuODAzNyAxNDcuMDggNy4yODgzMyAxMzQuMzI1IDcuMjg4MzNDMTE1Ljk2NSA3LjI4ODMzIDExMS4zODkgMzMuMjk1NSAxMTEuMDYyIDYxLjIwNzVDMTExLjA0IDYzLjA3MDkgMTA5LjUzNCA2NC41ODI4IDEwNy42NyA2NC41ODI4SDg5LjU4MDdDODcuNzE3MiA2NC41ODI4IDg2LjIxMDggNjMuMDcwOSA4Ni4xODkgNjEuMjA3NUM4NS44NjI2IDMzLjI5NTUgODEuMjg2IDcuMjg4MzMgNjIuOTI2MiA3LjI4ODMzWiIgZmlsbD0iI0QxODg0RiIvPgo8cGF0aCBkPSJNOTguNjkzMSAxNzcuNzU1QzU3LjE1NTEgMTc3Ljc1NSAxMS40Mzk3IDE1NS41MiAxMS4zNjgxIDEyNi43MzdDMTEuMzY4IDEyNi43ODEgMTEuMzY3OSAxMjYuODI2IDExLjM2NzkgMTI2Ljg3MUMxMS4zNjc5IDE2Mi41MDMgNDIuMDczNCAxODkuMzYyIDk4LjY5MzEgMTg5LjM2MkMxNTUuMzEzIDE4OS4zNjIgMTg2LjAxOCAxNjIuNTAzIDE4Ni4wMTggMTI2Ljg3MUMxODYuMDE4IDEyNi44MjYgMTg2LjAxOCAxMjYuNzgxIDE4Ni4wMTggMTI2LjczN0MxODUuOTQ2IDE1NS41MiAxNDAuMjMxIDE3Ny43NTUgOTguNjkzMSAxNzcuNzU1WiIgZmlsbD0iI0ZFREM5MCIvPgo8cGF0aCBkPSJNNzUuNjEzNSAxMTcuODk2Qzc1LjYxMzUgMTI3LjYxNCA3MS4wMjEgMTMyLjY3NSA2NS4zNTU4IDEzMi42NzVDNTkuNjkwNyAxMzIuNjc1IDU1LjA5ODEgMTI3LjYxNCA1NS4wOTgxIDExNy44OTZDNTUuMDk4MSAxMDguMTc4IDU5LjY5MDcgMTAzLjExNyA2NS4zNTU4IDEwMy4xMTdDNzEuMDIxIDEwMy4xMTcgNzUuNjEzNSAxMDguMTc4IDc1LjYxMzUgMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPHBhdGggZD0iTTE0Mi4yODggMTE3Ljg5NkMxNDIuMjg4IDEyNy42MTQgMTM3LjY5NiAxMzIuNjc1IDEzMi4wMzEgMTMyLjY3NUMxMjYuMzY1IDEzMi42NzUgMTIxLjc3MyAxMjcuNjE0IDEyMS43NzMgMTE3Ljg5NkMxMjEuNzczIDEwOC4xNzggMTI2LjM2NSAxMDMuMTE3IDEzMi4wMzEgMTAzLjExN0MxMzcuNjk2IDEwMy4xMTcgMTQyLjI4OCAxMDguMTc4IDE0Mi4yODggMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPC9zdmc+Cg==',
    router: {
      address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      api: UniswapV2.ROUTER
    },
    factory: {
      address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      api: UniswapV2.FACTORY
    },
    pair: {
      api: UniswapV2.PAIR
    },
    slippage: true,
  };

  var pancakeswap = new Exchange(

    Object.assign(exchange$8, {
      findPath: ({ tokenIn, tokenOut })=>
        UniswapV2.findPath(blockchain$7, exchange$8, { tokenIn, tokenOut }),
      pathExists: (path)=>
        UniswapV2.pathExists(blockchain$7, exchange$8, path),
      getAmounts: ({ path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin })=>
        UniswapV2.getAmounts(blockchain$7, exchange$8, { path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin }),
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        UniswapV2.getTransaction(blockchain$7, exchange$8 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain$6 = Blockchains__default['default'].polygon;

  const exchange$7 = {
    blockchain: 'polygon',
    name: 'quickswap',
    alternativeNames: [],
    label: 'QuickSwap',
    logo: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzAyLjQ1IDcwMi40NyI+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIj48cmVjdCB3aWR0aD0iNzUwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0ibm9uZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwLXBhdGgpIj48cGF0aCBkPSJNMzU0Ljc0LDI0LjM3YTM1MS4yNywzNTEuMjcsMCwwLDEsMzYzLjc0LDI3NywzNTQsMzU0LDAsMCwxLDEuMjMsMTQxLjI2QTM1MS43NiwzNTEuNzYsMCwwLDEsNTEwLjEyLDY5OS4zYy03My43NywzMS0xNTguMjUsMzUuMzUtMjM0LjkxLDEyLjU0QTM1MiwzNTIsMCwwLDEsNDYuNTEsNDk5LjU2Yy0yOC03My40NS0zMC4xNi0xNTYuMzgtNi4yNC0yMzEuMjVBMzUwLjg4LDM1MC44OCwwLDAsMSwzNTQuNzQsMjQuMzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE1OC44MSwzNDkuNThjMS4zOSw2LjQxLDIuMjMsMTIuOTIsMy42MSwxOS4zNS44NSwzLjkzLDIuMTMsMyw0LjE1LDEuMjgsMy44Ny0zLjI1LDcuNTktNi42OSwxMS45NC05LjMxLDEuMjMuMjQsMS44NiwxLjIyLDIuNTMsMi4xLDExLjM5LDE0Ljg3LDI2LjUzLDI0LDQ0LjM3LDI4Ljk0YTE0Ny4yMywxNDcuMjMsMCwwLDAsMjUuMTcsNC42Nyw0Mi42OCw0Mi42OCwwLDAsMS02LjYxLTkuOTVjLTIuODUtNi40MS0xLjg1LTEyLjE1LDIuOTUtMTcuMjIsNS44Ny02LjE5LDEzLjYyLTguNzYsMjEuNDgtMTAuOCwxNi40OC00LjMsMzMuMjctNC43Myw1MC4xOC0zLjUzQTIwMi4xMSwyMDIuMTEsMCwwLDEsMzU4Ljc1LDM2MmMxMSwzLjA2LDIxLjcyLDYuNzMsMzEuNDQsMTIuODgsMS4zNiwxLjA5LDIuMywyLjYsMy42MSwzLjc0LDEyLjQ5LDEzLjQxLDE5Ljc4LDI5LjI1LDIwLjI4LDQ3LjU1LjM0LDEyLjY1LTMuMTYsMjQuNzItOS41LDM1LjgyLTExLjQyLDIwLTI4LjA5LDM0LjU2LTQ4LDQ1LjcxQTE3MC41LDE3MC41LDAsMCwxLDI5MSw1MjguNDJjLTQxLjI0LDQuNDctNzkuNDUtNC40Ny0xMTQuNTktMjYuMzYtMjkuMjEtMTguMTktNTEuNjUtNDMuMDgtNzAtNzEuOTJhMzM5LjU3LDMzOS41NywwLDAsMS0yMi41Mi00Mi43NWMtLjgxLTEuOC0xLTMuODEtMS44Mi01LjI5LjUyLDEuNzUsMS40OSwzLjczLS40Myw1LjYtLjU4LTcuNDUuMDgtMTQuOS40Ny0yMi4zMWEyODcuMTMsMjg3LjEzLDAsMCwxLDkuNDgtNjAuNTRBMjkyLjkxLDI5Mi45MSwwLDAsMSwyNjYuMDYsMTA5LjA5LDI4Ny4yLDI4Ny4yLDAsMCwxLDM0Ni41OSw4OS45YzQzLjU3LTQsODUuNzksMS43MywxMjcsMTYuMzQtNi4yNywxMS44OS00Miw0My43Mi02OS44LDYyLjE1YTk0LjExLDk0LjExLDAsMCwwLTUuNDQtMjMuNTFjLS4xNC0yLDEuNjYtMi42NSwyLjc4LTMuNjFxOC42Ny03LjQ2LDE3LjQzLTE0Ljc3YTE3LjE0LDE3LjE0LDAsMCwwLDEuNjktMS40OWMuNjYtLjcxLDEuNzctMS4zLDEuNTQtMi40cy0xLjU1LTEuMTUtMi40Ny0xLjNhNDYuODIsNDYuODIsMCwwLDAtOC4xNy0xYy0zLjgxLS40NS03LjU2LTEuMy0xMS40LTEuMzgtMi45NS0uMTgtNS44NS0uOTMtOC44My0uNjlhMjguMjIsMjguMjIsMCwwLDEtNC41LS4zMmMtMi41LS43OS01LjA3LS40NC03LjYxLS40My0xLjUyLDAtMy0uMTEtNC41NiwwLTQuMzUuMjUtOC43My0uNDgtMTMuMDcuMzRhMTIuODcsMTIuODcsMCwwLDEtMy4yMS4zMmMtMS4yNiwwLTIuNTEuMDYtMy43NywwYTEyLjM1LDEyLjM1LDAsMCwwLTQuODcuNDdjLTQuNTkuNDEtOS4xOS43OC0xMy43MywxLjYxLTUuNDgsMS4xNi0xMS4wOSwxLjQ0LTE2LjUzLDIuNzktNSwxLjMtMTAuMTMsMi0xNSwzLjc0LTYuNTEsMS43OS0xMi45NSwzLjg0LTE5LjM1LDYtOS4zNCwzLjcxLTE4LjgyLDcuMS0yNy43MSwxMS44NmEyNDguNzQsMjQ4Ljc0LDAsMCwwLTU1LjY2LDM2Ljk0QTI2Ni41NSwyNjYuNTUsMCwwLDAsMTU5LjY4LDIyN2EyNTQuODcsMjU0Ljg3LDAsMCwwLTE2LjU0LDI2LjE2Yy0zLjE3LDUuOS02LjIyLDExLjg1LTksMTgtMiw0LjcxLTQuNDIsOS4yNy02LDE0LjE4LTIsNC45LTMuNjQsOS45Mi01LjIyLDE1LTEuODgsNS4wNi0zLDEwLjM1LTQuNDUsMTUuNTMtLjYzLDItMSw0LjExLTEuNTMsNi4xOC0uNjMsMi40OS0xLDUtMS40Nyw3LjU1LS43Nyw0LjI1LTEuNDgsOC41LTIuMDksMTIuNzhhMTE4LjY0LDExOC42NCwwLDAsMC0xLjU3LDEzLjI5Yy0uNzQsMi45NC0uMiw2LS43NCw5LS44MiwzLjY5LS4yOCw3LjQ1LS41MiwxMS4xNi0uMTEsMi42MS0uMTYsNS4yMy0uMDksNy44NSwwLDEuMDctLjQ5LDIuNTcuNjQsMy4wOSwxLjI5LjYsMi4yMy0uNzcsMy4xNi0xLjUzLDMuMTgtMi42LDYuMjktNS4yOSw5LjQtOCwxMC40Ny05LDIxLjA3LTE3Ljg4LDMxLjU4LTI2Ljg1LjkxLS43NywxLjktMi43OSwzLjUyLS43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNMzkwLjExLDM3NS43OGMtMTIuMzctNy4zNS0yNS44OS0xMS42My0zOS43Ny0xNC45MmExOTcuMjUsMTk3LjI1LDAsMCwwLTU1LjY4LTUuMWMtMTMuMjEuNjYtMjYuMzEsMi41LTM4LjQ4LDguM2EzMi42MSwzMi42MSwwLDAsMC00LjIxLDIuNDNjLTkuODUsNi42LTExLjM1LDE1LjQtNC4yMywyNC45MSwxLjQ4LDIsMy4xMiwzLjgxLDUuMSw2LjIyLTYuMzksMC0xMi4wNS0xLjE5LTE3LjY5LTIuMzEtMTUuMTItMy0yOS4zMi04LjI0LTQxLjUtMTgtNS44Ni00LjY4LTExLjIyLTkuOTMtMTUuMTQtMTYuNDUsMS42LTIuNjEsNC4yOC0zLjgzLDYuNzgtNS4yNyw0LjgyLTIsOS4xOS00LjkxLDE0LTcuMDlhMjA3LjU1LDIwNy41NSwwLDAsMSw2Ny40LTE4YzkuMzItLjg3LDE4LjY1LTEuNzYsMjgtMS40MUEzMTEuMzgsMzExLjM4LDAsMCwxLDM3NiwzNDMuMjVjNi44LDIuMTIsMTMuNTIsNC40NSwyMC41OSw2Ljg0LDAtMi0xLjE0LTMuMTktMS45LTQuNDhBOTYuMTgsOTYuMTgsMCwwLDAsMzg1LDMzMS44OGMtMS4zMy0xLjU2LTMuMTgtMi45My0zLjE0LTUuMzMsMy43My44NSw3LjQ2LDEuNjgsMTEuMTgsMi41NiwxLC4yMywyLjE3LjgzLDIuODEsMCwuODUtMS4wOC0uNDMtMi0xLTIuODQtNS40OS04LjE5LTEyLjMzLTE1LjE3LTE5LjY3LTIxLjY4LDMuODktMi4yNiw3Ljg5LS40MiwxMS42OC4wNiwzOC44Nyw1LDc0LjI5LDE4LjgxLDEwNS4xOCw0Myw0MC45LDMyLjA5LDY3LjMzLDczLjU0LDc4LjQ3LDEyNC41MUExODAuNTQsMTgwLjU0LDAsMCwxLDU3My44Nyw1MjRjLTIuMTksMzAuMTEtMTEuNjUsNTcuOS0yOS40NSw4Mi41OC0xLjE3LDEuNjItMi43NSwyLjkxLTMuNjEsNC43Ni00LDYtMTAsMTAuMDgtMTUuNDQsMTQuNTItMjkuNTUsMjQtNjQsMzYuNDYtMTAxLjE0LDQyLjI4YTMxMC4zNCwzMTAuMzQsMCwwLDEtODcuMzEsMS41NCwyODguMTcsMjg4LjE3LDAsMCwxLTEyNy4zOS00OC4xNGMtOS4yNy02LjI5LTE4LjM2LTEyLjg1LTI2LjUxLTIwLjYyYS42NS42NSwwLDAsMSwwLTFjMS43NC0uNjksMi44NC41Nyw0LDEuNDNhMTg5LjA4LDE4OS4wOCwwLDAsMCw2NSwzMS41NiwyMjguNDYsMjI4LjQ2LDAsMCwwLDIzLjg3LDQuNzVjMS44Mi42NiwzLjc1LjM1LDUuNjIuNjZhNy41NSw3LjU1LDAsMCwxLDEuMTMuMjNjMTguMjQsMi4xNiwzNi4zNy44OSw1NC4zNi0yLjI4LDM5LjU0LTcsNzQuNjYtMjMuNTUsMTA0Ljc1LTUwLjE1LDIwLjUtMTguMTIsMzYuNjgtMzkuNTMsNDUuMjQtNjUuOTVzNy4zNS01Mi4xLTQuNjctNzcuNDhjLTIuNDcsMTEuMzgtOC40NCwyMC44LTE1LjkxLDI5LjM4YTEwNi4wOSwxMDYuMDksMCwwLDEtMjYuMDcsMjEuMTljLTEuMTQuNjYtMi40LDEuOTEtMy43MS45LTEuMTMtLjg2LS40NS0yLjM3LS4xLTMuNTFhMTM5LjY0LDEzOS42NCwwLDAsMCw0Ljk0LTI0LjJjMy41LTM0LjUxLTkuODItNjEuMzctMzcuMy04MS43NGExMTkuOCwxMTkuOCwwLDAsMC0xNC4wNi05IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzI2MmY3MSIvPjxwYXRoIGQ9Ik0yNzYuMDgsNjM4LjQxYTE1MS4xNiwxNTEuMTYsMCwwLDEtMjkuODYtNi4xQTE5OC41MywxOTguNTMsMCwwLDEsMTk0LjM1LDYwOGMtMy44My0yLjUxLTcuMDctNS44Ni0xMS4yNC03Ljg5LTIuMzktLjM0LTMuMzktMi42OC01LjMtMy43LTQwLjM4LTM1LjktNjgtODAtODMuODMtMTMxLjQ4QTI4MC41NCwyODAuNTQsMCwwLDEsODEuNjMsMzg3LjdjLjEtMiwuMi0zLjkzLjM2LTcsMiw0LjM2LDMuNDgsNy44Miw1LjA1LDExLjI2LDE0LjUzLDMxLjg2LDMzLjEzLDYwLjkzLDU4Ljc0LDg1LjEyQzE3Myw1MDIuODIsMjA0LjY4LDUyMCwyNDIsNTI2YzQzLjcxLDcuMTEsODQuNjEtLjUxLDEyMi4yMi0yNC4wNiwxOC43NS0xMS43NSwzNC4xNC0yNi45NCw0My00Ny42NSwxMC43Mi0yNS4xMSw2LjY4LTQ4LjQ0LTkuNjUtNjkuOTUtMS40My0xLjg4LTIuOTUtMy42OS00LjQzLTUuNTQsMS45NC0xLjY2LDMsLjI2LDQuMDcsMS4xOGE4My4yMiw4My4yMiwwLDAsMSwyMi42LDI5LjksODgsODgsMCwwLDEsNy44NSwzNS4xOSw3OS43NSw3OS43NSwwLDAsMS04LDM1Ljg3LDUuMzksNS4zOSwwLDAsMCwzLjI0LTEuMTcsOTguMzQsOTguMzQsMCwwLDAsMTQuNjUtMTAuMzVjMS40Mi0xLjIzLDIuNjctMy4wOCw1LTIuOGExNjUuMywxNjUuMywwLDAsMS02LjA5LDI3Ljc1LDEzMS43NCwxMzEuNzQsMCwwLDAsMTcuMjctMTEuNDhjNC4zMy0zLjM4LDcuODMtNy42MiwxMi4wOC0xMS4wNiwxLjgxLjc3LDEuODEsMi41NiwyLjIzLDQuMDgsNi45MiwyNSwxLjkxLDQ4LjI4LTEwLjQyLDcwLjMtMTUsMjYuNy0zNyw0Ni41Ny02Mi42Miw2Mi42NWEyMTMuMzMsMjEzLjMzLDAsMCwxLTY3LjI3LDI3LjU1LDE0Mi4yLDE0Mi4yLDAsMCwxLTQ1LjY3LDIuNjloMGMtMS45LTEtNC4wNy4xOS02LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNNjU0LjE3LDQ1My4wN2EyMTIsMjEyLDAsMCwwLTIwLjc3LTgyLjM1QTIxOC45LDIxOC45LDAsMCwwLDYwMywzMjRjLTEwLjktMTIuOTEtMjMuNDItMjMuOTMtMzYuNTYtMzQuMzgsMS4yMy0xLjIxLDIuNzYtMSw0LjI0LS44YTIzNi4yOCwyMzYuMjgsMCwwLDEsNTMuNzksMTIuNzhBODAuMiw4MC4yLDAsMCwxLDYzNywzMDcuNDNhNDAuMzgsNDAuMzgsMCwwLDEsNC4xNiwyLjQ0Yy4zNC4xOS41My42OSwxLC41OGExLjI3LDEuMjcsMCwwLDEtLjIxLTEuMzdjLTExLjg0LTE1LjQyLTI2LjE1LTI4LjI4LTQxLjE3LTQwLjVhMzAyLDMwMiwwLDAsMC01OC4xOC0zNi45LDI4Ny42NCwyODcuNjQsMCwwLDAtOTEuNTctMjcuNDVjLTIuODMtLjM1LTUuNzUsMC04LjUxLTEtLjI0LTEuODksMS4zNS0yLjUyLDIuNDUtMy40NCwxOC42Ny0xNS41NSwzMy42OS0zNCw0NC4yOC01NS45NGExNTcuMSwxNTcuMSwwLDAsMCw4LjE0LTIwLjUzYy42NC0yLDEtNC4xNywzLTUuNDRhMjg4LjE2LDI4OC4xNiwwLDAsMSw4OC40Nyw2NiwyOTIuMSwyOTIuMSwwLDAsMSw2Ni42NCwyNzBjLS44NC40Ni0xLS4yNi0xLjM0LS43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNNTQwLjgxLDYxMS4zN2MwLTIuOTQsMi4zNC00LjYsMy43OS02LjY2LDEzLjY2LTE5LjUxLDIyLTQxLjEyLDI2LjMxLTY0LjQ4LDIuNjctMTQuNDcsMi45LTI5LjA4LDItNDMuNTctMS40Ny0yMi4zNC03LjE4LTQzLjgzLTE2LjE5LTY0LjQyYTIxMi4yNSwyMTIuMjUsMCwwLDAtMjQuNzMtNDIuNTcsMjIxLjI0LDIyMS4yNCwwLDAsMC0zNi4xNi0zNy42MkEyMDcuNTYsMjA3LjU2LDAsMCwwLDQyNS4xOSwzMTRhMTk4LjEsMTk4LjEsMCwwLDAtNDIuMjUtOC42OWMtMi41OS0uMjMtNS4xNS0uODUtNy43OC0uNjktOS4xMy02LjczLTE4LjM5LTEzLjI0LTI4Ljc5LTE3Ljk0LDAtLjMzLDAtLjY3LjA3LTEsMy43NCwwLDcuNDkuMDYsMTEuMjMsMCw1Mi40My0uOTQsMTAwLjc1LDExLjkxLDE0Myw0My44NEM1NDQuNCwzNjIuNTksNTcxLjc0LDQwNi4zMiw1ODIsNDYwLjNjOC43Myw0Ni4wNSwyLDg5LjU0LTIzLjU2LDEyOS40NC01LDcuODUtMTAuNTMsMTUuNDEtMTcuNjEsMjEuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTUwMC40LDExNy45MWMtNS4yNSwxNi4wNS0xMS44NCwzMS40Ny0yMS4yNyw0NS41OWExNzIuNzgsMTcyLjc4LDAsMCwxLTM0LjQyLDM3LjczYy0uNzYuNjMtMS40NSwxLjM1LTIuMTcsMi00LjU4LDIuMzMtOC4zNSw1Ljg1LTEyLjU5LDguNjhhMjY3LjY4LDI2Ny42OCwwLDAsMS00OS4zOSwyNS41Myw4LjA5LDguMDksMCwwLDEtMS4yOS4zMmMtLjc2LTEuMTIuMTQtMS41My42LTIsOS44Mi05LjM1LDE1LjkxLTIwLjkyLDIwLTMzLjY2YTUsNSwwLDAsMSwzLjE3LTMuNjVjMzAuNTEtMTIuMDgsNTQuODYtMzIuMTUsNzQuOC01Ny45LDEuODEtMi4zNCwzLjU4LTQuNzEsNS44Mi03LjY2LTYuMTctLjEyLTEwLjksMy0xNi4xMiwzLjgyLTEsLjA2LTIuMjcuODgtMi41LTFhMjE1LjI3LDIxNS4yNywwLDAsMCw0MS44NC03NS42NWMuNTUtMS43OCwwLTQuMjMsMi40OC01LjEzYS40NC40NCwwLDAsMSwuMjUuNDVjMCwuMTgtLjA4LjI2LS4xMy4yNmEyMzAuNDksMjMwLjQ5LDAsMCwxLTguMzUsNTguNTYsMzYuODgsMzYuODgsMCwwLDAtLjY5LDMuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTM4MS44MiwzMjYuNTRhMTIwLDEyMCwwLDAsMSwxNi4wNiwyMi40Yy40My43OSwxLjU0LDEuNjguNTUsMi42MS0uNzUuNy0xLjYyLS4xNi0yLjQxLS40NmEzNDksMzQ5LDAsMCwwLTYyLjU2LTE3Yy0xMC43NS0xLjg1LTIxLjY2LTIuNjYtMzIuNTgtMy40NWExOTQuMDksMTk0LjA5LDAsMCwwLTI5LjQ1LjQyYy0yMi40MiwxLjgtNDQuMjQsNi41OS02NSwxNS41Ni02LjQsMi43Ny0xMi45NCw1LjI1LTE4Ljg5LDktLjY4LjQzLTEuNDksMS4xMy0yLjI3LjA2YTE5OS41OSwxOTkuNTksMCwwLDEsNTkuMi0yOC40MWMyOS4xNS04LjcsNTguOTMtMTAuODQsODkuMTUtOC40NmEzMjguNDIsMzI4LjQyLDAsMCwxLDQ1Ljc0LDYuOTUsMjEuOTIsMjEuOTIsMCwwLDEsMi40NC44MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzc0LjMyLDExNi4zOGg0LjVjMi40MiwxLDUuMDctLjI4LDcuNS43NGg0LjQ5Yy4zOCwyLjE3LTEuNDEsMy4wOC0yLjY1LDQuMTMtMjAuNzgsMTcuNTYtNDEuNDEsMzUuMjktNjIuMiw1Mi44My02Ljg3LDUuNzktMTMuNjgsMTEuNjUtMjAuNTQsMTcuNDVhNi4xNCw2LjE0LDAsMCwwLTIuMzUsMi44M2MtOSwzLjM3LTE3LjM2LDcuNi0yNCwxNC45NC0zLjEzLDMuNDgtNS4xOCw3LjUtNy40NCwxMS40Ni02LjE3LDQtMTEuMzYsOS4yNi0xNywxNC0xNC43NywxMi40Mi0yOS4zNSwyNS4wNi00NC4xNiwzNy40My0xLjI1LDEtMi4wNywyLjUtMy41MiwzLjMxLTIuNTUtMy44LTItOC0xLjM5LTEyLjEyLDEuODYtMy4wNiw0LjgtNSw3LjQ0LTcuMjhxMjEuNTQtMTguMjcsNDMtMzYuNTljMTQtMTEuODUsMjcuOTItMjMuNzcsNDEuOS0zNS42M3EyNC4xMi0yMC40NSw0OC4xNy00MWM4LjkzLTcuNiwxNy44LTE1LjI2LDI2Ljg2LTIyLjcxLDEuMzctMS4xMywyLjMzLTIsMS4yOC0zLjgxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzVjOTRjZSIvPjxwYXRoIGQ9Ik02MzcuNTEsMzA4LjQxYy0xNy42My04LjU2LTM2LjI3LTEzLjc4LTU1LjU0LTE2LjktNS4xNS0uODQtMTAuMy0xLjg3LTE1LjU1LTEuOTEtNi43Mi00LjI1LTEzLjMxLTguNzMtMjAuMTktMTIuN2EyMDkuNzMsMjA5LjczLDAsMCwwLTcyLjE4LTI1Ljc1LDkuMDksOS4wOSwwLDAsMS0xLjY1LS42NGM3LjY1LTEuNCwzMy42OSwyLjUxLDUxLjcyLDcuNDdhMjQzLjA3LDI0My4wNywwLDAsMSw0OC40NywxOWMtMS42Mi00Ljg1LTQuNTgtOC4xMy02LjM5LTEyLS4xOC0xLTEuNjMtMS45NC0uNjYtM3MyLjA3LjA4LDMsLjQ5YzIuNiwxLjE4LDUuMDgsMi42MSw3LjY5LDMuNzdhMzQ3LjUyLDM0Ny41MiwwLDAsMSw2MS40LDQwLjQ5YzEuMDYsMS40LDEuMDYsMS40LS4xMSwxLjY5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzE2MWY0MiIvPjxwYXRoIGQ9Ik0zNzQuMzIsMTE2LjM4Yy40NiwxLjEsMS45Mi4zLDIuNjEsMS41My00LjE4LDMuNjItOC4zNiw3LjMtMTIuNjEsMTAuOTFxLTExLjUxLDkuNzgtMjMuMDcsMTkuNDhRMzI0Ljg3LDE2Mi4xMywzMDguNSwxNzZjLTcuNTgsNi40NC0xNS4wNSwxMy0yMi42MywxOS40Ni05LjE4LDcuOC0xOC40NSwxNS41MS0yNy42NSwyMy4zLTcuMyw2LjE5LTE0LjUzLDEyLjQ3LTIxLjgyLDE4LjY4LTcuNjcsNi41Mi0xNS4zNywxMy0yMy4wNiwxOS40OWwtNy43MSw2LjQ3LDIuMTktOS43NmMtMS4yNC0zLjE5LDEuMzUtNC42MywzLjEzLTYuMSw3LTUuODQsMTMuODgtMTEuODEsMjAuODMtMTcuNzFxMjQuMjUtMjAuNTgsNDguNDktNDEuMjIsMjAuODQtMTcuNyw0MS42Ni0zNS4zOWMxMi45Mi0xMSwyNS45My0yMS45MSwzOC43Mi0zMy4wNywxLS44NiwyLjg1LTEuODcuMTUtMyw0LjQzLTEuNjEsOS0uMzMsMTMuNTItLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzY0OTdkMCIvPjxwYXRoIGQ9Ik0zNjAuOCwxMTcuMTFjMS4wNS4xOSwyLjItLjM3LDMuMy40OS0yLjY1LDMuOS02LjU1LDYuNDUtMTAsOS40NC05LjgyLDguNTYtMTkuNzksMTctMjkuNzQsMjUuMzctOS4xLDcuNjgtMTguMjksMTUuMjYtMjcuMzcsMjNzLTE4LjIzLDE1Ljc0LTI3LjQsMjMuNTQtMTguMjksMTUuMjctMjcuMzYsMjNTMjI0LDIzNy41OCwyMTQuODcsMjQ1LjQ1Yy0yLjc0LDIuMzctNi4zNyw0LTcuMDUsOC4xNS00Ljg0LjU1LTcuNCw0LjY0LTEwLjk0LDcuMTYtNS41OSw0LTkuODQsOS40Ny0xNSwxMy45NS01LjE5LDMuNjktOS43Nyw4LjEtMTQuNjEsMTIuMi0xNC4zOCwxMi4xOS0yOC43LDI0LjQ2LTQzLjEzLDM2LjU5LTIsMS42OC0zLjc3LDMuNjYtNiw1LjA2LTEsLjYyLTEuOTEsMS43OS0zLjMyLjgxYTE2LjksMTYuOSwwLDAsMSwxLjUxLTcuNTFjNy4xOS00LjU5LDEzLjE3LTEwLjY3LDE5LjY2LTE2LjEsMTcuODgtMTUsMzUuNjEtMzAuMTYsNTMuMzgtNDUuMjlzMzUuMy0zMC4xMyw1My00NS4xNXEyNi0yMiw1MS45NC00NC4wOGMxNy42OC0xNSwzNS40NC0zMCw1My00NS4xNSwzLjQ5LTMsNy4xNi01LjgzLDEwLjU2LTloMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMzk5LjgxLDExNy44N2M0LjA3LS4wNSw4LDEsMTIsMS41LDEuMDksMi4zOS0xLDMuMzItMi4yMyw0LjQzLTUsNC4zNy0xMC4yMyw4LjQ4LTE1LjEsMTMtLjUyLS42OS0xLjA4LTEuMzYtMS41Ni0yLjA5LTEuMTEtMS42NS0xLjg5LTEuMjEtMi42MS4zMy01LjksMTIuNjYtMTYuMDUsMjEuNDYtMjcuMSwyOS4zYTIwMi4xNCwyMDIuMTQsMCwwLDEtMzkuODcsMjEuNzljLS43Ni0xLjQ0LS44My0xLjUuNDctMi44NCwyLjY5LTIuNzgsNS43Ny01LjE0LDguNzItNy42NCwyMS4yOS0xOC4xLDQyLjY0LTM2LjEyLDYzLjgxLTU0LjM3LDEuMjMtMS4wNywyLjI5LTIuMywzLjQ3LTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTM5OS44MSwxMTcuODdhNC41NSw0LjU1LDAsMCwxLTEuNzUsMy4xNHEtMjAuNiwxNy40My00MS4xMywzNC45My0xNS43MiwxMy40LTMxLjM2LDI2Ljg5Yy0uOTQuODItMi43MSwxLjQtMi4yMywzLjNhMTg3LjQsMTg3LjQsMCwwLDEtMjAuMjcsOC4yNGMtMi4zMy0uNjQtLjQtMS40NywwLTEuODUsNC4wOS0zLjYyLDguMjMtNy4xOCwxMi4zOS0xMC43MnExMS40Ny05Ljc1LDIzLTE5LjQ3YzcuNTctNi40LDE1LjE4LTEyLjc3LDIyLjczLTE5LjE5czE1LjEyLTEyLjg3LDIyLjU3LTE5LjQyYzIuNDEtMi4xMiw1LjM2LTMuNjgsNy02LjU5LDMuMDYtLjQ0LDYsLjYsOSwuNzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTM0Ni42MSwyMDhjNy45Mi0zLjkyLDE2LjE5LTcuMjEsMjMuMS0xMi45MywxLjQ0LS4wNiwxLjI4Ljc2Ljk0LDEuNjktNi4zOCwyNi40Mi0yNi40Miw0My43Ny01My41Miw0Ni4zLTUuMjIuNDktMTAuNDMsMS4wOS0xNS42OS41OS42OC0xLjkzLDIuNTEtMS43Niw0LTIuMTcsNS44OC0xLjYsMTEuNzEtMy4zMSwxNy4xNi02LjEzLDEwLjIyLTUuMjgsMTcuNzEtMTMuMDcsMjItMjMuODRhOC4yMiw4LjIyLDAsMCwxLDIuMDUtMy41MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzQ2LjYxLDIwOGMtMy4yNiwxMi42LTExLjI5LDIxLjMxLTIyLjM5LDI3LjU1LTcuMTMsNC0xNSw1Ljg2LTIyLjc3LDguMS0xLjkxLTUuNTkuMTYtMTAuMzIsMy41Mi0xNC41NywzLjk0LTUsOS4zLTguMDgsMTUtMTAuNjlBMjc3LjA4LDI3Ny4wOCwwLDAsMSwzNDYuNjEsMjA4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQxOGFjOSIvPjxwYXRoIGQ9Ik0xMTQuOCwzMjkuMzdjNC40NS0xLjY1LDcuMzEtNS40MSwxMC44MS04LjI4LDExLjI5LTkuMjcsMjIuMzgtMTguNzgsMzMuNTEtMjguMjQsNS44NS01LDExLjYxLTEwLjA1LDE3LjQxLTE1LjA4LDEuNTgtMS4zNywzLjA1LTIuOTQsNS4zNC0zLjA2LTYsNy41Mi0xMS43MywxNS4yNC0xNiwyMy45M3EtMTcuMjUsMTQuNi0zNC40NCwyOS4yN2MtNS4zLDQuNTMtMTAuNzEsOC45NC0xNS45MywxMy41Ny0uOC43MS0xLjcsMS42LTIuOTQuNjRhNTQuMTMsNTQuMTMsMCwwLDEsMi4yNC0xMi43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2NDk3ZDAiLz48cGF0aCBkPSJNMTU4LjgxLDM0OS41OGMtMy41NC4yNy01LjE0LDMuNDQtNy40OCw1LjMzLTkuODUsNy45NS0xOS40NSwxNi4yMi0yOSwyNC40OS0zLjIsMi43Ni02LjMsNS42Mi05LjY5LDguMTYtMi4yMywxLjY4LTMuMDcsMS0zLTEuNTgsMC0zLjEyLDAtNi4yNCwwLTkuMzYsMy40Ni0zLjc1LDcuNjEtNi43MiwxMS40OC0xMCwxMS4xNy05LjQ4LDIyLjIzLTE5LjEsMzMuNTUtMjguNDIsMS0uOCwxLjc5LTIuMjYsMy40Ni0xLjMxbC43NSwxMi42OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA3LDI3NS40OGE0LjE3LDQuMTcsMCwwLDEsMS45MS0zLjA4YzktNy42LDE4LTE1LjE1LDI3LTIyLjc2LDcuMzktNi4yNSwxNC43Mi0xMi41NiwyMi4wNy0xOC44NywzLjg2LTMuMzEsNy42OS02LjY2LDExLjUyLTEwLC43My0uNjQsMS40MS0xLjEyLDIuMTIsMC0uODMsMy40MS0xLjgyLDYuNzktMS43MiwxMC4zNS00LDQuNDMtOC44OSw3LjkzLTEzLjQyLDExLjgtMTQsMTItMjcuOTUsMjMuOTMtNDIsMzUuNzZhMTEuMzQsMTEuMzQsMCwwLDAtMS40OCwxLjY4LDcuOTMsNy45MywwLDAsMS02LTQuODgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTExMi41NiwzNDIuMTJjMy4yNC0xLDUuMTMtMy44MSw3LjU2LTUuODIsMTMuMTctMTAuODksMjYuMTMtMjIsMzkuMTctMzMuMDgsMi4wNS0xLjczLDMuNDktNC4zMyw2LjU4LTQuNThhMTUwLjg5LDE1MC44OSwwLDAsMC02LDE4Yy0yLjM0LS4yMy0zLjUzLDEuNjQtNSwyLjg4LTEzLjU4LDExLjY3LTI3LjI4LDIzLjItNDAuOTIsMzQuOC0uODIuNjktMS41NSwxLjcxLTIuODksMS4yNmE0NC44OCw0NC44OCwwLDAsMSwxLjUtMTMuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1Yzk0Y2UiLz48cGF0aCBkPSJNMjEzLDI4MC4zNmMtLjkzLTEuNjguNjUtMi4yMywxLjQ3LTIuOTNxMTcuMi0xNC43MSwzNC40OS0yOS4zNCw5Ljc3LTguMjgsMTkuNTktMTYuNDlhNC4xNiw0LjE2LDAsMCwxLDEuMzgtLjQ3LDI5LjkyLDI5LjkyLDAsMCwwLDEuMzgsOWMtMy45Myw0LjU2LTguODcsOC0xMy4zOSwxMS44NnEtMTUuMTMsMTMtMzAuNDUsMjUuOTNhMy41LDMuNSwwLDAsMC0xLjU0LDJjLTQuMjYsMS41OC04LjU2LDIuMjEtMTIuOTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC4wNiwzMzYuODljLTQuMjEsMi40MS03LjU3LDUuOTEtMTEuMjcsOS05Ljc2LDgtMTkuMzcsMTYuMjUtMjguOTQsMjQuNS0yLjY0LDIuMjgtNSw0LjgyLTguMjgsNi4yNy4zOS00LS44NC04LjA4Ljc0LTEycTIyLjE3LTE4Ljk0LDQ0LjQ2LTM3Ljc2YzEtLjg2LDIuMDYtMS45MSwzLjY0LTEuMjMtLjEyLDMuNzUtLjIzLDcuNS0uMzUsMTEuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC40MSwzMjUuNjNjLTQuNzUsMi41NS04LjQyLDYuNS0xMi41Miw5Ljg4LTkuNjgsNy45NS0xOS4xNCwxNi4xNi0yOC43MywyNC4yMi0yLjE0LDEuODEtMy42NCw0LjU2LTYuODUsNC44OS4zOC0zLS44LTYuMTEuNzUtOXExNC0xMiwyOC4wNi0yMy45MmM2LjM0LTUuMzksMTIuNzQtMTAuNzEsMTkuMDctMTYuMSwyLTEuNzIsMS40Ny4xNywxLjY1LDEuMDhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1OTFjZCIvPjxwYXRoIGQ9Ik0yMjYsMjgwYy0xLjM4LTEtLjQxLTEuNzQuMzItMi4zNSw4LjgyLTcuNCwxNy42OC0xNC43NSwyNi40OS0yMi4xNiw1LjUtNC42MywxMC45My05LjM0LDE2LjM3LTE0YTMuNjYsMy42NiwwLDAsMSwyLjItMS4yOGwyLjI1LDQuNDljLTEuNzMsMi42Ny00LjUsNC4zMy02LjQ1LDYuNzktMTAuODMsMTItMjIuOTUsMjIuMTQtMzguMjksMjcuOTFBMTkuNTMsMTkuNTMsMCwwLDEsMjI2LDI4MCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0ODhkY2EiLz48cGF0aCBkPSJNMzk0LjQ4LDEzNi44YzEuMzYtNC4yNSw1Ljc3LTUuNDcsOC4zOC04LjQ3LDIuNzgtMy4xOSw3LjMzLTQuNjEsOC45NS05LDMuMjYsMCw2LjM4Ljg2LDkuNTUsMS40NSwyLjc0LjUxLDIuODYsMS43LDEsMy4zOS00LjA4LDMuNjQtOC4yLDcuMjYtMTIuMzQsMTAuODItMy44NiwzLjMyLTcuNzgsNi41Ny0xMS42OCw5Ljg1WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA5LjM3LDMwNy44MWMuNjYsMS42Ni0xLjMzLDIuNDktMS4xLDQtMS00LjU2LTMuNTEtNi4zMy04LjA4LTUuNDJhMjMuNjUsMjMuNjUsMCwwLDAtMTIuNjQsNy4zNWMtLjk0LDEtMiwxLjg5LTMsMi44NC0uODItMSwwLTEuODcuMzMtMi43NiwyLTYuNTEsNi4zOS0xMS4xNCwxMS45My0xNC44M2ExMi41NywxMi41NywwLDAsMSw0LjA2LTEuODVjNi40Mi0xLjUzLDkuOTQsMS42MSw5LjA2LDguMTJhOC4yOCw4LjI4LDAsMCwxLS42MSwyLjUzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyOGFjOSIvPjxwYXRoIGQ9Ik0yMDkuMzcsMzA3LjgxYzAtMSwuMDYtMiwuMDctMywuMTEtNi41NC0zLjYtOS05LjY3LTYuMjUtNywzLjItMTEuNDIsOC45Mi0xNC40OSwxNS43OS0uNzEuMTMtMS4wOC0uMDctLjg2LS44NiwyLjIxLTguMTYsNi40Ny0xNC45MiwxMy41Ni0xOS43M2ExNC44MiwxNC44MiwwLDAsMSw1Ljg1LTIuMjgsNi4yNSw2LjI1LDAsMCwxLDcuNDEsNC42MSwxNC44OCwxNC44OCwwLDAsMS0xLjg3LDExLjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTgyMTQ0Ii8+PHBhdGggZD0iTTI2Ny4xMywyNTEuNDFjLTEuMjYtMS0uMTUtMS40LjUyLTEuODcsMi4xMS0xLjQ3LDMuMjctNC4xLDUuOTMtNC45MiwzLjQsNS4zOCw4LjgzLDcuNzUsMTQuNDksOS43NywxLjE0LjQxLDIuMzMuNjcsNC4xOSwxLjE5LTguNzIsMi4yNy0xNi4yNCwxLjM5LTIzLjE1LTMuMzNhMywzLDAsMCwwLTItLjg0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQ1OGNjYSIvPjxwYXRoIGQ9Ik01NzYuMjIsMjY2LjIzYy0yLjc1LS4zMi00Ljg0LTIuMi03LjM0LTMuMTMtMS0uMzYtMS44OS0xLjY0LTIuOTItLjgtLjg1LjcuNTQsMS43NC4yNCwyLjcxLTEuNTMtMS4zNC0yLjA2LTMuMjYtMi44Ni01LjIxLDQuNDYsMS44NSw4LjkxLDMuNjQsMTIuODgsNi40MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2MzY1N2QiLz48cGF0aCBkPSJNNjM3LjUxLDMwOC40MWMuODEtLjUxLDAtMS4xMy4xMS0xLjY5bDQuMzUsMi4zNiwyLjM0LDNjLTIuODUtLjc2LTQuNzgtMi4zMS02LjgtMy42NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMyNjMxNTQiLz48cGF0aCBkPSJNNDY1LjE5LDI0OS4yNmExNC4yNiwxNC4yNiwwLDAsMSw2LC40NWMtMi4zMiwxLjI2LTMuOTIsMS4wOS02LS40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiNhMDlhYTkiLz48cGF0aCBkPSJNMTc3LjgxLDU5Ni4zNmMyLjMzLjQyLDMuMzksMi42Nyw1LjMsMy43TDE4Myw2MDFhMTQuMjIsMTQuMjIsMCwwLDEtNS4yMS00LjU5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyNGE3ZiIvPjxwYXRoIGQ9Ik02NTQuMTcsNDUzLjA3bDEuMzQuNzVjLjE5LDEuNTEtLjQ1LDIuNzUtMS4zNCw0LjZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzhjYjdkZSIvPjxwYXRoIGQ9Ik00NjUsMTM1Ljc5Yy41MSwxLjE1LDEuNjYuNjgsMi41LDFsLTQsMS41NWMtLjMxLTEuNTkuNzctMS45NSwxLjUxLTIuNTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNWE1ZDc2Ii8+PHBhdGggZD0iTTE4NC40MiwzMTMuNTFsLjg2Ljg2Yy0uMjMuNzQtLjQ1LDEuNDktLjY4LDIuMjNMMTgzLDMxOC42N2MuNDgtMi40Mi41MS0zLjksMS40My01LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzRmNjY4YSIvPjxwYXRoIGQ9Ik0zNzAuNjUsMTk2LjczYy0uMjItLjYyLS4xMy0xLjQtLjk0LTEuNjkuMjQtLjU4Ljg5LTEuMzksMS4xOS0xLjEuOS44Ny41MiwxLjkxLS4yNSwyLjc5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1NWE3MyIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZhNjEuNDQsNjEuNDQsMCwwLDEsNC41LTE1Ljc3YzguODItNi4xNSwxNi41OC0xMy42LDI0Ljc5LTIwLjVxMjEuMzUtMTgsNDIuNTMtMzYuMTQsMTkuMzUtMTYuNTUsMzguNzktMzMsMjEtMTcuOCw0Mi0zNS42NmMxMi43NC0xMC44MywyNS41Mi0yMS42MywzOC4yMS0zMi41Myw4LjktNy42NSwxOC0xNS4wNywyNi43NC0yMi44OGE1Myw1MywwLDAsMSwxNC4yNC0xLjUyLDEuNDQsMS40NCwwLDAsMSwxLjU0LS4xOGMxLjA2LDEuODEtLjI5LDIuODQtMS4zOSwzLjc2cS0xOC4xMywxNS4zNi0zNi4xOSwzMC44MVEyOTQuMjgsMTY4LjYzLDI3NSwxODVxLTE3Ljc5LDE1LjE4LTM1LjY0LDMwLjI5UTIxNy43LDIzMy42NywxOTYsMjUyLjFjLTE4LDE1LjI1LTM1Ljg4LDMwLjU5LTUzLjksNDUuNzktNyw1Ljg3LTEzLjgxLDExLjg4LTIwLjg3LDE3LjYzLS44OC43MS0yLjA3LDMtMy40Ny4zNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ZDljZDIiLz48cGF0aCBkPSJNMzM1LjMxLDExOS4zOGMtMS4yNiw0LjIxLTUuMzMsNS43OS04LjIyLDguMzYtOS40Nyw4LjQyLTE5LjI2LDE2LjQ5LTI4Ljk0LDI0LjY3LTEwLjgzLDkuMTMtMjEuNzIsMTguMi0zMi41MSwyNy4zOC05LjM4LDgtMTguNjIsMTYuMTEtMjgsMjQuMS05LjA5LDcuNzQtMTguMjksMTUuMzQtMjcuMzgsMjMuMDZzLTE4LjExLDE1LjU1LTI3LjIxLDIzLjI4LTE4LjI1LDE1LjM3LTI3LjM1LDIzLjA5Yy03LjQ5LDYuMzYtMTQuOTIsMTIuNzktMjIuMzksMTkuMTYtMywyLjU4LTYuMTEsNS4xLTkuMTYsNy42NS0uNjYuNTUtMS4yNi44Mi0xLjg2LDBhNjAsNjAsMCwwLDEsNS4yNS0xNWM2LjktNC4zNSwxMi42Ny0xMC4xLDE4Ljg2LTE1LjMycTIxLjMzLTE4LDQyLjUxLTM2LjEzLDIxLjkyLTE4Ljc1LDQzLjkyLTM3LjM5LDE4LjEtMTUuNDIsMzYuMjUtMzAuNzljMTUuNzMtMTMuMywzMS4zMy0yNi43Niw0Ny4xMy00MGE2Ljk0LDYuOTQsMCwwLDAsMi41OC0zLjEzYzUuMzEtMi4wNiwxMS0xLjkzLDE2LjUxLTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNzI5ZmQ0Ii8+PHBhdGggZD0iTTMxOC44LDEyMi4zNmMyLjMzLjYxLjQzLDEuNDYsMCwxLjg1LTQuMjUsMy44Mi04LjU0LDcuNjEtMTIuODksMTEuMzEtNy41Nyw2LjQzLTE1LjIsMTIuNzktMjIuNzksMTkuMnEtMTYuNjcsMTQtMzMuMjksMjguMTNjLTkuMDksNy43My0xOC4wOCwxNS41Ni0yNy4xNiwyMy4yOS05LjM2LDgtMTguNzksMTUuODUtMjguMTYsMjMuODItOS4wOCw3LjczLTE4LjA5LDE1LjU0LTI3LjE3LDIzLjI3UzE0OS4xLDI2OC42MSwxNDAsMjc2LjI5Yy0zLjMzLDIuOC02LjY0LDUuNjItMTAsOC4zNy0uNjYuNTQtMS4zNywxLjc2LTIuNDQuNDQsMS01LjE2LDMuNzItOS42MSw2LTE0LjI0LDEyLjMzLTEwLjU0LDI0LjcyLTIxLDM3LjA2LTMxLjU2cTE5LjA4LTE2LjI5LDM4LjIxLTMyLjUyLDE4LjI1LTE1LjUzLDM2LjUzLTMxUTI2NC42LDE1OS4zOSwyODMuODYsMTQzYzYuNjUtNS42NCwxMy4wOS0xMS41NCwxOS45NS0xNyw0Ljc1LTIuMjEsOS45LTIuODMsMTUtMy43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM3OGEyZDUiLz48cGF0aCBkPSJNMzAzLjgxLDEyNi4wN2MtNC43Niw2LjE5LTExLjIyLDEwLjU1LTE3LDE1LjYzLTcuNTcsNi42NC0xNS4zMiwxMy4wNS0yMywxOS41NS03LjQ5LDYuMzQtMTUsMTIuNjUtMjIuNDksMTlTMjI2LjM5LDE5MywyMTguOSwxOTkuNHMtMTUuMjEsMTIuOC0yMi43OSwxOS4yM2MtNy4zOSw2LjI4LTE0LjcxLDEyLjYzLTIyLjEsMTguOTFxLTE0LjA2LDEyLTI4LjE3LDIzLjg1Yy0zLjMyLDIuODEtNi42Niw1LjYtMTAsOC40YTMuNDMsMy40MywwLDAsMS0yLjMyLDEuMDcsOTkuOTMsOTkuOTMsMCwwLDEsOS0xOGMxNy4xMi0xMy45MSwzMy43Ny0yOC40LDUwLjU3LTQyLjcsMTkuNDUtMTYuNTcsMzktMzMsNTguMzQtNDkuNzMsMTAuOTQtOS40NSwyMi4zLTE4LjQxLDMyLjg1LTI4LjMyYTExMy40MywxMTMuNDMsMCwwLDEsMTkuNS02IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzdkYTVkNiIvPjxwYXRoIGQ9Ik0yODQuMzEsMTMyLjExYy43NSwxLjM0LS42LDEuNzQtMS4xOCwyLjI2cS0xMi40OCwxMC45NC0yNS4wNiwyMS43M2MtNy4zNSw2LjMxLTE0Ljc3LDEyLjU0LTIyLjE2LDE4LjhxLTEzLjc4LDExLjY3LTI3LjU4LDIzLjM0Yy03LjQ3LDYuMzUtMTQuOSwxMi43Ni0yMi4zOCwxOS4xMS05LjM3LDgtMTguNzgsMTUuODctMjguMTUsMjMuODJxLTUuODQsNS0xMS42MSwxMGE2LjQ1LDYuNDUsMCwwLDEtMy42NCwxLjc0LDE1OS4yNiwxNTkuMjYsMCwwLDEsMTYuNTItMjYuMjRjNS44LTQuMjcsMTEuMS05LjE2LDE2LjU5LTEzLjgxcTIxLjM5LTE4LjEyLDQyLjcyLTM2LjMyLDE2LjUtMTQuMDYsMzMtMjguMTRjMS43LTEuNDUsMy44My0yLjM4LDUuMTMtNC4yOSw4LjcyLTUuMjgsMTguMy04LjUzLDI3LjgyLTExLjk1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzgxYTdkOCIvPjxwYXRoIGQ9Ik00NDIuNTUsNDY2LjY0Yy03LjU1LDYuMTYtMTQuOTUsMTIuNTQtMjUsMTYuODFhODguODYsODguODYsMCwwLDAsNi42My0xOC4yNGM1LjkyLTI2LC40My00OS42Ni0xNC44Ny03MS4yNC0zLjc4LTUuMzItOC44Ni05LjQ0LTEzLjM2LTE0LjA5LS43My0uNzUtMS41Mi0xLjY5LTIuODMtMS4wNi0xLjM1LS42Ni0yLTItMy0zLC42NS0uODMsMS4zMi0uMzcsMiwwLDE4LjEzLDEwLjI4LDMzLjI0LDIzLjYyLDQyLjQ3LDQyLjY5YTg1LjIzLDg1LjIzLDAsMCwxLDguMTgsMzAsODYuODYsODYuODYsMCwwLDEtLjE3LDE4LjE3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzBlMWY2NiIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZjMywxLjA4LDQtMS45MSw1LjU0LTMuMTQsMTUuMjEtMTIuNTksMzAuMjEtMjUuNDQsNDUuMjMtMzguMjYsMTQuMTctMTIuMSwyOC4yNS0yNC4zMSw0Mi40NS0zNi4zOCwxNS44MS0xMy40MywzMS43NC0yNi43LDQ3LjU1LTQwLjEzLDE0LjItMTIuMDcsMjguMjgtMjQuMjcsNDIuNDQtMzYuMzhRMzI0LDE0MiwzNDcsMTIyLjRjMS41Ny0xLjM0LDMuODMtMiw0LjExLTQuNTMuODYtLjgyLDIuMTMuMDgsMy0uNzNsMy43NiwwYy0xLjE1LDQtNSw1LjM5LTcuNyw3LjgxLTcuNzYsNy0xNS44NSwxMy41OS0yMy44MiwyMC4zMy05LjExLDcuNy0xOC4yNiwxNS4zNi0yNy4zNiwyMy4wOC03LjM5LDYuMjctMTQuNzIsMTIuNjItMjIuMTIsMTguOS0xMC45LDkuMjQtMjEuODUsMTguNDItMzIuNzQsMjcuNjctNy40LDYuMjgtMTQuNzIsMTIuNjQtMjIuMSwxOC45Mi05LjM4LDgtMTguOCwxNS44OC0yOC4xOCwyMy44NS03LjM5LDYuMjgtMTQuNzEsMTIuNjQtMjIuMSwxOC45Mi03LjU3LDYuNDQtMTUuMjEsMTIuODEtMjIuNzgsMTkuMjVzLTE1LjA4LDEzLTIyLjY1LDE5LjQzYy0yLjY0LDIuMjUtNS4zOCw0LjQtOC4wOCw2LjYtLjY0LjUyLTEuMjUuODUtMS44NywwYTExLjc1LDExLjc1LDAsMCwxLDEuNDktNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2OTlhZDEiLz48cGF0aCBkPSJNMjU2LjQ5LDE0NC4wNmMtLjYzLDMuNTUtNC4wOSw0LjQ4LTYuMjksNi40Ni03LjY2LDYuODktMTUuNjMsMTMuNDMtMjMuNDksMjAuMDgtOS4yLDcuNzctMTguNDIsMTUuNS0yNy42LDIzLjI5LTcuMzksNi4yNi0xNC43MywxMi41OS0yMi4wOCwxOC44OXEtOC4wNiw2LjktMTYuMSwxMy44M2MtLjYzLjU0LTEuMjQuODctMS44NiwwYTE0MS43MiwxNDEuNzIsMCwwLDEsMTMuMTQtMTcuMTFjMTcuNjUtMjAuNSwzNy43LTM4LjMsNjAuNzMtNTIuNiw3LjYtNC43MSwxNS4xNC05LjYsMjMuNTUtMTIuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjODhhYmQ5Ii8+PHBhdGggZD0iTTM4Ni4zMiwxMTcuMTJjLTIuNDktLjMzLTUuMTMuNzctNy41LS43NCwyLjQ5LjMyLDUuMTItLjc4LDcuNS43NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1NTkxY2QiLz48cGF0aCBkPSJNMzU0LjA1LDExNy4xNGMtLjc5LDEuMDctMiwuNjItMywuNzNoLTEuNTFjMS4zMy0xLjMsMy0uNTIsNC41LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMjgyLjA2LDYzOS4xMmExODIuMywxODIuMywwLDAsMCw3MS44MS0xMS4zMSwyMTQsMjE0LDAsMCwwLDYxLjYxLTM0LjY3YzE4LjA5LTE0LjY4LDMzLjY2LTMxLjUzLDQ0LjA2LTUyLjYxYTEwMS4zNiwxMDEuMzYsMCwwLDAsMTAuMjItMzZjMS0xMS4zMS0uODgtMjItMy45NS0zMi42NC4zNC0yLjYxLDIuNzItMy44LDQuMTEtNS42Myw1LjM4LTcuMDcsOS4zNS0xNC42OSwxMS0yMy40NmEyNy40MywyNy40MywwLDAsMSwxLjIxLTMuNDMsMTExLDExMSwwLDAsMSw4LDIxLjE2YzIuNjMsMTAuMzEsNC4xMSwyMC44LDMuMzMsMzEuNGExMjMuMzEsMTIzLjMxLDAsMCwxLTE2LjA2LDUyLjMyYy05LjE2LDE2LjE1LTIxLDMwLTM0LjYsNDIuMzdhMTk5Ljg5LDE5OS44OSwwLDAsMS0zOS4zNywyNy41NCwyMTkuNSwyMTkuNSwwLDAsMS01NC4yNiwyMC43MSwyMDkuMjcsMjA5LjI3LDAsMCwxLTM2LjA1LDUuMmMtNS44NS4zMy0xMS43MS44My0xNy41Mi40Ni00LjUxLS4yOS05LjE0LDAtMTMuNTYtMS4zNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMwZTFmNjYiLz48L2c+PC9zdmc+',
    router: {
      address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      api: UniswapV2.ROUTER
    },
    factory: {
      address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
      api: UniswapV2.FACTORY
    },
    pair: {
      api: UniswapV2.PAIR
    },
    slippage: true,
  };

  var quickswap = new Exchange(

    Object.assign(exchange$7, {
      findPath: ({ tokenIn, tokenOut })=>
        UniswapV2.findPath(blockchain$6, exchange$7, { tokenIn, tokenOut }),
      pathExists: (path)=>
        UniswapV2.pathExists(blockchain$6, exchange$7, path),
      getAmounts: ({ path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin })=>
        UniswapV2.getAmounts(blockchain$6, exchange$7, { path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin }),
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        UniswapV2.getTransaction(blockchain$6, exchange$7 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain$5 = Blockchains__default['default'].fantom;

  const exchange$6 = {
    blockchain: 'fantom',
    name: 'spookyswap',
    alternativeNames: [],
    label: 'SpookySwap',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNjQxIDY0MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjQxIDY0MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGZpbGw9IiMxMjExMjIiIGQ9Ik0zNC4yLDMyMGMwLDE1OC41LDEyOC41LDI4Ni4zLDI4Ni4zLDI4Ni4zYzE1OC41LDAsMjg2LjMtMTI4LjUsMjg2LjMtMjg2LjNjMC0xNTguNS0xMjguNS0yODYuMy0yODYuMy0yODYuMwoJCUMxNjIuNywzMy43LDM0LjIsMTYyLjIsMzQuMiwzMjBMMzQuMiwzMjB6Ii8+Cgk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0YyRjRGOCIgZD0iTTEyMC45LDI0Ny42Yy0zLjMsMjIuMiwwLjcsNDUuNyw0LjYsNjcuOGMyLDMuMyw1LjIsNS45LDkuOCw3LjJjLTkuMSwxOS42LTE0LjMsNDAuNC0xNC4zLDYyLjYKCQljMCw5My4zLDkwLDE2OC45LDIwMS41LDE2OC45UzUyNCw0NzguNSw1MjQsMzg1LjJjMC0yMS41LTUuMi00My0xNC4zLTYyLjZjMy45LTEuMyw2LjUtMy45LDcuOC03LjJjNC42LTIyLjIsOC41LTQ1LjcsNS4yLTY3LjgKCQljLTMuMy0zMC0xMy43LTM5LjgtNDUtMzJjLTE1LjcsMy45LTM2LjUsMTMtNTIuOCwyNC4xYy0zMC0xNS02NS4yLTIzLjUtMTAyLjQtMjMuNWMtMzcuOCwwLTczLjcsOS4xLTEwMy43LDI0LjEKCQljLTE2LjMtMTEuMS0zNy4yLTIwLjktNTMuNS0yNC44QzEzNCwyMDcuOCwxMjQuMiwyMTcuNiwxMjAuOSwyNDcuNkwxMjAuOSwyNDcuNnogTTIzOC4zLDM4MC43Yy0yMy41LTEwLjQtNjMuOS03LjgtNjMuOS03LjgKCQlzMiwzNy44LDI0LjgsNTAuOWMyNy40LDE1LDc4LjksNy44LDc4LjksNy44UzI3My41LDM5Ni4zLDIzOC4zLDM4MC43TDIzOC4zLDM4MC43eiBNMzY5LjQsNDMyLjJjMCwwLDUwLjksNy44LDc4LjktNy44CgkJYzIzLjUtMTMsMjQuOC01MC45LDI0LjgtNTAuOXMtNDAuNC0yLjYtNjMuOSw3LjhDMzc0LDM5Ni4zLDM2OS40LDQzMS41LDM2OS40LDQzMi4yTDM2OS40LDQzMi4yeiBNMzEyLjcsNDU4LjkKCQljMCwyLjYsNS4yLDUuMiwxMS43LDUuMnMxMS43LTIsMTEuNy01LjJjMC0yLjYtNS4yLTUuMi0xMS43LTUuMkMzMTcuOSw0NTMuNywzMTIuNyw0NTUuNywzMTIuNyw0NTguOUwzMTIuNyw0NTguOXoiLz4KCTxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRjJGNEY4IiBkPSJNNTUyLjcsNDM1LjRjLTE4LjktNy4yLTM5LjEtMTEuMS01OS4zLTExLjFjLTUuMiwwLTUuMi03LjgsMC03LjhjMjAuOSwwLDQxLjcsMy45LDYxLjMsMTEuNwoJCWMyLDAuNywzLjMsMi42LDIuNiw0LjZDNTU2LjYsNDM0LjgsNTU0LjYsNDM2LjEsNTUyLjcsNDM1LjRMNTUyLjcsNDM1LjR6IE05Mi4yLDQyNy42YzE5LjYtNy44LDQwLjQtMTEuMSw2MS4zLTExLjcKCQljNS4yLDAsNS4yLDcuOCwwLDcuOGMtMjAuMiwwLTQwLjQsMy45LTU5LjMsMTEuMWMtMiwwLjctNC42LTAuNy01LjItMi42Qzg5LDQzMC45LDkwLjMsNDI4LjMsOTIuMiw0MjcuNkw5Mi4yLDQyNy42eiBNMTMyLjcsNDUwLjQKCQljOS44LTMuMywyMC4yLTQuNiwzMC01LjJjNS4yLDAsNS4yLDcuOCwwLDcuOGMtOS4xLDAtMTguOSwyLTI3LjQsNC42Yy04LjUsMi42LTE3LjYsNS45LTI0LjEsMTEuN2MtMy45LDMuMy05LjEtMi01LjktNS45CgkJQzExMy4xLDQ1NywxMjMuNSw0NTMuNywxMzIuNyw0NTAuNEwxMzIuNyw0NTAuNHogTTE3MS44LDQ2NS40Yy03LjgsMy4zLTE1LjcsNy44LTIyLjgsMTIuNGMtNy4yLDQuNi0xMy43LDEwLjQtMTguOSwxNwoJCWMtMS4zLDItMC43LDQuNiwxLjMsNS4yYzIsMS4zLDQuNiwwLjcsNS4yLTEuM2M0LjYtNS45LDExLjEtMTEuMSwxNy0xNWM3LjItNC42LDE0LjMtOC41LDIxLjUtMTEuN2MyLTEuMywyLjYtMy4zLDEuMy01LjIKCQlDMTc2LjQsNDY0LjgsMTczLjgsNDY0LjEsMTcxLjgsNDY1LjRMMTcxLjgsNDY1LjR6IE00ODMuNSw0NTMuN2M5LjEsMCwxOC45LDIsMjcuNCw0LjZjNC42LDEuMyw5LjEsMy4zLDEzLjcsNS4yCgkJYzMuOSwxLjMsNy4yLDMuOSwxMC40LDYuNWMzLjksMy4zLDkuMS0yLDUuOS01LjljLTcuMi02LjUtMTcuNi0xMC40LTI2LjctMTNjLTkuOC0zLjMtMjAuMi00LjYtMzAtNS4yCgkJQzQ3OSw0NDUuMiw0NzksNDUzLjcsNDgzLjUsNDUzLjdMNDgzLjUsNDUzLjd6IE00OTIuNyw0ODMuN2MtNy4yLTQuNi0xNC4zLTcuOC0yMS41LTExLjFsMCwwYy0yLTEuMy0yLjYtMy4zLTEuMy01LjIKCQljMS4zLTIsMy4zLTIuNiw1LjItMS4zYzE1LjcsNi41LDMyLDE1LjcsNDEuNywyOS4zYzEuMywyLDAuNyw0LjYtMS4zLDUuMmMtMiwxLjMtNC42LDAuNy01LjItMS4zCgkJQzUwNS43LDQ5Mi44LDQ5OS4yLDQ4Ny42LDQ5Mi43LDQ4My43TDQ5Mi43LDQ4My43eiIvPgoJPHBhdGggZmlsbD0iIzY2NjVERCIgZD0iTTYyLjIsMzM1LjdjMy45LTUuOSwzNS45LTIyLjgsNzUuNy0zMy4zYzguNS0yNC44LDE5LjYtNDguMywzMi03MS4xbDMyLTU4Yy05LjEtMy45LTE4LjMtOS4xLTI2LjctMTUKCQljLTEuMy0xLjMtMi42LTIuNi0zLjktMy45Yy0wLjctMS4zLTEuMy0zLjMtMS4zLTQuNnMyLTMuOSwyLjYtNC42YzItMi42LDQuNi00LjYsNy4yLTcuMmM1LjktNS4yLDEyLjQtOS44LDE5LjYtMTMuNwoJCWMzLjMtMiw2LjUtMy45LDkuOC02LjVjMjIuOC0xNC4zLDM1LjktMjUuNCw1Ni43LTM3LjhjMjAuMi0xMS43LDMwLTE4LjMsNTIuOC0xNy42YzI5LjMsMCwxMDEuNyw5Mi42LDEzNC4zLDE0MC4yCgkJYzE5LjYsMjguNyw0Ni4zLDgwLjIsNTYuMSw5OS44YzIsMC43LDQuNiwxLjMsNi41LDJjMzAsOS4xLDU4LjcsMjIuMiw2NS45LDMwLjdjNi41LDcuMi0yMS41LDEwLjQtNDguOSwxNS43CgkJYy0yNy40LDQuNi0xMjAuNyw3LjItMjEwLDcuOGMtODkuMywwLjctMTkzLjctMi42LTIxNi41LTUuOUM4My4xLDM0OS4zLDU3LjcsMzQyLjgsNjIuMiwzMzUuN0w2Mi4yLDMzNS43eiIvPgoJPHBhdGggZmlsbD0iI0ZGOTlBNSIgZD0iTTQ4My41LDI1Ni4xYzAsMC01OC43LTE1LTE2Mi40LTE1Yy0xMTEuNSwwLTE2NSwxNy0xNjUsMTdzLTYuNSwxMi40LTkuMSwxOC45Yy0yLjYsNy4yLTkuMSwyNS40LTkuMSwyNS40CgkJUzIxOC44LDI4OCwzMjIuNSwyODhjNjIuNiwwLDEyNC42LDUuMiwxODYuNSwxNS43YzAsMC05LjEtMjIuMi0xNS0zMS4zQzQ5MC43LDI2Ny4yLDQ4Ny41LDI2MS4zLDQ4My41LDI1Ni4xTDQ4My41LDI1Ni4xeiIvPgoJPHBhdGggZmlsbD0iI0ZGRTYwMCIgZD0iTTEzMy4zLDEzMS41YzYuNS0wLjcsMTUuNywxOS42LDE1LjcsMTkuNnMyMC45LTUuOSwyNC44LDBjMy4zLDUuOS0xNSwxOS42LTE1LDE5LjZzMTEuMSwxOS42LDcuMiwyMy41CgkJYy0zLjMsMy45LTIyLjgtOC41LTIyLjgtOC41cy0xNSwxNy0xOS42LDE0LjNjLTUuMi0yLjYsMC43LTI0LjgsMC43LTI0LjhzLTIxLjUtOS4xLTE5LjYtMTQuM2MxLjMtNS4yLDIzLjUtNy4yLDIzLjUtNy4yCgkJUzEyNi44LDEzMi44LDEzMy4zLDEzMS41TDEzMy4zLDEzMS41eiIvPgo8L2c+Cjwvc3ZnPgo=',
    router: {
      address: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
      api: UniswapV2.ROUTER
    },
    factory: {
      address: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
      api: UniswapV2.FACTORY
    },
    pair: {
      api: UniswapV2.PAIR
    },
    slippage: true,
  };

  var spookyswap = new Exchange(

    Object.assign(exchange$6, {
      findPath: ({ tokenIn, tokenOut })=>
        UniswapV2.findPath(blockchain$5, exchange$6, { tokenIn, tokenOut }),
      pathExists: (path)=>
        UniswapV2.pathExists(blockchain$5, exchange$6, path),
      getAmounts: ({ path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin })=>
        UniswapV2.getAmounts(blockchain$5, exchange$6, { path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin }),
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        UniswapV2.getTransaction(blockchain$5, exchange$6 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain$4 = Blockchains__default['default'].ethereum;

  const exchange$5 = {
    blockchain: 'ethereum',
    name: 'uniswap_v2',
    alternativeNames: [],
    label: 'Uniswap v2',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQxIiBoZWlnaHQ9IjY0MCIgdmlld0JveD0iMCAwIDY0MSA2NDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMjQuNTM0IDEyMy4yMjZDMjE4LjY5MiAxMjIuMzIgMjE4LjQ0NSAxMjIuMjEzIDIyMS4xOTUgMTIxLjc5MUMyMjYuNDY0IDEyMC45OCAyMzguOTA1IDEyMi4wODUgMjQ3LjQ3OSAxMjQuMTIzQzI2Ny40OTQgMTI4Ljg4MSAyODUuNzA3IDE0MS4wNjkgMzA1LjE0OCAxNjIuNzE0TDMxMC4zMTMgMTY4LjQ2NUwzMTcuNzAxIDE2Ny4yNzdDMzQ4LjgyOCAxNjIuMjc1IDM4MC40OTMgMTY2LjI1IDQwNi45NzggMTc4LjQ4NUM0MTQuMjY0IDE4MS44NTEgNDI1Ljc1MiAxODguNTUyIDQyNy4xODcgMTkwLjI3NEM0MjcuNjQ1IDE5MC44MjIgNDI4LjQ4NSAxOTQuMzU1IDQyOS4wNTMgMTk4LjEyNEM0MzEuMDIgMjExLjE2NCA0MzAuMDM2IDIyMS4xNiA0MjYuMDQ3IDIyOC42MjVDNDIzLjg3NyAyMzIuNjg4IDQyMy43NTYgMjMzLjk3NSA0MjUuMjE1IDIzNy40NTJDNDI2LjM4IDI0MC4yMjcgNDI5LjYyNyAyNDIuMjggNDMyLjg0MyAyNDIuMjc2QzQzOS40MjUgMjQyLjI2NyA0NDYuNTA5IDIzMS42MjcgNDQ5Ljc5MSAyMTYuODIzTDQ1MS4wOTUgMjEwLjk0M0w0NTMuNjc4IDIxMy44NjhDNDY3Ljg0NiAyMjkuOTIgNDc4Ljk3NCAyNTEuODExIDQ4MC44ODUgMjY3LjM5M0w0ODEuMzgzIDI3MS40NTVMNDc5LjAwMiAyNjcuNzYyQzQ3NC45MDMgMjYxLjQwNyA0NzAuNzg1IDI1Ny4wOCA0NjUuNTEyIDI1My41OTFDNDU2LjAwNiAyNDcuMzAxIDQ0NS45NTUgMjQ1LjE2MSA0MTkuMzM3IDI0My43NThDMzk1LjI5NiAyNDIuNDkxIDM4MS42OSAyNDAuNDM4IDM2OC4xOTggMjM2LjAzOEMzNDUuMjQ0IDIyOC41NTQgMzMzLjY3MiAyMTguNTg3IDMwNi40MDUgMTgyLjgxMkMyOTQuMjk0IDE2Ni45MjMgMjg2LjgwOCAxNTguMTMxIDI3OS4zNjIgMTUxLjA1MUMyNjIuNDQyIDEzNC45NjQgMjQ1LjgxNiAxMjYuNTI3IDIyNC41MzQgMTIzLjIyNloiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTQzMi42MSAxNTguNzA0QzQzMy4yMTUgMTQ4LjA1NyA0MzQuNjU5IDE0MS4wMzMgNDM3LjU2MiAxMzQuNjJDNDM4LjcxMSAxMzIuMDgxIDQzOS43ODggMTMwLjAwMyA0MzkuOTU0IDEzMC4wMDNDNDQwLjEyIDEzMC4wMDMgNDM5LjYyMSAxMzEuODc3IDQzOC44NDQgMTM0LjE2N0M0MzYuNzMzIDE0MC4zOTIgNDM2LjM4NyAxNDguOTA1IDQzNy44NCAxNTguODExQzQzOS42ODYgMTcxLjM3OSA0NDAuNzM1IDE3My4xOTIgNDU0LjAxOSAxODYuNzY5QzQ2MC4yNSAxOTMuMTM3IDQ2Ny40OTcgMjAxLjE2OCA0NzAuMTI0IDIwNC42MTZMNDc0LjkwMSAyMTAuODg2TDQ3MC4xMjQgMjA2LjQwNUM0NjQuMjgyIDIwMC45MjYgNDUwLjg0NyAxOTAuMjQgNDQ3Ljg3OSAxODguNzEyQzQ0NS44OSAxODcuNjg4IDQ0NS41OTQgMTg3LjcwNSA0NDQuMzY2IDE4OC45MjdDNDQzLjIzNSAxOTAuMDUzIDQ0Mi45OTcgMTkxLjc0NCA0NDIuODQgMTk5Ljc0MUM0NDIuNTk2IDIxMi4yMDQgNDQwLjg5NyAyMjAuMjA0IDQzNi43OTcgMjI4LjIwM0M0MzQuNTggMjMyLjUyOSA0MzQuMjMgMjMxLjYwNiA0MzYuMjM3IDIyNi43MjNDNDM3LjczNSAyMjMuMDc3IDQzNy44ODcgMjIxLjQ3NCA0MzcuODc2IDIwOS40MDhDNDM3Ljg1MyAxODUuMTY3IDQzNC45NzUgMTc5LjMzOSA0MTguMDk3IDE2OS4zNTVDNDEzLjgyMSAxNjYuODI2IDQwNi43NzYgMTYzLjE3OCA0MDIuNDQyIDE2MS4yNDlDMzk4LjEwNyAxNTkuMzIgMzk0LjY2NCAxNTcuNjM5IDM5NC43ODkgMTU3LjUxNEMzOTUuMjY3IDE1Ny4wMzggNDExLjcyNyAxNjEuODQyIDQxOC4zNTIgMTY0LjM5QzQyOC4yMDYgMTY4LjE4MSA0MjkuODMzIDE2OC42NzIgNDMxLjAzIDE2OC4yMTVDNDMxLjgzMiAxNjcuOTA5IDQzMi4yMiAxNjUuNTcyIDQzMi42MSAxNTguNzA0WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMjM1Ljg4MyAyMDAuMTc1QzIyNC4wMjIgMTgzLjg0NiAyMTYuNjg0IDE1OC44MDkgMjE4LjI3MiAxNDAuMDkzTDIxOC43NjQgMTM0LjMwMUwyMjEuNDYzIDEzNC43OTRDMjI2LjUzNCAxMzUuNzE5IDIzNS4yNzUgMTM4Ljk3MyAyMzkuMzY5IDE0MS40NTlDMjUwLjYwMiAxNDguMjgxIDI1NS40NjUgMTU3LjI2MyAyNjAuNDEzIDE4MC4zMjhDMjYxLjg2MiAxODcuMDgzIDI2My43NjMgMTk0LjcyOCAyNjQuNjM4IDE5Ny4zMTdDMjY2LjA0NyAyMDEuNDgzIDI3MS4zNjkgMjExLjIxNCAyNzUuNjk2IDIxNy41MzRDMjc4LjgxMyAyMjIuMDg1IDI3Ni43NDMgMjI0LjI0MiAyNjkuODUzIDIyMy42MkMyNTkuMzMxIDIyMi42NyAyNDUuMDc4IDIxMi44MzQgMjM1Ljg4MyAyMDAuMTc1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNNDE4LjIyMyAzMjEuNzA3QzM2Mi43OTMgMjk5LjM4OSAzNDMuMjcxIDI4MC4wMTcgMzQzLjI3MSAyNDcuMzMxQzM0My4yNzEgMjQyLjUyMSAzNDMuNDM3IDIzOC41ODUgMzQzLjYzOCAyMzguNTg1QzM0My44NCAyMzguNTg1IDM0NS45ODUgMjQwLjE3MyAzNDguNDA0IDI0Mi4xMTNDMzU5LjY0NCAyNTEuMTI4IDM3Mi4yMzEgMjU0Ljk3OSA0MDcuMDc2IDI2MC4wNjJDNDI3LjU4IDI2My4wNTQgNDM5LjExOSAyNjUuNDcgNDQ5Ljc2MyAyNjlDNDgzLjU5NSAyODAuMjIgNTA0LjUyNyAzMDIuOTkgNTA5LjUxOCAzMzQuMDA0QzUxMC45NjkgMzQzLjAxNiA1MTAuMTE4IDM1OS45MTUgNTA3Ljc2NiAzNjguODIyQzUwNS45MSAzNzUuODU3IDUwMC4yNDUgMzg4LjUzNyA0OTguNzQyIDM4OS4wMjNDNDk4LjMyNSAzODkuMTU4IDQ5Ny45MTcgMzg3LjU2MiA0OTcuODEgMzg1LjM4OUM0OTcuMjQgMzczLjc0NCA0OTEuMzU1IDM2Mi40MDYgNDgxLjQ3MiAzNTMuOTEzQzQ3MC4yMzUgMzQ0LjI1NyA0NTUuMTM3IDMzNi41NjkgNDE4LjIyMyAzMjEuNzA3WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMzc5LjMxIDMzMC45NzhDMzc4LjYxNSAzMjYuODQ2IDM3Ny40MTEgMzIxLjU2OCAzNzYuNjMzIDMxOS4yNUwzNzUuMjE5IDMxNS4wMzZMMzc3Ljg0NiAzMTcuOTg1QzM4MS40ODEgMzIyLjA2NSAzODQuMzU0IDMyNy4yODcgMzg2Ljc4OSAzMzQuMjQxQzM4OC42NDcgMzM5LjU0OSAzODguODU2IDM0MS4xMjcgMzg4Ljg0MiAzNDkuNzUzQzM4OC44MjggMzU4LjIyMSAzODguNTk2IDM1OS45OTYgMzg2Ljg4IDM2NC43NzNDMzg0LjE3NCAzNzIuMzA3IDM4MC44MTYgMzc3LjY0OSAzNzUuMTgxIDM4My4zODNDMzY1LjA1NiAzOTMuNjg4IDM1Mi4wMzggMzk5LjM5MyAzMzMuMjUzIDQwMS43NkMzMjkuOTg3IDQwMi4xNzEgMzIwLjQ3IDQwMi44NjQgMzEyLjEwMyA0MDMuMjk5QzI5MS4wMTYgNDA0LjM5NSAyNzcuMTM4IDQwNi42NjEgMjY0LjY2OCA0MTEuMDRDMjYyLjg3NSA0MTEuNjcgMjYxLjI3NCA0MTIuMDUyIDI2MS4xMTIgNDExLjg5QzI2MC42MDcgNDExLjM4OCAyNjkuMDk4IDQwNi4zMjYgMjc2LjExMSA0MDIuOTQ4QzI4NS45OTkgMzk4LjE4NSAyOTUuODQyIDM5NS41ODYgMzE3Ljg5NyAzOTEuOTEzQzMyOC43OTIgMzkwLjA5OCAzNDAuMDQzIDM4Ny44OTcgMzQyLjkgMzg3LjAyMUMzNjkuODggMzc4Ljc0OSAzODMuNzQ4IDM1Ny40MDIgMzc5LjMxIDMzMC45NzhaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGQ9Ik00MDQuNzE5IDM3Ni4xMDVDMzk3LjM1NSAzNjAuMjczIDM5NS42NjQgMzQ0Ljk4OCAzOTkuNjk4IDMzMC43MzJDNDAwLjEzIDMyOS4yMDkgNDAwLjgyNCAzMjcuOTYyIDQwMS4yNDIgMzI3Ljk2MkM0MDEuNjU5IDMyNy45NjIgNDAzLjM5NyAzMjguOTAyIDQwNS4xMDMgMzMwLjA1QzQwOC40OTcgMzMyLjMzNSA0MTUuMzAzIDMzNi4xODIgNDMzLjQzNyAzNDYuMDY5QzQ1Ni4wNjUgMzU4LjQwNiA0NjguOTY2IDM2Ny45NTkgNDc3Ljc0IDM3OC44NzNDNDg1LjQyMyAzODguNDMyIDQ5MC4xNzggMzk5LjMxOCA0OTIuNDY3IDQxMi41OTNDNDkzLjc2MiA0MjAuMTEzIDQ5My4wMDMgNDM4LjIwNiA0OTEuMDc0IDQ0NS43NzhDNDg0Ljk5IDQ2OS42NTMgNDcwLjg1IDQ4OC40MDYgNDUwLjY4MiA0OTkuMzQ5QzQ0Ny43MjcgNTAwLjk1MiA0NDUuMDc1IDUwMi4yNjkgNDQ0Ljc4OCA1MDIuMjc1QzQ0NC41MDEgNTAyLjI4IDQ0NS41NzcgNDk5LjU0MyA0NDcuMTggNDk2LjE5MUM0NTMuOTY1IDQ4Mi4wMDkgNDU0LjczNyA0NjguMjE0IDQ0OS42MDggNDUyLjg1OUM0NDYuNDY3IDQ0My40NTcgNDQwLjA2NCA0MzEuOTg1IDQyNy4xMzUgNDEyLjU5NkM0MTIuMTAzIDM5MC4wNTQgNDA4LjQxNyAzODQuMDU0IDQwNC43MTkgMzc2LjEwNVoiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTE5Ni41MTkgNDYxLjUyNUMyMTcuMDg5IDQ0NC4xNTcgMjQyLjY4MiA0MzEuODE5IDI2NS45OTYgNDI4LjAzMkMyNzYuMDQzIDQyNi4zOTkgMjkyLjc4IDQyNy4wNDcgMzAyLjA4NCA0MjkuNDI4QzMxNi45OTggNDMzLjI0NSAzMzAuMzM4IDQ0MS43OTMgMzM3LjI3NiA0NTEuOTc4QzM0NC4wNTcgNDYxLjkzMiAzNDYuOTY2IDQ3MC42MDYgMzQ5Ljk5NSA0ODkuOTA2QzM1MS4xODkgNDk3LjUxOSAzNTIuNDg5IDUwNS4xNjQgMzUyLjg4MiA1MDYuODk1QzM1NS4xNTYgNTE2Ljg5NyAzNTkuNTgzIDUyNC44OTIgMzY1LjA2NyA1MjguOTA3QzM3My43NzkgNTM1LjI4MyAzODguNzggNTM1LjY4IDQwMy41MzYgNTI5LjkyNEM0MDYuMDQxIDUyOC45NDcgNDA4LjIxNSA1MjguMjcxIDQwOC4zNjggNTI4LjQyNEM0MDguOTAzIDUyOC45NTUgNDAxLjQ3MyA1MzMuOTMgMzk2LjIzIDUzNi41NDhDMzg5LjE3NyA1NDAuMDcxIDM4My41NjggNTQxLjQzNCAzNzYuMTE1IDU0MS40MzRDMzYyLjYgNTQxLjQzNCAzNTEuMzc5IDUzNC41NTggMzQyLjAxNiA1MjAuNTM5QzM0MC4xNzQgNTE3Ljc4IDMzNi4wMzIgNTA5LjUxNiAzMzIuODEzIDUwMi4xNzZDMzIyLjkyOCA0NzkuNjI4IDMxOC4wNDYgNDcyLjc1OSAzMDYuNTY4IDQ2NS4yNDJDMjk2LjU3OSA0NTguNzAxIDI4My42OTcgNDU3LjUzIDI3NC4wMDYgNDYyLjI4MkMyNjEuMjc2IDQ2OC41MjMgMjU3LjcyNCA0ODQuNzkxIDI2Ni44NDIgNDk1LjEwMUMyNzAuNDY1IDQ5OS4xOTggMjc3LjIyMyA1MDIuNzMyIDI4Mi43NDkgNTAzLjQxOUMyOTMuMDg2IDUwNC43MDUgMzAxLjk3IDQ5Ni44NDEgMzAxLjk3IDQ4Ni40MDRDMzAxLjk3IDQ3OS42MjcgMjk5LjM2NSA0NzUuNzYgMjkyLjgwOCA0NzIuODAxQzI4My44NTIgNDY4Ljc2IDI3NC4yMjYgNDczLjQ4MyAyNzQuMjcyIDQ4MS44OTdDMjc0LjI5MiA0ODUuNDg0IDI3NS44NTQgNDg3LjczNyAyNzkuNDUgNDg5LjM2NEMyODEuNzU3IDQ5MC40MDggMjgxLjgxMSA0OTAuNDkxIDI3OS45MjkgNDkwLjFDMjcxLjcxMiA0ODguMzk2IDI2OS43ODcgNDc4LjQ5IDI3Ni4zOTQgNDcxLjkxM0MyODQuMzI2IDQ2NC4wMTggMzAwLjcyOSA0NjcuNTAyIDMwNi4zNjIgNDc4LjI3OUMzMDguNzI4IDQ4Mi44MDUgMzA5LjAwMyA0OTEuODIgMzA2Ljk0IDQ5Ny4yNjRDMzAyLjMyMiA1MDkuNDQ4IDI4OC44NTkgNTE1Ljg1NSAyNzUuMjAxIDUxMi4zNjhDMjY1LjkwMyA1MDkuOTk0IDI2Mi4xMTcgNTA3LjQyNCAyNTAuOTA2IDQ5NS44NzZDMjMxLjQyNSA0NzUuODA5IDIyMy44NjIgNDcxLjkyIDE5NS43NzcgNDY3LjUzNkwxOTAuMzk1IDQ2Ni42OTZMMTk2LjUxOSA0NjEuNTI1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQ5LjYyMDIgMTIuMDAzMUMxMTQuNjc4IDkwLjk2MzggMjE0Ljk3NyAyMTMuOTAxIDIxOS45NTcgMjIwLjc4NEMyMjQuMDY4IDIyNi40NjcgMjIyLjUyMSAyMzEuNTc2IDIxNS40NzggMjM1LjU4QzIxMS41NjEgMjM3LjgwNyAyMDMuNTA4IDI0MC4wNjMgMTk5LjQ3NiAyNDAuMDYzQzE5NC45MTYgMjQwLjA2MyAxODkuNzc5IDIzNy44NjcgMTg2LjAzOCAyMzQuMzE4QzE4My4zOTMgMjMxLjgxIDE3Mi43MjEgMjE1Ljg3NCAxNDguMDg0IDE3Ny42NDZDMTI5LjIzMyAxNDguMzk2IDExMy40NTcgMTI0LjEzMSAxMTMuMDI3IDEyMy43MjVDMTEyLjAzMiAxMjIuNzg1IDExMi4wNDkgMTIyLjgxNyAxNDYuMTYyIDE4My44NTRDMTY3LjU4MiAyMjIuMTgxIDE3NC44MTMgMjM1LjczMSAxNzQuODEzIDIzNy41NDNDMTc0LjgxMyAyNDEuMjI5IDE3My44MDggMjQzLjE2NiAxNjkuMjYxIDI0OC4yMzhDMTYxLjY4MSAyNTYuNjk0IDE1OC4yOTMgMjY2LjE5NSAxNTUuODQ3IDI4NS44NTlDMTUzLjEwNCAzMDcuOTAyIDE0NS4zOTQgMzIzLjQ3MyAxMjQuMDI2IDM1MC4xMjJDMTExLjUxOCAzNjUuNzIyIDEwOS40NzEgMzY4LjU4MSAxMDYuMzE1IDM3NC44NjlDMTAyLjMzOSAzODIuNzg2IDEwMS4yNDYgMzg3LjIyMSAxMDAuODAzIDM5Ny4yMTlDMTAwLjMzNSA0MDcuNzkgMTAxLjI0NyA0MTQuNjE5IDEwNC40NzcgNDI0LjcyNkMxMDcuMzA0IDQzMy41NzUgMTEwLjI1NSA0MzkuNDE3IDExNy44IDQ1MS4xMDRDMTI0LjMxMSA0NjEuMTg4IDEyOC4wNjEgNDY4LjY4MyAxMjguMDYxIDQ3MS42MTRDMTI4LjA2MSA0NzMuOTQ3IDEyOC41MDYgNDczLjk1IDEzOC41OTYgNDcxLjY3MkMxNjIuNzQxIDQ2Ni4yMTkgMTgyLjM0OCA0NTYuNjI5IDE5My4zNzUgNDQ0Ljg3N0MyMDAuMTk5IDQzNy42MDMgMjAxLjgwMSA0MzMuNTg2IDIwMS44NTMgNDIzLjYxOEMyMDEuODg3IDQxNy4wOTggMjAxLjY1OCA0MTUuNzMzIDE5OS44OTYgNDExLjk4MkMxOTcuMDI3IDQwNS44NzcgMTkxLjgwNCA0MDAuODAxIDE4MC4yOTIgMzkyLjkzMkMxNjUuMjA5IDM4Mi42MjEgMTU4Ljc2NyAzNzQuMzIgMTU2Ljk4NyAzNjIuOTA0QzE1NS41MjcgMzUzLjUzNyAxNTcuMjIxIDM0Ni45MjggMTY1LjU2NSAzMjkuNDRDMTc0LjIwMiAzMTEuMzM4IDE3Ni4zNDIgMzAzLjYyNCAxNzcuNzkgMjg1LjM3OEMxNzguNzI1IDI3My41ODkgMTgwLjAyIDI2OC45NCAxODMuNDA3IDI2NS4yMDlDMTg2LjkzOSAyNjEuMzE3IDE5MC4xMTkgMjYwIDE5OC44NjEgMjU4LjgwNUMyMTMuMTEzIDI1Ni44NTggMjIyLjE4OCAyNTMuMTcxIDIyOS42NDggMjQ2LjI5N0MyMzYuMTE5IDI0MC4zMzQgMjM4LjgyNyAyMzQuNTg4IDIzOS4yNDMgMjI1LjkzOEwyMzkuNTU4IDIxOS4zODJMMjM1Ljk0MiAyMTUuMTY2QzIyMi44NDYgMTk5Ljg5NiA0MC44NSAwIDQwLjA0NCAwQzM5Ljg3MTkgMCA0NC4xODEzIDUuNDAxNzggNDkuNjIwMiAxMi4wMDMxWk0xMzUuNDEyIDQwOS4xOEMxMzguMzczIDQwMy45MzcgMTM2LjggMzk3LjE5NSAxMzEuODQ3IDM5My45MDJDMTI3LjE2NyAzOTAuNzkgMTE5Ljg5NyAzOTIuMjU2IDExOS44OTcgMzk2LjMxMUMxMTkuODk3IDM5Ny41NDggMTIwLjU4MiAzOTguNDQ5IDEyMi4xMjQgMzk5LjI0M0MxMjQuNzIgNDAwLjU3OSAxMjQuOTA5IDQwMi4wODEgMTIyLjg2NiA0MDUuMTUyQzEyMC43OTcgNDA4LjI2MiAxMjAuOTY0IDQxMC45OTYgMTIzLjMzNyA0MTIuODU0QzEyNy4xNjIgNDE1Ljg0OSAxMzIuNTc2IDQxNC4yMDIgMTM1LjQxMiA0MDkuMThaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjQ4LjU1MiAyNjIuMjQ0QzI0MS44NjIgMjY0LjI5OSAyMzUuMzU4IDI3MS4zOSAyMzMuMzQ0IDI3OC44MjZDMjMyLjExNiAyODMuMzYyIDIzMi44MTMgMjkxLjMxOSAyMzQuNjUzIDI5My43NzZDMjM3LjYyNSAyOTcuNzQ1IDI0MC40OTkgMjk4Ljc5MSAyNDguMjgyIDI5OC43MzZDMjYzLjUxOCAyOTguNjMgMjc2Ljc2NCAyOTIuMDk1IDI3OC4zMDQgMjgzLjkyNUMyNzkuNTY3IDI3Ny4yMjkgMjczLjc0OSAyNjcuOTQ4IDI2NS43MzYgMjYzLjg3NEMyNjEuNjAxIDI2MS43NzIgMjUyLjgwNyAyNjAuOTM4IDI0OC41NTIgMjYyLjI0NFpNMjY2LjM2NCAyNzYuMTcyQzI2OC43MTQgMjcyLjgzNCAyNjcuNjg2IDI2OS4yMjUgMjYzLjY5IDI2Ni43ODVDMjU2LjA4IDI2Mi4xMzggMjQ0LjU3MSAyNjUuOTgzIDI0NC41NzEgMjczLjE3M0MyNDQuNTcxIDI3Ni43NTIgMjUwLjU3MiAyODAuNjU2IDI1Ni4wNzQgMjgwLjY1NkMyNTkuNzM1IDI4MC42NTYgMjY0Ljc0NiAyNzguNDczIDI2Ni4zNjQgMjc2LjE3MloiIGZpbGw9IiNGRjAwN0EiLz4KPC9zdmc+Cg==',
    router: {
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      api: UniswapV2.ROUTER
    },
    factory: {
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      api: UniswapV2.FACTORY
    },
    pair: {
      api: UniswapV2.PAIR
    },
    slippage: true,
  };

  var uniswap_v2 = new Exchange(

    Object.assign(exchange$5, {
      findPath: ({ tokenIn, tokenOut })=>
        UniswapV2.findPath(blockchain$4, exchange$5, { tokenIn, tokenOut }),
      pathExists: (path)=>
        UniswapV2.pathExists(blockchain$4, exchange$5, path),
      getAmounts: ({ path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin })=>
        UniswapV2.getAmounts(blockchain$4, exchange$5, { path, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin }),
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        UniswapV2.getTransaction(blockchain$4, exchange$5 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  const FEES = [100, 500, 3000, 10000];

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const fixPath$1 = (blockchain, exchange, path) => {
    if(!path) { return }
    let fixedPath = path.map((token, index) => {
      if (
        token === Blockchains__default['default'][blockchain].currency.address && path[index+1] != Blockchains__default['default'][blockchain].wrapped.address &&
        path[index-1] != Blockchains__default['default'][blockchain].wrapped.address
      ) {
        return Blockchains__default['default'][blockchain].wrapped.address
      } else {
        return token
      }
    });

    if(fixedPath[0] == Blockchains__default['default'][blockchain].currency.address && fixedPath[1] == Blockchains__default['default'][blockchain].wrapped.address) {
      fixedPath.splice(0, 1);
    } else if(fixedPath[fixedPath.length-1] == Blockchains__default['default'][blockchain].currency.address && fixedPath[fixedPath.length-2] == Blockchains__default['default'][blockchain].wrapped.address) {
      fixedPath.splice(fixedPath.length-1, 1);
    }

    return fixedPath
  };

  const getInputAmount = async (exchange, pool, outputAmount)=>{

    const data = await web3Client.request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactOutput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[1], pool.fee, pool.path[0]]),
        amountOut: outputAmount
      },
      cache: 5
    });

    return data.amountIn
  };

  const getOutputAmount = async (exchange, pool, inputAmount)=>{

    const data = await web3Client.request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactInput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[0], pool.fee, pool.path[1]]),
        amountIn: inputAmount
      },
      cache: 5
    });

    return data.amountOut
  };

  const getBestPool = async ({ blockchain, exchange, path, amountIn, amountOut, block }) => {
    path = fixPath$1(blockchain, exchange, path);
    if(path.length > 2) { throw('Uniswap V3 can only check paths for up to 2 tokens!') }

    try {

      let pools = (await Promise.all(FEES.map((fee)=>{
        return web3Client.request({
          blockchain: Blockchains__default['default'][blockchain].name,
          address: exchange[blockchain].factory.address,
          method: 'getPool',
          api: exchange[blockchain].factory.api,
          cache: 3600,
          params: [path[0], path[1], fee],
        }).then((address)=>{
          return {
            blockchain,
            address,
            path,
            fee,
            token0: [...path].sort()[0],
            token1: [...path].sort()[1],
          }
        }).catch(()=>{})
      }))).filter(Boolean);

      pools = pools.filter((pool)=>pool.address != Blockchains__default['default'][blockchain].zero);

      pools = (await Promise.all(pools.map(async(pool)=>{

        try {

          let amount;
          if(amountIn) {
            amount = await getOutputAmount(exchange, pool, amountIn);
          } else {
            amount = await getInputAmount(exchange, pool, amountOut);
          }

          return { ...pool, amountIn: amountIn || amount, amountOut: amountOut || amount }
        } catch (e) {}

      }))).filter(Boolean);
      
      if(amountIn) {
        // highest amountOut is best pool
        return pools.sort((a,b)=>(b.amountOut.gt(a.amountOut) ? 1 : -1))[0]
      } else {
        // lowest amountIn is best pool
        return pools.sort((a,b)=>(b.amountIn.lt(a.amountIn) ? 1 : -1))[0]
      }

    } catch (e2) { return }
  };

  const pathExists$1 = async (blockchain, exchange, path, amountIn, amountOut, amountInMax, amountOutMin) => {
    try {

      let pools = (await Promise.all(FEES.map((fee)=>{
        path = fixPath$1(blockchain, exchange, path);
        return web3Client.request({
          blockchain: Blockchains__default['default'][blockchain].name,
          address: exchange[blockchain].factory.address,
          method: 'getPool',
          api: exchange[blockchain].factory.api,
          cache: 3600,
          params: [path[0], path[1], fee],
        }).catch(()=>{})
      }))).filter(Boolean).filter((address)=>address != Blockchains__default['default'][blockchain].zero);

      return pools.length

    } catch (e3) { return false }
  };

  const findPath$1 = async ({ blockchain, exchange, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
    if(
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) &&
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, fixedPath: undefined } }

    let path;
    if (await pathExists$1(blockchain, exchange, [tokenIn, tokenOut])) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$1(blockchain, exchange, [tokenIn, Blockchains__default['default'][blockchain].wrapped.address]) &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$1(blockchain, exchange, [tokenOut, Blockchains__default['default'][blockchain].wrapped.address])
    ) {
      // path via WRAPPED
      path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
    } else if (
      (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async (stable)=>{
        return( (await pathExists$1(blockchain, exchange, [tokenIn, stable]) ? stable : undefined) && await pathExists$1(blockchain, exchange, [tokenOut, stable]) ? stable : undefined )
      }))).find(Boolean)
    ) {
      // path via tokenIn -> USD -> tokenOut
      let USD = (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async (stable)=>{
        return( (await pathExists$1(blockchain, exchange, [tokenIn, stable]) ? stable : undefined) && await pathExists$1(blockchain, exchange, [tokenOut, stable]) ? stable : undefined )
      }))).find(Boolean);
      path = [tokenIn, USD, tokenOut];
    }

    let pools;
    if(path && path.length == 2) {
      pools = [
        await getBestPool({ blockchain, exchange, path: [path[0], path[1]], amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) })
      ];
    } else if (path && path.length == 3) {
      if(amountOut || amountOutMin) {
        let pool2 = await getBestPool({ blockchain, exchange, path: [path[1], path[2]], amountOut: (amountOut || amountOutMin) });
        let pool1 = await getBestPool({ blockchain, exchange, path: [path[0], path[1]], amountOut: pool2.amountIn });
        pools = [pool1, pool2];
      } else { // amountIn
        let pool1 = await getBestPool({ blockchain, exchange, path: [path[0], path[1]], amountIn: (amountIn || amountInMax) });
        let pool2 = await getBestPool({ blockchain, exchange, path: [path[1], path[2]], amountIn: pool1.amountOut });
        pools = [pool1, pool2];
      }
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(path.length-1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    }

    return { path, pools, fixedPath: fixPath$1(blockchain, exchange, path) }
  };

  let getAmountOut = (blockchain, exchange, { path, pools, amountIn }) => {
    return pools[pools.length-1].amountOut
  };

  let getAmountIn = async (blockchain, exchange, { path, pools, amountOut, block }) => {
    if(block === undefined) {
      return pools[0].amountIn
    } else {
      
      let path;
      if(pools.length == 2) {
        path = ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"],[
          pools[1].path[1], pools[1].fee, pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      } else if(pools.length == 1) { 
        path = ethers.ethers.utils.solidityPack(["address","uint24","address"],[
          pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      }

      const data = await web3Client.request({
        block,
        blockchain,
        address: exchange[blockchain].quoter.address,
        api: exchange[blockchain].quoter.api,
        method: 'quoteExactOutput',
        params: { path, amountOut },
      });

      return data.amountIn
    }
  };

  let getAmounts$1 = async (blockchain, exchange, {
    path,
    pools,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {
    if (amountOut) {
      amountIn = await getAmountIn(blockchain, exchange, { block, path, pools, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut(blockchain, exchange, { path, pools, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn(blockchain, exchange, { block, path, pools, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut(blockchain, exchange, { path, pools, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin }
  };

  let getTransaction$1 = async({
    blockchain,
    exchange,
    pools,
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

    let commands = [];
    let inputs = [];
    let value = "0";

    if (path[0] === Blockchains__default['default'][blockchain].currency.address) {
      commands.push("0x0b"); // WRAP_ETH
      inputs.push(
        ethers.ethers.utils.solidityPack(
          ["address", "uint256"],
          [fromAddress, (amountIn || amountInMax).toString()]
        )
      );
      value = (amountIn || amountInMax).toString();
    }

    let packedPath;
    if(pools.length === 1) {
      packedPath = ethers.ethers.utils.solidityPack(["address","uint24","address"], [pools[0].path[0], pools[0].fee, pools[0].path[1]]);
    } else if(pools.length === 2) {
      packedPath = ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [pools[0].path[0], pools[0].fee, pools[0].path[1], pools[1].fee, pools[1].path[1]]);
    }

    if (amountOutMinInput || amountInInput) {
      commands.push("0x00"); // V3_SWAP_EXACT_IN (minimum out)
      inputs.push(
        ethers.ethers.utils.solidityPack(
          ["address", "uint256", "uint256", "bytes", "bool"],
          [
            fromAddress,
            (amountIn || amountInMax).toString(),
            (amountOut || amountOutMin).toString(),
            packedPath,
            true
          ]
        )
      );
    } else {
      commands.push("0x01"); // V3_SWAP_EXACT_OUT (maximum in)
      inputs.push(
        ethers.ethers.utils.solidityPack(
          ["address", "uint256", "uint256", "bytes", "bool"],
          [
            fromAddress,
            (amountOut || amountOutMin).toString(),
            (amountIn || amountInMax).toString(),
            packedPath,
            true
          ]
        )
      );
    }

    if (path[path.length-1] === Blockchains__default['default'][blockchain].currency.address) {
      commands.push("0x0c"); // UNWRAP_WETH
      inputs.push(
        ethers.ethers.utils.solidityPack(
          ["address", "uint256"],
          [fromAddress, (amountOut || amountOutMin).toString()]
        )
      );
    }

    const transaction = {
      blockchain,
      from: fromAddress,
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api,
      method: 'execute',
      params: { commands, inputs },
      value
    };

    return transaction
  };

  const ROUTER = [{"inputs":[{"components":[{"internalType":"address","name":"permit2","type":"address"},{"internalType":"address","name":"weth9","type":"address"},{"internalType":"address","name":"seaportV1_5","type":"address"},{"internalType":"address","name":"seaportV1_4","type":"address"},{"internalType":"address","name":"openseaConduit","type":"address"},{"internalType":"address","name":"nftxZap","type":"address"},{"internalType":"address","name":"x2y2","type":"address"},{"internalType":"address","name":"foundation","type":"address"},{"internalType":"address","name":"sudoswap","type":"address"},{"internalType":"address","name":"elementMarket","type":"address"},{"internalType":"address","name":"nft20Zap","type":"address"},{"internalType":"address","name":"cryptopunks","type":"address"},{"internalType":"address","name":"looksRareV2","type":"address"},{"internalType":"address","name":"routerRewardsDistributor","type":"address"},{"internalType":"address","name":"looksRareRewardsDistributor","type":"address"},{"internalType":"address","name":"looksRareToken","type":"address"},{"internalType":"address","name":"v2Factory","type":"address"},{"internalType":"address","name":"v3Factory","type":"address"},{"internalType":"bytes32","name":"pairInitCodeHash","type":"bytes32"},{"internalType":"bytes32","name":"poolInitCodeHash","type":"bytes32"}],"internalType":"struct RouterParameters","name":"params","type":"tuple"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"BalanceTooLow","type":"error"},{"inputs":[],"name":"BuyPunkFailed","type":"error"},{"inputs":[],"name":"ContractLocked","type":"error"},{"inputs":[],"name":"ETHNotAccepted","type":"error"},{"inputs":[{"internalType":"uint256","name":"commandIndex","type":"uint256"},{"internalType":"bytes","name":"message","type":"bytes"}],"name":"ExecutionFailed","type":"error"},{"inputs":[],"name":"FromAddressIsNotOwner","type":"error"},{"inputs":[],"name":"InsufficientETH","type":"error"},{"inputs":[],"name":"InsufficientToken","type":"error"},{"inputs":[],"name":"InvalidBips","type":"error"},{"inputs":[{"internalType":"uint256","name":"commandType","type":"uint256"}],"name":"InvalidCommandType","type":"error"},{"inputs":[],"name":"InvalidOwnerERC1155","type":"error"},{"inputs":[],"name":"InvalidOwnerERC721","type":"error"},{"inputs":[],"name":"InvalidPath","type":"error"},{"inputs":[],"name":"InvalidReserves","type":"error"},{"inputs":[],"name":"InvalidSpender","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[],"name":"SliceOutOfBounds","type":"error"},{"inputs":[],"name":"TransactionDeadlinePassed","type":"error"},{"inputs":[],"name":"UnableToClaim","type":"error"},{"inputs":[],"name":"UnsafeCast","type":"error"},{"inputs":[],"name":"V2InvalidPath","type":"error"},{"inputs":[],"name":"V2TooLittleReceived","type":"error"},{"inputs":[],"name":"V2TooMuchRequested","type":"error"},{"inputs":[],"name":"V3InvalidAmountOut","type":"error"},{"inputs":[],"name":"V3InvalidCaller","type":"error"},{"inputs":[],"name":"V3InvalidSwap","type":"error"},{"inputs":[],"name":"V3TooLittleReceived","type":"error"},{"inputs":[],"name":"V3TooMuchRequested","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsSent","type":"event"},{"inputs":[{"internalType":"bytes","name":"looksRareClaim","type":"bytes"}],"name":"collectRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"commands","type":"bytes"},{"internalType":"bytes[]","name":"inputs","type":"bytes[]"}],"name":"execute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"commands","type":"bytes"},{"internalType":"bytes[]","name":"inputs","type":"bytes[]"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"execute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC1155BatchReceived","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC1155Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  const POOL = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"Collect","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"CollectProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid1","type":"uint256"}],"name":"Flash","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextOld","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextNew","type":"uint16"}],"name":"IncreaseObservationCardinalityNext","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Initialize","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"feeProtocol0Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol0New","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1New","type":"uint8"}],"name":"SetFeeProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"int256","name":"amount0","type":"int256"},{"indexed":false,"internalType":"int256","name":"amount1","type":"int256"},{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"uint128","name":"liquidity","type":"uint128"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Swap","type":"event"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collect","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collectProtocol","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal0X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal1X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"flash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"}],"name":"increaseObservationCardinalityNext","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"liquidity","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxLiquidityPerTick","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"observations","outputs":[{"internalType":"uint32","name":"blockTimestamp","type":"uint32"},{"internalType":"int56","name":"tickCumulative","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityCumulativeX128","type":"uint160"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32[]","name":"secondsAgos","type":"uint32[]"}],"name":"observe","outputs":[{"internalType":"int56[]","name":"tickCumulatives","type":"int56[]"},{"internalType":"uint160[]","name":"secondsPerLiquidityCumulativeX128s","type":"uint160[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"positions","outputs":[{"internalType":"uint128","name":"liquidity","type":"uint128"},{"internalType":"uint256","name":"feeGrowthInside0LastX128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthInside1LastX128","type":"uint256"},{"internalType":"uint128","name":"tokensOwed0","type":"uint128"},{"internalType":"uint128","name":"tokensOwed1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"protocolFees","outputs":[{"internalType":"uint128","name":"token0","type":"uint128"},{"internalType":"uint128","name":"token1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"feeProtocol0","type":"uint8"},{"internalType":"uint8","name":"feeProtocol1","type":"uint8"}],"name":"setFeeProtocol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"slot0","outputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"internalType":"int24","name":"tick","type":"int24"},{"internalType":"uint16","name":"observationIndex","type":"uint16"},{"internalType":"uint16","name":"observationCardinality","type":"uint16"},{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"},{"internalType":"uint8","name":"feeProtocol","type":"uint8"},{"internalType":"bool","name":"unlocked","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"}],"name":"snapshotCumulativesInside","outputs":[{"internalType":"int56","name":"tickCumulativeInside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityInsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsInside","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"bool","name":"zeroForOne","type":"bool"},{"internalType":"int256","name":"amountSpecified","type":"int256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[{"internalType":"int256","name":"amount0","type":"int256"},{"internalType":"int256","name":"amount1","type":"int256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int16","name":"","type":"int16"}],"name":"tickBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"","type":"int24"}],"name":"ticks","outputs":[{"internalType":"uint128","name":"liquidityGross","type":"uint128"},{"internalType":"int128","name":"liquidityNet","type":"int128"},{"internalType":"uint256","name":"feeGrowthOutside0X128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthOutside1X128","type":"uint256"},{"internalType":"int56","name":"tickCumulativeOutside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityOutsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsOutside","type":"uint32"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
  const QUOTER = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"name":"quoteExactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactInputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"quoteExactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactOutputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"path","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"view","type":"function"}];

  var UniswapV3 = {
    findPath: findPath$1,
    pathExists: pathExists$1,
    getAmounts: getAmounts$1,
    getTransaction: getTransaction$1,
    ROUTER,
    FACTORY,
    POOL,
    QUOTER,
  };

  const exchange$4 = {

    blockchains: ['ethereum', 'bsc', 'polygon', 'optimism', 'arbitrum'],
    name: 'uniswap_v3',
    alternativeNames: [],
    label: 'Uniswap v3',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGRhdGEtdGVzdGlkPSJ1bmlzd2FwLWxvZ28iIGNsYXNzPSJyZ3c2ZXo0NHAgcmd3NmV6NGVqIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMzUyNiAxOS45MjQyQzIwLjI5MjggMjAuMTU0OSAyMC4xODg1IDIwLjM3MTUgMjAuMDQ1NSAyMC41NjE4QzE5Ljc3OTMgMjAuOTA4OCAxOS40MjcgMjEuMTc5NCAxOS4wMjM5IDIxLjM0NjZDMTguNjYxNCAyMS41MDM1IDE4LjI3NzQgMjEuNjA1IDE3Ljg4NDkgMjEuNjQ3NUMxNy44MDQyIDIxLjY1NzggMTcuNzIwNiAyMS42NjQxIDE3LjYzOTUgMjEuNjcwM0wxNy42MjYzIDIxLjY3MTNDMTcuMzc3NyAyMS42ODA4IDE3LjEzODcgMjEuNzcgMTYuOTQ0MiAyMS45MjU4QzE2Ljc0OTcgMjIuMDgxNyAxNi42MSAyMi4yOTYgMTYuNTQ1NSAyMi41MzczQzE2LjUxNiAyMi42NTc0IDE2LjQ5NCAyMi43NzkyIDE2LjQ3OTggMjIuOTAyMUMxNi40NTcyIDIzLjA4NzQgMTYuNDQ1NiAyMy4yNzcxIDE2LjQzMyAyMy40ODIzQzE2LjQyNCAyMy42Mjk1IDE2LjQxNDQgMjMuNzg0OCAxNi40IDIzLjk1MjFDMTYuMzE1NiAyNC42MzM3IDE2LjExOTMgMjUuMjk2NSAxNS44MTkyIDI1LjkxMzZDMTUuNzU3OSAyNi4wNDMzIDE1LjY5NTQgMjYuMTY5MSAxNS42MzM5IDI2LjI5MjZDMTUuMzA0OSAyNi45NTQ2IDE1LjAwNzYgMjcuNTUyNiAxNS4wOTI5IDI4LjM1MzVDMTUuMTU5NyAyOC45NzA2IDE1LjQ3NDQgMjkuMzg0MSAxNS44OTI1IDI5LjgxMDZDMTYuMDkxMSAzMC4wMTQ2IDE2LjM1NDQgMzAuMTg4OSAxNi42Mjc3IDMwLjM2OTlDMTcuMzkyNyAzMC44NzYzIDE4LjIzNjEgMzEuNDM0NyAxNy45NTgyIDMyLjg0MTVDMTcuNzMwOCAzMy45ODE0IDE1Ljg0OTQgMzUuMTc3NiAxMy4yMDUgMzUuNTk1NEMxMy40NjE1IDM1LjU1NjMgMTIuODk2NSAzNC41ODc5IDEyLjgzMzggMzQuNDgwNEwxMi44MyAzNC40NzM5QzEyLjc1NzEgMzQuMzU5MiAxMi42ODI0IDM0LjI0NjIgMTIuNjA3OSAzNC4xMzM0TDEyLjYwNzkgMzQuMTMzNEwxMi42MDc4IDM0LjEzMzRDMTIuMzkyNiAzMy44MDc2IDEyLjE3ODMgMzMuNDgzNSAxMi4wMTExIDMzLjEyNDFDMTEuNTY5MyAzMi4xODU2IDExLjM2NDUgMzEuMDk5OCAxMS41NDU1IDMwLjA3MTRDMTEuNzA5NSAyOS4xNDA3IDEyLjMyMjEgMjguMzk3MiAxMi45MTE4IDI3LjY4MTNMMTIuOTExOCAyNy42ODEzQzEzLjAwOCAyNy41NjQ2IDEzLjEwMzUgMjcuNDQ4NyAxMy4xOTY0IDI3LjMzMjhDMTMuOTg1MiAyNi4zNDg4IDE0LjgxMjggMjUuMDU5NSAxNC45OTU5IDIzLjc4MjJDMTUuMDExNCAyMy42NzEyIDE1LjAyNTIgMjMuNTUwMiAxNS4wMzk3IDIzLjQyMjlMMTUuMDM5NyAyMy40MjI5TDE1LjAzOTcgMjMuNDIyOUMxNS4wNjU3IDIzLjE5NSAxNS4wOTM5IDIyLjk0NjkgMTUuMTM4MiAyMi42OTk3QzE1LjIwMzkgMjIuMjcyOCAxNS4zMzcxIDIxLjg1OTEgMTUuNTMyNiAyMS40NzQzQzE1LjY2NiAyMS4yMjIgMTUuODQxNyAyMC45OTQ2IDE2LjA1MiAyMC44MDIxQzE2LjE2MTYgMjAuNjk5OSAxNi4yMzM5IDIwLjU2MzcgMTYuMjU3NCAyMC40MTUzQzE2LjI4MDggMjAuMjY3IDE2LjI1NCAyMC4xMTUgMTYuMTgxMyAxOS45ODM3TDExLjk2NTggMTIuMzY3M0wxOC4wMjA3IDE5Ljg3MzNDMTguMDg5NyAxOS45NjAzIDE4LjE3NjggMjAuMDMxIDE4LjI3NiAyMC4wODAzQzE4LjM3NTIgMjAuMTI5NiAxOC40ODQgMjAuMTU2NCAxOC41OTQ2IDIwLjE1ODhDMTguNzA1MyAyMC4xNjEyIDE4LjgxNTEgMjAuMTM5MSAxOC45MTYzIDIwLjA5NEMxOS4wMTc1IDIwLjA0OSAxOS4xMDc2IDE5Ljk4MjEgMTkuMTgwMiAxOS44OTgyQzE5LjI1NjkgMTkuODA4NCAxOS4zMDA0IDE5LjY5NDcgMTkuMzAzMyAxOS41NzYzQzE5LjMwNjMgMTkuNDU4IDE5LjI2ODUgMTkuMzQyMyAxOS4xOTYzIDE5LjI0ODdDMTguOTE0OCAxOC44ODczIDE4LjYyMTggMTguNTIxIDE4LjMzMDIgMTguMTU2M0wxOC4zMyAxOC4xNTZDMTguMjEyIDE4LjAwODUgMTguMDk0MyAxNy44NjEzIDE3Ljk3NzYgMTcuNzE0OEwxNi40NTM5IDE1LjgyMDVMMTMuMzk1NyAxMi4wMzgyTDEwIDhMMTMuNzg4IDExLjY5OTRMMTcuMDQzMyAxNS4zMTQ5TDE4LjY2NzMgMTcuMTI3QzE4LjgxNjUgMTcuMjk1OCAxOC45NjU3IDE3LjQ2MzEgMTkuMTE0OCAxNy42MzAzQzE5LjUwNDQgMTguMDY3MSAxOS44OTQgMTguNTAzOSAyMC4yODM2IDE4Ljk2NzNMMjAuMzcyIDE5LjA3NTVMMjAuMzkxNCAxOS4yNDMzQzIwLjQxNzYgMTkuNDcwOCAyMC40MDQ1IDE5LjcwMTIgMjAuMzUyNiAxOS45MjQyWk0zNS45MjQ3IDIyLjQ2OTdMMzUuOTMxMSAyMi40Nzk1QzM1LjkzIDIxLjY3MTkgMzUuNDMyMiAyMC4zMzk0IDM0LjQyNDcgMTkuMDU3N0wzNC40MDEgMTkuMDI2M0MzNC4wOTA2IDE4LjY0MSAzMy43NTI0IDE4LjI3OTIgMzMuMzg5MSAxNy45NDM4QzMzLjMyMTIgMTcuODc3OCAzMy4yNDggMTcuODEyOCAzMy4xNzM2IDE3Ljc0NzlDMzIuNzA4MSAxNy4zNDAxIDMyLjE5OTMgMTYuOTg1IDMxLjY1NjQgMTYuNjg5MkwzMS42MTc2IDE2LjY2OTdDMjkuOTExOCAxNS43MzY2IDI3LjY5MiAxNS4yNTYgMjQuOTU0OSAxNS43OTcyQzI0LjU4NzMgMTUuMzQ4OSAyNC4xOTE0IDE0LjkyNDggMjMuNzY5NiAxNC41Mjc1QzIzLjEyMzYgMTMuOTA5MSAyMi4zNjMyIDEzLjQyNDEgMjEuNTMxNSAxMy4wOTk3QzIwLjcwNzIgMTIuNzk2NiAxOS44MjQ0IDEyLjY4ODQgMTguOTUxNyAxMi43ODM2QzE5Ljc5MjkgMTIuODU5NyAyMC42MTIzIDEzLjA5NDcgMjEuMzY2NiAxMy40NzY0QzIyLjA5NTEgMTMuODY4NSAyMi43NTEyIDE0LjM4MzMgMjMuMzA2MiAxNC45OTg0QzIzLjg2ODggMTUuNjI2MyAyNC4zOTc2IDE2LjI4MzkgMjQuODkwMyAxNi45Njg1TDI1LjAxMzkgMTcuMTMwMkMyNS40OTYgMTcuNzYwOSAyNS45ODY4IDE4LjQwMyAyNi41OTgyIDE4Ljk3NDRDMjYuOTM0OCAxOS4yOTI1IDI3LjMxMDMgMTkuNTY2NCAyNy43MTU3IDE5Ljc4OTVDMjcuODIzNCAxOS44NDQ3IDI3LjkzMjMgMTkuODk2NiAyOC4wMzkgMTkuOTQyMUMyOC4xNDU2IDE5Ljk4NzYgMjguMjQ1OCAyMC4wMjk4IDI4LjM1MzYgMjAuMDY4OEMyOC41NjE2IDIwLjE0OTkgMjguNzc3MSAyMC4yMTcxIDI4Ljk5MjYgMjAuMjc4OEMyOS44NTQ3IDIwLjUyNTYgMzAuNzM3MiAyMC42MTQzIDMxLjU5OTMgMjAuNjYyQzMxLjcxOTIgMjAuNjY4MyAzMS44Mzg5IDIwLjY3NDIgMzEuOTU4MSAyMC42ODAxTDMxLjk1ODMgMjAuNjgwMUMzMi4yNjYyIDIwLjY5NTQgMzIuNTcxMyAyMC43MTA1IDMyLjg3MTkgMjAuNzMyM0MzMy4yODM3IDIwLjc1NjkgMzMuNjkyMiAyMC44MjE0IDM0LjA5MTcgMjAuOTI1QzM0LjY5MTggMjEuMDgyMiAzNS4yMjAxIDIxLjQ0MTMgMzUuNTg4NSAyMS45NDI1QzM1LjcxMzcgMjIuMTA5NSAzNS44MjYxIDIyLjI4NTcgMzUuOTI0NyAyMi40Njk3Wk0zMy40MDEzIDE3Ljk0NTFDMzMuMzU4IDE3LjkwNDkgMzMuMzEzOSAxNy44NjUxIDMzLjI3IDE3LjgyNTRMMzMuMjcgMTcuODI1NEMzMy4yNDE4IDE3Ljc5OTkgMzMuMjEzNiAxNy43NzQ1IDMzLjE4NTggMTcuNzQ5MUMzMy4yMDczIDE3Ljc2ODggMzMuMjI4OCAxNy43ODg3IDMzLjI1MDMgMTcuODA4N0MzMy4zMDA5IDE3Ljg1NTYgMzMuMzUxNCAxNy45MDI1IDMzLjQwMTMgMTcuOTQ1MVpNMzIuMzIzOCAyNS45MTcyQzI5LjU1MTYgMjQuNzg3MiAyNi42NTE4IDIzLjYwNTEgMjcuMDgzNSAyMC4yODc1QzI4LjAwOTEgMjEuMjgwMiAyOS40NjIgMjEuNDg4NCAzMS4wNDIyIDIxLjcxNDlDMzIuNDc1NyAyMS45MjAzIDM0LjAxMzkgMjIuMTQwNyAzNS4zNTgzIDIyLjk3NTNDMzguNTMwNiAyNC45NDMzIDM4LjA2NzMgMjguNzY2NiAzNi45ODk3IDMwLjE3MzlDMzcuMDg2OSAyNy44NTg3IDM0Ljc1NDQgMjYuOTA4IDMyLjMyMzggMjUuOTE3MlpNMjEuMTU1MSAyNC4yNTY3QzIxLjg4NjggMjQuMTg2MyAyMy40NDYxIDIzLjgwNDIgMjIuNzQ4OSAyMi41NzEyQzIyLjU5ODkgMjIuMzIwNCAyMi4zODE1IDIyLjExNzIgMjIuMTIxNyAyMS45ODQ4QzIxLjg2MTkgMjEuODUyNSAyMS41NzAyIDIxLjc5NjUgMjEuMjgwMSAyMS44MjMyQzIwLjk4NTggMjEuODU1IDIwLjcwODIgMjEuOTc2OSAyMC40ODUyIDIyLjE3MjVDMjAuMjYyMiAyMi4zNjgxIDIwLjEwNDQgMjIuNjI3OCAyMC4wMzM0IDIyLjkxNjVDMTkuODE2OCAyMy43MjMgMjAuMDQ2MyAyNC4zNjQ5IDIxLjE1NTEgMjQuMjU2N1pNMjAuOTQ0OCAxNC41MDE0QzIwLjQ4NTggMTMuOTY4OCAxOS43NzM1IDEzLjY4OTUgMTkuMDc1MiAxMy41ODc4QzE5LjA0OTEgMTMuNzYyNSAxOS4wMzI2IDEzLjkzODUgMTkuMDI1NyAxNC4xMTVDMTguOTk0NCAxNS41Njg3IDE5LjUwODQgMTcuMTY1NCAyMC41MDMgMTguMjc1QzIwLjgyMTIgMTguNjMzNyAyMS4yMDQ5IDE4LjkyNzYgMjEuNjMzNCAxOS4xNDFDMjEuODgxMiAxOS4yNjIyIDIyLjUzODYgMTkuNTYzMSAyMi43ODIxIDE5LjI5MjVDMjIuODAwNiAxOS4yNjc3IDIyLjgxMjMgMTkuMjM4NCAyMi44MTU5IDE5LjIwNzZDMjIuODE5NSAxOS4xNzY4IDIyLjgxNDkgMTkuMTQ1NiAyMi44MDI2IDE5LjExNzJDMjIuNzYyMiAxOS4wMDEzIDIyLjY4NDMgMTguODk2MSAyMi42MDY5IDE4Ljc5MTdDMjIuNTUyIDE4LjcxNzcgMjIuNDk3NCAxOC42NDQxIDIyLjQ1NjcgMTguNTY3MkMyMi40MTU1IDE4LjQ4OTggMjIuMzcxNCAxOC40MTQyIDIyLjMyNzQgMTguMzM4OEwyMi4zMjc0IDE4LjMzODhDMjIuMjQ0NyAxOC4xOTcgMjIuMTYyMiAxOC4wNTU1IDIyLjA5ODkgMTcuOTAxNUMyMS45MzE5IDE3LjQ5ODQgMjEuODQ1IDE3LjA2OTggMjEuNzU4MyAxNi42NDI1TDIxLjc1ODMgMTYuNjQyNEwyMS43NTgzIDE2LjY0MjRMMjEuNzU4MyAxNi42NDIzTDIxLjc1ODIgMTYuNjQyMkwyMS43NTgyIDE2LjY0MjFMMjEuNzU4MiAxNi42NDJDMjEuNzQwOSAxNi41NTY2IDIxLjcyMzYgMTYuNDcxMiAyMS43MDU2IDE2LjM4NkMyMS41NzMxIDE1LjcyNjggMjEuNDAzOSAxNS4wMzQgMjAuOTQ0OCAxNC41MDE0Wk0zMC43NTI0IDI2LjA5OEMzMC4wNDAzIDI4LjA5NDMgMzEuMTg4OCAyOS43ODA0IDMyLjMzMDYgMzEuNDU2NkMzMy42MDc3IDMzLjMzMTUgMzQuODc2NCAzNS4xOTQgMzMuNTIyOCAzNy40NjQyQzM2LjE1MzIgMzYuMzczMSAzNy40MDIxIDMzLjA3NjkgMzYuMzEwNSAzMC40NjE2QzM1LjYyMjcgMjguODA3NCAzMy45NjQ5IDI3LjkxMDYgMzIuNDI2MSAyNy4wNzgzTDMyLjQyNjEgMjcuMDc4M0wzMi40MjYgMjcuMDc4MkMzMS44MjkgMjYuNzU1MyAzMS4yNDk5IDI2LjQ0MjEgMzAuNzUyNCAyNi4wOThaTTIzLjA1NTIgMzAuODYzM0MyMi41Nzg1IDMxLjA1ODcgMjIuMTI5IDMxLjMxNTIgMjEuNzE3OSAzMS42MjY1QzIyLjY1MjcgMzEuMjg1OSAyMy42MzM5IDMxLjA5MTQgMjQuNjI3NCAzMS4wNDk1QzI0LjgwNzQgMzEuMDM4OCAyNC45ODg3IDMxLjAzMDQgMjUuMTcxNSAzMS4wMjE5TDI1LjE3MTcgMzEuMDIxOUwyNS4xNzIgMzEuMDIxOUMyNS40ODc4IDMxLjAwNzMgMjUuODA4NSAzMC45OTI1IDI2LjEzNiAzMC45NjUxQzI2LjY3MjkgMzAuOTI4NSAyNy4yMDI1IDMwLjgxOTIgMjcuNzEwMyAzMC42NDAzQzI4LjI0MjUgMzAuNDUzMyAyOC43MjY4IDMwLjE1MDEgMjkuMTI4NCAyOS43NTI3QzI5LjUzNDIgMjkuMzQyNCAyOS44MTg4IDI4LjgyNzIgMjkuOTUwNiAyOC4yNjQyQzMwLjA2NjYgMjcuNzMyNCAzMC4wNTAzIDI3LjE4MDEgMjkuOTAzMiAyNi42NTYyQzI5Ljc1NiAyNi4xMzIyIDI5LjQ4MjUgMjUuNjUyOCAyOS4xMDY5IDI1LjI2MDNDMjkuMjg4MSAyNS43MjIxIDI5LjM5OTYgMjYuMjA4NCAyOS40Mzc3IDI2LjcwMzNDMjkuNDcwNSAyNy4xNjQgMjkuNDA4MSAyNy42MjY1IDI5LjI1NDUgMjguMDYxOEMyOS4xMDQ1IDI4LjQ3NDQgMjguODU5MyAyOC44NDU0IDI4LjUzOSAyOS4xNDQzQzI4LjIwODEgMjkuNDQ2MiAyNy44MjUgMjkuNjg0NiAyNy40MDg2IDI5Ljg0NzlDMjYuODI5OSAzMC4wODIxIDI2LjE3NTUgMzAuMTc3OSAyNS40OTM5IDMwLjI3NzdDMjUuMTgzIDMwLjMyMzIgMjQuODY2NCAzMC4zNjk2IDI0LjU0ODcgMzAuNDMwM0MyNC4wMzc4IDMwLjUyNDMgMjMuNTM3NCAzMC42Njk0IDIzLjA1NTIgMzAuODYzM1pNMzEuMzE4NyAzOS4xMDQ2TDMxLjI3MyAzOS4xNDE1TDMxLjI3MyAzOS4xNDE2QzMxLjE1MjUgMzkuMjM4OSAzMS4wMzAxIDM5LjMzNzkgMzAuODk4MiAzOS40MjY4QzMwLjczMDEgMzkuNTM4IDMwLjU1NCAzOS42MzY1IDMwLjM3MTMgMzkuNzIxMkMyOS45OTA4IDM5LjkwNzcgMjkuNTcyNiA0MC4wMDI5IDI5LjE0OTMgMzkuOTk5NEMyOC4wMDI4IDM5Ljk3NzggMjcuMTkyNCAzOS4xMjA1IDI2LjcxODMgMzguMTUxNkMyNi41OTQgMzcuODk3NyAyNi40ODQ1IDM3LjYzNTkgMjYuMzc1IDM3LjM3NDFMMjYuMzc1IDM3LjM3NDFDMjYuMTk5NyAzNi45NTUxIDI2LjAyNDQgMzYuNTM2MSAyNS43ODgzIDM2LjE0OUMyNS4yMzk5IDM1LjI0OTUgMjQuMzAxMyAzNC41MjUzIDIzLjIwMjIgMzQuNjU5NUMyMi43NTM5IDM0LjcxNTggMjIuMzMzNiAzNC45MTgyIDIyLjA4NDcgMzUuMzA5QzIxLjQyOTUgMzYuMzI5OCAyMi4zNzAzIDM3Ljc1OTggMjMuNTY5NiAzNy41NTczQzIzLjY3MTYgMzcuNTQxNyAyMy43NzE0IDM3LjUxNDEgMjMuODY3IDM3LjQ3NTFDMjMuOTYyMyAzNy40MzQzIDI0LjA1MTIgMzcuMzggMjQuMTMxIDM3LjMxMzhDMjQuMjk4NiAzNy4xNzM2IDI0LjQyNDggMzYuOTkwMyAyNC40OTYzIDM2Ljc4MzRDMjQuNTc1MSAzNi41Njc2IDI0LjU5MjYgMzYuMzM0MSAyNC41NDcgMzYuMTA5QzI0LjQ5NzggMzUuODczNiAyNC4zNTk0IDM1LjY2NjggMjQuMTYxMiAzNS41MzJDMjQuMzkxNyAzNS42NDA0IDI0LjU3MTMgMzUuODM0NSAyNC42NjIzIDM2LjA3MzJDMjQuNzU2NiAzNi4zMTkgMjQuNzgwOSAzNi41ODYyIDI0LjczMjMgMzYuODQ1MUMyNC42ODUyIDM3LjExNDcgMjQuNTY2OSAzNy4zNjY3IDI0LjM4OTYgMzcuNTc0N0MyNC4yOTU1IDM3LjY4MTYgMjQuMTg2NiAzNy43NzQ2IDI0LjA2NjQgMzcuODUwN0MyMy45NDcyIDM3LjkyNTkgMjMuODE5NSAzNy45ODY2IDIzLjY4NiAzOC4wMzE1QzIzLjQxNTMgMzguMTI0NCAyMy4xMjcyIDM4LjE1NDQgMjIuODQzMyAzOC4xMTkyQzIyLjQ0NDcgMzguMDYyMSAyMi4wNjg4IDM3Ljg5ODMgMjEuNzU1IDM3LjY0NUMyMS42OTcgMzcuNTk5IDIxLjY0MTQgMzcuNTUwOCAyMS41ODc1IDM3LjUwMDhDMjEuMzc0IDM3LjMxNTggMjEuMTgwMiAzNy4xMDg3IDIxLjAwOTMgMzYuODgyOUMyMC45MzI2IDM2Ljc5ODEgMjAuODU0NyAzNi43MTQ0IDIwLjc3MzMgMzYuNjM0QzIwLjM4OTEgMzYuMjI5IDE5LjkzNTggMzUuODk2NSAxOS40MzQ5IDM1LjY1MjJDMTkuMDg5NSAzNS40OTk4IDE4LjcyOCAzNS4zODcyIDE4LjM1NzQgMzUuMzE2NkMxOC4xNzA5IDM1LjI3NzYgMTcuOTgyNCAzNS4yNDk1IDE3Ljc5MzggMzUuMjI1N0MxNy43NzMzIDM1LjIyMzYgMTcuNzM0IDM1LjIxNjcgMTcuNjg1IDM1LjIwODJMMTcuNjg0NyAzNS4yMDgxTDE3LjY4NDYgMzUuMjA4MUwxNy42ODQ2IDM1LjIwODFMMTcuNjg0NiAzNS4yMDgxTDE3LjY4NDUgMzUuMjA4MUMxNy41MjcxIDM1LjE4MDYgMTcuMjcxMSAzNS4xMzYgMTcuMjI1OSAzNS4xNzhDMTcuODA4OCAzNC42MzkgMTguNDQ0MSAzNC4xNjAzIDE5LjEyMjQgMzMuNzQ5MUMxOS44MTg5IDMzLjMzNCAyMC41NjY3IDMzLjAxMjYgMjEuMzQ2NiAzMi43OTMzQzIyLjE1NTEgMzIuNTY0NyAyMy4wMDA5IDMyLjQ5OTUgMjMuODM0NyAzMi42MDE3QzI0LjI2MzkgMzIuNjUzNSAyNC42ODQzIDMyLjc2MjcgMjUuMDg0NyAzMi45MjY0QzI1LjUwNDIgMzMuMDk0OCAyNS44OTE0IDMzLjMzNTEgMjYuMjI5MSAzMy42MzY2QzI2LjU2MzIgMzMuOTUyOCAyNi44MzMzIDM0LjMzMTEgMjcuMDI0MyAzNC43NTA0QzI3LjE5NjggMzUuMTQzMSAyNy4zMjU0IDM1LjU1MzcgMjcuNDA3OSAzNS45NzQ3QzI3LjQ1MjEgMzYuMjAxMyAyNy40ODU1IDM2LjQ1MDIgMjcuNTE5OSAzNi43MDc5TDI3LjUyIDM2LjcwNzlMMjcuNTIgMzYuNzA4TDI3LjUyIDM2LjcwOEMyNy42NzcxIDM3Ljg4MjMgMjcuODU4NSAzOS4yMzcyIDI5LjIwNDMgMzkuNDczM0MyOS4yODk4IDM5LjQ5IDI5LjM3NjEgMzkuNTAyMyAyOS40NjI5IDM5LjUxMDJMMjkuNzMxMiAzOS41MTY2QzI5LjkxNTcgMzkuNTAzNCAzMC4wOTkgMzkuNDc3IDMwLjI3OTcgMzkuNDM3NkMzMC42NTQxIDM5LjM0OTIgMzEuMDE5IDM5LjIyNDEgMzEuMzY5MSAzOS4wNjQyTDMxLjMxODcgMzkuMTA0NlpNMjEuMDgwMSAzNi45NjE5QzIxLjExMjMgMzYuOTk4OSAyMS4xNDQ5IDM3LjAzNTUgMjEuMTc3OSAzNy4wNzE4QzIxLjE2NDQgMzcuMDU2NyAyMS4xNTEgMzcuMDQxNSAyMS4xMzc1IDM3LjAyNjRMMjEuMTM3NSAzNy4wMjY0TDIxLjEzNzUgMzcuMDI2NEwyMS4xMzc1IDM3LjAyNjRDMjEuMTE4NCAzNy4wMDQ5IDIxLjA5OTMgMzYuOTgzNCAyMS4wODAxIDM2Ljk2MTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvcGF0aD48L3N2Zz4K',
    slippage: true,
    
    ethereum: {
      router: {
        address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      }
    },

    bsc: {
      router: {
        address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
        api: UniswapV3.QUOTER
      }
    },

    polygon: {
      router: {
        address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      }
    },

    optimism: {
      router: {
        address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      }
    },

    arbitrum: {
      router: {
        address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      }
    },

  };

  var uniswap_v3 = new Exchange(

    Object.assign(exchange$4, {
      findPath: ({ blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin })=>
        UniswapV3.findPath({ blockchain, exchange: exchange$4, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }),
      pathExists: (blockchain, path)=>
        UniswapV3.pathExists(blockchain, exchange$4, path),
      getAmounts: ({ blockchain, path, pools, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin })=>
        UniswapV3.getAmounts(blockchain, exchange$4, { path, pools, block, tokenIn, tokenOut, amountOut, amountIn, amountInMax, amountOutMin }),
      getTransaction: (...args)=> UniswapV3.getTransaction(...args),
    })
  );

  let fixPath = (path) => path;

  let pathExists = async (blockchain, path) => {
    if(fixPath(path).length <= 1) { return false }
    if(fixPath(path).length >= 3) { return false }
    return (
      path.includes(blockchain.currency.address) &&
      path.includes(blockchain.wrapped.address)
    )
  };

  let findPath = async (blockchain, { tokenIn, tokenOut }) => {
    if(
      ![tokenIn, tokenOut].includes(blockchain.currency.address) ||
      ![tokenIn, tokenOut].includes(blockchain.wrapped.address)
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

  let getTransaction = (blockchain, exchange, {
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
      blockchain: blockchain.name,
      from: fromAddress,
      to: exchange.wrapper.address,
      api: exchange.wrapper.api,
    };

    if (path[0] === blockchain.currency.address && path[1] === blockchain.wrapped.address) {
      transaction.method = 'deposit';
      transaction.value = amountIn.toString();
      return transaction
    } else if (path[0] === blockchain.wrapped.address && path[1] === blockchain.currency.address) {
      transaction.method = 'withdraw';
      transaction.value = 0;
      transaction.params = { wad: amountIn };
      return transaction
    }
  };

  const WETH = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

  var WETH$1 = {
    findPath,
    pathExists,
    getAmounts,
    getTransaction,
    WETH,
  };

  const blockchain$3 = Blockchains__default['default'].bsc;

  const exchange$3 = {
    blockchain: 'bsc',
    name: 'wbnb',
    alternativeNames: [],
    label: 'Wrapped BNB',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOTIgMTkyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxOTIgMTkyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0YwQjkwQjt9Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NCw0MS4xbDQyLTI0LjJsNDIsMjQuMmwtMTUuNCw4LjlMOTYsMzQuOUw2OS40LDUwTDU0LDQxLjF6IE0xMzgsNzEuN2wtMTUuNC04LjlMOTYsNzhMNjkuNCw2Mi43bC0xNS40LDl2MTgKCUw4MC42LDEwNXYzMC41bDE1LjQsOWwxNS40LTlWMTA1TDEzOCw4OS43VjcxLjd6IE0xMzgsMTIwLjN2LTE4bC0xNS40LDguOXYxOEMxMjIuNiwxMjkuMSwxMzgsMTIwLjMsMTM4LDEyMC4zeiBNMTQ4LjksMTI2LjQKCWwtMjYuNiwxNS4zdjE4bDQyLTI0LjJWODdsLTE1LjQsOUMxNDguOSw5NiwxNDguOSwxMjYuNCwxNDguOSwxMjYuNHogTTEzMy41LDU2LjRsMTUuNCw5djE4bDE1LjQtOXYtMThsLTE1LjQtOUwxMzMuNSw1Ni40CglMMTMzLjUsNTYuNHogTTgwLjYsMTQ4LjN2MThsMTUuNCw5bDE1LjQtOXYtMThMOTYsMTU3LjFMODAuNiwxNDguM3ogTTU0LDEyMC4zbDE1LjQsOXYtMTguMUw1NCwxMDIuM0w1NCwxMjAuM0w1NCwxMjAuM3oKCSBNODAuNiw1Ni40bDE1LjQsOWwxNS40LTlMOTYsNDcuNUM5Niw0Ny40LDgwLjYsNTYuNCw4MC42LDU2LjRMODAuNiw1Ni40eiBNNDMuMSw2NS40bDE1LjQtOWwtMTUuNC05bC0xNS40LDl2MThsMTUuNCw5TDQzLjEsNjUuNAoJTDQzLjEsNjUuNHogTTQzLjEsOTUuOUwyNy43LDg3djQ4LjVsNDIsMjQuMnYtMThsLTI2LjYtMTUuM1Y5NS45TDQzLjEsOTUuOXoiLz4KPC9zdmc+Cg==',
    wrapper: {
      address: blockchain$3.wrapped.address,
      api: WETH$1.WETH
    },
    slippage: false,
  };

  var wbnb = new Exchange(

    Object.assign(exchange$3, {
      findPath: ({ tokenIn, tokenOut })=>
        WETH$1.findPath(blockchain$3, { tokenIn, tokenOut }),
      pathExists: (path)=>
        WETH$1.pathExists(blockchain$3, path),
      getAmounts: WETH$1.getAmounts,
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        WETH$1.getTransaction(blockchain$3, exchange$3 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain$2 = Blockchains__default['default'].ethereum;

  const exchange$2 = {
    blockchain: 'ethereum',
    name: 'weth',
    alternativeNames: [],
    label: 'Wrapped Ethereum',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    wrapper: {
      address: blockchain$2.wrapped.address,
      api: WETH$1.WETH
    },
    slippage: false,
  };

  var weth = new Exchange(

    Object.assign(exchange$2, {
      findPath: ({ tokenIn, tokenOut })=>
        WETH$1.findPath(blockchain$2, { tokenIn, tokenOut }),
      pathExists: (path)=>
        WETH$1.pathExists(blockchain$2, path),
      getAmounts: WETH$1.getAmounts,
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        WETH$1.getTransaction(blockchain$2, exchange$2 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain$1 = Blockchains__default['default'].fantom;

  const exchange$1 = {
    blockchain: 'fantom',
    name: 'wftm',
    alternativeNames: [],
    label: 'Wrapped Fantom',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTkyIDE5MiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTkyIDE5MjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iY2lyY2xlIj4KCTxnIGlkPSJGYW50b20tY2lyY2xlIj4KCQk8Y2lyY2xlIGlkPSJPdmFsIiBmaWxsUnVsZT0iZXZlbm9kZCIgY2xpcFJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMxOTY5RkYiIGNsYXNzPSJzdDAiIGN4PSI5NiIgY3k9Ijk2IiByPSI4MC40Ii8+CgkJPHBhdGggaWQ9IlNoYXBlIiBmaWxsPSIjRkZGRkZGIiBkPSJNOTEuMSw0MS4yYzIuNy0xLjQsNi44LTEuNCw5LjUsMGwyNy42LDE0LjZjMS42LDAuOSwyLjUsMi4xLDIuNywzLjVoMHY3My4zCgkJCWMwLDEuNC0wLjksMi45LTIuNywzLjhsLTI3LjYsMTQuNmMtMi43LDEuNC02LjgsMS40LTkuNSwwbC0yNy42LTE0LjZjLTEuOC0wLjktMi42LTIuNC0yLjctMy44YzAtMC4xLDAtMC4zLDAtMC40bDAtNzIuNAoJCQljMC0wLjEsMC0wLjIsMC0wLjNsMC0wLjJoMGMwLjEtMS4zLDEtMi42LDIuNi0zLjVMOTEuMSw0MS4yeiBNMTI2LjYsOTkuOWwtMjYsMTMuN2MtMi43LDEuNC02LjgsMS40LTkuNSwwTDY1LjIsMTAwdjMyLjMKCQkJbDI1LjksMTMuNmMxLjUsMC44LDMuMSwxLjYsNC43LDEuN2wwLjEsMGMxLjUsMCwzLTAuOCw0LjYtMS41bDI2LjItMTMuOVY5OS45eiBNNTYuNSwxMzAuOWMwLDIuOCwwLjMsNC43LDEsNgoJCQljMC41LDEuMSwxLjMsMS45LDIuOCwyLjlsMC4xLDAuMWMwLjMsMC4yLDAuNywwLjQsMS4xLDAuN2wwLjUsMC4zbDEuNiwwLjlsLTIuMiwzLjdsLTEuNy0xLjFsLTAuMy0wLjJjLTAuNS0wLjMtMC45LTAuNi0xLjMtMC44CgkJCWMtNC4yLTIuOC01LjctNS45LTUuNy0xMi4zbDAtMC4ySDU2LjV6IE05My44LDgwLjVjLTAuMiwwLjEtMC40LDAuMS0wLjYsMC4yTDY1LjYsOTUuM2MwLDAtMC4xLDAtMC4xLDBsMCwwbDAsMGwwLjEsMGwyNy42LDE0LjYKCQkJYzAuMiwwLjEsMC40LDAuMiwwLjYsMC4yVjgwLjV6IE05OC4yLDgwLjV2MjkuOGMwLjItMC4xLDAuNC0wLjEsMC42LTAuMmwyNy42LTE0LjZjMCwwLDAuMSwwLDAuMSwwbDAsMGwwLDBsLTAuMSwwTDk4LjgsODAuNwoJCQlDOTguNiw4MC42LDk4LjQsODAuNSw5OC4yLDgwLjV6IE0xMjYuNiw2NC40bC0yNC44LDEzbDI0LjgsMTNWNjQuNHogTTY1LjIsNjQuNHYyNi4xbDI0LjgtMTNMNjUuMiw2NC40eiBNOTguNyw0NS4xCgkJCWMtMS40LTAuOC00LTAuOC01LjUsMEw2NS42LDU5LjdjMCwwLTAuMSwwLTAuMSwwbDAsMGwwLDBsMC4xLDBsMjcuNiwxNC42YzEuNCwwLjgsNCwwLjgsNS41LDBsMjcuNi0xNC42YzAsMCwwLjEsMCwwLjEsMGwwLDBsMCwwCgkJCWwtMC4xLDBMOTguNyw0NS4xeiBNMTMwLjcsNDYuNWwxLjcsMS4xbDAuMywwLjJjMC41LDAuMywwLjksMC42LDEuMywwLjhjNC4yLDIuOCw1LjcsNS45LDUuNywxMi4zbDAsMC4yaC00LjNjMC0yLjgtMC4zLTQuNy0xLTYKCQkJYy0wLjUtMS4xLTEuMy0xLjktMi44LTIuOWwtMC4xLTAuMWMtMC4zLTAuMi0wLjctMC40LTEuMS0wLjdsLTAuNS0wLjNsLTEuNi0wLjlMMTMwLjcsNDYuNXoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    wrapper: {
      address: blockchain$1.wrapped.address,
      api: WETH$1.WETH
    },
    slippage: false,
  };

  var wftm = new Exchange(

    Object.assign(exchange$1, {
      findPath: ({ tokenIn, tokenOut })=>
        WETH$1.findPath(blockchain$1, { tokenIn, tokenOut }),
      pathExists: (path)=>
        WETH$1.pathExists(blockchain$1, path),
      getAmounts: WETH$1.getAmounts,
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        WETH$1.getTransaction(blockchain$1, exchange$1 ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const blockchain = Blockchains__default['default'].polygon;

  const exchange = {
    blockchain: 'polygon',
    name: 'wmatic',
    alternativeNames: [],
    label: 'Wrapped MATIC',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0NS40IDQ1LjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM4MjQ3RTU7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzEuOSwxNi42Yy0wLjctMC40LTEuNi0wLjQtMi4yLDBsLTUuMywzLjFsLTMuNSwybC01LjEsMy4xYy0wLjcsMC40LTEuNiwwLjQtMi4yLDBsLTQtMi40CgljLTAuNi0wLjQtMS4xLTEuMS0xLjEtMnYtNC42YzAtMC45LDAuNS0xLjYsMS4xLTJsNC0yLjNjMC43LTAuNCwxLjUtMC40LDIuMiwwbDQsMi40YzAuNywwLjQsMS4xLDEuMSwxLjEsMnYzLjFsMy41LTIuMXYtMy4yCgljMC0wLjktMC40LTEuNi0xLjEtMmwtNy41LTQuNGMtMC43LTAuNC0xLjUtMC40LTIuMiwwTDYsMTEuN2MtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjh2OC43YzAsMC45LDAuNCwxLjYsMS4xLDJsNy42LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw1LjEtMi45bDMuNS0yLjFsNS4xLTIuOWMwLjctMC40LDEuNi0wLjQsMi4yLDBsNCwyLjNjMC43LDAuNCwxLjEsMS4xLDEuMSwydjQuNmMwLDAuOS0wLjQsMS42LTEuMSwyCglsLTMuOSwyLjNjLTAuNywwLjQtMS41LDAuNC0yLjIsMGwtNC0yLjNjLTAuNy0wLjQtMS4xLTEuMS0xLjEtMnYtMi45TDIxLDI4Ljd2My4xYzAsMC45LDAuNCwxLjYsMS4xLDJsNy41LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw3LjUtNC40YzAuNy0wLjQsMS4xLTEuMSwxLjEtMlYyM2MwLTAuOS0wLjQtMS42LTEuMS0yQzM5LjIsMjEsMzEuOSwxNi42LDMxLjksMTYuNnoiLz4KPC9zdmc+Cg==',
    wrapper: {
      address: blockchain.wrapped.address,
      api: WETH$1.WETH
    },
    slippage: false,
  };

  var wmatic = new Exchange(

    Object.assign(exchange, {
      findPath: ({ tokenIn, tokenOut })=>
        WETH$1.findPath(blockchain, { tokenIn, tokenOut }),
      pathExists: (path)=>
        WETH$1.pathExists(blockchain, path),
      getAmounts: WETH$1.getAmounts,
      getTransaction: ({ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress })=>
        WETH$1.getTransaction(blockchain, exchange ,{ path, amountIn, amountInMax, amountOut, amountOutMin, amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput, fromAddress }),
    })
  );

  const all = [
    uniswap_v3,
    uniswap_v2,
    pancakeswap,
    quickswap,
    orca,
    spookyswap,
    weth,
    wbnb,
    wmatic,
    wftm,
  ];

  all.ethereum = {
   uniswap_v3,
   uniswap_v2,
   weth, 
  };

  all.bsc = {
    uniswap_v3,
    pancakeswap,
    wbnb,
  };

  all.polygon = {
    quickswap,
    wmatic,
  };

  all.solana = {
    orca
  };

  all.fantom = {
    spookyswap,
    wftm
  };

  var find = ({ blockchain, name }) => {
    if(blockchain) {
      return all.find((exchange) => {
        return (
          (exchange.blockchain === blockchain) &&
          (exchange.name === name || exchange.alternativeNames.includes(name))
        )
      })
    } else {
      return all.find((exchange) => {
        return exchange.name === name || exchange.alternativeNames.includes(name)
      })
    }
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
