import { CONSTANTS } from 'depay-web3-constants'
import { WETH } from './apis'

export default {
  blockchain: 'ethereum',
  name: 'weth',
  alternativeNames: [],
  label: 'Wrapped Ether',
  logo: 'data:image/png;base64,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',
  contracts: {
    wrapper: {
      address: CONSTANTS.ethereum.WRAPPED,
      api: WETH
    },
  }
}