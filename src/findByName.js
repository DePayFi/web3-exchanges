import all from './all'

export default (name) => {
  return all.find((exchange) => {
    return exchange.name == name || exchange.alternativeNames.includes(name)
  })
}
