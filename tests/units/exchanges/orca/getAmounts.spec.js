import Blockchains from '@depay/web3-blockchains'
import { ethers } from 'ethers'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockPool } from 'tests/mocks/solana/orca'
import { getProvider, resetCache } from '@depay/web3-client'

describe('orca', () => {
  
  let provider
  const blockchain = 'solana'
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']

  beforeEach(async()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ provider, blockchain, accounts: { return: accounts } })
  })

  let exchange = find('solana', 'orca')
  let fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'

  it('provides amounts for amountIn, amountInMax, amountOut and amountOutMin', async ()=> {

    let tokenIn = Blockchains[blockchain].stables.usd[0] // USDC
    let decimalsIn = Blockchains[blockchain].tokens.find((token)=>token.address == tokenIn).decimals
    let tokenOut = Blockchains[blockchain].currency.address // SOL
    let decimalsOut = Blockchains[blockchain].currency.decimals
    let path = [tokenIn, tokenOut]
    let amount = 1
    let amountBN = ethers.utils.parseUnits(amount.toString(), decimalsOut)
    let pool = '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm'

    await mockPool({
      provider,
      tokenA: Blockchains[blockchain].wrapped.address,
      tokenVaultA: '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p',
      tokenB: tokenIn,
      tokenVaultB: 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe',
      aToB: false,
      pool,
      tickCurrentIndex: -36882,
      ticksArrays: [
        { startTickIndex: -37312 },
        {
          startTickIndex: -36608,
          ticks: {
            0: { liquidityNet: "-177180411886", liquidityGross: "177180411886", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            4: { liquidityNet: "-96783619017", liquidityGross: "96783619017", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            5: { liquidityNet: "-36396673741", liquidityGross: "36396673741", feeGrowthOutsideA: "58480415655371237", feeGrowthOutsideB: "1533435982771336"},
            6: { liquidityNet: "-157339032659", liquidityGross: "157339032659", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            7: { liquidityNet: "-108166213508", liquidityGross: "108166213508", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            8: { liquidityNet: "-16150425765", liquidityGross: "16150425765", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            9: { liquidityNet: "-1587029175618", liquidityGross: "1587029175618", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            10: { liquidityNet: "-18540419946", liquidityGross: "18540419946", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            11: { liquidityNet: "-27406912679", liquidityGross: "27406912679", feeGrowthOutsideA: "61964929623335443", feeGrowthOutsideB: "1629172962033704"},
            12: { liquidityNet: "-1600009414952", liquidityGross: "1600009414952", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            13: { liquidityNet: "-3239555619823", liquidityGross: "3239555619823", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            14: { liquidityNet: "-2240416922114", liquidityGross: "2240694385654", feeGrowthOutsideA: "467666437012080072", feeGrowthOutsideB: "14070012546962283"},
            15: { liquidityNet: "-2424187781456", liquidityGross: "2424187781456", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            16: { liquidityNet: "-4855551269463", liquidityGross: "4855551269463", feeGrowthOutsideA: "53436390900401334", feeGrowthOutsideB: "1407415794461017"},
            20: { liquidityNet: "-121940202771", liquidityGross: "121940202771", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            21: { liquidityNet: "-16061695979", liquidityGross: "16061695979", feeGrowthOutsideA: "33646996085661108", feeGrowthOutsideB: "884736975313913"},
            22: { liquidityNet: "-13669819261", liquidityGross: "13669819261", feeGrowthOutsideA: "41340570856514964", feeGrowthOutsideB: "1091573195102131"},
            24: { liquidityNet: "-50959742430", liquidityGross: "50959742430", feeGrowthOutsideA: "24678438173293574", feeGrowthOutsideB: "653470549503357"},
            25: { liquidityNet: "-1322116340802", liquidityGross: "1322116340802", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            28: { liquidityNet: "-447389846896", liquidityGross: "447389846896", feeGrowthOutsideA: "20768205794446318", feeGrowthOutsideB: "550793166905029"},
            29: { liquidityNet: "-49327632106", liquidityGross: "49327632106", feeGrowthOutsideA: "19814783718412737", feeGrowthOutsideB: "525709078053508"},
            31: { liquidityNet: "-4452907452", liquidityGross: "4452907452", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            32: { liquidityNet: "-4700166165", liquidityGross: "4700166165", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            33: { liquidityNet: "-7559090313", liquidityGross: "7559090313", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            34: { liquidityNet: "-17271873657", liquidityGross: "17271873657", feeGrowthOutsideA: "15407888100990501", feeGrowthOutsideB: "409723682592662"},
            35: { liquidityNet: "-2334501713017", liquidityGross: "2334501713017", feeGrowthOutsideA: "12177640330876680", feeGrowthOutsideB: "324182442591560"},
            36: { liquidityNet: "-3253746935", liquidityGross: "3253746935", feeGrowthOutsideA: "11170652137911872", feeGrowthOutsideB: "297540159218356"},
            37: { liquidityNet: "-548636737846", liquidityGross: "548636737846", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            38: { liquidityNet: "-28191558453", liquidityGross: "28191558453", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            39: { liquidityNet: "-582609621503", liquidityGross: "582609621503", feeGrowthOutsideA: "7968336436530899", feeGrowthOutsideB: "212680670443409"},
            42: { liquidityNet: "-52268684228", liquidityGross: "52268684228", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            43: { liquidityNet: "-22220156030", liquidityGross: "22220156030", feeGrowthOutsideA: "5145992933942877", feeGrowthOutsideB: "137705525486758"},
            44: { liquidityNet: "-74343682897", liquidityGross: "74343682897", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            46: { liquidityNet: "-290920805669", liquidityGross: "290920805669", feeGrowthOutsideA: "3435981453319982", feeGrowthOutsideB: "92134779533409"},
            47: { liquidityNet: "-74219114012", liquidityGross: "74219114012", feeGrowthOutsideA: "2917787751172147", feeGrowthOutsideB: "78304400097465"},
            48: { liquidityNet: "-4912003386", liquidityGross: "4912003386", feeGrowthOutsideA: "2653397334548723", feeGrowthOutsideB: "71241850724600"},
            49: { liquidityNet: "-974047853", liquidityGross: "974047853", feeGrowthOutsideA: "2345202005277387", feeGrowthOutsideB: "63002404722428"},
            51: { liquidityNet: "-8791284258", liquidityGross: "8791284258", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            52: { liquidityNet: "-107879683032", liquidityGross: "107879683032", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            53: { liquidityNet: "-61049674843", liquidityGross: "61049674843", feeGrowthOutsideA: "1376756562458258", feeGrowthOutsideB: "37065804047541"},
            55: { liquidityNet: "-6498625395", liquidityGross: "6498625395", feeGrowthOutsideA: "1018506706157926", feeGrowthOutsideB: "27446156364380"},
            56: { liquidityNet: "-66654703374", liquidityGross: "66654703374", feeGrowthOutsideA: "858196872291254", feeGrowthOutsideB: "23136413645695"},
            59: { liquidityNet: "-485288455672", liquidityGross: "485288455672", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            60: { liquidityNet: "-105957398", liquidityGross: "105957398", feeGrowthOutsideA: "224010556729133", feeGrowthOutsideB: "6049281500623"},
            61: { liquidityNet: "-9659139440211", liquidityGross: "9659139440211", feeGrowthOutsideA: "106260326817830", feeGrowthOutsideB: "2871088105495"},
            64: { liquidityNet: "-20428739514", liquidityGross: "20428739514", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            67: { liquidityNet: "-23451844602", liquidityGross: "23451844602", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            68: { liquidityNet: "-163272914238", liquidityGross: "163272914238", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            69: { liquidityNet: "-12011376840", liquidityGross: "12011376840", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            70: { liquidityNet: "-167352323482", liquidityGross: "167352323482", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            71: { liquidityNet: "-1282594546630", liquidityGross: "1282594546630", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            72: { liquidityNet: "-4680485030", liquidityGross: "4680485030", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            73: { liquidityNet: "-909736670477", liquidityGross: "909736670477", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            75: { liquidityNet: "-80645407816", liquidityGross: "80645407816", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            77: { liquidityNet: "-3850540820", liquidityGross: "3850540820", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            81: { liquidityNet: "-1259639695526", liquidityGross: "1259639695526", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            82: { liquidityNet: "-10943196294", liquidityGross: "10943196294", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            83: { liquidityNet: "-125873370600", liquidityGross: "125873370600", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            84: { liquidityNet: "-38732607822", liquidityGross: "38732607822", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            85: { liquidityNet: "-982433830", liquidityGross: "982433830", feeGrowthOutsideA: "0", feeGrowthOutsideB: "0"},
            86: { liquidityNet: "-414316974260", liquidityGross: "416275584948", feeGrowthOutsideA: "274830975894739950", feeGrowthOutsideB: "8821966592553760"},
          }
        },
        { startTickIndex: -35904 },
      ]
    })

    expect(
      (await exchange.getAmounts({ path, amountOut: amountBN })).amounts.map((amount)=>amount.toString())
    ).toEqual([ '25049159', '1000000000' ])

    expect(
      (await exchange.getAmounts({ path, amountOutMin: amountBN })).amounts.map((amount)=>amount.toString())
    ).toEqual([ '25049159', '1000000000' ])

    expect(
      (await exchange.getAmounts({ path, amountIn: amountBN })).amounts.map((amount)=>amount.toString())
    ).toEqual([ '1000000000', '39919706760' ])

    expect(
      (await exchange.getAmounts({ path, amountInMax: amountBN })).amounts.map((amount)=>amount.toString())
    ).toEqual([ '1000000000', '39919706760' ])
    
  })
})
