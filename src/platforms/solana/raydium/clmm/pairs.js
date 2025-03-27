/*#if _EVM

/*#elif _SVM

import { request } from '@depay/web3-client-svm'
import { Buffer, BN, PublicKey } from '@depay/solana-web3.js'

//#else */

import { request } from '@depay/web3-client'
import { Buffer, BN, PublicKey, bs58 } from '@depay/solana-web3.js'

//#endif

import Blockchains from '@depay/web3-blockchains'
import { CLMM_LAYOUT, CLMM_CONFIG_LAYOUT, TICK_ARRAY_LAYOUT, TICK_ARRAY_BITMAP_EXTENSION_LAYOUT } from '../layouts'
import { ethers } from 'ethers'
import { SqrtPriceMath, MathUtil, LiquidityMath } from './math'
import { ZERO, ONE, NEGATIVE_ONE, MIN_SQRT_PRICE_X64, MAX_SQRT_PRICE_X64, TICK_ARRAY_SIZE, TICK_ARRAY_BITMAP_SIZE, MIN_TICK, MAX_TICK, TICK_ARRAY_SEED, POOL_TICK_ARRAY_BITMAP_SEED, PROGRAM_ID, FEE_RATE_DENOMINATOR } from './constants'

const nextInitializedTickArray = (tickIndex, tickSpacing, zeroForOne, tickArrayBitmap, exBitmapInfo) => {
  const currentOffset = Math.floor(tickIndex / tickCount(tickSpacing));
  const result = zeroForOne
    ? searchLowBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset - 1, 1, tickSpacing)
    : searchHightBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset + 1, 1, tickSpacing);

  return result.length > 0 ? { isExist: true, nextStartIndex: result[0] } : { isExist: false, nextStartIndex: 0 };
}

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

      if (!_nextInitTick?.liquidityGross.gtn(0)) {
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
      console.log('ERROR!!!!', e)
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
      { memcmp: { offset: 389, bytes: bs58.encode(Buffer.from([0])) }}, // status 0 for active pool: https://github.com/raydium-io/raydium-clmm/blob/master/programs/amm/src/states/pool.rs#L109
    ]},
    api: CLMM_LAYOUT,
    cache: 86400, // 24h,
    cacheKey: ['raydium/clmm/', base.toString(), quote.toString()].join('/')
  })
}

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
}

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
}

const maxTickInTickarrayBitmap = (tickSpacing) => {
  return tickSpacing * TICK_ARRAY_SIZE * TICK_ARRAY_BITMAP_SIZE
}

const tickCount = (tickSpacing) => {
  return TICK_ARRAY_SIZE * tickSpacing
}

const getArrayStartIndex = (tickIndex, tickSpacing) => {
  const ticksInArray = tickCount(tickSpacing)
  const start = Math.floor(tickIndex / ticksInArray)
  return start * ticksInArray
}

const tickRange = (tickSpacing) =>{
  let maxTickBoundary = maxTickInTickarrayBitmap(tickSpacing)
  let minTickBoundary = -maxTickBoundary

  if (maxTickBoundary > MAX_TICK) {
    maxTickBoundary = getArrayStartIndex(MAX_TICK, tickSpacing) + tickCount(tickSpacing)
  }
  if (minTickBoundary < MIN_TICK) {
    minTickBoundary = getArrayStartIndex(MIN_TICK, tickSpacing)
  }
  return { maxTickBoundary, minTickBoundary }
}

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
}

const getTickArrayBitIndex = (tickIndex, tickSpacing) => {
  const ticksInArray = tickCount(tickSpacing)

  let startIndex = tickIndex / ticksInArray
  if (tickIndex < 0 && tickIndex % ticksInArray != 0) {
    startIndex = Math.ceil(startIndex) - 1
  } else {
    startIndex = Math.floor(startIndex)
  }
  return startIndex
}

const getTickArrayStartIndexByTick = (tickIndex, tickSpacing) => {
  return getTickArrayBitIndex(tickIndex, tickSpacing) * tickCount(tickSpacing)
}

const isOverflowDefaultTickarrayBitmap = (tickSpacing, tickarrayStartIndexs)=> {
  const { maxTickBoundary, minTickBoundary } = tickRange(tickSpacing)

  for (const tickIndex of tickarrayStartIndexs) {
    const tickarrayStartIndex = getTickArrayStartIndexByTick(tickIndex, tickSpacing)

    if (tickarrayStartIndex >= maxTickBoundary || tickarrayStartIndex < minTickBoundary) {
      return true
    }
  }

  return false
}

const checkIsOutOfBoundary = (tick) => {
  return tick < MIN_TICK || tick > MAX_TICK
}

const checkIsValidStartIndex = (tickIndex, tickSpacing) => {
  if (checkIsOutOfBoundary(tickIndex)) {
    if (tickIndex > MAX_TICK) {
      return false;
    }
    const minStartIndex = getTickArrayStartIndexByTick(MIN_TICK, tickSpacing);
    return tickIndex == minStartIndex;
  }
  return tickIndex % tickCount(tickSpacing) == 0;
}

const extensionTickBoundary = (tickSpacing) => {
  const positiveTickBoundary = maxTickInTickarrayBitmap(tickSpacing)

  const negativeTickBoundary = -positiveTickBoundary;

  if (MAX_TICK <= positiveTickBoundary)
    throw Error(`extensionTickBoundary check error: ${MAX_TICK}, ${positiveTickBoundary}`);
  if (negativeTickBoundary <= MIN_TICK)
    throw Error(`extensionTickBoundary check error: ${negativeTickBoundary}, ${MIN_TICK}`);

  return { positiveTickBoundary, negativeTickBoundary };
}

const checkExtensionBoundary = (tickIndex, tickSpacing) => {
  const { positiveTickBoundary, negativeTickBoundary } = extensionTickBoundary(tickSpacing);

  if (tickIndex >= negativeTickBoundary && tickIndex < positiveTickBoundary) {
    throw Error("checkExtensionBoundary -> InvalidTickArrayBoundary");
  }
}

const getBitmapOffset = (tickIndex, tickSpacing) => {
  if (!checkIsValidStartIndex(tickIndex, tickSpacing)) {
    throw new Error("No enough initialized tickArray");
  }
  checkExtensionBoundary(tickIndex, tickSpacing);

  const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
  let offset = Math.floor(Math.abs(tickIndex) / ticksInOneBitmap) - 1;

  if (tickIndex < 0 && Math.abs(tickIndex) % ticksInOneBitmap === 0) offset--;
  return offset;
}

const getBitmap = (tickIndex, tickSpacing, tickArrayBitmapExtension) => {
  const offset = getBitmapOffset(tickIndex, tickSpacing)
  if (tickIndex < 0) {
    return { offset, tickarrayBitmap: tickArrayBitmapExtension.negativeTickArrayBitmap[offset] }
  } else {
    return { offset, tickarrayBitmap: tickArrayBitmapExtension.positiveTickArrayBitmap[offset] }
  }
}

const tickArrayOffsetInBitmap = (tickArrayStartIndex, tickSpacing) => {
  const m = Math.abs(tickArrayStartIndex) % maxTickInTickarrayBitmap(tickSpacing);
  let tickArrayOffsetInBitmap = Math.floor(m / tickCount(tickSpacing));
  if (tickArrayStartIndex < 0 && m != 0) {
    tickArrayOffsetInBitmap = TICK_ARRAY_BITMAP_SIZE - tickArrayOffsetInBitmap;
  }
  return tickArrayOffsetInBitmap;
}

const mergeTickArrayBitmap = (bns) => {
  let b = new BN(0);
  for (let i = 0; i < bns.length; i++) {
    b = b.add(bns[i].shln(64 * i));
  }
  return b;
}

const checkTickArrayIsInit = (tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension) => {
  const { tickarrayBitmap } = getBitmap(tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

  const _tickArrayOffsetInBitmap = tickArrayOffsetInBitmap(tickArrayStartIndex, tickSpacing);

  return {
    isInitialized: mergeTickArrayBitmap(tickarrayBitmap).testn(_tickArrayOffsetInBitmap),
    startIndex: tickArrayStartIndex,
  };
}

const checkTickArrayIsInitialized = (bitmap, tick, tickSpacing) => {
  const multiplier = tickSpacing * TICK_ARRAY_SIZE;
  const compressed = Math.floor(tick / multiplier) + 512;
  const bitPos = Math.abs(compressed);
  return {
    isInitialized: bitmap.testn(bitPos),
    startIndex: (bitPos - 512) * multiplier,
  };
}

const i32ToBytes = (num) => {
  const arr = new ArrayBuffer(4)
  const view = new DataView(arr)
  view.setInt32(0, num, false)
  return new Uint8Array(arr)
}

const getPdaTickArrayAddress = (programId, poolId, startIndex) => {
  const [publicKey, nonce] = PublicKey.findProgramAddressSync([TICK_ARRAY_SEED, Buffer.from(poolId.toBuffer()), i32ToBytes(startIndex)], programId)
  return publicKey
}

const isZero = (bitNum, data) => {
  for (let i = 0; i < bitNum; i++) {
    if (data.testn(i)) return false;
  }
  return true;
}

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
}

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
}

const mostSignificantBit = (bitNum, data) => {
  if (isZero(bitNum, data)) return null;
  else return leadingZeros(bitNum, data);
}

const leastSignificantBit = (bitNum, data) => {
  if (isZero(bitNum, data)) return null;
  else return trailingZeros(bitNum, data);
}

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
}

const getBitmapTickBoundary =(tickarrayStartIndex, tickSpacing) => {
  const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
  let m = Math.floor(Math.abs(tickarrayStartIndex) / ticksInOneBitmap);
  if (tickarrayStartIndex < 0 && Math.abs(tickarrayStartIndex) % ticksInOneBitmap != 0) m += 1;

  const minValue = ticksInOneBitmap * m;

  return tickarrayStartIndex < 0
    ? { minValue: -minValue, maxValue: -minValue + ticksInOneBitmap }
    : { minValue, maxValue: minValue + ticksInOneBitmap };
}

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
}

const nextInitializedTickArrayFromOneBitmap = (lastTickArrayStartIndex, tickSpacing, zeroForOne, tickArrayBitmapExtension) => {
  const multiplier = tickCount(tickSpacing);
  const nextTickArrayStartIndex = zeroForOne
    ? lastTickArrayStartIndex - multiplier
    : lastTickArrayStartIndex + multiplier;
  const { tickarrayBitmap } = getBitmap(nextTickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

  return nextInitializedTickArrayInBitmap(tickarrayBitmap, nextTickArrayStartIndex, tickSpacing, zeroForOne);
}

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
}

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
}

const getPdaExBitmapAddress = async(programId, poolId) => {
  const [publicKey, nonce] = await PublicKey.findProgramAddress([POOL_TICK_ARRAY_BITMAP_SEED, Buffer.from(poolId.toBuffer())], programId)
  return publicKey.toString()
}

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
}

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
}

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
      })
      if (tickArrayCache[tickData.poolId.toString()] === undefined) tickArrayCache[tickData.poolId.toString()] = {};

      tickArrayCache[tickData.poolId.toString()][tickData.startTickIndex] = {
        ...tickData,
        address: tickArray.pubkey,
      };
    }
  ))

  return tickArrayCache
}

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
}

const getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{

  let accounts = await getPairs(tokenIn, tokenOut)

  if(accounts.length == 0) {
    accounts = await getPairs(tokenOut, tokenIn)
  }

  accounts = accounts.filter((account)=>account.data.liquidity.gte(new BN('1000')))

  const exBitData = {}

  let addresses = await Promise.all(accounts.map(
    (account) => getPdaExBitmapAddress(new PublicKey(PROGRAM_ID), account.pubkey)
  ))

  await Promise.all(addresses.map(
    async(address) => {
      exBitData[address] = await request(`solana://${address}`, {
        api: TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
        cache: 10, // 10s,
        cacheKey: ['raydium/clmm/exbitdata/', address.toString()].join('/')
      })
    }
  ))

  const poolInfos = await Promise.all(accounts.map(async(account)=>{
    const ammConfig = await request(`solana://${account.data.ammConfig.toString()}`, {
      api: CLMM_CONFIG_LAYOUT,
      cache: 10, // 10s,
      cacheKey: ['raydium/clmm/configs/', account.data.ammConfig.toString()].join('/')
    })
    return {
      ...account.data,
      ammConfig: {...ammConfig, pubkey: account.data.ammConfig},
      id: account.pubkey,
      programId: new PublicKey(PROGRAM_ID),
      exBitmapInfo: exBitData[await getPdaExBitmapAddress(new PublicKey(PROGRAM_ID), account.pubkey)],
    }
  }))

  const tickArrayCache = await fetchPoolTickArrays(poolInfos)

  const pairs = await Promise.all(poolInfos.map(async(poolInfo)=>{

    try {

      let price = 0

      let _return

      let allNeededAccounts = []

      if(amountIn || amountInMax) { // compute amountOut

        const zeroForOne = tokenIn.toString() === poolInfo.mintA.toString()
        
        const {
          isExist,
          startIndex: firstTickArrayStartIndex,
          nextAccountMeta,
        } = await getFirstInitializedTickArray(poolInfo, zeroForOne)
        if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

        const inputAmount = new BN((amountIn || amountInMax).toString())

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
        }

      } else { // compute amountIn

        const zeroForOne = tokenOut.toString() === poolInfo.mintB.toString()
        
        const {
          isExist,
          startIndex: firstTickArrayStartIndex,
          nextAccountMeta,
        } = await getFirstInitializedTickArray(poolInfo, zeroForOne)
        if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

        try {
          const preTick = preInitializedTickArrayStartIndex(poolInfo, zeroForOne);
          if (preTick.isExist) {
            const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, preTick.nextStartIndex)
            allNeededAccounts.push(new PublicKey(address))
          }
        } catch (e) {
          console.log('ERROR', e)
          /* empty */
        }

        allNeededAccounts.push(nextAccountMeta);
        
        const outputAmount = new BN((amountOut || amountOutMin).toString())

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
        }
      }

      if(!_return || _return.price === 0) { return }

      return _return
    
    } catch (e) { console.log(e) }
  
  }))

  return pairs.filter(Boolean)

}

export {
  getPairsWithPrice,
  getPdaExBitmapAddress,
  SwapMath,
}
