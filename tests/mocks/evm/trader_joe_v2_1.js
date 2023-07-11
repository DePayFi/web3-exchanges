import { ethers } from 'ethers'
import { mock } from '@depay/web3-mock'

function mockPath({ blockchain, exchange, provider, amountIn, amountOut, path, amounts, steps, fees, pairs, versions }) {

  if(amountIn) {

    return mock({
      provider,
      blockchain,
      request: {
        to: exchange[blockchain].quoter.address,
        api: exchange[blockchain].quoter.api,
        method: 'findBestPathFromAmountIn',
        params: {
          route: path,
          amountIn
        },
        return: {
          amounts: [], // use virtualAmountsWithoutSlippage for real amounts (as web3 exchanges calculates slippage itself)
          binSteps: steps,
          fees,
          pairs,
          route: path,
          versions,
          virtualAmountsWithoutSlippage: amounts,
        }
      }
    })
  } else {
    return mock({
      provider,
      blockchain,
      request: {
        to: exchange[blockchain].quoter.address,
        api: exchange[blockchain].quoter.api,
        method: 'findBestPathFromAmountOut',
        params: {
          route: path,
          amountIn
        },
        return: {
          amounts: [], // use virtualAmountsWithoutSlippage for real amounts (as web3 exchanges calculates slippage itself)
          binSteps: steps,
          fees,
          pairs,
          route: path,
          versions,
          virtualAmountsWithoutSlippage: amounts,
        }
      }
    })
  }
}

export {
  mockPath,
}
