import 'regenerator-runtime/runtime'
global.crypto = new (require('@peculiar/webcrypto').Crypto)()
global.fetch = require('cross-fetch')
global.XMLHttpRequest = require('xhr2')
global.location = {}
