import Blockchains from '@depay/web3-blockchains'
import exchange from 'src/exchanges/orca'
import { ACCOUNT_LAYOUT, Buffer, PublicKey, BN } from '@depay/solana-web3.js'
import { getTickArrayAddresses } from 'src/exchanges/orca/route/price/ticks'
import { mock } from '@depay/web3-mock'
import { request } from '@depay/web3-client'
import { TICK_ARRAY_LAYOUT } from 'src/exchanges/orca/apis'
import { Token } from '@depay/web3-tokens'

let blockchain = 'solana'

function mockRent({ provider, rent }) {
  mock({
    blockchain,
    provider,
    request: {
      method: 'getMinimumBalanceForRentExemption',
      return: rent
    }
  })
}

async function mockPool({
  provider,
  tokenA,
  tokenVaultA,
  tokenB,
  tokenVaultB,
  aToB,
  pool,
  tickCurrentIndex = -36882,
  ticksArrays = [{startTickIndex:-37312},{startTickIndex:-36608,ticks:{0:{liquidityNet:"-177180411886",liquidityGross:"177180411886",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},4:{liquidityNet:"-96783619017",liquidityGross:"96783619017",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},5:{liquidityNet:"-36396673741",liquidityGross:"36396673741",feeGrowthOutsideA:"58480415655371237",feeGrowthOutsideB:"1533435982771336"},6:{liquidityNet:"-157339032659",liquidityGross:"157339032659",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},7:{liquidityNet:"-108166213508",liquidityGross:"108166213508",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},8:{liquidityNet:"-16150425765",liquidityGross:"16150425765",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},9:{liquidityNet:"-1587029175618",liquidityGross:"1587029175618",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},10:{liquidityNet:"-18540419946",liquidityGross:"18540419946",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},11:{liquidityNet:"-27406912679",liquidityGross:"27406912679",feeGrowthOutsideA:"61964929623335443",feeGrowthOutsideB:"1629172962033704"},12:{liquidityNet:"-1600009414952",liquidityGross:"1600009414952",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},13:{liquidityNet:"-3239555619823",liquidityGross:"3239555619823",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},14:{liquidityNet:"-2240416922114",liquidityGross:"2240694385654",feeGrowthOutsideA:"467666437012080072",feeGrowthOutsideB:"14070012546962283"},15:{liquidityNet:"-2424187781456",liquidityGross:"2424187781456",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},16:{liquidityNet:"-4855551269463",liquidityGross:"4855551269463",feeGrowthOutsideA:"53436390900401334",feeGrowthOutsideB:"1407415794461017"},20:{liquidityNet:"-121940202771",liquidityGross:"121940202771",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},21:{liquidityNet:"-16061695979",liquidityGross:"16061695979",feeGrowthOutsideA:"33646996085661108",feeGrowthOutsideB:"884736975313913"},22:{liquidityNet:"-13669819261",liquidityGross:"13669819261",feeGrowthOutsideA:"41340570856514964",feeGrowthOutsideB:"1091573195102131"},24:{liquidityNet:"-50959742430",liquidityGross:"50959742430",feeGrowthOutsideA:"24678438173293574",feeGrowthOutsideB:"653470549503357"},25:{liquidityNet:"-1322116340802",liquidityGross:"1322116340802",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},28:{liquidityNet:"-447389846896",liquidityGross:"447389846896",feeGrowthOutsideA:"20768205794446318",feeGrowthOutsideB:"550793166905029"},29:{liquidityNet:"-49327632106",liquidityGross:"49327632106",feeGrowthOutsideA:"19814783718412737",feeGrowthOutsideB:"525709078053508"},31:{liquidityNet:"-4452907452",liquidityGross:"4452907452",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},32:{liquidityNet:"-4700166165",liquidityGross:"4700166165",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},33:{liquidityNet:"-7559090313",liquidityGross:"7559090313",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},34:{liquidityNet:"-17271873657",liquidityGross:"17271873657",feeGrowthOutsideA:"15407888100990501",feeGrowthOutsideB:"409723682592662"},35:{liquidityNet:"-2334501713017",liquidityGross:"2334501713017",feeGrowthOutsideA:"12177640330876680",feeGrowthOutsideB:"324182442591560"},36:{liquidityNet:"-3253746935",liquidityGross:"3253746935",feeGrowthOutsideA:"11170652137911872",feeGrowthOutsideB:"297540159218356"},37:{liquidityNet:"-548636737846",liquidityGross:"548636737846",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},38:{liquidityNet:"-28191558453",liquidityGross:"28191558453",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},39:{liquidityNet:"-582609621503",liquidityGross:"582609621503",feeGrowthOutsideA:"7968336436530899",feeGrowthOutsideB:"212680670443409"},42:{liquidityNet:"-52268684228",liquidityGross:"52268684228",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},43:{liquidityNet:"-22220156030",liquidityGross:"22220156030",feeGrowthOutsideA:"5145992933942877",feeGrowthOutsideB:"137705525486758"},44:{liquidityNet:"-74343682897",liquidityGross:"74343682897",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},46:{liquidityNet:"-290920805669",liquidityGross:"290920805669",feeGrowthOutsideA:"3435981453319982",feeGrowthOutsideB:"92134779533409"},47:{liquidityNet:"-74219114012",liquidityGross:"74219114012",feeGrowthOutsideA:"2917787751172147",feeGrowthOutsideB:"78304400097465"},48:{liquidityNet:"-4912003386",liquidityGross:"4912003386",feeGrowthOutsideA:"2653397334548723",feeGrowthOutsideB:"71241850724600"},49:{liquidityNet:"-974047853",liquidityGross:"974047853",feeGrowthOutsideA:"2345202005277387",feeGrowthOutsideB:"63002404722428"},51:{liquidityNet:"-8791284258",liquidityGross:"8791284258",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},52:{liquidityNet:"-107879683032",liquidityGross:"107879683032",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},53:{liquidityNet:"-61049674843",liquidityGross:"61049674843",feeGrowthOutsideA:"1376756562458258",feeGrowthOutsideB:"37065804047541"},55:{liquidityNet:"-6498625395",liquidityGross:"6498625395",feeGrowthOutsideA:"1018506706157926",feeGrowthOutsideB:"27446156364380"},56:{liquidityNet:"-66654703374",liquidityGross:"66654703374",feeGrowthOutsideA:"858196872291254",feeGrowthOutsideB:"23136413645695"},59:{liquidityNet:"-485288455672",liquidityGross:"485288455672",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},60:{liquidityNet:"-105957398",liquidityGross:"105957398",feeGrowthOutsideA:"224010556729133",feeGrowthOutsideB:"6049281500623"},61:{liquidityNet:"-9659139440211",liquidityGross:"9659139440211",feeGrowthOutsideA:"106260326817830",feeGrowthOutsideB:"2871088105495"},64:{liquidityNet:"-20428739514",liquidityGross:"20428739514",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},67:{liquidityNet:"-23451844602",liquidityGross:"23451844602",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},68:{liquidityNet:"-163272914238",liquidityGross:"163272914238",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},69:{liquidityNet:"-12011376840",liquidityGross:"12011376840",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},70:{liquidityNet:"-167352323482",liquidityGross:"167352323482",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},71:{liquidityNet:"-1282594546630",liquidityGross:"1282594546630",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},72:{liquidityNet:"-4680485030",liquidityGross:"4680485030",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},73:{liquidityNet:"-909736670477",liquidityGross:"909736670477",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},75:{liquidityNet:"-80645407816",liquidityGross:"80645407816",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},77:{liquidityNet:"-3850540820",liquidityGross:"3850540820",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},81:{liquidityNet:"-1259639695526",liquidityGross:"1259639695526",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},82:{liquidityNet:"-10943196294",liquidityGross:"10943196294",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},83:{liquidityNet:"-125873370600",liquidityGross:"125873370600",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},84:{liquidityNet:"-38732607822",liquidityGross:"38732607822",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},85:{liquidityNet:"-982433830",liquidityGross:"982433830",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},86:{liquidityNet:"-414316974260",liquidityGross:"416275584948",feeGrowthOutsideA:"274830975894739950",feeGrowthOutsideB:"8821966592553760"},}},{startTickIndex:-35904}]
}) {

  let data = Buffer.alloc(exchange.router.v1.api.span)
  exchange.router.v1.api.encode({
    anchorDiscriminator: new BN("676526073106765119"),
    whirlpoolsConfig: new PublicKey("2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ"),
    whirlpoolBump: [255],
    tickSpacing: 8,
    tickSpacingSeed: [8, 0],
    feeRate: 500,
    protocolFeeRate: 300,
    liquidity: new BN("136998569316352"),
    sqrtPrice: new BN("2918820840406909924"),
    tickCurrentIndex,
    protocolFeeOwedA: new BN("395804577504"),
    protocolFeeOwedB: new BN("8385292147"),
    tokenMintA: new PublicKey(tokenA),
    tokenVaultA: new PublicKey(tokenVaultA),
    feeGrowthGlobalA: new BN("8707343730338240968"),
    tokenMintB: new PublicKey(tokenB),
    tokenVaultB: new PublicKey(tokenVaultB),
    feeGrowthGlobalB: new BN("215594507062109582"),
    rewardLastUpdatedTimestamp: new BN("1681475945"),
    rewardInfos: []
  }, data)

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenA }},
        { memcmp: { offset: 181, bytes: tokenB }},
      ]},
      return: [{ account: { data, executable: false, lamports: 2039280, owner: exchange.router.v1.address, rentEpoch: 327 }, pubkey: pool }]
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenB }},
        { memcmp: { offset: 181, bytes: tokenA }},
      ]},
      return: []
    }
  })

  // mock getting fresh account data for dedicated pool
  mock({
    blockchain,
    provider,
    request: {
      method: 'getAccountInfo',
      to: pool,
      api: exchange.router.v1.api,
      return: {
        anchorDiscriminator: "676526073106765119",
        whirlpoolsConfig: "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
        whirlpoolBump: [255],
        tickSpacing: 8,
        tickSpacingSeed: [8, 0],
        feeRate: 500,
        protocolFeeRate: 300,
        liquidity: "136998569316352",
        sqrtPrice: "2918820840406909924",
        tickCurrentIndex,
        protocolFeeOwedA: "395804577504",
        protocolFeeOwedB: "8385292147",
        tokenMintA: tokenA,
        tokenVaultA: tokenVaultA,
        feeGrowthGlobalA: "8707343730338240968",
        tokenMintB: tokenB,
        tokenVaultB: tokenVaultB,
        feeGrowthGlobalB: "215594507062109582",
        rewardLastUpdatedTimestamp: "1681475945",
        rewardInfos: []
      }
    }
  })

  // mock tickArrays

  const tickArrayAddresses = await getTickArrayAddresses({ aToB, pool: new PublicKey(pool), tickSpacing: 8, tickCurrentIndex })

  tickArrayAddresses.forEach((tickArrayAddress, index)=>{

    let ticks = []

    for (let i = 0; i < 88; i++) {
      ticks[i] = {}
      ticks[i].initialized = false
      ticks[i].liquidityNet = "0"
      ticks[i].liquidityGross = "0"
      ticks[i].feeGrowthOutsideA = "0"
      ticks[i].feeGrowthOutsideB = "0"
    }

    for (var i in ticksArrays[index].ticks) {
      ticks[i] = Object.assign(ticks[i], ticksArrays[index].ticks[i])
      ticks[i].initialized = true
    }

    mock({
      blockchain,
      provider,
      request: {
        method: 'getAccountInfo',
        to: tickArrayAddress.toString(),
        api: TICK_ARRAY_LAYOUT,
        return: {
          anchorDiscriminator: '13493355605783306565',
          startTickIndex: ticksArrays[index].startTickIndex,
          whirlpool: pool,
          ticks
        }
      }
    })
  })
}

async function mockPools({
  provider,
  poolOne,
  poolTwo,
  tokenA,
  tokenMiddle,
  tokenB,
  tokenVaultOneA,
  tokenVaultOneB,
  tokenVaultTwoA,
  tokenVaultTwoB,
  aToBOne,
  aToBTwo,
  tickCurrentIndexOne = -36882,
  ticksArraysOne = [{startTickIndex:-37312},{startTickIndex:-36608,ticks:{0:{liquidityNet:"-177180411886",liquidityGross:"177180411886",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},4:{liquidityNet:"-96783619017",liquidityGross:"96783619017",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},5:{liquidityNet:"-36396673741",liquidityGross:"36396673741",feeGrowthOutsideA:"58480415655371237",feeGrowthOutsideB:"1533435982771336"},6:{liquidityNet:"-157339032659",liquidityGross:"157339032659",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},7:{liquidityNet:"-108166213508",liquidityGross:"108166213508",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},8:{liquidityNet:"-16150425765",liquidityGross:"16150425765",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},9:{liquidityNet:"-1587029175618",liquidityGross:"1587029175618",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},10:{liquidityNet:"-18540419946",liquidityGross:"18540419946",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},11:{liquidityNet:"-27406912679",liquidityGross:"27406912679",feeGrowthOutsideA:"61964929623335443",feeGrowthOutsideB:"1629172962033704"},12:{liquidityNet:"-1600009414952",liquidityGross:"1600009414952",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},13:{liquidityNet:"-3239555619823",liquidityGross:"3239555619823",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},14:{liquidityNet:"-2240416922114",liquidityGross:"2240694385654",feeGrowthOutsideA:"467666437012080072",feeGrowthOutsideB:"14070012546962283"},15:{liquidityNet:"-2424187781456",liquidityGross:"2424187781456",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},16:{liquidityNet:"-4855551269463",liquidityGross:"4855551269463",feeGrowthOutsideA:"53436390900401334",feeGrowthOutsideB:"1407415794461017"},20:{liquidityNet:"-121940202771",liquidityGross:"121940202771",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},21:{liquidityNet:"-16061695979",liquidityGross:"16061695979",feeGrowthOutsideA:"33646996085661108",feeGrowthOutsideB:"884736975313913"},22:{liquidityNet:"-13669819261",liquidityGross:"13669819261",feeGrowthOutsideA:"41340570856514964",feeGrowthOutsideB:"1091573195102131"},24:{liquidityNet:"-50959742430",liquidityGross:"50959742430",feeGrowthOutsideA:"24678438173293574",feeGrowthOutsideB:"653470549503357"},25:{liquidityNet:"-1322116340802",liquidityGross:"1322116340802",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},28:{liquidityNet:"-447389846896",liquidityGross:"447389846896",feeGrowthOutsideA:"20768205794446318",feeGrowthOutsideB:"550793166905029"},29:{liquidityNet:"-49327632106",liquidityGross:"49327632106",feeGrowthOutsideA:"19814783718412737",feeGrowthOutsideB:"525709078053508"},31:{liquidityNet:"-4452907452",liquidityGross:"4452907452",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},32:{liquidityNet:"-4700166165",liquidityGross:"4700166165",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},33:{liquidityNet:"-7559090313",liquidityGross:"7559090313",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},34:{liquidityNet:"-17271873657",liquidityGross:"17271873657",feeGrowthOutsideA:"15407888100990501",feeGrowthOutsideB:"409723682592662"},35:{liquidityNet:"-2334501713017",liquidityGross:"2334501713017",feeGrowthOutsideA:"12177640330876680",feeGrowthOutsideB:"324182442591560"},36:{liquidityNet:"-3253746935",liquidityGross:"3253746935",feeGrowthOutsideA:"11170652137911872",feeGrowthOutsideB:"297540159218356"},37:{liquidityNet:"-548636737846",liquidityGross:"548636737846",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},38:{liquidityNet:"-28191558453",liquidityGross:"28191558453",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},39:{liquidityNet:"-582609621503",liquidityGross:"582609621503",feeGrowthOutsideA:"7968336436530899",feeGrowthOutsideB:"212680670443409"},42:{liquidityNet:"-52268684228",liquidityGross:"52268684228",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},43:{liquidityNet:"-22220156030",liquidityGross:"22220156030",feeGrowthOutsideA:"5145992933942877",feeGrowthOutsideB:"137705525486758"},44:{liquidityNet:"-74343682897",liquidityGross:"74343682897",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},46:{liquidityNet:"-290920805669",liquidityGross:"290920805669",feeGrowthOutsideA:"3435981453319982",feeGrowthOutsideB:"92134779533409"},47:{liquidityNet:"-74219114012",liquidityGross:"74219114012",feeGrowthOutsideA:"2917787751172147",feeGrowthOutsideB:"78304400097465"},48:{liquidityNet:"-4912003386",liquidityGross:"4912003386",feeGrowthOutsideA:"2653397334548723",feeGrowthOutsideB:"71241850724600"},49:{liquidityNet:"-974047853",liquidityGross:"974047853",feeGrowthOutsideA:"2345202005277387",feeGrowthOutsideB:"63002404722428"},51:{liquidityNet:"-8791284258",liquidityGross:"8791284258",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},52:{liquidityNet:"-107879683032",liquidityGross:"107879683032",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},53:{liquidityNet:"-61049674843",liquidityGross:"61049674843",feeGrowthOutsideA:"1376756562458258",feeGrowthOutsideB:"37065804047541"},55:{liquidityNet:"-6498625395",liquidityGross:"6498625395",feeGrowthOutsideA:"1018506706157926",feeGrowthOutsideB:"27446156364380"},56:{liquidityNet:"-66654703374",liquidityGross:"66654703374",feeGrowthOutsideA:"858196872291254",feeGrowthOutsideB:"23136413645695"},59:{liquidityNet:"-485288455672",liquidityGross:"485288455672",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},60:{liquidityNet:"-105957398",liquidityGross:"105957398",feeGrowthOutsideA:"224010556729133",feeGrowthOutsideB:"6049281500623"},61:{liquidityNet:"-9659139440211",liquidityGross:"9659139440211",feeGrowthOutsideA:"106260326817830",feeGrowthOutsideB:"2871088105495"},64:{liquidityNet:"-20428739514",liquidityGross:"20428739514",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},67:{liquidityNet:"-23451844602",liquidityGross:"23451844602",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},68:{liquidityNet:"-163272914238",liquidityGross:"163272914238",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},69:{liquidityNet:"-12011376840",liquidityGross:"12011376840",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},70:{liquidityNet:"-167352323482",liquidityGross:"167352323482",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},71:{liquidityNet:"-1282594546630",liquidityGross:"1282594546630",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},72:{liquidityNet:"-4680485030",liquidityGross:"4680485030",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},73:{liquidityNet:"-909736670477",liquidityGross:"909736670477",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},75:{liquidityNet:"-80645407816",liquidityGross:"80645407816",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},77:{liquidityNet:"-3850540820",liquidityGross:"3850540820",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},81:{liquidityNet:"-1259639695526",liquidityGross:"1259639695526",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},82:{liquidityNet:"-10943196294",liquidityGross:"10943196294",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},83:{liquidityNet:"-125873370600",liquidityGross:"125873370600",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},84:{liquidityNet:"-38732607822",liquidityGross:"38732607822",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},85:{liquidityNet:"-982433830",liquidityGross:"982433830",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},86:{liquidityNet:"-414316974260",liquidityGross:"416275584948",feeGrowthOutsideA:"274830975894739950",feeGrowthOutsideB:"8821966592553760"}}},{startTickIndex:-35904}],
  tickCurrentIndexTwo = -55868,
  ticksArraysTwo = [{startTickIndex:-56320, ticks:{0:{liquidityNet:"-177180411886",liquidityGross:"177180411886",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},4:{liquidityNet:"-96783619017",liquidityGross:"96783619017",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},5:{liquidityNet:"-36396673741",liquidityGross:"36396673741",feeGrowthOutsideA:"58480415655371237",feeGrowthOutsideB:"1533435982771336"},6:{liquidityNet:"-157339032659",liquidityGross:"157339032659",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},7:{liquidityNet:"-108166213508",liquidityGross:"108166213508",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},8:{liquidityNet:"-16150425765",liquidityGross:"16150425765",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},9:{liquidityNet:"-1587029175618",liquidityGross:"1587029175618",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},10:{liquidityNet:"-18540419946",liquidityGross:"18540419946",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},11:{liquidityNet:"-27406912679",liquidityGross:"27406912679",feeGrowthOutsideA:"61964929623335443",feeGrowthOutsideB:"1629172962033704"},12:{liquidityNet:"-1600009414952",liquidityGross:"1600009414952",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},13:{liquidityNet:"-3239555619823",liquidityGross:"3239555619823",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},14:{liquidityNet:"-2240416922114",liquidityGross:"2240694385654",feeGrowthOutsideA:"467666437012080072",feeGrowthOutsideB:"14070012546962283"},15:{liquidityNet:"-2424187781456",liquidityGross:"2424187781456",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},16:{liquidityNet:"-4855551269463",liquidityGross:"4855551269463",feeGrowthOutsideA:"53436390900401334",feeGrowthOutsideB:"1407415794461017"},20:{liquidityNet:"-121940202771",liquidityGross:"121940202771",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},21:{liquidityNet:"-16061695979",liquidityGross:"16061695979",feeGrowthOutsideA:"33646996085661108",feeGrowthOutsideB:"884736975313913"},22:{liquidityNet:"-13669819261",liquidityGross:"13669819261",feeGrowthOutsideA:"41340570856514964",feeGrowthOutsideB:"1091573195102131"},24:{liquidityNet:"-50959742430",liquidityGross:"50959742430",feeGrowthOutsideA:"24678438173293574",feeGrowthOutsideB:"653470549503357"},25:{liquidityNet:"-1322116340802",liquidityGross:"1322116340802",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},28:{liquidityNet:"-447389846896",liquidityGross:"447389846896",feeGrowthOutsideA:"20768205794446318",feeGrowthOutsideB:"550793166905029"},29:{liquidityNet:"-49327632106",liquidityGross:"49327632106",feeGrowthOutsideA:"19814783718412737",feeGrowthOutsideB:"525709078053508"},31:{liquidityNet:"-4452907452",liquidityGross:"4452907452",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},32:{liquidityNet:"-4700166165",liquidityGross:"4700166165",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},33:{liquidityNet:"-7559090313",liquidityGross:"7559090313",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},34:{liquidityNet:"-17271873657",liquidityGross:"17271873657",feeGrowthOutsideA:"15407888100990501",feeGrowthOutsideB:"409723682592662"},35:{liquidityNet:"-2334501713017",liquidityGross:"2334501713017",feeGrowthOutsideA:"12177640330876680",feeGrowthOutsideB:"324182442591560"},36:{liquidityNet:"-3253746935",liquidityGross:"3253746935",feeGrowthOutsideA:"11170652137911872",feeGrowthOutsideB:"297540159218356"},37:{liquidityNet:"-548636737846",liquidityGross:"548636737846",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},38:{liquidityNet:"-28191558453",liquidityGross:"28191558453",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},39:{liquidityNet:"-582609621503",liquidityGross:"582609621503",feeGrowthOutsideA:"7968336436530899",feeGrowthOutsideB:"212680670443409"},42:{liquidityNet:"-52268684228",liquidityGross:"52268684228",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},43:{liquidityNet:"-22220156030",liquidityGross:"22220156030",feeGrowthOutsideA:"5145992933942877",feeGrowthOutsideB:"137705525486758"},44:{liquidityNet:"-74343682897",liquidityGross:"74343682897",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},46:{liquidityNet:"-290920805669",liquidityGross:"290920805669",feeGrowthOutsideA:"3435981453319982",feeGrowthOutsideB:"92134779533409"},47:{liquidityNet:"-74219114012",liquidityGross:"74219114012",feeGrowthOutsideA:"2917787751172147",feeGrowthOutsideB:"78304400097465"},48:{liquidityNet:"-4912003386",liquidityGross:"4912003386",feeGrowthOutsideA:"2653397334548723",feeGrowthOutsideB:"71241850724600"},49:{liquidityNet:"-974047853",liquidityGross:"974047853",feeGrowthOutsideA:"2345202005277387",feeGrowthOutsideB:"63002404722428"},51:{liquidityNet:"-8791284258",liquidityGross:"8791284258",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},52:{liquidityNet:"-107879683032",liquidityGross:"107879683032",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},53:{liquidityNet:"-61049674843",liquidityGross:"61049674843",feeGrowthOutsideA:"1376756562458258",feeGrowthOutsideB:"37065804047541"},55:{liquidityNet:"-6498625395",liquidityGross:"6498625395",feeGrowthOutsideA:"1018506706157926",feeGrowthOutsideB:"27446156364380"},56:{liquidityNet:"-66654703374",liquidityGross:"66654703374",feeGrowthOutsideA:"858196872291254",feeGrowthOutsideB:"23136413645695"},59:{liquidityNet:"-485288455672",liquidityGross:"485288455672",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},60:{liquidityNet:"-105957398",liquidityGross:"105957398",feeGrowthOutsideA:"224010556729133",feeGrowthOutsideB:"6049281500623"},61:{liquidityNet:"-9659139440211",liquidityGross:"9659139440211",feeGrowthOutsideA:"106260326817830",feeGrowthOutsideB:"2871088105495"},64:{liquidityNet:"-20428739514",liquidityGross:"20428739514",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},67:{liquidityNet:"-23451844602",liquidityGross:"23451844602",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},68:{liquidityNet:"-163272914238",liquidityGross:"163272914238",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},69:{liquidityNet:"-12011376840",liquidityGross:"12011376840",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},70:{liquidityNet:"-167352323482",liquidityGross:"167352323482",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},71:{liquidityNet:"-1282594546630",liquidityGross:"1282594546630",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},72:{liquidityNet:"-4680485030",liquidityGross:"4680485030",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},73:{liquidityNet:"-909736670477",liquidityGross:"909736670477",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},75:{liquidityNet:"-80645407816",liquidityGross:"80645407816",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},77:{liquidityNet:"-3850540820",liquidityGross:"3850540820",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},81:{liquidityNet:"-1259639695526",liquidityGross:"1259639695526",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},82:{liquidityNet:"-10943196294",liquidityGross:"10943196294",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},83:{liquidityNet:"-125873370600",liquidityGross:"125873370600",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},84:{liquidityNet:"-38732607822",liquidityGross:"38732607822",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},85:{liquidityNet:"-982433830",liquidityGross:"982433830",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},86:{liquidityNet:"-414316974260",liquidityGross:"416275584948",feeGrowthOutsideA:"274830975894739950",feeGrowthOutsideB:"8821966592553760"}}},{startTickIndex:-50688,ticks:{0:{liquidityNet:"-177180411886",liquidityGross:"177180411886",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},4:{liquidityNet:"-96783619017",liquidityGross:"96783619017",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},5:{liquidityNet:"-36396673741",liquidityGross:"36396673741",feeGrowthOutsideA:"58480415655371237",feeGrowthOutsideB:"1533435982771336"},6:{liquidityNet:"-157339032659",liquidityGross:"157339032659",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},7:{liquidityNet:"-108166213508",liquidityGross:"108166213508",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},8:{liquidityNet:"-16150425765",liquidityGross:"16150425765",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},9:{liquidityNet:"-1587029175618",liquidityGross:"1587029175618",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},10:{liquidityNet:"-18540419946",liquidityGross:"18540419946",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},11:{liquidityNet:"-27406912679",liquidityGross:"27406912679",feeGrowthOutsideA:"61964929623335443",feeGrowthOutsideB:"1629172962033704"},12:{liquidityNet:"-1600009414952",liquidityGross:"1600009414952",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},13:{liquidityNet:"-3239555619823",liquidityGross:"3239555619823",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},14:{liquidityNet:"-2240416922114",liquidityGross:"2240694385654",feeGrowthOutsideA:"467666437012080072",feeGrowthOutsideB:"14070012546962283"},15:{liquidityNet:"-2424187781456",liquidityGross:"2424187781456",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},16:{liquidityNet:"-4855551269463",liquidityGross:"4855551269463",feeGrowthOutsideA:"53436390900401334",feeGrowthOutsideB:"1407415794461017"},20:{liquidityNet:"-121940202771",liquidityGross:"121940202771",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},21:{liquidityNet:"-16061695979",liquidityGross:"16061695979",feeGrowthOutsideA:"33646996085661108",feeGrowthOutsideB:"884736975313913"},22:{liquidityNet:"-13669819261",liquidityGross:"13669819261",feeGrowthOutsideA:"41340570856514964",feeGrowthOutsideB:"1091573195102131"},24:{liquidityNet:"-50959742430",liquidityGross:"50959742430",feeGrowthOutsideA:"24678438173293574",feeGrowthOutsideB:"653470549503357"},25:{liquidityNet:"-1322116340802",liquidityGross:"1322116340802",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},28:{liquidityNet:"-447389846896",liquidityGross:"447389846896",feeGrowthOutsideA:"20768205794446318",feeGrowthOutsideB:"550793166905029"},29:{liquidityNet:"-49327632106",liquidityGross:"49327632106",feeGrowthOutsideA:"19814783718412737",feeGrowthOutsideB:"525709078053508"},31:{liquidityNet:"-4452907452",liquidityGross:"4452907452",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},32:{liquidityNet:"-4700166165",liquidityGross:"4700166165",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},33:{liquidityNet:"-7559090313",liquidityGross:"7559090313",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},34:{liquidityNet:"-17271873657",liquidityGross:"17271873657",feeGrowthOutsideA:"15407888100990501",feeGrowthOutsideB:"409723682592662"},35:{liquidityNet:"-2334501713017",liquidityGross:"2334501713017",feeGrowthOutsideA:"12177640330876680",feeGrowthOutsideB:"324182442591560"},36:{liquidityNet:"-3253746935",liquidityGross:"3253746935",feeGrowthOutsideA:"11170652137911872",feeGrowthOutsideB:"297540159218356"},37:{liquidityNet:"-548636737846",liquidityGross:"548636737846",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},38:{liquidityNet:"-28191558453",liquidityGross:"28191558453",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},39:{liquidityNet:"-582609621503",liquidityGross:"582609621503",feeGrowthOutsideA:"7968336436530899",feeGrowthOutsideB:"212680670443409"},42:{liquidityNet:"-52268684228",liquidityGross:"52268684228",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},43:{liquidityNet:"-22220156030",liquidityGross:"22220156030",feeGrowthOutsideA:"5145992933942877",feeGrowthOutsideB:"137705525486758"},44:{liquidityNet:"-74343682897",liquidityGross:"74343682897",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},46:{liquidityNet:"-290920805669",liquidityGross:"290920805669",feeGrowthOutsideA:"3435981453319982",feeGrowthOutsideB:"92134779533409"},47:{liquidityNet:"-74219114012",liquidityGross:"74219114012",feeGrowthOutsideA:"2917787751172147",feeGrowthOutsideB:"78304400097465"},48:{liquidityNet:"-4912003386",liquidityGross:"4912003386",feeGrowthOutsideA:"2653397334548723",feeGrowthOutsideB:"71241850724600"},49:{liquidityNet:"-974047853",liquidityGross:"974047853",feeGrowthOutsideA:"2345202005277387",feeGrowthOutsideB:"63002404722428"},51:{liquidityNet:"-8791284258",liquidityGross:"8791284258",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},52:{liquidityNet:"-107879683032",liquidityGross:"107879683032",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},53:{liquidityNet:"-61049674843",liquidityGross:"61049674843",feeGrowthOutsideA:"1376756562458258",feeGrowthOutsideB:"37065804047541"},55:{liquidityNet:"-6498625395",liquidityGross:"6498625395",feeGrowthOutsideA:"1018506706157926",feeGrowthOutsideB:"27446156364380"},56:{liquidityNet:"-66654703374",liquidityGross:"66654703374",feeGrowthOutsideA:"858196872291254",feeGrowthOutsideB:"23136413645695"},59:{liquidityNet:"-485288455672",liquidityGross:"485288455672",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},60:{liquidityNet:"-105957398",liquidityGross:"105957398",feeGrowthOutsideA:"224010556729133",feeGrowthOutsideB:"6049281500623"},61:{liquidityNet:"-9659139440211",liquidityGross:"9659139440211",feeGrowthOutsideA:"106260326817830",feeGrowthOutsideB:"2871088105495"},64:{liquidityNet:"-20428739514",liquidityGross:"20428739514",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},67:{liquidityNet:"-23451844602",liquidityGross:"23451844602",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},68:{liquidityNet:"-163272914238",liquidityGross:"163272914238",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},69:{liquidityNet:"-12011376840",liquidityGross:"12011376840",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},70:{liquidityNet:"-167352323482",liquidityGross:"167352323482",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},71:{liquidityNet:"-1282594546630",liquidityGross:"1282594546630",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},72:{liquidityNet:"-4680485030",liquidityGross:"4680485030",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},73:{liquidityNet:"-909736670477",liquidityGross:"909736670477",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},75:{liquidityNet:"-80645407816",liquidityGross:"80645407816",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},77:{liquidityNet:"-3850540820",liquidityGross:"3850540820",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},81:{liquidityNet:"-1259639695526",liquidityGross:"1259639695526",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},82:{liquidityNet:"-10943196294",liquidityGross:"10943196294",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},83:{liquidityNet:"-125873370600",liquidityGross:"125873370600",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},84:{liquidityNet:"-38732607822",liquidityGross:"38732607822",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},85:{liquidityNet:"-982433830",liquidityGross:"982433830",feeGrowthOutsideA:"0",feeGrowthOutsideB:"0"},86:{liquidityNet:"-414316974260",liquidityGross:"416275584948",feeGrowthOutsideA:"274830975894739950",feeGrowthOutsideB:"8821966592553760"}}},{startTickIndex:-45056}],
}) {

  Blockchains.solana.stables.usd.forEach((stable)=>{
    mock({
      blockchain,
      provider,
      request: {
        method: 'getProgramAccounts',
        to: exchange.router.v1.address,
        params: { filters: [
          { dataSize: exchange.router.v1.api.span },
          { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
          { memcmp: { offset: 101, bytes: tokenA }},
          { memcmp: { offset: 181, bytes: stable }},
        ]},
        return: [] // no direct path
      }
    })

    mock({
      blockchain,
      provider,
      request: {
        method: 'getProgramAccounts',
        to: exchange.router.v1.address,
        params: { filters: [
          { dataSize: exchange.router.v1.api.span },
          { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
          { memcmp: { offset: 101, bytes: stable }},
          { memcmp: { offset: 181, bytes: tokenA }},
        ]},
        return: [] // no direct path
      }
    })

    mock({
      blockchain,
      provider,
      request: {
        method: 'getProgramAccounts',
        to: exchange.router.v1.address,
        params: { filters: [
          { dataSize: exchange.router.v1.api.span },
          { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
          { memcmp: { offset: 101, bytes: tokenB }},
          { memcmp: { offset: 181, bytes: stable }},
        ]},
        return: [] // no direct path
      }
    })

    mock({
      blockchain,
      provider,
      request: {
        method: 'getProgramAccounts',
        to: exchange.router.v1.address,
        params: { filters: [
          { dataSize: exchange.router.v1.api.span },
          { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
          { memcmp: { offset: 101, bytes: stable }},
          { memcmp: { offset: 181, bytes: tokenB }},
        ]},
        return: [] // no direct path
      }
    })
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenA }},
        { memcmp: { offset: 181, bytes: tokenB }},
      ]},
      return: [] // no direct path
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenB }},
        { memcmp: { offset: 181, bytes: tokenA }},
      ]},
      return: [] // no direct path
    }
  })

  let poolTwoData = Buffer.alloc(exchange.router.v1.api.span)
  exchange.router.v1.api.encode({
    anchorDiscriminator: new BN("676526073106765119"),
    whirlpoolsConfig: new PublicKey("2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ"),
    whirlpoolBump: [255],
    tickSpacing: 8,
    tickSpacingSeed: [8, 0],
    feeRate: 500,
    protocolFeeRate: 300,
    liquidity: new BN("136998569316352"),
    sqrtPrice: new BN("2918820840406909924"),
    tickCurrentIndex: tickCurrentIndexTwo,
    protocolFeeOwedA: new BN("395804577504"),
    protocolFeeOwedB: new BN("8385292147"),
    tokenMintA: new PublicKey(tokenA),
    tokenVaultA: new PublicKey(tokenVaultTwoA),
    feeGrowthGlobalA: new BN("8707343730338240968"),
    tokenMintB: new PublicKey(tokenB),
    tokenVaultB: new PublicKey(tokenVaultTwoB),
    feeGrowthGlobalB: new BN("215594507062109582"),
    rewardLastUpdatedTimestamp: new BN("1681475945"),
    rewardInfos: []
  }, poolTwoData)

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenA }},
        { memcmp: { offset: 181, bytes: tokenMiddle }},
      ]},
      return: [{ account: { data: poolTwoData, executable: false, lamports: 2039280, owner: exchange.router.v1.address, rentEpoch: 327 }, pubkey: poolTwo }]
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenMiddle }},
        { memcmp: { offset: 181, bytes: tokenA }},
      ]},
      return: []
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenA }},
        { memcmp: { offset: 181, bytes: Blockchains.solana.wrapped.address }},
      ]},
      return: []
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: Blockchains.solana.wrapped.address }},
        { memcmp: { offset: 181, bytes: tokenA }},
      ]},
      return: []
    }
  })

  // mock getting fresh account data for dedicated poolTwo

  mock({
    blockchain,
    provider,
    request: {
      method: 'getAccountInfo',
      to: poolTwo,
      api: exchange.router.v1.api,
      return: {
        anchorDiscriminator: "676526073106765119",
        whirlpoolsConfig: "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
        whirlpoolBump: [255],
        tickSpacing: 8,
        tickSpacingSeed: [8, 0],
        feeRate: 500,
        protocolFeeRate: 300,
        liquidity: "136998569316352",
        sqrtPrice: "2918820840406909924",
        tickCurrentIndex: tickCurrentIndexTwo,
        protocolFeeOwedA: "395804577504",
        protocolFeeOwedB: "8385292147",
        tokenMintA: tokenA,
        tokenVaultA: tokenVaultTwoA,
        feeGrowthGlobalA: "8707343730338240968",
        tokenMintB: tokenB,
        tokenVaultB: tokenVaultTwoB,
        feeGrowthGlobalB: "215594507062109582",
        rewardLastUpdatedTimestamp: "1681475945",
        rewardInfos: []
      }
    }
  })

  // mock tickArraysTwo
  await Promise.all([true, false].map(async(aToB)=>{

    const tickArrayAddressesTwo = await getTickArrayAddresses({ aToB, pool: poolTwo, tickSpacing: 8, tickCurrentIndex: tickCurrentIndexTwo })

    tickArrayAddressesTwo.forEach((tickArrayAddress, index)=>{

      let ticks = []

      for (let i = 0; i < 88; i++) {
        ticks[i] = {}
        ticks[i].initialized = false
        ticks[i].liquidityNet = "0"
        ticks[i].liquidityGross = "0"
        ticks[i].feeGrowthOutsideA = "0"
        ticks[i].feeGrowthOutsideB = "0"
      }

      for (var i in ticksArraysTwo[index].ticks) {
        ticks[i] = Object.assign(ticks[i], ticksArraysTwo[index].ticks[i])
        ticks[i].initialized = true
      }

      mock({
        blockchain,
        provider,
        request: {
          method: 'getAccountInfo',
          to: tickArrayAddress.toString(),
          api: TICK_ARRAY_LAYOUT,
          return: {
            anchorDiscriminator: '13493355605783306565',
            startTickIndex: ticksArraysTwo[index].startTickIndex,
            whirlpool: poolTwo,
            ticks
          }
        }
      })
    })
  }))

  let poolOneData = Buffer.alloc(exchange.router.v1.api.span)
  exchange.router.v1.api.encode({
    anchorDiscriminator: new BN("676526073106765119"),
    whirlpoolsConfig: new PublicKey("2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ"),
    whirlpoolBump: [255],
    tickSpacing: 8,
    tickSpacingSeed: [8, 0],
    feeRate: 500,
    protocolFeeRate: 300,
    liquidity: new BN("136998569316352"),
    sqrtPrice: new BN("2918820840406909924"),
    tickCurrentIndex: tickCurrentIndexOne,
    protocolFeeOwedA: new BN("395804577504"),
    protocolFeeOwedB: new BN("8385292147"),
    tokenMintA: new PublicKey(tokenA),
    tokenVaultA: new PublicKey(tokenVaultOneA),
    feeGrowthGlobalA: new BN("8707343730338240968"),
    tokenMintB: new PublicKey(tokenB),
    tokenVaultB: new PublicKey(tokenVaultOneB),
    feeGrowthGlobalB: new BN("215594507062109582"),
    rewardLastUpdatedTimestamp: new BN("1681475945"),
    rewardInfos: []
  }, poolOneData)

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenB }},
        { memcmp: { offset: 181, bytes: tokenMiddle }},
      ]},
      return: [{ account: { data: poolOneData, executable: false, lamports: 2039280, owner: exchange.router.v1.address, rentEpoch: 327 }, pubkey: poolOne }]
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenMiddle }},
        { memcmp: { offset: 181, bytes: tokenB }},
      ]},
      return: []
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: tokenB }},
        { memcmp: { offset: 181, bytes: Blockchains.solana.wrapped.address }},
      ]},
      return: []
    }
  })

  mock({
    blockchain,
    provider,
    request: {
      method: 'getProgramAccounts',
      to: exchange.router.v1.address,
      params: { filters: [
        { dataSize: exchange.router.v1.api.span },
        { memcmp: { offset: 8, bytes: '2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ' }},
        { memcmp: { offset: 101, bytes: Blockchains.solana.wrapped.address }},
        { memcmp: { offset: 181, bytes: tokenB }},
      ]},
      return: []
    }
  })

  // mock getting fresh account data for dedicated poolOne
  mock({
    blockchain,
    provider,
    request: {
      method: 'getAccountInfo',
      to: poolOne,
      api: exchange.router.v1.api,
      return: {
        anchorDiscriminator: "676526073106765119",
        whirlpoolsConfig: "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
        whirlpoolBump: [255],
        tickSpacing: 8,
        tickSpacingSeed: [8, 0],
        feeRate: 500,
        protocolFeeRate: 300,
        liquidity: "136998569316352",
        sqrtPrice: "2918820840406909924",
        tickCurrentIndex: tickCurrentIndexOne,
        protocolFeeOwedA: "395804577504",
        protocolFeeOwedB: "8385292147",
        tokenMintA: tokenA,
        tokenVaultA: tokenVaultOneA,
        feeGrowthGlobalA: "8707343730338240968",
        tokenMintB: tokenB,
        tokenVaultB: tokenVaultOneB,
        feeGrowthGlobalB: "215594507062109582",
        rewardLastUpdatedTimestamp: "1681475945",
        rewardInfos: []
      }
    }
  })

  // mock tickArraysOne

  await Promise.all([true, false].map(async(aToB)=>{

    const tickArrayAddressesOne = await getTickArrayAddresses({ aToB: aToBOne, pool: poolOne, tickSpacing: 8, tickCurrentIndex: tickCurrentIndexOne })

    tickArrayAddressesOne.forEach((tickArrayAddress, index)=>{

      let ticks = []

      for (let i = 0; i < 88; i++) {
        ticks[i] = {}
        ticks[i].initialized = false
        ticks[i].liquidityNet = "0"
        ticks[i].liquidityGross = "0"
        ticks[i].feeGrowthOutsideA = "0"
        ticks[i].feeGrowthOutsideB = "0"
      }

      for (var i in ticksArraysOne[index].ticks) {
        ticks[i] = Object.assign(ticks[i], ticksArraysOne[index].ticks[i])
        ticks[i].initialized = true
      }

      mock({
        blockchain,
        provider,
        request: {
          method: 'getAccountInfo',
          to: tickArrayAddress.toString(),
          api: TICK_ARRAY_LAYOUT,
          return: {
            anchorDiscriminator: '13493355605783306565',
            startTickIndex: ticksArraysOne[index].startTickIndex,
            whirlpool: poolOne,
            ticks
          }
        }
      })
    })
  }))
}

const getMockedPool = async(pool)=>{
  return await request({
    blockchain: 'solana',
    address: pool,
    api: exchange.router.v1.api,
  })
}

export {
  mockRent,
  mockPool,
  mockPools,
  getMockedPool,
}
