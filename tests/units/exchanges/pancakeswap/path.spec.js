import { CONSTANTS } from 'depay-web3-constants'
import { findByName } from 'src'
import { mock, resetMocks } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair } from 'tests/mocks/pancakeswap'
import { pathExists, findPath } from 'src/exchanges/pancakeswap/route/path'
import { provider } from 'depay-web3-client'
import { resetCache } from 'depay-web3-client'
import { Token } from 'depay-web3-tokens'

describe('pancakeswap', () => {
  
  let exchange = findByName('pancakeswap')
  let blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(resetCache)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))

  describe('path exists', ()=>{

    it('returns false immediatelly if path length == 1', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].NATIVE])).toEqual(false)
    })
  })

  describe('find path', ()=>{

    it('does not route through USD->USD->WRAPPED->TOKENB', async()=>{
      let tokenIn = CONSTANTS[blockchain].USD
      let tokenOut = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82' // CAKE
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      let USDtoUSDMock = mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })
      let path = await findPath({ tokenIn, tokenOut })
      expect(USDtoUSDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through TOKENA->WRAPPED->USD->USD', async()=>{
      let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82' // CAKE
      let tokenOut = CONSTANTS[blockchain].USD
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: '0x0ed7e52944161450477ee417de9cd3a859b14fd0' })
      let USDtoUSDMock = mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })
      let path = await findPath({ tokenIn, tokenOut })
      expect(USDtoUSDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through TOKENA->USD->WRAPPED->WRAPPED', async()=>{
      let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82' // CAKE
      let tokenOut = CONSTANTS[blockchain].WRAPPED
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: '0x804678fa97d91b974ec2af3c843270886528a9e6' })
      mockDecimals({ provider: provider(blockchain), blockchain, address: CONSTANTS[blockchain].USD, value: 18 })
      let WRAPPEDtoWRAPPEDMock = mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      let path = await findPath({ tokenIn, tokenOut })
      expect(WRAPPEDtoWRAPPEDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through WRAPPED->WRAPPED->USD->TOKENB', async()=>{
      let tokenIn = CONSTANTS[blockchain].WRAPPED
      let tokenOut = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82' // CAKE
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16' })
      mockDecimals({ provider: provider(blockchain), blockchain, address: CONSTANTS[blockchain].USD, value: 18 })
      let WRAPPEDtoWRAPPEDMock = mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      let path = await findPath({ tokenIn, tokenOut })
      expect(WRAPPEDtoWRAPPEDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not consider path existing if pair does not have enough reserves for an WBNB pair with WBNB at index 1', async ()=> {
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
