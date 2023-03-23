let fixPath = (path) => path

let pathExists = async (blockchain, path) => {
  if(fixPath(path).length <= 1) { return false }
  if(fixPath(path).length >= 3) { return false }
  return (
    path.includes(blockchain.currency.address) &&
    path.includes(blockchain.wrapped.address)
  )
}

let findPath = async (blockchain, { tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(blockchain.currency.address) ||
    ![tokenIn, tokenOut].includes(blockchain.wrapped.address)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
}

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
  }

  if (path[0] === blockchain.currency.address && path[1] === blockchain.wrapped.address) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === blockchain.wrapped.address && path[1] === blockchain.currency.address) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

const WETH = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]

export default {
  findPath,
  pathExists,
  getAmounts,
  getTransaction,
  WETH,
}
