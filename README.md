## Quickstart

```
yarn add depay-decentralized-exchanges
```

or 

```
npm install --save depay-decentralized-exchanges
```

```javascript
import { all, findByName, route } from 'depay-decentralized-exchanges'

all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

let exchange = findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }

let routes = await route({
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  to: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  amountIn: 1,
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
}) // returns routes sorted by cost-effectiveness (best first)

await routes[0].transaction.submit()
// opens metamask to sign the swap
```

## Support

This library supports the following decentralized exchanges:

- [Uniswap v2](https://uniswap.org)

soon:
- [PancakeSwap v2](https://pancakeswap.info)
- [Uniswap v3](https://uniswap.org)
- [SushiSwap](https://sushi.com)
- [Curve](https://curve.fi)

## Data Structure

### Exchange

Decentralized exchange data is provided in the following structure:

```
{
  name: String (e.g. uniswap_v2)
  alternativeNames: Array (e.g. ['pancake'])
  label: String (e.g. Uniswap v2)
  logo: String (base64 encoded PNG)
}
```

### Swap

A Swap configuration is fed into the `route` function:

```
{
  tokenIn: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  tokenOut: String (e.g. '0xdAC17F958D2ee523a2206206994597C13D831ec7')
  amountIn: Number (e.g. 1)
  amountInMax: Number (e.g. 1)
  amountOut: Number (e.g. 32)
  amountOutMin: Number (e.g. 32)
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  to: '0x5Af489c8786A018EC4814194dC8048be1007e390'
}
```

The following combinations of provided amounts are possible:

- Only `amountIn`, `amountOutMin` will be calculated automatically
- Only `amountOut`, `amountInMax` will be calculated automatically
- `amountIn` and `amountOutMax` (routing will stick to both)
- `amountOut` and `amountInMin` (routing will stick to both)


### Route

A Route is provided by `route` in the following structure:

```
{
  tokenIn: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  tokenOut: String (e.g. '0xdAC17F958D2ee523a2206206994597C13D831ec7')
  path: Array (e.g. ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xdAC17F958D2ee523a2206206994597C13D831ec7'])
  amountIn: BigNumber (e.g. '1000000000000000000')
  amountOutMin: BigNumber (e.g. '32000000000000000000')
  amountOut: BigNumber (e.g. '32000000000000000000')
  amountInMax: BigNumber (e.g. '1000000000000000000')
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  to: '0x5Af489c8786A018EC4814194dC8048be1007e390'
  transaction: Transaction (from the depay-blockchain-token library)
  exchange: Exchange (see Exchange data structure)
}
```

## Functionalities

### all: Stores all information for all decentralized exchanges

```javascript
import { all } from 'depay-decentralized-exchanges'

all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

```

### findByName: Get decentralized exchanged by name (name usually contains version, too)

```javascript
import { findByName } from 'depay-decentralized-exchanges'

findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }

findByName('pancakeswap_v2')
// { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
```

### route: Routes a Swap configuration and returns routes to perform the Swap

```javascript
import { route } from 'depay-decentralized-exchanges'

let routes = route {
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1,
  amountOutMin: 2,
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  to: '0x5Af489c8786A018EC4814194dC8048be1007e390'
} // returns routes sorted by cost-effectiveness (best first)

await routes[0].transaction.submit()
```

`route` can also be called on concrete exchanges: 

```javascript
import { findByName } from 'depay-decentralized-exchanges'

let exchange = findByName('uniswap_v2')

let route = await exchange.route({
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  amountIn: 1,
  amountOutMin: 2,
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  to: '0x5Af489c8786A018EC4814194dC8048be1007e390'
})

await route.transaction.submit()
```

## Development

### Get started

```
yarn install
yarn start
```

### Release

```
npm publish
```
