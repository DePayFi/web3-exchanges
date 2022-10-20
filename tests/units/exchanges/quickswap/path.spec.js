import { CONSTANTS } from '@depay/web3-constants'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair } from 'tests/mocks/quickswap'
import { pathExists, findPath } from 'src/exchanges/quickswap/route/path'
import { getProvider, resetCache } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

describe('quickswap', () => {
  
  const exchange = find('polygon', 'quickswap')
  const blockchain = 'polygon'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

  describe('path exists', ()=>{

    it('returns false immediatelly if path length == 1', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].NATIVE])).toEqual(false)
    })
  })

  describe('find path', ()=>{

    it('does not route through USD->USD->WRAPPED->TOKENB', async()=>{
      let tokenIn = CONSTANTS[blockchain].USD
      let tokenOut = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' // UNI
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      mockDecimals({ provider, blockchain, address: CONSTANTS[blockchain].USD, value: CONSTANTS[blockchain].USD_DECIMALS })
      let USDtoUSDMock = mockPair({ provider, tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })
      let { path } = await findPath({ tokenIn, tokenOut })
      expect(USDtoUSDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through TOKENA->WRAPPED->USD->USD', async()=>{
      let tokenIn = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' // UNI
      let tokenOut = CONSTANTS[blockchain].USD
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: '0x0ed7e52944161450477ee417de9cd3a859b14fd0' })
      let USDtoUSDMock = mockPair({ provider, tokenIn: CONSTANTS[blockchain].USD, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })
      let { path } = await findPath({ tokenIn, tokenOut })
      expect(USDtoUSDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through TOKENA->USD->WRAPPED->WRAPPED', async()=>{
      let tokenIn = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' // UNI
      let tokenOut = CONSTANTS[blockchain].WRAPPED
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: '0x804678fa97d91b974ec2af3c843270886528a9e6' })
      mockDecimals({ provider, blockchain, address: CONSTANTS[blockchain].USD, value: 18 })
      let WRAPPEDtoWRAPPEDMock = mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      let { path } = await findPath({ tokenIn, tokenOut })
      expect(WRAPPEDtoWRAPPEDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not route through WRAPPED->WRAPPED->USD->TOKENB', async()=>{
      let tokenIn = CONSTANTS[blockchain].WRAPPED
      let tokenOut = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' // UNI
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16' })
      mockDecimals({ provider, blockchain, address: CONSTANTS[blockchain].USD, value: 18 })
      let WRAPPEDtoWRAPPEDMock = mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      let { path } = await findPath({ tokenIn, tokenOut })
      expect(WRAPPEDtoWRAPPEDMock.calls.count()).toEqual(0)
      expect(path).toEqual(undefined)
    })

    it('does not consider path existing if pair does not have enough reserves for an WETH pair with WETH at index 1', async ()=> {
      mock({
        blockchain,
        provider,
        request: {
          to: exchange.factory.address,
          api: exchange.factory.api,
          method: 'getPair',
          params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED],
          return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
          method: 'getReserves',
          return: ['1115408461069632429', '10031', '1617377350']
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
          method: 'token0',
          return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
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
        provider,
        request: {
          to: exchange.factory.address,
          api: exchange.factory.api,
          method: 'getPair',
          params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].WRAPPED],
          return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
          method: 'getReserves',
          return: ['10031', '1115408461069632429', '1617377350']
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
          method: 'token0',
          return: CONSTANTS[blockchain].WRAPPED
        }
      })
      mock({
        blockchain,
        provider,
        request: {
          to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
          api: exchange.pair.api,
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
          provider,
          request: {
            to: CONSTANTS[blockchain].USD,
            api: Token[blockchain].DEFAULT,
            method: 'decimals',
            return: '6'
          }
        })
      })

      it('does not consider path existing if pair does not have enough reserves for an USD pair with USD at index 1', async ()=> {
        mock({
          blockchain,
          provider,
          request: {
            to: exchange.factory.address,
            api: exchange.factory.api,
            method: 'getPair',
            params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD],
            return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
            method: 'getReserves',
            return: ['1115408461069632429', '10031', '1617377350']
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
            method: 'token0',
            return: '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
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
          provider,
          request: {
            to: exchange.factory.address,
            api: exchange.factory.api,
            method: 'getPair',
            params: ['0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a', CONSTANTS[blockchain].USD],
            return: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675'
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
            method: 'getReserves',
            return: ['10031', '1000000', '1617377350']
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
            method: 'token0',
            return: CONSTANTS[blockchain].USD
          }
        })
        mock({
          blockchain,
          provider,
          request: {
            to: '0x386F5d5B48f791EcBc2fDAE94fE5ED3C27Fe6675',
            api: exchange.pair.api,
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
