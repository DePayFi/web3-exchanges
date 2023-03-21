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
    amountIn = amountInMax = amountOutMin = amountOut
  } else if (amountIn) {
    amountOut = amountInMax = amountOutMin = amountIn
  } else if(amountOutMin) {
    amountIn = amountInMax = amountOut = amountOutMin
  } else if(amountInMax) {
    amountOut = amountOutMin = amountIn = amountInMax
  }

  return { amountOut, amountIn, amountInMax, amountOutMin }
}

export {
  getAmounts,
  getAmountIn
}
