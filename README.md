## Quickstart

```
yarn add depay-web3-exchanges
```

or 

```
npm install --save depay-web3-exchanges
```

```javascript
import { all, findByName, route } from 'depay-web3-exchanges'

all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

let exchange = findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }

let routes = await route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1,
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  toAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
}) // returns routes sorted by cost-effectiveness (best first)

// use connected wallet to sign and send the swap transaction
import { getWallet } from 'depay-web3-wallets'

let wallet = getWallet()

wallet.sendTransaction(route.transaction)

```

## Support

This library supports the following blockchains:

- [Ethereum](https://ethereum.org)
- [Binance Smart Chain](https://www.binance.org/en/smartChain)

This library supports the following decentralized exchanges:

- [Uniswap v2](https://uniswap.org)
- [PancakeSwap v2](https://pancakeswap.info)

Soon:
- [Uniswap v3](https://uniswap.org)
- [SushiSwap](https://sushi.com)
- [Curve](https://curve.fi)

## Data Structures

### Exchange

Decentralized exchange data is provided in the following structure:

```
{
  blockchain: String (e.g. ethereum)
  name: String (e.g. uniswap_v2)
  alternativeNames: Array (e.g. ['pancake'])
  label: String (e.g. Uniswap v2)
  logo: String (base64 encoded PNG),
  contracts: Object (contains important contract addresses and apis to interact with the exchange)
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
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  toAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
}
```

The following combinations of provided amounts are possible:

- Only `amountIn`, `amountOutMin` will be calculated automatically and can vary
- Only `amountOut`, `amountInMax` will be calculated automatically and can vary
- Only `amountInMax`, `amountOut` will be calculated automatically and can vary
- Only `amountOutMin`, `amountIn` will be calculated automatically and can vary
- `amountIn` and `amountOutMax` (routing will stick to both)
- `amountOut` and `amountInMin` (routing will stick to both)


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
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  toAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  transaction: Transaction (see depay-web3-wallets for details)
  exchange: Exchange (see [Exchange data structure](#exchange))
}
```

See [depay-web3-wallets](https://github.com/DePayFi/depay-web3-wallets#sendtransaction) for details about the transaction format.

## Functionalities

### all: Stores all information for all decentralized exchanges

```javascript
import { all } from 'depay-web3-exchanges'

all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

```

### findByName: Get decentralized exchanged by name (name usually contains version, too)

```javascript
import { findByName } from 'depay-web3-exchanges'

findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }

findByName('pancakeswap_v2')
// { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
```

### route: Routes a Swap configuration and returns routes to perform the Swap

```javascript
import { route } from 'depay-web3-exchanges'

let routes = route {
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1,
  amountOutMin: 2,
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  toAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
} // returns routes sorted by cost-effectiveness (best first)

// use connected wallet to sign and send the swap transaction
import { getWallet } from 'depay-web3-wallets'

let wallet = getWallet()

wallet.sendTransaction(routes[0].transaction)
```

`route` can also be called on concrete exchanges: 

```javascript
import { findByName } from 'depay-web3-exchanges'

let exchange = findByName('uniswap_v2')

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1,
  amountOutMin: 2,
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  toAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390'
})

// use connected wallet to sign and send the swap transaction
import { getWallet } from 'depay-web3-wallets'

let wallet = getWallet()

wallet.sendTransaction(route.transaction)
```

## Domain Knowledge

### Wrapped native tokens (like WETH)

In case you select to swap the wrapped native token to the native token or vise versa,
this library will actually suggest to wrap/unwrap instead of going through an exchange.

## Development

### Get started

```
yarn install
yarn dev
```

### Release

```
npm publish
```
