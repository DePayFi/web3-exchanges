import { Token } from '@depay/web3-tokens'
import { mock } from '@depay/web3-mock'

function getStandard(blockchain) {
  switch (blockchain) {
    case 'ethereum':
      return Token.ethereum.ERC20
    break;
    case 'bsc':
      return Token.bsc.BEP20
    break;
  }
}


function mockDecimals({ provider, blockchain, address, value }) {

  return mock({
    provider,
    blockchain,
    call: {
      to: address,
      api: getStandard(blockchain),
      method: 'decimals',
      return: value
    }
  })
}

export { mockDecimals }
