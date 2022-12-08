import { CONSTANTS } from '@depay/web3-constants'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { pathExists, findPath } from 'src/exchanges/wbnb/route/path'

describe('wbnb', () => {

  const exchange = find('bsc', 'wbnb')
  const blockchain = 'bsc'

  describe('pathExists', ()=>{

    it('returns false immediatelly if path length <= 1', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].NATIVE])).toEqual(false)
    })

    it('returns false immediatelly if path length >= 3', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED, '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'])).toEqual(false)
    })

    it('returns true if path is ETH<>WETH', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED])).toEqual(true)
    })

    it('returns true if path is WETH<>ETH', async()=>{
      expect(await pathExists([CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].NATIVE])).toEqual(true)
    })
  })

  describe('findPath', ()=>{

    it('returns { path, fixedPath } for ETH<>WETH', async()=>{
      expect(await findPath({ tokenIn: CONSTANTS[blockchain].NATIVE, tokenOut: CONSTANTS[blockchain].WRAPPED })).toEqual({
        path: [CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED],
        fixedPath: [CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED],
      })
    })

    it('returns { path, fixedPath } for WETH<>ETH', async()=>{
      expect(await findPath({ tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: CONSTANTS[blockchain].NATIVE })).toEqual({
        path: [CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].NATIVE],
        fixedPath: [CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].NATIVE],
      })
    })

    it('returns { path: undefined, fixedPath: undefined } for anything else', async()=>{
      expect(await findPath({ tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb' })).toEqual({
        path: undefined,
        fixedPath: undefined,
      })
    })
  })
})
