## Quickstart

```
yarn add @depay/web3-exchanges
```

or 

```
npm install --save @depay/web3-exchanges
```

```javascript
import { all, find, route } from '@depay/web3-exchanges'

all
// [
//   { name: 'uniswap_v2', label: 'Uniswap v2', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

let exchange = find('ethereum', 'uniswap_v2')
// { name: 'uniswap_v2', label: 'Uniswap v2', logo: '...' }

let routes

routes = await route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1
})

routes = await route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  amountIn: 1
})

// use connected wallet to sign and send the swap transaction
import { getWallets } from '@depay/web3-wallets'

const wallet = getWallets()[0]
const account = await wallet.account()
const transaction = await route.getTransaction({ from: account })

wallet.sendTransaction(transaction)

```

## Support

This library supports the following blockchains:

- [Ethereum](https://ethereum.org)
- [BNB Smart Chain](https://www.binance.org/smartChain)
- [Polygon](https://polygon.technology)
- [Solana](https://solana.com)
- [Velas](https://velas.com)

This library supports the following decentralized exchanges:

Ethereum:
- [Uniswap v2](https://uniswap.org)
- [WETH](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

BNB Smart Chain:
- [PancakeSwap v2](https://pancakeswap.info)
- [WBNB](https://bscscan.com/address/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c)

Polygon:
- [Quickswap](https://quickswap.exchange)
- [WMATIC](https://polygonscan.com/token/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270)

Solana:
- [Raydium](https://raydium.io)

Velas:
- [WagyuSwap](https://www.wagyuswap.app)
- [WVLX](https://velascan.org/address/0xc579d1f3cf86749e05cd06f7ade17856c2ce3126)

## Platform specific packaging

In case you want to use and package only specific platforms, use the platform-specific package:

```javascript
import { all, find, route } from '@depay/web3-exchanges-evm'
```

## Data Structures

### Exchange

Decentralized exchange data is provided in the following structure:

```
{
  blockchain: String (e.g. ethereum)
  name: String (e.g. uniswap_v2)
  alternativeNames: Array (e.g. ['pancake'])
  label: String (e.g. Uniswap v2)
  logo: String (base64 encoded PNG)
  router: Object (contains important addresses and apis to interact with the exchange router)
  factory: Object (contains important addresses and apis to interact with the exchange factory)
  pair: Object (contains important addresses and apis to interact with the exchange pair)
}
```

### Swap

A Swap configuration is fed into the `route` function:

```
{
  tokenIn: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  tokenOut: String (e.g. '0xdAC17F958D2ee523a2206206994597C13D831ec7')
  amountIn: Human Readable Number (e.g. 1.2)
  amountInMax: Human Readable Number (e.g. 1.2)
  amountOut: Human Readable Number (e.g. 1.2)
  amountOutMin: Human Readable Number (e.g. 1.2)
}
```

- `tokenIn`: The token put into the swap (out of wallet)
- `amountIn`: The amount of tokenIn put into the swap (out of wallet)
- `amountInMax`: The max. amount of tokenIn put into the swap (out of wallet)
- `tokenOut`: The token expected to come out of the swap (into wallet)
- `amountOut`: The amount of tokenOut expected to come out of the swap (into wallet)
- `amountOutMin`: The min. amount of tokenOut expected to come out of the swap (into wallet)

The following combinations of provided amounts are possible:

- Pass `amountOutMin`. `amountIn` will be calculated automatically and can vary
- Pass `amountInMax`. `amountOut` will be calculated automatically and can vary
- Pass `amountOut`. `amountInMax` will be calculated automatically and can vary
- Pass `amountIn`. `amountOutMin` will be calculated automatically and can vary

### Route

Routes are returned by calling `route`. A single Route has the following structure:

```
{
  tokenIn: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  tokenOut: String (e.g. '0xdAC17F958D2ee523a2206206994597C13D831ec7')
  path: Array (e.g. ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xdAC17F958D2ee523a2206206994597C13D831ec7'])
  amountIn: BigNumber (e.g. '1000000000000000000')
  amountOutMin: BigNumber (e.g. '32000000000000000000')
  amountOut: BigNumber (e.g. '32000000000000000000')
  amountInMax: BigNumber (e.g. '1000000000000000000')
  exchange: Exchange (see [Exchange data structure](#exchange))
  getTransaction: async function (returns transaction object –> see @depay/web3-wallets for details)
}
```

See [@depay/web3-wallets](https://github.com/DePayFi/@depay/web3-wallets#sendtransaction) for details about the transaction format.

## Slippage

This library applies slippage strategies to amounts for the following combinations:

- If `amountOutMin` is provided, slippage is applied to `amountIn`.
- If `amountOut` is provided, slippage is applied to `amountInMax`.

### Auto Slippage

Auto slippage applies `0.5%` default slippage.

For blockchains that allow to receive quotes for previous blocks (`EVM`), auto slippage additionally checks for:

- Extreme Direction

- Extreme Base Volatility

And applies a higher than default slippage (`0.5%`) if required.

#### Extreme Directional Price Change

If there is a clear directional change of the price for the last 3 blocks,
the target price will be projected according to the velocity of the last 3 blocks.

##### Example Extreme Directional Price Change

Current Price: $1'500

Last 3 Blocks: $1'500, $1'470, $1'440

Velocity: $30 per block

Projection: $1'530

Slippage 2%

Slippage of `2%` will be applied, because it's higher than default slippage.

_For downwards projections slippage is not required as the transaction would not fail._

#### Extreme Base Volatility

If there is extreme base volatility in the last 3 blocks, 
none-directional, 
the target price will be the highest price over the last 3 blocks plus the smallest price change over the last 3 blocks.

##### Example Extreme Base Volatility

Current Price: $1'500

Last 3 Blocks: $1'500, $1'490, $1'520

Smallest Change: $10

Highest Price: $1'520

Projection: $1'530 ($1'520 + $10)

Slippage 2%

Slippage of `2%` will be applied, because it's higher than default slippage.

## Functionalities

### all: Stores all information for all decentralized exchanges

```javascript
import { all } from '@depay/web3-exchanges'

all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

```

### find: Get decentralized exchanged by name (name usually contains version, too)

```javascript
import { find } from '@depay/web3-exchanges'

find('ethereum', 'uniswap_v2')
// { name: 'uniswap_v2', label: 'Uniswap v2', logo: '...' }

find('bsc', 'pancakeswap_v2')
// { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
```

### route: Routes a Swap configuration and returns routes to perform the Swap

```javascript
import { route } from '@depay/web3-exchanges'

let routes = route {
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountOutMin: 2
} // returns routes sorted by cost-effectiveness (best first)

// use connected wallet to sign and send the swap transaction
import { getWallets } from '@depay/web3-wallets'

const wallet = getWallets()[0]
const account = await wallet.account()
const transaction = await routes[0].getTransaction({ from: account })

wallet.sendTransaction(transaction)
```

`route` can also be called on concrete exchanges: 

```javascript
import { find } from '@depay/web3-exchanges'

let exchange = find('ethereum', 'uniswap_v2')

let route = await exchange.route({
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1
})

// use connected wallet to sign and send the swap transaction
import { getWallets } from '@depay/web3-wallets'

const wallet = getWallets()[0]
const account = await wallet.account()
const transaction = await route.getTransaction({ from: account })

wallet.sendTransaction(transaction)
```

### getAmounts: gets the required amounts for the route

```javascript
import { find } from '@depay/web3-exchanges'

let exchange = find('ethereum', 'uniswap_v2')

let { amountIn } = await exchange.getAmounts({
  path: ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
  amountOut: '2111112220000000',
  block: 14904658
}) // '123222200000000000'
```

## Development

### Get started

```
yarn install
yarn dev
```
