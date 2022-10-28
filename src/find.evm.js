import all from './all.evm'

export default (blockchain, name) => {
  return all[blockchain].find((exchange) => {
    return exchange.name == name || exchange.alternativeNames.includes(name)
  })
}

