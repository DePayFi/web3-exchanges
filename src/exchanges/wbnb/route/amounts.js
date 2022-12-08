let getAmountIn = ({ path, amountOut, block }) => {
  return amountOut
}

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
    amountIn = amountInMax = amountOut
  } else if (amountIn) {
    amountOut = amountOutMin = amountIn
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
}

export {
  getAmounts,
  getAmountIn
}
