/*#if _EVM

/*#elif _SVM

import { BN } from '@depay/solana-web3.js'

//#else */

import { BN } from '@depay/solana-web3.js'

//#endif

import Decimal from "decimal.js"
import { PublicKey } from "@depay/solana-web3.js"

export function BNDivCeil(bn1, bn2) {
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

  if (remainder.gt(ZERO)) {
    quotient = quotient.add(new BN(1));

    rhs = dividend.div(quotient);
    remainder = checkedRem(dividend, quotient);
    if (remainder.gt(ZERO)) {
      rhs = rhs.add(new BN(1));
    }
  }
  return [quotient, rhs];
}

const ZERO = new BN(0);

export class ConstantProductCurve {
  
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

      if (tokenRemainder0.gt(ZERO) && tokenAmount0.gt(ZERO)) {
        tokenAmount0 = tokenAmount0.add(new BN(1));
      }

      const token1Remainder = checkedRem(lpTokenAmount.mul(swapTokenAmount1), lpTokenSupply);

      if (token1Remainder.gt(ZERO) && tokenAmount1.gt(ZERO)) {
        tokenAmount1 = tokenAmount1.add(new BN(1));
      }

      return { tokenAmount0, tokenAmount1 };
    }
    throw Error("roundDirection value error");
  }
}

export const FEE_RATE_DENOMINATOR_VALUE = new BN(1000000);

export function ceilDiv(tokenAmount, feeNumerator, feeDenominator) {
  return tokenAmount.mul(feeNumerator).add(feeDenominator).sub(new BN(1)).div(feeDenominator);
}

export function floorDiv(tokenAmount, feeNumerator, feeDenominator) {
  return tokenAmount.mul(feeNumerator).div(feeDenominator);
}

export class CpmmFee {
  
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

export class CurveCalculator {

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
    const currentPrice = new Decimal(reserveOutAmount.toString())
      .div(10 ** reserveOutDecimals)
      .div(new Decimal(reserveInAmount.toString()).div(10 ** reserveInDecimals));
    const amountRealOut = outputAmount.gte(reserveOutAmount) ? reserveOutAmount.sub(new BN(1)) : outputAmount;

    const denominator = reserveOutAmount.sub(amountRealOut);
    const amountInWithoutFee = BNDivCeil(reserveInAmount.mul(amountRealOut), denominator);
    const amountIn = BNDivCeil(amountInWithoutFee.mul(new BN(1000000)), new BN(1000000).sub(tradeFeeRate));
    const fee = amountIn.sub(amountInWithoutFee);
    const executionPrice = new Decimal(amountRealOut.toString())
      .div(10 ** reserveOutDecimals)
      .div(new Decimal(amountIn.toString()).div(10 ** reserveInDecimals));
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



