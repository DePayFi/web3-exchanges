## Quickstart

```
yarn add depay-decentralized-exchanges
```

or 

```
npm install --save depay-decentralized-exchanges
```

```javascript
import { DEX } from 'depay-decentralized-exchanges'

DEX.all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

DEX.findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
```

## Support

This library supports the following decentralized exchanges:

- [Uniswap v3](https://uniswap.org)
- [Uniswap v2](https://uniswap.org)
- [PancakeSwap v2](https://pancakeswap.info)
- [SushiSwap](https://sushi.com)
- [Curve](https://curve.fi)

## Data Structure

Decentralized exchange data is provided in the following structure:

```
{
  name: String,
  alternativeNames: Array,
  label: String,
  logo: String (base64 encoded PNG)
}
```

## Functionalities

### all: Retreive all information for all blockchains

```javascript
import { DEX } from 'depay-decentralized-exchanges'

DEX.all
// [
//   { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }
//   { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
//   ...
// ]

```

### findByName: Get decentralized exchanged by name (name usually contains version, too)

```javascript
import { DEX } from 'depay-decentralized-exchanges'

DEX.findByName('uniswap_v3')
// { name: 'uniswap_v3', label: 'Uniswap v3', logo: '...' }

DEX.findByName('pancakeswap_v2')
// { name: 'pancakeswap_v2', label: 'PancakeSwap v2', logo: '...' }
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
