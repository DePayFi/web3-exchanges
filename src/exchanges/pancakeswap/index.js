import basics from './basics'
import route from './route'
import Exchange from '../../classes/Exchange'

export default new Exchange(
  Object.assign(basics, { route })
)
