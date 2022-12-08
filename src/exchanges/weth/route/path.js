import { CONSTANTS } from '@depay/web3-constants'

let fixPath = (path) => path

let pathExists = async (path) => {
  if(fixPath(path).length <= 1) { return false }
  if(fixPath(path).length >= 3) { return false }
  return (
    path.includes(CONSTANTS.ethereum.NATIVE) &&
    path.includes(CONSTANTS.ethereum.WRAPPED)
  )
}

let findPath = async ({ tokenIn, tokenOut }) => {
  if(
    ![tokenIn, tokenOut].includes(CONSTANTS.ethereum.NATIVE) ||
    ![tokenIn, tokenOut].includes(CONSTANTS.ethereum.WRAPPED)
  ) { return { path: undefined, fixedPath: undefined } }

  let path = [tokenIn, tokenOut];

  return { path, fixedPath: path }
}

export {
  fixPath,
  pathExists,
  findPath
}
