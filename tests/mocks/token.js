import { ERC20 } from '../apis'
import { mock } from 'depay-web3mock'

function mockDecimals({ address, value }) {

  return mock({
    blockchain: 'ethereum',
    call: {
      address: address,
      api: ERC20,
      method: 'decimals',
      return: value
    }
  })
}

export { mockDecimals }
