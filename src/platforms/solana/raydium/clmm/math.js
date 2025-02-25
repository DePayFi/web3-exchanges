/*#if _EVM

/*#elif _SOLANA

import { BN } from '@depay/solana-web3.js'

//#else */

import { BN } from '@depay/solana-web3.js'

//#endif

import { ONE, ZERO, Q64, MIN_TICK, MAX_TICK, MaxUint128, U64Resolution, MaxU64, Q128, MIN_SQRT_PRICE_X64, MAX_SQRT_PRICE_X64, BIT_PRECISION, LOG_B_2_X32, LOG_B_P_ERR_MARGIN_LOWER_X64, LOG_B_P_ERR_MARGIN_UPPER_X64 } from './constants'

export class LiquidityMath {
  
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
      getTransferAmountFeeV2(amounts.amountA, poolInfo.mintA.extensions?.feeConfig, epochInfo, amountAddFee),
      getTransferAmountFeeV2(amounts.amountB, poolInfo.mintB.extensions?.feeConfig, epochInfo, amountAddFee),
    ];
    const [amountSlippageA, amountSlippageB] = [
      getTransferAmountFeeV2(
        new BN(new Decimal(amounts.amountA.toString()).mul(coefficientRe).toFixed(0)),
        poolInfo.mintA.extensions?.feeConfig,
        epochInfo,
        amountAddFee,
      ),
      getTransferAmountFeeV2(
        new BN(new Decimal(amounts.amountB.toString()).mul(coefficientRe).toFixed(0)),
        poolInfo.mintB.extensions?.feeConfig,
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

export class MathUtil {

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

export class SqrtPriceMath {
  
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
