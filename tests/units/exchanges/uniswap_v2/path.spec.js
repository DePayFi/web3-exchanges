import { CONSTANTS } from 'depay-web3-constants'
import { findByName } from 'src'
import { mock, resetMocks } from 'depay-web3-mock'
import { pathExists } from 'src/exchanges/uniswap_v2/route/path'
import { provider } from 'depay-web3-client'
import { Token } from 'depay-web3-tokens'

describe('uniswap_v2', () => {
  
  let exchange = findByName('uniswap_v2')
  let blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))

  describe('find path', ()=>{

    it('does not consider path existing if pair does not have enough reserves for an WETH pair with WETH at index 1', async ()=> {
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: exchange.contracts.factory.address,
          api: exchange.contracts.factory.api,
          method: 'getPair',
          params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED],
          return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'getReserves',
          return: ['1115408461069632429', '10031', '1617377350']
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'token0',
          return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'token1',
          return: CONSTANTS[blockchain].WRAPPED
        }
      })
      let exists = await pathExists(['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED])
      expect(exists).toEqual(false)
    })

    it('does not consider path existing if pair does not have enough reserves for an WETH pair with WETH at index 0', async ()=> {
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: exchange.contracts.factory.address,
          api: exchange.contracts.factory.api,
          method: 'getPair',
          params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED],
          return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'getReserves',
          return: ['10031', '1115408461069632429', '1617377350']
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'token0',
          return: CONSTANTS[blockchain].WRAPPED
        }
      })
      mock({
        blockchain,
        provider: provider(blockchain),
        call: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.contracts.pair.api,
          method: 'token1',
          return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
        }
      })
      let exists = await pathExists(['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED])
      expect(exists).toEqual(false)
    })

    describe('USD token', ()=>{

      beforeEach(()=>{
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: CONSTANTS[blockchain].USD,
            api: Token.ethereum.DEFAULT,
            method: 'decimals',
            return: '6'
          }
        })
      })

      it('does not consider path existing if pair does not have enough reserves for an USD pair with USD at index 1', async ()=> {
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: exchange.contracts.factory.address,
            api: exchange.contracts.factory.api,
            method: 'getPair',
            params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD],
            return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'getReserves',
            return: ['1115408461069632429', '10031', '1617377350']
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'token0',
            return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'token1',
            return: CONSTANTS[blockchain].USD
          }
        })
        let exists = await pathExists(['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD])
        expect(exists).toEqual(false)
      })

      it('does not consider path existing if pair does not have enough reserves for an USD pair with USD at index 0', async ()=> {
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: exchange.contracts.factory.address,
            api: exchange.contracts.factory.api,
            method: 'getPair',
            params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD],
            return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'getReserves',
            return: ['10031', '1000000', '1617377350']
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'token0',
            return: CONSTANTS[blockchain].USD
          }
        })
        mock({
          blockchain,
          provider: provider(blockchain),
          call: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.contracts.pair.api,
            method: 'token1',
            return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
          }
        })
        let exists = await pathExists(['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD])
        expect(exists).toEqual(false)
      })
    })
  })
})
