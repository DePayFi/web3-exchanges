import Token from '@depay/web3-tokens-solana';
import { request, getProvider } from '@depay/web3-client-solana';
import { ethers } from 'ethers';
import Blockchains from '@depay/web3-blockchains';
import { BN, struct, publicKey, u128, u64 as u64$1, seq, u8, u16, i32, bool, i128, PublicKey, Buffer, Keypair, SystemProgram, TransactionInstruction, blob, u32, Transaction } from '@depay/solana-web3.js';
import Decimal$1 from 'decimal.js';

function _optionalChain$4(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
  constructor({
    blockchain,
    tokenIn,
    decimalsIn,
    tokenOut,
    decimalsOut,
    path,
    pools,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    exchange,
    approvalRequired,
    getApproval,
    getPrep,
    getTransaction,
  }) {
    this.blockchain = blockchain;
    this.tokenIn = tokenIn;
    this.decimalsIn = decimalsIn;
    this.tokenOut = tokenOut;
    this.decimalsOut = decimalsOut;
    this.path = path;
    this.pools = pools;
    this.amountIn = _optionalChain$4([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
    this.amountOutMin = _optionalChain$4([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
    this.amountOut = _optionalChain$4([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
    this.amountInMax = _optionalChain$4([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
    this.exchange = exchange;
    this.getPrep = getPrep;
    this.getTransaction = getTransaction;
  }
}

let supported = ['solana'];
supported.evm = [];
supported.solana = ['solana'];

const DEFAULT_SLIPPAGE = '0.5'; // percent

const getDefaultSlippage = ({ exchange, blockchain, pools, amountIn, amountOut })=>{
  return DEFAULT_SLIPPAGE
};

const calculateAmountInWithSlippage = async ({ exchange, blockchain, pools, exchangePath, amountIn, amountOut })=>{

  let defaultSlippage = getDefaultSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut });

  let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000));

  if(!supported.evm.includes(exchange.blockchain || blockchain)) { 
    return newAmountInWithDefaultSlippageBN
  }

  const currentBlock = await request({ blockchain: (exchange.blockchain || blockchain), method: 'latestBlockNumber' });

  let blocks = [];
  for(var i = 0; i <= 2; i++){
    blocks.push(currentBlock-i);
  }

  const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
    let { amountIn } = await exchange.getAmounts({
      exchange,
      blockchain,
      path: exchangePath,
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

const calculateAmountOutLessSlippage = async ({ exchange, exchangePath, amountOut, amountIn })=>{
  let defaultSlippage = getDefaultSlippage({ amountIn, amountOut });

  let newAmountOutWithoutDefaultSlippageBN = amountOut.sub(amountOut.mul(parseFloat(defaultSlippage)*100).div(10000));

  return newAmountOutWithoutDefaultSlippageBN
};

const calculateAmountsWithSlippage = async ({
  exchange,
  blockchain,
  pools,
  exchangePath,
  amounts,
  tokenIn, tokenOut,
  amountIn, amountInMax, amountOut, amountOutMin,
  amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
})=>{
  if(amountOutMinInput || amountOutInput) {
    if(supported.evm.includes(exchange.blockchain || blockchain)) {
      amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut: (amountOutMinInput || amountOut) });
    } else if(supported.solana.includes(exchange.blockchain || blockchain)){
      let amountsWithSlippage = [];
      await Promise.all(exchangePath.map((step, index)=>{
        if(index != 0) {
          let amountWithSlippage = calculateAmountInWithSlippage({ exchange, pools, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
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
      await Promise.all(exchangePath.map((step, index)=>{
        if(index !== 0 && index < exchangePath.length-1) {
          amountsWithSlippage.unshift(amounts[index]);
        } else if(index === exchangePath.length-1) {
          let amountWithSlippage = calculateAmountOutLessSlippage({ exchange, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
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
  blockchain,
  exchange,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
}) => {
  if(blockchain === undefined && exchange.blockchains != undefined && exchange.blockchains.length > 1) {
    throw 'You need to provide a blockchain when calling route on an exchange that supports multiple blockchains!'
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
  getPrep,
  getTransaction,
  slippage,
}) => {

  tokenIn = fixAddress(tokenIn);
  tokenOut = fixAddress(tokenOut);

  if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length > 1) { throw('You can only pass one: amountIn, amountOut, amountInMax or amountOutMin') }
  if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length < 1) { throw('You need to pass exactly one: amountIn, amountOut, amountInMax or amountOutMin') }

  return new Promise(async (resolve)=> {
    let { path, exchangePath, pools } = await findPath({ blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin });
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

    let amounts; // includes intermediary amounts for longer routes
    try {
      ;({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await getAmounts({ exchange, blockchain, path, pools, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    } catch(e) {
      console.log(e);
      return resolve()
    }
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    if(exchange.slippage && slippage !== false) {
      try {
        ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
          exchange,
          blockchain,
          pools,
          exchangePath,
          amounts,
          tokenIn, tokenOut,
          amountIn, amountInMax, amountOut, amountOutMin,
          amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
        }));
      } catch (e2) { return resolve() }
    }

    const decimalsIn = await new Token({ blockchain, address: tokenIn }).decimals();
    const decimalsOut = await new Token({ blockchain, address: tokenOut }).decimals();

    resolve(
      new Route({
        blockchain,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        pools,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        exchange,
        getPrep: async ({ account })=> await getPrep({
          exchange,
          blockchain,
          tokenIn,
          tokenOut,
          amountIn: (amountIn || amountInMax),
          account,
        }),
        getTransaction: async ({ account, permit2, inputTokenPushed })=> await getTransaction({
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
          account,
          permit2,
          inputTokenPushed
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
    slippage,
  }) {
    if(tokenIn === tokenOut){ return Promise.resolve() }

    if(blockchain === undefined) {
      if(this.scope) { 
        blockchain = this.scope;
      } else if (this.blockchains.length === 1) {
        blockchain = this.blockchains[0];
      }
    }

    preflight({
      blockchain,
      exchange: this,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
    });

    return await route$1({
      ...
      await fixRouteParams({
        blockchain,
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
      getPrep: this.getPrep,
      getTransaction: this.getTransaction,
      slippage,
    })
  }
}

const MAX_SQRT_PRICE = "79226673515401279992447579055";
const MIN_SQRT_PRICE = "4295048016";
const BIT_PRECISION$1 = 14;
const LOG_B_2_X32$1 = "59543866431248";
const LOG_B_P_ERR_MARGIN_LOWER_X64$1 = "184467440737095516";
const LOG_B_P_ERR_MARGIN_UPPER_X64$1 = "15793534762490258745";

const toX64 = (num) => {
  return new BN(num.mul(Decimal$1.pow(2, 64)).floor().toFixed());
};

const fromX64 = (num) => {
  return new Decimal$1(num.toString()).mul(Decimal$1.pow(2, -64));
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
    return toX64(price.mul(Decimal$1.pow(10, decimalsB - decimalsA)).sqrt());
  }

  static sqrtPriceX64ToPrice(
    sqrtPriceX64,
    decimalsA,
    decimalsB
  ) {
    return fromX64(sqrtPriceX64)
      .pow(2)
      .mul(Decimal$1.pow(10, decimalsA - decimalsB));
  }

  /**
   * @param tickIndex
   * @returns
   */
  static tickIndexToSqrtPriceX64(tickIndex) {
    if (tickIndex > 0) {
      return new BN(tickIndexToSqrtPricePositive(tickIndex));
    } else {
      return new BN(tickIndexToSqrtPriceNegative(tickIndex));
    }
  }

  /**
   *
   * @param sqrtPriceX64
   * @returns
   */
  static sqrtPriceX64ToTickIndex(sqrtPriceX64) {
    if (sqrtPriceX64.gt(new BN(MAX_SQRT_PRICE)) || sqrtPriceX64.lt(new BN(MIN_SQRT_PRICE))) {
      throw new Error("Provided sqrtPrice is not within the supported sqrtPrice range.");
    }

    const msb = sqrtPriceX64.bitLength() - 1;
    const adjustedMsb = new BN(msb - 64);
    const log2pIntegerX32 = signedShiftLeft(adjustedMsb, 32, 128);

    let bit = new BN("8000000000000000", "hex");
    let precision = 0;
    let log2pFractionX64 = new BN(0);

    let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);

    while (bit.gt(new BN(0)) && precision < BIT_PRECISION$1) {
      r = r.mul(r);
      let rMoreThanTwo = r.shrn(127);
      r = r.shrn(63 + rMoreThanTwo.toNumber());
      log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
      bit = bit.shrn(1);
      precision += 1;
    }

    const log2pFractionX32 = log2pFractionX64.shrn(32);

    const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
    const logbpX64 = log2pX32.mul(new BN(LOG_B_2_X32$1));

    const tickLow = signedShiftRight(
      logbpX64.sub(new BN(LOG_B_P_ERR_MARGIN_LOWER_X64$1)),
      64,
      128
    ).toNumber();
    const tickHigh = signedShiftRight(
      logbpX64.add(new BN(LOG_B_P_ERR_MARGIN_UPPER_X64$1)),
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
    ratio = new BN("79232123823359799118286999567");
  } else {
    ratio = new BN("79228162514264337593543950336");
  }

  if ((tick & 2) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79236085330515764027303304731")), 96, 256);
  }
  if ((tick & 4) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79244008939048815603706035061")), 96, 256);
  }
  if ((tick & 8) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79259858533276714757314932305")), 96, 256);
  }
  if ((tick & 16) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79291567232598584799939703904")), 96, 256);
  }
  if ((tick & 32) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79355022692464371645785046466")), 96, 256);
  }
  if ((tick & 64) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79482085999252804386437311141")), 96, 256);
  }
  if ((tick & 128) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("79736823300114093921829183326")), 96, 256);
  }
  if ((tick & 256) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("80248749790819932309965073892")), 96, 256);
  }
  if ((tick & 512) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("81282483887344747381513967011")), 96, 256);
  }
  if ((tick & 1024) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("83390072131320151908154831281")), 96, 256);
  }
  if ((tick & 2048) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("87770609709833776024991924138")), 96, 256);
  }
  if ((tick & 4096) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("97234110755111693312479820773")), 96, 256);
  }
  if ((tick & 8192) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("119332217159966728226237229890")), 96, 256);
  }
  if ((tick & 16384) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("179736315981702064433883588727")), 96, 256);
  }
  if ((tick & 32768) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("407748233172238350107850275304")), 96, 256);
  }
  if ((tick & 65536) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("2098478828474011932436660412517")), 96, 256);
  }
  if ((tick & 131072) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("55581415166113811149459800483533")), 96, 256);
  }
  if ((tick & 262144) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("38992368544603139932233054999993551")), 96, 256);
  }

  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex) {
  let tick = Math.abs(tickIndex);
  let ratio;

  if ((tick & 1) != 0) {
    ratio = new BN("18445821805675392311");
  } else {
    ratio = new BN("18446744073709551616");
  }

  if ((tick & 2) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18444899583751176498")), 64, 256);
  }
  if ((tick & 4) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18443055278223354162")), 64, 256);
  }
  if ((tick & 8) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18439367220385604838")), 64, 256);
  }
  if ((tick & 16) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18431993317065449817")), 64, 256);
  }
  if ((tick & 32) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18417254355718160513")), 64, 256);
  }
  if ((tick & 64) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18387811781193591352")), 64, 256);
  }
  if ((tick & 128) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18329067761203520168")), 64, 256);
  }
  if ((tick & 256) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18212142134806087854")), 64, 256);
  }
  if ((tick & 512) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("17980523815641551639")), 64, 256);
  }
  if ((tick & 1024) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("17526086738831147013")), 64, 256);
  }
  if ((tick & 2048) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("16651378430235024244")), 64, 256);
  }
  if ((tick & 4096) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("15030750278693429944")), 64, 256);
  }
  if ((tick & 8192) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("12247334978882834399")), 64, 256);
  }
  if ((tick & 16384) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("8131365268884726200")), 64, 256);
  }
  if ((tick & 32768) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("3584323654723342297")), 64, 256);
  }
  if ((tick & 65536) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("696457651847595233")), 64, 256);
  }
  if ((tick & 131072) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("26294789957452057")), 64, 256);
  }
  if ((tick & 262144) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("37481735321082")), 64, 256);
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

const PROTOCOL_FEE_RATE_MUL_VALUE = new BN(10000);
const FEE_RATE_MUL_VALUE = new BN(1000000);
const ZERO$2 = new BN(0);
const ONE$1 = new BN(1);
const TWO = new BN(2);
const U64_MAX = TWO.pow(new BN(64)).sub(ONE$1);

const fromX64_BN = (num)=>{
  return num.div(new BN(2).pow(new BN(64)))
};

class u64 extends BN {
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
    if (d.eq(ZERO$2)) {
      throw new Error("mulDiv denominator is zero");
    }

    const p = this.mul(n0, n1, limit);
    const n = p.div(d);

    return roundUp && p.mod(d).gt(ZERO$2) ? n.add(ONE$1) : n;
  }

  static checked_mul_shift_right(n0, n1, limit) {
    return this.checked_mul_shift_right_round_up_if(n0, n1, false, limit);
  }

  static checked_mul_shift_right_round_up_if(n0, n1, roundUp, limit) {
    if (n0.eq(ZERO$2) || n1.eq(ZERO$2)) {
      return ZERO$2;
    }

    const p = this.mul(n0, n1, limit);
    if (this.isOverLimit(p, limit)) {
      throw new Error(
        `MulShiftRight overflowed u${limit}.`
      );
    }
    const result = fromX64_BN(p);
    const shouldRound = roundUp && result.and(U64_MAX).gt(ZERO$2);
    if (shouldRound && result.eq(U64_MAX)) {
      throw new Error(
        `MulShiftRight overflowed u${limit}.`
      );
    }

    return shouldRound ? result.add(ONE$1) : result;
  }

  static isOverLimit(n0, limit) {
    const limitBN = TWO.pow(new BN(limit)).sub(ONE$1);
    return n0.gt(limitBN);
  }

  static divRoundUp(n, d) {
    return this.divRoundUpIf(n, d, true);
  }

  static divRoundUpIf(n, d, roundUp) {
    if (d.eq(ZERO$2)) {
      throw new Error("divRoundUpIf - divide by zero");
    }

    let q = n.div(d);

    return roundUp && n.mod(d).gt(ZERO$2) ? q.add(ONE$1) : q;
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
  if (amount.eq(ZERO$2)) {
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

  if (price.lt(new BN(MIN_SQRT_PRICE))) {
    throw new Error(
      "getNextSqrtPriceFromARoundUp - price less than min sqrt price"
    );
  } else if (price.gt(new BN(MAX_SQRT_PRICE))) {
    throw new Error(
      "getNextSqrtPriceFromARoundUp - price less than max sqrt price"
    );
  }

  return price;
};

const getNextSqrtPrices = (nextTick, sqrtPriceLimit, aToB) => {
  const nextTickPrice = PriceMath.tickIndexToSqrtPriceX64(nextTick);
  const nextSqrtPriceLimit = aToB ? BN.max(sqrtPriceLimit, nextTickPrice) : BN.min(sqrtPriceLimit, nextTickPrice);
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

  let result = roundUp && !remainder.eq(ZERO$2) ? quotient.add(ONE$1) : quotient;

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
      FEE_RATE_MUL_VALUE.sub(new BN(feeRate)),
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
    const feeRateBN = new BN(feeRate);
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

  if (currLiquidity.gt(ZERO$2)) {
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
  let amountCalculated = ZERO$2;
  let currSqrtPrice = freshWhirlpoolData.sqrtPrice;
  let currLiquidity = freshWhirlpoolData.liquidity;
  let currTickIndex = freshWhirlpoolData.tickCurrentIndex;
  let totalFeeAmount = ZERO$2;
  const feeRate = freshWhirlpoolData.feeRate;
  const protocolFeeRate = freshWhirlpoolData.protocolFeeRate;
  let currProtocolFee = new u64(0);
  let currFeeGrowthGlobalInput = aToB ? freshWhirlpoolData.feeGrowthGlobalA : freshWhirlpoolData.feeGrowthGlobalB;

  while (amountRemaining.gt(ZERO$2) && !sqrtPriceLimit.eq(currSqrtPrice)) {
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

const WHIRLPOOL_REWARD_LAYOUT = struct([
  publicKey("mint"),
  publicKey("vault"),
  publicKey("authority"),
  u128("emissionsPerSecondX64"),
  u128("growthGlobalX64"),
]);

const WHIRLPOOL_LAYOUT = struct([
  u64$1("anchorDiscriminator"),
  publicKey("whirlpoolsConfig"),
  seq(u8(), 1, "whirlpoolBump"),
  u16("tickSpacing"),
  seq(u8(), 2, "tickSpacingSeed"),
  u16("feeRate"),
  u16("protocolFeeRate"),
  u128("liquidity"),
  u128("sqrtPrice"),
  i32("tickCurrentIndex"),
  u64$1("protocolFeeOwedA"),
  u64$1("protocolFeeOwedB"),
  publicKey("tokenMintA"),
  publicKey("tokenVaultA"),
  u128("feeGrowthGlobalA"),
  publicKey("tokenMintB"),
  publicKey("tokenVaultB"),
  u128("feeGrowthGlobalB"),
  u64$1("rewardLastUpdatedTimestamp"),
  seq(WHIRLPOOL_REWARD_LAYOUT, 3, "rewardInfos"),
]);

const TICK_LAYOUT = struct([
  bool("initialized"),
  i128("liquidityNet"),
  u128("liquidityGross"),
  u128("feeGrowthOutsideA"),
  u128("feeGrowthOutsideB"),
  seq(u128(), 3, "reward_growths_outside"),
]);

const TICK_ARRAY_LAYOUT$1 = struct([
  u64$1("anchorDiscriminator"),
  i32("startTickIndex"),
  seq(TICK_LAYOUT, 88, "ticks"),
  publicKey("whirlpool"),
]);

const MAX_SWAP_TICK_ARRAYS = 3;
const MAX_TICK_INDEX = 443636; // i32
const MIN_TICK_INDEX = -443636; // i32
const TICK_ARRAY_SIZE$2 = 88; // i32

const getStartTickIndex = (tickIndex, tickSpacing, offset) => {
  const realIndex = Math.floor(tickIndex / tickSpacing / TICK_ARRAY_SIZE$2);
  const startTickIndex = (realIndex + offset) * tickSpacing * TICK_ARRAY_SIZE$2;

  const ticksInArray = TICK_ARRAY_SIZE$2 * tickSpacing;
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
      await PublicKey.findProgramAddress([
          Buffer.from('tick_array'),
          new PublicKey(pool.toString()).toBuffer(),
          Buffer.from(startIndex.toString())
        ],
        new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
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
        data = await request({ blockchain: 'solana' , address: address.toString(), api: TICK_ARRAY_LAYOUT$1, cache: 10 });
      } catch (e2) {}

      return { address, data }
    }))
  )
};

class TickArrayIndex {
  
  static fromTickIndex(index, tickSpacing) {
    const arrayIndex = Math.floor(Math.floor(index / tickSpacing) / TICK_ARRAY_SIZE$2);
    let offsetIndex = Math.floor((index % (tickSpacing * TICK_ARRAY_SIZE$2)) / tickSpacing);
    if (offsetIndex < 0) {
      offsetIndex = TICK_ARRAY_SIZE$2 + offsetIndex;
    }
    return new TickArrayIndex(arrayIndex, offsetIndex, tickSpacing)
  }

  constructor(arrayIndex, offsetIndex, tickSpacing) {
    if (offsetIndex >= TICK_ARRAY_SIZE$2) {
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
      this.arrayIndex * TICK_ARRAY_SIZE$2 * this.tickSpacing + this.offsetIndex * this.tickSpacing
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
    const upperBound = startTick + this.tickSpacing * TICK_ARRAY_SIZE$2;
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
    
    const freshWhirlpoolData = await request({
      blockchain: 'solana',
      address: account.pubkey.toString(),
      api: WHIRLPOOL_LAYOUT,
      cache: 10,
    });

    const aToB = (freshWhirlpoolData.tokenMintA.toString() === tokenIn);

    const tickArrays = await getTickArrays({ pool: account.pubkey, freshWhirlpoolData, aToB });

    const tickSequence = new TickArraySequence(tickArrays, freshWhirlpoolData.tickSpacing, aToB);

    const sqrtPriceLimit = new BN(aToB ? MIN_SQRT_PRICE : MAX_SQRT_PRICE);

    const amount = amountIn || amountInMax || amountOut || amountOutMin;

    const amountSpecifiedIsInput = !!(amountIn || amountInMax);

    const amountCalculated = compute({
      tokenAmount: new BN(amount.toString()),
      aToB,
      freshWhirlpoolData,
      tickSequence,
      sqrtPriceLimit,
      amountSpecifiedIsInput,
    });

    if(amountCalculated.toString() == "0"){
      throw('amountCalculated cant be zero!')
    }

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
  if(quote === Blockchains.solana.wrapped.address) { return [] } // WSOL is base not QUOTE!
  let accounts = await request(`solana://whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc/getProgramAccounts`, {
    params: { filters: [
      { dataSize: WHIRLPOOL_LAYOUT.span },
      { memcmp: { offset: 101, bytes: base }}, // tokenMintA
      { memcmp: { offset: 181, bytes: quote }} // tokenMintB
    ]},
    api: WHIRLPOOL_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['whirlpool', base.toString(), quote.toString()].join('-')
  });
  return accounts
};

let getPairsWithPrice$3 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
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

let getHighestPrice$1 = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
};

let getLowestPrice$1 = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
};

let getBestPair$1 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
  const pairs = await getPairsWithPrice$3({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin });

  if(!pairs || pairs.length === 0) { return }

  let bestPair;

  if(amountIn || amountInMax) {
    bestPair = getHighestPrice$1(pairs);
  } else { // amount out
    bestPair = getLowestPrice$1(pairs);
  }
  return bestPair
};

function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const blockchain$3 = Blockchains.solana;

// Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
//
// We keep 11111111111111111111111111111111 internally
// to be able to differentiate between SOL<>Token and WSOL<>Token swaps
// as they are not the same!
//
let getExchangePath$1 = ({ path }) => {
  if(!path) { return }
  let exchangePath = path.map((token, index) => {
    if (
      token === blockchain$3.currency.address && path[index+1] != blockchain$3.wrapped.address &&
      path[index-1] != blockchain$3.wrapped.address
    ) {
      return blockchain$3.wrapped.address
    } else {
      return token
    }
  });

  if(exchangePath[0] == blockchain$3.currency.address && exchangePath[1] == blockchain$3.wrapped.address) {
    exchangePath.splice(0, 1);
  } else if(exchangePath[exchangePath.length-1] == blockchain$3.currency.address && exchangePath[exchangePath.length-2] == blockchain$3.wrapped.address) {
    exchangePath.splice(exchangePath.length-1, 1);
  }

  return exchangePath
};

let pathExists$1 = async ({ path, amountIn, amountInMax, amountOut, amountOutMin }) => {
  if(path.length == 1) { return false }
  path = getExchangePath$1({ path });
  if((await getPairsWithPrice$3({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin })).length > 0) {
    return true
  } else {
    return false
  }
};

let findPath$1 = async ({ tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
  if(
    [tokenIn, tokenOut].includes(blockchain$3.currency.address) &&
    [tokenIn, tokenOut].includes(blockchain$3.wrapped.address)
  ) { return { path: undefined, exchangePath: undefined } }

  let path, stablesIn, stablesOut, stable;

  if (await pathExists$1({ path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != blockchain$3.wrapped.address &&
    tokenIn != blockchain$3.currency.address &&
    await pathExists$1({ path: [tokenIn, blockchain$3.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
    tokenOut != blockchain$3.wrapped.address &&
    tokenOut != blockchain$3.currency.address &&
    await pathExists$1({ path: [tokenOut, blockchain$3.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
  ) {
    // path via blockchain.wrapped.address
    path = [tokenIn, blockchain$3.wrapped.address, tokenOut];
  } else if (
    !blockchain$3.stables.usd.includes(tokenIn) &&
    (stablesIn = (await Promise.all(blockchain$3.stables.usd.map(async(stable)=>await pathExists$1({ path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
    !blockchain$3.stables.usd.includes(tokenOut) &&
    (stablesOut = (await Promise.all(blockchain$3.stables.usd.map(async(stable)=>await pathExists$1({ path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
    (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
  ) {
    // path via TOKEN_IN <> STABLE <> TOKEN_OUT
    path = [tokenIn, stable, tokenOut];
  }

  // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
  // because that actually reflects how things are routed in reality:
  if(_optionalChain$3([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$3.currency.address) {
    path.splice(1, 0, blockchain$3.wrapped.address);
  } else if(_optionalChain$3([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$3.currency.address) {
    path.splice(path.length-1, 0, blockchain$3.wrapped.address);
  }
  return { path, exchangePath: getExchangePath$1({ path }) }
};

let getAmountsOut$1 = async ({ path, amountIn, amountInMax }) => {

  let amounts = [ethers.BigNumber.from(amountIn || amountInMax)];

  let bestPair = await getBestPair$1({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax });
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price));
  
  if (path.length === 3) {
    let bestPair = await getBestPair$1({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined });
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price));
  }

  if(amounts.length != path.length) { return }

  return amounts
};

let getAmountsIn$1 = async({ path, amountOut, amountOutMin }) => {

  path = path.slice().reverse();
  let amounts = [ethers.BigNumber.from(amountOut || amountOutMin)];

  let bestPair = await getBestPair$1({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin });
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price));
  
  if (path.length === 3) {
    let bestPair = await getBestPair$1({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined });
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price));
  }
  
  if(amounts.length != path.length) { return }

  return amounts.slice().reverse()
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
  path = getExchangePath$1({ path });
  let amounts;
  if (amountOut) {
    amounts = await getAmountsIn$1({ path, amountOut, tokenIn, tokenOut });
    amountIn = amounts ? amounts[0] : undefined;
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if (amountIn) {
    amounts = await getAmountsOut$1({ path, amountIn, tokenIn, tokenOut });
    amountOut = amounts ? amounts[amounts.length-1] : undefined;
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut;
    }
  } else if(amountOutMin) {
    amounts = await getAmountsIn$1({ path, amountOutMin, tokenIn, tokenOut });
    amountIn = amounts ? amounts[0] : undefined;
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn;
    }
  } else if(amountInMax) {
    amounts = await getAmountsOut$1({ path, amountInMax, tokenIn, tokenOut });
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

const blockchain$2 = Blockchains.solana;
const SWAP_INSTRUCTION = new BN("14449647541112719096");
const TWO_HOP_SWAP_INSTRUCTION = new BN("16635068063392030915");

const createTokenAccountIfNotExisting$1 = async ({ instructions, owner, token, account })=>{
  let outAccountExists;
  try{ outAccountExists = !!(await request({ blockchain: 'solana', address: account.toString() })); } catch (e2) {}
  if(!outAccountExists) {
    instructions.push(
      await Token.solana.createAssociatedTokenAccountInstruction({
        token,
        owner,
        payer: owner,
      })
    );
  }
};

const getTwoHopSwapInstructionKeys = async ({
  account,
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
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    // token_authority
    { pubkey: new PublicKey(account), isWritable: false, isSigner: true },
    // whirlpool_one
    { pubkey: new PublicKey(poolOne.toString()), isWritable: true, isSigner: false },
    // whirlpool_two
    { pubkey: new PublicKey(poolTwo.toString()), isWritable: true, isSigner: false },
    // token_owner_account_one_a
    { pubkey: new PublicKey(tokenAccountOneA.toString()), isWritable: true, isSigner: false },
    // token_vault_one_a
    { pubkey: new PublicKey(tokenVaultOneA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_one_b
    { pubkey: new PublicKey(tokenAccountOneB.toString()), isWritable: true, isSigner: false },
    // token_vault_one_b
    { pubkey: new PublicKey(tokenVaultOneB.toString()), isWritable: true, isSigner: false },
    // token_owner_account_two_a
    { pubkey: new PublicKey(tokenAccountTwoA.toString()), isWritable: true, isSigner: false },
    // token_vault_two_a
    { pubkey: new PublicKey(tokenVaultTwoA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_two_b
    { pubkey: new PublicKey(tokenAccountTwoB.toString()), isWritable: true, isSigner: false },
    // token_vault_two_b
    { pubkey: new PublicKey(tokenVaultTwoB.toString()), isWritable: true, isSigner: false },
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
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(poolOne.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
    // oracle_two
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(poolTwo.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
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
  
  LAYOUT = struct([
    u64$1("anchorDiscriminator"),
    u64$1("amount"),
    u64$1("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ]);
  data = Buffer.alloc(LAYOUT.span);
  LAYOUT.encode(
    {
      anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION,
      amount: new BN(amount.toString()),
      otherAmountThreshold: new BN(otherAmountThreshold.toString()),
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
  account,
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
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
    // token_authority
    { pubkey: new PublicKey(account), isWritable: false, isSigner: true },
    // whirlpool
    { pubkey: new PublicKey(pool.toString()), isWritable: true, isSigner: false },
    // token_owner_account_a
    { pubkey: new PublicKey(tokenAccountA.toString()), isWritable: true, isSigner: false },
    // token_vault_a
    { pubkey: new PublicKey(tokenVaultA.toString()), isWritable: true, isSigner: false },
    // token_owner_account_b
    { pubkey: new PublicKey(tokenAccountB.toString()), isWritable: true, isSigner: false },
    // token_vault_b
    { pubkey: new PublicKey(tokenVaultB.toString()), isWritable: true, isSigner: false },
    // tick_array_0
    { pubkey: onlyInitializedTicks[0].address, isWritable: true, isSigner: false },
    // tick_array_1
    { pubkey: onlyInitializedTicks[1].address, isWritable: true, isSigner: false },
    // tick_array_2
    { pubkey: onlyInitializedTicks[2].address, isWritable: true, isSigner: false },
    // oracle
    { pubkey: (await PublicKey.findProgramAddress([ Buffer.from('oracle'), new PublicKey(pool.toString()).toBuffer() ], new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
  ]
};

const getSwapInstructionData = ({ amount, otherAmountThreshold, sqrtPriceLimit, amountSpecifiedIsInput, aToB })=> {
  let LAYOUT, data;
  
  LAYOUT = struct([
    u64$1("anchorDiscriminator"),
    u64$1("amount"),
    u64$1("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ]);
  data = Buffer.alloc(LAYOUT.span);
  LAYOUT.encode(
    {
      anchorDiscriminator: SWAP_INSTRUCTION,
      amount: new BN(amount.toString()),
      otherAmountThreshold: new BN(otherAmountThreshold.toString()),
      sqrtPriceLimit,
      amountSpecifiedIsInput,
      aToB,
    },
    data,
  );

  return data
};

const getTransaction$1 = async ({
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
  account
}) => {
  let transaction = { blockchain: 'solana' };
  let instructions = [];

  const exchangePath = getExchangePath$1({ path });
  if(exchangePath.length > 3) { throw 'Orca can only handle fixed paths with a max length of 3 (2 pools)!' }
  const tokenIn = exchangePath[0];
  const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined;
  const tokenOut = exchangePath[exchangePath.length-1];

  let pairs;
  if(exchangePath.length == 2) {
    pairs = [await getBestPair$1({ tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })];
  } else {
    if(amountInInput || amountInMaxInput) {
      pairs = [await getBestPair$1({ tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })];
      pairs.push(await getBestPair$1({ tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }));
    } else { // originally amountOut
      pairs = [await getBestPair$1({ tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })];
      pairs.unshift(await getBestPair$1({ tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }));
    }
  }

  let startsWrapped = (path[0] === blockchain$2.currency.address && exchangePath[0] === blockchain$2.wrapped.address);
  let endsUnwrapped = (path[path.length-1] === blockchain$2.currency.address && exchangePath[exchangePath.length-1] === blockchain$2.wrapped.address);
  let wrappedAccount;
  const provider = await getProvider('solana');
  
  if(startsWrapped || endsUnwrapped) {
    const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span);
    const keypair = Keypair.generate();
    wrappedAccount = keypair.publicKey.toString();
    const lamports = startsWrapped ? new BN(amountIn.toString()).add(new BN(rent)) :  new BN(rent);
    let createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: new PublicKey(account),
      newAccountPubkey: new PublicKey(wrappedAccount),
      programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
      space: Token.solana.TOKEN_LAYOUT.span,
      lamports
    });
    createAccountInstruction.signers = [keypair];
    instructions.push(createAccountInstruction);
    instructions.push(
      Token.solana.initializeAccountInstruction({
        account: wrappedAccount,
        token: blockchain$2.wrapped.address,
        owner: account
      })
    );
  }

  if(pairs.length === 1) {
    // amount is NOT the precise part of the swap (otherAmountThreshold is)
    let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput);
    let amount = amountSpecifiedIsInput ? amountIn : amountOut;
    let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax;
    let tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
    let tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
    }
    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
        keys: await getSwapInstructionKeys({
          account,
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
    let tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
    let tokenMiddle = exchangePath[1];
    let tokenAccountMiddle = new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }));
    await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenMiddle, account: tokenAccountMiddle });
    let tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
    }
    instructions.push(
      new TransactionInstruction({
        programId: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
        keys: await getTwoHopSwapInstructionKeys({
          account,
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
      Token.solana.closeAccountInstruction({
        account: wrappedAccount,
        owner: account
      })
    );
  }

  // await debug(instructions, provider)

  transaction.instructions = instructions;
  return transaction
};

var Orca = {
  findPath: findPath$1,
  pathExists: pathExists$1,
  getAmounts: getAmounts$1,
  getTransaction: getTransaction$1,
  WHIRLPOOL_LAYOUT,
};

const exchange$1 = {
  
  name: 'orca',
  label: 'Orca',
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImthdG1hbl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNjAwIDQ1MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAwIDQ1MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjRkZEMTVDIiBkPSJNNDg4LjQsMjIyLjljMCwxMDMuOC04NC4xLDE4Ny45LTE4Ny45LDE4Ny45Yy0xMDMuOCwwLTE4Ny45LTg0LjEtMTg3LjktMTg3LjlDMTEyLjYsMTE5LjEsMTk2LjcsMzUsMzAwLjUsMzUKCUM0MDQuMiwzNSw0ODguNCwxMTkuMSw0ODguNCwyMjIuOXoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjE3LjY3NTUiIGQ9Ik0yMDkuNSwyOTkuOGMxLjYtMS4xLDMuMS0yLjgsMy45LTUuMWMwLjgtMi42LDAuMy00LjksMC02LjJjMCwwLDAtMC4xLDAtMC4xbDAuMy0xLjhjMC45LDAuNSwxLjksMS4xLDMsMS45CgljMC4zLDAuMiwwLjcsMC41LDEuMSwwLjdjMC41LDAuNCwxLjEsMC44LDEuNCwxYzAuNiwwLjQsMS41LDEsMi41LDEuNWMyNS4xLDE1LjYsNDUuOCwyMiw2Mi4yLDIxLjJjMTctMC44LDI4LjktOS40LDM1LjEtMjEuOQoJYzUuOS0xMi4xLDYuMi0yNywyLTQwLjljLTQuMi0xMy45LTEzLTI3LjUtMjYuMi0zNi45Yy0yMi4yLTE1LjgtNDIuNS0zOS44LTUyLjctNjAuM2MtNS4yLTEwLjQtNy4zLTE4LjctNi43LTI0LjIKCWMwLjMtMi41LDEtNC4xLDItNS4xYzAuOS0xLDIuNi0yLjEsNS45LTIuNmM2LjktMS4xLDE1LTMuNiwyMy4xLTYuMmMzLjItMSw2LjMtMiw5LjUtMi45YzExLjctMy40LDI0LjItNi4zLDM3LjItNi4zCgljMjUuMywwLDU1LDExLDg2LjMsNTYuOGM0MC4yLDU4LjgsMTguMSwxMjQuNC0yOC4yLDE1OC45Yy0yMy4xLDE3LjItNTEuOSwyNi4zLTgxLjUsMjIuOUMyNjIuOSwzNDEuMywyMzQuOSwzMjcuOSwyMDkuNSwyOTkuOHoKCSBNMjE0LjIsMjg0LjZDMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjcsMjE0LjIsMjg0LjZDMjE0LjEsMjg0LjcsMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjZ6IE0yMTEuNiwyODUuOAoJQzIxMS42LDI4NS44LDIxMS43LDI4NS44LDIxMS42LDI4NS44QzIxMS43LDI4NS44LDIxMS42LDI4NS44LDIxMS42LDI4NS44eiIvPgo8cGF0aCBkPSJNMjMyLjUsMTI0LjNjMCwwLDcxLjgtMTkuMSw4Ny41LTE5LjFjMTUuNywwLDc4LjYsMzAuNSw5Ni45LDg2LjNjMjYsNzktNDQuNywxMzAuOS01Mi43LDEyNS44CgljNzYuMS02Mi45LTQ4LjQtMTc5LjEtMTA5LjYtMTcwLjRjLTcuNiwxLjEtMy40LDcuNi0zLjQsNy42bC0xLjcsMTdsLTEyLjctMjEuMkwyMzIuNSwxMjQuM3oiLz4KPHBhdGggZD0iTTQwNi41LDE2Ny42YzIyLjcsMzkuOSwxOCwxNy4xLDEyLjksNjIuN2M5LjMtMTUuMSwyMy45LTMuOCwyOS45LDJjMS4xLDEsMi45LDAuNCwyLjgtMS4xYy0wLjItNi44LTIuMi0yMS40LTEzLjQtMzcuMQoJQzQyMy40LDE3Mi42LDQwNi41LDE2Ny42LDQwNi41LDE2Ny42eiIvPgo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC45OTMiIGQ9Ik00MTkuNCwyMzAuM2M1LTQ1LjYsOS43LTIyLjgtMTIuOS02Mi43YzAsMCwxNi45LDUsMzIuMywyNi41YzExLjIsMTUuNywxMy4xLDMwLjMsMTMuNCwzNy4xCgljMC4xLDEuNS0xLjcsMi4xLTIuOCwxLjFDNDQzLjMsMjI2LjUsNDI4LjcsMjE1LjMsNDE5LjQsMjMwLjN6IE00MTkuNCwyMzAuM2MwLjktMi4xLDIuMi01LjUsMi4yLTUuNSIvPgo8cGF0aCBkPSJNMjI0LDIyNC4yYy05LjYsMTYuMi0yOS4yLDE1LTI4LjgsMzQuM2MxNy41LDM5LDE3LjYsMzYuMiwxNy42LDM2LjJjMzIuNS0xOC4yLDE5LjEtNTguNSwxNC4zLTcwLjQKCUMyMjYuNiwyMjMsMjI0LjcsMjIzLDIyNCwyMjQuMnoiLz4KPHBhdGggZD0iTTE1MC40LDI2MC4xYzE4LjcsMi40LDI5LjgtMTMuOCw0NC44LTEuNmMxOS45LDM3LjgsMTcuNiwzNi4yLDE3LjYsMzYuMmMtMzQuNCwxNC40LTU3LjktMjEtNjQuMy0zMi4xCglDMTQ3LjgsMjYxLjMsMTQ5LDI1OS45LDE1MC40LDI2MC4xeiIvPgo8cGF0aCBkPSJNMzA2LjksMjM2YzAsMCwxOC43LDE5LjEsOC45LDIyLjFjLTEyLjItNy41LTM0LTEuNy00NC43LDEuOWMtMi42LDAuOS01LjItMS40LTQuMy00LjFjMy42LTEwLDEyLjYtMjguNiwyOS45LTMxCglDMzA2LjksMjIyLjQsMzA2LjksMjM2LDMwNi45LDIzNnoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTMxOC4zLDE0Mi41Yy0yLjEtMy02LjQtMTEsNi44LTExYzEzLjIsMCwzMy4zLDE0LjksMzcuNCwyMC40Yy0xLjMsMy40LTkuOCw0LjEtMTQsMy44Yy00LjItMC4zLTExLjUtMS0xNy0zLjgKCUMzMjYsMTQ5LjIsMzIwLjUsMTQ1LjUsMzE4LjMsMTQyLjV6Ii8+Cjwvc3ZnPgo=',
  protocol: 'orca',
  
  slippage: true,

  blockchains: ['solana'],

  solana: {
    router: {
      address: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      api: Orca.WHIRLPOOL_LAYOUT,
    },
  }
};

var orca = (scope)=>{
  
  return new Exchange(

    Object.assign(exchange$1, {
      scope,

      findPath: (args)=>Orca.findPath({ ...args, exchange: exchange$1 }),
      pathExists: (args)=>Orca.pathExists({ ...args, exchange: exchange$1 }),
      getAmounts: (args)=>Orca.getAmounts({ ...args, exchange: exchange$1 }),
      getPrep: (args)=>{},
      getTransaction: (args)=>Orca.getTransaction({ ...args, exchange: exchange$1 }),
    })
  )
};

// CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C
const CPMM_LAYOUT = struct([
  blob(8),
  publicKey("configId"),
  publicKey("poolCreator"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("mintLp"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("mintProgramA"),
  publicKey("mintProgramB"),
  publicKey("observationId"),
  u8("bump"),
  u8("status"),
  u8("lpDecimals"),
  u8("mintDecimalA"),
  u8("mintDecimalB"),
  u64$1("lpAmount"),
  u64$1("protocolFeesMintA"),
  u64$1("protocolFeesMintB"),
  u64$1("fundFeesMintA"),
  u64$1("fundFeesMintB"),
  u64$1("openTime"),
  seq(u64$1(), 32),
]);

const CPMM_CONFIG_LAYOUT = struct([
  blob(8),
  u8("bump"),
  bool("disableCreatePool"),
  u16("index"),
  u64$1("tradeFeeRate"),
  u64$1("protocolFeeRate"),
  u64$1("fundFeeRate"),
  u64$1("createPoolFee"),

  publicKey("protocolOwner"),
  publicKey("fundOwner"),
  seq(u64$1(), 16),
]);

// CLMM 
const RewardInfo = struct([
  u8("rewardState"),
  u64$1("openTime"),
  u64$1("endTime"),
  u64$1("lastUpdateTime"),
  u128("emissionsPerSecondX64"),
  u64$1("rewardTotalEmissioned"),
  u64$1("rewardClaimed"),
  publicKey("tokenMint"),
  publicKey("tokenVault"),
  publicKey("creator"),
  u128("rewardGrowthGlobalX64"),
]);

const CLMM_LAYOUT = struct([
  blob(8),
  u8("bump"),
  publicKey("ammConfig"),
  publicKey("creator"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("observationId"),
  u8("mintDecimalsA"),
  u8("mintDecimalsB"),
  u16("tickSpacing"),
  u128("liquidity"),
  u128("sqrtPriceX64"),
  i32("tickCurrent"),
  u32(),
  u128("feeGrowthGlobalX64A"),
  u128("feeGrowthGlobalX64B"),
  u64$1("protocolFeesTokenA"),
  u64$1("protocolFeesTokenB"),
  u128("swapInAmountTokenA"),
  u128("swapOutAmountTokenB"),
  u128("swapInAmountTokenB"),
  u128("swapOutAmountTokenA"),
  u8("status"),
  seq(u8(), 7, ""),
  seq(RewardInfo, 3, "rewardInfos"),
  seq(u64$1(), 16, "tickArrayBitmap"),
  u64$1("totalFeesTokenA"),
  u64$1("totalFeesClaimedTokenA"),
  u64$1("totalFeesTokenB"),
  u64$1("totalFeesClaimedTokenB"),
  u64$1("fundFeesTokenA"),
  u64$1("fundFeesTokenB"),
  u64$1("startTime"),
  seq(u64$1(), 15 * 4 - 3, "padding"),
]);

const CLMM_CONFIG_LAYOUT = struct([
  blob(8),
  u8("bump"),
  u16("index"),
  publicKey(""),
  u32("protocolFeeRate"),
  u32("tradeFeeRate"),
  u16("tickSpacing"),
  seq(u64$1(), 8, ""),
]);

const TICK_ARRAY_SIZE$1 = 60;

const TickLayout = struct([
  i32("tick"),
  i128("liquidityNet"),
  u128("liquidityGross"),
  u128("feeGrowthOutsideX64A"),
  u128("feeGrowthOutsideX64B"),
  seq(u128(), 3, "rewardGrowthsOutsideX64"),
  seq(u32(), 13, ""),
]);

const TICK_ARRAY_LAYOUT = struct([
  blob(8),
  publicKey("poolId"),
  i32("startTickIndex"),
  seq(TickLayout, TICK_ARRAY_SIZE$1, "ticks"),
  u8("initializedTickCount"),
  seq(u8(), 115, ""),
]);

const EXTENSION_TICKARRAY_BITMAP_SIZE = 14;

const TICK_ARRAY_BITMAP_EXTENSION_LAYOUT = struct([
  blob(8),
  publicKey("poolId"),
  seq(seq(u64$1(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "positiveTickArrayBitmap"),
  seq(seq(u64$1(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "negativeTickArrayBitmap"),
]);

function BNDivCeil(bn1, bn2) {
  const { div, mod } = bn1.divmod(bn2);

  if (mod.gt(new BN(0))) {
    return div.add(new BN(1));
  } else {
    return div;
  }
}

function checkedRem(dividend, divisor) {
  
  if (divisor.isZero()) throw Error("divisor is zero");

  const result = dividend.mod(divisor);
  return result;
}

function checkedCeilDiv(dividend, rhs) {
  if (rhs.isZero()) throw Error("rhs is zero");

  let quotient = dividend.div(rhs);

  if (quotient.isZero()) throw Error("quotient is zero");

  let remainder = checkedRem(dividend, rhs);

  if (remainder.gt(ZERO$1)) {
    quotient = quotient.add(new BN(1));

    rhs = dividend.div(quotient);
    remainder = checkedRem(dividend, quotient);
    if (remainder.gt(ZERO$1)) {
      rhs = rhs.add(new BN(1));
    }
  }
  return [quotient, rhs];
}

const ZERO$1 = new BN(0);

class ConstantProductCurve {
  
  static swapWithoutFees(sourceAmount, swapSourceAmount, swapDestinationAmount) {
    const invariant = swapSourceAmount.mul(swapDestinationAmount);

    const newSwapSourceAmount = swapSourceAmount.add(sourceAmount);
    const [newSwapDestinationAmount, _newSwapSourceAmount] = checkedCeilDiv(invariant, newSwapSourceAmount);

    const sourceAmountSwapped = _newSwapSourceAmount.sub(swapSourceAmount);
    const destinationAmountSwapped = swapDestinationAmount.sub(newSwapDestinationAmount);
    if (destinationAmountSwapped.isZero()) throw Error("destinationAmountSwapped is zero");

    return {
      sourceAmountSwapped,
      destinationAmountSwapped,
    };
  }

  static lpTokensToTradingTokens(
    lpTokenAmount,
    lpTokenSupply,
    swapTokenAmount0,
    swapTokenAmount1,
    roundDirection,
  ) {
    let tokenAmount0 = lpTokenAmount.mul(swapTokenAmount0).div(lpTokenSupply);
    let tokenAmount1 = lpTokenAmount.mul(swapTokenAmount1).div(lpTokenSupply);

    if (roundDirection === RoundDirection.Floor) {
      return { tokenAmount0, tokenAmount1 };
    } else if (roundDirection === RoundDirection.Ceiling) {
      const tokenRemainder0 = checkedRem(lpTokenAmount.mul(swapTokenAmount0), lpTokenSupply);

      if (tokenRemainder0.gt(ZERO$1) && tokenAmount0.gt(ZERO$1)) {
        tokenAmount0 = tokenAmount0.add(new BN(1));
      }

      const token1Remainder = checkedRem(lpTokenAmount.mul(swapTokenAmount1), lpTokenSupply);

      if (token1Remainder.gt(ZERO$1) && tokenAmount1.gt(ZERO$1)) {
        tokenAmount1 = tokenAmount1.add(new BN(1));
      }

      return { tokenAmount0, tokenAmount1 };
    }
    throw Error("roundDirection value error");
  }
}

const FEE_RATE_DENOMINATOR_VALUE = new BN(1000000);

function ceilDiv(tokenAmount, feeNumerator, feeDenominator) {
  return tokenAmount.mul(feeNumerator).add(feeDenominator).sub(new BN(1)).div(feeDenominator);
}

function floorDiv(tokenAmount, feeNumerator, feeDenominator) {
  return tokenAmount.mul(feeNumerator).div(feeDenominator);
}

class CpmmFee {
  
  static tradingFee(amount, tradeFeeRate) {
    return ceilDiv(amount, tradeFeeRate, FEE_RATE_DENOMINATOR_VALUE);
  }
  static protocolFee(amount, protocolFeeRate) {
    return floorDiv(amount, protocolFeeRate, FEE_RATE_DENOMINATOR_VALUE);
  }
  static fundFee(amount, fundFeeRate) {
    return floorDiv(amount, fundFeeRate, FEE_RATE_DENOMINATOR_VALUE);
  }
}

class CurveCalculator {

  static validate_supply(tokenAmount0, tokenAmount1) {
    if (tokenAmount0.isZero()) throw Error("tokenAmount0 is zero");
    if (tokenAmount1.isZero()) throw Error("tokenAmount1 is zero");
  }

  static swap(sourceAmount, swapSourceAmount, swapDestinationAmount, tradeFeeRate) {
    const tradeFee = CpmmFee.tradingFee(sourceAmount, tradeFeeRate);

    const sourceAmountLessFees = sourceAmount.sub(tradeFee);

    const { sourceAmountSwapped, destinationAmountSwapped } = ConstantProductCurve.swapWithoutFees(
      sourceAmountLessFees,
      swapSourceAmount,
      swapDestinationAmount,
    );

    const _sourceAmountSwapped = sourceAmountSwapped.add(tradeFee);
    return {
      newSwapSourceAmount: swapSourceAmount.add(_sourceAmountSwapped),
      newSwapDestinationAmount: swapDestinationAmount.sub(destinationAmountSwapped),
      sourceAmountSwapped: _sourceAmountSwapped,
      destinationAmountSwapped,
      tradeFee,
    };
  }

  static swapBaseOut({
    poolMintA,
    poolMintB,
    tradeFeeRate,
    baseReserve,
    quoteReserve,
    outputMint,
    outputAmount,
  }) {
    const [reserveInAmount, reserveOutAmount, reserveInDecimals, reserveOutDecimals, inputMint] =
      poolMintB.address === outputMint.toString()
        ? [baseReserve, quoteReserve, poolMintA.decimals, poolMintB.decimals, poolMintA.address]
        : [quoteReserve, baseReserve, poolMintB.decimals, poolMintA.decimals, poolMintB.address];
    const currentPrice = new Decimal$1(reserveOutAmount.toString())
      .div(10 ** reserveOutDecimals)
      .div(new Decimal$1(reserveInAmount.toString()).div(10 ** reserveInDecimals));
    const amountRealOut = outputAmount.gte(reserveOutAmount) ? reserveOutAmount.sub(new BN(1)) : outputAmount;

    const denominator = reserveOutAmount.sub(amountRealOut);
    const amountInWithoutFee = BNDivCeil(reserveInAmount.mul(amountRealOut), denominator);
    const amountIn = BNDivCeil(amountInWithoutFee.mul(new BN(1000000)), new BN(1000000).sub(tradeFeeRate));
    const fee = amountIn.sub(amountInWithoutFee);
    const executionPrice = new Decimal$1(amountRealOut.toString())
      .div(10 ** reserveOutDecimals)
      .div(new Decimal$1(amountIn.toString()).div(10 ** reserveInDecimals));
    const priceImpact = currentPrice.isZero() ? 0 : executionPrice.sub(currentPrice).div(currentPrice).abs().toNumber();

    return {
      amountRealOut,

      amountIn,
      amountInWithoutFee,

      tradeFee: fee,
      priceImpact,
    };
  }
}

const getConfig = (address)=>{
  return request(`solana://${address}/getAccountInfo`, {
    api: CPMM_CONFIG_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/cpmm/config/', address.toString()].join('/')
  })
};

const getPairs$1 = (base, quote)=>{
  return request(`solana://CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C/getProgramAccounts`, {
    params: { filters: [
      { dataSize: CPMM_LAYOUT.span },
      { memcmp: { offset: 168, bytes: base }},
      { memcmp: { offset: 200, bytes: quote }},
    ]},
    api: CPMM_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/cpmm/', base.toString(), quote.toString()].join('/')
  })
};

const getPairsWithPrice$2 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{

  let accounts = await getPairs$1(tokenIn, tokenOut);

  if(accounts.length == 0) {
    accounts = await getPairs$1(tokenOut, tokenIn);
  }

  const pairs = await Promise.all(accounts.map(async(account)=>{

    let config = await getConfig(account.data.configId.toString());

    // BASE == A

    const baseVaultAmountData = await request(`solana://${account.data.vaultA.toString()}/getTokenAccountBalance`, { cache: 3 });
    const baseReserve = ethers.BigNumber.from(baseVaultAmountData.value.amount).sub(
      ethers.BigNumber.from(account.data.protocolFeesMintA.toString())
    ).sub(
      ethers.BigNumber.from(account.data.fundFeesMintA.toString())
    );

    if( // min liquidity SOL
      (
        tokenIn === Blockchains.solana.currency.address || 
        tokenIn === Blockchains.solana.wrapped.address
      ) && ( baseVaultAmountData.value.uiAmount < 50 )
    ) { return }

    if( // min liquidity stable usd
      (
        Blockchains.solana.stables.usd.includes(tokenIn)
      ) && ( baseVaultAmountData.value.uiAmount < 10000 )
    ) { return }

    // QUOTE == B

    const quoteVaultAmountData = await request(`solana://${account.data.vaultB.toString()}/getTokenAccountBalance`, { cache: 3 });
    const quoteReserve = ethers.BigNumber.from(quoteVaultAmountData.value.amount).sub(
      ethers.BigNumber.from(account.data.protocolFeesMintB.toString())
    ).sub(
      ethers.BigNumber.from(account.data.fundFeesMintB.toString())
    );

    if( // min liquidity SOL
      (
        tokenIn === Blockchains.solana.currency.address || 
        tokenIn === Blockchains.solana.wrapped.address
      ) && ( quoteVaultAmountData.value.uiAmount < 50 )
    ) { return }

    if( // min liquidity stable usd
      (
        Blockchains.solana.stables.usd.includes(tokenIn)
      ) && ( quoteVaultAmountData.value.uiAmount < 10000 )
    ) { return }

    let price = 0;

    if(amountIn || amountInMax) { // uses CurveCalculator.swap: Given an input amount, compute how much comes out.

      const isBaseIn = tokenOut.toString() === account.data.mintB.toString();

      const swapResult = CurveCalculator.swap(
        new BN((amountIn || amountInMax).toString()),
        new BN((isBaseIn ? baseReserve : quoteReserve).toString()),
        new BN((isBaseIn ? quoteReserve : baseReserve).toString()),
        config.tradeFeeRate,
      );

      price = swapResult.destinationAmountSwapped.toString();

    } else { // uses CurveCalculator.swapBaseOut: Given a desired output amount, compute how much you need to put in (and some extra info like price impact).

      const swapResult = CurveCalculator.swapBaseOut({
        poolMintA: { decimals: account.data.mintDecimalA, address: account.data.mintA.toString() },
        poolMintB: { decimals: account.data.mintDecimalB, address: account.data.mintB.toString() },
        tradeFeeRate: config.tradeFeeRate,
        baseReserve: new BN(baseReserve.toString()),
        quoteReserve: new BN(quoteReserve.toString()),
        outputMint: tokenOut,
        outputAmount: new BN((amountOut || amountOutMin).toString())
      });

      price = swapResult.amountIn.toString();

    }

    if(price === 0) { return }

    return {
      type: 'cpmm',
      publicKey: account.pubkey.toString(),
      mintA: account.data.mintA.toString(),
      mintB: account.data.mintB.toString(),
      price,
      data: account.data
    }
  }));

  return pairs.filter(Boolean)

};

const BIT_PRECISION = 16;
const FEE_RATE_DENOMINATOR = new BN(10).pow(new BN(6));
const LOG_B_2_X32 = "59543866431248";
const LOG_B_P_ERR_MARGIN_LOWER_X64 = "184467440737095516";
const LOG_B_P_ERR_MARGIN_UPPER_X64 = "15793534762490258745";
const MAX_SQRT_PRICE_X64 = new BN("79226673521066979257578248091");
new BN("79226673521066979257578248090");
const MIN_TICK = -443636;
const MAX_TICK = -MIN_TICK;
const Q64 = new BN(1).shln(64);
const ONE = new BN(1);
const MaxU64 = Q64.sub(ONE);
const Q128 = new BN(1).shln(128);
const MaxUint128 = Q128.subn(1);
const MIN_SQRT_PRICE_X64 = new BN("4295048016");
new BN("4295048017");
const NEGATIVE_ONE = new BN(-1);
const POOL_TICK_ARRAY_BITMAP_SEED = Buffer.from("pool_tick_array_bitmap_extension", "utf8");
const PROGRAM_ID = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK';
const TICK_ARRAY_BITMAP_SIZE = 512;
const TICK_ARRAY_SEED = Buffer.from("tick_array", "utf8");
const TICK_ARRAY_SIZE = 60;
const U64Resolution = 64;
const ZERO = new BN(0);

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

class LiquidityMath {
  
  static addDelta(x, y) {
    return x.add(y);
  }

  static getTokenAmountAFromLiquidity(
    sqrtPriceX64A,
    sqrtPriceX64B,
    liquidity,
    roundUp,
  ) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }

    if (!sqrtPriceX64A.gt(ZERO)) {
      throw new Error("sqrtPriceX64A must greater than 0");
    }

    const numerator1 = liquidity.ushln(U64Resolution);
    const numerator2 = sqrtPriceX64B.sub(sqrtPriceX64A);

    return roundUp
      ? MathUtil.mulDivRoundingUp(MathUtil.mulDivCeil(numerator1, numerator2, sqrtPriceX64B), ONE, sqrtPriceX64A)
      : MathUtil.mulDivFloor(numerator1, numerator2, sqrtPriceX64B).div(sqrtPriceX64A);
  }

  static getTokenAmountBFromLiquidity(
    sqrtPriceX64A,
    sqrtPriceX64B,
    liquidity,
    roundUp,
  ) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }
    if (!sqrtPriceX64A.gt(ZERO)) {
      throw new Error("sqrtPriceX64A must greater than 0");
    }

    return roundUp
      ? MathUtil.mulDivCeil(liquidity, sqrtPriceX64B.sub(sqrtPriceX64A), Q64)
      : MathUtil.mulDivFloor(liquidity, sqrtPriceX64B.sub(sqrtPriceX64A), Q64);
  }

  static getLiquidityFromTokenAmountA(sqrtPriceX64A, sqrtPriceX64B, amountA, roundUp) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }

    const numerator = amountA.mul(sqrtPriceX64A).mul(sqrtPriceX64B);
    const denominator = sqrtPriceX64B.sub(sqrtPriceX64A);
    const result = numerator.div(denominator);

    if (roundUp) {
      return MathUtil.mulDivRoundingUp(result, ONE, MaxU64);
    } else {
      return result.shrn(U64Resolution);
    }
  }

  static getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceX64B, amountB) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }
    return MathUtil.mulDivFloor(amountB, MaxU64, sqrtPriceX64B.sub(sqrtPriceX64A));
  }

  static getLiquidityFromTokenAmounts(
    sqrtPriceCurrentX64,
    sqrtPriceX64A,
    sqrtPriceX64B,
    amountA,
    amountB,
  ) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }

    if (sqrtPriceCurrentX64.lte(sqrtPriceX64A)) {
      return LiquidityMath.getLiquidityFromTokenAmountA(sqrtPriceX64A, sqrtPriceX64B, amountA, false);
    } else if (sqrtPriceCurrentX64.lt(sqrtPriceX64B)) {
      const liquidity0 = LiquidityMath.getLiquidityFromTokenAmountA(sqrtPriceCurrentX64, sqrtPriceX64B, amountA, false);
      const liquidity1 = LiquidityMath.getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceCurrentX64, amountB);
      return liquidity0.lt(liquidity1) ? liquidity0 : liquidity1;
    } else {
      return LiquidityMath.getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceX64B, amountB);
    }
  }

  static getAmountsFromLiquidity(
    sqrtPriceCurrentX64,
    sqrtPriceX64A,
    sqrtPriceX64B,
    liquidity,
    roundUp,
  ) {
    if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
      [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
    }

    if (sqrtPriceCurrentX64.lte(sqrtPriceX64A)) {
      return {
        amountA: LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64A, sqrtPriceX64B, liquidity, roundUp),
        amountB: new BN(0),
      };
    } else if (sqrtPriceCurrentX64.lt(sqrtPriceX64B)) {
      const amountA = LiquidityMath.getTokenAmountAFromLiquidity(
        sqrtPriceCurrentX64,
        sqrtPriceX64B,
        liquidity,
        roundUp,
      );
      const amountB = LiquidityMath.getTokenAmountBFromLiquidity(
        sqrtPriceX64A,
        sqrtPriceCurrentX64,
        liquidity,
        roundUp,
      );
      return { amountA, amountB };
    } else {
      return {
        amountA: new BN(0),
        amountB: LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64A, sqrtPriceX64B, liquidity, roundUp),
      };
    }
  }

  static getAmountsFromLiquidityWithSlippage(
    sqrtPriceCurrentX64,
    sqrtPriceX64A,
    sqrtPriceX64B,
    liquidity,
    amountMax,
    roundUp,
    amountSlippage,
  ) {
    const { amountA, amountB } = LiquidityMath.getAmountsFromLiquidity(
      sqrtPriceCurrentX64,
      sqrtPriceX64A,
      sqrtPriceX64B,
      liquidity,
      roundUp,
    );
    const coefficient = amountMax ? 1 + amountSlippage : 1 - amountSlippage;

    const amount0Slippage = new BN(new Decimal(amountA.toString()).mul(coefficient).toFixed(0));
    const amount1Slippage = new BN(new Decimal(amountB.toString()).mul(coefficient).toFixed(0));
    return {
      amountSlippageA: amount0Slippage,
      amountSlippageB: amount1Slippage,
    };
  }

  static getAmountsOutFromLiquidity({
    poolInfo,
    tickLower,
    tickUpper,
    liquidity,
    slippage,
    add,
    epochInfo,
    amountAddFee,
  }) {
    const sqrtPriceX64 = SqrtPriceMath.priceToSqrtPriceX64(
      new Decimal(poolInfo.price),
      poolInfo.mintA.decimals,
      poolInfo.mintB.decimals,
    );
    const sqrtPriceX64A = SqrtPriceMath.getSqrtPriceX64FromTick(tickLower);
    const sqrtPriceX64B = SqrtPriceMath.getSqrtPriceX64FromTick(tickUpper);

    const coefficientRe = add ? 1 + slippage : 1 - slippage;

    const amounts = LiquidityMath.getAmountsFromLiquidity(sqrtPriceX64, sqrtPriceX64A, sqrtPriceX64B, liquidity, add);

    const [amountA, amountB] = [
      getTransferAmountFeeV2(amounts.amountA, _optionalChain$2([poolInfo, 'access', _ => _.mintA, 'access', _2 => _2.extensions, 'optionalAccess', _3 => _3.feeConfig]), epochInfo, amountAddFee),
      getTransferAmountFeeV2(amounts.amountB, _optionalChain$2([poolInfo, 'access', _4 => _4.mintB, 'access', _5 => _5.extensions, 'optionalAccess', _6 => _6.feeConfig]), epochInfo, amountAddFee),
    ];
    const [amountSlippageA, amountSlippageB] = [
      getTransferAmountFeeV2(
        new BN(new Decimal(amounts.amountA.toString()).mul(coefficientRe).toFixed(0)),
        _optionalChain$2([poolInfo, 'access', _7 => _7.mintA, 'access', _8 => _8.extensions, 'optionalAccess', _9 => _9.feeConfig]),
        epochInfo,
        amountAddFee,
      ),
      getTransferAmountFeeV2(
        new BN(new Decimal(amounts.amountB.toString()).mul(coefficientRe).toFixed(0)),
        _optionalChain$2([poolInfo, 'access', _10 => _10.mintB, 'access', _11 => _11.extensions, 'optionalAccess', _12 => _12.feeConfig]),
        epochInfo,
        amountAddFee,
      ),
    ];

    return {
      liquidity,
      amountA,
      amountB,
      amountSlippageA,
      amountSlippageB,
      expirationTime: minExpirationTime(amountA.expirationTime, amountB.expirationTime),
    };
  }
}

class MathUtil {

  static mulDivRoundingUp(a, b, denominator) {
    const numerator = a.mul(b);
    let result = numerator.div(denominator);
    if (!numerator.mod(denominator).eq(ZERO)) {
      result = result.add(ONE);
    }
    return result;
  }

  static mulDivFloor(a, b, denominator) {
    if (denominator.eq(ZERO)) {
      throw new Error("division by 0");
    }
    return a.mul(b).div(denominator);
  }

  static mulDivCeil(a, b, denominator) {
    if (denominator.eq(ZERO)) {
      throw new Error("division by 0");
    }
    const numerator = a.mul(b).add(denominator.sub(ONE));
    return numerator.div(denominator);
  }

  static x64ToDecimal(num, decimalPlaces) {
    return new Decimal(num.toString()).div(Decimal.pow(2, 64)).toDecimalPlaces(decimalPlaces);
  }

  static decimalToX64(num) {
    return new BN(num.mul(Decimal.pow(2, 64)).floor().toFixed());
  }

  static wrappingSubU128(n0, n1) {
    return n0.add(Q128).sub(n1).mod(Q128);
  }
}

// sqrt price math
function mulRightShift(val, mulBy) {
  return signedRightShift(val.mul(mulBy), 64, 256);
}

function signedLeftShift(n0, shiftBy, bitWidth) {
  const twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
  twosN0.imaskn(bitWidth + 1);
  return twosN0.fromTwos(bitWidth);
}

function signedRightShift(n0, shiftBy, bitWidth) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

class SqrtPriceMath {
  
  static sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA, decimalsB) {
    return MathUtil.x64ToDecimal(sqrtPriceX64)
      .pow(2)
      .mul(Decimal.pow(10, decimalsA - decimalsB));
  }

  static priceToSqrtPriceX64(price, decimalsA, decimalsB) {
    return MathUtil.decimalToX64(price.mul(Decimal.pow(10, decimalsB - decimalsA)).sqrt());
  }

  static getNextSqrtPriceX64FromInput(sqrtPriceX64, liquidity, amountIn, zeroForOne) {
    
    if (!sqrtPriceX64.gt(ZERO)) {
      throw new Error("sqrtPriceX64 must greater than 0");
    }
    if (!liquidity.gt(ZERO)) {
      throw new Error("liquidity must greater than 0");
    }

    return zeroForOne
      ? this.getNextSqrtPriceFromTokenAmountARoundingUp(sqrtPriceX64, liquidity, amountIn, true)
      : this.getNextSqrtPriceFromTokenAmountBRoundingDown(sqrtPriceX64, liquidity, amountIn, true);
  }

  static getNextSqrtPriceX64FromOutput(sqrtPriceX64, liquidity, amountOut, zeroForOne) {

    if (!sqrtPriceX64.gt(ZERO)) {
      throw new Error("sqrtPriceX64 must greater than 0");
    }
    if (!liquidity.gt(ZERO)) {
      throw new Error("liquidity must greater than 0");
    }

    return zeroForOne
      ? this.getNextSqrtPriceFromTokenAmountBRoundingDown(sqrtPriceX64, liquidity, amountOut, false)
      : this.getNextSqrtPriceFromTokenAmountARoundingUp(sqrtPriceX64, liquidity, amountOut, false);
  }

  static getNextSqrtPriceFromTokenAmountARoundingUp(
    sqrtPriceX64,
    liquidity,
    amount,
    add,
  ) {

    if (amount.eq(ZERO)) return sqrtPriceX64;
    const liquidityLeftShift = liquidity.shln(U64Resolution);

    if (add) {
      const numerator1 = liquidityLeftShift;
      const denominator = liquidityLeftShift.add(amount.mul(sqrtPriceX64));
      if (denominator.gte(numerator1)) {
        return MathUtil.mulDivCeil(numerator1, sqrtPriceX64, denominator);
      }
      return MathUtil.mulDivRoundingUp(numerator1, ONE, numerator1.div(sqrtPriceX64).add(amount));
    } else {
      const amountMulSqrtPrice = amount.mul(sqrtPriceX64);
      if (!liquidityLeftShift.gt(amountMulSqrtPrice)) {
        throw new Error("getNextSqrtPriceFromTokenAmountARoundingUp,liquidityLeftShift must gt amountMulSqrtPrice");
      }
      const denominator = liquidityLeftShift.sub(amountMulSqrtPrice);
      return MathUtil.mulDivCeil(liquidityLeftShift, sqrtPriceX64, denominator);
    }
  }

  static getNextSqrtPriceFromTokenAmountBRoundingDown(
    sqrtPriceX64,
    liquidity,
    amount,
    add,
  ) {
    const deltaY = amount.shln(U64Resolution);
    if (add) {
      return sqrtPriceX64.add(deltaY.div(liquidity));
    } else {
      const amountDivLiquidity = MathUtil.mulDivRoundingUp(deltaY, ONE, liquidity);
      if (!sqrtPriceX64.gt(amountDivLiquidity)) {
        throw new Error("getNextSqrtPriceFromTokenAmountBRoundingDown sqrtPriceX64 must gt amountDivLiquidity");
      }
      return sqrtPriceX64.sub(amountDivLiquidity);
    }
  }

  static getSqrtPriceX64FromTick(tick) {
    if (!Number.isInteger(tick)) {
      throw new Error("tick must be integer");
    }
    if (tick < MIN_TICK || tick > MAX_TICK) {
      throw new Error("tick must be in MIN_TICK and MAX_TICK");
    }
    const tickAbs = tick < 0 ? tick * -1 : tick;

    let ratio = (tickAbs & 0x1) != 0 ? new BN("18445821805675395072") : new BN("18446744073709551616");
    if ((tickAbs & 0x2) != 0) ratio = mulRightShift(ratio, new BN("18444899583751176192"));
    if ((tickAbs & 0x4) != 0) ratio = mulRightShift(ratio, new BN("18443055278223355904"));
    if ((tickAbs & 0x8) != 0) ratio = mulRightShift(ratio, new BN("18439367220385607680"));
    if ((tickAbs & 0x10) != 0) ratio = mulRightShift(ratio, new BN("18431993317065453568"));
    if ((tickAbs & 0x20) != 0) ratio = mulRightShift(ratio, new BN("18417254355718170624"));
    if ((tickAbs & 0x40) != 0) ratio = mulRightShift(ratio, new BN("18387811781193609216"));
    if ((tickAbs & 0x80) != 0) ratio = mulRightShift(ratio, new BN("18329067761203558400"));
    if ((tickAbs & 0x100) != 0) ratio = mulRightShift(ratio, new BN("18212142134806163456"));
    if ((tickAbs & 0x200) != 0) ratio = mulRightShift(ratio, new BN("17980523815641700352"));
    if ((tickAbs & 0x400) != 0) ratio = mulRightShift(ratio, new BN("17526086738831433728"));
    if ((tickAbs & 0x800) != 0) ratio = mulRightShift(ratio, new BN("16651378430235570176"));
    if ((tickAbs & 0x1000) != 0) ratio = mulRightShift(ratio, new BN("15030750278694412288"));
    if ((tickAbs & 0x2000) != 0) ratio = mulRightShift(ratio, new BN("12247334978884435968"));
    if ((tickAbs & 0x4000) != 0) ratio = mulRightShift(ratio, new BN("8131365268886854656"));
    if ((tickAbs & 0x8000) != 0) ratio = mulRightShift(ratio, new BN("3584323654725218816"));
    if ((tickAbs & 0x10000) != 0) ratio = mulRightShift(ratio, new BN("696457651848324352"));
    if ((tickAbs & 0x20000) != 0) ratio = mulRightShift(ratio, new BN("26294789957507116"));
    if ((tickAbs & 0x40000) != 0) ratio = mulRightShift(ratio, new BN("37481735321082"));

    if (tick > 0) ratio = MaxUint128.div(ratio);
    return ratio;
  }

  static getTickFromPrice(price, decimalsA, decimalsB) {
    return SqrtPriceMath.getTickFromSqrtPriceX64(SqrtPriceMath.priceToSqrtPriceX64(price, decimalsA, decimalsB));
  }

  static getTickFromSqrtPriceX64(sqrtPriceX64) {
    if (sqrtPriceX64.gt(MAX_SQRT_PRICE_X64) || sqrtPriceX64.lt(MIN_SQRT_PRICE_X64)) {
      throw new Error("Provided sqrtPrice is not within the supported sqrtPrice range.");
    }

    const msb = sqrtPriceX64.bitLength() - 1;
    const adjustedMsb = new BN(msb - 64);
    const log2pIntegerX32 = signedLeftShift(adjustedMsb, 32, 128);

    let bit = new BN("8000000000000000", "hex");
    let precision = 0;
    let log2pFractionX64 = new BN(0);

    let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);

    while (bit.gt(new BN(0)) && precision < BIT_PRECISION) {
      r = r.mul(r);
      const rMoreThanTwo = r.shrn(127);
      r = r.shrn(63 + rMoreThanTwo.toNumber());
      log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
      bit = bit.shrn(1);
      precision += 1;
    }

    const log2pFractionX32 = log2pFractionX64.shrn(32);

    const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
    const logbpX64 = log2pX32.mul(new BN(LOG_B_2_X32));

    const tickLow = signedRightShift(logbpX64.sub(new BN(LOG_B_P_ERR_MARGIN_LOWER_X64)), 64, 128).toNumber();
    const tickHigh = signedRightShift(logbpX64.add(new BN(LOG_B_P_ERR_MARGIN_UPPER_X64)), 64, 128).toNumber();

    if (tickLow == tickHigh) {
      return tickLow;
    } else {
      const derivedTickHighSqrtPriceX64 = SqrtPriceMath.getSqrtPriceX64FromTick(tickHigh);
      return derivedTickHighSqrtPriceX64.lte(sqrtPriceX64) ? tickHigh : tickLow;
    }
  }
}

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

const nextInitializedTickArray = (tickIndex, tickSpacing, zeroForOne, tickArrayBitmap, exBitmapInfo) => {
  const currentOffset = Math.floor(tickIndex / tickCount(tickSpacing));
  const result = zeroForOne
    ? searchLowBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset - 1, 1, tickSpacing)
    : searchHightBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset + 1, 1, tickSpacing);

  return result.length > 0 ? { isExist: true, nextStartIndex: result[0] } : { isExist: false, nextStartIndex: 0 };
};

class SwapMath {
  
  static swapCompute(
    programId,
    poolId,
    tickArrayCache,
    tickArrayBitmap,
    tickarrayBitmapExtension,
    zeroForOne,
    fee,
    liquidity,
    currentTick,
    tickSpacing,
    currentSqrtPriceX64,
    amountSpecified,
    lastSavedTickArrayStartIndex,
    sqrtPriceLimitX64,
    catchLiquidityInsufficient
  ) {
    if (amountSpecified.eq(ZERO)) {
      throw new Error("amountSpecified must not be 0");
    }
    if (!sqrtPriceLimitX64) {
      sqrtPriceLimitX64 = zeroForOne ? MIN_SQRT_PRICE_X64.add(ONE) : MAX_SQRT_PRICE_X64.sub(ONE);
    }

    if (zeroForOne) {
      if (sqrtPriceLimitX64.lt(MIN_SQRT_PRICE_X64)) {
        throw new Error("sqrtPriceX64 must greater than MIN_SQRT_PRICE_X64");
      }

      if (sqrtPriceLimitX64.gte(currentSqrtPriceX64)) {
        throw new Error("sqrtPriceX64 must smaller than current");
      }
    } else {
      if (sqrtPriceLimitX64.gt(MAX_SQRT_PRICE_X64)) {
        throw new Error("sqrtPriceX64 must smaller than MAX_SQRT_PRICE_X64");
      }

      if (sqrtPriceLimitX64.lte(currentSqrtPriceX64)) {
        throw new Error("sqrtPriceX64 must greater than current");
      }
    }
    const baseInput = amountSpecified.gt(ZERO);

    const state = {
      amountSpecifiedRemaining: amountSpecified,
      amountCalculated: ZERO,
      sqrtPriceX64: currentSqrtPriceX64,
      tick:
        currentTick > lastSavedTickArrayStartIndex
          ? Math.min(lastSavedTickArrayStartIndex + tickCount(tickSpacing) - 1, currentTick)
          : lastSavedTickArrayStartIndex,
      accounts: [],
      liquidity,
      feeAmount: new BN(0),
    };
    let tickAarrayStartIndex = lastSavedTickArrayStartIndex;
    let tickArrayCurrent = tickArrayCache[lastSavedTickArrayStartIndex];
    let loopCount = 0;
    let t = !zeroForOne && tickArrayCurrent.startTickIndex === state.tick;
    while (
      !state.amountSpecifiedRemaining.eq(ZERO) &&
      !state.sqrtPriceX64.eq(sqrtPriceLimitX64)
    ) {
      if (loopCount > 10) {
        throw Error('liquidity limit')
      }
      const step = {};
      step.sqrtPriceStartX64 = state.sqrtPriceX64;

      const tickState = nextInitTick(tickArrayCurrent, state.tick, tickSpacing, zeroForOne, t);

      let _nextInitTick = tickState ? tickState : null;
      let tickArrayAddress = null;

      if (!_optionalChain$1([_nextInitTick, 'optionalAccess', _ => _.liquidityGross, 'access', _2 => _2.gtn, 'call', _3 => _3(0)])) {
        const nextInitTickArrayIndex = nextInitializedTickArrayStartIndex(
          {
            tickCurrent: state.tick,
            tickSpacing,
            tickArrayBitmap,
            exBitmapInfo: tickarrayBitmapExtension,
          },
          tickAarrayStartIndex,
          zeroForOne,
        );
        if (!nextInitTickArrayIndex.isExist) {
          if (catchLiquidityInsufficient) {
            return {
              allTrade: false,
              amountSpecifiedRemaining: state.amountSpecifiedRemaining,
              amountCalculated: state.amountCalculated,
              feeAmount: state.feeAmount,
              sqrtPriceX64: state.sqrtPriceX64,
              liquidity: state.liquidity,
              tickCurrent: state.tick,
              accounts: state.accounts,
            };
          }
          throw Error("swapCompute LiquidityInsufficient");
        }
        tickAarrayStartIndex = nextInitTickArrayIndex.nextStartIndex;

        const expectedNextTickArrayAddress = getPdaTickArrayAddress(
          programId,
          poolId,
          tickAarrayStartIndex,
        );
        tickArrayAddress = expectedNextTickArrayAddress;
        tickArrayCurrent = tickArrayCache[tickAarrayStartIndex];

        try {
          _nextInitTick = firstInitializedTick(tickArrayCurrent, zeroForOne);
        } catch (e) {
          throw Error("not found next tick info");
        }
      }

      step.tickNext = _nextInitTick.tick;
      step.initialized = _nextInitTick.liquidityGross.gtn(0);
      if (lastSavedTickArrayStartIndex !== tickAarrayStartIndex && tickArrayAddress) {
        state.accounts.push(tickArrayAddress);
        lastSavedTickArrayStartIndex = tickAarrayStartIndex;
      }
      if (step.tickNext < MIN_TICK) {
        step.tickNext = MIN_TICK;
      } else if (step.tickNext > MAX_TICK) {
        step.tickNext = MAX_TICK;
      }

      step.sqrtPriceNextX64 = SqrtPriceMath.getSqrtPriceX64FromTick(step.tickNext);
      let targetPrice;
      if (
        (zeroForOne && step.sqrtPriceNextX64.lt(sqrtPriceLimitX64)) ||
        (!zeroForOne && step.sqrtPriceNextX64.gt(sqrtPriceLimitX64))
      ) {
        targetPrice = sqrtPriceLimitX64;
      } else {
        targetPrice = step.sqrtPriceNextX64;
      }
      [state.sqrtPriceX64, step.amountIn, step.amountOut, step.feeAmount] = SwapMath.swapStepCompute(
        state.sqrtPriceX64,
        targetPrice,
        state.liquidity,
        state.amountSpecifiedRemaining,
        fee,
      );

      state.feeAmount = state.feeAmount.add(step.feeAmount);

      if (baseInput) {
        state.amountSpecifiedRemaining = state.amountSpecifiedRemaining.sub(step.amountIn.add(step.feeAmount));
        state.amountCalculated = state.amountCalculated.sub(step.amountOut);
      } else {
        state.amountSpecifiedRemaining = state.amountSpecifiedRemaining.add(step.amountOut);
        state.amountCalculated = state.amountCalculated.add(step.amountIn.add(step.feeAmount));
      }
      if (state.sqrtPriceX64.eq(step.sqrtPriceNextX64)) {
        if (step.initialized) {
          let liquidityNet = _nextInitTick.liquidityNet;
          if (zeroForOne) liquidityNet = liquidityNet.mul(NEGATIVE_ONE);
          state.liquidity = LiquidityMath.addDelta(state.liquidity, liquidityNet);
        }

        t = step.tickNext != state.tick && !zeroForOne && tickArrayCurrent.startTickIndex === step.tickNext;
        state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext; //
      } else if (state.sqrtPriceX64 != step.sqrtPriceStartX64) {
        const _T = SqrtPriceMath.getTickFromSqrtPriceX64(state.sqrtPriceX64);
        t = _T != state.tick && !zeroForOne && tickArrayCurrent.startTickIndex === _T;
        state.tick = _T;
      }
      ++loopCount;
    }

    try {
      const { nextStartIndex: tickAarrayStartIndex, isExist } = nextInitializedTickArray(
        state.tick,
        tickSpacing,
        zeroForOne,
        tickArrayBitmap,
        tickarrayBitmapExtension,
      );
      if (isExist && lastSavedTickArrayStartIndex !== tickAarrayStartIndex) {
        state.accounts.push(getPdaTickArrayAddress(programId, poolId, tickAarrayStartIndex));
        lastSavedTickArrayStartIndex = tickAarrayStartIndex;
      }
    } catch (e) {
      console.log('ERROR!!!!', e);
      /* empty */
    }

    return {
      allTrade: true,
      amountSpecifiedRemaining: ZERO,
      amountCalculated: state.amountCalculated,
      feeAmount: state.feeAmount,
      sqrtPriceX64: state.sqrtPriceX64,
      liquidity: state.liquidity,
      tickCurrent: state.tick,
      accounts: state.accounts,
    };
  }

  static swapStepCompute(
    sqrtPriceX64Current,
    sqrtPriceX64Target,
    liquidity,
    amountRemaining,
    feeRate,
  ) {
    const swapStep = {
      sqrtPriceX64Next: new BN(0),
      amountIn: new BN(0),
      amountOut: new BN(0),
      feeAmount: new BN(0),
    };

    const zeroForOne = sqrtPriceX64Current.gte(sqrtPriceX64Target);
    const baseInput = amountRemaining.gte(ZERO);

    if (baseInput) {
      const amountRemainingSubtractFee = MathUtil.mulDivFloor(
        amountRemaining,
        FEE_RATE_DENOMINATOR.sub(new BN(feeRate.toString())),
        FEE_RATE_DENOMINATOR,
      );
      swapStep.amountIn = zeroForOne
        ? LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64Target, sqrtPriceX64Current, liquidity, true)
        : LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Current, sqrtPriceX64Target, liquidity, true);
      if (amountRemainingSubtractFee.gte(swapStep.amountIn)) {
        swapStep.sqrtPriceX64Next = sqrtPriceX64Target;
      } else {
        swapStep.sqrtPriceX64Next = SqrtPriceMath.getNextSqrtPriceX64FromInput(
          sqrtPriceX64Current,
          liquidity,
          amountRemainingSubtractFee,
          zeroForOne,
        );
      }
    } else {
      swapStep.amountOut = zeroForOne
        ? LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Target, sqrtPriceX64Current, liquidity, false)
        : LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64Current, sqrtPriceX64Target, liquidity, false);
      if (amountRemaining.mul(NEGATIVE_ONE).gte(swapStep.amountOut)) {
        swapStep.sqrtPriceX64Next = sqrtPriceX64Target;
      } else {
        swapStep.sqrtPriceX64Next = SqrtPriceMath.getNextSqrtPriceX64FromOutput(
          sqrtPriceX64Current,
          liquidity,
          amountRemaining.mul(NEGATIVE_ONE),
          zeroForOne,
        );
      }
    }

    const reachTargetPrice = sqrtPriceX64Target.eq(swapStep.sqrtPriceX64Next);

    if (zeroForOne) {
      if (!(reachTargetPrice && baseInput)) {
        swapStep.amountIn = LiquidityMath.getTokenAmountAFromLiquidity(
          swapStep.sqrtPriceX64Next,
          sqrtPriceX64Current,
          liquidity,
          true,
        );
      }

      if (!(reachTargetPrice && !baseInput)) {
        swapStep.amountOut = LiquidityMath.getTokenAmountBFromLiquidity(
          swapStep.sqrtPriceX64Next,
          sqrtPriceX64Current,
          liquidity,
          false,
        );
      }
    } else {
      swapStep.amountIn =
        reachTargetPrice && baseInput
          ? swapStep.amountIn
          : LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Current, swapStep.sqrtPriceX64Next, liquidity, true);
      swapStep.amountOut =
        reachTargetPrice && !baseInput
          ? swapStep.amountOut
          : LiquidityMath.getTokenAmountAFromLiquidity(
            sqrtPriceX64Current,
            swapStep.sqrtPriceX64Next,
            liquidity,
            false,
          );
    }

    if (!baseInput && swapStep.amountOut.gt(amountRemaining.mul(NEGATIVE_ONE))) {
      swapStep.amountOut = amountRemaining.mul(NEGATIVE_ONE);
    }
    if (baseInput && !swapStep.sqrtPriceX64Next.eq(sqrtPriceX64Target)) {
      swapStep.feeAmount = amountRemaining.sub(swapStep.amountIn);
    } else {
      swapStep.feeAmount = MathUtil.mulDivCeil(
        swapStep.amountIn,
        new BN(feeRate),
        FEE_RATE_DENOMINATOR.sub(new BN(feeRate)),
      );
    }
    return [swapStep.sqrtPriceX64Next, swapStep.amountIn, swapStep.amountOut, swapStep.feeAmount];
  }
}


const getPairs = (base, quote)=>{
  return request(`solana://${PROGRAM_ID}/getProgramAccounts`, {
    params: { filters: [
      { dataSize: CLMM_LAYOUT.span },
      { memcmp: { offset: 73, bytes: base }},
      { memcmp: { offset: 105, bytes: quote }},
    ]},
    api: CLMM_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/clmm/', base.toString(), quote.toString()].join('/')
  })
};

const firstInitializedTick = (tickArrayCurrent, zeroForOne) => {
  if (zeroForOne) {
    let i = TICK_ARRAY_SIZE - 1;
    while (i >= 0) {
      if (tickArrayCurrent.ticks[i].liquidityGross.gtn(0)) {
        return tickArrayCurrent.ticks[i];
      }
      i = i - 1;
    }
  } else {
    let i = 0;
    while (i < TICK_ARRAY_SIZE) {
      if (tickArrayCurrent.ticks[i].liquidityGross.gtn(0)) {
        return tickArrayCurrent.ticks[i];
      }
      i = i + 1;
    }
  }

  throw Error(`firstInitializedTick check error: ${tickArrayCurrent} - ${zeroForOne}`);
};

const nextInitTick = ( tickArrayCurrent, currentTickIndex, tickSpacing, zeroForOne, t) => {
  const currentTickArrayStartIndex = getArrayStartIndex(currentTickIndex, tickSpacing);
  if (currentTickArrayStartIndex != tickArrayCurrent.startTickIndex) {
    return null;
  }
  let offsetInArray = Math.floor((currentTickIndex - tickArrayCurrent.startTickIndex) / tickSpacing);

  if (zeroForOne) {
    while (offsetInArray >= 0) {
      if (tickArrayCurrent.ticks[offsetInArray].liquidityGross.gtn(0)) {
        return tickArrayCurrent.ticks[offsetInArray];
      }
      offsetInArray = offsetInArray - 1;
    }
  } else {
    if (!t) offsetInArray = offsetInArray + 1;
    while (offsetInArray < TICK_ARRAY_SIZE) {
      if (tickArrayCurrent.ticks[offsetInArray].liquidityGross.gtn(0)) {
        return tickArrayCurrent.ticks[offsetInArray];
      }
      offsetInArray = offsetInArray + 1;
    }
  }
  return null;
};

const maxTickInTickarrayBitmap = (tickSpacing) => {
  return tickSpacing * TICK_ARRAY_SIZE * TICK_ARRAY_BITMAP_SIZE
};

const tickCount = (tickSpacing) => {
  return TICK_ARRAY_SIZE * tickSpacing
};

const getArrayStartIndex = (tickIndex, tickSpacing) => {
  const ticksInArray = tickCount(tickSpacing);
  const start = Math.floor(tickIndex / ticksInArray);
  return start * ticksInArray
};

const tickRange = (tickSpacing) =>{
  let maxTickBoundary = maxTickInTickarrayBitmap(tickSpacing);
  let minTickBoundary = -maxTickBoundary;

  if (maxTickBoundary > MAX_TICK) {
    maxTickBoundary = getArrayStartIndex(MAX_TICK, tickSpacing) + tickCount(tickSpacing);
  }
  if (minTickBoundary < MIN_TICK) {
    minTickBoundary = getArrayStartIndex(MIN_TICK, tickSpacing);
  }
  return { maxTickBoundary, minTickBoundary }
};

const getInitializedTickArrayInRange = (tickArrayBitmap, exTickArrayBitmap, tickSpacing, tickArrayStartIndex, expectedCount) => {
  const tickArrayOffset = Math.floor(tickArrayStartIndex / (tickSpacing * TICK_ARRAY_SIZE));
  return [
    // find right of currenct offset
    ...searchLowBitFromStart(
      tickArrayBitmap,
      exTickArrayBitmap,
      tickArrayOffset - 1,
      expectedCount,
      tickSpacing,
    ),

    // find left of current offset
    ...searchHightBitFromStart(
      tickArrayBitmap,
      exTickArrayBitmap,
      tickArrayOffset,
      expectedCount,
      tickSpacing,
    ),
  ];
};

const getTickArrayBitIndex = (tickIndex, tickSpacing) => {
  const ticksInArray = tickCount(tickSpacing);

  let startIndex = tickIndex / ticksInArray;
  if (tickIndex < 0 && tickIndex % ticksInArray != 0) {
    startIndex = Math.ceil(startIndex) - 1;
  } else {
    startIndex = Math.floor(startIndex);
  }
  return startIndex
};

const getTickArrayStartIndexByTick = (tickIndex, tickSpacing) => {
  return getTickArrayBitIndex(tickIndex, tickSpacing) * tickCount(tickSpacing)
};

const isOverflowDefaultTickarrayBitmap = (tickSpacing, tickarrayStartIndexs)=> {
  const { maxTickBoundary, minTickBoundary } = tickRange(tickSpacing);

  for (const tickIndex of tickarrayStartIndexs) {
    const tickarrayStartIndex = getTickArrayStartIndexByTick(tickIndex, tickSpacing);

    if (tickarrayStartIndex >= maxTickBoundary || tickarrayStartIndex < minTickBoundary) {
      return true
    }
  }

  return false
};

const checkIsOutOfBoundary = (tick) => {
  return tick < MIN_TICK || tick > MAX_TICK
};

const checkIsValidStartIndex = (tickIndex, tickSpacing) => {
  if (checkIsOutOfBoundary(tickIndex)) {
    if (tickIndex > MAX_TICK) {
      return false;
    }
    const minStartIndex = getTickArrayStartIndexByTick(MIN_TICK, tickSpacing);
    return tickIndex == minStartIndex;
  }
  return tickIndex % tickCount(tickSpacing) == 0;
};

const extensionTickBoundary = (tickSpacing) => {
  const positiveTickBoundary = maxTickInTickarrayBitmap(tickSpacing);

  const negativeTickBoundary = -positiveTickBoundary;

  if (MAX_TICK <= positiveTickBoundary)
    throw Error(`extensionTickBoundary check error: ${MAX_TICK}, ${positiveTickBoundary}`);
  if (negativeTickBoundary <= MIN_TICK)
    throw Error(`extensionTickBoundary check error: ${negativeTickBoundary}, ${MIN_TICK}`);

  return { positiveTickBoundary, negativeTickBoundary };
};

const checkExtensionBoundary = (tickIndex, tickSpacing) => {
  const { positiveTickBoundary, negativeTickBoundary } = extensionTickBoundary(tickSpacing);

  if (tickIndex >= negativeTickBoundary && tickIndex < positiveTickBoundary) {
    throw Error("checkExtensionBoundary -> InvalidTickArrayBoundary");
  }
};

const getBitmapOffset = (tickIndex, tickSpacing) => {
  if (!checkIsValidStartIndex(tickIndex, tickSpacing)) {
    throw new Error("No enough initialized tickArray");
  }
  checkExtensionBoundary(tickIndex, tickSpacing);

  const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
  let offset = Math.floor(Math.abs(tickIndex) / ticksInOneBitmap) - 1;

  if (tickIndex < 0 && Math.abs(tickIndex) % ticksInOneBitmap === 0) offset--;
  return offset;
};

const getBitmap = (tickIndex, tickSpacing, tickArrayBitmapExtension) => {
  const offset = getBitmapOffset(tickIndex, tickSpacing);
  if (tickIndex < 0) {
    return { offset, tickarrayBitmap: tickArrayBitmapExtension.negativeTickArrayBitmap[offset] }
  } else {
    return { offset, tickarrayBitmap: tickArrayBitmapExtension.positiveTickArrayBitmap[offset] }
  }
};

const tickArrayOffsetInBitmap = (tickArrayStartIndex, tickSpacing) => {
  const m = Math.abs(tickArrayStartIndex) % maxTickInTickarrayBitmap(tickSpacing);
  let tickArrayOffsetInBitmap = Math.floor(m / tickCount(tickSpacing));
  if (tickArrayStartIndex < 0 && m != 0) {
    tickArrayOffsetInBitmap = TICK_ARRAY_BITMAP_SIZE - tickArrayOffsetInBitmap;
  }
  return tickArrayOffsetInBitmap;
};

const mergeTickArrayBitmap = (bns) => {
  let b = new BN(0);
  for (let i = 0; i < bns.length; i++) {
    b = b.add(bns[i].shln(64 * i));
  }
  return b;
};

const checkTickArrayIsInit = (tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension) => {
  const { tickarrayBitmap } = getBitmap(tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

  const _tickArrayOffsetInBitmap = tickArrayOffsetInBitmap(tickArrayStartIndex, tickSpacing);

  return {
    isInitialized: mergeTickArrayBitmap(tickarrayBitmap).testn(_tickArrayOffsetInBitmap),
    startIndex: tickArrayStartIndex,
  };
};

const checkTickArrayIsInitialized = (bitmap, tick, tickSpacing) => {
  const multiplier = tickSpacing * TICK_ARRAY_SIZE;
  const compressed = Math.floor(tick / multiplier) + 512;
  const bitPos = Math.abs(compressed);
  return {
    isInitialized: bitmap.testn(bitPos),
    startIndex: (bitPos - 512) * multiplier,
  };
};

const i32ToBytes = (num) => {
  const arr = new ArrayBuffer(4);
  const view = new DataView(arr);
  view.setInt32(0, num, false);
  return new Uint8Array(arr)
};

const getPdaTickArrayAddress = (programId, poolId, startIndex) => {
  const [publicKey, nonce] = PublicKey.findProgramAddressSync([TICK_ARRAY_SEED, poolId.toBuffer(), i32ToBytes(startIndex)], programId);
  return publicKey
};

const isZero = (bitNum, data) => {
  for (let i = 0; i < bitNum; i++) {
    if (data.testn(i)) return false;
  }
  return true;
};

const leadingZeros = (bitNum, data) => {
  let i = 0;
  for (let j = bitNum - 1; j >= 0; j--) {
    if (!data.testn(j)) {
      i++;
    } else {
      break;
    }
  }
  return i;
};

const trailingZeros = (bitNum, data) => {
  let i = 0;
  for (let j = 0; j < bitNum; j++) {
    if (!data.testn(j)) {
      i++;
    } else {
      break;
    }
  }
  return i;
};

const mostSignificantBit = (bitNum, data) => {
  if (isZero(bitNum, data)) return null;
  else return leadingZeros(bitNum, data);
};

const leastSignificantBit = (bitNum, data) => {
  if (isZero(bitNum, data)) return null;
  else return trailingZeros(bitNum, data);
};

const nextInitializedTickArrayBitmapStartIndex = (bitMap, lastTickArrayStartIndex, tickSpacing, zeroForOne) => {
  if (!checkIsValidStartIndex(lastTickArrayStartIndex, tickSpacing))
    throw Error("nextInitializedTickArrayStartIndex check error");

  const tickBoundary = maxTickInTickarrayBitmap(tickSpacing);
  const nextTickArrayStartIndex = zeroForOne
    ? lastTickArrayStartIndex - tickCount(tickSpacing)
    : lastTickArrayStartIndex + tickCount(tickSpacing);

  if (nextTickArrayStartIndex < -tickBoundary || nextTickArrayStartIndex >= tickBoundary) {
    return { isInit: false, tickIndex: lastTickArrayStartIndex };
  }

  const multiplier = tickSpacing * TICK_ARRAY_SIZE;
  let compressed = nextTickArrayStartIndex / multiplier + 512;

  if (nextTickArrayStartIndex < 0 && nextTickArrayStartIndex % multiplier != 0) {
    compressed--;
  }

  const bitPos = Math.abs(compressed);

  if (zeroForOne) {
    const offsetBitMap = bitMap.shln(1024 - bitPos - 1);
    const nextBit = mostSignificantBit(1024, offsetBitMap);
    if (nextBit !== null) {
      const nextArrayStartIndex = (bitPos - nextBit - 512) * multiplier;
      return { isInit: true, tickIndex: nextArrayStartIndex };
    } else {
      return { isInit: false, tickIndex: -tickBoundary };
    }
  } else {
    const offsetBitMap = bitMap.shrn(bitPos);
    const nextBit = leastSignificantBit(1024, offsetBitMap);
    if (nextBit !== null) {
      const nextArrayStartIndex = (bitPos + nextBit - 512) * multiplier;
      return { isInit: true, tickIndex: nextArrayStartIndex };
    } else {
      return { isInit: false, tickIndex: tickBoundary - tickCount(tickSpacing) };
    }
  }
};

const getBitmapTickBoundary =(tickarrayStartIndex, tickSpacing) => {
  const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
  let m = Math.floor(Math.abs(tickarrayStartIndex) / ticksInOneBitmap);
  if (tickarrayStartIndex < 0 && Math.abs(tickarrayStartIndex) % ticksInOneBitmap != 0) m += 1;

  const minValue = ticksInOneBitmap * m;

  return tickarrayStartIndex < 0
    ? { minValue: -minValue, maxValue: -minValue + ticksInOneBitmap }
    : { minValue, maxValue: minValue + ticksInOneBitmap };
};

const nextInitializedTickArrayInBitmap = (tickarrayBitmap, nextTickArrayStartIndex, tickSpacing, zeroForOne) => {
  const { minValue: bitmapMinTickBoundary, maxValue: bitmapMaxTickBoundary } = getBitmapTickBoundary(
    nextTickArrayStartIndex,
    tickSpacing,
  );

  const _tickArrayOffsetInBitmap = tickArrayOffsetInBitmap(nextTickArrayStartIndex, tickSpacing);
  if (zeroForOne) {
    // tick from upper to lower
    // find from highter bits to lower bits
    const offsetBitMap = mergeTickArrayBitmap(tickarrayBitmap).shln(
      TICK_ARRAY_BITMAP_SIZE - 1 - _tickArrayOffsetInBitmap,
    );

    const nextBit = isZero(512, offsetBitMap) ? null : leadingZeros(512, offsetBitMap);

    if (nextBit !== null) {
      const nextArrayStartIndex = nextTickArrayStartIndex - nextBit * tickCount(tickSpacing);
      return { isInit: true, tickIndex: nextArrayStartIndex };
    } else {
      // not found til to the end
      return { isInit: false, tickIndex: bitmapMinTickBoundary };
    }
  } else {
    // tick from lower to upper
    // find from lower bits to highter bits
    const offsetBitMap = mergeTickArrayBitmap(tickarrayBitmap).shrn(_tickArrayOffsetInBitmap);

    const nextBit = isZero(512, offsetBitMap) ? null : trailingZeros(512, offsetBitMap);

    if (nextBit !== null) {
      const nextArrayStartIndex = nextTickArrayStartIndex + nextBit * tickCount(tickSpacing);
      return { isInit: true, tickIndex: nextArrayStartIndex };
    } else {
      // not found til to the end
      return { isInit: false, tickIndex: bitmapMaxTickBoundary - tickCount(tickSpacing) };
    }
  }
};

const nextInitializedTickArrayFromOneBitmap = (lastTickArrayStartIndex, tickSpacing, zeroForOne, tickArrayBitmapExtension) => {
  const multiplier = tickCount(tickSpacing);
  const nextTickArrayStartIndex = zeroForOne
    ? lastTickArrayStartIndex - multiplier
    : lastTickArrayStartIndex + multiplier;
  const { tickarrayBitmap } = getBitmap(nextTickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

  return nextInitializedTickArrayInBitmap(tickarrayBitmap, nextTickArrayStartIndex, tickSpacing, zeroForOne);
};

const nextInitializedTickArrayStartIndex = (poolInfo, lastTickArrayStartIndex, zeroForOne) => {
  lastTickArrayStartIndex = getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing);

  while (true) {
    const { isInit: startIsInit, tickIndex: startIndex } = nextInitializedTickArrayBitmapStartIndex(
      mergeTickArrayBitmap(poolInfo.tickArrayBitmap),
      lastTickArrayStartIndex,
      poolInfo.tickSpacing,
      zeroForOne,
    );
    if (startIsInit) {
      return { isExist: true, nextStartIndex: startIndex };
    }
    lastTickArrayStartIndex = startIndex;

    const { isInit, tickIndex } = nextInitializedTickArrayFromOneBitmap(
      lastTickArrayStartIndex,
      poolInfo.tickSpacing,
      zeroForOne,
      poolInfo.exBitmapInfo,
    );
    if (isInit) return { isExist: true, nextStartIndex: tickIndex };

    lastTickArrayStartIndex = tickIndex;

    if (lastTickArrayStartIndex < MIN_TICK || lastTickArrayStartIndex > MAX_TICK)
      return { isExist: false, nextStartIndex: 0 };
  }
};

const getFirstInitializedTickArray = async(
  poolInfo,
  zeroForOne,
)=> {
  const { isInitialized, startIndex } = isOverflowDefaultTickarrayBitmap(poolInfo.tickSpacing, [
    poolInfo.tickCurrent,
  ])
    ? checkTickArrayIsInit(
        getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing),
        poolInfo.tickSpacing,
        poolInfo.exBitmapInfo,
      )
    : checkTickArrayIsInitialized(
        mergeTickArrayBitmap(poolInfo.tickArrayBitmap),
        poolInfo.tickCurrent,
        poolInfo.tickSpacing,
      );

  if (isInitialized) {
    const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, startIndex);
    return {
      isExist: true,
      startIndex,
      nextAccountMeta: address,
    };
  }
  const { isExist, nextStartIndex } = nextInitializedTickArrayStartIndex(
    poolInfo,
    getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing),
    zeroForOne,
  );
  if (isExist) {
    const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, nextStartIndex);
    return {
      isExist: true,
      startIndex: nextStartIndex,
      nextAccountMeta: address,
    };
  }
  return { isExist: false, nextAccountMeta: undefined, startIndex: undefined };
};

const getPdaExBitmapAddress = async(programId, poolId) => {
  const [publicKey, nonce] = await PublicKey.findProgramAddress([POOL_TICK_ARRAY_BITMAP_SEED, poolId.toBuffer()], programId);
  return publicKey.toString()
};

const searchLowBitFromStart = (tickArrayBitmap, exTickArrayBitmap, currentTickArrayBitStartIndex, expectedCount, tickSpacing) => {
  const tickArrayBitmaps = [
    ...[...exTickArrayBitmap.negativeTickArrayBitmap].reverse(),
    tickArrayBitmap.slice(0, 8),
    tickArrayBitmap.slice(8, 16),
    ...exTickArrayBitmap.positiveTickArrayBitmap,
  ].map((i) => mergeTickArrayBitmap(i));
  const result = [];
  while (currentTickArrayBitStartIndex >= -7680) {
    const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
    const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;

    if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);

    currentTickArrayBitStartIndex--;
    if (result.length === expectedCount) break;
  }

  const _tickCount = tickCount(tickSpacing);
  return result.map((i) => i * _tickCount);
};

const searchHightBitFromStart = (tickArrayBitmap, exTickArrayBitmap, currentTickArrayBitStartIndex, expectedCount, tickSpacing) => {
  const tickArrayBitmaps = [
    ...[...exTickArrayBitmap.negativeTickArrayBitmap].reverse(),
    tickArrayBitmap.slice(0, 8),
    tickArrayBitmap.slice(8, 16),
    ...exTickArrayBitmap.positiveTickArrayBitmap,
  ].map((i) => mergeTickArrayBitmap(i));
  const result = [];
  while (currentTickArrayBitStartIndex < 7680) {
    const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
    const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;

    if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);

    currentTickArrayBitStartIndex++;
    if (result.length === expectedCount) break;
  }

  const _tickCount = tickCount(tickSpacing);
  return result.map((i) => i * _tickCount);
};

const fetchPoolTickArrays = async(poolKeys) =>{
  
  // const tickArrays: { pubkey: PublicKey }[] = [];
  const tickArrays = [];

  for (const itemPoolInfo of poolKeys) {
    const currentTickArrayStartIndex = getTickArrayStartIndexByTick(
      itemPoolInfo.tickCurrent,
      itemPoolInfo.tickSpacing,
    );
    const startIndexArray = getInitializedTickArrayInRange(
      itemPoolInfo.tickArrayBitmap,
      itemPoolInfo.exBitmapInfo,
      itemPoolInfo.tickSpacing,
      currentTickArrayStartIndex,
      7,
    );
    for (const itemIndex of startIndexArray) {
      const tickArrayAddress = getPdaTickArrayAddress(
        itemPoolInfo.programId,
        itemPoolInfo.id,
        itemIndex,
      );
      tickArrays.push({ pubkey: tickArrayAddress });
    }
  }

  const tickArrayCache = {};
  
  await Promise.all(tickArrays.map(
    async(tickArray) => {
      const tickData = await request(`solana://${tickArray.pubkey.toString()}`, {
        api: TICK_ARRAY_LAYOUT,
        cache: 10, // 10s,
        cacheKey: ['raydium/clmm/ticks/', tickArray.pubkey.toString()].join('/')
      });
      if (tickArrayCache[tickData.poolId.toString()] === undefined) tickArrayCache[tickData.poolId.toString()] = {};

      tickArrayCache[tickData.poolId.toString()][tickData.startTickIndex] = {
        ...tickData,
        address: tickArray.pubkey,
      };
    }
  ));

  return tickArrayCache
};

const preInitializedTickArrayStartIndex = (poolInfo, zeroForOne) => {
  const currentOffset = Math.floor(poolInfo.tickCurrent / tickCount(poolInfo.tickSpacing));

  const result = !zeroForOne
    ? searchLowBitFromStart(
        poolInfo.tickArrayBitmap,
        poolInfo.exBitmapInfo,
        currentOffset - 1,
        1,
        poolInfo.tickSpacing,
      )
    : searchHightBitFromStart(
        poolInfo.tickArrayBitmap,
        poolInfo.exBitmapInfo,
        currentOffset + 1,
        1,
        poolInfo.tickSpacing,
      );

  return result.length > 0 ? { isExist: true, nextStartIndex: result[0] } : { isExist: false, nextStartIndex: 0 };
};

const getPairsWithPrice$1 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{

  let accounts = await getPairs(tokenIn, tokenOut);

  if(accounts.length == 0) {
    accounts = await getPairs(tokenOut, tokenIn);
  }

  accounts = accounts.filter((account)=>account.data.liquidity.gte(new BN('1000')));

  const exBitData = {};

  let addresses = await Promise.all(accounts.map(
    (account) => getPdaExBitmapAddress(new PublicKey(PROGRAM_ID), account.pubkey)
  ));

  await Promise.all(addresses.map(
    async(address) => {
      exBitData[address] = await request(`solana://${address}`, {
        api: TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
        cache: 10, // 10s,
        cacheKey: ['raydium/clmm/exbitdata/', address.toString()].join('/')
      });
    }
  ));

  const poolInfos = await Promise.all(accounts.map(async(account)=>{
    const ammConfig = await request(`solana://${account.data.ammConfig.toString()}`, {
      api: CLMM_CONFIG_LAYOUT,
      cache: 10, // 10s,
      cacheKey: ['raydium/clmm/configs/', account.data.ammConfig.toString()].join('/')
    });
    return {
      ...account.data,
      ammConfig: {...ammConfig, pubkey: account.data.ammConfig},
      id: account.pubkey,
      programId: new PublicKey(PROGRAM_ID),
      exBitmapInfo: exBitData[await getPdaExBitmapAddress(new PublicKey(PROGRAM_ID), account.pubkey)],
    }
  }));

  const tickArrayCache = await fetchPoolTickArrays(poolInfos);

  const pairs = await Promise.all(poolInfos.map(async(poolInfo)=>{

    let _return;

    let allNeededAccounts = [];

    if(amountIn || amountInMax) { // compute amountOut

      const zeroForOne = tokenIn.toString() === poolInfo.mintA.toString();
      
      const {
        isExist,
        startIndex: firstTickArrayStartIndex,
        nextAccountMeta,
      } = await getFirstInitializedTickArray(poolInfo, zeroForOne);
      if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

      const inputAmount = new BN((amountIn || amountInMax).toString());

      const {
        amountCalculated: outputAmount,
        accounts: remainingAccounts,
        sqrtPriceX64: executionPrice,
        feeAmount,
      } = SwapMath.swapCompute(
        poolInfo.programId,
        poolInfo.id,
        tickArrayCache[poolInfo.id],
        poolInfo.tickArrayBitmap,
        poolInfo.exBitmapInfo,
        zeroForOne,
        poolInfo.ammConfig.tradeFeeRate,
        poolInfo.liquidity,
        poolInfo.tickCurrent,
        poolInfo.tickSpacing,
        poolInfo.sqrtPriceX64,
        inputAmount,
        firstTickArrayStartIndex,
        undefined,
      );

      _return = {
        type: 'clmm',
        price: outputAmount.abs().toString(),
        data: { ...poolInfo },
      };

    } else { // compute amountIn

      const zeroForOne = tokenOut.toString() === poolInfo.mintB.toString();
      
      const {
        isExist,
        startIndex: firstTickArrayStartIndex,
        nextAccountMeta,
      } = await getFirstInitializedTickArray(poolInfo, zeroForOne);
      if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

      try {
        const preTick = preInitializedTickArrayStartIndex(poolInfo, zeroForOne);
        if (preTick.isExist) {
          const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, preTick.nextStartIndex);
          allNeededAccounts.push(new PublicKey(address));
        }
      } catch (e) {
        console.log('ERROR', e);
        /* empty */
      }

      allNeededAccounts.push(nextAccountMeta);
      
      const outputAmount = new BN((amountOut || amountOutMin).toString());

      const {
        amountCalculated: inputAmount,
        accounts: remainingAccounts,
      } = SwapMath.swapCompute(
        poolInfo.programId,
        poolInfo.id,
        tickArrayCache[poolInfo.id],
        poolInfo.tickArrayBitmap,
        poolInfo.exBitmapInfo,
        zeroForOne,
        poolInfo.ammConfig.tradeFeeRate,
        poolInfo.liquidity,
        poolInfo.tickCurrent,
        poolInfo.tickSpacing,
        poolInfo.sqrtPriceX64,
        outputAmount.mul(NEGATIVE_ONE),
        firstTickArrayStartIndex,
        undefined,
      );
      allNeededAccounts.push(...remainingAccounts);
      _return = {
        type: 'clmm',
        price: inputAmount.abs().toString(),
        data: { ...poolInfo, allNeededAccounts },
      };
    }

    if(!_return || _return.price === 0) { return }

    return _return
  
  }));

  return pairs.filter(Boolean)

};

const getParisWithPriceForAllTypes = ({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{
  return Promise.all([
    getPairsWithPrice$2({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }),
    getPairsWithPrice$1({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }),
  ]).then((pairsCPMM, pairsCLMNN)=>{
    return [
      (pairsCPMM || []).filter(Boolean).flat(),
      (pairsCLMNN || []).filter(Boolean).flat()
    ].flat()
  })
};

const getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{
  try {
    return await getParisWithPriceForAllTypes({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })
  } catch (e) {
    return []
  }
};

let getHighestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
};

let getLowestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
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

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const blockchain$1 = Blockchains.solana;

// Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
//
// We keep 11111111111111111111111111111111 internally
// to be able to differentiate between SOL<>Token and WSOL<>Token swaps
// as they are not the same!
//
let getExchangePath = ({ path }) => {
  if(!path) { return }
  let exchangePath = path.map((token, index) => {
    if (
      token === blockchain$1.currency.address && path[index+1] != blockchain$1.wrapped.address &&
      path[index-1] != blockchain$1.wrapped.address
    ) {
      return blockchain$1.wrapped.address
    } else {
      return token
    }
  });

  if(exchangePath[0] == blockchain$1.currency.address && exchangePath[1] == blockchain$1.wrapped.address) {
    exchangePath.splice(0, 1);
  } else if(exchangePath[exchangePath.length-1] == blockchain$1.currency.address && exchangePath[exchangePath.length-2] == blockchain$1.wrapped.address) {
    exchangePath.splice(exchangePath.length-1, 1);
  }

  return exchangePath
};

let pathExists = async ({ path, amountIn, amountInMax, amountOut, amountOutMin }) => {
  if(path.length == 1) { return false }
  path = getExchangePath({ path });
  if((await getPairsWithPrice({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin })).length > 0) {
    return true
  } else {
    return false
  }
};

let findPath = async ({ tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
  if(
    [tokenIn, tokenOut].includes(blockchain$1.currency.address) &&
    [tokenIn, tokenOut].includes(blockchain$1.wrapped.address)
  ) { return { path: undefined, exchangePath: undefined } }

  let path, stablesIn, stablesOut, stable;

  if (await pathExists({ path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
    // direct path
    path = [tokenIn, tokenOut];
  } else if (
    tokenIn != blockchain$1.wrapped.address &&
    tokenIn != blockchain$1.currency.address &&
    await pathExists({ path: [tokenIn, blockchain$1.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
    tokenOut != blockchain$1.wrapped.address &&
    tokenOut != blockchain$1.currency.address &&
    await pathExists({ path: [tokenOut, blockchain$1.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
  ) {
    // path via blockchain.wrapped.address
    path = [tokenIn, blockchain$1.wrapped.address, tokenOut];
  } else if (
    !blockchain$1.stables.usd.includes(tokenIn) &&
    (stablesIn = (await Promise.all(blockchain$1.stables.usd.map(async(stable)=>await pathExists({ path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
    !blockchain$1.stables.usd.includes(tokenOut) &&
    (stablesOut = (await Promise.all(blockchain$1.stables.usd.map(async(stable)=>await pathExists({ path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
    (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
  ) {
    // path via TOKEN_IN <> STABLE <> TOKEN_OUT
    path = [tokenIn, stable, tokenOut];
  }

  // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
  // because that actually reflects how things are routed in reality:
  if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$1.currency.address) {
    path.splice(1, 0, blockchain$1.wrapped.address);
  } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$1.currency.address) {
    path.splice(path.length-1, 0, blockchain$1.wrapped.address);
  }
  return { path, exchangePath: getExchangePath({ path }) }
};

let getAmountsOut = async ({ path, amountIn, amountInMax }) => {

  let amounts = [ethers.BigNumber.from(amountIn || amountInMax)];

  let bestPair = await getBestPair({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax });
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price));
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined });
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price));
  }

  if(amounts.length != path.length) { return }

  return amounts
};

let getAmountsIn = async({ path, amountOut, amountOutMin }) => {

  path = path.slice().reverse();
  let amounts = [ethers.BigNumber.from(amountOut || amountOutMin)];

  let bestPair = await getBestPair({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin });
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price));
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined });
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price));
  }
  
  if(amounts.length != path.length) { return }

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
  path = getExchangePath({ path });
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

const blockchain = Blockchains.solana;

const CP_PROGRAM_ID = new PublicKey('CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C');
const CL_PROGRAM_ID = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK');
const swapBaseOutputInstruction = [55, 217, 98, 86, 163, 74, 180, 173];

const anchorDataBuf = {
  swap: [43, 4, 237, 11, 26, 201, 30, 98], // [248, 198, 158, 145, 225, 117, 135, 200],
};

const createTokenAccountIfNotExisting = async ({ instructions, owner, token, account })=>{
  let outAccountExists;
  try{ outAccountExists = !!(await request({ blockchain: 'solana', address: account.toString() })); } catch (e2) {}
  if(!outAccountExists) {
    instructions.push(
      await Token.solana.createAssociatedTokenAccountInstruction({
        token,
        owner,
        payer: owner,
      })
    );
  }
};

const getPdaPoolAuthority = async(programId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    [Buffer.from("vault_and_lp_mint_auth_seed", "utf8")],
    programId
  );
  return publicKey
};

const getPdaObservationId = async(programId, poolId)=> {
  let [publicKey, nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from("observation", "utf8"),
      poolId.toBuffer()
    ],
    programId
  );
  return publicKey
};

const getCPMMInstruction = async({
  account,
  tokenIn,
  tokenOut,
  tokenAccountIn,
  tokenAccountOut,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountInMaxInput,
  amountOutInput,
  amountOutMinInput,
  pool
})=>{
  const inputMint = tokenIn == pool.mintA ? pool.data.mintA : pool.data.mintB;
  const outputMint = tokenIn == pool.mintA ? pool.data.mintB : pool.data.mintA;
  const inputVault = tokenIn == pool.mintA ? pool.data.vaultA : pool.data.vaultB;
  const outputVault = tokenIn == pool.mintA ? pool.data.vaultB : pool.data.vaultA;
  const poolId = new PublicKey(pool.publicKey);

  if(amountInInput || amountOutMinInput) ; else { // fixed amountOut, variable amountIn (amountInMax)

    const dataLayout = struct([u64$1("amountInMax"), u64$1("amountOut")]);

    const keys = [
      // payer
      { pubkey: new PublicKey(account), isSigner: true, isWritable: false },
      // authority
      { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
      // configId
      { pubkey: pool.data.configId, isSigner: false, isWritable: false },
      // poolId
      { pubkey: poolId, isSigner: false, isWritable: true },
      // userInputAccount
      { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
      // userOutputAccount
      { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
      // inputVault
      { pubkey: inputVault, isSigner: false, isWritable: true },
      // outputVault
      { pubkey: outputVault, isSigner: false, isWritable: true },
      // inputTokenProgram
      { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // outputTokenProgram
      { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // inputMint
      { pubkey: inputMint, isSigner: false, isWritable: false },
      // outputMint
      { pubkey: outputMint, isSigner: false, isWritable: false },
      // observationId
      { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
    ];

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({ 
      amountInMax: new BN((amountIn || amountInMax).toString()),
      amountOut: new BN((amountOut || amountOutMin).toString())
    }, data);

    return new TransactionInstruction({
      programId: CP_PROGRAM_ID,
      keys,
      data: Buffer.from([...swapBaseOutputInstruction, ...data]),
    })

  }
};

const getCLMMInstruction = async({
  account,
  tokenIn,
  tokenOut,
  tokenAccountIn,
  tokenAccountOut,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountInMaxInput,
  amountOutInput,
  amountOutMinInput,
  pool
})=>{
  const inputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintA : pool.data.mintB;
  const outputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintB : pool.data.mintA;
  const poolId = pool.data.id;
  const baseIn = inputMint.toString() === pool.data.mintA;
  const exTickArrayBitmapAddress = new PublicKey(await getPdaExBitmapAddress(new PublicKey(CL_PROGRAM_ID), poolId));

  if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

    const remainingAccounts = [
      ...pool.data.allNeededAccounts.map((pubkey) => ({ pubkey, isSigner: false, isWritable: true })),
    ];

    const keys = [
      // payer
      { pubkey: new PublicKey(account), isSigner: true, isWritable: true },
      // ammConfigId
      { pubkey: pool.data.ammConfig.pubkey, isSigner: false, isWritable: true },

      // poolId
      { pubkey: pool.data.id, isSigner: false, isWritable: true },
      // inputTokenAccount
      { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
      // outputTokenAccount
      { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
      // inputVault
      { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultA : pool.data.vaultB, isSigner: false, isWritable: true },
      // outputVault
      { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultB : pool.data.vaultA, isSigner: false, isWritable: true },

      // observationId
      { pubkey: pool.data.observationId, isSigner: false, isWritable: true },

      // TOKEN_PROGRAM_ID
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // TOKEN_2022_PROGRAM_ID
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      // MEMO_PROGRAM_ID
      { pubkey: MEMO_PROGRAM_ID, isSigner: false, isWritable: false },

      // inputMint
      { pubkey: inputMint, isSigner: false, isWritable: false },
      // outputMint
      { pubkey: outputMint, isSigner: false, isWritable: false },
      
      // exTickArrayBitmapAddress
      { pubkey: exTickArrayBitmapAddress, isSigner: false, isWritable: true },

      ...remainingAccounts,
    ];

    const dataLayout = struct([
      u64$1("amount"),
      u64$1("otherAmountThreshold"),
      u128("sqrtPriceLimitX64"),
      bool("isBaseInput"),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        amount: new BN(amountOut.toString()),
        otherAmountThreshold: new BN(amountIn.toString()),
        sqrtPriceLimitX64: new BN('0'),
        isBaseInput: baseIn,
      },
      data,
    );

    return new TransactionInstruction({
      programId: CL_PROGRAM_ID,
      keys,
      data: Buffer.from([...anchorDataBuf.swap, ...data]),
    })

  }
};

const getTransaction = async({
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
  account
})=>{
  let transaction = { blockchain: 'solana' };
  let instructions = [];

  const exchangePath = getExchangePath({ path });
  if(exchangePath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3 (2 pools)!' }
  const tokenIn = exchangePath[0];
  const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined;
  const tokenOut = exchangePath[exchangePath.length-1];
    
  let pairs;
  if(exchangePath.length == 2) {
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

  let startsWrapped = (path[0] === blockchain.currency.address && exchangePath[0] === blockchain.wrapped.address);
  let endsUnwrapped = (path[path.length-1] === blockchain.currency.address && exchangePath[exchangePath.length-1] === blockchain.wrapped.address);
  let wrappedAccount;
  const provider = await getProvider('solana');
  
  if(startsWrapped || endsUnwrapped) {
    const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span);
    const keypair = Keypair.generate();
    wrappedAccount = keypair.publicKey.toString();
    const lamports = startsWrapped ? new BN(amountIn.toString()).add(new BN(rent)) :  new BN(rent);
    let createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: new PublicKey(account),
      newAccountPubkey: new PublicKey(wrappedAccount),
      programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
      space: Token.solana.TOKEN_LAYOUT.span,
      lamports
    });
    createAccountInstruction.signers = [keypair];
    instructions.push(createAccountInstruction);
    instructions.push(
      Token.solana.initializeAccountInstruction({
        account: wrappedAccount,
        token: blockchain.wrapped.address,
        owner: account
      })
    );
  }

  const tokenAccountIn = startsWrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
  const tokenAccountOut = endsUnwrapped ? new PublicKey(wrappedAccount) : new PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
  if(!endsUnwrapped) {
    await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
  }
  const pool = pairs[0];

  if(pool.type === 'clmm') {
    instructions.push(
      await getCLMMInstruction({
        account,
        tokenIn,
        tokenOut,
        tokenAccountIn,
        tokenAccountOut,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        amountInInput,
        amountInMaxInput,
        amountOutInput,
        amountOutMinInput,
        pool,
      })
    );
  } else {
    instructions.push(
      await getCPMMInstruction({
        account,
        tokenIn,
        tokenOut,
        tokenAccountIn,
        tokenAccountOut,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        amountInInput,
        amountInMaxInput,
        amountOutInput,
        amountOutMinInput,
        pool,
      })
    );
  }
  
  if(startsWrapped || endsUnwrapped) {
    instructions.push(
      Token.solana.closeAccountInstruction({
        account: wrappedAccount,
        owner: account
      })
    );
  }

  await debug(instructions, provider);

  transaction.instructions = instructions;
  return transaction
};

const debug = async(instructions, provider)=>{
  console.log('instructions.length', instructions.length);
  let data;
  instructions.forEach((instruction)=>{
    console.log('INSTRUCTION.programId', instruction.programId.toString());
    console.log('INSTRUCTION.keys', instruction.keys);
    try {
      const LAYOUT = struct([
        u64$1("anchorDiscriminator"),
        u64$1("amount"),
        u64$1("otherAmountThreshold"),
        u128("sqrtPriceLimit"),
        bool("amountSpecifiedIsInput"),
        bool("aToB"),
      ]);
      data = LAYOUT.decode(instruction.data);
    } catch (e3) {}
  });
  if(data) {
    console.log('INSTRUCTION.data', data);
    console.log('amount', data.amount.toString());
    console.log('otherAmountThreshold', data.otherAmountThreshold.toString());
    console.log('sqrtPriceLimit', data.sqrtPriceLimit.toString());
  }
  let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') });
  instructions.forEach((instruction)=>simulation.add(instruction));
  let result;
  console.log('SIMULATE');
  try{ result = await provider.simulateTransaction(simulation); } catch(e) { console.log('error', e); }
  console.log('SIMULATION RESULT', result);
};

var Raydium = {
  findPath,
  pathExists,
  getAmounts,
  getTransaction,
  CPMM_LAYOUT,
  CLMM_LAYOUT,
};

const exchange = {
  
  name: 'raydium',
  label: 'Raydium',
  logo: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMjkgMzMiIHdpZHRoPSIyOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjI4LjMxNjgiIHgyPSItMS43MzMzNiIgeTE9IjguMTkxNjIiIHkyPSIyMC4yMDg2Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjMjAwZmIiLz48c3RvcCBvZmZzZXQ9Ii40ODk2NTgiIHN0b3AtY29sb3I9IiMzNzcyZmYiLz48c3RvcCBvZmZzZXQ9Ii40ODk3NTgiIHN0b3AtY29sb3I9IiMzNzczZmUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1YWM0YmUiLz48L2xpbmVhckdyYWRpZW50PjxnIGZpbGw9InVybCgjYSkiPjxwYXRoIGQ9Im0yNi44NjI1IDEyLjI4MXYxMS40MTA0bC0xMi42OTE2IDcuMzI2MS0xMi42OTg1OS03LjMyNjF2LTE0LjY1OTM3bDEyLjY5ODU5LTcuMzMzMjIgOS43NTQxIDUuNjM0NDEgMS40NzIzLS44NDk0MS0xMS4yMjY0LTYuNDgzODEtMTQuMTcwOSA4LjE4MjYydjE2LjM1ODE4bDE0LjE3MDkgOC4xODI2IDE0LjE3MS04LjE4MjZ2LTEzLjEwOTJ6Ii8+PHBhdGggZD0ibTEwLjYxNzYgMjMuNjk4NWgtMi4xMjM1M3YtNy4xMjA5aDcuMDc4NDNjLjY2OTctLjAwNzQgMS4zMDk1LS4yNzgyIDEuNzgxMS0uNzUzOC40NzE2LS40NzU1LjczNy0xLjExNzYuNzM4OC0xLjc4NzQuMDAzOC0uMzMxMS0uMDYwMS0uNjU5Ni0uMTg3OS0uOTY1MS0uMTI3OS0uMzA1Ni0uMzE2OC0uNTgxNy0uNTU1NC0uODExNS0uMjMwOC0uMjM3Mi0uNTA3MS0uNDI1My0uODEyNC0uNTUzLS4zMDUzLS4xMjc4LS42MzMzLS4xOTI1LS45NjQyLS4xOTAzaC03LjA3ODQzdi0yLjE2NTk1aDcuMDg1NDNjMS4yNDA1LjAwNzQzIDIuNDI4MS41MDM1MSAzLjMwNTMgMS4zODA2NS44NzcxLjg3NzIgMS4zNzMyIDIuMDY0OCAxLjM4MDYgMy4zMDUyLjAwNzYuOTQ5Ni0uMjgxOSAxLjg3NzctLjgyODEgMi42NTQ0LS41MDI3Ljc0MzItMS4yMTExIDEuMzIzNy0yLjAzODYgMS42NzA1LS44MTk0LjI1OTktMS42NzQ1LjM4ODktMi41MzQxLjM4MjNoLTQuMjQ3eiIvPjxwYXRoIGQ9Im0yMC4yMTU5IDIzLjUyMTVoLTIuNDc3NWwtMS45MTExLTMuMzMzOWMuNzU2MS0uMDQ2MyAxLjUwMTktLjE5ODggMi4yMTU1LS40NTN6Ii8+PHBhdGggZD0ibTI1LjM4MzEgOS45MDk3NSAxLjQ2NTIuODE0MDUgMS40NjUzLS44MTQwNXYtMS43MjAwNWwtMS40NjUzLS44NDk0MS0xLjQ2NTIuODQ5NDF6Ii8+PC9nPjwvc3ZnPg==',
  protocol: 'raydium',
  
  slippage: true,

  blockchains: ['solana'],

  solana: {
    
    router_cpmm: {
      address: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
      api: Raydium.CPMM_LAYOUT
    },

    router_clmm: {
      address: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
      api: Raydium.CLMM_LAYOUT
    },
  }
};

var raydium = (scope)=>{
  
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
};

const exchanges = [
  orca(),
  raydium(),
];
exchanges.forEach((exchange)=>{
  exchanges[exchange.name] = exchange;
});

exchanges.solana = [
  orca('solana'),
  raydium('solana'),
];
exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange; });

let route = ({
  blockchain,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
}) => {
  return Promise.all(
    exchanges[blockchain].map((exchange) => {
      return exchange.route({
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      })
    }),
  )
  .then((routes)=>{
    return routes.filter(Boolean).sort((a, b)=>{
      if ((amountIn || amountInMax) ? (BigInt(a.amountOut) < BigInt(b.amountOut)) : (BigInt(a.amountIn) > BigInt(b.amountIn))) {
        return 1;
      }
      if ((amountIn || amountInMax) ? (BigInt(a.amountOut) > BigInt(b.amountOut)) : (BigInt(a.amountIn) < BigInt(b.amountIn))) {
        return -1;
      }
      return 0;
    })
  })
};

exchanges.route = route;

export { exchanges as default };
