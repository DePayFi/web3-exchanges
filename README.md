## Quickstart

```
yarn add @depay/web3-exchanges
```

or 

```
npm install --save @depay/web3-exchanges
```

```javascript
import Exchanges from '@depay/web3-exchanges'

Exchanges.uniswap_v2
Exchanges.orca

// scoped

Exchanges.ethereum.uniswap_v2 // Ethereum scoped uniswap_v2
Exchanges.solana.orca

let routes

routes = await Exchanges.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1
})

routes = await Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  amountIn: 1
})

import { getWallets } from '@depay/web3-wallets'

const wallet = getWallets()[0]
const account = await wallet.account()

// check if prep is required to facilitate swap/exchange
const preparation = await route.getPrep({ account })

let signature
if(prep?.transaction) {
  await wallet.sendTransaction(prep.transaction)
} else if (prep?.signature) {
  signature = wallet.sign(prep.signature)
}

// use connected wallet to sign and send the swap transaction
const transaction = await route.getTransaction({ account, signature })
wallet.sendTransaction(transaction)

```

## Support

This library supports the following blockchains:

- [Ethereum](https://ethereum.org)
- [BNB Smart Chain](https://www.binance.org/smartChain)
- [Polygon](https://polygon.technology)
- [Solana](https://solana.com)
- [Optimism](https://www.optimism.io)
- [Arbitrum](https://arbitrum.io)
- [Fantom](https://fantom.foundation)
- [Avalanche](https://www.avax.network)
- [Gnosis](https://gnosis.io)

This library supports the following decentralized exchanges:

Ethereum:
- [Uniswap v3](https://uniswap.org)
- [Uniswap v2](https://uniswap.org)
- [WETH](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

BNB Smart Chain:
- [PancakeSwap v3](https://pancakeswap.info)
- [Uniswap v3](https://uniswap.org)
- [PancakeSwap v2](https://pancakeswap.info)
- [WBNB](https://bscscan.com/address/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c)

Polygon:
- [Uniswap v3](https://uniswap.org)
- [Quickswap](https://quickswap.exchange)
- [WMATIC](https://polygonscan.com/token/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270)

Solana:
- [Orca](https://orca.so)

Optimism:
- [Uniswap v3](https://uniswap.org)
- [WETH](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000006)

Arbitrum:
- [Uniswap v3](https://uniswap.org)
- [WETH](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)

Fantom:
- [SpookySwap](https://spookyswap.fi)
- [WFTM](https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83)

Avalanche:
- [Trader Joe v2.1](https://traderjoexyz.com)
- [WAVAX](https://snowtrace.io/token/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7)

Gnosis:
- [Honeyswap](https://honeyswap.org)
- [WXDAI](https://gnosisscan.io/token/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d)


## Platform specific packaging

In case you want to use and package only specific platforms, use the platform-specific package:

### EVM platform specific packaging

```javascript
import Exchanges from '@depay/web3-exchanges-evm'
```

### Solana platform specific packaging

```javascript
import Exchanges from '@depay/web3-exchanges-solana'
```

## Data Structures

### Exchange

Decentralized exchange data is provided in the following structure:

```
{
  name: String (e.g. uniswap_v2)
  label: String (e.g. Uniswap v2)
  logo: String (base64 encoded PNG)

  fee: Array (e.g. [100, 500, 3000, 10000]; available fee teirs on the exchange)
  slippage: Boolean (indicates if exchange has slippage)

  blockchains: String (e.g. ['ethereum'])
  [blockchain]: {
    router: Object (contains 'address' and 'api' to interact with the exchange router)
    factory: Object (contains 'address' and 'api' to interact with the exchange factory)
    pair: Object (contains 'api' to interact with an exchange pair)
    quoter: Object (contains 'address' and 'api' to interact with the exchange quoter)
  }
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

- Pass `amountOutMin`. Swap will return at least `amountOutMin` into the wallet. `amountIn` will be calculated automatically and can vary.
- Pass `amountOut`. Swap will take at max `amountInMax` out of the wallet (calculated based on provided `amountOut`). `amountInMax` will be calculated automatically and can vary.
- Pass `amountInMax`. Swap will take at max `amountInMax` out of the wallet. `amountOut` will be calculated automatically and can vary.
- Pass `amountIn`. Swap will return at least `amountOutMin` into the the wallet (calculated based on provided `amountIn`). `amountOutMin` will be calculated automatically and can vary.

### Route

Routes are returned by calling `route` on `Exchanges` or a single `exchange`.

A single `Route` has the following structure:

```
{
  tokenIn: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  tokenOut: String (e.g. '0xdAC17F958D2ee523a2206206994597C13D831ec7')
  path: Array (e.g. ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xdAC17F958D2ee523a2206206994597C13D831ec7'])
  pools: Object ([{ pool }])
  amountIn: BigNumber (e.g. '1000000000000000000')
  amountOutMin: BigNumber (e.g. '32000000000000000000')
  amountOut: BigNumber (e.g. '32000000000000000000')
  amountInMax: BigNumber (e.g. '1000000000000000000')
  exchange: Exchange (see [Exchange data structure](#exchange))
  getPrep: async function (returns transaction object for approvals or signature request for permit2)
  getTransaction: async function (returns transaction object –> see @depay/web3-wallets for details)
}
```

See [@depay/web3-wallets](https://github.com/DePayFi/@depay/web3-wallets#sendtransaction) for details about the transaction format.

## Slippage

This library applies slippage strategies to amounts for the following combinations:

- If `amountOutMin` is provided, slippage is applied to `amountIn`.
- If `amountOut` is provided, slippage is applied to `amountInMax`.
- If `amountInMax` is provided, slippage is applied to `amountOut`.
- If `amountIn` is provided, slippage is applied to `amountOutMax`.

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

### Access exchange directly

```javascript
import Exchanges from '@depay/web3-exchanges'

Exchanges.uniswap_v2

```

### Access exchange scoped for a given blockchain

```javascript
import Exchanges from '@depay/web3-exchanges'

Exchanges.arbitrum.uniswap_v3
```

### route: Routes a Swap configuration and returns routes to perform the Swap

```javascript
import Exchanges from '@depay/web3-exchanges'

let routes = Exchanges.route({
  blockchain: 'ethereum'
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountOutMin: 2
})
```

`route` can also be called on an exchange: 

```javascript
import Exchanges from '@depay/web3-exchanges'

let route = await Exchanges.ethereum.uniswap_v2.route({
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1
})
```

## Development

```
yarn install
yarn dev
```
