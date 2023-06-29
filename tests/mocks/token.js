import { mock } from '@depay/web3-mock'
import { supported } from 'src/blockchains'
import { Token } from '@depay/web3-tokens'

function mockDecimals({ provider, blockchain, address, value }) {

  if(supported.evm.includes(blockchain)) {
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
  } else if(supported.solana.includes(blockchain)){
    return mock({
      blockchain,
      provider,
      request: {
        to: address,
        api: Token[blockchain].MINT_LAYOUT,
        return: {
          mintAuthorityOption: 1,
          mintAuthority: "2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9",
          supply: "5034999492452932",
          decimals: value,
          isInitialized: true,
          freezeAuthorityOption: 1,
          freezeAuthority: "3sNBr7kMccME5D55xNgsmYpZnzPgP2g12CixAajXypn6"
        }
      }
    })
  }
}

export { mockDecimals }
