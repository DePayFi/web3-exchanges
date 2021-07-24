import { ERC20 } from 'depay-blockchain-token'
import { mock } from 'depay-web3mock'

function mockDecimals({ address, value }) {

  return mock({
    blockchain: 'ethereum',
    call: {
      to: address,
      api: ERC20,
      method: 'decimals',
      return: value
    }
  })
}

export { mockDecimals }
