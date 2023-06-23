import all from './all'

export default ({ blockchain, name }) => {
  if(blockchain) {
    return all[blockchain].find((exchange) => {
      return exchange.name === name || exchange.alternativeNames.includes(name)
    })
  } else {
    return all.find((exchange) => {
      return exchange.name === name || exchange.alternativeNames.includes(name)
    })
  }
}

