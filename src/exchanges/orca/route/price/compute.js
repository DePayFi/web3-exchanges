import { BN } from '@depay/solana-web3.js'
import { PriceMath, MIN_SQRT_PRICE, MAX_SQRT_PRICE } from './math'

const PROTOCOL_FEE_RATE_MUL_VALUE = new BN(10_000)
const FEE_RATE_MUL_VALUE = new BN(1_000_000)
const ZERO = new BN(0)
const ONE = new BN(1)
const TWO = new BN(2)
const U64_MAX = TWO.pow(new BN(64)).sub(ONE)

const fromX64_BN = (num)=>{
  return num.div(new BN(2).pow(new BN(64)))
}

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
    const limitBN = TWO.pow(new BN(limit)).sub(ONE);
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
}

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
}

const getNextSqrtPrices = (nextTick, sqrtPriceLimit, aToB) => {
  const nextTickPrice = PriceMath.tickIndexToSqrtPriceX64(nextTick)
  const nextSqrtPriceLimit = aToB ? BN.max(sqrtPriceLimit, nextTickPrice) : BN.min(sqrtPriceLimit, nextTickPrice)
  return { nextTickPrice, nextSqrtPriceLimit }
}

const toIncreasingPriceOrder = (sqrtPrice0, sqrtPrice1) => {
  if (sqrtPrice0.gt(sqrtPrice1)) {
    return [sqrtPrice1, sqrtPrice0];
  } else {
    return [sqrtPrice0, sqrtPrice1];
  }
}

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
}

const getAmountDeltaB = (
  currSqrtPrice,
  targetSqrtPrice,
  currLiquidity,
  roundUp
) => {
  let [sqrtPriceLower, sqrtPriceUpper] = toIncreasingPriceOrder(currSqrtPrice, targetSqrtPrice);
  let sqrtPriceDiff = sqrtPriceUpper.sub(sqrtPriceLower);
  return BitMath.checked_mul_shift_right_round_up_if(currLiquidity, sqrtPriceDiff, roundUp, 128);
}

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
}

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
}

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
}

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
}

const calculateNextLiquidity = (tickNetLiquidity, currLiquidity, aToB) => {
  return aToB ? currLiquidity.sub(tickNetLiquidity) : currLiquidity.add(tickNetLiquidity);
}

const calculateProtocolFee = (globalFee, protocolFeeRate) => {
  return globalFee.mul(new u64(protocolFeeRate).div(PROTOCOL_FEE_RATE_MUL_VALUE));
}

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
}

const calculateEstTokens = (
  amount,
  amountRemaining,
  amountCalculated,
  aToB,
  amountSpecifiedIsInput
) => {
  return aToB === amountSpecifiedIsInput
    ? {
        amountA: amount.sub(amountRemaining),
        amountB: amountCalculated,
      }
    : {
        amountA: amountCalculated,
        amountB: amount.sub(amountRemaining),
      };
}

const compute = ({
  tokenAmount,
  aToB,
  freshWhirlpoolData,
  tickSequence,
  sqrtPriceLimit,
  amountSpecifiedIsInput,
})=> {
  
  let amountRemaining = tokenAmount
  let amountCalculated = ZERO
  let currSqrtPrice = freshWhirlpoolData.sqrtPrice
  let currLiquidity = freshWhirlpoolData.liquidity
  let currTickIndex = freshWhirlpoolData.tickCurrentIndex
  let totalFeeAmount = ZERO
  const feeRate = freshWhirlpoolData.feeRate
  const protocolFeeRate = freshWhirlpoolData.protocolFeeRate
  let currProtocolFee = new u64(0)
  let currFeeGrowthGlobalInput = aToB ? freshWhirlpoolData.feeGrowthGlobalA : freshWhirlpoolData.feeGrowthGlobalB

  while (amountRemaining.gt(ZERO) && !sqrtPriceLimit.eq(currSqrtPrice)) {
    let { nextIndex: nextTickIndex } = tickSequence.findNextInitializedTickIndex(currTickIndex)

    let { nextTickPrice, nextSqrtPriceLimit: targetSqrtPrice } = getNextSqrtPrices(
      nextTickIndex,
      sqrtPriceLimit,
      aToB
    )

    const swapComputation = computeSwapStep(
      amountRemaining,
      feeRate,
      currLiquidity,
      currSqrtPrice,
      targetSqrtPrice,
      amountSpecifiedIsInput,
      aToB
    )

    totalFeeAmount = totalFeeAmount.add(swapComputation.feeAmount)

    if (amountSpecifiedIsInput) {
      amountRemaining = amountRemaining.sub(swapComputation.amountIn)
      amountRemaining = amountRemaining.sub(swapComputation.feeAmount)
      amountCalculated = amountCalculated.add(swapComputation.amountOut)
    } else {
      amountRemaining = amountRemaining.sub(swapComputation.amountOut)
      amountCalculated = amountCalculated.add(swapComputation.amountIn)
      amountCalculated = amountCalculated.add(swapComputation.feeAmount)
    }

    let { nextProtocolFee, nextFeeGrowthGlobalInput } = calculateFees(
      swapComputation.feeAmount,
      protocolFeeRate,
      currLiquidity,
      currProtocolFee,
      currFeeGrowthGlobalInput
    )
    currProtocolFee = nextProtocolFee
    currFeeGrowthGlobalInput = nextFeeGrowthGlobalInput

    if (swapComputation.nextPrice.eq(nextTickPrice)) {
      const nextTick = tickSequence.getTick(nextTickIndex)
      if (nextTick.initialized) {
        currLiquidity = calculateNextLiquidity(nextTick.liquidityNet, currLiquidity, aToB)
      }
      currTickIndex = aToB ? nextTickIndex - 1 : nextTickIndex
    } else {
      currTickIndex = PriceMath.sqrtPriceX64ToTickIndex(swapComputation.nextPrice)
    }

    currSqrtPrice = swapComputation.nextPrice;
  }

  return amountCalculated
}

export {
  compute
}
