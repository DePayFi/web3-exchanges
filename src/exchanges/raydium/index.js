import basics from './basics'
import Exchange from '../../classes/Exchange'
import route from './route'
import { getAmountIn } from './route/amounts'

export default new Exchange(
  Object.assign(basics, { route, getAmountIn })
)

