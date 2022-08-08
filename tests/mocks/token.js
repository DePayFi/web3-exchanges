import { Token } from '@depay/web3-tokens'
import { mock } from '@depay/web3-mock'

function mockDecimals({ provider, blockchain, address, value }) {

  return mock({
    provider,
    blockchain,
    request: {
      to: address,
      api: Token[blockchain].DEFAULT,
      method: 'decimals',
      return: value
    }
  })
}

export { mockDecimals }
