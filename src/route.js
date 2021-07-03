import { Token } from 'depay-blockchain-token'
import all from './all'

let getAmount = async ({ amount, blockchain, address }) => {
  return await Token.BigNumber({ amount, blockchain, address })
}

let preflight = ({ from, to, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, amountOutMax, amountInMin })=>{

  if(typeof amountOutMax !== 'undefined') {
    throw("You cannot not set amountOutMax! Only amountInMax or amountOutMin!")
  }

  if(typeof amountInMin !== 'undefined') {
    throw("You cannot not set amountInMin! Only amountInMax or amountOutMin!")
  }
  
  if(typeof amountOut !== 'undefined' && typeof amountIn !== 'undefined') {
    throw("You cannot set amountIn and amountOut at the same time, use amountInMax or amountOutMin to describe the non exact part of the swap!")
  }

  if(typeof amountInMax !== 'undefined' && typeof amountOutMin !== 'undefined') {
    throw("You cannot set amountInMax and amountOutMin at the same time, use amountIn or amountOut to describe the part of the swap that needs to be exact!")
  }

  if(typeof amountIn !== 'undefined' && typeof amountInMax !== 'undefined') {
    throw("Setting amountIn and amountInMax at the same time makes no sense. Decide if amountIn needs to be exact or not!")
  }
  
  if(typeof amountOut !== 'undefined' && typeof amountOutMin !== 'undefined') {
    throw("Setting amountOut and amountOutMin at the same time makes no sense. Decide if amountOut needs to be exact or not!")
  }

  if(typeof amountOutMin !== 'undefined' && typeof amountIn === 'undefined') {
    throw("You need to set amountIn alongside amountOutMin!")
  }

  if(typeof amountInMax !== 'undefined' && typeof amountOut === 'undefined') {
    throw("You need to set amountOut alongside amountInMax!")
  }
}

let fixRouteParams = async ({ blockchain, exchange, from, to, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin })=>{
  let params = { exchange, from, to, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }

  if(amountOut && typeof amountOut === 'number') {
    params.amountOut = await getAmount({ amount: amountOut, blockchain, address: tokenOut })
  }
  
  if(amountOutMin && typeof amountOutMin === 'number') {
    params.amountOutMin = await getAmount({ amount: amountOutMin, blockchain, address: tokenOut })
  }

  if(amountIn && typeof amountIn === 'number') {
    params.amountIn = await getAmount({ amount: amountIn, blockchain, address: tokenIn })
  }

  if(amountInMax && typeof amountInMax === 'number') {
    params.amountInMax = await getAmount({ amount: amountInMax, blockchain, address: tokenIn })
  }

  return params
}

let route = ({
  from,
  to,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
  amountOutMax,
  amountInMin
})=> {
  return new Promise((resolve, reject) => {
    Promise.all(all.map((exchange)=>{
      return exchange.route({ from, to, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, amountOutMax, amountInMin })
    })).then((routes)=>{
      resolve(routes.filter(Boolean))
    }).catch(reject)
  })
}

export { preflight, fixRouteParams, route }
