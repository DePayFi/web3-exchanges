(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@depay/solana-web3.js'), require('@depay/web3-blockchains'), require('ethers'), require('decimal.js')) :
  typeof define === 'function' && define.amd ? define(['@depay/solana-web3.js', '@depay/web3-blockchains', 'ethers', 'decimal.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Web3Exchanges = factory(global.SolanaWeb3js, global.Web3Blockchains, global.ethers, global.Decimal));
}(this, (function (solanaWeb3_js, Blockchains, ethers, Decimal$1) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Blockchains__default = /*#__PURE__*/_interopDefaultLegacy(Blockchains);
  var Decimal__default = /*#__PURE__*/_interopDefaultLegacy(Decimal$1);

  let _window;

  let getWindow = () => {
    if(_window) { return _window }
    if (typeof global == 'object') {
      _window = global;
    } else {
      _window = window;
    }
    return _window
  };

  const getConfiguration = () =>{
    if(getWindow()._Web3ClientConfiguration === undefined) {
      getWindow()._Web3ClientConfiguration = {};
    }
    return getWindow()._Web3ClientConfiguration
  };

  function _optionalChain$5$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const BATCH_INTERVAL$1 = 10;
  const CHUNK_SIZE$1 = 50;
  const MAX_RETRY$1 = 5;

  class StaticJsonRpcBatchProvider extends ethers.ethers.providers.JsonRpcProvider {

    constructor(url, network, endpoints, failover) {
      super(url);
      this._network = network;
      this._endpoint = url;
      this._endpoints = endpoints;
      this._failover = failover;
      this._pendingBatch = [];
    }

    handleError(error, attempt, chunk) {
      if(attempt < MAX_RETRY$1 && error) {
        const index = this._endpoints.indexOf(this._endpoint)+1;
        this._failover();
        this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
        this.requestChunk(chunk, this._endpoint, attempt+1);
      } else {
        chunk.forEach((inflightRequest) => {
          inflightRequest.reject(error);
        });
      }
    }

    detectNetwork() {
      return Promise.resolve(Blockchains__default['default'].findByName(this._network).id)
    }

    batchRequest(batch, attempt) {
      return new Promise((resolve, reject) => {
        
        if (batch.length === 0) resolve([]); // Do nothing if requests is empty

        fetch(
          this._endpoint,
          {
            method: 'POST',
            body: JSON.stringify(batch),
            headers: { 'Content-Type': 'application/json' },
            signal: _optionalChain$5$1([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(10000) : undefined  // 10-second timeout
          }
        ).then((response)=>{
          if(response.ok) {
            response.json().then((parsedJson)=>{
              if(parsedJson.find((entry)=>{
                return _optionalChain$5$1([entry, 'optionalAccess', _2 => _2.error]) && [-32062,-32016].includes(_optionalChain$5$1([entry, 'optionalAccess', _3 => _3.error, 'optionalAccess', _4 => _4.code]))
              })) {
                if(attempt < MAX_RETRY$1) {
                  reject('Error in batch found!');
                } else {
                  resolve(parsedJson);
                }
              } else {
                resolve(parsedJson);
              }
            }).catch(reject);
          } else {
            reject(`${response.status} ${response.text}`);
          }
        }).catch(reject);
      })
    }

    requestChunk(chunk, endpoint, attempt) {

      const batch = chunk.map((inflight) => inflight.request);

      try {
        return this.batchRequest(batch, attempt)
          .then((result) => {
            // For each result, feed it to the correct Promise, depending
            // on whether it was a success or error
            chunk.forEach((inflightRequest, index) => {
              const payload = result[index];
              if (_optionalChain$5$1([payload, 'optionalAccess', _5 => _5.error])) {
                const error = new Error(payload.error.message);
                error.code = payload.error.code;
                error.data = payload.error.data;
                inflightRequest.reject(error);
              } else if(_optionalChain$5$1([payload, 'optionalAccess', _6 => _6.result])) {
                inflightRequest.resolve(payload.result);
              } else {
                inflightRequest.reject();
              }
            });
          }).catch((error) => this.handleError(error, attempt, chunk))
      } catch (error){ this.handleError(error, attempt, chunk); }
    }
      
    send(method, params) {

      const request = {
        method: method,
        params: params,
        id: (this._nextId++),
        jsonrpc: "2.0"
      };

      if (this._pendingBatch == null) {
        this._pendingBatch = [];
      }

      const inflightRequest = { request, resolve: null, reject: null };

      const promise = new Promise((resolve, reject) => {
        inflightRequest.resolve = resolve;
        inflightRequest.reject = reject;
      });

      this._pendingBatch.push(inflightRequest);

      if (!this._pendingBatchAggregator) {
        // Schedule batch for next event loop + short duration
        this._pendingBatchAggregator = setTimeout(() => {
          // Get the current batch and clear it, so new requests
          // go into the next batch
          const batch = this._pendingBatch;
          this._pendingBatch = [];
          this._pendingBatchAggregator = null;
          // Prepare Chunks of CHUNK_SIZE
          const chunks = [];
          for (let i = 0; i < Math.ceil(batch.length / CHUNK_SIZE$1); i++) {
            chunks[i] = batch.slice(i*CHUNK_SIZE$1, (i+1)*CHUNK_SIZE$1);
          }
          chunks.forEach((chunk)=>{
            // Get the request as an array of requests
            chunk.map((inflight) => inflight.request);
            return this.requestChunk(chunk, this._endpoint, 1)
          });
        }, getConfiguration().batchInterval || BATCH_INTERVAL$1);
      }

      return promise
    }

  }

  function _optionalChain$4$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const getAllProviders$1 = ()=> {
    if(getWindow()._Web3ClientProviders == undefined) {
      getWindow()._Web3ClientProviders = {};
    }
    return getWindow()._Web3ClientProviders
  };

  const setProvider$2 = (blockchain, provider)=> {
    if(provider == undefined) { return }
    if(getAllProviders$1()[blockchain] === undefined) { getAllProviders$1()[blockchain] = []; }
    const index = getAllProviders$1()[blockchain].indexOf(provider);
    if(index > -1) {
      getAllProviders$1()[blockchain].splice(index, 1);
    }
    getAllProviders$1()[blockchain].unshift(provider);
  };

  const setProviderEndpoints$2 = async (blockchain, endpoints, detectFastest = true)=> {
    
    getAllProviders$1()[blockchain] = endpoints.map((endpoint, index)=>
      new StaticJsonRpcBatchProvider(endpoint, blockchain, endpoints, ()=>{
        if(getAllProviders$1()[blockchain].length === 1) {
          setProviderEndpoints$2(blockchain, endpoints, detectFastest);
        } else {
          getAllProviders$1()[blockchain].splice(index, 1);
        }
      })
    );
    
    let provider;
    let window = getWindow();

    if(
      window.fetch == undefined ||
      (typeof process != 'undefined' && process['env'] && process['env']['NODE_ENV'] == 'test') ||
      (typeof window.cy != 'undefined') ||
      detectFastest === false
    ) {
      provider = getAllProviders$1()[blockchain][0];
    } else {
      
      let responseTimes = await Promise.all(endpoints.map((endpoint)=>{
        return new Promise(async (resolve)=>{
          let timeout = 900;
          let before = new Date().getTime();
          setTimeout(()=>resolve(timeout), timeout);
          let response;
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              referrer: "",
              referrerPolicy: "no-referrer",
              body: JSON.stringify({ method: 'net_version', id: 1, jsonrpc: '2.0' }),
              signal: _optionalChain$4$2([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(10000) : undefined  // 10-second timeout
            });
          } catch (e) {}
          if(!_optionalChain$4$2([response, 'optionalAccess', _2 => _2.ok])) { return resolve(999) }
          let after = new Date().getTime();
          resolve(after-before);
        })
      }));

      const fastestResponse = Math.min(...responseTimes);
      const fastestIndex = responseTimes.indexOf(fastestResponse);
      provider = getAllProviders$1()[blockchain][fastestIndex];
    }
    
    setProvider$2(blockchain, provider);
  };

  const getProvider$2 = async (blockchain)=> {

    let providers = getAllProviders$1();
    if(providers && providers[blockchain]){ return providers[blockchain][0] }
    
    let window = getWindow();
    if(window._Web3ClientGetProviderPromise && window._Web3ClientGetProviderPromise[blockchain]) { return await window._Web3ClientGetProviderPromise[blockchain] }

    if(!window._Web3ClientGetProviderPromise){ window._Web3ClientGetProviderPromise = {}; }
    window._Web3ClientGetProviderPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$2(blockchain, Blockchains__default['default'][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain][0]);
    });

    return await window._Web3ClientGetProviderPromise[blockchain]
  };

  const getProviders$2 = async(blockchain)=>{

    let providers = getAllProviders$1();
    if(providers && providers[blockchain]){ return providers[blockchain] }
    
    let window = getWindow();
    if(window._Web3ClientGetProvidersPromise && window._Web3ClientGetProvidersPromise[blockchain]) { return await window._Web3ClientGetProvidersPromise[blockchain] }

    if(!window._Web3ClientGetProvidersPromise){ window._Web3ClientGetProvidersPromise = {}; }
    window._Web3ClientGetProvidersPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$2(blockchain, Blockchains__default['default'][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain]);
    });

    return await window._Web3ClientGetProvidersPromise[blockchain]
  };

  var EVM = {
    getProvider: getProvider$2,
    getProviders: getProviders$2,
    setProviderEndpoints: setProviderEndpoints$2,
    setProvider: setProvider$2,
  };

  function _optionalChain$3$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const BATCH_INTERVAL = 10;
  const CHUNK_SIZE = 25;
  const MAX_RETRY = 10;

  class StaticJsonRpcSequentialProvider extends solanaWeb3_js.Connection {

    constructor(url, network, endpoints, failover) {
      super(url);
      this._provider = new solanaWeb3_js.Connection(url);
      this._network = network;
      this._endpoint = url;
      this._endpoints = endpoints;
      this._failover = failover;
      this._pendingBatch = [];
      this._rpcRequest = this._rpcRequestReplacement.bind(this);
    }

    handleError(error, attempt, chunk) {
      if(attempt < MAX_RETRY) {
        const index = this._endpoints.indexOf(this._endpoint)+1;
        this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
        this._provider = new solanaWeb3_js.Connection(this._endpoint);
        this.requestChunk(chunk, attempt+1);
      } else {
        chunk.forEach((inflightRequest) => {
          inflightRequest.reject(error);
        });
      }
    }

    batchRequest(requests, attempt) {
      return new Promise((resolve, reject) => {
        if (requests.length === 0) resolve([]); // Do nothing if requests is empty

        const batch = requests.map(params => {
          return this._rpcClient.request(params.methodName, params.args)
        });

        fetch(
          this._endpoint,
          {
            method: 'POST',
            body: JSON.stringify(batch),
            headers: { 'Content-Type': 'application/json' },
            signal: _optionalChain$3$2([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(60000) : undefined  // 60-second timeout
          }
        ).then((response)=>{
          if(response.ok) {
            response.json().then((parsedJson)=>{
              if(parsedJson.find((entry)=>_optionalChain$3$2([entry, 'optionalAccess', _2 => _2.error]))) {
                if(attempt < MAX_RETRY) {
                  reject('Error in batch found!');
                } else {
                  resolve(parsedJson);
                }
              } else {
                resolve(parsedJson);
              }
            }).catch(reject);
          } else {
            reject(`${response.status} ${response.text}`);
          }
        }).catch(reject);
      })
    }

    requestChunk(chunk, attempt) {

      const batch = chunk.map((inflight) => inflight.request);

      try {
        return this.batchRequest(batch, attempt)
          .then((result) => {
            chunk.forEach((inflightRequest, index) => {
              const payload = result[index];
              if (_optionalChain$3$2([payload, 'optionalAccess', _3 => _3.error])) {
                const error = new Error(payload.error.message);
                error.code = payload.error.code;
                error.data = payload.error.data;
                inflightRequest.reject(error);
              } else if(payload) {
                inflightRequest.resolve(payload);
              } else {
                inflightRequest.reject();
              }
            });
          }).catch((error)=>this.handleError(error, attempt, chunk))
      } catch (error){ return this.handleError(error, attempt, chunk) }
    }
      
    _rpcRequestReplacement(methodName, args) {

      const request = { methodName, args };

      if (this._pendingBatch == null) {
        this._pendingBatch = [];
      }

      const inflightRequest = { request, resolve: null, reject: null };

      const promise = new Promise((resolve, reject) => {
        inflightRequest.resolve = resolve;
        inflightRequest.reject = reject;
      });

      this._pendingBatch.push(inflightRequest);

      if (!this._pendingBatchAggregator) {
        // Schedule batch for next event loop + short duration
        this._pendingBatchAggregator = setTimeout(() => {
          // Get the current batch and clear it, so new requests
          // go into the next batch
          const batch = this._pendingBatch;
          this._pendingBatch = [];
          this._pendingBatchAggregator = null;
          // Prepare Chunks of CHUNK_SIZE
          const chunks = [];
          for (let i = 0; i < Math.ceil(batch.length / CHUNK_SIZE); i++) {
            chunks[i] = batch.slice(i*CHUNK_SIZE, (i+1)*CHUNK_SIZE);
          }
          chunks.forEach((chunk)=>{
            // Get the request as an array of requests
            chunk.map((inflight) => inflight.request);
            return this.requestChunk(chunk, 1)
          });
        }, getConfiguration().batchInterval || BATCH_INTERVAL);
      }

      return promise
    }
  }

  function _optionalChain$2$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const getAllProviders = ()=> {
    if(getWindow()._Web3ClientProviders == undefined) {
      getWindow()._Web3ClientProviders = {};
    }
    return getWindow()._Web3ClientProviders
  };

  const setProvider$1 = (blockchain, provider)=> {
    if(provider == undefined) { return }
    if(getAllProviders()[blockchain] === undefined) { getAllProviders()[blockchain] = []; }
    const index = getAllProviders()[blockchain].indexOf(provider);
    if(index > -1) {
      getAllProviders()[blockchain].splice(index, 1);
    }
    getAllProviders()[blockchain].unshift(provider);
  };

  const setProviderEndpoints$1 = async (blockchain, endpoints, detectFastest = true)=> {
    
    getAllProviders()[blockchain] = endpoints.map((endpoint, index)=>
      new StaticJsonRpcSequentialProvider(endpoint, blockchain, endpoints, ()=>{
        if(getAllProviders()[blockchain].length === 1) {
          setProviderEndpoints$1(blockchain, endpoints, detectFastest);
        } else {
          getAllProviders()[blockchain].splice(index, 1);
        }
      })
    );

    let provider;
    let window = getWindow();

    if(
      window.fetch == undefined ||
      (typeof process != 'undefined' && process['env'] && process['env']['NODE_ENV'] == 'test') ||
      (typeof window.cy != 'undefined') ||
      detectFastest === false
    ) {
      provider = getAllProviders()[blockchain][0];
    } else {
      
      let responseTimes = await Promise.all(endpoints.map((endpoint)=>{
        return new Promise(async (resolve)=>{
          let timeout = 900;
          let before = new Date().getTime();
          setTimeout(()=>resolve(timeout), timeout);
          let response;
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              referrer: "",
              referrerPolicy: "no-referrer",
              body: JSON.stringify({ method: 'getIdentity', id: 1, jsonrpc: '2.0' }),
              signal: _optionalChain$2$2([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(60000) : undefined  // 60-second timeout
            });
          } catch (e) {}
          if(!_optionalChain$2$2([response, 'optionalAccess', _2 => _2.ok])) { return resolve(999) }
          let after = new Date().getTime();
          resolve(after-before);
        })
      }));

      const fastestResponse = Math.min(...responseTimes);
      const fastestIndex = responseTimes.indexOf(fastestResponse);
      provider = getAllProviders()[blockchain][fastestIndex];
    }
    
    setProvider$1(blockchain, provider);
  };

  const getProvider$1 = async (blockchain)=> {

    let providers = getAllProviders();
    if(providers && providers[blockchain]){ return providers[blockchain][0] }
    
    let window = getWindow();
    if(window._Web3ClientGetProviderPromise && window._Web3ClientGetProviderPromise[blockchain]) { return await window._Web3ClientGetProviderPromise[blockchain] }

    if(!window._Web3ClientGetProviderPromise){ window._Web3ClientGetProviderPromise = {}; }
    window._Web3ClientGetProviderPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$1(blockchain, Blockchains__default['default'][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain][0]);
    });

    return await window._Web3ClientGetProviderPromise[blockchain]
  };

  const getProviders$1 = async(blockchain)=>{

    let providers = getAllProviders();
    if(providers && providers[blockchain]){ return providers[blockchain] }
    
    let window = getWindow();
    if(window._Web3ClientGetProvidersPromise && window._Web3ClientGetProvidersPromise[blockchain]) { return await window._Web3ClientGetProvidersPromise[blockchain] }

    if(!window._Web3ClientGetProvidersPromise){ window._Web3ClientGetProvidersPromise = {}; }
    window._Web3ClientGetProvidersPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$1(blockchain, Blockchains__default['default'][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain]);
    });

    return await window._Web3ClientGetProvidersPromise[blockchain]
  };

  var Solana = {
    getProvider: getProvider$1,
    getProviders: getProviders$1,
    setProviderEndpoints: setProviderEndpoints$1,
    setProvider: setProvider$1,
  };

  let supported$2 = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported$2.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported$2.svm = ['solana'];

  function _optionalChain$1$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  let getCacheStore = () => {
    if (getWindow()._Web3ClientCacheStore == undefined) {
      getWindow()._Web3ClientCacheStore = {};
    }
    return getWindow()._Web3ClientCacheStore
  };

  let getPromiseStore = () => {
    if (getWindow()._Web3ClientPromiseStore == undefined) {
      getWindow()._Web3ClientPromiseStore = {};
    }
    return getWindow()._Web3ClientPromiseStore
  };

  let set = function ({ key, value, expires }) {
    getCacheStore()[key] = {
      expiresAt: Date.now() + expires,
      value,
    };
  };

  let get = function ({ key, expires }) {
    let cachedEntry = getCacheStore()[key];
    if (_optionalChain$1$2([cachedEntry, 'optionalAccess', _ => _.expiresAt]) > Date.now()) {
      return cachedEntry.value
    }
  };

  let getPromise = function({ key }) {
    return getPromiseStore()[key]
  };

  let setPromise = function({ key, promise }) {
    getPromiseStore()[key] = promise;
    return promise
  };

  let deletePromise = function({ key }) {
    getPromiseStore()[key] = undefined; 
  };

  let cache = function ({ call, key, expires = 0 }) {
    return new Promise((resolve, reject)=>{
      let value;
      key = JSON.stringify(key);
      
      // get existing promise (of a previous pending request asking for the exact same thing)
      let existingPromise = getPromise({ key });
      if(existingPromise) { 
        return existingPromise
          .then(resolve)
          .catch(reject)
      }

      setPromise({ key, promise: new Promise((resolveQueue, rejectQueue)=>{
        if (expires === 0) {
          return call()
            .then((value)=>{
              resolve(value);
              resolveQueue(value);
            })
            .catch((error)=>{
              reject(error);
              rejectQueue(error);
            })
        }
        
        // get cached value
        value = get({ key, expires });
        if (value) {
          resolve(value);
          resolveQueue(value);
          return value
        }

        // set new cache value
        call()
          .then((value)=>{
            if (value) {
              set({ key, value, expires });
            }
            resolve(value);
            resolveQueue(value);
          })
          .catch((error)=>{
            reject(error);
            rejectQueue(error);
          });
        })
      }).then(()=>{
        deletePromise({ key });
      }).catch(()=>{
        deletePromise({ key });
      });
    })
  };

  // Periodically clean up expired cache entries (every 5 minutes), to prevent memory leaks
  if (typeof process == 'undefined' || process.env && "production" === 'test') {
    setInterval(() => {
      const store = getCacheStore();
      const now = Date.now();
      for (const key in store) {
        if (store[key].expiresAt < now) {
          delete store[key];
        }
      }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
  }

  const getProvider = async (blockchain)=>{

    if(supported$2.evm.includes(blockchain)) {


      return await EVM.getProvider(blockchain)


    } else if(supported$2.svm.includes(blockchain)) {


      return await Solana.getProvider(blockchain)


    } else {
      throw 'Unknown blockchain: ' + blockchain
    }
  };

  let paramsToContractArgs = ({ contract, method, params }) => {
    let fragment = contract.interface.fragments.find((fragment) => {
      return fragment.name == method
    });

    return fragment.inputs.map((input, index) => {
      if (Array.isArray(params)) {
        return params[index]
      } else {
        return params[input.name]
      }
    })
  };

  const contractCall = ({ address, api, method, params, provider, block }) => {
    const contract = new ethers.ethers.Contract(address, api, provider);
    const args = paramsToContractArgs({ contract, method, params });
    const fragment = contract.interface.fragments.find((fragment)=>fragment.name === method);
    if(contract[method] === undefined) {
      method = `${method}(${fragment.inputs.map((input)=>input.type).join(',')})`;
    }
    if(fragment && fragment.stateMutability === 'nonpayable') {
      return contract.callStatic[method](...args, { blockTag: block })
    } else {
      return contract[method](...args, { blockTag: block })
    }
  };

  const balance$1 = ({ address, provider }) => {
    return provider.getBalance(address)
  };

  const transactionCount = ({ address, provider }) => {
    return provider.getTransactionCount(address)
  };

  const singleRequest$1 = ({ blockchain, address, api, method, params, block, provider }) =>{
    if (api) {
      return contractCall({ address, api, method, params, provider, block })
    } else if (method === 'latestBlockNumber') {
      return provider.getBlockNumber()
    } else if (method === 'balance') {
      return balance$1({ address, provider })
    } else if (method === 'transactionCount') {
      return transactionCount({ address, provider })
    }
  };

  var requestEVM = async ({ blockchain, address, api, method, params, block, timeout, strategy }) => {

    strategy = strategy ? strategy : (getConfiguration().strategy || 'failover');
    timeout = timeout ? timeout : (getConfiguration().timeout || undefined);

    if(strategy === 'fastest') {

      const providers = await EVM.getProviders(blockchain);
      
      let allRequestsFailed = [];

      const allRequestsInParallel = providers.map((provider)=>{
        return new Promise((resolve)=>{
          allRequestsFailed.push(
            singleRequest$1({ blockchain, address, api, method, params, block, provider }).then(resolve)
          );
        })
      });
      
      const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout || 10000));

      allRequestsFailed = Promise.all(allRequestsFailed.map((request)=>{
        return new Promise((resolve)=>{ request.catch(resolve); })
      })).then(()=>{ return });

      return Promise.race([...allRequestsInParallel, timeoutPromise, allRequestsFailed])

    } else { // failover

      const provider = await EVM.getProvider(blockchain);
      const request = singleRequest$1({ blockchain, address, api, method, params, block, provider });
      
      if(timeout) {
        timeout = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout));
        return Promise.race([request, timeout])
      } else {
        return request
      }
    }
  };

  const accountInfo = async ({ address, api, method, params, provider, block }) => {
    const info = await provider.getAccountInfo(new solanaWeb3_js.PublicKey(address));
    if(!info || !info.data) { return }
    return api.decode(info.data)
  };

  const balance = ({ address, provider }) => {
    return provider.getBalance(new solanaWeb3_js.PublicKey(address))
  };

  const singleRequest = async({ blockchain, address, api, method, params, block, provider, providers })=> {

    try {

      if(method == undefined || method === 'getAccountInfo') {
        if(api == undefined) {
          api = solanaWeb3_js.ACCOUNT_LAYOUT; 
        }
        return await accountInfo({ address, api, method, params, provider, block })
      } else if(method === 'getProgramAccounts') {
        return await provider.getProgramAccounts(new solanaWeb3_js.PublicKey(address), params).then((accounts)=>{
          if(api){
            return accounts.map((account)=>{
              account.data = api.decode(account.account.data);
              return account
            })
          } else {
            return accounts
          }
        })
      } else if(method === 'getTokenAccountBalance') {
        return await provider.getTokenAccountBalance(new solanaWeb3_js.PublicKey(address))
      } else if (method === 'latestBlockNumber') {
        return await provider.getSlot(params ? params : undefined)
      } else if (method === 'balance') {
        return await balance({ address, provider })
      }

    } catch (error){
      if(providers && error && [
        'Failed to fetch', 'limit reached', '504', '503', '502', '500', '429', '426', '422', '413', '409', '408', '406', '405', '404', '403', '402', '401', '400'
      ].some((errorType)=>error.toString().match(errorType))) {
        let nextProvider = providers[providers.indexOf(provider)+1] || providers[0];
        return singleRequest({ blockchain, address, api, method, params, block, provider: nextProvider, providers })
      } else {
        throw error
      }
    }
  };

  var requestSolana = async ({ blockchain, address, api, method, params, block, timeout, strategy }) => {

    strategy = strategy ? strategy : (getConfiguration().strategy || 'failover');
    timeout = timeout ? timeout : (getConfiguration().timeout || undefined);

    const providers = await Solana.getProviders(blockchain);

    if(strategy === 'fastest') {

      let allRequestsFailed = [];

      const allRequestsInParallel = providers.map((provider)=>{
        return new Promise((resolve)=>{
          allRequestsFailed.push(
            singleRequest({ blockchain, address, api, method, params, block, provider }).then(resolve)
          );
        })
      });
      
      const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout || 60000)); // 60s default timeout

      allRequestsFailed = Promise.all(allRequestsFailed.map((request)=>{
        return new Promise((resolve)=>{ request.catch(resolve); })
      })).then(()=>{ return });

      return Promise.race([...allRequestsInParallel, timeoutPromise, allRequestsFailed])

    } else { // failover

      const provider = await Solana.getProvider(blockchain);
      const request = singleRequest({ blockchain, address, api, method, params, block, provider, providers });

      if(timeout) {
        timeout = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout));
        return Promise.race([request, timeout])
      } else {
        return request
      }
    }
  };

  var parseUrl = (url) => {
    if (typeof url == 'object') {
      return url
    }
    let deconstructed = url.match(/(?<blockchain>\w+):\/\/(?<part1>[\w\d]+)(\/(?<part2>[\w\d]+)*)?/);

    if(deconstructed.groups.part2 == undefined) {
      if(deconstructed.groups.part1.match(/\d/)) {
        return {
          blockchain: deconstructed.groups.blockchain,
          address: deconstructed.groups.part1
        }
      } else {
        return {
          blockchain: deconstructed.groups.blockchain,
          method: deconstructed.groups.part1
        }
      }
    } else {
      return {
        blockchain: deconstructed.groups.blockchain,
        address: deconstructed.groups.part1,
        method: deconstructed.groups.part2
      }
    }
  };

  const request = async function (url, options) {
    
    const { blockchain, address, method } = parseUrl(url);
    const { api, params, cache: cache$1, block, timeout, strategy, cacheKey } = (typeof(url) == 'object' ? url : options) || {};

    return await cache({
      expires: cache$1 || 0,
      key: cacheKey || [blockchain, address, method, params, block],
      call: async()=>{
        if(supported$2.evm.includes(blockchain)) {


          return await requestEVM({ blockchain, address, api, method, params, block, strategy, timeout })


        } else if(supported$2.svm.includes(blockchain)) {


          return await requestSolana({ blockchain, address, api, method, params, block, strategy, timeout })


        } else {
          throw 'Unknown blockchain: ' + blockchain
        }  
      }
    })
  };

  var allowanceOnEVM = ({ blockchain, address, api, owner, spender })=>{
    return request(
      {
        blockchain,
        address,
        api,
        method: 'allowance',
        params: [owner, spender],
        // no cache for allowance!
      },
    )
  };

  var balanceOnEVM = async ({ blockchain, address, account, api, id })=>{
    if (address == Blockchains__default['default'][blockchain].currency.address) {
      return await request(
        {
          blockchain: blockchain,
          address: account,
          method: 'balance',
        },
      )
    } else {
      return await request(
        {
          blockchain: blockchain,
          address: address,
          method: 'balanceOf',
          api,
          params: id ? [account, id] : [account],
        },
      )
    }
  };

  var decimalsOnEVM = ({ blockchain, address, api })=>{
    return request({
      blockchain,
      address,
      api,
      method: 'decimals',
      cache: 86400000, // 1 day
    })
  };

  var ERC1155 = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "TransferBatch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "TransferSingle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "value",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "URI",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "accounts",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        }
      ],
      "name": "balanceOfBatch",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeBatchTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "uri",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  var ERC20 = [
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: '_spender', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: '_from', type: 'address' },
        { name: '_to', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'transferFrom',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: '_to', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { name: '_owner', type: 'address' },
        { name: '_spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    { payable: true, stateMutability: 'payable', type: 'fallback' },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'owner', type: 'address' },
        { indexed: true, name: 'spender', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'from', type: 'address' },
        { indexed: true, name: 'to', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' },
      ],
      name: 'Transfer',
      type: 'event',
    },
  ];

  var WETH$2 = [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "guy",
          "type": "address"
        },
        {
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "src",
          "type": "address"
        },
        {
          "name": "dst",
          "type": "address"
        },
        {
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "dst",
          "type": "address"
        },
        {
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        },
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "src",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "guy",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "src",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "dst",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "dst",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "src",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "wad",
          "type": "uint256"
        }
      ],
      "name": "Withdrawal",
      "type": "event"
    }
  ];

  const uriAPI = [{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

  const uriToName = (tokenURI)=>{
    return new Promise((resolve)=>{
      if(tokenURI.match(/^ipfs/)) {
        tokenURI = `https://ipfs.io/ipfs/${tokenURI.split('://')[1]}`;
      }
      fetch(tokenURI).then((response) => {
        if (response.ok) { return response.json() }
        resolve();
      })
      .then((responseJson) => {
        if(responseJson) {
          let name = responseJson.name;
          if(name){
            resolve(name);
          } else {
            resolve();
          }
        }
      }).catch(()=>resolve());
    })
  };

  var nameOnEVM = ({ blockchain, address, api, id })=>{

    if(id) {
      return new Promise((resolve)=>{
        request({ blockchain, address, api: uriAPI, method: 'uri', params: [id] }).then((uri)=>{
          uri = uri.match('0x{id}') ? uri.replace('0x{id}', id) : uri;
          uriToName(uri).then(resolve);
        }).catch((error)=>{
          console.log('error', error);
          resolve();
        });
      })
    } else {
      return request(
        {
          blockchain: blockchain,
          address: address,
          api,
          method: 'name',
          cache: 86400000, // 1 day
        },
      )
    }
  };

  var symbolOnEVM = ({ blockchain, address, api })=>{
    return request(
      {
        blockchain,
        address,
        api,
        method: 'symbol',
        cache: 86400000, // 1 day
      }
    )
  };

  const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const ASSOCIATED_TOKEN_PROGRAM = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

  function _optionalChain$4$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  var findProgramAddress = async ({ token, owner })=>{

    const [address] = await solanaWeb3_js.PublicKey.findProgramAddress(
      [
        (new solanaWeb3_js.PublicKey(owner)).toBuffer(),
        (new solanaWeb3_js.PublicKey(TOKEN_PROGRAM)).toBuffer(),
        (new solanaWeb3_js.PublicKey(token)).toBuffer()
      ],
      new solanaWeb3_js.PublicKey(ASSOCIATED_TOKEN_PROGRAM)
    );

    return _optionalChain$4$1([address, 'optionalAccess', _ => _.toString, 'call', _2 => _2()])
  };

  const MINT_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u32('mintAuthorityOption'),
    solanaWeb3_js.publicKey('mintAuthority'),
    solanaWeb3_js.u64('supply'),
    solanaWeb3_js.u8('decimals'),
    solanaWeb3_js.bool('isInitialized'),
    solanaWeb3_js.u32('freezeAuthorityOption'),
    solanaWeb3_js.publicKey('freezeAuthority')
  ]);

  const KEY_LAYOUT = solanaWeb3_js.rustEnum([
    solanaWeb3_js.struct([], 'uninitialized'),
    solanaWeb3_js.struct([], 'editionV1'),
    solanaWeb3_js.struct([], 'masterEditionV1'),
    solanaWeb3_js.struct([], 'reservationListV1'),
    solanaWeb3_js.struct([], 'metadataV1'),
    solanaWeb3_js.struct([], 'reservationListV2'),
    solanaWeb3_js.struct([], 'masterEditionV2'),
    solanaWeb3_js.struct([], 'editionMarker'),
  ]);

  const CREATOR_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.publicKey('address'),
    solanaWeb3_js.bool('verified'),
    solanaWeb3_js.u8('share'),
  ]);

  const DATA_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.str('name'),
    solanaWeb3_js.str('symbol'),
    solanaWeb3_js.str('uri'),
    solanaWeb3_js.u16('sellerFeeBasisPoints'),
    solanaWeb3_js.option(
      solanaWeb3_js.vec(
        CREATOR_LAYOUT.replicate('creators')
      ),
      'creators'
    )
  ]);

  const METADATA_LAYOUT = solanaWeb3_js.struct([
    KEY_LAYOUT.replicate('key'),
    solanaWeb3_js.publicKey('updateAuthority'),
    solanaWeb3_js.publicKey('mint'),
    DATA_LAYOUT.replicate('data'),
    solanaWeb3_js.bool('primarySaleHappened'),
    solanaWeb3_js.bool('isMutable'),
    solanaWeb3_js.option(solanaWeb3_js.u8(), 'editionNonce'),
  ]);

  const TRANSFER_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u8('instruction'),
    solanaWeb3_js.u64('amount'),
  ]);

  const TOKEN_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.publicKey('mint'),
    solanaWeb3_js.publicKey('owner'),
    solanaWeb3_js.u64('amount'),
    solanaWeb3_js.u32('delegateOption'),
    solanaWeb3_js.publicKey('delegate'),
    solanaWeb3_js.u8('state'),
    solanaWeb3_js.u32('isNativeOption'),
    solanaWeb3_js.u64('isNative'),
    solanaWeb3_js.u64('delegatedAmount'),
    solanaWeb3_js.u32('closeAuthorityOption'),
    solanaWeb3_js.publicKey('closeAuthority')
  ]);

  const INITIALIZE_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u8('instruction'),
    solanaWeb3_js.publicKey('owner')
  ]);

  const CLOSE_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u8('instruction')
  ]);

  const createTransferInstruction = async ({ token, amount, from, to })=>{

    let fromTokenAccount = await findProgramAddress({ token, owner: from });
    let toTokenAccount = await findProgramAddress({ token, owner: to });

    const keys = [
      { pubkey: new solanaWeb3_js.PublicKey(fromTokenAccount), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(toTokenAccount), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(from), isSigner: true, isWritable: false }
    ];

    const data = solanaWeb3_js.Buffer.alloc(TRANSFER_LAYOUT.span);
    TRANSFER_LAYOUT.encode({
      instruction: 3, // TRANSFER
      amount: new solanaWeb3_js.BN(amount)
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(TOKEN_PROGRAM),
      data 
    })
  };

  const createAssociatedTokenAccountInstruction = async ({ token, owner, payer }) => {

    let associatedToken = await findProgramAddress({ token, owner });

    const keys = [
      { pubkey: new solanaWeb3_js.PublicKey(payer), isSigner: true, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(associatedToken), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(owner), isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(token), isSigner: false, isWritable: false },
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(TOKEN_PROGRAM), isSigner: false, isWritable: false },
    ];

   return new solanaWeb3_js.TransactionInstruction({
      keys,
      programId: new solanaWeb3_js.PublicKey(ASSOCIATED_TOKEN_PROGRAM),
      data: solanaWeb3_js.Buffer.alloc(0)
    })
  };

  const initializeAccountInstruction = ({ account, token, owner })=>{

    const keys = [
      { pubkey: new solanaWeb3_js.PublicKey(account), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(token), isSigner: false, isWritable: false },
    ];

    const data = solanaWeb3_js.Buffer.alloc(INITIALIZE_LAYOUT.span);
    INITIALIZE_LAYOUT.encode({
      instruction: 18, // InitializeAccount3
      owner: new solanaWeb3_js.PublicKey(owner)
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ keys, programId: new solanaWeb3_js.PublicKey(TOKEN_PROGRAM), data })
  };


  const closeAccountInstruction = ({ account, owner })=>{

    const keys = [
      { pubkey: new solanaWeb3_js.PublicKey(account), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(owner), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(owner), isSigner: true, isWritable: false }
    ];

    const data = solanaWeb3_js.Buffer.alloc(CLOSE_LAYOUT.span);
    CLOSE_LAYOUT.encode({
      instruction: 9 // CloseAccount
    }, data);

    return new solanaWeb3_js.TransactionInstruction({ keys, programId: new solanaWeb3_js.PublicKey(TOKEN_PROGRAM), data })
  };

  var instructions = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createTransferInstruction: createTransferInstruction,
    createAssociatedTokenAccountInstruction: createAssociatedTokenAccountInstruction,
    initializeAccountInstruction: initializeAccountInstruction,
    closeAccountInstruction: closeAccountInstruction
  });

  var balanceOnSolana = async ({ blockchain, address, account, api })=>{

    if(address == Blockchains__default['default'][blockchain].currency.address) {

       return ethers.ethers.BigNumber.from(await request(`solana://${account}/balance`))

    } else {

      const tokenAccountAddress = await findProgramAddress({ token: address, owner: account });

      const balance = await request(`solana://${tokenAccountAddress}/getTokenAccountBalance`);

      if (balance) {
        return ethers.ethers.BigNumber.from(balance.value.amount)
      } else {
        return ethers.ethers.BigNumber.from('0')
      }
    }
  };

  var decimalsOnSolana = async ({ blockchain, address })=>{
    let data = await request({ blockchain, address, api: MINT_LAYOUT });
    return data.decimals
  };

  var findAccount = async ({ token, owner })=>{

    const address = await findProgramAddress({ token, owner });

    const existingAccount = await request({
      blockchain: 'solana',
      address,
      api: TOKEN_LAYOUT,
      cache: 1000 // 1s
    });

    return existingAccount
  };

  function _optionalChain$3$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const METADATA_ACCOUNT = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

  const METADATA_REPLACE = new RegExp('\u0000', 'g');

  const getMetaDataPDA = async ({ metaDataPublicKey, mintPublicKey }) => {
    let seed = [
      solanaWeb3_js.Buffer.from('metadata'),
      metaDataPublicKey.toBuffer(),
      mintPublicKey.toBuffer()  
    ];

    return (await solanaWeb3_js.PublicKey.findProgramAddress(seed, metaDataPublicKey))[0]
  };

  const getMetaData = async ({ blockchain, address })=> {

    let mintPublicKey = new solanaWeb3_js.PublicKey(address);
    let metaDataPublicKey = new solanaWeb3_js.PublicKey(METADATA_ACCOUNT);
    let tokenMetaDataPublicKey = await getMetaDataPDA({ metaDataPublicKey, mintPublicKey });

    let metaData = await request({
      blockchain, 
      address: tokenMetaDataPublicKey.toString(),
      api: METADATA_LAYOUT,
      cache: 86400000, // 1 day
    });

    return {
      name: _optionalChain$3$1([metaData, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.name, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(METADATA_REPLACE, '')]),
      symbol: _optionalChain$3$1([metaData, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.symbol, 'optionalAccess', _7 => _7.replace, 'call', _8 => _8(METADATA_REPLACE, '')])
    }
  };

  function _optionalChain$2$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  var nameOnSolana = async ({ blockchain, address })=>{
    let metaData = await getMetaData({ blockchain, address });
    return _optionalChain$2$1([metaData, 'optionalAccess', _ => _.name])
  };

  function _optionalChain$1$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  var symbolOnSolana = async ({ blockchain, address })=>{
    let metaData = await getMetaData({ blockchain, address });
    return _optionalChain$1$1([metaData, 'optionalAccess', _ => _.symbol])
  };

  let supported$1 = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported$1.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported$1.svm = ['solana'];

  function _optionalChain$a(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  class Token {
    
    constructor({ blockchain, address }) {
      this.blockchain = blockchain;
      if(supported$1.evm.includes(this.blockchain)) {
        this.address = ethers.ethers.utils.getAddress(address);
      } else if(supported$1.svm.includes(this.blockchain)) {
        this.address = address;
      }
    }

    async decimals() {
      if (this.address == Blockchains__default['default'].findByName(this.blockchain).currency.address) {
        return Blockchains__default['default'].findByName(this.blockchain).currency.decimals
      }
      let decimals;
      try {
        if(supported$1.evm.includes(this.blockchain)) {

          decimals = await decimalsOnEVM({ blockchain: this.blockchain, address: this.address, api: Token[this.blockchain].DEFAULT });

        } else if(supported$1.svm.includes(this.blockchain)) {

          decimals = await decimalsOnSolana({ blockchain: this.blockchain, address: this.address });

          
        }
      } catch (e) {}
      return decimals
    }

    async symbol() {
      if (this.address == Blockchains__default['default'].findByName(this.blockchain).currency.address) {
        return Blockchains__default['default'].findByName(this.blockchain).currency.symbol
      }
      if(supported$1.evm.includes(this.blockchain)) {

        return await symbolOnEVM({ blockchain: this.blockchain, address: this.address, api: Token[this.blockchain].DEFAULT })

      } else if(supported$1.svm.includes(this.blockchain)) {

        return await symbolOnSolana({ blockchain: this.blockchain, address: this.address })

      }
    }

    async name(args) {
      if (this.address == Blockchains__default['default'].findByName(this.blockchain).currency.address) {
        return Blockchains__default['default'].findByName(this.blockchain).currency.name
      }
      if(supported$1.evm.includes(this.blockchain)) {

        return await nameOnEVM({ blockchain: this.blockchain, address: this.address, api: Token[this.blockchain].DEFAULT, id: _optionalChain$a([args, 'optionalAccess', _ => _.id]) })

      } else if(supported$1.svm.includes(this.blockchain)) {

        return await nameOnSolana({ blockchain: this.blockchain, address: this.address })

      }
    }

    async balance(account, id) {
      if(supported$1.evm.includes(this.blockchain)) {

        return await balanceOnEVM({ blockchain: this.blockchain, account, address: this.address, api: id ? Token[this.blockchain][1155] : Token[this.blockchain].DEFAULT, id })

      } else if(supported$1.svm.includes(this.blockchain)) {

        return await balanceOnSolana({ blockchain: this.blockchain, account, address: this.address, api: Token[this.blockchain].DEFAULT })

      }
    }

    async allowance(owner, spender) {
      if (this.address == Blockchains__default['default'].findByName(this.blockchain).currency.address) {
        return ethers.ethers.BigNumber.from(Blockchains__default['default'].findByName(this.blockchain).maxInt)
      }
      if(supported$1.evm.includes(this.blockchain)) {

        return await allowanceOnEVM({ blockchain: this.blockchain, address: this.address, api: Token[this.blockchain].DEFAULT, owner, spender })

      } else if(supported$1.svm.includes(this.blockchain)) {
        return ethers.ethers.BigNumber.from(Blockchains__default['default'].findByName(this.blockchain).maxInt)
      } 
    }

    async BigNumber(amount) {
      const decimals = await this.decimals();
      if(typeof(amount) != 'string') {
        amount = amount.toString();
      }
      if(amount.match('e')) {
        amount = parseFloat(amount).toFixed(decimals).toString();
      }
      const decimalsMatched = amount.match(/\.(\d+)/);
      if(decimalsMatched && decimalsMatched[1] && decimalsMatched[1].length > decimals) {
        amount = parseFloat(amount).toFixed(decimals).toString();
      }
      return ethers.ethers.utils.parseUnits(
        amount,
        decimals
      )
    }

    async readable(amount) {
      let decimals = await this.decimals();
      let readable = ethers.ethers.utils.formatUnits(amount.toString(), decimals);
      readable = readable.replace(/\.0+$/, '');
      return readable
    }
  }

  Token.BigNumber = async ({ amount, blockchain, address }) => {
    let token = new Token({ blockchain, address });
    return token.BigNumber(amount)
  };

  Token.readable = async ({ amount, blockchain, address }) => {
    let token = new Token({ blockchain, address });
    return token.readable(amount)
  };


  Token.ethereum = { 
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.bsc = { 
    DEFAULT: ERC20,
    BEP20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.polygon = { 
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.fantom = {
    DEFAULT: ERC20,
    FTM20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.arbitrum = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.avalanche = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    ARC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.gnosis = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.optimism = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.base = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.worldchain = {
    DEFAULT: ERC20,
    ERC20: ERC20,
    20: ERC20,
    1155: ERC1155,
    WRAPPED: WETH$2,
  };

  Token.solana = {
    MINT_LAYOUT,
    METADATA_LAYOUT,
    TRANSFER_LAYOUT,
    METADATA_ACCOUNT,
    TOKEN_PROGRAM,
    TOKEN_LAYOUT,
    ASSOCIATED_TOKEN_PROGRAM,
    findProgramAddress,
    findAccount,
    getMetaData,
    getMetaDataPDA,
    ...instructions
  };

  function _optionalChain$9(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }class Route {
    constructor({
      blockchain,
      tokenIn,
      decimalsIn,
      tokenOut,
      decimalsOut,
      path,
      pools,
      amounts,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      exchange,
      approvalRequired,
      getApproval,
      getPrep,
      getTransaction,
    }) {
      this.blockchain = blockchain;
      this.tokenIn = tokenIn;
      this.decimalsIn = decimalsIn;
      this.tokenOut = tokenOut;
      this.decimalsOut = decimalsOut;
      this.path = path;
      this.pools = pools;
      this.amounts = amounts;
      this.amountIn = _optionalChain$9([amountIn, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
      this.amountOutMin = _optionalChain$9([amountOutMin, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
      this.amountOut = _optionalChain$9([amountOut, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
      this.amountInMax = _optionalChain$9([amountInMax, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]);
      this.exchange = exchange;
      this.getPrep = getPrep;
      this.getTransaction = getTransaction;
    }
  }

  let supported = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
  supported.svm = ['solana'];

  const DEFAULT_SLIPPAGE = '0.5'; // percent

  const getDefaultSlippage = ({ exchange, blockchain, pools, amountIn, amountOut })=>{
    return DEFAULT_SLIPPAGE
  };

  const calculateAmountInWithSlippage = async ({ exchange, blockchain, pools, exchangePath, amountIn, amountOut })=>{

    let defaultSlippage = getDefaultSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut });

    let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000));

    if(!supported.evm.includes(exchange.blockchain || blockchain)) {
      return newAmountInWithDefaultSlippageBN
    }

    const currentBlock = await request({ blockchain: (exchange.blockchain || blockchain), method: 'latestBlockNumber' });

    let blocks = [];
    for(var i = 0; i <= 2; i++){
      blocks.push(currentBlock-i);
    }

    const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
      let { amountIn } = await exchange.getAmounts({
        exchange,
        blockchain,
        path: exchangePath,
        pools,
        amountOut,
        block
      });
      return amountIn
    }));

    if(!lastAmountsIn[0] || !lastAmountsIn[1] || !lastAmountsIn[2]) { return newAmountInWithDefaultSlippageBN }

    let newAmountInWithExtremeSlippageBN;
    
    if(
      (lastAmountsIn[0].gt(lastAmountsIn[1])) &&
      (lastAmountsIn[1].gt(lastAmountsIn[2]))
    ) {
      // EXTREME DIRECTIONAL PRICE CHANGE

      const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1]);
      const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2]);

      // velocity (avg. step size)
      const slippage = difference1.add(difference2).div(2);

      newAmountInWithExtremeSlippageBN = lastAmountsIn[0].add(slippage);

      if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
        return newAmountInWithExtremeSlippageBN
      }
    } else if (
      !(
        lastAmountsIn[0].eq(lastAmountsIn[1]) ||
        lastAmountsIn[1].eq(lastAmountsIn[2])
      )
    ) {
      // EXTREME BASE VOLATILITIES

      const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1]).abs();
      const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2]).abs();

      let slippage;
      if(difference1.lt(difference2)) {
        slippage = difference1;
      } else {
        slippage = difference2;
      }

      let highestAmountBN;
      if(lastAmountsIn[0].gt(lastAmountsIn[1]) && lastAmountsIn[0].gt(lastAmountsIn[2])) {
        highestAmountBN = lastAmountsIn[0];
      } else if(lastAmountsIn[1].gt(lastAmountsIn[2]) && lastAmountsIn[1].gt(lastAmountsIn[0])) {
        highestAmountBN = lastAmountsIn[1];
      } else {
        highestAmountBN = lastAmountsIn[2];
      }

      newAmountInWithExtremeSlippageBN = highestAmountBN.add(slippage);

      if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
        return newAmountInWithExtremeSlippageBN
      }
    }

    return newAmountInWithDefaultSlippageBN
  };

  const calculateAmountOutLessSlippage = async ({ exchange, exchangePath, amountOut, amountIn })=>{
    let defaultSlippage = getDefaultSlippage({ amountIn, amountOut });

    let newAmountOutWithoutDefaultSlippageBN = amountOut.sub(amountOut.mul(parseFloat(defaultSlippage)*100).div(10000));

    return newAmountOutWithoutDefaultSlippageBN
  };

  const calculateAmountsWithSlippage = async ({
    exchange,
    blockchain,
    pools,
    exchangePath,
    amounts,
    tokenIn, tokenOut,
    amountIn, amountInMax, amountOut, amountOutMin,
    amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
  })=>{
    if(amountOutMinInput || amountOutInput) {
      if(supported.evm.includes(exchange.blockchain || blockchain)) {
        amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut: (amountOutMinInput || amountOut) });
      } else if(supported.svm.includes(exchange.blockchain || blockchain)){
        let amountsWithSlippage = [];
        await Promise.all(exchangePath.map((step, index)=>{
          if(index != 0) {
            let amountWithSlippage = calculateAmountInWithSlippage({ exchange, pools, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
            amountWithSlippage.then((amount)=>{
              amountsWithSlippage.push(amount);
            });
            return amountWithSlippage
          }
        }));
        amountsWithSlippage.push(amounts[amounts.length-1]);
        amounts = amountsWithSlippage;
        if(amounts.length > 2) { // lower middle amount to avoid first hop slippage issues on output amount (total hops remain within default slippage)
          let defaultSlippage = getDefaultSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut });
          amounts[1] = amounts[1].sub(amounts[1].mul(parseFloat(defaultSlippage)*100/2).div(10000));
        }
        amountIn = amountInMax = amounts[0];
      }
    } else if(amountInMaxInput || amountInInput) {
      if(supported.svm.includes(exchange.blockchain || blockchain)){
        let amountsWithSlippage = [];
        await Promise.all(exchangePath.map((step, index)=>{
          if(index !== 0 && index < exchangePath.length-1) {
            amountsWithSlippage.unshift(amounts[index]);
          } else if(index === exchangePath.length-1) {
            let amountWithSlippage = calculateAmountOutLessSlippage({ exchange, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] });
            amountWithSlippage.then((amount)=>{
              amountsWithSlippage.unshift(amount);
              return amount
            });
            return amountWithSlippage
          }
        }));
        amountsWithSlippage.push(amounts[0]);
        amounts = amountsWithSlippage.slice().reverse();
        amountOut = amountOutMin = amounts[amounts.length-1];
      }
    }

    return({ amountIn, amountInMax, amountOut, amountOutMin, amounts })
  };

  const fixAddress = (address)=>{
    if(address.match('0x')) {
      return ethers.ethers.utils.getAddress(address)
    } else {
      return address
    }
  };

  let getAmount = async ({ amount, blockchain, address }) => {
    return await Token.BigNumber({ amount, blockchain, address })
  };

  let fixRouteParams = async ({
    blockchain,
    exchange,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
  }) => {
    let params = {
      exchange,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
    };
    
    if (amountOut && typeof amountOut === 'number') {
      params.amountOut = await getAmount({ amount: amountOut, blockchain, address: tokenOut });
    }

    if (amountOutMin && typeof amountOutMin === 'number') {
      params.amountOutMin = await getAmount({ amount: amountOutMin, blockchain, address: tokenOut });
    }

    if (amountIn && typeof amountIn === 'number') {
      params.amountIn = await getAmount({ amount: amountIn, blockchain, address: tokenIn });
    }

    if (amountInMax && typeof amountInMax === 'number') {
      params.amountInMax = await getAmount({ amount: amountInMax, blockchain, address: tokenIn });
    }
    
    return params
  };

  let preflight = ({
    blockchain,
    exchange,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
  }) => {
    if(blockchain === undefined && exchange.blockchains != undefined && exchange.blockchains.length > 1) {
      throw 'You need to provide a blockchain when calling route on an exchange that supports multiple blockchains!'
    }

    if (typeof amountOut !== 'undefined' && typeof amountIn !== 'undefined') {
      throw 'You cannot set amountIn and amountOut at the same time, use amountInMax or amountOutMin to describe the non exact part of the swap!'
    }

    if (typeof amountInMax !== 'undefined' && typeof amountOutMin !== 'undefined') {
      throw 'You cannot set amountInMax and amountOutMin at the same time, use amountIn or amountOut to describe the part of the swap that needs to be exact!'
    }

    if (typeof amountIn !== 'undefined' && typeof amountInMax !== 'undefined') {
      throw 'Setting amountIn and amountInMax at the same time makes no sense. Decide if amountIn needs to be exact or not!'
    }

    if (typeof amountOut !== 'undefined' && typeof amountOutMin !== 'undefined') {
      throw 'Setting amountOut and amountOutMin at the same time makes no sense. Decide if amountOut needs to be exact or not!'
    }
  };

  const route$1 = ({
    blockchain,
    exchange,
    tokenIn,
    tokenOut,
    amountIn = undefined,
    amountOut = undefined,
    amountInMax = undefined,
    amountOutMin = undefined,
    findPath,
    getAmounts,
    getPrep,
    getTransaction,
    slippage,
    pairsData,
  }) => {

    tokenIn = fixAddress(tokenIn);
    tokenOut = fixAddress(tokenOut);

    if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length > 1) { throw('You can only pass one: amountIn, amountOut, amountInMax or amountOutMin') }
    if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length < 1) { throw('You need to pass exactly one: amountIn, amountOut, amountInMax or amountOutMin') }

    return new Promise(async (resolve)=> {
      let { path, exchangePath, pools } = await findPath({ blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, pairsData });
      if (path === undefined || path.length == 0) { return resolve() }
      let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

      let amounts; // includes intermediary amounts for longer routes
      try {
        ;({ amountIn, amountInMax, amountOut, amountOutMin, amounts, pools } = await getAmounts({ exchange, blockchain, path, pools, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsData }));
      } catch(e) {
        console.log(e);
        return resolve()
      }
      if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

      if(exchange.slippage && slippage !== false) {
        try {
          ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
            exchange,
            blockchain,
            pools,
            exchangePath,
            amounts,
            tokenIn, tokenOut,
            amountIn, amountInMax, amountOut, amountOutMin,
            amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
          }));
        } catch(e) { console.log(e); return resolve() }
      }

      const decimalsIn = await new Token({ blockchain, address: tokenIn }).decimals();
      const decimalsOut = await new Token({ blockchain, address: tokenOut }).decimals();

      resolve(
        new Route({
          blockchain,
          tokenIn,
          decimalsIn,
          tokenOut,
          decimalsOut,
          path,
          pools,
          amounts,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          exchange,
          getPrep: async ({ account })=> await getPrep({
            exchange,
            blockchain,
            tokenIn,
            tokenOut,
            amountIn: (amountIn || amountInMax),
            account,
          }),
          getTransaction: async ({ account, permit2, inputTokenPushed })=> await getTransaction({
            exchange,
            blockchain,
            pools,
            path,
            amountIn,
            amountInMax,
            amountOut,
            amountOutMin,
            amounts,
            amountInInput,
            amountOutInput,
            amountInMaxInput,
            amountOutMinInput,
            account,
            permit2,
            inputTokenPushed
          }),
        })
      );
    })
  };

  class Exchange {
    constructor(...args) {
      Object.assign(this, ...args);
    }

    async route({
      blockchain,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
      slippage,
      pairsData,
    }) {
      if(tokenIn === tokenOut){ return Promise.resolve() }

      if(blockchain === undefined) {
        if(this.scope) { 
          blockchain = this.scope;
        } else if (this.blockchains.length === 1) {
          blockchain = this.blockchains[0];
        }
      }

      preflight({
        blockchain,
        exchange: this,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      });

      return await route$1({
        ...
        await fixRouteParams({
          blockchain,
          exchange: this,
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          amountInMax,
          amountOutMin,
        }),
        blockchain,
        findPath: this.findPath,
        getAmounts: this.getAmounts,
        getPrep: this.getPrep,
        getTransaction: this.getTransaction,
        slippage,
        pairsData,
      })
    }
  }

  const MAX_SQRT_PRICE = "79226673515401279992447579055";
  const MIN_SQRT_PRICE = "4295048016";
  const BIT_PRECISION$1 = 14;
  const LOG_B_2_X32$1 = "59543866431248";
  const LOG_B_P_ERR_MARGIN_LOWER_X64$1 = "184467440737095516";
  const LOG_B_P_ERR_MARGIN_UPPER_X64$1 = "15793534762490258745";

  const toX64 = (num) => {
    return new solanaWeb3_js.BN(num.mul(Decimal__default['default'].pow(2, 64)).floor().toFixed());
  };

  const fromX64 = (num) => {
    return new Decimal__default['default'](num.toString()).mul(Decimal__default['default'].pow(2, -64));
  };

  const getInitializableTickIndex = (tickIndex, tickSpacing) => {
    return tickIndex - (tickIndex % tickSpacing)
  };

  const invertTick = (tick) => {
    return -tick
  };

  /**
   * A collection of utility functions to convert between price, tickIndex and sqrtPrice.
   *
   * @category Whirlpool Utils
   */
  class PriceMath {

    static priceToSqrtPriceX64(price, decimalsA, decimalsB) {
      return toX64(price.mul(Decimal__default['default'].pow(10, decimalsB - decimalsA)).sqrt());
    }

    static sqrtPriceX64ToPrice(
      sqrtPriceX64,
      decimalsA,
      decimalsB
    ) {
      return fromX64(sqrtPriceX64)
        .pow(2)
        .mul(Decimal__default['default'].pow(10, decimalsA - decimalsB));
    }

    /**
     * @param tickIndex
     * @returns
     */
    static tickIndexToSqrtPriceX64(tickIndex) {
      if (tickIndex > 0) {
        return new solanaWeb3_js.BN(tickIndexToSqrtPricePositive(tickIndex));
      } else {
        return new solanaWeb3_js.BN(tickIndexToSqrtPriceNegative(tickIndex));
      }
    }

    /**
     *
     * @param sqrtPriceX64
     * @returns
     */
    static sqrtPriceX64ToTickIndex(sqrtPriceX64) {
      if (sqrtPriceX64.gt(new solanaWeb3_js.BN(MAX_SQRT_PRICE)) || sqrtPriceX64.lt(new solanaWeb3_js.BN(MIN_SQRT_PRICE))) {
        throw new Error("Provided sqrtPrice is not within the supported sqrtPrice range.");
      }

      const msb = sqrtPriceX64.bitLength() - 1;
      const adjustedMsb = new solanaWeb3_js.BN(msb - 64);
      const log2pIntegerX32 = signedShiftLeft(adjustedMsb, 32, 128);

      let bit = new solanaWeb3_js.BN("8000000000000000", "hex");
      let precision = 0;
      let log2pFractionX64 = new solanaWeb3_js.BN(0);

      let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);

      while (bit.gt(new solanaWeb3_js.BN(0)) && precision < BIT_PRECISION$1) {
        r = r.mul(r);
        let rMoreThanTwo = r.shrn(127);
        r = r.shrn(63 + rMoreThanTwo.toNumber());
        log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
        bit = bit.shrn(1);
        precision += 1;
      }

      const log2pFractionX32 = log2pFractionX64.shrn(32);

      const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
      const logbpX64 = log2pX32.mul(new solanaWeb3_js.BN(LOG_B_2_X32$1));

      const tickLow = signedShiftRight(
        logbpX64.sub(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_LOWER_X64$1)),
        64,
        128
      ).toNumber();
      const tickHigh = signedShiftRight(
        logbpX64.add(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_UPPER_X64$1)),
        64,
        128
      ).toNumber();

      if (tickLow == tickHigh) {
        return tickLow;
      } else {
        const derivedTickHighSqrtPriceX64 = PriceMath.tickIndexToSqrtPriceX64(tickHigh);
        if (derivedTickHighSqrtPriceX64.lte(sqrtPriceX64)) {
          return tickHigh;
        } else {
          return tickLow;
        }
      }
    }

    static tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
      return PriceMath.sqrtPriceX64ToPrice(
        PriceMath.tickIndexToSqrtPriceX64(tickIndex),
        decimalsA,
        decimalsB
      );
    }

    static priceToTickIndex(price, decimalsA, decimalsB) {
      return PriceMath.sqrtPriceX64ToTickIndex(
        PriceMath.priceToSqrtPriceX64(price, decimalsA, decimalsB)
      );
    }

    static priceToInitializableTickIndex(
      price,
      decimalsA,
      decimalsB,
      tickSpacing
    ) {
      return getInitializableTickIndex(
        PriceMath.priceToTickIndex(price, decimalsA, decimalsB),
        tickSpacing
      );
    }

    /**
     * Utility to invert the price Pb/Pa to Pa/Pb
     * @param price Pb / Pa
     * @param decimalsA Decimals of original token A (i.e. token A in the given Pb / Pa price)
     * @param decimalsB Decimals of original token B (i.e. token B in the given Pb / Pa price)
     * @returns inverted price, i.e. Pa / Pb
     */
    static invertPrice(price, decimalsA, decimalsB) {
      const tick = PriceMath.priceToTickIndex(price, decimalsA, decimalsB);
      const invTick = invertTick(tick);
      return PriceMath.tickIndexToPrice(invTick, decimalsB, decimalsA);
    }

    /**
     * Utility to invert the sqrtPriceX64 from X64 repr. of sqrt(Pb/Pa) to X64 repr. of sqrt(Pa/Pb)
     * @param sqrtPriceX64 X64 representation of sqrt(Pb / Pa)
     * @returns inverted sqrtPriceX64, i.e. X64 representation of sqrt(Pa / Pb)
     */
    static invertSqrtPriceX64(sqrtPriceX64) {
      const tick = PriceMath.sqrtPriceX64ToTickIndex(sqrtPriceX64);
      const invTick = invertTick(tick);
      return PriceMath.tickIndexToSqrtPriceX64(invTick);
    }
  }

  // Private Functions

  function tickIndexToSqrtPricePositive(tick) {
    let ratio;

    if ((tick & 1) != 0) {
      ratio = new solanaWeb3_js.BN("79232123823359799118286999567");
    } else {
      ratio = new solanaWeb3_js.BN("79228162514264337593543950336");
    }

    if ((tick & 2) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79236085330515764027303304731")), 96, 256);
    }
    if ((tick & 4) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79244008939048815603706035061")), 96, 256);
    }
    if ((tick & 8) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79259858533276714757314932305")), 96, 256);
    }
    if ((tick & 16) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79291567232598584799939703904")), 96, 256);
    }
    if ((tick & 32) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79355022692464371645785046466")), 96, 256);
    }
    if ((tick & 64) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79482085999252804386437311141")), 96, 256);
    }
    if ((tick & 128) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("79736823300114093921829183326")), 96, 256);
    }
    if ((tick & 256) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("80248749790819932309965073892")), 96, 256);
    }
    if ((tick & 512) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("81282483887344747381513967011")), 96, 256);
    }
    if ((tick & 1024) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("83390072131320151908154831281")), 96, 256);
    }
    if ((tick & 2048) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("87770609709833776024991924138")), 96, 256);
    }
    if ((tick & 4096) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("97234110755111693312479820773")), 96, 256);
    }
    if ((tick & 8192) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("119332217159966728226237229890")), 96, 256);
    }
    if ((tick & 16384) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("179736315981702064433883588727")), 96, 256);
    }
    if ((tick & 32768) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("407748233172238350107850275304")), 96, 256);
    }
    if ((tick & 65536) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("2098478828474011932436660412517")), 96, 256);
    }
    if ((tick & 131072) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("55581415166113811149459800483533")), 96, 256);
    }
    if ((tick & 262144) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("38992368544603139932233054999993551")), 96, 256);
    }

    return signedShiftRight(ratio, 32, 256);
  }

  function tickIndexToSqrtPriceNegative(tickIndex) {
    let tick = Math.abs(tickIndex);
    let ratio;

    if ((tick & 1) != 0) {
      ratio = new solanaWeb3_js.BN("18445821805675392311");
    } else {
      ratio = new solanaWeb3_js.BN("18446744073709551616");
    }

    if ((tick & 2) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18444899583751176498")), 64, 256);
    }
    if ((tick & 4) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18443055278223354162")), 64, 256);
    }
    if ((tick & 8) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18439367220385604838")), 64, 256);
    }
    if ((tick & 16) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18431993317065449817")), 64, 256);
    }
    if ((tick & 32) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18417254355718160513")), 64, 256);
    }
    if ((tick & 64) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18387811781193591352")), 64, 256);
    }
    if ((tick & 128) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18329067761203520168")), 64, 256);
    }
    if ((tick & 256) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("18212142134806087854")), 64, 256);
    }
    if ((tick & 512) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("17980523815641551639")), 64, 256);
    }
    if ((tick & 1024) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("17526086738831147013")), 64, 256);
    }
    if ((tick & 2048) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("16651378430235024244")), 64, 256);
    }
    if ((tick & 4096) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("15030750278693429944")), 64, 256);
    }
    if ((tick & 8192) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("12247334978882834399")), 64, 256);
    }
    if ((tick & 16384) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("8131365268884726200")), 64, 256);
    }
    if ((tick & 32768) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("3584323654723342297")), 64, 256);
    }
    if ((tick & 65536) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("696457651847595233")), 64, 256);
    }
    if ((tick & 131072) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("26294789957452057")), 64, 256);
    }
    if ((tick & 262144) != 0) {
      ratio = signedShiftRight(ratio.mul(new solanaWeb3_js.BN("37481735321082")), 64, 256);
    }

    return ratio;
  }

  function signedShiftLeft(n0, shiftBy, bitWidth) {
    let twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
    twosN0.imaskn(bitWidth + 1);
    return twosN0.fromTwos(bitWidth);
  }

  function signedShiftRight(n0, shiftBy, bitWidth) {
    let twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
    twoN0.imaskn(bitWidth - shiftBy + 1);
    return twoN0.fromTwos(bitWidth - shiftBy);
  }

  const PROTOCOL_FEE_RATE_MUL_VALUE = new solanaWeb3_js.BN(10000);
  const FEE_RATE_MUL_VALUE = new solanaWeb3_js.BN(1000000);
  const ZERO$2 = new solanaWeb3_js.BN(0);
  const ONE$1 = new solanaWeb3_js.BN(1);
  const TWO$1 = new solanaWeb3_js.BN(2);
  const U64_MAX = TWO$1.pow(new solanaWeb3_js.BN(64)).sub(ONE$1);

  const fromX64_BN = (num)=>{
    return num.div(new solanaWeb3_js.BN(2).pow(new solanaWeb3_js.BN(64)))
  };

  class u64 extends solanaWeb3_js.BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
      const a = super.toArray().reverse();
      const b = buffer.Buffer.from(a);

      if (b.length === 8) {
        return b;
      }

      assert__default['default'](b.length < 8, 'u64 too large');
      const zeroPad = buffer.Buffer.alloc(8);
      b.copy(zeroPad);
      return zeroPad;
    }
    /**
     * Construct a u64 from Buffer representation
     */


    static fromBuffer(buffer) {
      assert__default['default'](buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
      return new u64([...buffer].reverse().map(i => `00${i.toString(16)}`.slice(-2)).join(''), 16);
    }

  }

  class BitMath {

    static mul(n0, n1, limit) {
      const result = n0.mul(n1);
      if (this.isOverLimit(result, limit)) {
        throw new Error(
          `Mul result higher than u${limit}`
        );
      }
      return result;
    }

    static mulDiv(n0, n1, d, limit) {
      return this.mulDivRoundUpIf(n0, n1, d, false, limit);
    }

    static mulDivRoundUp(n0, n1, d, limit) {
      return this.mulDivRoundUpIf(n0, n1, d, true, limit);
    }

    static mulDivRoundUpIf(n0, n1, d, roundUp, limit) {
      if (d.eq(ZERO$2)) {
        throw new Error("mulDiv denominator is zero");
      }

      const p = this.mul(n0, n1, limit);
      const n = p.div(d);

      return roundUp && p.mod(d).gt(ZERO$2) ? n.add(ONE$1) : n;
    }

    static checked_mul_shift_right(n0, n1, limit) {
      return this.checked_mul_shift_right_round_up_if(n0, n1, false, limit);
    }

    static checked_mul_shift_right_round_up_if(n0, n1, roundUp, limit) {
      if (n0.eq(ZERO$2) || n1.eq(ZERO$2)) {
        return ZERO$2;
      }

      const p = this.mul(n0, n1, limit);
      if (this.isOverLimit(p, limit)) {
        throw new Error(
          `MulShiftRight overflowed u${limit}.`
        );
      }
      const result = fromX64_BN(p);
      const shouldRound = roundUp && result.and(U64_MAX).gt(ZERO$2);
      if (shouldRound && result.eq(U64_MAX)) {
        throw new Error(
          `MulShiftRight overflowed u${limit}.`
        );
      }

      return shouldRound ? result.add(ONE$1) : result;
    }

    static isOverLimit(n0, limit) {
      const limitBN = TWO$1.pow(new solanaWeb3_js.BN(limit)).sub(ONE$1);
      return n0.gt(limitBN);
    }

    static divRoundUp(n, d) {
      return this.divRoundUpIf(n, d, true);
    }

    static divRoundUpIf(n, d, roundUp) {
      if (d.eq(ZERO$2)) {
        throw new Error("divRoundUpIf - divide by zero");
      }

      let q = n.div(d);

      return roundUp && n.mod(d).gt(ZERO$2) ? q.add(ONE$1) : q;
    }
  }

  const getNextSqrtPriceFromBRoundDown = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput
  ) => {
    let amountX64 = amount.shln(64);

    let delta = BitMath.divRoundUpIf(amountX64, currLiquidity, !amountSpecifiedIsInput);

    if (amountSpecifiedIsInput) {
      sqrtPrice = sqrtPrice.add(delta);
    } else {
      sqrtPrice = sqrtPrice.sub(delta);
    }

    return sqrtPrice;
  };

  const getNextSqrtPriceFromARoundUp = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput
  ) => {
    if (amount.eq(ZERO$2)) {
      return sqrtPrice;
    }

    let p = BitMath.mul(sqrtPrice, amount, 256);
    let numerator = BitMath.mul(currLiquidity, sqrtPrice, 256).shln(64);
    if (BitMath.isOverLimit(numerator, 256)) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - numerator overflow u256"
      );
    }

    let currLiquidityShiftLeft = currLiquidity.shln(64);
    if (!amountSpecifiedIsInput && currLiquidityShiftLeft.lte(p)) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - Unable to divide currLiquidityX64 by product"
      );
    }

    let denominator = amountSpecifiedIsInput
      ? currLiquidityShiftLeft.add(p)
      : currLiquidityShiftLeft.sub(p);

    let price = BitMath.divRoundUp(numerator, denominator);

    if (price.lt(new solanaWeb3_js.BN(MIN_SQRT_PRICE))) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - price less than min sqrt price"
      );
    } else if (price.gt(new solanaWeb3_js.BN(MAX_SQRT_PRICE))) {
      throw new Error(
        "getNextSqrtPriceFromARoundUp - price less than max sqrt price"
      );
    }

    return price;
  };

  const getNextSqrtPrices = (nextTick, sqrtPriceLimit, aToB) => {
    const nextTickPrice = PriceMath.tickIndexToSqrtPriceX64(nextTick);
    const nextSqrtPriceLimit = aToB ? solanaWeb3_js.BN.max(sqrtPriceLimit, nextTickPrice) : solanaWeb3_js.BN.min(sqrtPriceLimit, nextTickPrice);
    return { nextTickPrice, nextSqrtPriceLimit }
  };

  const toIncreasingPriceOrder = (sqrtPrice0, sqrtPrice1) => {
    if (sqrtPrice0.gt(sqrtPrice1)) {
      return [sqrtPrice1, sqrtPrice0];
    } else {
      return [sqrtPrice0, sqrtPrice1];
    }
  };

  const getAmountDeltaA = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    roundUp
  ) => {
    let [sqrtPriceLower, sqrtPriceUpper] = toIncreasingPriceOrder(currSqrtPrice, targetSqrtPrice);
    let sqrtPriceDiff = sqrtPriceUpper.sub(sqrtPriceLower);

    let numerator = currLiquidity.mul(sqrtPriceDiff).shln(64);
    let denominator = sqrtPriceLower.mul(sqrtPriceUpper);

    let quotient = numerator.div(denominator);
    let remainder = numerator.mod(denominator);

    let result = roundUp && !remainder.eq(ZERO$2) ? quotient.add(ONE$1) : quotient;

    if (result.gt(U64_MAX)) {
      throw new Error("Results larger than U64");
    }

    return result;
  };

  const getAmountDeltaB = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    roundUp
  ) => {
    let [sqrtPriceLower, sqrtPriceUpper] = toIncreasingPriceOrder(currSqrtPrice, targetSqrtPrice);
    let sqrtPriceDiff = sqrtPriceUpper.sub(sqrtPriceLower);
    return BitMath.checked_mul_shift_right_round_up_if(currLiquidity, sqrtPriceDiff, roundUp, 128);
  };

  const getNextSqrtPrice = (
    sqrtPrice,
    currLiquidity,
    amount,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (amountSpecifiedIsInput === aToB) {
      return getNextSqrtPriceFromARoundUp(sqrtPrice, currLiquidity, amount, amountSpecifiedIsInput);
    } else {
      return getNextSqrtPriceFromBRoundDown(sqrtPrice, currLiquidity, amount, amountSpecifiedIsInput);
    }
  };

  const getAmountUnfixedDelta = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (aToB === amountSpecifiedIsInput) {
      return getAmountDeltaB(currSqrtPrice, targetSqrtPrice, currLiquidity, !amountSpecifiedIsInput)
    } else {
      return getAmountDeltaA(currSqrtPrice, targetSqrtPrice, currLiquidity, !amountSpecifiedIsInput)
    }
  };

  const getAmountFixedDelta = (
    currSqrtPrice,
    targetSqrtPrice,
    currLiquidity,
    amountSpecifiedIsInput,
    aToB
  ) => {
    if (aToB === amountSpecifiedIsInput) {
      return getAmountDeltaA(currSqrtPrice, targetSqrtPrice, currLiquidity, amountSpecifiedIsInput)
    } else {
      return getAmountDeltaB(currSqrtPrice, targetSqrtPrice, currLiquidity, amountSpecifiedIsInput)
    }
  };

  const computeSwapStep = (
    amountRemaining,
    feeRate,
    currLiquidity,
    currSqrtPrice,
    targetSqrtPrice,
    amountSpecifiedIsInput,
    aToB
  ) => {
    let amountFixedDelta = getAmountFixedDelta(
      currSqrtPrice,
      targetSqrtPrice,
      currLiquidity,
      amountSpecifiedIsInput,
      aToB
    );

    let amountCalc = amountRemaining;
    if (amountSpecifiedIsInput) {
      const result = BitMath.mulDiv(
        amountRemaining,
        FEE_RATE_MUL_VALUE.sub(new solanaWeb3_js.BN(feeRate)),
        FEE_RATE_MUL_VALUE,
        128
      );
      amountCalc = result;
    }

    let nextSqrtPrice = amountCalc.gte(amountFixedDelta)
      ? targetSqrtPrice
      : getNextSqrtPrice(currSqrtPrice, currLiquidity, amountCalc, amountSpecifiedIsInput, aToB);

    let isMaxSwap = nextSqrtPrice.eq(targetSqrtPrice);

    let amountUnfixedDelta = getAmountUnfixedDelta(
      currSqrtPrice,
      nextSqrtPrice,
      currLiquidity,
      amountSpecifiedIsInput,
      aToB
    );

    if (!isMaxSwap) {
      amountFixedDelta = getAmountFixedDelta(
        currSqrtPrice,
        nextSqrtPrice,
        currLiquidity,
        amountSpecifiedIsInput,
        aToB
      );
    }

    let amountIn = amountSpecifiedIsInput ? amountFixedDelta : amountUnfixedDelta;
    let amountOut = amountSpecifiedIsInput ? amountUnfixedDelta : amountFixedDelta;

    if (!amountSpecifiedIsInput && amountOut.gt(amountRemaining)) {
      amountOut = amountRemaining;
    }

    let feeAmount;
    if (amountSpecifiedIsInput && !isMaxSwap) {
      feeAmount = amountRemaining.sub(amountIn);
    } else {
      const feeRateBN = new solanaWeb3_js.BN(feeRate);
      feeAmount = BitMath.mulDivRoundUp(amountIn, feeRateBN, FEE_RATE_MUL_VALUE.sub(feeRateBN), 128);
    }

    return {
      amountIn,
      amountOut,
      nextPrice: nextSqrtPrice,
      feeAmount,
    };
  };

  const calculateNextLiquidity = (tickNetLiquidity, currLiquidity, aToB) => {
    return aToB ? currLiquidity.sub(tickNetLiquidity) : currLiquidity.add(tickNetLiquidity);
  };

  const calculateProtocolFee = (globalFee, protocolFeeRate) => {
    return globalFee.mul(new u64(protocolFeeRate).div(PROTOCOL_FEE_RATE_MUL_VALUE));
  };

  const calculateFees = (
    feeAmount,
    protocolFeeRate,
    currLiquidity,
    currProtocolFee,
    currFeeGrowthGlobalInput
  ) => {
    let nextProtocolFee = currProtocolFee;
    let nextFeeGrowthGlobalInput = currFeeGrowthGlobalInput;
    let globalFee = feeAmount;

    if (protocolFeeRate > 0) {
      let delta = calculateProtocolFee(globalFee, protocolFeeRate);
      globalFee = globalFee.sub(delta);
      nextProtocolFee = nextProtocolFee.add(currProtocolFee);
    }

    if (currLiquidity.gt(ZERO$2)) {
      const globalFeeIncrement = globalFee.shln(64).div(currLiquidity);
      nextFeeGrowthGlobalInput = nextFeeGrowthGlobalInput.add(globalFeeIncrement);
    }

    return {
      nextProtocolFee,
      nextFeeGrowthGlobalInput,
    };
  };

  const compute = ({
    tokenAmount,
    aToB,
    freshWhirlpoolData,
    tickSequence,
    sqrtPriceLimit,
    amountSpecifiedIsInput,
  })=> {
    
    let amountRemaining = tokenAmount;
    let amountCalculated = ZERO$2;
    let currSqrtPrice = freshWhirlpoolData.sqrtPrice;
    let currLiquidity = freshWhirlpoolData.liquidity;
    let currTickIndex = freshWhirlpoolData.tickCurrentIndex;
    let totalFeeAmount = ZERO$2;
    const feeRate = freshWhirlpoolData.feeRate;
    const protocolFeeRate = freshWhirlpoolData.protocolFeeRate;
    let currProtocolFee = new u64(0);
    let currFeeGrowthGlobalInput = aToB ? freshWhirlpoolData.feeGrowthGlobalA : freshWhirlpoolData.feeGrowthGlobalB;

    while (amountRemaining.gt(ZERO$2) && !sqrtPriceLimit.eq(currSqrtPrice)) {
      let { nextIndex: nextTickIndex } = tickSequence.findNextInitializedTickIndex(currTickIndex);

      let { nextTickPrice, nextSqrtPriceLimit: targetSqrtPrice } = getNextSqrtPrices(
        nextTickIndex,
        sqrtPriceLimit,
        aToB
      );

      const swapComputation = computeSwapStep(
        amountRemaining,
        feeRate,
        currLiquidity,
        currSqrtPrice,
        targetSqrtPrice,
        amountSpecifiedIsInput,
        aToB
      );

      totalFeeAmount = totalFeeAmount.add(swapComputation.feeAmount);

      if (amountSpecifiedIsInput) {
        amountRemaining = amountRemaining.sub(swapComputation.amountIn);
        amountRemaining = amountRemaining.sub(swapComputation.feeAmount);
        amountCalculated = amountCalculated.add(swapComputation.amountOut);
      } else {
        amountRemaining = amountRemaining.sub(swapComputation.amountOut);
        amountCalculated = amountCalculated.add(swapComputation.amountIn);
        amountCalculated = amountCalculated.add(swapComputation.feeAmount);
      }

      let { nextProtocolFee, nextFeeGrowthGlobalInput } = calculateFees(
        swapComputation.feeAmount,
        protocolFeeRate,
        currLiquidity,
        currProtocolFee,
        currFeeGrowthGlobalInput
      );
      currProtocolFee = nextProtocolFee;
      currFeeGrowthGlobalInput = nextFeeGrowthGlobalInput;

      if (swapComputation.nextPrice.eq(nextTickPrice)) {
        const nextTick = tickSequence.getTick(nextTickIndex);
        if (nextTick.initialized) {
          currLiquidity = calculateNextLiquidity(nextTick.liquidityNet, currLiquidity, aToB);
        }
        currTickIndex = aToB ? nextTickIndex - 1 : nextTickIndex;
      } else {
        currTickIndex = PriceMath.sqrtPriceX64ToTickIndex(swapComputation.nextPrice);
      }

      currSqrtPrice = swapComputation.nextPrice;
    }

    return amountCalculated
  };

  const WHIRLPOOL_REWARD_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.publicKey("mint"),
    solanaWeb3_js.publicKey("vault"),
    solanaWeb3_js.publicKey("authority"),
    solanaWeb3_js.u128("emissionsPerSecondX64"),
    solanaWeb3_js.u128("growthGlobalX64"),
  ]);

  const WHIRLPOOL_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.u64("anchorDiscriminator"),
    solanaWeb3_js.publicKey("whirlpoolsConfig"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 1, "whirlpoolBump"),
    solanaWeb3_js.u16("tickSpacing"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 2, "tickSpacingSeed"),
    solanaWeb3_js.u16("feeRate"),
    solanaWeb3_js.u16("protocolFeeRate"),
    solanaWeb3_js.u128("liquidity"),
    solanaWeb3_js.u128("sqrtPrice"),
    solanaWeb3_js.i32("tickCurrentIndex"),
    solanaWeb3_js.u64("protocolFeeOwedA"),
    solanaWeb3_js.u64("protocolFeeOwedB"),
    solanaWeb3_js.publicKey("tokenMintA"),
    solanaWeb3_js.publicKey("tokenVaultA"),
    solanaWeb3_js.u128("feeGrowthGlobalA"),
    solanaWeb3_js.publicKey("tokenMintB"),
    solanaWeb3_js.publicKey("tokenVaultB"),
    solanaWeb3_js.u128("feeGrowthGlobalB"),
    solanaWeb3_js.u64("rewardLastUpdatedTimestamp"),
    solanaWeb3_js.seq(WHIRLPOOL_REWARD_LAYOUT, 3, "rewardInfos"),
  ]);

  const TICK_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.bool("initialized"),
    solanaWeb3_js.i128("liquidityNet"),
    solanaWeb3_js.u128("liquidityGross"),
    solanaWeb3_js.u128("feeGrowthOutsideA"),
    solanaWeb3_js.u128("feeGrowthOutsideB"),
    solanaWeb3_js.seq(solanaWeb3_js.u128(), 3, "reward_growths_outside"),
  ]);

  const TICK_ARRAY_LAYOUT$1 = solanaWeb3_js.struct([
    solanaWeb3_js.u64("anchorDiscriminator"),
    solanaWeb3_js.i32("startTickIndex"),
    solanaWeb3_js.seq(TICK_LAYOUT, 88, "ticks"),
    solanaWeb3_js.publicKey("whirlpool"),
  ]);

  var LAYOUTS$1 = {
    TICK_ARRAY_LAYOUT: TICK_ARRAY_LAYOUT$1,
    WHIRLPOOL_LAYOUT,
  };

  const MAX_SWAP_TICK_ARRAYS = 3;
  const MAX_TICK_INDEX = 443636; // i32
  const MIN_TICK_INDEX = -443636; // i32
  const TICK_ARRAY_SIZE$2 = 88; // i32

  const getStartTickIndex = (tickIndex, tickSpacing, offset) => {
    const realIndex = Math.floor(tickIndex / tickSpacing / TICK_ARRAY_SIZE$2);
    const startTickIndex = (realIndex + offset) * tickSpacing * TICK_ARRAY_SIZE$2;

    const ticksInArray = TICK_ARRAY_SIZE$2 * tickSpacing;
    const minTickIndex = MIN_TICK_INDEX - ((MIN_TICK_INDEX % ticksInArray) + ticksInArray);
    if(startTickIndex < minTickIndex) { throw(`startTickIndex is too small - - ${startTickIndex}`) }
    if(startTickIndex > MAX_TICK_INDEX) { throw(`startTickIndex is too large - ${startTickIndex}`) }
    return startTickIndex
  };

  const getTickArrayAddresses = async({ aToB, pool, tickSpacing, tickCurrentIndex })=>{
    const shift = aToB ? 0 : tickSpacing;
    let offset = 0;
    let tickArrayAddresses = [];
    for (let i = 0; i < MAX_SWAP_TICK_ARRAYS; i++) {
      let startIndex;
      try {
        startIndex = getStartTickIndex(tickCurrentIndex + shift, tickSpacing, offset);
      } catch (e) {
        return tickArrayAddresses
      }

      const pda = (
        await solanaWeb3_js.PublicKey.findProgramAddress([
            solanaWeb3_js.Buffer.from('tick_array'),
            new solanaWeb3_js.PublicKey(pool.toString()).toBuffer(),
            solanaWeb3_js.Buffer.from(startIndex.toString())
          ],
          new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
        )
      )[0];
      tickArrayAddresses.push(pda);
      offset = aToB ? offset - 1 : offset + 1;
    }

    return tickArrayAddresses
  };

  const getTickArrays = async ({ 
    pool, // stale whirlpool pubkey
    freshWhirlpoolData, // fresh whirlpool account data
    aToB, // direction
  })=>{

    const tickArrayAddresses = await getTickArrayAddresses({ aToB, pool, tickSpacing: freshWhirlpoolData.tickSpacing, tickCurrentIndex: freshWhirlpoolData.tickCurrentIndex });

    return (
      await Promise.all(tickArrayAddresses.map(async(address, index) => {

        let data;
        try {
          data = await request({
            blockchain: 'solana' ,
            address: address.toString(),
            api: TICK_ARRAY_LAYOUT$1,
            cache: 5000, // 5 seconds in ms
            cacheKey: ['whirlpool', 'tick', address.toString()].join('-')
          });
        } catch (e2) {}

        return { address, data }
      }))
    )
  };

  class TickArrayIndex {
    
    static fromTickIndex(index, tickSpacing) {
      const arrayIndex = Math.floor(Math.floor(index / tickSpacing) / TICK_ARRAY_SIZE$2);
      let offsetIndex = Math.floor((index % (tickSpacing * TICK_ARRAY_SIZE$2)) / tickSpacing);
      if (offsetIndex < 0) {
        offsetIndex = TICK_ARRAY_SIZE$2 + offsetIndex;
      }
      return new TickArrayIndex(arrayIndex, offsetIndex, tickSpacing)
    }

    constructor(arrayIndex, offsetIndex, tickSpacing) {
      if (offsetIndex >= TICK_ARRAY_SIZE$2) {
        throw new Error("Invalid offsetIndex - value has to be smaller than TICK_ARRAY_SIZE")
      }
      if (offsetIndex < 0) {
        throw new Error("Invalid offsetIndex - value is smaller than 0")
      }

      if (tickSpacing < 0) {
        throw new Error("Invalid tickSpacing - value is less than 0")
      }

      this.arrayIndex = arrayIndex;
      this.offsetIndex = offsetIndex;
      this.tickSpacing = tickSpacing;
    }

    toTickIndex() {
      return (
        this.arrayIndex * TICK_ARRAY_SIZE$2 * this.tickSpacing + this.offsetIndex * this.tickSpacing
      );
    }

    toNextInitializableTickIndex() {
      return TickArrayIndex.fromTickIndex(this.toTickIndex() + this.tickSpacing, this.tickSpacing)
    }

    toPrevInitializableTickIndex() {
      return TickArrayIndex.fromTickIndex(this.toTickIndex() - this.tickSpacing, this.tickSpacing)
    }
  }

  class TickArraySequence {

    constructor(tickArrays, tickSpacing, aToB) {
      if (!tickArrays[0] || !tickArrays[0].data) {
        throw new Error("TickArray index 0 must be initialized");
      }

      // If an uninitialized TickArray appears, truncate all TickArrays after it (inclusive).
      this.sequence = [];
      for (const tickArray of tickArrays) {
        if (!tickArray || !tickArray.data) {
          break;
        }
        this.sequence.push({
          address: tickArray.address,
          data: tickArray.data,
        });
      }

      this.tickArrays = tickArrays;
      this.tickSpacing = tickSpacing;
      this.aToB = aToB;

      this.touchedArrays = [...Array(this.sequence.length).fill(false)];
      this.startArrayIndex = TickArrayIndex.fromTickIndex(
        this.sequence[0].data.startTickIndex,
        this.tickSpacing
      ).arrayIndex;
    }

    isValidTickArray0(tickCurrentIndex) {
      const shift = this.aToB ? 0 : this.tickSpacing;
      const tickArray = this.sequence[0].data;
      return this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, tickCurrentIndex + shift);
    }

    getNumOfTouchedArrays() {
      return this.touchedArrays.filter((val) => !!val).length;
    }

    getTouchedArrays(minArraySize) {
      let result = this.touchedArrays.reduce((prev, curr, index) => {
        if (curr) {
          prev.push(this.sequence[index].address);
        }
        return prev;
      }, []);

      // Edge case: nothing was ever touched.
      if (result.length === 0) {
        return [];
      }

      // The quote object should contain the specified amount of tick arrays to be plugged
      // directly into the swap instruction.
      // If the result does not fit minArraySize, pad the rest with the last touched array
      const sizeDiff = minArraySize - result.length;
      if (sizeDiff > 0) {
        result = result.concat(Array(sizeDiff).fill(result[result.length - 1]));
      }

      return result;
    }

    getTick(index) {
      const targetTaIndex = TickArrayIndex.fromTickIndex(index, this.tickSpacing);

      if (!this.isArrayIndexInBounds(targetTaIndex, this.aToB)) {
        throw new Error("Provided tick index is out of bounds for this sequence.");
      }

      const localArrayIndex = this.getLocalArrayIndex(targetTaIndex.arrayIndex, this.aToB);
      const tickArray = this.sequence[localArrayIndex].data;

      this.touchedArrays[localArrayIndex] = true;

      if (!tickArray) {
        throw new Error(
          `TickArray at index ${localArrayIndex} is not initialized.`
        );
      }

      if (!this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, index)) {
        throw new Error(
          `TickArray at index ${localArrayIndex} is unexpected for this sequence.`
        );
      }

      return tickArray.ticks[targetTaIndex.offsetIndex];
    }
    /**
     * if a->b, currIndex is included in the search
     * if b->a, currIndex is always ignored
     * @param currIndex
     * @returns
     */
    findNextInitializedTickIndex(currIndex) {
      const searchIndex = this.aToB ? currIndex : currIndex + this.tickSpacing;
      let currTaIndex = TickArrayIndex.fromTickIndex(searchIndex, this.tickSpacing);

      // Throw error if the search attempted to search for an index out of bounds
      if (!this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
        throw new Error(
          `Swap input value traversed too many arrays. Out of bounds at attempt to traverse tick index - ${currTaIndex.toTickIndex()}.`
        );
      }

      while (this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
        const currTickData = this.getTick(currTaIndex.toTickIndex());
        if (currTickData.initialized) {
          return { nextIndex: currTaIndex.toTickIndex(), nextTickData: currTickData };
        }
        currTaIndex = this.aToB
          ? currTaIndex.toPrevInitializableTickIndex()
          : currTaIndex.toNextInitializableTickIndex();
      }

      const lastIndexInArray = Math.max(
        Math.min(
          this.aToB ? currTaIndex.toTickIndex() + this.tickSpacing : currTaIndex.toTickIndex() - 1,
          MAX_TICK_INDEX
        ),
        MIN_TICK_INDEX
      );

      return { nextIndex: lastIndexInArray, nextTickData: null };
    }

    getLocalArrayIndex(arrayIndex, aToB) {
      return aToB ? this.startArrayIndex - arrayIndex : arrayIndex - this.startArrayIndex;
    }

    /**
     * Check whether the array index potentially exists in this sequence.
     * Note: assumes the sequence of tick-arrays are sequential
     * @param index
     */
    isArrayIndexInBounds(index, aToB) {
      // a+0...a+n-1 array index is ok
      const localArrayIndex = this.getLocalArrayIndex(index.arrayIndex, aToB);
      const seqLength = this.sequence.length;
      return localArrayIndex >= 0 && localArrayIndex < seqLength;
    }

    checkIfIndexIsInTickArrayRange(startTick, tickIndex) {
      const upperBound = startTick + this.tickSpacing * TICK_ARRAY_SIZE$2;
      return tickIndex >= startTick && tickIndex < upperBound;
    }
  }

  const getPrice = async ({
    account, // stale whirlpool account
    tokenIn,
    tokenOut,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    pairsDatum
  })=>{

    try {
      
      let freshWhirlpoolData;
      if(pairsDatum) {
        freshWhirlpoolData = account;
      } else {
        freshWhirlpoolData = await request({
          blockchain: 'solana',
          address: account.pubkey.toString(),
          api: WHIRLPOOL_LAYOUT,
          cache: 5000, // 5 seconds in ms
          cacheKey: ['whirlpool', 'fresh', tokenIn.toString(), tokenOut.toString()].join('-')
        });
      }

      let poolMints = [freshWhirlpoolData.tokenMintA.toString(), freshWhirlpoolData.tokenMintB.toString()];

      if(!poolMints.includes(tokenIn) || !poolMints.includes(tokenOut)) {
        console.log('wrong freshWhirlpoolData!', poolMints, tokenIn, tokenOut);
        throw('wrong freshWhirlpoolData!', poolMints, tokenIn, tokenOut)
      }

      const aToB = (freshWhirlpoolData.tokenMintA.toString() === tokenIn);

      const tickArrays = await getTickArrays({ pool: account.pubkey, freshWhirlpoolData, aToB });

      const tickSequence = new TickArraySequence(tickArrays, freshWhirlpoolData.tickSpacing, aToB);

      const sqrtPriceLimit = new solanaWeb3_js.BN(aToB ? MIN_SQRT_PRICE : MAX_SQRT_PRICE);

      const amount = amountIn || amountInMax || amountOut || amountOutMin;

      const amountSpecifiedIsInput = !!(amountIn || amountInMax);

      const amountCalculated = compute({
        tokenAmount: new solanaWeb3_js.BN(amount.toString()),
        aToB,
        freshWhirlpoolData,
        tickSequence,
        sqrtPriceLimit,
        amountSpecifiedIsInput,
      });

      if(amountCalculated.toString() == "0"){
        throw('amountCalculated cant be zero!')
      }

      return {
        price: amountCalculated.toString(),
        tickArrays,
        aToB,
        sqrtPriceLimit,
      }

    } catch(e) {
      return {
        price: undefined,
        tickArrays: undefined,
        aToB: undefined,
        sqrtPriceLimit: undefined,
      }
    }
  };

  // This method is cached and is only to be used to generally existing pools every 24h
  // Do not use for price calulations, fetch accounts for pools individually in order to calculate price 
  let getAccounts = async (base, quote) => {
    if(quote === Blockchains__default['default'].solana.wrapped.address) { return [] } // WSOL is base not QUOTE!
    let accounts = await request(`solana://whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc/getProgramAccounts`, {
      params: { filters: [
        { dataSize: WHIRLPOOL_LAYOUT.span },
        { memcmp: { offset: 101, bytes: base }}, // tokenMintA
        { memcmp: { offset: 181, bytes: quote }} // tokenMintB
      ]},
      api: WHIRLPOOL_LAYOUT,
      cache: 21600000, // 6 hours in ms
      cacheKey: ['whirlpool', base.toString(), quote.toString()].join('-')
    });
    return accounts
  };

  let getPairsWithPrice$3 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum }) => {
    try {
      let accounts;
      if(pairsDatum) {
        accounts = [
          {...
            await request(`solana://${pairsDatum.id}/getAccountInfo`, { api: WHIRLPOOL_LAYOUT, cache: 5000 }),
            pubkey: new solanaWeb3_js.PublicKey(pairsDatum.id),
          }
        ];
      } else {
        accounts = await getAccounts(tokenIn, tokenOut);
        if(accounts.length === 0) { accounts = await getAccounts(tokenOut, tokenIn); }
        accounts = accounts.filter((account)=>account.data.liquidity.gt(1));
      }
      accounts = (await Promise.all(accounts.map(async(account)=>{
        const { price, tickArrays, sqrtPriceLimit } = await getPrice({ account, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum });
        if(price === undefined) { return false }

        return { // return a copy, do not mutate accounts
          pubkey: account.pubkey,
          price: price,
          tickArrays: tickArrays,
          sqrtPriceLimit: sqrtPriceLimit,
          tokenVaultA: account.tokenVaultA || account.data.tokenVaultA, 
          tokenVaultB: account.tokenVaultB || account.data.tokenVaultB,
          tokenMintA: account.tokenMintA || account.data.tokenMintA, 
          tokenMintB: account.tokenMintB || account.data.tokenMintB,
        }
      }))).filter(Boolean);
      return accounts
    } catch(e) {
      return []
    }
  };

  let getHighestPrice$1 = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).gt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getLowestPrice$1 = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).lt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getBestPair$1 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum }) => {
    const pairs = await getPairsWithPrice$3({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum });

    if(!pairs || pairs.length === 0) { return }

    let bestPair;

    if(amountIn || amountInMax) {
      bestPair = getHighestPrice$1(pairs);
    } else { // amount out
      bestPair = getLowestPrice$1(pairs);
    }
    return bestPair
  };

  function _optionalChain$8(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


  const blockchain$3 = Blockchains__default['default'].solana;

  // Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
  //
  // We keep 11111111111111111111111111111111 internally
  // to be able to differentiate between SOL<>Token and WSOL<>Token swaps
  // as they are not the same!
  //
  let getExchangePath$5 = ({ path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === blockchain$3.currency.address && path[index+1] != blockchain$3.wrapped.address &&
        path[index-1] != blockchain$3.wrapped.address
      ) {
        return blockchain$3.wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == blockchain$3.currency.address && exchangePath[1] == blockchain$3.wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == blockchain$3.currency.address && exchangePath[exchangePath.length-2] == blockchain$3.wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  let pathExists$6 = async ({ path, amountIn, amountInMax, amountOut, amountOutMin }) => {
    if(path.length == 1) { return false }
    path = getExchangePath$5({ path });
    if((await getPairsWithPrice$3({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin })).length > 0) {
      return true
    } else {
      return false
    }
  };

  let findPath$6 = async ({ tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, pairsData }) => {
    
    if(pairsData) {
      let path;
      if(pairsData.length == 1) {
        path = [tokenIn, tokenOut];
      } else if(pairsData.length == 2) {
        const tokenMiddle = [pairsData[0].mintA, pairsData[0].mintB].includes(pairsData[1].mintA) ? pairsData[1].mintA : pairsData[1].mintB;
        path = [tokenIn, tokenMiddle, tokenOut];
      }
      if(path) {
        return { path , exchangePath: getExchangePath$5({ path }), pools: await Promise.all(pairsData.map(async(pairsDatum)=>{
          return {...
            await request(`solana://${pairsDatum.id}/getAccountInfo`, { api: WHIRLPOOL_LAYOUT, cache: 5000 }),
            pubkey: new solanaWeb3_js.PublicKey(pairsDatum.id)
          }
        })) }
      }
    }

    if(
      [tokenIn, tokenOut].includes(blockchain$3.currency.address) &&
      [tokenIn, tokenOut].includes(blockchain$3.wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path, stablesIn, stablesOut, stable;

    if (await pathExists$6({ path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != blockchain$3.wrapped.address &&
      tokenIn != blockchain$3.currency.address &&
      await pathExists$6({ path: [tokenIn, blockchain$3.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
      tokenOut != blockchain$3.wrapped.address &&
      tokenOut != blockchain$3.currency.address &&
      await pathExists$6({ path: [tokenOut, blockchain$3.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
    ) {
      // path via blockchain.wrapped.address
      path = [tokenIn, blockchain$3.wrapped.address, tokenOut];
    } else if (
      !blockchain$3.stables.usd.includes(tokenIn) &&
      (stablesIn = (await Promise.all(blockchain$3.stables.usd.map(async(stable)=>await pathExists$6({ path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
      !blockchain$3.stables.usd.includes(tokenOut) &&
      (stablesOut = (await Promise.all(blockchain$3.stables.usd.map(async(stable)=>await pathExists$6({ path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
      (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
    ) {
      // path via TOKEN_IN <> STABLE <> TOKEN_OUT
      path = [tokenIn, stable, tokenOut];
    }

    // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$8([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$3.currency.address) {
      path.splice(1, 0, blockchain$3.wrapped.address);
    } else if(_optionalChain$8([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$3.currency.address) {
      path.splice(path.length-1, 0, blockchain$3.wrapped.address);
    }
    return { path, exchangePath: getExchangePath$5({ path }) }
  };

  let getAmountsOut$1 = async ({ path, amountIn, amountInMax, pairsData }) => {

    let pools = [];
    let amounts = [ethers.ethers.BigNumber.from(amountIn || amountInMax)];

    let bestPair = await getBestPair$1({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, pairsDatum: pairsData && pairsData[0] });
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
    pools.push(bestPair);
    
    if (path.length === 3) {
      let bestPair = await getBestPair$1({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[1] });
      if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
      amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
      pools.push(bestPair);
    }

    if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

    return { amounts, pools }
  };

  let getAmountsIn$1 = async({ path, amountOut, amountOutMin, pairsData }) => {

    path = path.slice().reverse();
    let pools = [];
    let amounts = [ethers.ethers.BigNumber.from(amountOut || amountOutMin)];

    let bestPair = await getBestPair$1({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin, pairsDatum: pairsData && (path.length === 2 ? pairsData[0] : pairsData[1]) });
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
    pools.push(bestPair);
    
    if (path.length === 3) {
      let bestPair = await getBestPair$1({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[0] });
      if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
      amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
      pools.push(bestPair);
    }
    
    if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

    return { amounts: amounts.slice().reverse(), pools: pools.slice().reverse() }
  };

  let getAmounts$6 = async ({
    path,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin,
    pairsData
  }) => {
    path = getExchangePath$5({ path });
    let amounts;
    let pools;
    if (amountOut) {
  ({ amounts, pools } = await getAmountsIn$1({ path, amountOut, tokenIn, tokenOut, pairsData }));
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
  ({ amounts, pools } = await getAmountsOut$1({ path, amountIn, tokenIn, tokenOut, pairsData }));
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
  ({ amounts, pools } = await getAmountsIn$1({ path, amountOutMin, tokenIn, tokenOut, pairsData }));
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
  ({ amounts, pools } = await getAmountsOut$1({ path, amountInMax, tokenIn, tokenOut, pairsData }));
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return {
      amountOut: (amountOut || amountOutMin),
      amountIn: (amountIn || amountInMax),
      amountInMax: (amountInMax || amountIn),
      amountOutMin: (amountOutMin || amountOut),
      amounts,
      pools,
    }
  };

  const blockchain$2 = Blockchains__default['default'].solana;
  const SWAP_INSTRUCTION = new solanaWeb3_js.BN("14449647541112719096");
  const TWO_HOP_SWAP_INSTRUCTION = new solanaWeb3_js.BN("16635068063392030915");

  const createTokenAccountIfNotExisting$1 = async ({ instructions, owner, token, account })=>{
    let outAccountExists;
    try{ outAccountExists = !!(await request({ blockchain: 'solana', address: account.toString() })); } catch (e2) {}
    if(!outAccountExists) {
      instructions.push(
        await Token.solana.createAssociatedTokenAccountInstruction({
          token,
          owner,
          payer: owner,
        })
      );
    }
  };

  const getTwoHopSwapInstructionKeys = async ({
    account,
    poolOne,
    tickArraysOne,
    tokenAccountOneA,
    tokenVaultOneA,
    tokenAccountOneB,
    tokenVaultOneB,
    poolTwo,
    tickArraysTwo,
    tokenAccountTwoA,
    tokenVaultTwoA,
    tokenAccountTwoB,
    tokenVaultTwoB,
  })=> {

    let lastInitializedTickOne = false;
    const onlyInitializedTicksOne = tickArraysOne.map((tickArray, index)=>{
      if(lastInitializedTickOne !== false) {
        return tickArraysOne[lastInitializedTickOne]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTickOne = index-1;
        return tickArraysOne[index-1]
      }
    });

    let lastInitializedTickTwo = false;
    const onlyInitializedTicksTwo = tickArraysTwo.map((tickArray, index)=>{
      if(lastInitializedTickTwo !== false) {
        return tickArraysTwo[lastInitializedTickTwo]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTickTwo = index-1;
        return tickArraysTwo[index-1]
      }
    });

    return [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // token_authority
      { pubkey: new solanaWeb3_js.PublicKey(account), isWritable: false, isSigner: true },
      // whirlpool_one
      { pubkey: new solanaWeb3_js.PublicKey(poolOne.toString()), isWritable: true, isSigner: false },
      // whirlpool_two
      { pubkey: new solanaWeb3_js.PublicKey(poolTwo.toString()), isWritable: true, isSigner: false },
      // token_owner_account_one_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountOneA.toString()), isWritable: true, isSigner: false },
      // token_vault_one_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultOneA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_one_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountOneB.toString()), isWritable: true, isSigner: false },
      // token_vault_one_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultOneB.toString()), isWritable: true, isSigner: false },
      // token_owner_account_two_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountTwoA.toString()), isWritable: true, isSigner: false },
      // token_vault_two_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultTwoA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_two_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountTwoB.toString()), isWritable: true, isSigner: false },
      // token_vault_two_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultTwoB.toString()), isWritable: true, isSigner: false },
      // tick_array_one_0
      { pubkey: onlyInitializedTicksOne[0].address, isWritable: true, isSigner: false },
      // tick_array_one_1
      { pubkey: onlyInitializedTicksOne[1].address, isWritable: true, isSigner: false },
      // tick_array_one_2
      { pubkey: onlyInitializedTicksOne[2].address, isWritable: true, isSigner: false },
      // tick_array_two_0
      { pubkey: onlyInitializedTicksTwo[0].address, isWritable: true, isSigner: false },
      // tick_array_two_1
      { pubkey: onlyInitializedTicksTwo[1].address, isWritable: true, isSigner: false },
      // tick_array_two_2
      { pubkey: onlyInitializedTicksTwo[2].address, isWritable: true, isSigner: false },
      // oracle_one
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(poolOne.toString()).toBuffer() ], new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
      // oracle_two
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(poolTwo.toString()).toBuffer() ], new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
    ]
  };
  const getTwoHopSwapInstructionData = ({
    amount,
    otherAmountThreshold,
    amountSpecifiedIsInput,
    aToBOne,
    aToBTwo,
    sqrtPriceLimitOne,
    sqrtPriceLimitTwo,
  })=> {
    let LAYOUT, data;

    LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToBOne"),
      solanaWeb3_js.bool("aToBTwo"),
      solanaWeb3_js.u128("sqrtPriceLimitOne"),
      solanaWeb3_js.u128("sqrtPriceLimitTwo"),
    ]);
    data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
    LAYOUT.encode(
      {
        anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION,
        amount: new solanaWeb3_js.BN(amount.toString()),
        otherAmountThreshold: new solanaWeb3_js.BN(otherAmountThreshold.toString()),
        amountSpecifiedIsInput,
        aToBOne,
        aToBTwo,
        sqrtPriceLimitOne,
        sqrtPriceLimitTwo,
      },
      data,
    );

    return data
  };

  const getSwapInstructionKeys = async ({
    account,
    pool,
    tokenAccountA,
    tokenVaultA,
    tokenAccountB,
    tokenVaultB,
    tickArrays,
  })=> {

    let lastInitializedTick = false;
    const onlyInitializedTicks = tickArrays.map((tickArray, index)=>{
      if(lastInitializedTick !== false) {
        return tickArrays[lastInitializedTick]
      } else if(tickArray.data){
        return tickArray
      } else {
        lastInitializedTick = index-1;
        return tickArrays[index-1]
      }
    });

    return [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isWritable: false, isSigner: false },
      // token_authority
      { pubkey: new solanaWeb3_js.PublicKey(account), isWritable: false, isSigner: true },
      // whirlpool
      { pubkey: new solanaWeb3_js.PublicKey(pool.toString()), isWritable: true, isSigner: false },
      // token_owner_account_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountA.toString()), isWritable: true, isSigner: false },
      // token_vault_a
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultA.toString()), isWritable: true, isSigner: false },
      // token_owner_account_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenAccountB.toString()), isWritable: true, isSigner: false },
      // token_vault_b
      { pubkey: new solanaWeb3_js.PublicKey(tokenVaultB.toString()), isWritable: true, isSigner: false },
      // tick_array_0
      { pubkey: onlyInitializedTicks[0].address, isWritable: true, isSigner: false },
      // tick_array_1
      { pubkey: onlyInitializedTicks[1].address, isWritable: true, isSigner: false },
      // tick_array_2
      { pubkey: onlyInitializedTicks[2].address, isWritable: true, isSigner: false },
      // oracle
      { pubkey: (await solanaWeb3_js.PublicKey.findProgramAddress([ solanaWeb3_js.Buffer.from('oracle'), new solanaWeb3_js.PublicKey(pool.toString()).toBuffer() ], new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')))[0], isWritable: false, isSigner: false },
    ]
  };

  const getSwapInstructionData = ({ amount, otherAmountThreshold, sqrtPriceLimit, amountSpecifiedIsInput, aToB })=> {
    let LAYOUT, data;
    
    LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.u128("sqrtPriceLimit"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToB"),
    ]);
    data = solanaWeb3_js.Buffer.alloc(LAYOUT.span);
    LAYOUT.encode(
      {
        anchorDiscriminator: SWAP_INSTRUCTION,
        amount: new solanaWeb3_js.BN(amount.toString()),
        otherAmountThreshold: new solanaWeb3_js.BN(otherAmountThreshold.toString()),
        sqrtPriceLimit,
        amountSpecifiedIsInput,
        aToB,
      },
      data,
    );

    return data
  };

  const getTransaction$6 = async ({
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amounts,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account,
    pools
  }) => {
    let transaction = { blockchain: 'solana' };
    let instructions = [];

    const exchangePath = getExchangePath$5({ path });
    if(exchangePath.length > 3) { throw 'Orca can only handle fixed paths with a max length of 3 (2 pools)!' }
    const tokenIn = exchangePath[0];
    const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined;
    const tokenOut = exchangePath[exchangePath.length-1];

    let pairs;
    if(pools) {
      pairs = pools;
    } else if(exchangePath.length == 2) {
      pairs = [await getBestPair$1({ tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })];
    } else {
      if(amountInInput || amountInMaxInput) {
        pairs = [await getBestPair$1({ tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })];
        pairs.push(await getBestPair$1({ tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }));
      } else { // originally amountOut
        pairs = [await getBestPair$1({ tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })];
        pairs.unshift(await getBestPair$1({ tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }));
      }
    }

    let startsWrapped = (path[0] === blockchain$2.currency.address && exchangePath[0] === blockchain$2.wrapped.address);
    let endsUnwrapped = (path[path.length-1] === blockchain$2.currency.address && exchangePath[exchangePath.length-1] === blockchain$2.wrapped.address);
    let wrappedAccount;
    const provider = await getProvider('solana');
    
    if(startsWrapped || endsUnwrapped) {
      const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span);
      const keypair = solanaWeb3_js.Keypair.generate();
      wrappedAccount = keypair.publicKey.toString();
      const lamports = startsWrapped ? new solanaWeb3_js.BN(amountIn.toString()).add(new solanaWeb3_js.BN(rent)) :  new solanaWeb3_js.BN(rent);
      let createAccountInstruction = solanaWeb3_js.SystemProgram.createAccount({
        fromPubkey: new solanaWeb3_js.PublicKey(account),
        newAccountPubkey: new solanaWeb3_js.PublicKey(wrappedAccount),
        programId: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM),
        space: Token.solana.TOKEN_LAYOUT.span,
        lamports
      });
      createAccountInstruction.signers = [keypair];
      instructions.push(createAccountInstruction);
      instructions.push(
        Token.solana.initializeAccountInstruction({
          account: wrappedAccount,
          token: blockchain$2.wrapped.address,
          owner: account
        })
      );
    }

    if(pairs.length === 1) {
      // amount is NOT the precise part of the swap (otherAmountThreshold is)
      let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput);
      let amount = amountSpecifiedIsInput ? amountIn : amountOut;
      let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax;
      let tokenAccountIn = startsWrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
      let tokenAccountOut = endsUnwrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
      if(!endsUnwrapped) {
        await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
      }
      let aToB = tokenIn.toLowerCase() == pairs[0].tokenMintA.toString().toLowerCase();
      instructions.push(
        new solanaWeb3_js.TransactionInstruction({
          programId: new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
          keys: await getSwapInstructionKeys({
            account,
            pool: pairs[0].pubkey,
            tokenAccountA: aToB ? tokenAccountIn : tokenAccountOut,
            tokenVaultA: pairs[0].tokenVaultA,
            tokenAccountB: aToB ? tokenAccountOut : tokenAccountIn,
            tokenVaultB: pairs[0].tokenVaultB,
            tickArrays: pairs[0].tickArrays,
          }),
          data: getSwapInstructionData({
            amount,
            otherAmountThreshold,
            sqrtPriceLimit: pairs[0].sqrtPriceLimit,
            amountSpecifiedIsInput,
            aToB
          }),
        })
      );
    } else if (pairs.length === 2) {
      // amount is NOT the precise part of the swap (otherAmountThreshold is)
      let amountSpecifiedIsInput = !!(amountInInput || amountOutMinInput);
      let amount = amountSpecifiedIsInput ? amountIn : amountOut;
      let otherAmountThreshold = amountSpecifiedIsInput ? amountOutMin : amountInMax;
      let tokenAccountIn = startsWrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
      let tokenMiddle = exchangePath[1];
      let tokenAccountMiddle = new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }));
      await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenMiddle, account: tokenAccountMiddle });
      let tokenAccountOut = endsUnwrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
      if(!endsUnwrapped) {
        await createTokenAccountIfNotExisting$1({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
      }
      console.log('pairs[0].tokenMintA.toString()', pairs[0].tokenMintA.toString());
      console.log('tokenIn.toLowerCase()', tokenIn.toLowerCase());
      let aToBOne = tokenIn.toLowerCase() == pairs[0].tokenMintA.toString().toLowerCase();
      console.log('aToBOne', aToBOne);
      console.log('pairs[1].tokenMintB.toString()', pairs[1].tokenMintB.toString());
      console.log('tokenOut.toLowerCase()', tokenOut.toLowerCase());
      let aToBTwo = tokenOut.toLowerCase() == pairs[1].tokenMintB.toString().toLowerCase();
      console.log('aToBTwo', aToBTwo);
      instructions.push(
        new solanaWeb3_js.TransactionInstruction({
          programId: new solanaWeb3_js.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
          keys: await getTwoHopSwapInstructionKeys({
            account,
            poolOne: pairs[0].pubkey,
            tickArraysOne: pairs[0].tickArrays,
            tokenAccountOneA: aToBOne ? tokenAccountIn : tokenAccountMiddle,
            tokenVaultOneA: pairs[0].tokenVaultA,
            tokenAccountOneB: aToBOne ? tokenAccountMiddle : tokenAccountIn,
            tokenVaultOneB: pairs[0].tokenVaultB,
            poolTwo: pairs[1].pubkey,
            tickArraysTwo: pairs[1].tickArrays,
            tokenAccountTwoA: aToBTwo ? tokenAccountMiddle : tokenAccountOut,
            tokenVaultTwoA: pairs[1].tokenVaultA,
            tokenAccountTwoB: aToBTwo ? tokenAccountOut : tokenAccountMiddle,
            tokenVaultTwoB: pairs[1].tokenVaultB,
          }),
          data: getTwoHopSwapInstructionData({
            amount,
            otherAmountThreshold,
            amountSpecifiedIsInput,
            aToBOne,
            aToBTwo,
            sqrtPriceLimitOne: pairs[0].sqrtPriceLimit,
            sqrtPriceLimitTwo: pairs[1].sqrtPriceLimit,
          }),
        })
      );
    }
    
    if(startsWrapped || endsUnwrapped) {
      instructions.push(
        Token.solana.closeAccountInstruction({
          account: wrappedAccount,
          owner: account
        })
      );
    }

    // await debug(instructions, provider)

    transaction.instructions = instructions;
    return transaction
  };

  var Orca = {
    findPath: findPath$6,
    pathExists: pathExists$6,
    getAmounts: getAmounts$6,
    getTransaction: getTransaction$6,
    WHIRLPOOL_LAYOUT,
  };

  const exchange$i = {
    
    name: 'orca',
    label: 'Orca',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImthdG1hbl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNjAwIDQ1MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAwIDQ1MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjRkZEMTVDIiBkPSJNNDg4LjQsMjIyLjljMCwxMDMuOC04NC4xLDE4Ny45LTE4Ny45LDE4Ny45Yy0xMDMuOCwwLTE4Ny45LTg0LjEtMTg3LjktMTg3LjlDMTEyLjYsMTE5LjEsMTk2LjcsMzUsMzAwLjUsMzUKCUM0MDQuMiwzNSw0ODguNCwxMTkuMSw0ODguNCwyMjIuOXoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjE3LjY3NTUiIGQ9Ik0yMDkuNSwyOTkuOGMxLjYtMS4xLDMuMS0yLjgsMy45LTUuMWMwLjgtMi42LDAuMy00LjksMC02LjJjMCwwLDAtMC4xLDAtMC4xbDAuMy0xLjhjMC45LDAuNSwxLjksMS4xLDMsMS45CgljMC4zLDAuMiwwLjcsMC41LDEuMSwwLjdjMC41LDAuNCwxLjEsMC44LDEuNCwxYzAuNiwwLjQsMS41LDEsMi41LDEuNWMyNS4xLDE1LjYsNDUuOCwyMiw2Mi4yLDIxLjJjMTctMC44LDI4LjktOS40LDM1LjEtMjEuOQoJYzUuOS0xMi4xLDYuMi0yNywyLTQwLjljLTQuMi0xMy45LTEzLTI3LjUtMjYuMi0zNi45Yy0yMi4yLTE1LjgtNDIuNS0zOS44LTUyLjctNjAuM2MtNS4yLTEwLjQtNy4zLTE4LjctNi43LTI0LjIKCWMwLjMtMi41LDEtNC4xLDItNS4xYzAuOS0xLDIuNi0yLjEsNS45LTIuNmM2LjktMS4xLDE1LTMuNiwyMy4xLTYuMmMzLjItMSw2LjMtMiw5LjUtMi45YzExLjctMy40LDI0LjItNi4zLDM3LjItNi4zCgljMjUuMywwLDU1LDExLDg2LjMsNTYuOGM0MC4yLDU4LjgsMTguMSwxMjQuNC0yOC4yLDE1OC45Yy0yMy4xLDE3LjItNTEuOSwyNi4zLTgxLjUsMjIuOUMyNjIuOSwzNDEuMywyMzQuOSwzMjcuOSwyMDkuNSwyOTkuOHoKCSBNMjE0LjIsMjg0LjZDMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjcsMjE0LjIsMjg0LjZDMjE0LjEsMjg0LjcsMjE0LjIsMjg0LjYsMjE0LjIsMjg0LjZ6IE0yMTEuNiwyODUuOAoJQzIxMS42LDI4NS44LDIxMS43LDI4NS44LDIxMS42LDI4NS44QzIxMS43LDI4NS44LDIxMS42LDI4NS44LDIxMS42LDI4NS44eiIvPgo8cGF0aCBkPSJNMjMyLjUsMTI0LjNjMCwwLDcxLjgtMTkuMSw4Ny41LTE5LjFjMTUuNywwLDc4LjYsMzAuNSw5Ni45LDg2LjNjMjYsNzktNDQuNywxMzAuOS01Mi43LDEyNS44CgljNzYuMS02Mi45LTQ4LjQtMTc5LjEtMTA5LjYtMTcwLjRjLTcuNiwxLjEtMy40LDcuNi0zLjQsNy42bC0xLjcsMTdsLTEyLjctMjEuMkwyMzIuNSwxMjQuM3oiLz4KPHBhdGggZD0iTTQwNi41LDE2Ny42YzIyLjcsMzkuOSwxOCwxNy4xLDEyLjksNjIuN2M5LjMtMTUuMSwyMy45LTMuOCwyOS45LDJjMS4xLDEsMi45LDAuNCwyLjgtMS4xYy0wLjItNi44LTIuMi0yMS40LTEzLjQtMzcuMQoJQzQyMy40LDE3Mi42LDQwNi41LDE2Ny42LDQwNi41LDE2Ny42eiIvPgo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC45OTMiIGQ9Ik00MTkuNCwyMzAuM2M1LTQ1LjYsOS43LTIyLjgtMTIuOS02Mi43YzAsMCwxNi45LDUsMzIuMywyNi41YzExLjIsMTUuNywxMy4xLDMwLjMsMTMuNCwzNy4xCgljMC4xLDEuNS0xLjcsMi4xLTIuOCwxLjFDNDQzLjMsMjI2LjUsNDI4LjcsMjE1LjMsNDE5LjQsMjMwLjN6IE00MTkuNCwyMzAuM2MwLjktMi4xLDIuMi01LjUsMi4yLTUuNSIvPgo8cGF0aCBkPSJNMjI0LDIyNC4yYy05LjYsMTYuMi0yOS4yLDE1LTI4LjgsMzQuM2MxNy41LDM5LDE3LjYsMzYuMiwxNy42LDM2LjJjMzIuNS0xOC4yLDE5LjEtNTguNSwxNC4zLTcwLjQKCUMyMjYuNiwyMjMsMjI0LjcsMjIzLDIyNCwyMjQuMnoiLz4KPHBhdGggZD0iTTE1MC40LDI2MC4xYzE4LjcsMi40LDI5LjgtMTMuOCw0NC44LTEuNmMxOS45LDM3LjgsMTcuNiwzNi4yLDE3LjYsMzYuMmMtMzQuNCwxNC40LTU3LjktMjEtNjQuMy0zMi4xCglDMTQ3LjgsMjYxLjMsMTQ5LDI1OS45LDE1MC40LDI2MC4xeiIvPgo8cGF0aCBkPSJNMzA2LjksMjM2YzAsMCwxOC43LDE5LjEsOC45LDIyLjFjLTEyLjItNy41LTM0LTEuNy00NC43LDEuOWMtMi42LDAuOS01LjItMS40LTQuMy00LjFjMy42LTEwLDEyLjYtMjguNiwyOS45LTMxCglDMzA2LjksMjIyLjQsMzA2LjksMjM2LDMwNi45LDIzNnoiLz4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTMxOC4zLDE0Mi41Yy0yLjEtMy02LjQtMTEsNi44LTExYzEzLjIsMCwzMy4zLDE0LjksMzcuNCwyMC40Yy0xLjMsMy40LTkuOCw0LjEtMTQsMy44Yy00LjItMC4zLTExLjUtMS0xNy0zLjgKCUMzMjYsMTQ5LjIsMzIwLjUsMTQ1LjUsMzE4LjMsMTQyLjV6Ii8+Cjwvc3ZnPgo=',
    protocol: 'orca',
    
    slippage: true,

    blockchains: ['solana'],

    solana: {
      router: {
        address: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
        api: Orca.WHIRLPOOL_LAYOUT,
      },
    }
  };

  var orca = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$i, {
        scope,

        findPath: (args)=>Orca.findPath({ ...args, exchange: exchange$i }),
        pathExists: (args)=>Orca.pathExists({ ...args, exchange: exchange$i }),
        getAmounts: (args)=>Orca.getAmounts({ ...args, exchange: exchange$i }),
        getPrep: (args)=>{},
        getTransaction: (args)=>Orca.getTransaction({ ...args, exchange: exchange$i }),
        getPrice,
        compute,
        getTickArrays,
        TickArraySequence,
        MIN_SQRT_PRICE,
        MAX_SQRT_PRICE,
        LAYOUTS: LAYOUTS$1,
      })
    )
  };

  // CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C
  const CPMM_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.publicKey("configId"),
    solanaWeb3_js.publicKey("poolCreator"),
    solanaWeb3_js.publicKey("vaultA"),
    solanaWeb3_js.publicKey("vaultB"),
    solanaWeb3_js.publicKey("mintLp"),
    solanaWeb3_js.publicKey("mintA"),
    solanaWeb3_js.publicKey("mintB"),
    solanaWeb3_js.publicKey("mintProgramA"),
    solanaWeb3_js.publicKey("mintProgramB"),
    solanaWeb3_js.publicKey("observationId"),
    solanaWeb3_js.u8("bump"),
    solanaWeb3_js.u8("status"),
    solanaWeb3_js.u8("lpDecimals"),
    solanaWeb3_js.u8("mintDecimalA"),
    solanaWeb3_js.u8("mintDecimalB"),
    solanaWeb3_js.u64("lpAmount"),
    solanaWeb3_js.u64("protocolFeesMintA"),
    solanaWeb3_js.u64("protocolFeesMintB"),
    solanaWeb3_js.u64("fundFeesMintA"),
    solanaWeb3_js.u64("fundFeesMintB"),
    solanaWeb3_js.u64("openTime"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 32),
  ]);

  const CPMM_CONFIG_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.u8("bump"),
    solanaWeb3_js.bool("disableCreatePool"),
    solanaWeb3_js.u16("index"),
    solanaWeb3_js.u64("tradeFeeRate"),
    solanaWeb3_js.u64("protocolFeeRate"),
    solanaWeb3_js.u64("fundFeeRate"),
    solanaWeb3_js.u64("createPoolFee"),

    solanaWeb3_js.publicKey("protocolOwner"),
    solanaWeb3_js.publicKey("fundOwner"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 16),
  ]);

  // CLMM 
  const RewardInfo = solanaWeb3_js.struct([
    solanaWeb3_js.u8("rewardState"),
    solanaWeb3_js.u64("openTime"),
    solanaWeb3_js.u64("endTime"),
    solanaWeb3_js.u64("lastUpdateTime"),
    solanaWeb3_js.u128("emissionsPerSecondX64"),
    solanaWeb3_js.u64("rewardTotalEmissioned"),
    solanaWeb3_js.u64("rewardClaimed"),
    solanaWeb3_js.publicKey("tokenMint"),
    solanaWeb3_js.publicKey("tokenVault"),
    solanaWeb3_js.publicKey("creator"),
    solanaWeb3_js.u128("rewardGrowthGlobalX64"),
  ]);

  const CLMM_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.u8("bump"),
    solanaWeb3_js.publicKey("ammConfig"),
    solanaWeb3_js.publicKey("creator"),
    solanaWeb3_js.publicKey("mintA"),
    solanaWeb3_js.publicKey("mintB"),
    solanaWeb3_js.publicKey("vaultA"),
    solanaWeb3_js.publicKey("vaultB"),
    solanaWeb3_js.publicKey("observationId"),
    solanaWeb3_js.u8("mintDecimalsA"),
    solanaWeb3_js.u8("mintDecimalsB"),
    solanaWeb3_js.u16("tickSpacing"),
    solanaWeb3_js.u128("liquidity"),
    solanaWeb3_js.u128("sqrtPriceX64"),
    solanaWeb3_js.i32("tickCurrent"),
    solanaWeb3_js.u32(),
    solanaWeb3_js.u128("feeGrowthGlobalX64A"),
    solanaWeb3_js.u128("feeGrowthGlobalX64B"),
    solanaWeb3_js.u64("protocolFeesTokenA"),
    solanaWeb3_js.u64("protocolFeesTokenB"),
    solanaWeb3_js.u128("swapInAmountTokenA"),
    solanaWeb3_js.u128("swapOutAmountTokenB"),
    solanaWeb3_js.u128("swapInAmountTokenB"),
    solanaWeb3_js.u128("swapOutAmountTokenA"),
    solanaWeb3_js.u8("status"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 7, ""),
    solanaWeb3_js.seq(RewardInfo, 3, "rewardInfos"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 16, "tickArrayBitmap"),
    solanaWeb3_js.u64("totalFeesTokenA"),
    solanaWeb3_js.u64("totalFeesClaimedTokenA"),
    solanaWeb3_js.u64("totalFeesTokenB"),
    solanaWeb3_js.u64("totalFeesClaimedTokenB"),
    solanaWeb3_js.u64("fundFeesTokenA"),
    solanaWeb3_js.u64("fundFeesTokenB"),
    solanaWeb3_js.u64("startTime"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 15 * 4 - 3, "padding"),
  ]);

  const CLMM_CONFIG_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.u8("bump"),
    solanaWeb3_js.u16("index"),
    solanaWeb3_js.publicKey(""),
    solanaWeb3_js.u32("protocolFeeRate"),
    solanaWeb3_js.u32("tradeFeeRate"),
    solanaWeb3_js.u16("tickSpacing"),
    solanaWeb3_js.seq(solanaWeb3_js.u64(), 8, ""),
  ]);

  const TICK_ARRAY_SIZE$1 = 60;

  const TickLayout = solanaWeb3_js.struct([
    solanaWeb3_js.i32("tick"),
    solanaWeb3_js.i128("liquidityNet"),
    solanaWeb3_js.u128("liquidityGross"),
    solanaWeb3_js.u128("feeGrowthOutsideX64A"),
    solanaWeb3_js.u128("feeGrowthOutsideX64B"),
    solanaWeb3_js.seq(solanaWeb3_js.u128(), 3, "rewardGrowthsOutsideX64"),
    solanaWeb3_js.seq(solanaWeb3_js.u32(), 13, ""),
  ]);

  const TICK_ARRAY_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.publicKey("poolId"),
    solanaWeb3_js.i32("startTickIndex"),
    solanaWeb3_js.seq(TickLayout, TICK_ARRAY_SIZE$1, "ticks"),
    solanaWeb3_js.u8("initializedTickCount"),
    solanaWeb3_js.seq(solanaWeb3_js.u8(), 115, ""),
  ]);

  const EXTENSION_TICKARRAY_BITMAP_SIZE = 14;

  const TICK_ARRAY_BITMAP_EXTENSION_LAYOUT = solanaWeb3_js.struct([
    solanaWeb3_js.blob(8),
    solanaWeb3_js.publicKey("poolId"),
    solanaWeb3_js.seq(solanaWeb3_js.seq(solanaWeb3_js.u64(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "positiveTickArrayBitmap"),
    solanaWeb3_js.seq(solanaWeb3_js.seq(solanaWeb3_js.u64(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "negativeTickArrayBitmap"),
  ]);

  var LAYOUTS = {
    CPMM_LAYOUT,
    CPMM_CONFIG_LAYOUT,
    CLMM_LAYOUT,
    CLMM_CONFIG_LAYOUT,
    TICK_ARRAY_LAYOUT,
    TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
  };

  function BNDivCeil(bn1, bn2) {
    const { div, mod } = bn1.divmod(bn2);

    if (mod.gt(new solanaWeb3_js.BN(0))) {
      return div.add(new solanaWeb3_js.BN(1));
    } else {
      return div;
    }
  }

  function checkedRem(dividend, divisor) {
    
    if (divisor.isZero()) throw Error("divisor is zero");

    const result = dividend.mod(divisor);
    return result;
  }

  function checkedCeilDiv(dividend, rhs) {
    if (rhs.isZero()) throw Error("rhs is zero");

    let quotient = dividend.div(rhs);

    if (quotient.isZero()) throw Error("quotient is zero");

    let remainder = checkedRem(dividend, rhs);

    if (remainder.gt(ZERO$1)) {
      quotient = quotient.add(new solanaWeb3_js.BN(1));

      rhs = dividend.div(quotient);
      remainder = checkedRem(dividend, quotient);
      if (remainder.gt(ZERO$1)) {
        rhs = rhs.add(new solanaWeb3_js.BN(1));
      }
    }
    return [quotient, rhs];
  }

  const ZERO$1 = new solanaWeb3_js.BN(0);

  class ConstantProductCurve {
    
    static swapWithoutFees(sourceAmount, swapSourceAmount, swapDestinationAmount) {
      const invariant = swapSourceAmount.mul(swapDestinationAmount);

      const newSwapSourceAmount = swapSourceAmount.add(sourceAmount);
      const [newSwapDestinationAmount, _newSwapSourceAmount] = checkedCeilDiv(invariant, newSwapSourceAmount);

      const sourceAmountSwapped = _newSwapSourceAmount.sub(swapSourceAmount);
      const destinationAmountSwapped = swapDestinationAmount.sub(newSwapDestinationAmount);
      if (destinationAmountSwapped.isZero()) throw Error("destinationAmountSwapped is zero");

      return {
        sourceAmountSwapped,
        destinationAmountSwapped,
      };
    }

    static lpTokensToTradingTokens(
      lpTokenAmount,
      lpTokenSupply,
      swapTokenAmount0,
      swapTokenAmount1,
      roundDirection,
    ) {
      let tokenAmount0 = lpTokenAmount.mul(swapTokenAmount0).div(lpTokenSupply);
      let tokenAmount1 = lpTokenAmount.mul(swapTokenAmount1).div(lpTokenSupply);

      if (roundDirection === RoundDirection.Floor) {
        return { tokenAmount0, tokenAmount1 };
      } else if (roundDirection === RoundDirection.Ceiling) {
        const tokenRemainder0 = checkedRem(lpTokenAmount.mul(swapTokenAmount0), lpTokenSupply);

        if (tokenRemainder0.gt(ZERO$1) && tokenAmount0.gt(ZERO$1)) {
          tokenAmount0 = tokenAmount0.add(new solanaWeb3_js.BN(1));
        }

        const token1Remainder = checkedRem(lpTokenAmount.mul(swapTokenAmount1), lpTokenSupply);

        if (token1Remainder.gt(ZERO$1) && tokenAmount1.gt(ZERO$1)) {
          tokenAmount1 = tokenAmount1.add(new solanaWeb3_js.BN(1));
        }

        return { tokenAmount0, tokenAmount1 };
      }
      throw Error("roundDirection value error");
    }
  }

  const FEE_RATE_DENOMINATOR_VALUE = new solanaWeb3_js.BN(1000000);

  function ceilDiv(tokenAmount, feeNumerator, feeDenominator) {
    return tokenAmount.mul(feeNumerator).add(feeDenominator).sub(new solanaWeb3_js.BN(1)).div(feeDenominator);
  }

  function floorDiv(tokenAmount, feeNumerator, feeDenominator) {
    return tokenAmount.mul(feeNumerator).div(feeDenominator);
  }

  class CpmmFee {
    
    static tradingFee(amount, tradeFeeRate) {
      return ceilDiv(amount, tradeFeeRate, FEE_RATE_DENOMINATOR_VALUE);
    }
    static protocolFee(amount, protocolFeeRate) {
      return floorDiv(amount, protocolFeeRate, FEE_RATE_DENOMINATOR_VALUE);
    }
    static fundFee(amount, fundFeeRate) {
      return floorDiv(amount, fundFeeRate, FEE_RATE_DENOMINATOR_VALUE);
    }
  }

  class CurveCalculator {

    static validate_supply(tokenAmount0, tokenAmount1) {
      if (tokenAmount0.isZero()) throw Error("tokenAmount0 is zero");
      if (tokenAmount1.isZero()) throw Error("tokenAmount1 is zero");
    }

    static swap(sourceAmount, swapSourceAmount, swapDestinationAmount, tradeFeeRate) {
      const tradeFee = CpmmFee.tradingFee(sourceAmount, tradeFeeRate);

      const sourceAmountLessFees = sourceAmount.sub(tradeFee);

      const { sourceAmountSwapped, destinationAmountSwapped } = ConstantProductCurve.swapWithoutFees(
        sourceAmountLessFees,
        swapSourceAmount,
        swapDestinationAmount,
      );

      const _sourceAmountSwapped = sourceAmountSwapped.add(tradeFee);
      return {
        newSwapSourceAmount: swapSourceAmount.add(_sourceAmountSwapped),
        newSwapDestinationAmount: swapDestinationAmount.sub(destinationAmountSwapped),
        sourceAmountSwapped: _sourceAmountSwapped,
        destinationAmountSwapped,
        tradeFee,
      };
    }

    static swapBaseOut({
      poolMintA,
      poolMintB,
      tradeFeeRate,
      baseReserve,
      quoteReserve,
      outputMint,
      outputAmount,
    }) {
      const [reserveInAmount, reserveOutAmount, reserveInDecimals, reserveOutDecimals, inputMint] =
        poolMintB.address === outputMint.toString()
          ? [baseReserve, quoteReserve, poolMintA.decimals, poolMintB.decimals, poolMintA.address]
          : [quoteReserve, baseReserve, poolMintB.decimals, poolMintA.decimals, poolMintB.address];
      const currentPrice = new Decimal__default['default'](reserveOutAmount.toString())
        .div(10 ** reserveOutDecimals)
        .div(new Decimal__default['default'](reserveInAmount.toString()).div(10 ** reserveInDecimals));
      const amountRealOut = outputAmount.gte(reserveOutAmount) ? reserveOutAmount.sub(new solanaWeb3_js.BN(1)) : outputAmount;

      const denominator = reserveOutAmount.sub(amountRealOut);
      const amountInWithoutFee = BNDivCeil(reserveInAmount.mul(amountRealOut), denominator);
      const amountIn = BNDivCeil(amountInWithoutFee.mul(new solanaWeb3_js.BN(1000000)), new solanaWeb3_js.BN(1000000).sub(tradeFeeRate));
      const fee = amountIn.sub(amountInWithoutFee);
      const executionPrice = new Decimal__default['default'](amountRealOut.toString())
        .div(10 ** reserveOutDecimals)
        .div(new Decimal__default['default'](amountIn.toString()).div(10 ** reserveInDecimals));
      const priceImpact = currentPrice.isZero() ? 0 : executionPrice.sub(currentPrice).div(currentPrice).abs().toNumber();

      return {
        amountRealOut,

        amountIn,
        amountInWithoutFee,

        tradeFee: fee,
        priceImpact,
      };
    }
  }

  const getConfig = (address)=>{
    return request(`solana://${address}/getAccountInfo`, {
      api: CPMM_CONFIG_LAYOUT,
      cache: 21600000, // 6 hours in ms
      cacheKey: ['raydium/cpmm/config/', address.toString()].join('/')
    })
  };

  const getPairs$1 = (base, quote)=>{
    return request(`solana://CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C/getProgramAccounts`, {
      params: { filters: [
        { dataSize: CPMM_LAYOUT.span },
        { memcmp: { offset: 168, bytes: base }},
        { memcmp: { offset: 200, bytes: quote }},
      ]},
      api: CPMM_LAYOUT,
      cache: 21600000, // 6 hours in ms
      cacheKey: ['raydium/cpmm/', base.toString(), quote.toString()].join('/')
    })
  };

  const getPairsWithPrice$2 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })=>{

    let accounts;

    if(pairsDatum) {

      accounts = await request(`solana://${pairsDatum.id}`, { api: CPMM_LAYOUT, cache: 5000 }).then((data)=>{
        return [{
          pubkey: new solanaWeb3_js.PublicKey(pairsDatum.id),
          data
        }]
      });

    } else {

      accounts = await getPairs$1(tokenIn, tokenOut);

      if(accounts.length == 0) {
        accounts = await getPairs$1(tokenOut, tokenIn);
      }
    }

    const pairs = await Promise.all(accounts.map(async(account)=>{

      let config = await getConfig(account.data.configId.toString());

      // BASE == A

      const baseVaultAmountData = await request(`solana://${account.data.vaultA.toString()}/getTokenAccountBalance`, {
        cache: 5000, // 5 seconds in ms
        cacheKey: ['raydium', 'cp', 'baseVaultAmount', account.data.vaultA.toString()].join('-')
      });
      const baseReserve = ethers.ethers.BigNumber.from(baseVaultAmountData.value.amount).sub(
        ethers.ethers.BigNumber.from(account.data.protocolFeesMintA.toString())
      ).sub(
        ethers.ethers.BigNumber.from(account.data.fundFeesMintA.toString())
      );

      if( // min liquidity SOL
        (
          tokenIn === Blockchains__default['default'].solana.currency.address || 
          tokenIn === Blockchains__default['default'].solana.wrapped.address
        ) && ( baseVaultAmountData.value.uiAmount < 50 )
      ) { return }

      if( // min liquidity stable usd
        (
          Blockchains__default['default'].solana.stables.usd.includes(tokenIn)
        ) && ( baseVaultAmountData.value.uiAmount < 10000 )
      ) { return }

      // QUOTE == B

      const quoteVaultAmountData = await request(`solana://${account.data.vaultB.toString()}/getTokenAccountBalance`, {
        cache: 5000, // 5 seconds in ms
        cacheKey: ['raydium', 'cp', 'quoteVaultAmount', account.data.vaultB.toString()].join('-')
      });
      const quoteReserve = ethers.ethers.BigNumber.from(quoteVaultAmountData.value.amount).sub(
        ethers.ethers.BigNumber.from(account.data.protocolFeesMintB.toString())
      ).sub(
        ethers.ethers.BigNumber.from(account.data.fundFeesMintB.toString())
      );

      if( // min liquidity SOL
        (
          tokenIn === Blockchains__default['default'].solana.currency.address || 
          tokenIn === Blockchains__default['default'].solana.wrapped.address
        ) && ( quoteVaultAmountData.value.uiAmount < 50 )
      ) { return }

      if( // min liquidity stable usd
        (
          Blockchains__default['default'].solana.stables.usd.includes(tokenIn)
        ) && ( quoteVaultAmountData.value.uiAmount < 10000 )
      ) { return }

      let price = 0;

      if(amountIn || amountInMax) { // uses CurveCalculator.swap: Given an input amount, compute how much comes out.

        const isBaseIn = tokenOut.toString() === account.data.mintB.toString();

        const swapResult = CurveCalculator.swap(
          new solanaWeb3_js.BN((amountIn || amountInMax).toString()),
          new solanaWeb3_js.BN((isBaseIn ? baseReserve : quoteReserve).toString()),
          new solanaWeb3_js.BN((isBaseIn ? quoteReserve : baseReserve).toString()),
          config.tradeFeeRate,
        );

        price = swapResult.destinationAmountSwapped.toString();

      } else { // uses CurveCalculator.swapBaseOut: Given a desired output amount, compute how much you need to put in (and some extra info like price impact).

        const swapResult = CurveCalculator.swapBaseOut({
          poolMintA: { decimals: account.data.mintDecimalA, address: account.data.mintA.toString() },
          poolMintB: { decimals: account.data.mintDecimalB, address: account.data.mintB.toString() },
          tradeFeeRate: config.tradeFeeRate,
          baseReserve: new solanaWeb3_js.BN(baseReserve.toString()),
          quoteReserve: new solanaWeb3_js.BN(quoteReserve.toString()),
          outputMint: tokenOut,
          outputAmount: new solanaWeb3_js.BN((amountOut || amountOutMin).toString())
        });

        price = swapResult.amountIn.toString();

      }

      if(price === 0) { return }

      return {
        type: 'cpmm',
        publicKey: account.pubkey.toString(),
        mintA: account.data.mintA.toString(),
        mintB: account.data.mintB.toString(),
        price,
        data: account.data
      }
    }));

    return pairs.filter(Boolean)

  };

  const BIT_PRECISION = 16;
  const FEE_RATE_DENOMINATOR = new solanaWeb3_js.BN(10).pow(new solanaWeb3_js.BN(6));
  const LOG_B_2_X32 = "59543866431248";
  const LOG_B_P_ERR_MARGIN_LOWER_X64 = "184467440737095516";
  const LOG_B_P_ERR_MARGIN_UPPER_X64 = "15793534762490258745";
  const MAX_SQRT_PRICE_X64 = new solanaWeb3_js.BN("79226673521066979257578248091");
  new solanaWeb3_js.BN("79226673521066979257578248090");
  const MIN_TICK = -443636;
  const MAX_TICK = -MIN_TICK;
  const Q64 = new solanaWeb3_js.BN(1).shln(64);
  const ONE = new solanaWeb3_js.BN(1);
  const MaxU64 = Q64.sub(ONE);
  const Q128 = new solanaWeb3_js.BN(1).shln(128);
  const MaxUint128 = Q128.subn(1);
  const MIN_SQRT_PRICE_X64 = new solanaWeb3_js.BN("4295048016");
  new solanaWeb3_js.BN("4295048017");
  const NEGATIVE_ONE = new solanaWeb3_js.BN(-1);
  const POOL_TICK_ARRAY_BITMAP_SEED = solanaWeb3_js.Buffer.from("pool_tick_array_bitmap_extension", "utf8");
  const PROGRAM_ID = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK';
  const TICK_ARRAY_BITMAP_SIZE = 512;
  const TICK_ARRAY_SEED = solanaWeb3_js.Buffer.from("tick_array", "utf8");
  const TICK_ARRAY_SIZE = 60;
  const U64Resolution = 64;
  const ZERO = new solanaWeb3_js.BN(0);

  const TOKEN_PROGRAM_ID = new solanaWeb3_js.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  const TOKEN_2022_PROGRAM_ID = new solanaWeb3_js.PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
  const MEMO_PROGRAM_ID = new solanaWeb3_js.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  function _optionalChain$7(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  class LiquidityMath {
    
    static addDelta(x, y) {
      return x.add(y);
    }

    static getTokenAmountAFromLiquidity(
      sqrtPriceX64A,
      sqrtPriceX64B,
      liquidity,
      roundUp,
    ) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }

      if (!sqrtPriceX64A.gt(ZERO)) {
        throw new Error("sqrtPriceX64A must greater than 0");
      }

      const numerator1 = liquidity.ushln(U64Resolution);
      const numerator2 = sqrtPriceX64B.sub(sqrtPriceX64A);

      return roundUp
        ? MathUtil.mulDivRoundingUp(MathUtil.mulDivCeil(numerator1, numerator2, sqrtPriceX64B), ONE, sqrtPriceX64A)
        : MathUtil.mulDivFloor(numerator1, numerator2, sqrtPriceX64B).div(sqrtPriceX64A);
    }

    static getTokenAmountBFromLiquidity(
      sqrtPriceX64A,
      sqrtPriceX64B,
      liquidity,
      roundUp,
    ) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }
      if (!sqrtPriceX64A.gt(ZERO)) {
        throw new Error("sqrtPriceX64A must greater than 0");
      }

      return roundUp
        ? MathUtil.mulDivCeil(liquidity, sqrtPriceX64B.sub(sqrtPriceX64A), Q64)
        : MathUtil.mulDivFloor(liquidity, sqrtPriceX64B.sub(sqrtPriceX64A), Q64);
    }

    static getLiquidityFromTokenAmountA(sqrtPriceX64A, sqrtPriceX64B, amountA, roundUp) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }

      const numerator = amountA.mul(sqrtPriceX64A).mul(sqrtPriceX64B);
      const denominator = sqrtPriceX64B.sub(sqrtPriceX64A);
      const result = numerator.div(denominator);

      if (roundUp) {
        return MathUtil.mulDivRoundingUp(result, ONE, MaxU64);
      } else {
        return result.shrn(U64Resolution);
      }
    }

    static getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceX64B, amountB) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }
      return MathUtil.mulDivFloor(amountB, MaxU64, sqrtPriceX64B.sub(sqrtPriceX64A));
    }

    static getLiquidityFromTokenAmounts(
      sqrtPriceCurrentX64,
      sqrtPriceX64A,
      sqrtPriceX64B,
      amountA,
      amountB,
    ) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }

      if (sqrtPriceCurrentX64.lte(sqrtPriceX64A)) {
        return LiquidityMath.getLiquidityFromTokenAmountA(sqrtPriceX64A, sqrtPriceX64B, amountA, false);
      } else if (sqrtPriceCurrentX64.lt(sqrtPriceX64B)) {
        const liquidity0 = LiquidityMath.getLiquidityFromTokenAmountA(sqrtPriceCurrentX64, sqrtPriceX64B, amountA, false);
        const liquidity1 = LiquidityMath.getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceCurrentX64, amountB);
        return liquidity0.lt(liquidity1) ? liquidity0 : liquidity1;
      } else {
        return LiquidityMath.getLiquidityFromTokenAmountB(sqrtPriceX64A, sqrtPriceX64B, amountB);
      }
    }

    static getAmountsFromLiquidity(
      sqrtPriceCurrentX64,
      sqrtPriceX64A,
      sqrtPriceX64B,
      liquidity,
      roundUp,
    ) {
      if (sqrtPriceX64A.gt(sqrtPriceX64B)) {
        [sqrtPriceX64A, sqrtPriceX64B] = [sqrtPriceX64B, sqrtPriceX64A];
      }

      if (sqrtPriceCurrentX64.lte(sqrtPriceX64A)) {
        return {
          amountA: LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64A, sqrtPriceX64B, liquidity, roundUp),
          amountB: new solanaWeb3_js.BN(0),
        };
      } else if (sqrtPriceCurrentX64.lt(sqrtPriceX64B)) {
        const amountA = LiquidityMath.getTokenAmountAFromLiquidity(
          sqrtPriceCurrentX64,
          sqrtPriceX64B,
          liquidity,
          roundUp,
        );
        const amountB = LiquidityMath.getTokenAmountBFromLiquidity(
          sqrtPriceX64A,
          sqrtPriceCurrentX64,
          liquidity,
          roundUp,
        );
        return { amountA, amountB };
      } else {
        return {
          amountA: new solanaWeb3_js.BN(0),
          amountB: LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64A, sqrtPriceX64B, liquidity, roundUp),
        };
      }
    }

    static getAmountsFromLiquidityWithSlippage(
      sqrtPriceCurrentX64,
      sqrtPriceX64A,
      sqrtPriceX64B,
      liquidity,
      amountMax,
      roundUp,
      amountSlippage,
    ) {
      const { amountA, amountB } = LiquidityMath.getAmountsFromLiquidity(
        sqrtPriceCurrentX64,
        sqrtPriceX64A,
        sqrtPriceX64B,
        liquidity,
        roundUp,
      );
      const coefficient = amountMax ? 1 + amountSlippage : 1 - amountSlippage;

      const amount0Slippage = new solanaWeb3_js.BN(new Decimal(amountA.toString()).mul(coefficient).toFixed(0));
      const amount1Slippage = new solanaWeb3_js.BN(new Decimal(amountB.toString()).mul(coefficient).toFixed(0));
      return {
        amountSlippageA: amount0Slippage,
        amountSlippageB: amount1Slippage,
      };
    }

    static getAmountsOutFromLiquidity({
      poolInfo,
      tickLower,
      tickUpper,
      liquidity,
      slippage,
      add,
      epochInfo,
      amountAddFee,
    }) {
      const sqrtPriceX64 = SqrtPriceMath.priceToSqrtPriceX64(
        new Decimal(poolInfo.price),
        poolInfo.mintA.decimals,
        poolInfo.mintB.decimals,
      );
      const sqrtPriceX64A = SqrtPriceMath.getSqrtPriceX64FromTick(tickLower);
      const sqrtPriceX64B = SqrtPriceMath.getSqrtPriceX64FromTick(tickUpper);

      const coefficientRe = add ? 1 + slippage : 1 - slippage;

      const amounts = LiquidityMath.getAmountsFromLiquidity(sqrtPriceX64, sqrtPriceX64A, sqrtPriceX64B, liquidity, add);

      const [amountA, amountB] = [
        getTransferAmountFeeV2(amounts.amountA, _optionalChain$7([poolInfo, 'access', _ => _.mintA, 'access', _2 => _2.extensions, 'optionalAccess', _3 => _3.feeConfig]), epochInfo, amountAddFee),
        getTransferAmountFeeV2(amounts.amountB, _optionalChain$7([poolInfo, 'access', _4 => _4.mintB, 'access', _5 => _5.extensions, 'optionalAccess', _6 => _6.feeConfig]), epochInfo, amountAddFee),
      ];
      const [amountSlippageA, amountSlippageB] = [
        getTransferAmountFeeV2(
          new solanaWeb3_js.BN(new Decimal(amounts.amountA.toString()).mul(coefficientRe).toFixed(0)),
          _optionalChain$7([poolInfo, 'access', _7 => _7.mintA, 'access', _8 => _8.extensions, 'optionalAccess', _9 => _9.feeConfig]),
          epochInfo,
          amountAddFee,
        ),
        getTransferAmountFeeV2(
          new solanaWeb3_js.BN(new Decimal(amounts.amountB.toString()).mul(coefficientRe).toFixed(0)),
          _optionalChain$7([poolInfo, 'access', _10 => _10.mintB, 'access', _11 => _11.extensions, 'optionalAccess', _12 => _12.feeConfig]),
          epochInfo,
          amountAddFee,
        ),
      ];

      return {
        liquidity,
        amountA,
        amountB,
        amountSlippageA,
        amountSlippageB,
        expirationTime: minExpirationTime(amountA.expirationTime, amountB.expirationTime),
      };
    }
  }

  class MathUtil {

    static mulDivRoundingUp(a, b, denominator) {
      const numerator = a.mul(b);
      let result = numerator.div(denominator);
      if (!numerator.mod(denominator).eq(ZERO)) {
        result = result.add(ONE);
      }
      return result;
    }

    static mulDivFloor(a, b, denominator) {
      if (denominator.eq(ZERO)) {
        throw new Error("division by 0");
      }
      return a.mul(b).div(denominator);
    }

    static mulDivCeil(a, b, denominator) {
      if (denominator.eq(ZERO)) {
        throw new Error("division by 0");
      }
      const numerator = a.mul(b).add(denominator.sub(ONE));
      return numerator.div(denominator);
    }

    static x64ToDecimal(num, decimalPlaces) {
      return new Decimal(num.toString()).div(Decimal.pow(2, 64)).toDecimalPlaces(decimalPlaces);
    }

    static decimalToX64(num) {
      return new solanaWeb3_js.BN(num.mul(Decimal.pow(2, 64)).floor().toFixed());
    }

    static wrappingSubU128(n0, n1) {
      return n0.add(Q128).sub(n1).mod(Q128);
    }
  }

  // sqrt price math
  function mulRightShift(val, mulBy) {
    return signedRightShift(val.mul(mulBy), 64, 256);
  }

  function signedLeftShift(n0, shiftBy, bitWidth) {
    const twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
    twosN0.imaskn(bitWidth + 1);
    return twosN0.fromTwos(bitWidth);
  }

  function signedRightShift(n0, shiftBy, bitWidth) {
    const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
    twoN0.imaskn(bitWidth - shiftBy + 1);
    return twoN0.fromTwos(bitWidth - shiftBy);
  }

  class SqrtPriceMath {
    
    static sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA, decimalsB) {
      return MathUtil.x64ToDecimal(sqrtPriceX64)
        .pow(2)
        .mul(Decimal.pow(10, decimalsA - decimalsB));
    }

    static priceToSqrtPriceX64(price, decimalsA, decimalsB) {
      return MathUtil.decimalToX64(price.mul(Decimal.pow(10, decimalsB - decimalsA)).sqrt());
    }

    static getNextSqrtPriceX64FromInput(sqrtPriceX64, liquidity, amountIn, zeroForOne) {
      
      if (!sqrtPriceX64.gt(ZERO)) {
        throw new Error("sqrtPriceX64 must greater than 0");
      }
      if (!liquidity.gt(ZERO)) {
        throw new Error("liquidity must greater than 0");
      }

      return zeroForOne
        ? this.getNextSqrtPriceFromTokenAmountARoundingUp(sqrtPriceX64, liquidity, amountIn, true)
        : this.getNextSqrtPriceFromTokenAmountBRoundingDown(sqrtPriceX64, liquidity, amountIn, true);
    }

    static getNextSqrtPriceX64FromOutput(sqrtPriceX64, liquidity, amountOut, zeroForOne) {

      if (!sqrtPriceX64.gt(ZERO)) {
        throw new Error("sqrtPriceX64 must greater than 0");
      }
      if (!liquidity.gt(ZERO)) {
        throw new Error("liquidity must greater than 0");
      }

      return zeroForOne
        ? this.getNextSqrtPriceFromTokenAmountBRoundingDown(sqrtPriceX64, liquidity, amountOut, false)
        : this.getNextSqrtPriceFromTokenAmountARoundingUp(sqrtPriceX64, liquidity, amountOut, false);
    }

    static getNextSqrtPriceFromTokenAmountARoundingUp(
      sqrtPriceX64,
      liquidity,
      amount,
      add,
    ) {

      if (amount.eq(ZERO)) return sqrtPriceX64;
      const liquidityLeftShift = liquidity.shln(U64Resolution);

      if (add) {
        const numerator1 = liquidityLeftShift;
        const denominator = liquidityLeftShift.add(amount.mul(sqrtPriceX64));
        if (denominator.gte(numerator1)) {
          return MathUtil.mulDivCeil(numerator1, sqrtPriceX64, denominator);
        }
        return MathUtil.mulDivRoundingUp(numerator1, ONE, numerator1.div(sqrtPriceX64).add(amount));
      } else {
        const amountMulSqrtPrice = amount.mul(sqrtPriceX64);
        if (!liquidityLeftShift.gt(amountMulSqrtPrice)) {
          throw new Error("getNextSqrtPriceFromTokenAmountARoundingUp,liquidityLeftShift must gt amountMulSqrtPrice");
        }
        const denominator = liquidityLeftShift.sub(amountMulSqrtPrice);
        return MathUtil.mulDivCeil(liquidityLeftShift, sqrtPriceX64, denominator);
      }
    }

    static getNextSqrtPriceFromTokenAmountBRoundingDown(
      sqrtPriceX64,
      liquidity,
      amount,
      add,
    ) {
      const deltaY = amount.shln(U64Resolution);
      if (add) {
        return sqrtPriceX64.add(deltaY.div(liquidity));
      } else {
        const amountDivLiquidity = MathUtil.mulDivRoundingUp(deltaY, ONE, liquidity);
        if (!sqrtPriceX64.gt(amountDivLiquidity)) {
          throw new Error("getNextSqrtPriceFromTokenAmountBRoundingDown sqrtPriceX64 must gt amountDivLiquidity");
        }
        return sqrtPriceX64.sub(amountDivLiquidity);
      }
    }

    static getSqrtPriceX64FromTick(tick) {
      if (!Number.isInteger(tick)) {
        throw new Error("tick must be integer");
      }
      if (tick < MIN_TICK || tick > MAX_TICK) {
        throw new Error("tick must be in MIN_TICK and MAX_TICK");
      }
      const tickAbs = tick < 0 ? tick * -1 : tick;

      let ratio = (tickAbs & 0x1) != 0 ? new solanaWeb3_js.BN("18445821805675395072") : new solanaWeb3_js.BN("18446744073709551616");
      if ((tickAbs & 0x2) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18444899583751176192"));
      if ((tickAbs & 0x4) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18443055278223355904"));
      if ((tickAbs & 0x8) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18439367220385607680"));
      if ((tickAbs & 0x10) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18431993317065453568"));
      if ((tickAbs & 0x20) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18417254355718170624"));
      if ((tickAbs & 0x40) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18387811781193609216"));
      if ((tickAbs & 0x80) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18329067761203558400"));
      if ((tickAbs & 0x100) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("18212142134806163456"));
      if ((tickAbs & 0x200) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("17980523815641700352"));
      if ((tickAbs & 0x400) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("17526086738831433728"));
      if ((tickAbs & 0x800) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("16651378430235570176"));
      if ((tickAbs & 0x1000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("15030750278694412288"));
      if ((tickAbs & 0x2000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("12247334978884435968"));
      if ((tickAbs & 0x4000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("8131365268886854656"));
      if ((tickAbs & 0x8000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("3584323654725218816"));
      if ((tickAbs & 0x10000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("696457651848324352"));
      if ((tickAbs & 0x20000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("26294789957507116"));
      if ((tickAbs & 0x40000) != 0) ratio = mulRightShift(ratio, new solanaWeb3_js.BN("37481735321082"));

      if (tick > 0) ratio = MaxUint128.div(ratio);
      return ratio;
    }

    static getTickFromPrice(price, decimalsA, decimalsB) {
      return SqrtPriceMath.getTickFromSqrtPriceX64(SqrtPriceMath.priceToSqrtPriceX64(price, decimalsA, decimalsB));
    }

    static getTickFromSqrtPriceX64(sqrtPriceX64) {
      if (sqrtPriceX64.gt(MAX_SQRT_PRICE_X64) || sqrtPriceX64.lt(MIN_SQRT_PRICE_X64)) {
        throw new Error("Provided sqrtPrice is not within the supported sqrtPrice range.");
      }

      const msb = sqrtPriceX64.bitLength() - 1;
      const adjustedMsb = new solanaWeb3_js.BN(msb - 64);
      const log2pIntegerX32 = signedLeftShift(adjustedMsb, 32, 128);

      let bit = new solanaWeb3_js.BN("8000000000000000", "hex");
      let precision = 0;
      let log2pFractionX64 = new solanaWeb3_js.BN(0);

      let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);

      while (bit.gt(new solanaWeb3_js.BN(0)) && precision < BIT_PRECISION) {
        r = r.mul(r);
        const rMoreThanTwo = r.shrn(127);
        r = r.shrn(63 + rMoreThanTwo.toNumber());
        log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
        bit = bit.shrn(1);
        precision += 1;
      }

      const log2pFractionX32 = log2pFractionX64.shrn(32);

      const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
      const logbpX64 = log2pX32.mul(new solanaWeb3_js.BN(LOG_B_2_X32));

      const tickLow = signedRightShift(logbpX64.sub(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_LOWER_X64)), 64, 128).toNumber();
      const tickHigh = signedRightShift(logbpX64.add(new solanaWeb3_js.BN(LOG_B_P_ERR_MARGIN_UPPER_X64)), 64, 128).toNumber();

      if (tickLow == tickHigh) {
        return tickLow;
      } else {
        const derivedTickHighSqrtPriceX64 = SqrtPriceMath.getSqrtPriceX64FromTick(tickHigh);
        return derivedTickHighSqrtPriceX64.lte(sqrtPriceX64) ? tickHigh : tickLow;
      }
    }
  }

  function _optionalChain$6(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  const nextInitializedTickArray = (tickIndex, tickSpacing, zeroForOne, tickArrayBitmap, exBitmapInfo) => {
    const currentOffset = Math.floor(tickIndex / tickCount(tickSpacing));
    const result = zeroForOne
      ? searchLowBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset - 1, 1, tickSpacing)
      : searchHightBitFromStart(tickArrayBitmap, exBitmapInfo, currentOffset + 1, 1, tickSpacing);

    return result.length > 0 ? { isExist: true, nextStartIndex: result[0] } : { isExist: false, nextStartIndex: 0 };
  };

  class SwapMath {
    
    static swapCompute(
      programId,
      poolId,
      tickArrayCache,
      tickArrayBitmap,
      tickarrayBitmapExtension,
      zeroForOne,
      fee,
      liquidity,
      currentTick,
      tickSpacing,
      currentSqrtPriceX64,
      amountSpecified,
      lastSavedTickArrayStartIndex,
      sqrtPriceLimitX64,
      catchLiquidityInsufficient
    ) {
      if (amountSpecified.eq(ZERO)) {
        throw new Error("amountSpecified must not be 0");
      }
      if (!sqrtPriceLimitX64) {
        sqrtPriceLimitX64 = zeroForOne ? MIN_SQRT_PRICE_X64.add(ONE) : MAX_SQRT_PRICE_X64.sub(ONE);
      }

      if (zeroForOne) {
        if (sqrtPriceLimitX64.lt(MIN_SQRT_PRICE_X64)) {
          throw new Error("sqrtPriceX64 must greater than MIN_SQRT_PRICE_X64");
        }

        if (sqrtPriceLimitX64.gte(currentSqrtPriceX64)) {
          throw new Error("sqrtPriceX64 must smaller than current");
        }
      } else {
        if (sqrtPriceLimitX64.gt(MAX_SQRT_PRICE_X64)) {
          throw new Error("sqrtPriceX64 must smaller than MAX_SQRT_PRICE_X64");
        }

        if (sqrtPriceLimitX64.lte(currentSqrtPriceX64)) {
          throw new Error("sqrtPriceX64 must greater than current");
        }
      }
      const baseInput = amountSpecified.gt(ZERO);

      const state = {
        amountSpecifiedRemaining: amountSpecified,
        amountCalculated: ZERO,
        sqrtPriceX64: currentSqrtPriceX64,
        tick:
          currentTick > lastSavedTickArrayStartIndex
            ? Math.min(lastSavedTickArrayStartIndex + tickCount(tickSpacing) - 1, currentTick)
            : lastSavedTickArrayStartIndex,
        accounts: [],
        liquidity,
        feeAmount: new solanaWeb3_js.BN(0),
      };
      let tickAarrayStartIndex = lastSavedTickArrayStartIndex;
      let tickArrayCurrent = tickArrayCache[lastSavedTickArrayStartIndex];
      let loopCount = 0;
      let t = !zeroForOne && tickArrayCurrent.startTickIndex === state.tick;
      while (
        !state.amountSpecifiedRemaining.eq(ZERO) &&
        !state.sqrtPriceX64.eq(sqrtPriceLimitX64)
      ) {
        if (loopCount > 1000) {
          throw Error('liquidity limit')
        }
        const step = {};
        step.sqrtPriceStartX64 = state.sqrtPriceX64;

        const tickState = nextInitTick(tickArrayCurrent, state.tick, tickSpacing, zeroForOne, t);

        let _nextInitTick = tickState ? tickState : null;
        let tickArrayAddress = null;

        if (!_optionalChain$6([_nextInitTick, 'optionalAccess', _ => _.liquidityGross, 'access', _2 => _2.gtn, 'call', _3 => _3(0)])) {
          const nextInitTickArrayIndex = nextInitializedTickArrayStartIndex(
            {
              tickCurrent: state.tick,
              tickSpacing,
              tickArrayBitmap,
              exBitmapInfo: tickarrayBitmapExtension,
            },
            tickAarrayStartIndex,
            zeroForOne,
          );
          if (!nextInitTickArrayIndex.isExist) {
            if (catchLiquidityInsufficient) {
              return {
                allTrade: false,
                amountSpecifiedRemaining: state.amountSpecifiedRemaining,
                amountCalculated: state.amountCalculated,
                feeAmount: state.feeAmount,
                sqrtPriceX64: state.sqrtPriceX64,
                liquidity: state.liquidity,
                tickCurrent: state.tick,
                accounts: state.accounts,
              };
            }
            throw Error("swapCompute LiquidityInsufficient");
          }
          tickAarrayStartIndex = nextInitTickArrayIndex.nextStartIndex;

          const expectedNextTickArrayAddress = getPdaTickArrayAddress(
            programId,
            poolId,
            tickAarrayStartIndex,
          );
          tickArrayAddress = expectedNextTickArrayAddress;
          tickArrayCurrent = tickArrayCache[tickAarrayStartIndex];

          try {
            _nextInitTick = firstInitializedTick(tickArrayCurrent, zeroForOne);
          } catch (e) {
            throw Error("not found next tick info");
          }
        }

        step.tickNext = _nextInitTick.tick;
        step.initialized = _nextInitTick.liquidityGross.gtn(0);
        if (lastSavedTickArrayStartIndex !== tickAarrayStartIndex && tickArrayAddress) {
          state.accounts.push(tickArrayAddress);
          lastSavedTickArrayStartIndex = tickAarrayStartIndex;
        }
        if (step.tickNext < MIN_TICK) {
          step.tickNext = MIN_TICK;
        } else if (step.tickNext > MAX_TICK) {
          step.tickNext = MAX_TICK;
        }

        step.sqrtPriceNextX64 = SqrtPriceMath.getSqrtPriceX64FromTick(step.tickNext);
        let targetPrice;
        if (
          (zeroForOne && step.sqrtPriceNextX64.lt(sqrtPriceLimitX64)) ||
          (!zeroForOne && step.sqrtPriceNextX64.gt(sqrtPriceLimitX64))
        ) {
          targetPrice = sqrtPriceLimitX64;
        } else {
          targetPrice = step.sqrtPriceNextX64;
        }
        [state.sqrtPriceX64, step.amountIn, step.amountOut, step.feeAmount] = SwapMath.swapStepCompute(
          state.sqrtPriceX64,
          targetPrice,
          state.liquidity,
          state.amountSpecifiedRemaining,
          fee,
        );

        state.feeAmount = state.feeAmount.add(step.feeAmount);

        if (baseInput) {
          state.amountSpecifiedRemaining = state.amountSpecifiedRemaining.sub(step.amountIn.add(step.feeAmount));
          state.amountCalculated = state.amountCalculated.sub(step.amountOut);
        } else {
          state.amountSpecifiedRemaining = state.amountSpecifiedRemaining.add(step.amountOut);
          state.amountCalculated = state.amountCalculated.add(step.amountIn.add(step.feeAmount));
        }
        if (state.sqrtPriceX64.eq(step.sqrtPriceNextX64)) {
          if (step.initialized) {
            let liquidityNet = _nextInitTick.liquidityNet;
            if (zeroForOne) liquidityNet = liquidityNet.mul(NEGATIVE_ONE);
            state.liquidity = LiquidityMath.addDelta(state.liquidity, liquidityNet);
          }

          t = step.tickNext != state.tick && !zeroForOne && tickArrayCurrent.startTickIndex === step.tickNext;
          state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext; //
        } else if (state.sqrtPriceX64 != step.sqrtPriceStartX64) {
          const _T = SqrtPriceMath.getTickFromSqrtPriceX64(state.sqrtPriceX64);
          t = _T != state.tick && !zeroForOne && tickArrayCurrent.startTickIndex === _T;
          state.tick = _T;
        }
        ++loopCount;
      }

      try {
        const { nextStartIndex: tickAarrayStartIndex, isExist } = nextInitializedTickArray(
          state.tick,
          tickSpacing,
          zeroForOne,
          tickArrayBitmap,
          tickarrayBitmapExtension,
        );
        if (isExist && lastSavedTickArrayStartIndex !== tickAarrayStartIndex) {
          state.accounts.push(getPdaTickArrayAddress(programId, poolId, tickAarrayStartIndex));
          lastSavedTickArrayStartIndex = tickAarrayStartIndex;
        }
      } catch (e) {
        console.log('ERROR!!!!', e);
        /* empty */
      }

      return {
        allTrade: true,
        amountSpecifiedRemaining: ZERO,
        amountCalculated: state.amountCalculated,
        feeAmount: state.feeAmount,
        sqrtPriceX64: state.sqrtPriceX64,
        liquidity: state.liquidity,
        tickCurrent: state.tick,
        accounts: state.accounts,
      };
    }

    static swapStepCompute(
      sqrtPriceX64Current,
      sqrtPriceX64Target,
      liquidity,
      amountRemaining,
      feeRate,
    ) {
      const swapStep = {
        sqrtPriceX64Next: new solanaWeb3_js.BN(0),
        amountIn: new solanaWeb3_js.BN(0),
        amountOut: new solanaWeb3_js.BN(0),
        feeAmount: new solanaWeb3_js.BN(0),
      };

      const zeroForOne = sqrtPriceX64Current.gte(sqrtPriceX64Target);
      const baseInput = amountRemaining.gte(ZERO);

      if (baseInput) {
        const amountRemainingSubtractFee = MathUtil.mulDivFloor(
          amountRemaining,
          FEE_RATE_DENOMINATOR.sub(new solanaWeb3_js.BN(feeRate.toString())),
          FEE_RATE_DENOMINATOR,
        );
        swapStep.amountIn = zeroForOne
          ? LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64Target, sqrtPriceX64Current, liquidity, true)
          : LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Current, sqrtPriceX64Target, liquidity, true);
        if (amountRemainingSubtractFee.gte(swapStep.amountIn)) {
          swapStep.sqrtPriceX64Next = sqrtPriceX64Target;
        } else {
          swapStep.sqrtPriceX64Next = SqrtPriceMath.getNextSqrtPriceX64FromInput(
            sqrtPriceX64Current,
            liquidity,
            amountRemainingSubtractFee,
            zeroForOne,
          );
        }
      } else {
        swapStep.amountOut = zeroForOne
          ? LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Target, sqrtPriceX64Current, liquidity, false)
          : LiquidityMath.getTokenAmountAFromLiquidity(sqrtPriceX64Current, sqrtPriceX64Target, liquidity, false);
        if (amountRemaining.mul(NEGATIVE_ONE).gte(swapStep.amountOut)) {
          swapStep.sqrtPriceX64Next = sqrtPriceX64Target;
        } else {
          swapStep.sqrtPriceX64Next = SqrtPriceMath.getNextSqrtPriceX64FromOutput(
            sqrtPriceX64Current,
            liquidity,
            amountRemaining.mul(NEGATIVE_ONE),
            zeroForOne,
          );
        }
      }

      const reachTargetPrice = sqrtPriceX64Target.eq(swapStep.sqrtPriceX64Next);

      if (zeroForOne) {
        if (!(reachTargetPrice && baseInput)) {
          swapStep.amountIn = LiquidityMath.getTokenAmountAFromLiquidity(
            swapStep.sqrtPriceX64Next,
            sqrtPriceX64Current,
            liquidity,
            true,
          );
        }

        if (!(reachTargetPrice && !baseInput)) {
          swapStep.amountOut = LiquidityMath.getTokenAmountBFromLiquidity(
            swapStep.sqrtPriceX64Next,
            sqrtPriceX64Current,
            liquidity,
            false,
          );
        }
      } else {
        swapStep.amountIn =
          reachTargetPrice && baseInput
            ? swapStep.amountIn
            : LiquidityMath.getTokenAmountBFromLiquidity(sqrtPriceX64Current, swapStep.sqrtPriceX64Next, liquidity, true);
        swapStep.amountOut =
          reachTargetPrice && !baseInput
            ? swapStep.amountOut
            : LiquidityMath.getTokenAmountAFromLiquidity(
              sqrtPriceX64Current,
              swapStep.sqrtPriceX64Next,
              liquidity,
              false,
            );
      }

      if (!baseInput && swapStep.amountOut.gt(amountRemaining.mul(NEGATIVE_ONE))) {
        swapStep.amountOut = amountRemaining.mul(NEGATIVE_ONE);
      }
      if (baseInput && !swapStep.sqrtPriceX64Next.eq(sqrtPriceX64Target)) {
        swapStep.feeAmount = amountRemaining.sub(swapStep.amountIn);
      } else {
        swapStep.feeAmount = MathUtil.mulDivCeil(
          swapStep.amountIn,
          new solanaWeb3_js.BN(feeRate),
          FEE_RATE_DENOMINATOR.sub(new solanaWeb3_js.BN(feeRate)),
        );
      }
      return [swapStep.sqrtPriceX64Next, swapStep.amountIn, swapStep.amountOut, swapStep.feeAmount];
    }
  }


  const getPairs = (base, quote)=>{
    return request(`solana://${PROGRAM_ID}/getProgramAccounts`, {
      params: { filters: [
        { dataSize: CLMM_LAYOUT.span },
        { memcmp: { offset: 73, bytes: base }},
        { memcmp: { offset: 105, bytes: quote }},
        { memcmp: { offset: 389, bytes: solanaWeb3_js.bs58.encode(solanaWeb3_js.Buffer.from([0])) }}, // status 0 for active pool: https://github.com/raydium-io/raydium-clmm/blob/master/programs/amm/src/states/pool.rs#L109
      ]},
      api: CLMM_LAYOUT,
      cache: 21600000, // 6 hours in ms
      cacheKey: ['raydium/clmm/', base.toString(), quote.toString()].join('/')
    })
  };

  const firstInitializedTick = (tickArrayCurrent, zeroForOne) => {
    if (zeroForOne) {
      let i = TICK_ARRAY_SIZE - 1;
      while (i >= 0) {
        if (tickArrayCurrent.ticks[i].liquidityGross.gtn(0)) {
          return tickArrayCurrent.ticks[i];
        }
        i = i - 1;
      }
    } else {
      let i = 0;
      while (i < TICK_ARRAY_SIZE) {
        if (tickArrayCurrent.ticks[i].liquidityGross.gtn(0)) {
          return tickArrayCurrent.ticks[i];
        }
        i = i + 1;
      }
    }

    throw Error(`firstInitializedTick check error: ${tickArrayCurrent} - ${zeroForOne}`);
  };

  const nextInitTick = ( tickArrayCurrent, currentTickIndex, tickSpacing, zeroForOne, t) => {
    const currentTickArrayStartIndex = getArrayStartIndex(currentTickIndex, tickSpacing);
    if (currentTickArrayStartIndex != tickArrayCurrent.startTickIndex) {
      return null;
    }
    let offsetInArray = Math.floor((currentTickIndex - tickArrayCurrent.startTickIndex) / tickSpacing);

    if (zeroForOne) {
      while (offsetInArray >= 0) {
        if (tickArrayCurrent.ticks[offsetInArray].liquidityGross.gtn(0)) {
          return tickArrayCurrent.ticks[offsetInArray];
        }
        offsetInArray = offsetInArray - 1;
      }
    } else {
      if (!t) offsetInArray = offsetInArray + 1;
      while (offsetInArray < TICK_ARRAY_SIZE) {
        if (tickArrayCurrent.ticks[offsetInArray].liquidityGross.gtn(0)) {
          return tickArrayCurrent.ticks[offsetInArray];
        }
        offsetInArray = offsetInArray + 1;
      }
    }
    return null;
  };

  const maxTickInTickarrayBitmap = (tickSpacing) => {
    return tickSpacing * TICK_ARRAY_SIZE * TICK_ARRAY_BITMAP_SIZE
  };

  const tickCount = (tickSpacing) => {
    return TICK_ARRAY_SIZE * tickSpacing
  };

  const getArrayStartIndex = (tickIndex, tickSpacing) => {
    const ticksInArray = tickCount(tickSpacing);
    const start = Math.floor(tickIndex / ticksInArray);
    return start * ticksInArray
  };

  const tickRange = (tickSpacing) =>{
    let maxTickBoundary = maxTickInTickarrayBitmap(tickSpacing);
    let minTickBoundary = -maxTickBoundary;

    if (maxTickBoundary > MAX_TICK) {
      maxTickBoundary = getArrayStartIndex(MAX_TICK, tickSpacing) + tickCount(tickSpacing);
    }
    if (minTickBoundary < MIN_TICK) {
      minTickBoundary = getArrayStartIndex(MIN_TICK, tickSpacing);
    }
    return { maxTickBoundary, minTickBoundary }
  };

  const getInitializedTickArrayInRange = (tickArrayBitmap, exTickArrayBitmap, tickSpacing, tickArrayStartIndex, expectedCount) => {
    const tickArrayOffset = Math.floor(tickArrayStartIndex / (tickSpacing * TICK_ARRAY_SIZE));
    return [
      // find right of currenct offset
      ...searchLowBitFromStart(
        tickArrayBitmap,
        exTickArrayBitmap,
        tickArrayOffset - 1,
        expectedCount,
        tickSpacing,
      ),

      // find left of current offset
      ...searchHightBitFromStart(
        tickArrayBitmap,
        exTickArrayBitmap,
        tickArrayOffset,
        expectedCount,
        tickSpacing,
      ),
    ];
  };

  const getTickArrayBitIndex = (tickIndex, tickSpacing) => {
    const ticksInArray = tickCount(tickSpacing);

    let startIndex = tickIndex / ticksInArray;
    if (tickIndex < 0 && tickIndex % ticksInArray != 0) {
      startIndex = Math.ceil(startIndex) - 1;
    } else {
      startIndex = Math.floor(startIndex);
    }
    return startIndex
  };

  const getTickArrayStartIndexByTick = (tickIndex, tickSpacing) => {
    return getTickArrayBitIndex(tickIndex, tickSpacing) * tickCount(tickSpacing)
  };

  const isOverflowDefaultTickarrayBitmap = (tickSpacing, tickarrayStartIndexs)=> {
    const { maxTickBoundary, minTickBoundary } = tickRange(tickSpacing);

    for (const tickIndex of tickarrayStartIndexs) {
      const tickarrayStartIndex = getTickArrayStartIndexByTick(tickIndex, tickSpacing);

      if (tickarrayStartIndex >= maxTickBoundary || tickarrayStartIndex < minTickBoundary) {
        return true
      }
    }

    return false
  };

  const checkIsOutOfBoundary = (tick) => {
    return tick < MIN_TICK || tick > MAX_TICK
  };

  const checkIsValidStartIndex = (tickIndex, tickSpacing) => {
    if (checkIsOutOfBoundary(tickIndex)) {
      if (tickIndex > MAX_TICK) {
        return false;
      }
      const minStartIndex = getTickArrayStartIndexByTick(MIN_TICK, tickSpacing);
      return tickIndex == minStartIndex;
    }
    return tickIndex % tickCount(tickSpacing) == 0;
  };

  const extensionTickBoundary = (tickSpacing) => {
    const positiveTickBoundary = maxTickInTickarrayBitmap(tickSpacing);

    const negativeTickBoundary = -positiveTickBoundary;

    if (MAX_TICK <= positiveTickBoundary)
      throw Error(`extensionTickBoundary check error: ${MAX_TICK}, ${positiveTickBoundary}`);
    if (negativeTickBoundary <= MIN_TICK)
      throw Error(`extensionTickBoundary check error: ${negativeTickBoundary}, ${MIN_TICK}`);

    return { positiveTickBoundary, negativeTickBoundary };
  };

  const checkExtensionBoundary = (tickIndex, tickSpacing) => {
    const { positiveTickBoundary, negativeTickBoundary } = extensionTickBoundary(tickSpacing);

    if (tickIndex >= negativeTickBoundary && tickIndex < positiveTickBoundary) {
      throw Error("checkExtensionBoundary -> InvalidTickArrayBoundary");
    }
  };

  const getBitmapOffset = (tickIndex, tickSpacing) => {
    if (!checkIsValidStartIndex(tickIndex, tickSpacing)) {
      throw new Error("No enough initialized tickArray");
    }
    checkExtensionBoundary(tickIndex, tickSpacing);

    const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
    let offset = Math.floor(Math.abs(tickIndex) / ticksInOneBitmap) - 1;

    if (tickIndex < 0 && Math.abs(tickIndex) % ticksInOneBitmap === 0) offset--;
    return offset;
  };

  const getBitmap = (tickIndex, tickSpacing, tickArrayBitmapExtension) => {
    const offset = getBitmapOffset(tickIndex, tickSpacing);
    if (tickIndex < 0) {
      return { offset, tickarrayBitmap: tickArrayBitmapExtension.negativeTickArrayBitmap[offset] }
    } else {
      return { offset, tickarrayBitmap: tickArrayBitmapExtension.positiveTickArrayBitmap[offset] }
    }
  };

  const tickArrayOffsetInBitmap = (tickArrayStartIndex, tickSpacing) => {
    const m = Math.abs(tickArrayStartIndex) % maxTickInTickarrayBitmap(tickSpacing);
    let tickArrayOffsetInBitmap = Math.floor(m / tickCount(tickSpacing));
    if (tickArrayStartIndex < 0 && m != 0) {
      tickArrayOffsetInBitmap = TICK_ARRAY_BITMAP_SIZE - tickArrayOffsetInBitmap;
    }
    return tickArrayOffsetInBitmap;
  };

  const mergeTickArrayBitmap = (bns) => {
    let b = new solanaWeb3_js.BN(0);
    for (let i = 0; i < bns.length; i++) {
      b = b.add(bns[i].shln(64 * i));
    }
    return b;
  };

  const checkTickArrayIsInit = (tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension) => {
    const { tickarrayBitmap } = getBitmap(tickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

    const _tickArrayOffsetInBitmap = tickArrayOffsetInBitmap(tickArrayStartIndex, tickSpacing);

    return {
      isInitialized: mergeTickArrayBitmap(tickarrayBitmap).testn(_tickArrayOffsetInBitmap),
      startIndex: tickArrayStartIndex,
    };
  };

  const checkTickArrayIsInitialized = (bitmap, tick, tickSpacing) => {
    const multiplier = tickSpacing * TICK_ARRAY_SIZE;
    const compressed = Math.floor(tick / multiplier) + 512;
    const bitPos = Math.abs(compressed);
    return {
      isInitialized: bitmap.testn(bitPos),
      startIndex: (bitPos - 512) * multiplier,
    };
  };

  const i32ToBytes = (num) => {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setInt32(0, num, false);
    return new Uint8Array(arr)
  };

  const getPdaTickArrayAddress = (programId, poolId, startIndex) => {
    const [publicKey, nonce] = solanaWeb3_js.PublicKey.findProgramAddressSync([TICK_ARRAY_SEED, solanaWeb3_js.Buffer.from(poolId.toBuffer()), i32ToBytes(startIndex)], programId);
    return publicKey
  };

  const isZero = (bitNum, data) => {
    for (let i = 0; i < bitNum; i++) {
      if (data.testn(i)) return false;
    }
    return true;
  };

  const leadingZeros = (bitNum, data) => {
    let i = 0;
    for (let j = bitNum - 1; j >= 0; j--) {
      if (!data.testn(j)) {
        i++;
      } else {
        break;
      }
    }
    return i;
  };

  const trailingZeros = (bitNum, data) => {
    let i = 0;
    for (let j = 0; j < bitNum; j++) {
      if (!data.testn(j)) {
        i++;
      } else {
        break;
      }
    }
    return i;
  };

  const mostSignificantBit = (bitNum, data) => {
    if (isZero(bitNum, data)) return null;
    else return leadingZeros(bitNum, data);
  };

  const leastSignificantBit = (bitNum, data) => {
    if (isZero(bitNum, data)) return null;
    else return trailingZeros(bitNum, data);
  };

  const nextInitializedTickArrayBitmapStartIndex = (bitMap, lastTickArrayStartIndex, tickSpacing, zeroForOne) => {
    if (!checkIsValidStartIndex(lastTickArrayStartIndex, tickSpacing))
      throw Error("nextInitializedTickArrayStartIndex check error");

    const tickBoundary = maxTickInTickarrayBitmap(tickSpacing);
    const nextTickArrayStartIndex = zeroForOne
      ? lastTickArrayStartIndex - tickCount(tickSpacing)
      : lastTickArrayStartIndex + tickCount(tickSpacing);

    if (nextTickArrayStartIndex < -tickBoundary || nextTickArrayStartIndex >= tickBoundary) {
      return { isInit: false, tickIndex: lastTickArrayStartIndex };
    }

    const multiplier = tickSpacing * TICK_ARRAY_SIZE;
    let compressed = nextTickArrayStartIndex / multiplier + 512;

    if (nextTickArrayStartIndex < 0 && nextTickArrayStartIndex % multiplier != 0) {
      compressed--;
    }

    const bitPos = Math.abs(compressed);

    if (zeroForOne) {
      const offsetBitMap = bitMap.shln(1024 - bitPos - 1);
      const nextBit = mostSignificantBit(1024, offsetBitMap);
      if (nextBit !== null) {
        const nextArrayStartIndex = (bitPos - nextBit - 512) * multiplier;
        return { isInit: true, tickIndex: nextArrayStartIndex };
      } else {
        return { isInit: false, tickIndex: -tickBoundary };
      }
    } else {
      const offsetBitMap = bitMap.shrn(bitPos);
      const nextBit = leastSignificantBit(1024, offsetBitMap);
      if (nextBit !== null) {
        const nextArrayStartIndex = (bitPos + nextBit - 512) * multiplier;
        return { isInit: true, tickIndex: nextArrayStartIndex };
      } else {
        return { isInit: false, tickIndex: tickBoundary - tickCount(tickSpacing) };
      }
    }
  };

  const getBitmapTickBoundary =(tickarrayStartIndex, tickSpacing) => {
    const ticksInOneBitmap = maxTickInTickarrayBitmap(tickSpacing);
    let m = Math.floor(Math.abs(tickarrayStartIndex) / ticksInOneBitmap);
    if (tickarrayStartIndex < 0 && Math.abs(tickarrayStartIndex) % ticksInOneBitmap != 0) m += 1;

    const minValue = ticksInOneBitmap * m;

    return tickarrayStartIndex < 0
      ? { minValue: -minValue, maxValue: -minValue + ticksInOneBitmap }
      : { minValue, maxValue: minValue + ticksInOneBitmap };
  };

  const nextInitializedTickArrayInBitmap = (tickarrayBitmap, nextTickArrayStartIndex, tickSpacing, zeroForOne) => {
    const { minValue: bitmapMinTickBoundary, maxValue: bitmapMaxTickBoundary } = getBitmapTickBoundary(
      nextTickArrayStartIndex,
      tickSpacing,
    );

    const _tickArrayOffsetInBitmap = tickArrayOffsetInBitmap(nextTickArrayStartIndex, tickSpacing);
    if (zeroForOne) {
      // tick from upper to lower
      // find from highter bits to lower bits
      const offsetBitMap = mergeTickArrayBitmap(tickarrayBitmap).shln(
        TICK_ARRAY_BITMAP_SIZE - 1 - _tickArrayOffsetInBitmap,
      );

      const nextBit = isZero(512, offsetBitMap) ? null : leadingZeros(512, offsetBitMap);

      if (nextBit !== null) {
        const nextArrayStartIndex = nextTickArrayStartIndex - nextBit * tickCount(tickSpacing);
        return { isInit: true, tickIndex: nextArrayStartIndex };
      } else {
        // not found til to the end
        return { isInit: false, tickIndex: bitmapMinTickBoundary };
      }
    } else {
      // tick from lower to upper
      // find from lower bits to highter bits
      const offsetBitMap = mergeTickArrayBitmap(tickarrayBitmap).shrn(_tickArrayOffsetInBitmap);

      const nextBit = isZero(512, offsetBitMap) ? null : trailingZeros(512, offsetBitMap);

      if (nextBit !== null) {
        const nextArrayStartIndex = nextTickArrayStartIndex + nextBit * tickCount(tickSpacing);
        return { isInit: true, tickIndex: nextArrayStartIndex };
      } else {
        // not found til to the end
        return { isInit: false, tickIndex: bitmapMaxTickBoundary - tickCount(tickSpacing) };
      }
    }
  };

  const nextInitializedTickArrayFromOneBitmap = (lastTickArrayStartIndex, tickSpacing, zeroForOne, tickArrayBitmapExtension) => {
    const multiplier = tickCount(tickSpacing);
    const nextTickArrayStartIndex = zeroForOne
      ? lastTickArrayStartIndex - multiplier
      : lastTickArrayStartIndex + multiplier;
    const { tickarrayBitmap } = getBitmap(nextTickArrayStartIndex, tickSpacing, tickArrayBitmapExtension);

    return nextInitializedTickArrayInBitmap(tickarrayBitmap, nextTickArrayStartIndex, tickSpacing, zeroForOne);
  };

  const nextInitializedTickArrayStartIndex = (poolInfo, lastTickArrayStartIndex, zeroForOne) => {
    lastTickArrayStartIndex = getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing);

    while (true) {
      const { isInit: startIsInit, tickIndex: startIndex } = nextInitializedTickArrayBitmapStartIndex(
        mergeTickArrayBitmap(poolInfo.tickArrayBitmap),
        lastTickArrayStartIndex,
        poolInfo.tickSpacing,
        zeroForOne,
      );
      if (startIsInit) {
        return { isExist: true, nextStartIndex: startIndex };
      }
      lastTickArrayStartIndex = startIndex;

      const { isInit, tickIndex } = nextInitializedTickArrayFromOneBitmap(
        lastTickArrayStartIndex,
        poolInfo.tickSpacing,
        zeroForOne,
        poolInfo.exBitmapInfo,
      );
      if (isInit) return { isExist: true, nextStartIndex: tickIndex };

      lastTickArrayStartIndex = tickIndex;

      if (lastTickArrayStartIndex < MIN_TICK || lastTickArrayStartIndex > MAX_TICK)
        return { isExist: false, nextStartIndex: 0 };
    }
  };

  const getFirstInitializedTickArray = async(
    poolInfo,
    zeroForOne,
  )=> {
    const { isInitialized, startIndex } = isOverflowDefaultTickarrayBitmap(poolInfo.tickSpacing, [
      poolInfo.tickCurrent,
    ])
      ? checkTickArrayIsInit(
          getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing),
          poolInfo.tickSpacing,
          poolInfo.exBitmapInfo,
        )
      : checkTickArrayIsInitialized(
          mergeTickArrayBitmap(poolInfo.tickArrayBitmap),
          poolInfo.tickCurrent,
          poolInfo.tickSpacing,
        );

    if (isInitialized) {
      const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, startIndex);
      return {
        isExist: true,
        startIndex,
        nextAccountMeta: address,
      };
    }
    const { isExist, nextStartIndex } = nextInitializedTickArrayStartIndex(
      poolInfo,
      getArrayStartIndex(poolInfo.tickCurrent, poolInfo.tickSpacing),
      zeroForOne,
    );
    if (isExist) {
      const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, nextStartIndex);
      return {
        isExist: true,
        startIndex: nextStartIndex,
        nextAccountMeta: address,
      };
    }
    return { isExist: false, nextAccountMeta: undefined, startIndex: undefined };
  };

  const getPdaExBitmapAddress = async(programId, poolId) => {
    const [publicKey, nonce] = await solanaWeb3_js.PublicKey.findProgramAddress([POOL_TICK_ARRAY_BITMAP_SEED, solanaWeb3_js.Buffer.from(poolId.toBuffer())], programId);
    return publicKey.toString()
  };

  const searchLowBitFromStart = (tickArrayBitmap, exTickArrayBitmap, currentTickArrayBitStartIndex, expectedCount, tickSpacing) => {
    const tickArrayBitmaps = [
      ...[...exTickArrayBitmap.negativeTickArrayBitmap].reverse(),
      tickArrayBitmap.slice(0, 8),
      tickArrayBitmap.slice(8, 16),
      ...exTickArrayBitmap.positiveTickArrayBitmap,
    ].map((i) => mergeTickArrayBitmap(i));
    const result = [];
    while (currentTickArrayBitStartIndex >= -7680) {
      const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
      const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;

      if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);

      currentTickArrayBitStartIndex--;
      if (result.length === expectedCount) break;
    }

    const _tickCount = tickCount(tickSpacing);
    return result.map((i) => i * _tickCount);
  };

  const searchHightBitFromStart = (tickArrayBitmap, exTickArrayBitmap, currentTickArrayBitStartIndex, expectedCount, tickSpacing) => {
    const tickArrayBitmaps = [
      ...[...exTickArrayBitmap.negativeTickArrayBitmap].reverse(),
      tickArrayBitmap.slice(0, 8),
      tickArrayBitmap.slice(8, 16),
      ...exTickArrayBitmap.positiveTickArrayBitmap,
    ].map((i) => mergeTickArrayBitmap(i));
    const result = [];
    while (currentTickArrayBitStartIndex < 7680) {
      const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
      const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;

      if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);

      currentTickArrayBitStartIndex++;
      if (result.length === expectedCount) break;
    }

    const _tickCount = tickCount(tickSpacing);
    return result.map((i) => i * _tickCount);
  };

  const fetchPoolTickArrays = async(poolKeys) =>{
    
    // const tickArrays: { pubkey: PublicKey }[] = [];
    const tickArrays = [];

    for (const itemPoolInfo of poolKeys) {
      const currentTickArrayStartIndex = getTickArrayStartIndexByTick(
        itemPoolInfo.tickCurrent,
        itemPoolInfo.tickSpacing,
      );
      const startIndexArray = getInitializedTickArrayInRange(
        itemPoolInfo.tickArrayBitmap,
        itemPoolInfo.exBitmapInfo,
        itemPoolInfo.tickSpacing,
        currentTickArrayStartIndex,
        25,
      );
      for (const itemIndex of startIndexArray) {
        const tickArrayAddress = getPdaTickArrayAddress(
          itemPoolInfo.programId,
          itemPoolInfo.id,
          itemIndex,
        );
        tickArrays.push({ pubkey: tickArrayAddress });
      }
    }

    const tickArrayCache = {};
    
    await Promise.all(tickArrays.map(
      async(tickArray) => {
        const tickData = await request(`solana://${tickArray.pubkey.toString()}`, {
          api: TICK_ARRAY_LAYOUT,
          cache: 5000, // 5 seconds in ms
          cacheKey: ['raydium', 'cl', 'tickarray', tickArray.pubkey.toString()].join('-')
        });
        if (tickArrayCache[tickData.poolId.toString()] === undefined) tickArrayCache[tickData.poolId.toString()] = {};

        tickArrayCache[tickData.poolId.toString()][tickData.startTickIndex] = {
          ...tickData,
          address: tickArray.pubkey,
        };
      }
    ));

    return tickArrayCache
  };

  const preInitializedTickArrayStartIndex = (poolInfo, zeroForOne) => {
    const currentOffset = Math.floor(poolInfo.tickCurrent / tickCount(poolInfo.tickSpacing));

    const result = !zeroForOne
      ? searchLowBitFromStart(
          poolInfo.tickArrayBitmap,
          poolInfo.exBitmapInfo,
          currentOffset - 1,
          1,
          poolInfo.tickSpacing,
        )
      : searchHightBitFromStart(
          poolInfo.tickArrayBitmap,
          poolInfo.exBitmapInfo,
          currentOffset + 1,
          1,
          poolInfo.tickSpacing,
        );

    return result.length > 0 ? { isExist: true, nextStartIndex: result[0] } : { isExist: false, nextStartIndex: 0 };
  };

  const getPairsWithPrice$1 = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })=>{

    let accounts;
    const exBitData = {};

    if(pairsDatum) {

      let exBitDataForAddress;

      [accounts, exBitDataForAddress] = await Promise.all([
        await request(`solana://${pairsDatum.id}`, { api: CLMM_LAYOUT, cache: 5000 }).then((data)=>{
          return [{
            pubkey: new solanaWeb3_js.PublicKey(pairsDatum.id),
            data
          }]
        }),
        await request(`solana://${pairsDatum.exBitmapAddress}`, { api: TICK_ARRAY_BITMAP_EXTENSION_LAYOUT, cache: 5000 }),
      ]);

      exBitData[pairsDatum.exBitmapAddress] = exBitDataForAddress;

    } else {
      accounts = await getPairs(tokenIn, tokenOut);

      if(accounts.length == 0) {
        accounts = await getPairs(tokenOut, tokenIn);
      }

      accounts = accounts.filter((account)=>account.data.liquidity.gte(new solanaWeb3_js.BN('1000')));
      
      let addresses = await Promise.all(accounts.map(
        (account) => getPdaExBitmapAddress(new solanaWeb3_js.PublicKey(PROGRAM_ID), account.pubkey)
      ));

      await Promise.all(addresses.map(
        async(address) => {
          exBitData[address] = await request(`solana://${address}`, {
            api: TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
            cache: 5000, // 5 seconds in ms
          });
        }
      ));
    }

    const poolInfos = await Promise.all(accounts.map(async(account)=>{
      const ammConfig = await request(`solana://${account.data.ammConfig.toString()}`, {
        api: CLMM_CONFIG_LAYOUT,
        cache: 5000
      });
      return {
        ...account.data,
        ammConfig: {...ammConfig, pubkey: account.data.ammConfig},
        id: account.pubkey,
        programId: new solanaWeb3_js.PublicKey(PROGRAM_ID),
        exBitmapInfo: exBitData[await getPdaExBitmapAddress(new solanaWeb3_js.PublicKey(PROGRAM_ID), account.pubkey)],
      }
    }));

    const tickArrayCache = await fetchPoolTickArrays(poolInfos);

    const pairs = await Promise.all(poolInfos.map(async(poolInfo)=>{

      try {

        let price = 0;

        let _return;

        let allNeededAccounts = [];

        if(amountIn || amountInMax) { // compute amountOut

          const zeroForOne = tokenIn.toString() === poolInfo.mintA.toString();
          
          const {
            isExist,
            startIndex: firstTickArrayStartIndex,
            nextAccountMeta,
          } = await getFirstInitializedTickArray(poolInfo, zeroForOne);
          if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

          const inputAmount = new solanaWeb3_js.BN((amountIn || amountInMax).toString());

          const {
            amountCalculated: outputAmount,
            accounts: remainingAccounts,
            sqrtPriceX64: executionPrice,
            feeAmount,
          } = SwapMath.swapCompute(
            poolInfo.programId,
            poolInfo.id,
            tickArrayCache[poolInfo.id],
            poolInfo.tickArrayBitmap,
            poolInfo.exBitmapInfo,
            zeroForOne,
            poolInfo.ammConfig.tradeFeeRate,
            poolInfo.liquidity,
            poolInfo.tickCurrent,
            poolInfo.tickSpacing,
            poolInfo.sqrtPriceX64,
            inputAmount,
            firstTickArrayStartIndex,
            undefined,
          );

          _return = {
            type: 'clmm',
            price: outputAmount.abs().toString(),
            data: { ...poolInfo },
          };

        } else { // compute amountIn

          const zeroForOne = tokenOut.toString() === poolInfo.mintA.toString();
          
          const {
            isExist,
            startIndex: firstTickArrayStartIndex,
            nextAccountMeta,
          } = await getFirstInitializedTickArray(poolInfo, zeroForOne);
          if (!isExist || firstTickArrayStartIndex === undefined || !nextAccountMeta) throw new Error("Invalid tick array")

          try {
            const preTick = preInitializedTickArrayStartIndex(poolInfo, zeroForOne);
            if (preTick.isExist) {
              const address = getPdaTickArrayAddress(poolInfo.programId, poolInfo.id, preTick.nextStartIndex);
              allNeededAccounts.push(new solanaWeb3_js.PublicKey(address));
            }
          } catch (e) {
            console.log('ERROR', e);
            /* empty */
          }

          allNeededAccounts.push(nextAccountMeta);
          
          const outputAmount = new solanaWeb3_js.BN((amountOut || amountOutMin).toString());

          const {
            amountCalculated: inputAmount,
            accounts: remainingAccounts,
          } = SwapMath.swapCompute(
            poolInfo.programId,
            poolInfo.id,
            tickArrayCache[poolInfo.id],
            poolInfo.tickArrayBitmap,
            poolInfo.exBitmapInfo,
            zeroForOne,
            poolInfo.ammConfig.tradeFeeRate,
            poolInfo.liquidity,
            poolInfo.tickCurrent,
            poolInfo.tickSpacing,
            poolInfo.sqrtPriceX64,
            outputAmount,
            firstTickArrayStartIndex,
            undefined,
          );
          allNeededAccounts.push(...remainingAccounts);
          _return = {
            type: 'clmm',
            price: inputAmount.abs().toString(),
            data: { ...poolInfo, allNeededAccounts },
          };
        }

        if(!_return || _return.price === 0) { return }

        return _return
      
      } catch (e) { console.log(e); }
    
    }));

    return pairs.filter(Boolean)

  };

  function _optionalChain$5(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  const getPairsWithPrice = async({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })=>{
    try {
      if(_optionalChain$5([exchange, 'optionalAccess', _ => _.name]) == 'raydium_cp') {
        return getPairsWithPrice$2({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })
      } else if (_optionalChain$5([exchange, 'optionalAccess', _2 => _2.name]) == 'raydium_cl') {
        return getPairsWithPrice$1({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })
      } else {
        return []
      }
    } catch(e) {
      console.log('ERROR', e);
      return []
    }
  };

  let getHighestPrice = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).gt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getLowestPrice = (pairs)=>{
    return pairs.reduce((bestPricePair, currentPair)=> ethers.ethers.BigNumber.from(currentPair.price).lt(ethers.ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
  };

  let getBestPair = async({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum }) => {
    const pairs = await getPairsWithPrice({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum });

    if(!pairs || pairs.length === 0) { return }

    let bestPair;

    if(amountIn || amountInMax) {
      bestPair = getHighestPrice(pairs);
    } else { // amount out
      bestPair = getLowestPrice(pairs);
    }

    return bestPair
  };

  function _optionalChain$4(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  const blockchain$1 = Blockchains__default['default'].solana;

  // Replaces 11111111111111111111111111111111 with the wrapped token and implies wrapping.
  //
  // We keep 11111111111111111111111111111111 internally
  // to be able to differentiate between SOL<>Token and WSOL<>Token swaps
  // as they are not the same!
  //
  let getExchangePath$4 = ({ path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === blockchain$1.currency.address && path[index+1] != blockchain$1.wrapped.address &&
        path[index-1] != blockchain$1.wrapped.address
      ) {
        return blockchain$1.wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == blockchain$1.currency.address && exchangePath[1] == blockchain$1.wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == blockchain$1.currency.address && exchangePath[exchangePath.length-2] == blockchain$1.wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  let pathExists$5 = async ({ exchange, path, amountIn, amountInMax, amountOut, amountOutMin }) => {
    if(path.length == 1) { return false }
    path = getExchangePath$4({ path });
    let pairs = (await getPairsWithPrice({ exchange, tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, amountOut, amountOutMin }));
    if(pairs.length > 0) {
      return true
    } else {
      return false
    }
  };

  let findPath$5 = async ({ exchange, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin, pairsData }) => {
    
    if(pairsData) {
      let path;
      if(pairsData.length == 1) {
        path = [tokenIn, tokenOut];
      } else if(pairsData.length == 2) {
        const tokenMiddle = [pairsData[0].mintA, pairsData[0].mintB].includes(pairsData[1].mintA) ? pairsData[1].mintA : pairsData[1].mintB;
        path = [tokenIn, tokenMiddle, tokenOut];
      }
      if(path) {
        return { path , exchangePath: getExchangePath$4({ path }) }
      }
    }

    if(
      [tokenIn, tokenOut].includes(blockchain$1.currency.address) &&
      [tokenIn, tokenOut].includes(blockchain$1.wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path, stablesIn, stablesOut, stable;

    if (await pathExists$5({ exchange, path: [tokenIn, tokenOut], amountIn, amountInMax, amountOut, amountOutMin })) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != blockchain$1.wrapped.address &&
      tokenIn != blockchain$1.currency.address &&
      await pathExists$5({ exchange, path: [tokenIn, blockchain$1.wrapped.address], amountIn, amountInMax, amountOut, amountOutMin }) &&
      tokenOut != blockchain$1.wrapped.address &&
      tokenOut != blockchain$1.currency.address &&
      await pathExists$5({ exchange, path: [tokenOut, blockchain$1.wrapped.address], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })
    ) {
      // path via blockchain.wrapped.address
      path = [tokenIn, blockchain$1.wrapped.address, tokenOut];
    } else if (
      !blockchain$1.stables.usd.includes(tokenIn) &&
      (stablesIn = (await Promise.all(blockchain$1.stables.usd.map(async(stable)=>await pathExists$5({ exchange, path: [tokenIn, stable], amountIn, amountInMax, amountOut, amountOutMin }) ? stable : undefined))).filter(Boolean)) &&
      !blockchain$1.stables.usd.includes(tokenOut) &&
      (stablesOut = (await Promise.all(blockchain$1.stables.usd.map(async(stable)=>await pathExists$5({ exchange, path: [tokenOut, stable], amountIn: (amountOut||amountOutMin), amountInMax: (amountOut||amountOutMin), amountOut: (amountIn||amountInMax), amountOutMin: (amountIn||amountInMax) })  ? stable : undefined))).filter(Boolean)) &&
      (stable = stablesIn.filter((stable)=> stablesOut.includes(stable))[0])
    ) {
      // path via TOKEN_IN <> STABLE <> TOKEN_OUT
      path = [tokenIn, stable, tokenOut];
    }

    // Add blockchain.wrapped.address to route path if things start or end with blockchain.currency.address
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$4([path, 'optionalAccess', _ => _.length]) && path[0] == blockchain$1.currency.address) {
      path.splice(1, 0, blockchain$1.wrapped.address);
    } else if(_optionalChain$4([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == blockchain$1.currency.address) {
      path.splice(path.length-1, 0, blockchain$1.wrapped.address);
    }
    return { path, exchangePath: getExchangePath$4({ path }) }
  };

  let getAmountsOut = async ({ exchange, path, amountIn, amountInMax, pairsData }) => {

    let pools = [];
    let amounts = [ethers.ethers.BigNumber.from(amountIn || amountInMax)];

    let bestPair = await getBestPair({ exchange, tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, pairsDatum: pairsData && pairsData[0] });
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
    pools.push(bestPair);
    
    if (path.length === 3) {
      let bestPair = await getBestPair({ exchange, tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[1] });
      if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
      amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
      pools.push(bestPair);
    }

    if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

    return { amounts, pools }
  };

  let getAmountsIn = async({ exchange, path, amountOut, amountOutMin, pairsData }) => {

    path = path.slice().reverse();
    let pools = [];
    let amounts = [ethers.ethers.BigNumber.from(amountOut || amountOutMin)];

    let bestPair = await getBestPair({ exchange, tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin, pairsDatum: pairsData && (path.length === 2 ? pairsData[0] : pairsData[1]) });
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
    pools.push(bestPair);
    
    if (path.length === 3) {
      let bestPair = await getBestPair({ exchange, tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[0] });
      if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
      amounts.push(ethers.ethers.BigNumber.from(bestPair.price));
      pools.push(bestPair);
    }
    
    if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

    return { amounts: amounts.slice().reverse(), pools: pools.slice().reverse() }
  };

  let getAmounts$5 = async ({
    path,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin,
    exchange,
    pairsData
  }) => {
    path = getExchangePath$4({ path });
    let amounts;
    let pools;
    if (amountOut) {
  ({ amounts, pools } = await getAmountsIn({ exchange, path, amountOut, tokenIn, tokenOut, pairsData }));
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
  ({ amounts, pools } = await getAmountsOut({ exchange, path, amountIn, tokenIn, tokenOut, pairsData }));
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
  ({ amounts, pools } = await getAmountsIn({ exchange, path, amountOutMin, tokenIn, tokenOut, pairsData }));
      amountIn = amounts ? amounts[0] : undefined;
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
  ({ amounts, pools } = await getAmountsOut({ exchange, path, amountInMax, tokenIn, tokenOut, pairsData }));
      amountOut = amounts ? amounts[amounts.length-1] : undefined;
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return {
      amountOut: (amountOut || amountOutMin),
      amountIn: (amountIn || amountInMax),
      amountInMax: (amountInMax || amountIn),
      amountOutMin: (amountOutMin || amountOut),
      amounts,
      pools,
    }
  };

  const blockchain = Blockchains__default['default'].solana;

  const CP_PROGRAM_ID = new solanaWeb3_js.PublicKey('CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C');
  const CL_PROGRAM_ID = new solanaWeb3_js.PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK');

  const swapBaseInputInstruction = [143, 190, 90, 218, 196, 30, 51, 222];
  const swapBaseOutputInstruction = [55, 217, 98, 86, 163, 74, 180, 173];

  const anchorDataBuf = {
    swap: [43, 4, 237, 11, 26, 201, 30, 98], // [248, 198, 158, 145, 225, 117, 135, 200],
  };

  const createTokenAccountIfNotExisting = async ({ instructions, owner, token, account })=>{
    let outAccountExists;
    try{ outAccountExists = !!(await request({ blockchain: 'solana', address: account.toString() })); } catch (e2) {}
    if(!outAccountExists) {
      instructions.push(
        await Token.solana.createAssociatedTokenAccountInstruction({
          token,
          owner,
          payer: owner,
        })
      );
    }
  };

  const getPdaPoolAuthority = async(programId)=> {
    let [publicKey, nonce] = await solanaWeb3_js.PublicKey.findProgramAddress(
      [solanaWeb3_js.Buffer.from("vault_and_lp_mint_auth_seed", "utf8")],
      programId
    );
    return publicKey
  };

  const getPdaObservationId = async(programId, poolId)=> {
    let [publicKey, nonce] = await solanaWeb3_js.PublicKey.findProgramAddress(
      [
        solanaWeb3_js.Buffer.from("observation", "utf8"),
        solanaWeb3_js.Buffer.from(poolId.toBuffer())
      ],
      programId
    );
    return publicKey
  };

  const getCPMMInstruction = async({
    account,
    tokenIn,
    tokenOut,
    tokenAccountIn,
    tokenAccountOut,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountInMaxInput,
    amountOutInput,
    amountOutMinInput,
    pool
  })=>{
    const inputMint = tokenIn == pool.mintA ? pool.data.mintA : pool.data.mintB;
    const outputMint = tokenIn == pool.mintA ? pool.data.mintB : pool.data.mintA;
    const inputVault = tokenIn == pool.mintA ? pool.data.vaultA : pool.data.vaultB;
    const outputVault = tokenIn == pool.mintA ? pool.data.vaultB : pool.data.vaultA;
    const poolId = new solanaWeb3_js.PublicKey(pool.publicKey);

    if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

      const dataLayout = solanaWeb3_js.struct([solanaWeb3_js.u64("amountIn"), solanaWeb3_js.u64("amounOutMin")]);

        const keys = [
          // 0 payer
          { pubkey: new solanaWeb3_js.PublicKey(account), isSigner: true, isWritable: false },
          // 1 authority
          { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
          // 2 configId
          { pubkey: pool.data.configId, isSigner: false, isWritable: false },
          // 3 poolId
          { pubkey: poolId, isSigner: false, isWritable: true },
          // 4 userInputAccount
          { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
          // 5 userOutputAccount
          { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
          // 6 inputVault
          { pubkey: inputVault, isSigner: false, isWritable: true },
          // 7 outputVault
          { pubkey: outputVault, isSigner: false, isWritable: true },
          // 8 inputTokenProgram
          { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
          // 9 outputTokenProgram
          { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
          // 10 inputMint
          { pubkey: inputMint, isSigner: false, isWritable: false },
          // 11 outputMint
          { pubkey: outputMint, isSigner: false, isWritable: false },
          // 12 observationId
          { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
        ];

        const data = solanaWeb3_js.Buffer.alloc(dataLayout.span);
        dataLayout.encode({ 
          amountIn: new solanaWeb3_js.BN((amountIn || amountInMax).toString()),
          amounOutMin: new solanaWeb3_js.BN((amountOut || amountOutMin).toString())
        }, data);

        return new solanaWeb3_js.TransactionInstruction({
          programId: CP_PROGRAM_ID,
          keys,
          data: solanaWeb3_js.Buffer.from([...swapBaseInputInstruction, ...data]),
        })

    } else { // fixed amountOut, variable amountIn (amountInMax)

      const dataLayout = solanaWeb3_js.struct([solanaWeb3_js.u64("amountInMax"), solanaWeb3_js.u64("amountOut")]);

      const keys = [
        // payer
        { pubkey: new solanaWeb3_js.PublicKey(account), isSigner: true, isWritable: false },
        // authority
        { pubkey: await getPdaPoolAuthority(CP_PROGRAM_ID), isSigner: false, isWritable: false },
        // configId
        { pubkey: pool.data.configId, isSigner: false, isWritable: false },
        // poolId
        { pubkey: poolId, isSigner: false, isWritable: true },
        // userInputAccount
        { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
        // userOutputAccount
        { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
        // inputVault
        { pubkey: inputVault, isSigner: false, isWritable: true },
        // outputVault
        { pubkey: outputVault, isSigner: false, isWritable: true },
        // inputTokenProgram
        { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // outputTokenProgram
        { pubkey: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
        // inputMint
        { pubkey: inputMint, isSigner: false, isWritable: false },
        // outputMint
        { pubkey: outputMint, isSigner: false, isWritable: false },
        // observationId
        { pubkey: await getPdaObservationId(CP_PROGRAM_ID, poolId), isSigner: false, isWritable: true },
      ];

      const data = solanaWeb3_js.Buffer.alloc(dataLayout.span);
      dataLayout.encode({ 
        amountInMax: new solanaWeb3_js.BN((amountIn || amountInMax).toString()),
        amountOut: new solanaWeb3_js.BN((amountOut || amountOutMin).toString())
      }, data);

      return new solanaWeb3_js.TransactionInstruction({
        programId: CP_PROGRAM_ID,
        keys,
        data: solanaWeb3_js.Buffer.from([...swapBaseOutputInstruction, ...data]),
      })

    }
  };

  const getCLMMInstruction = async({
    account,
    tokenIn,
    tokenOut,
    tokenAccountIn,
    tokenAccountOut,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountInMaxInput,
    amountOutInput,
    amountOutMinInput,
    pool
  })=>{
    const inputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintA : pool.data.mintB;
    const outputMint = tokenIn == pool.data.mintA.toString() ? pool.data.mintB : pool.data.mintA;
    const poolId = pool.data.id;
    const exTickArrayBitmapAddress = new solanaWeb3_js.PublicKey(await getPdaExBitmapAddress(new solanaWeb3_js.PublicKey(CL_PROGRAM_ID), poolId));

    if(amountInInput || amountOutMinInput) { // fixed amountIn, variable amountOut (amountOutMin)

      const remainingAccounts = [
        ...pool.data.allNeededAccounts.map((pubkey) => ({ pubkey, isSigner: false, isWritable: true })),
      ];

      const keys = [
        // payer
        { pubkey: new solanaWeb3_js.PublicKey(account), isSigner: true, isWritable: true },
        // ammConfigId
        { pubkey: pool.data.ammConfig.pubkey, isSigner: false, isWritable: true },

        // poolId
        { pubkey: pool.data.id, isSigner: false, isWritable: true },
        // inputTokenAccount
        { pubkey: tokenAccountIn, isSigner: false, isWritable: true },
        // outputTokenAccount
        { pubkey: tokenAccountOut, isSigner: false, isWritable: true },
        // inputVault
        { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultA : pool.data.vaultB, isSigner: false, isWritable: true },
        // outputVault
        { pubkey: tokenIn == pool.data.mintA.toString() ? pool.data.vaultB : pool.data.vaultA, isSigner: false, isWritable: true },

        // observationId
        { pubkey: pool.data.observationId, isSigner: false, isWritable: true },

        // TOKEN_PROGRAM_ID
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        // TOKEN_2022_PROGRAM_ID
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        // MEMO_PROGRAM_ID
        { pubkey: MEMO_PROGRAM_ID, isSigner: false, isWritable: false },

        // inputMint
        { pubkey: inputMint, isSigner: false, isWritable: false },
        // outputMint
        { pubkey: outputMint, isSigner: false, isWritable: false },
        
        // exTickArrayBitmapAddress
        { pubkey: exTickArrayBitmapAddress, isSigner: false, isWritable: true },

        ...remainingAccounts,
      ];

      const dataLayout = solanaWeb3_js.struct([
        solanaWeb3_js.u64("amount"),
        solanaWeb3_js.u64("otherAmountThreshold"),
        solanaWeb3_js.u128("sqrtPriceLimitX64"),
        solanaWeb3_js.bool("isBaseInput"),
      ]);

      const data = solanaWeb3_js.Buffer.alloc(dataLayout.span);
      dataLayout.encode(
        {
          amount: new solanaWeb3_js.BN(amountIn.toString()),
          otherAmountThreshold: new solanaWeb3_js.BN(amountOut.toString()),
          sqrtPriceLimitX64: new solanaWeb3_js.BN('0'),
          isBaseInput: true, // exact input
        },
        data,
      );

      return new solanaWeb3_js.TransactionInstruction({
        programId: CL_PROGRAM_ID,
        keys,
        data: solanaWeb3_js.Buffer.from([...anchorDataBuf.swap, ...data]),
      })

    }
  };

  const getTransaction$5 = async({
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amounts,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account,
    exchange,
    pools
  })=>{
    let transaction = { blockchain: 'solana' };
    let instructions = [];

    const exchangePath = getExchangePath$4({ path });
    if(exchangePath.length > 3) { throw 'Raydium can only handle fixed paths with a max length of 3 (2 pools)!' }
    const tokenIn = exchangePath[0];
    const tokenMiddle = exchangePath.length == 3 ? exchangePath[1] : undefined;
    const tokenOut = exchangePath[exchangePath.length-1];
      
    let pairs;
    if(pools) {
      pairs = pools;
    } else if(exchangePath.length == 2) {
      pairs = [await getBestPair({ exchange, tokenIn, tokenOut, amountIn: (amountInInput || amountInMaxInput), amountOut: (amountOutInput || amountOutMinInput) })];
    } else {
      if(amountInInput || amountInMaxInput) {
        pairs = [await getBestPair({ exchange, tokenIn, tokenOut: tokenMiddle, amountIn: (amountInInput || amountInMaxInput) })];
        pairs.push(await getBestPair({ exchange, tokenIn: tokenMiddle, tokenOut, amountIn: pairs[0].price }));
      } else { // originally amountOut
        pairs = [await getBestPair({ exchange, tokenIn: tokenMiddle, tokenOut, amountOut: (amountOutInput || amountOutMinInput) })];
        pairs.unshift(await getBestPair({ exchange, tokenIn, tokenOut: tokenMiddle, amountOut: pairs[0].price }));
      }
    }

    let startsWrapped = (path[0] === blockchain.currency.address && exchangePath[0] === blockchain.wrapped.address);
    let endsUnwrapped = (path[path.length-1] === blockchain.currency.address && exchangePath[exchangePath.length-1] === blockchain.wrapped.address);
    let wrappedAccount;
    const provider = await getProvider('solana');
    
    if(startsWrapped || endsUnwrapped) {
      const rent = await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span);
      const keypair = solanaWeb3_js.Keypair.generate();
      wrappedAccount = keypair.publicKey.toString();
      const lamports = startsWrapped ? new solanaWeb3_js.BN(amountIn.toString()).add(new solanaWeb3_js.BN(rent)) :  new solanaWeb3_js.BN(rent);
      let createAccountInstruction = solanaWeb3_js.SystemProgram.createAccount({
        fromPubkey: new solanaWeb3_js.PublicKey(account),
        newAccountPubkey: new solanaWeb3_js.PublicKey(wrappedAccount),
        programId: new solanaWeb3_js.PublicKey(Token.solana.TOKEN_PROGRAM),
        space: Token.solana.TOKEN_LAYOUT.span,
        lamports
      });
      createAccountInstruction.signers = [keypair];
      instructions.push(createAccountInstruction);
      instructions.push(
        Token.solana.initializeAccountInstruction({
          account: wrappedAccount,
          token: blockchain.wrapped.address,
          owner: account
        })
      );
    }

    const tokenAccountIn = startsWrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenIn }));
    const tokenAccountOut = endsUnwrapped ? new solanaWeb3_js.PublicKey(wrappedAccount) : new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenOut }));
    if(!endsUnwrapped) {
      await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenOut, account: tokenAccountOut });
    }

    if(pairs.length == 1) { // single hop swap

      if(pairs[0].type === 'clmm') {
        instructions.push(
          await getCLMMInstruction({
            account,
            tokenIn,
            tokenOut,
            tokenAccountIn,
            tokenAccountOut,
            amountIn,
            amountInMax,
            amountOut,
            amountOutMin,
            amountInInput,
            amountInMaxInput,
            amountOutInput,
            amountOutMinInput,
            pool: pairs[0],
          })
        );
      } else {
        instructions.push(
          await getCPMMInstruction({
            account,
            tokenIn,
            tokenOut,
            tokenAccountIn,
            tokenAccountOut,
            amountIn,
            amountInMax,
            amountOut,
            amountOutMin,
            amountInInput,
            amountInMaxInput,
            amountOutInput,
            amountOutMinInput,
            pool: pairs[0],
          })
        );
      }

    } else if(pairs.length == 2) { // two hop swap

      const tokenMiddleAccount = new solanaWeb3_js.PublicKey(await Token.solana.findProgramAddress({ owner: account, token: tokenMiddle }));
      await createTokenAccountIfNotExisting({ instructions, owner: account, token: tokenMiddle, account: tokenMiddleAccount });

      if(pairs[0].type === 'clmm') {
        instructions.push(
          await getCLMMInstruction({
            account,
            tokenIn,
            tokenOut: tokenMiddle,
            tokenAccountIn,
            tokenAccountOut: tokenMiddleAccount,
            amountIn: amounts[0],
            amountInMax: amounts[0],
            amountOut: amounts[1],
            amountOutMin: amounts[1],
            amountInInput: undefined,
            amountInMaxInput: undefined,
            amountOutInput: undefined,
            amountOutMinInput: amounts[1],
            pool: pairs[0],
          })
        );
      } else {
        instructions.push(
          await getCPMMInstruction({
            account,
            tokenIn,
            tokenOut: tokenMiddle,
            tokenAccountIn,
            tokenAccountOut: tokenMiddleAccount,
            amountIn: amounts[0],
            amountInMax: amounts[0],
            amountOut: amounts[1],
            amountOutMin: amounts[1],
            amountInInput: undefined,
            amountInMaxInput: undefined,
            amountOutInput: undefined,
            amountOutMinInput: amounts[1],
            pool: pairs[0],
          })
        );
      }

      if(pairs[1].type === 'clmm') {
        instructions.push(
          await getCLMMInstruction({
            account,
            tokenIn: tokenMiddle,
            tokenOut,
            tokenAccountIn: tokenMiddleAccount,
            tokenAccountOut,
            amountIn: amounts[1],
            amountInMax: amounts[1],
            amountOut: amounts[2],
            amountOutMin: amounts[2],
            amountInInput: undefined,
            amountInMaxInput: undefined,
            amountOutInput: undefined,
            amountOutMinInput: amounts[2],
            pool: pairs[1],
          })
        );
      } else {
        instructions.push(
          await getCPMMInstruction({
            account,
            tokenIn: tokenMiddle,
            tokenOut,
            tokenAccountIn: tokenMiddleAccount,
            tokenAccountOut,
            amountIn: amounts[1],
            amountInMax: amounts[1],
            amountOut: amounts[2],
            amountOutMin: amounts[2],
            amountInInput: undefined,
            amountInMaxInput: undefined,
            amountOutInput: undefined,
            amountOutMinInput: amounts[2],
            pool: pairs[1],
          })
        );
      }
    }
    
    if(startsWrapped || endsUnwrapped) {
      instructions.push(
        Token.solana.closeAccountInstruction({
          account: wrappedAccount,
          owner: account
        })
      );
    }

    // await debug(instructions, provider)

    transaction.instructions = instructions;
    return transaction
  };

  const LOGO = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMjkgMzMiIHdpZHRoPSIyOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjI4LjMxNjgiIHgyPSItMS43MzMzNiIgeTE9IjguMTkxNjIiIHkyPSIyMC4yMDg2Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjMjAwZmIiLz48c3RvcCBvZmZzZXQ9Ii40ODk2NTgiIHN0b3AtY29sb3I9IiMzNzcyZmYiLz48c3RvcCBvZmZzZXQ9Ii40ODk3NTgiIHN0b3AtY29sb3I9IiMzNzczZmUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1YWM0YmUiLz48L2xpbmVhckdyYWRpZW50PjxnIGZpbGw9InVybCgjYSkiPjxwYXRoIGQ9Im0yNi44NjI1IDEyLjI4MXYxMS40MTA0bC0xMi42OTE2IDcuMzI2MS0xMi42OTg1OS03LjMyNjF2LTE0LjY1OTM3bDEyLjY5ODU5LTcuMzMzMjIgOS43NTQxIDUuNjM0NDEgMS40NzIzLS44NDk0MS0xMS4yMjY0LTYuNDgzODEtMTQuMTcwOSA4LjE4MjYydjE2LjM1ODE4bDE0LjE3MDkgOC4xODI2IDE0LjE3MS04LjE4MjZ2LTEzLjEwOTJ6Ii8+PHBhdGggZD0ibTEwLjYxNzYgMjMuNjk4NWgtMi4xMjM1M3YtNy4xMjA5aDcuMDc4NDNjLjY2OTctLjAwNzQgMS4zMDk1LS4yNzgyIDEuNzgxMS0uNzUzOC40NzE2LS40NzU1LjczNy0xLjExNzYuNzM4OC0xLjc4NzQuMDAzOC0uMzMxMS0uMDYwMS0uNjU5Ni0uMTg3OS0uOTY1MS0uMTI3OS0uMzA1Ni0uMzE2OC0uNTgxNy0uNTU1NC0uODExNS0uMjMwOC0uMjM3Mi0uNTA3MS0uNDI1My0uODEyNC0uNTUzLS4zMDUzLS4xMjc4LS42MzMzLS4xOTI1LS45NjQyLS4xOTAzaC03LjA3ODQzdi0yLjE2NTk1aDcuMDg1NDNjMS4yNDA1LjAwNzQzIDIuNDI4MS41MDM1MSAzLjMwNTMgMS4zODA2NS44NzcxLjg3NzIgMS4zNzMyIDIuMDY0OCAxLjM4MDYgMy4zMDUyLjAwNzYuOTQ5Ni0uMjgxOSAxLjg3NzctLjgyODEgMi42NTQ0LS41MDI3Ljc0MzItMS4yMTExIDEuMzIzNy0yLjAzODYgMS42NzA1LS44MTk0LjI1OTktMS42NzQ1LjM4ODktMi41MzQxLjM4MjNoLTQuMjQ3eiIvPjxwYXRoIGQ9Im0yMC4yMTU5IDIzLjUyMTVoLTIuNDc3NWwtMS45MTExLTMuMzMzOWMuNzU2MS0uMDQ2MyAxLjUwMTktLjE5ODggMi4yMTU1LS40NTN6Ii8+PHBhdGggZD0ibTI1LjM4MzEgOS45MDk3NSAxLjQ2NTIuODE0MDUgMS40NjUzLS44MTQwNXYtMS43MjAwNWwtMS40NjUzLS44NDk0MS0xLjQ2NTIuODQ5NDF6Ii8+PC9nPjwvc3ZnPg==';

  var Raydium = {
    LOGO,
    findPath: findPath$5,
    pathExists: pathExists$5,
    getAmounts: getAmounts$5,
    getTransaction: getTransaction$5,
    CPMM_LAYOUT,
    CLMM_LAYOUT,
  };

  const exchange$h = {
    
    name: 'raydium_cp',
    label: 'Raydium',
    logo: Raydium.LOGO,
    protocol: 'raydium_cp',
    
    slippage: true,

    blockchains: ['solana'],

    solana: {
      
      router: {
        address: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
        api: Raydium.CPMM_LAYOUT
      },
    }
  };

  var raydium_cp = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$h, {
        scope,

        findPath: (args)=>Raydium.findPath({ ...args, exchange: exchange$h }),
        pathExists: (args)=>Raydium.pathExists({ ...args, exchange: exchange$h }),
        getAmounts: (args)=>Raydium.getAmounts({ ...args, exchange: exchange$h }),
        getPrep: (args)=>{},
        getTransaction: (args)=>Raydium.getTransaction({ ...args, exchange: exchange$h }),
        CurveCalculator,
        LAYOUTS,
      })
    )
  };

  const exchange$g = {
    
    name: 'raydium_cl',
    label: 'Raydium',
    logo: Raydium.LOGO,
    protocol: 'raydium_cl',
    
    slippage: true,

    blockchains: ['solana'],

    solana: {
      
      router: {
        address: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
        api: Raydium.CLMM_LAYOUT
      },
    }
  };

  var raydium_cl = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$g, {
        scope,

        findPath: (args)=>Raydium.findPath({ ...args, exchange: exchange$g }),
        pathExists: (args)=>Raydium.pathExists({ ...args, exchange: exchange$g }),
        getAmounts: (args)=>Raydium.getAmounts({ ...args, exchange: exchange$g }),
        getPrep: (args)=>{},
        getTransaction: (args)=>Raydium.getTransaction({ ...args, exchange: exchange$g }),
        SwapMath,
        getPdaExBitmapAddress,
        getFirstInitializedTickArray,
        fetchPoolTickArrays,
        LAYOUTS,
      })
    )
  };

  function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const getExchangePath$3 = ({ blockchain, exchange, path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === Blockchains__default['default'][blockchain].currency.address && path[index+1] != Blockchains__default['default'][blockchain].wrapped.address &&
        path[index-1] != Blockchains__default['default'][blockchain].wrapped.address
      ) {
        return Blockchains__default['default'][blockchain].wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == Blockchains__default['default'][blockchain].currency.address && exchangePath[1] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == Blockchains__default['default'][blockchain].currency.address && exchangePath[exchangePath.length-2] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  const minReserveRequirements = ({ reserves, min, token, token0, token1, decimals }) => {
    if(token0.toLowerCase() == token.toLowerCase()) {
      return reserves[0].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else if (token1.toLowerCase() == token.toLowerCase()) {
      return reserves[1].gte(ethers.ethers.utils.parseUnits(min.toString(), decimals))
    } else {
      return false
    }
  };

  const pathExists$4 = async ({ blockchain, exchange, path }) => {
    const exchangePath = getExchangePath$3({ blockchain, exchange, path });
    if(!exchangePath || exchangePath.length === 1) { return false }
    try {
      let pair = await request({
        blockchain,
        address: exchange[blockchain].factory.address,
        method: 'getPair',
        api: exchange[blockchain].factory.api,
        cache: 3600000, // 1 hour in ms
        params: getExchangePath$3({ blockchain, exchange, path }),
      });
      if(!pair || pair == Blockchains__default['default'][blockchain].zero) { return false }
      let [reserves, token0, token1] = await Promise.all([
        request({ blockchain, address: pair, method: 'getReserves', api: exchange[blockchain].pair.api, cache: 3600000 }),
        request({ blockchain, address: pair, method: 'token0', api: exchange[blockchain].pair.api, cache: 3600000 }),
        request({ blockchain, address: pair, method: 'token1', api: exchange[blockchain].pair.api, cache: 3600000 })
      ]);
      if(exchangePath.includes(Blockchains__default['default'][blockchain].wrapped.address)) {
        return minReserveRequirements({ min: 1, token: Blockchains__default['default'][blockchain].wrapped.address, decimals: Blockchains__default['default'][blockchain].currency.decimals, reserves, token0, token1 })
      } else if (path.find((step)=>Blockchains__default['default'][blockchain].stables.usd.includes(step))) {
        let address = path.find((step)=>Blockchains__default['default'][blockchain].stables.usd.includes(step));
        let token = new Token({ blockchain, address });
        let decimals = await token.decimals();
        return minReserveRequirements({ min: 1000, token: address, decimals, reserves, token0, token1 })
      } else {
        return true
      }
    } catch (e){ console.log('e', e); return false }
  };

  const findPath$4 = async ({ blockchain, exchange, tokenIn, tokenOut }) => {
    if(
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) &&
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path;
    if (await pathExists$4({ blockchain, exchange, path: [tokenIn, tokenOut] })) {
      // direct path
      path = [tokenIn, tokenOut];
    } else if (
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$4({ blockchain, exchange, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address] }) &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$4({ blockchain, exchange, path: [tokenOut, Blockchains__default['default'][blockchain].wrapped.address] })
    ) {
      // path via WRAPPED
      path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
    } else if (
      !Blockchains__default['default'][blockchain].stables.usd.includes(tokenIn) &&
      (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map((stable)=>pathExists$4({ blockchain, exchange, path: [tokenIn, stable] })))).filter(Boolean).length &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$4({ blockchain, exchange, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut] })
    ) {
      // path via tokenIn -> USD -> WRAPPED -> tokenOut
      let USD = (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async (stable)=>{ return(await pathExists$4({ blockchain, exchange, path: [tokenIn, stable] }) ? stable : undefined) }))).find(Boolean);
      path = [tokenIn, USD, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
    } else if (
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      await pathExists$4({ blockchain, exchange, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address] }) &&
      !Blockchains__default['default'][blockchain].stables.usd.includes(tokenOut) &&
      (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map((stable)=>pathExists$4({ blockchain, exchange, path: [stable, tokenOut] })))).filter(Boolean).length
    ) {
      // path via tokenIn -> WRAPPED -> USD -> tokenOut
      let USD = (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async (stable)=>{ return(await pathExists$4({ blockchain, exchange, path: [stable, tokenOut] }) ? stable : undefined) }))).find(Boolean);
      path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, USD, tokenOut];
    } else if (
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      tokenIn === Blockchains__default['default'][blockchain].currency.address &&
      !Blockchains__default['default'][blockchain].stables.usd.includes(tokenOut) &&
      (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map((stable)=>pathExists$4({ blockchain, exchange, path: [stable, tokenOut] })))).filter(Boolean).length
    ) {
      let USD = (await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async (stable)=>{ return(await pathExists$4({ blockchain, exchange, path: [stable, tokenOut] }) ? stable : undefined) }))).find(Boolean);
      path = [tokenIn, USD, tokenOut];
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$3([path, 'optionalAccess', _ => _.length]) && path[0] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    } else if(_optionalChain$3([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(path.length-1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    }

    return { path, exchangePath: getExchangePath$3({ blockchain, exchange, path }) }
  };

  let getAmountOut$3 = ({ blockchain, exchange, path, amountIn, tokenIn, tokenOut }) => {
    return new Promise((resolve) => {
      request({
        blockchain,
        address: exchange[blockchain].router.address,
        method: 'getAmountsOut',
        api: exchange[blockchain].router.api,
        params: {
          amountIn: amountIn,
          path: getExchangePath$3({ blockchain, exchange, path }),
        },
      })
      .then((amountsOut)=>{
        resolve(amountsOut[amountsOut.length - 1]);
      })
      .catch(()=>resolve());
    })
  };

  let getAmountIn$3 = ({ blockchain, exchange, path, amountOut, block }) => {
    return new Promise((resolve) => {
      request({
        blockchain,
        address: exchange[blockchain].router.address,
        method: 'getAmountsIn',
        api: exchange[blockchain].router.api,
        params: {
          amountOut: amountOut,
          path: getExchangePath$3({ blockchain, exchange, path }),
        },
        block
      })
      .then((amountsIn)=>resolve(amountsIn[0]))
      .catch(()=>resolve());
    })
  };

  let getAmounts$4 = async ({
    blockchain,
    exchange,
    path,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {
    if (amountOut) {
      amountIn = await getAmountIn$3({ blockchain, exchange, block, path, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut$3({ blockchain, exchange, path, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn$3({ blockchain, exchange, block, path, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut$3({ blockchain, exchange, path, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin }
  };

  let getPrep$3 = async({
    exchange,
    blockchain,
    tokenIn,
    amountIn,
    account
  })=> {

    if(tokenIn === Blockchains__default['default'][blockchain].currency.address) { return } // NATIVE

    const allowance = await request({
      blockchain,
      address: tokenIn,
      method: 'allowance',
      api: Token[blockchain]['20'],
      params: [account, exchange[blockchain].router.address]
    });

    if(allowance.gte(amountIn)) { return }

    let transaction = {
      blockchain,
      from: account,
      to: tokenIn,
      api: Token[blockchain]['20'],
      method: 'approve',
      params: [exchange[blockchain].router.address, amountIn.sub(allowance)]
    };
    
    return { transaction }

  };

  let getTransaction$4 = ({
    exchange,
    blockchain,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account
  }) => {

    let transaction = {
      blockchain,
      from: account,
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api,
    };

    if (path[0] === Blockchains__default['default'][blockchain].currency.address) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactETHForTokens';
        transaction.value = amountIn.toString();
        transaction.params = { amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapETHForExactTokens';
        transaction.value = amountInMax.toString();
        transaction.params = { amountOut: amountOut.toString() };
      }
    } else if (path[path.length - 1] === Blockchains__default['default'][blockchain].currency.address) {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactTokensForETH';
        transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapTokensForExactETH';
        transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
      }
    } else {
      if (amountInInput || amountOutMinInput) {
        transaction.method = 'swapExactTokensForTokens';
        transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() };
      } else if (amountOutInput || amountInMaxInput) {
        transaction.method = 'swapTokensForExactTokens';
        transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() };
      }
    }

    transaction.params = Object.assign({}, transaction.params, {
      path: getExchangePath$3({ blockchain, exchange, path }),
      to: account,
      deadline: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    });

    return transaction
  };

  const ROUTER$3 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY$3 = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
  const PAIR$1 = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

  var UniswapV2 = {
    findPath: findPath$4,
    pathExists: pathExists$4,
    getAmounts: getAmounts$4,
    getPrep: getPrep$3,
    getTransaction: getTransaction$4,
    ROUTER: ROUTER$3,
    FACTORY: FACTORY$3,
    PAIR: PAIR$1,
  };

  const exchange$f = {

    name: 'pancakeswap',
    label: 'PancakeSwap',
    logo:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk4IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OCAxOTkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTguNTUyIDE5OC42MDdDNjkuMDYxMyAxOTguNTg1IDQ1LjMwNiAxOTEuNTggMjguNzA3OSAxNzguOTk4QzExLjkxMDggMTY2LjI2NSAzIDE0OC4xOTUgMyAxMjcuNzQ4QzMgMTA4LjA0NyAxMS44OTEzIDkzLjg0MTEgMjEuOTUxNyA4NC4yMzg1QzI5LjgzNTkgNzYuNzEzMiAzOC41MzYzIDcxLjg5MzYgNDQuNTk0NSA2OS4xMjEzQzQzLjIyNDUgNjQuOTU5NCA0MS41MTUzIDU5LjUxMDggMzkuOTg2MSA1My44ODMyQzM3LjkzOTkgNDYuMzUyNyAzNS45MzI1IDM3LjUxNzQgMzUuOTMyNSAzMS4wNDI5QzM1LjkzMjUgMjMuMzc5NSAzNy42MjA0IDE1LjY4MzMgNDIuMTcxNCA5LjcwMzA2QzQ2Ljk3OTcgMy4zODQ3NiA1NC4yMTgyIDAgNjIuOTI2NCAwQzY5LjczMjIgMCA3NS41MTAzIDIuNDk5MDMgODAuMDMzOSA2LjgxMDExQzg0LjM1NzkgMTAuOTMwOSA4Ny4yMzU3IDE2LjQwMzQgODkuMjIyNyAyMi4xMDgyQzkyLjcxNDMgMzIuMTMyNSA5NC4wNzM4IDQ0LjcyNjQgOTQuNDU1MSA1Ny4yOTQ1SDEwMi43OTZDMTAzLjE3OCA0NC43MjY0IDEwNC41MzcgMzIuMTMyNSAxMDguMDI5IDIyLjEwODJDMTEwLjAxNiAxNi40MDM0IDExMi44OTQgMTAuOTMwOSAxMTcuMjE4IDYuODEwMTFDMTIxLjc0MSAyLjQ5OTAzIDEyNy41MTkgMCAxMzQuMzI1IDBDMTQzLjAzMyAwIDE1MC4yNzIgMy4zODQ3NiAxNTUuMDggOS43MDMwNkMxNTkuNjMxIDE1LjY4MzMgMTYxLjMxOSAyMy4zNzk1IDE2MS4zMTkgMzEuMDQyOUMxNjEuMzE5IDM3LjUxNzQgMTU5LjMxMiA0Ni4zNTI3IDE1Ny4yNjUgNTMuODgzMkMxNTUuNzM2IDU5LjUxMDggMTU0LjAyNyA2NC45NTk0IDE1Mi42NTcgNjkuMTIxM0MxNTguNzE1IDcxLjg5MzYgMTY3LjQxNiA3Ni43MTMyIDE3NS4zIDg0LjIzODVDMTg1LjM2IDkzLjg0MTEgMTk0LjI1MiAxMDguMDQ3IDE5NC4yNTIgMTI3Ljc0OEMxOTQuMjUyIDE0OC4xOTUgMTg1LjM0MSAxNjYuMjY1IDE2OC41NDQgMTc4Ljk5OEMxNTEuOTQ1IDE5MS41OCAxMjguMTkgMTk4LjU4NSA5OC42OTk2IDE5OC42MDdIOTguNTUyWiIgZmlsbD0iIzYzMzAwMSIvPgo8cGF0aCBkPSJNNjIuOTI2MiA3LjI4ODMzQzUwLjE3MTYgNy4yODgzMyA0NC4zMDA0IDE2LjgwMzcgNDQuMzAwNCAyOS45NjMyQzQ0LjMwMDQgNDAuNDIzMSA1MS4xMjIyIDYxLjM3MTUgNTMuOTIxMiA2OS41MjYzQzU0LjU1MDggNzEuMzYwNSA1My41NjE2IDczLjM3MDEgNTEuNzU3NCA3NC4wODE0QzQxLjUzNTEgNzguMTEyMSAxMS4zNjc5IDkyLjg3IDExLjM2NzkgMTI2LjY2OUMxMS4zNjc5IDE2Mi4yNzIgNDIuMDI0NiAxODkuMTE3IDk4LjU1ODEgMTg5LjE2Qzk4LjU4MDYgMTg5LjE2IDk4LjYwMzEgMTg5LjE1OSA5OC42MjU2IDE4OS4xNTlDOTguNjQ4MSAxODkuMTU5IDk4LjY3MDYgMTg5LjE2IDk4LjY5MzEgMTg5LjE2QzE1NS4yMjcgMTg5LjExNyAxODUuODgzIDE2Mi4yNzIgMTg1Ljg4MyAxMjYuNjY5QzE4NS44ODMgOTIuODcgMTU1LjcxNiA3OC4xMTIxIDE0NS40OTQgNzQuMDgxNEMxNDMuNjkgNzMuMzcwMSAxNDIuNyA3MS4zNjA1IDE0My4zMyA2OS41MjYzQzE0Ni4xMjkgNjEuMzcxNSAxNTIuOTUxIDQwLjQyMzEgMTUyLjk1MSAyOS45NjMyQzE1Mi45NTEgMTYuODAzNyAxNDcuMDggNy4yODgzMyAxMzQuMzI1IDcuMjg4MzNDMTE1Ljk2NSA3LjI4ODMzIDExMS4zODkgMzMuMjk1NSAxMTEuMDYyIDYxLjIwNzVDMTExLjA0IDYzLjA3MDkgMTA5LjUzNCA2NC41ODI4IDEwNy42NyA2NC41ODI4SDg5LjU4MDdDODcuNzE3MiA2NC41ODI4IDg2LjIxMDggNjMuMDcwOSA4Ni4xODkgNjEuMjA3NUM4NS44NjI2IDMzLjI5NTUgODEuMjg2IDcuMjg4MzMgNjIuOTI2MiA3LjI4ODMzWiIgZmlsbD0iI0QxODg0RiIvPgo8cGF0aCBkPSJNOTguNjkzMSAxNzcuNzU1QzU3LjE1NTEgMTc3Ljc1NSAxMS40Mzk3IDE1NS41MiAxMS4zNjgxIDEyNi43MzdDMTEuMzY4IDEyNi43ODEgMTEuMzY3OSAxMjYuODI2IDExLjM2NzkgMTI2Ljg3MUMxMS4zNjc5IDE2Mi41MDMgNDIuMDczNCAxODkuMzYyIDk4LjY5MzEgMTg5LjM2MkMxNTUuMzEzIDE4OS4zNjIgMTg2LjAxOCAxNjIuNTAzIDE4Ni4wMTggMTI2Ljg3MUMxODYuMDE4IDEyNi44MjYgMTg2LjAxOCAxMjYuNzgxIDE4Ni4wMTggMTI2LjczN0MxODUuOTQ2IDE1NS41MiAxNDAuMjMxIDE3Ny43NTUgOTguNjkzMSAxNzcuNzU1WiIgZmlsbD0iI0ZFREM5MCIvPgo8cGF0aCBkPSJNNzUuNjEzNSAxMTcuODk2Qzc1LjYxMzUgMTI3LjYxNCA3MS4wMjEgMTMyLjY3NSA2NS4zNTU4IDEzMi42NzVDNTkuNjkwNyAxMzIuNjc1IDU1LjA5ODEgMTI3LjYxNCA1NS4wOTgxIDExNy44OTZDNTUuMDk4MSAxMDguMTc4IDU5LjY5MDcgMTAzLjExNyA2NS4zNTU4IDEwMy4xMTdDNzEuMDIxIDEwMy4xMTcgNzUuNjEzNSAxMDguMTc4IDc1LjYxMzUgMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPHBhdGggZD0iTTE0Mi4yODggMTE3Ljg5NkMxNDIuMjg4IDEyNy42MTQgMTM3LjY5NiAxMzIuNjc1IDEzMi4wMzEgMTMyLjY3NUMxMjYuMzY1IDEzMi42NzUgMTIxLjc3MyAxMjcuNjE0IDEyMS43NzMgMTE3Ljg5NkMxMjEuNzczIDEwOC4xNzggMTI2LjM2NSAxMDMuMTE3IDEzMi4wMzEgMTAzLjExN0MxMzcuNjk2IDEwMy4xMTcgMTQyLjI4OCAxMDguMTc4IDE0Mi4yODggMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPC9zdmc+Cg==',
    protocol: 'uniswap_v2',
    
    slippage: true,
    
    blockchains: ['bsc'],

    bsc: {
      router: {
        address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        api: UniswapV2.ROUTER
      },
      factory: {
        address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        api: UniswapV2.FACTORY
      },
      pair: {
        api: UniswapV2.PAIR
      },

    }

  };

  var pancakeswap = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$f, {
        scope,
        findPath: (args)=>UniswapV2.findPath({ ...args, exchange: exchange$f }),
        pathExists: (args)=>UniswapV2.pathExists({ ...args, exchange: exchange$f }),
        getAmounts: (args)=>UniswapV2.getAmounts({ ...args, exchange: exchange$f }),
        getPrep: (args)=>UniswapV2.getPrep({ ...args, exchange: exchange$f }),
        getTransaction: (args)=>UniswapV2.getTransaction({ ...args, exchange: exchange$f }),
      })
    )
  };

  function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const getExchangePath$2 = ({ blockchain, exchange, path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === Blockchains__default['default'][blockchain].currency.address && path[index+1] != Blockchains__default['default'][blockchain].wrapped.address &&
        path[index-1] != Blockchains__default['default'][blockchain].wrapped.address
      ) {
        return Blockchains__default['default'][blockchain].wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == Blockchains__default['default'][blockchain].currency.address && exchangePath[1] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == Blockchains__default['default'][blockchain].currency.address && exchangePath[exchangePath.length-2] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  const getInputAmount$1 = async ({ exchange, pool, outputAmount })=>{

    const data = await request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactOutput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[1], pool.fee, pool.path[0]]),
        amountOut: outputAmount
      },
      cache: 5000 // 5 seconds in ms
    });

    return data.amountIn
  };

  const getOutputAmount$1 = async ({ exchange, pool, inputAmount })=>{

    const data = await request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactInput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[0], pool.fee, pool.path[1]]),
        amountIn: inputAmount
      },
      cache: 5000 // 5 seconds in ms
    });

    return data.amountOut
  };

  const getBestPool$2 = async ({ blockchain, exchange, path, amountIn, amountOut, block }) => {
    path = getExchangePath$2({ blockchain, exchange, path });
    if(path.length > 2) { throw('PancakeSwap V3 can only check paths for up to 2 tokens!') }

    try {

      let pools = (await Promise.all(exchange.fees.map((fee)=>{
        return request({
          blockchain: Blockchains__default['default'][blockchain].name,
          address: exchange[blockchain].factory.address,
          method: 'getPool',
          api: exchange[blockchain].factory.api,
          cache: 3600000, // 1 hour in ms
          params: [path[0], path[1], fee],
        }).then((address)=>{
          return {
            blockchain,
            address,
            path,
            fee,
            token0: [...path].sort()[0],
            token1: [...path].sort()[1],
          }
        }).catch(()=>{})
      }))).filter(Boolean);
      
      pools = pools.filter((pool)=>pool.address != Blockchains__default['default'][blockchain].zero);

      pools = (await Promise.all(pools.map(async(pool)=>{

        try {

          let amount;
          if(amountIn) {
            amount = await getOutputAmount$1({ exchange, pool, inputAmount: amountIn });
          } else {
            amount = await getInputAmount$1({ exchange, pool, outputAmount: amountOut });
          }

          return { ...pool, amountIn: amountIn || amount, amountOut: amountOut || amount }
        } catch (e) {}

      }))).filter(Boolean);
      
      if(amountIn) {
        // highest amountOut is best pool
        return pools.sort((a,b)=>(b.amountOut.gt(a.amountOut) ? 1 : -1))[0]
      } else {
        // lowest amountIn is best pool
        return pools.sort((a,b)=>(b.amountIn.lt(a.amountIn) ? 1 : -1))[0]
      }

    } catch (e2) { return }
  };

  const pathExists$3 = async ({ blockchain, exchange, path, amountIn, amountOut, amountInMax, amountOutMin }) => {
    try {
      return !!(await getBestPool$2({ blockchain, exchange, path, amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) }))
    } catch (e3) { return false }
  };

  const findPath$3 = async ({ blockchain, exchange, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
    if(
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) &&
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path;
    let pools = [];

    // DIRECT PATH
    pools = [
      await getBestPool$2({ exchange, blockchain, path: [tokenIn, tokenOut], amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) })
    ];
    if (pools.filter(Boolean).length) {
      path = [tokenIn, tokenOut];
    }

    // PATH VIA WRAPPED
    if(
      !path &&
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address
    ) {
      pools = [];
      if(amountOut || amountOutMin){
        pools.push(await getBestPool$2({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountOut: (amountOut || amountOutMin) }));
        if(pools.filter(Boolean).length) {
          pools.unshift(await getBestPool$2({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountOut: pools[0].amountIn }));
        }
      } else { // amountIn
        pools.push(await getBestPool$2({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountIn: (amountIn || amountInMax) }));
        if(pools.filter(Boolean).length) {
          pools.push(await getBestPool$2({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountIn: pools[0].amountOut }));
        }
      }
      if (pools.filter(Boolean).length === 2) {
        // path via WRAPPED
        path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
      }
    }

    // PATH VIA USD STABLE
    if(
      !path
    ) {
      pools = [];
      let allPoolsForAllUSD = await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async(stable)=>{
        let pools = [];
        if(amountOut || amountOutMin){
          pools.push(await getBestPool$2({ exchange, blockchain, path: [stable, tokenOut], amountOut: (amountOut || amountOutMin) }));
          if(pools.filter(Boolean).length) {
            pools.unshift(await getBestPool$2({ exchange, blockchain, path: [tokenIn, stable], amountOut: pools[0].amountIn }));
          }
        } else { // amountIn
          pools.push(await getBestPool$2({ exchange, blockchain, path: [tokenIn, stable], amountIn: (amountIn || amountInMax) }));
          if(pools.filter(Boolean).length) {
            pools.push(await getBestPool$2({ exchange, blockchain, path: [stable, tokenOut], amountIn: pools[0].amountOut }));
          }
        }
        if(pools.filter(Boolean).length === 2) {
          return [stable, pools]
        }
      }));

      let usdPath = allPoolsForAllUSD.filter(Boolean)[0];
      if(usdPath) {
        path = [tokenIn, usdPath[0], tokenOut];
        pools = usdPath[1];
      }
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$2([path, 'optionalAccess', _ => _.length]) && path[0] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    } else if(_optionalChain$2([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(path.length-1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    }

    if(!path) { pools = []; }
    return { path, pools, exchangePath: getExchangePath$2({ blockchain, exchange, path }) }
  };

  let getAmountOut$2 = ({ blockchain, exchange, path, pools, amountIn }) => {
    return pools[pools.length-1].amountOut
  };

  let getAmountIn$2 = async ({ blockchain, exchange, path, pools, amountOut, block }) => {
    if(block === undefined) {
      return pools[0].amountIn
    } else {
      
      let path;
      if(pools.length == 2) {
        path = ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"],[
          pools[1].path[1], pools[1].fee, pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      } else if(pools.length == 1) { 
        path = ethers.ethers.utils.solidityPack(["address","uint24","address"],[
          pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      }

      const data = await request({
        block,
        blockchain,
        address: exchange[blockchain].quoter.address,
        api: exchange[blockchain].quoter.api,
        method: 'quoteExactOutput',
        params: { path, amountOut },
      });

      return data.amountIn
    }
  };

  let getAmounts$3 = async ({
    blockchain,
    exchange,
    path,
    pools,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {
    if (amountOut) {
      amountIn = await getAmountIn$2({ blockchain, exchange, block, path, pools, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut$2({ blockchain, exchange, path, pools, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn$2({ blockchain, exchange, block, path, pools, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut$2({ blockchain, exchange, path, pools, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin, pools }
  };

  let getPrep$2 = async({
    exchange,
    blockchain,
    tokenIn,
    amountIn,
    account,
    tokenOut,
  })=> {

    if(tokenIn === Blockchains__default['default'][blockchain].currency.address) { return } // NATIVE

    let routerAddress;
    if(tokenOut === Blockchains__default['default'][blockchain].currency.address) {
      // unwrapping WBNB requires smart router
      routerAddress = exchange[blockchain].smartRouter.address;
    } else {
      // approve simpleRouter
      routerAddress = exchange[blockchain].router.address;
    }

    const allowanceForRouter = await request({
      blockchain,
      address: tokenIn,
      method: 'allowance',
      api: Token[blockchain]['20'],
      params: [account, routerAddress]
    });

    if(allowanceForRouter.lt(amountIn)) {

      let transaction = {
        blockchain,
        from: account,
        to: tokenIn,
        api: Token[blockchain]['20'],
        method: 'approve',
        params: [routerAddress, Blockchains__default['default'][blockchain].maxInt]
      };
      
      return { transaction }
    }
  };

  let getTransaction$3 = async({
    blockchain,
    exchange,
    pools,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account,
    inputTokenPushed,
  }) => {

    const transaction = {
      blockchain,
      from: account,
    };
    const deadline = Math.floor(Date.now() / 1000) + 21600; // 6 hours
    const exchangePath = getExchangePath$2({ blockchain, exchange, path });

    if(path[path.length-1] === Blockchains__default['default'][blockchain].currency.address) {
      // unwraping WBNB to BNB after swap requires smart router

      transaction.to = exchange[blockchain].smartRouter.address;
      transaction.api = exchange[blockchain].smartRouter.api;
      transaction.method = 'multicall';

      // multicall calls itself
      const routerInterface = new ethers.ethers.utils.Interface(exchange[blockchain].smartRouter.api);
      transaction.params = { data: [] };

      if (exchangePath.length === 2) { // single swap

        if (amountInInput || amountOutMinInput) {
          transaction.params.data.push(
            routerInterface.encodeFunctionData('exactInputSingle', [{
              tokenIn: exchangePath[0],
              tokenOut: exchangePath[1],
              fee: pools[0].fee,
              recipient: exchange[blockchain].smartRouter.address, // router must convert WRAPPED->NATIVE
              deadline,
              amountIn: (amountInMax || amountIn).toString(),
              amountOutMinimum: (amountOutMin || amountOut).toString(),
              sqrtPriceLimitX96: Blockchains__default['default'][blockchain].zero
            }])
          );
        } else if (amountOutInput || amountInMaxInput) {
          transaction.params.data.push(
            routerInterface.encodeFunctionData('exactOutputSingle', [{
              tokenIn: exchangePath[0],
              tokenOut: exchangePath[1],
              fee: pools[0].fee,
              recipient: exchange[blockchain].smartRouter.address, // router must convert WRAPPED->NATIVE
              deadline,
              amountInMaximum: (amountInMax || amountIn).toString(),
              amountOut: (amountOutMin || amountOut).toString(),
              sqrtPriceLimitX96: Blockchains__default['default'][blockchain].zero
            }])
          );
        }
      } else { // multi swap

        const packedPath = ethers.ethers.utils.solidityPack(
          ["address","uint24","address","uint24","address"],
          [pools[0].path[0], pools[0].fee, pools[0].path[1], pools[1].fee, pools[1].path[1]]
        );

        if (amountInInput || amountOutMinInput) {
          transaction.params.data.push(
            routerInterface.encodeFunctionData('exactInput', [{
              path: packedPath,
              recipient: exchange[blockchain].smartRouter.address, // router must convert WRAPPED->NATIVE
              deadline,
              amountIn: (amountInMax || amountIn).toString(),
              amountOutMinimum: (amountOutMin || amountOut).toString(),
            }])
          );
        } else if (amountOutInput || amountInMaxInput) {
          transaction.params.data.push(
            routerInterface.encodeFunctionData('exactOutput', [{
              path: packedPath,
              recipient: exchange[blockchain].smartRouter.address, // router must convert WRAPPED->NATIVE
              deadline,
              amountInMaximum: (amountInMax || amountIn).toString(),
              amountOut: (amountOutMin || amountOut).toString(),
            }])
          );
        }
      }

      // unwrap WRAPPED to NATIVE
      transaction.params.data.push(
        routerInterface.encodeFunctionData('unwrapWETH9', [
          (amountOutMin || amountOut).toString(),
          account,
        ])
      );

    } else {
      // use simple router (for every swap not resulting in NATIVE)

      transaction.to = exchange[blockchain].router.address;
      transaction.api = exchange[blockchain].router.api;

      if(path[0] === Blockchains__default['default'][blockchain].currency.address) {
        transaction.value = (amountIn || amountInMax).toString();
      }

      if (exchangePath.length === 2) { // single swap
        if (amountInInput || amountOutMinInput) {
          transaction.method = 'exactInputSingle';
          transaction.params = {
            params: {
              tokenIn: exchangePath[0],
              tokenOut: exchangePath[1],
              fee: pools[0].fee,
              recipient: account,
              deadline,
              amountIn: (amountInMax || amountIn).toString(),
              amountOutMinimum: (amountOutMin || amountOut).toString(),
              sqrtPriceLimitX96: Blockchains__default['default'][blockchain].zero
            }
          };
        } else if (amountOutInput || amountInMaxInput) {
          transaction.method = 'exactOutputSingle';
          transaction.params = {
            params: {
              tokenIn: exchangePath[0],
              tokenOut: exchangePath[1],
              fee: pools[0].fee,
              recipient: account,
              deadline,
              amountInMaximum: (amountInMax || amountIn).toString(),
              amountOut: (amountOutMin || amountOut).toString(),
              sqrtPriceLimitX96: Blockchains__default['default'][blockchain].zero
            }
          };
        }
      } else { // multi swap

        const packedPath = ethers.ethers.utils.solidityPack(
          ["address","uint24","address","uint24","address"],
          [pools[0].path[0], pools[0].fee, pools[0].path[1], pools[1].fee, pools[1].path[1]]
        );

        if (amountInInput || amountOutMinInput) {
          transaction.method = 'exactInput';
          transaction.params = {
            params: {
              path: packedPath,
              recipient: account,
              deadline,
              amountIn: (amountInMax || amountIn).toString(),
              amountOutMinimum: (amountOutMin || amountOut).toString(),
            }
          };
        } else if (amountOutInput || amountInMaxInput) {
          transaction.method = 'exactOutput';
          transaction.params = {
            params: {
              path: packedPath,
              recipient: account,
              deadline,
              amountInMaximum: (amountInMax || amountIn).toString(),
              amountOut: (amountOutMin || amountOut).toString(),
            }
          };
        }
      }
    }

    return transaction
  };

  const ROUTER$2 = [{"inputs":[{"internalType":"address","name":"_deployer","type":"address"},{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactOutputParams","name":"params","type":"tuple"}],"name":"exactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactOutputSingleParams","name":"params","type":"tuple"}],"name":"exactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"pancakeV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"refundETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowed","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowedIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const SMART_ROUTER = [{"inputs":[{"internalType":"address","name":"_factoryV2","type":"address"},{"internalType":"address","name":"_deployer","type":"address"},{"internalType":"address","name":"_factoryV3","type":"address"},{"internalType":"address","name":"_positionManager","type":"address"},{"internalType":"address","name":"_stableFactory","type":"address"},{"internalType":"address","name":"_stableInfo","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"factory","type":"address"},{"indexed":true,"internalType":"address","name":"info","type":"address"}],"name":"SetStableSwap","type":"event"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveMax","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveMaxMinusOne","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveZeroThenMax","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveZeroThenMaxMinusOne","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"data","type":"bytes"}],"name":"callPositionManager","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"paths","type":"bytes[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint24","name":"maximumTickDivergence","type":"uint24"},{"internalType":"uint32","name":"secondsAgo","type":"uint32"}],"name":"checkOracleSlippage","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint24","name":"maximumTickDivergence","type":"uint24"},{"internalType":"uint32","name":"secondsAgo","type":"uint32"}],"name":"checkOracleSlippage","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct IV3SwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IV3SwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"flag","type":"uint256[]"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"exactInputStableSwap","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"}],"internalType":"struct IV3SwapRouter.ExactOutputParams","name":"params","type":"tuple"}],"name":"exactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IV3SwapRouter.ExactOutputSingleParams","name":"params","type":"tuple"}],"name":"exactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"flag","type":"uint256[]"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"exactOutputStableSwap","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factoryV2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"getApprovalType","outputs":[{"internalType":"enum IApproveAndCall.ApprovalType","name":"","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"amount0Min","type":"uint256"},{"internalType":"uint256","name":"amount1Min","type":"uint256"}],"internalType":"struct IApproveAndCall.IncreaseLiquidityParams","name":"params","type":"tuple"}],"name":"increaseLiquidity","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint256","name":"amount0Min","type":"uint256"},{"internalType":"uint256","name":"amount1Min","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"internalType":"struct IApproveAndCall.MintParams","name":"params","type":"tuple"}],"name":"mint","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"previousBlockhash","type":"bytes32"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"pancakeV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"positionManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"pull","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"refundETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowed","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowedIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_info","type":"address"}],"name":"setStableSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stableSwapFactory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stableSwapInfo","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"wrapETH","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY$2 = [{"inputs":[{"internalType":"address","name":"_poolDeployer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"bool","name":"whitelistRequested","type":"bool"},{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"}],"name":"FeeAmountExtraInfoUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"lmPoolDeployer","type":"address"}],"name":"SetLmPoolDeployer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"bool","name":"verified","type":"bool"}],"name":"WhiteListAdded","type":"event"},{"inputs":[{"internalType":"address","name":"pool","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collectProtocol","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacingExtraInfo","outputs":[{"internalType":"bool","name":"whitelistRequested","type":"bool"},{"internalType":"bool","name":"enabled","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lmPoolDeployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolDeployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"bool","name":"whitelistRequested","type":"bool"},{"internalType":"bool","name":"enabled","type":"bool"}],"name":"setFeeAmountExtraInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"pool","type":"address"},{"internalType":"uint32","name":"feeProtocol0","type":"uint32"},{"internalType":"uint32","name":"feeProtocol1","type":"uint32"}],"name":"setFeeProtocol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"pool","type":"address"},{"internalType":"address","name":"lmPool","type":"address"}],"name":"setLmPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_lmPoolDeployer","type":"address"}],"name":"setLmPoolDeployer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"bool","name":"verified","type":"bool"}],"name":"setWhiteListAddress","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  const POOL$1 = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"Collect","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"CollectProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid1","type":"uint256"}],"name":"Flash","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextOld","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextNew","type":"uint16"}],"name":"IncreaseObservationCardinalityNext","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Initialize","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"feeProtocol0Old","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"feeProtocol1Old","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"feeProtocol0New","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"feeProtocol1New","type":"uint32"}],"name":"SetFeeProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"}],"name":"SetLmPoolEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"int256","name":"amount0","type":"int256"},{"indexed":false,"internalType":"int256","name":"amount1","type":"int256"},{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"uint128","name":"liquidity","type":"uint128"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"},{"indexed":false,"internalType":"uint128","name":"protocolFeesToken0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"protocolFeesToken1","type":"uint128"}],"name":"Swap","type":"event"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collect","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collectProtocol","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal0X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal1X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"flash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"}],"name":"increaseObservationCardinalityNext","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"liquidity","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lmPool","outputs":[{"internalType":"contract IPancakeV3LmPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxLiquidityPerTick","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"observations","outputs":[{"internalType":"uint32","name":"blockTimestamp","type":"uint32"},{"internalType":"int56","name":"tickCumulative","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityCumulativeX128","type":"uint160"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32[]","name":"secondsAgos","type":"uint32[]"}],"name":"observe","outputs":[{"internalType":"int56[]","name":"tickCumulatives","type":"int56[]"},{"internalType":"uint160[]","name":"secondsPerLiquidityCumulativeX128s","type":"uint160[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"positions","outputs":[{"internalType":"uint128","name":"liquidity","type":"uint128"},{"internalType":"uint256","name":"feeGrowthInside0LastX128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthInside1LastX128","type":"uint256"},{"internalType":"uint128","name":"tokensOwed0","type":"uint128"},{"internalType":"uint128","name":"tokensOwed1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"protocolFees","outputs":[{"internalType":"uint128","name":"token0","type":"uint128"},{"internalType":"uint128","name":"token1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"feeProtocol0","type":"uint32"},{"internalType":"uint32","name":"feeProtocol1","type":"uint32"}],"name":"setFeeProtocol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_lmPool","type":"address"}],"name":"setLmPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"slot0","outputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"internalType":"int24","name":"tick","type":"int24"},{"internalType":"uint16","name":"observationIndex","type":"uint16"},{"internalType":"uint16","name":"observationCardinality","type":"uint16"},{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"},{"internalType":"uint32","name":"feeProtocol","type":"uint32"},{"internalType":"bool","name":"unlocked","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"}],"name":"snapshotCumulativesInside","outputs":[{"internalType":"int56","name":"tickCumulativeInside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityInsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsInside","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"bool","name":"zeroForOne","type":"bool"},{"internalType":"int256","name":"amountSpecified","type":"int256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[{"internalType":"int256","name":"amount0","type":"int256"},{"internalType":"int256","name":"amount1","type":"int256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int16","name":"","type":"int16"}],"name":"tickBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"","type":"int24"}],"name":"ticks","outputs":[{"internalType":"uint128","name":"liquidityGross","type":"uint128"},{"internalType":"int128","name":"liquidityNet","type":"int128"},{"internalType":"uint256","name":"feeGrowthOutside0X128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthOutside1X128","type":"uint256"},{"internalType":"int56","name":"tickCumulativeOutside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityOutsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsOutside","type":"uint32"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
  const QUOTER$2 = [{"inputs":[{"internalType":"address","name":"_deployer","type":"address"},{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"path","type":"bytes"}],"name":"pancakeV3SwapCallback","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"name":"quoteExactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactInputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"quoteExactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactOutputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}];

  var PancakeSwapV3 = {
    findPath: findPath$3,
    pathExists: pathExists$3,
    getAmounts: getAmounts$3,
    getPrep: getPrep$2,
    getTransaction: getTransaction$3,
    ROUTER: ROUTER$2,
    SMART_ROUTER,
    FACTORY: FACTORY$2,
    POOL: POOL$1,
    QUOTER: QUOTER$2,
  };

  const exchange$e = {

    name: 'pancakeswap_v3',
    label: 'PancakeSwap v3',
    logo:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk4IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OCAxOTkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTguNTUyIDE5OC42MDdDNjkuMDYxMyAxOTguNTg1IDQ1LjMwNiAxOTEuNTggMjguNzA3OSAxNzguOTk4QzExLjkxMDggMTY2LjI2NSAzIDE0OC4xOTUgMyAxMjcuNzQ4QzMgMTA4LjA0NyAxMS44OTEzIDkzLjg0MTEgMjEuOTUxNyA4NC4yMzg1QzI5LjgzNTkgNzYuNzEzMiAzOC41MzYzIDcxLjg5MzYgNDQuNTk0NSA2OS4xMjEzQzQzLjIyNDUgNjQuOTU5NCA0MS41MTUzIDU5LjUxMDggMzkuOTg2MSA1My44ODMyQzM3LjkzOTkgNDYuMzUyNyAzNS45MzI1IDM3LjUxNzQgMzUuOTMyNSAzMS4wNDI5QzM1LjkzMjUgMjMuMzc5NSAzNy42MjA0IDE1LjY4MzMgNDIuMTcxNCA5LjcwMzA2QzQ2Ljk3OTcgMy4zODQ3NiA1NC4yMTgyIDAgNjIuOTI2NCAwQzY5LjczMjIgMCA3NS41MTAzIDIuNDk5MDMgODAuMDMzOSA2LjgxMDExQzg0LjM1NzkgMTAuOTMwOSA4Ny4yMzU3IDE2LjQwMzQgODkuMjIyNyAyMi4xMDgyQzkyLjcxNDMgMzIuMTMyNSA5NC4wNzM4IDQ0LjcyNjQgOTQuNDU1MSA1Ny4yOTQ1SDEwMi43OTZDMTAzLjE3OCA0NC43MjY0IDEwNC41MzcgMzIuMTMyNSAxMDguMDI5IDIyLjEwODJDMTEwLjAxNiAxNi40MDM0IDExMi44OTQgMTAuOTMwOSAxMTcuMjE4IDYuODEwMTFDMTIxLjc0MSAyLjQ5OTAzIDEyNy41MTkgMCAxMzQuMzI1IDBDMTQzLjAzMyAwIDE1MC4yNzIgMy4zODQ3NiAxNTUuMDggOS43MDMwNkMxNTkuNjMxIDE1LjY4MzMgMTYxLjMxOSAyMy4zNzk1IDE2MS4zMTkgMzEuMDQyOUMxNjEuMzE5IDM3LjUxNzQgMTU5LjMxMiA0Ni4zNTI3IDE1Ny4yNjUgNTMuODgzMkMxNTUuNzM2IDU5LjUxMDggMTU0LjAyNyA2NC45NTk0IDE1Mi42NTcgNjkuMTIxM0MxNTguNzE1IDcxLjg5MzYgMTY3LjQxNiA3Ni43MTMyIDE3NS4zIDg0LjIzODVDMTg1LjM2IDkzLjg0MTEgMTk0LjI1MiAxMDguMDQ3IDE5NC4yNTIgMTI3Ljc0OEMxOTQuMjUyIDE0OC4xOTUgMTg1LjM0MSAxNjYuMjY1IDE2OC41NDQgMTc4Ljk5OEMxNTEuOTQ1IDE5MS41OCAxMjguMTkgMTk4LjU4NSA5OC42OTk2IDE5OC42MDdIOTguNTUyWiIgZmlsbD0iIzYzMzAwMSIvPgo8cGF0aCBkPSJNNjIuOTI2MiA3LjI4ODMzQzUwLjE3MTYgNy4yODgzMyA0NC4zMDA0IDE2LjgwMzcgNDQuMzAwNCAyOS45NjMyQzQ0LjMwMDQgNDAuNDIzMSA1MS4xMjIyIDYxLjM3MTUgNTMuOTIxMiA2OS41MjYzQzU0LjU1MDggNzEuMzYwNSA1My41NjE2IDczLjM3MDEgNTEuNzU3NCA3NC4wODE0QzQxLjUzNTEgNzguMTEyMSAxMS4zNjc5IDkyLjg3IDExLjM2NzkgMTI2LjY2OUMxMS4zNjc5IDE2Mi4yNzIgNDIuMDI0NiAxODkuMTE3IDk4LjU1ODEgMTg5LjE2Qzk4LjU4MDYgMTg5LjE2IDk4LjYwMzEgMTg5LjE1OSA5OC42MjU2IDE4OS4xNTlDOTguNjQ4MSAxODkuMTU5IDk4LjY3MDYgMTg5LjE2IDk4LjY5MzEgMTg5LjE2QzE1NS4yMjcgMTg5LjExNyAxODUuODgzIDE2Mi4yNzIgMTg1Ljg4MyAxMjYuNjY5QzE4NS44ODMgOTIuODcgMTU1LjcxNiA3OC4xMTIxIDE0NS40OTQgNzQuMDgxNEMxNDMuNjkgNzMuMzcwMSAxNDIuNyA3MS4zNjA1IDE0My4zMyA2OS41MjYzQzE0Ni4xMjkgNjEuMzcxNSAxNTIuOTUxIDQwLjQyMzEgMTUyLjk1MSAyOS45NjMyQzE1Mi45NTEgMTYuODAzNyAxNDcuMDggNy4yODgzMyAxMzQuMzI1IDcuMjg4MzNDMTE1Ljk2NSA3LjI4ODMzIDExMS4zODkgMzMuMjk1NSAxMTEuMDYyIDYxLjIwNzVDMTExLjA0IDYzLjA3MDkgMTA5LjUzNCA2NC41ODI4IDEwNy42NyA2NC41ODI4SDg5LjU4MDdDODcuNzE3MiA2NC41ODI4IDg2LjIxMDggNjMuMDcwOSA4Ni4xODkgNjEuMjA3NUM4NS44NjI2IDMzLjI5NTUgODEuMjg2IDcuMjg4MzMgNjIuOTI2MiA3LjI4ODMzWiIgZmlsbD0iI0QxODg0RiIvPgo8cGF0aCBkPSJNOTguNjkzMSAxNzcuNzU1QzU3LjE1NTEgMTc3Ljc1NSAxMS40Mzk3IDE1NS41MiAxMS4zNjgxIDEyNi43MzdDMTEuMzY4IDEyNi43ODEgMTEuMzY3OSAxMjYuODI2IDExLjM2NzkgMTI2Ljg3MUMxMS4zNjc5IDE2Mi41MDMgNDIuMDczNCAxODkuMzYyIDk4LjY5MzEgMTg5LjM2MkMxNTUuMzEzIDE4OS4zNjIgMTg2LjAxOCAxNjIuNTAzIDE4Ni4wMTggMTI2Ljg3MUMxODYuMDE4IDEyNi44MjYgMTg2LjAxOCAxMjYuNzgxIDE4Ni4wMTggMTI2LjczN0MxODUuOTQ2IDE1NS41MiAxNDAuMjMxIDE3Ny43NTUgOTguNjkzMSAxNzcuNzU1WiIgZmlsbD0iI0ZFREM5MCIvPgo8cGF0aCBkPSJNNzUuNjEzNSAxMTcuODk2Qzc1LjYxMzUgMTI3LjYxNCA3MS4wMjEgMTMyLjY3NSA2NS4zNTU4IDEzMi42NzVDNTkuNjkwNyAxMzIuNjc1IDU1LjA5ODEgMTI3LjYxNCA1NS4wOTgxIDExNy44OTZDNTUuMDk4MSAxMDguMTc4IDU5LjY5MDcgMTAzLjExNyA2NS4zNTU4IDEwMy4xMTdDNzEuMDIxIDEwMy4xMTcgNzUuNjEzNSAxMDguMTc4IDc1LjYxMzUgMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPHBhdGggZD0iTTE0Mi4yODggMTE3Ljg5NkMxNDIuMjg4IDEyNy42MTQgMTM3LjY5NiAxMzIuNjc1IDEzMi4wMzEgMTMyLjY3NUMxMjYuMzY1IDEzMi42NzUgMTIxLjc3MyAxMjcuNjE0IDEyMS43NzMgMTE3Ljg5NkMxMjEuNzczIDEwOC4xNzggMTI2LjM2NSAxMDMuMTE3IDEzMi4wMzEgMTAzLjExN0MxMzcuNjk2IDEwMy4xMTcgMTQyLjI4OCAxMDguMTc4IDE0Mi4yODggMTE3Ljg5NloiIGZpbGw9IiM2MzMwMDEiLz4KPC9zdmc+Cg==',
    protocol: 'pancakeswap_v3',
    
    slippage: true,
    fees: [100, 500, 2500, 10000],
    
    blockchains: ['bsc'],
    
    bsc: {
      router: {
        address: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
        api: PancakeSwapV3.ROUTER
      },
      smartRouter: {
        address: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
        api: PancakeSwapV3.SMART_ROUTER
      },
      factory: {
        address: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        api: PancakeSwapV3.FACTORY
      },
      pair: {
        api: PancakeSwapV3.POOL
      },
      quoter: {
        address: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
        api: PancakeSwapV3.QUOTER
      }
    },

  };

  var pancakeswap_v3 = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$e, {
        scope,
        findPath: (args)=>PancakeSwapV3.findPath({ ...args, exchange: exchange$e }),
        pathExists: (args)=>PancakeSwapV3.pathExists({ ...args, exchange: exchange$e }),
        getAmounts: (args)=>PancakeSwapV3.getAmounts({ ...args, exchange: exchange$e }),
        getPrep: (args)=>PancakeSwapV3.getPrep({ ...args, exchange: exchange$e }),
        getTransaction: (args)=>PancakeSwapV3.getTransaction({ ...args, exchange: exchange$e }),
      })
    )
  };

  const exchange$d = {
    
    name: 'quickswap',
    label: 'QuickSwap',
    logo: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzAyLjQ1IDcwMi40NyI+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIj48cmVjdCB3aWR0aD0iNzUwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0ibm9uZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwLXBhdGgpIj48cGF0aCBkPSJNMzU0Ljc0LDI0LjM3YTM1MS4yNywzNTEuMjcsMCwwLDEsMzYzLjc0LDI3NywzNTQsMzU0LDAsMCwxLDEuMjMsMTQxLjI2QTM1MS43NiwzNTEuNzYsMCwwLDEsNTEwLjEyLDY5OS4zYy03My43NywzMS0xNTguMjUsMzUuMzUtMjM0LjkxLDEyLjU0QTM1MiwzNTIsMCwwLDEsNDYuNTEsNDk5LjU2Yy0yOC03My40NS0zMC4xNi0xNTYuMzgtNi4yNC0yMzEuMjVBMzUwLjg4LDM1MC44OCwwLDAsMSwzNTQuNzQsMjQuMzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE1OC44MSwzNDkuNThjMS4zOSw2LjQxLDIuMjMsMTIuOTIsMy42MSwxOS4zNS44NSwzLjkzLDIuMTMsMyw0LjE1LDEuMjgsMy44Ny0zLjI1LDcuNTktNi42OSwxMS45NC05LjMxLDEuMjMuMjQsMS44NiwxLjIyLDIuNTMsMi4xLDExLjM5LDE0Ljg3LDI2LjUzLDI0LDQ0LjM3LDI4Ljk0YTE0Ny4yMywxNDcuMjMsMCwwLDAsMjUuMTcsNC42Nyw0Mi42OCw0Mi42OCwwLDAsMS02LjYxLTkuOTVjLTIuODUtNi40MS0xLjg1LTEyLjE1LDIuOTUtMTcuMjIsNS44Ny02LjE5LDEzLjYyLTguNzYsMjEuNDgtMTAuOCwxNi40OC00LjMsMzMuMjctNC43Myw1MC4xOC0zLjUzQTIwMi4xMSwyMDIuMTEsMCwwLDEsMzU4Ljc1LDM2MmMxMSwzLjA2LDIxLjcyLDYuNzMsMzEuNDQsMTIuODgsMS4zNiwxLjA5LDIuMywyLjYsMy42MSwzLjc0LDEyLjQ5LDEzLjQxLDE5Ljc4LDI5LjI1LDIwLjI4LDQ3LjU1LjM0LDEyLjY1LTMuMTYsMjQuNzItOS41LDM1LjgyLTExLjQyLDIwLTI4LjA5LDM0LjU2LTQ4LDQ1LjcxQTE3MC41LDE3MC41LDAsMCwxLDI5MSw1MjguNDJjLTQxLjI0LDQuNDctNzkuNDUtNC40Ny0xMTQuNTktMjYuMzYtMjkuMjEtMTguMTktNTEuNjUtNDMuMDgtNzAtNzEuOTJhMzM5LjU3LDMzOS41NywwLDAsMS0yMi41Mi00Mi43NWMtLjgxLTEuOC0xLTMuODEtMS44Mi01LjI5LjUyLDEuNzUsMS40OSwzLjczLS40Myw1LjYtLjU4LTcuNDUuMDgtMTQuOS40Ny0yMi4zMWEyODcuMTMsMjg3LjEzLDAsMCwxLDkuNDgtNjAuNTRBMjkyLjkxLDI5Mi45MSwwLDAsMSwyNjYuMDYsMTA5LjA5LDI4Ny4yLDI4Ny4yLDAsMCwxLDM0Ni41OSw4OS45YzQzLjU3LTQsODUuNzksMS43MywxMjcsMTYuMzQtNi4yNywxMS44OS00Miw0My43Mi02OS44LDYyLjE1YTk0LjExLDk0LjExLDAsMCwwLTUuNDQtMjMuNTFjLS4xNC0yLDEuNjYtMi42NSwyLjc4LTMuNjFxOC42Ny03LjQ2LDE3LjQzLTE0Ljc3YTE3LjE0LDE3LjE0LDAsMCwwLDEuNjktMS40OWMuNjYtLjcxLDEuNzctMS4zLDEuNTQtMi40cy0xLjU1LTEuMTUtMi40Ny0xLjNhNDYuODIsNDYuODIsMCwwLDAtOC4xNy0xYy0zLjgxLS40NS03LjU2LTEuMy0xMS40LTEuMzgtMi45NS0uMTgtNS44NS0uOTMtOC44My0uNjlhMjguMjIsMjguMjIsMCwwLDEtNC41LS4zMmMtMi41LS43OS01LjA3LS40NC03LjYxLS40My0xLjUyLDAtMy0uMTEtNC41NiwwLTQuMzUuMjUtOC43My0uNDgtMTMuMDcuMzRhMTIuODcsMTIuODcsMCwwLDEtMy4yMS4zMmMtMS4yNiwwLTIuNTEuMDYtMy43NywwYTEyLjM1LDEyLjM1LDAsMCwwLTQuODcuNDdjLTQuNTkuNDEtOS4xOS43OC0xMy43MywxLjYxLTUuNDgsMS4xNi0xMS4wOSwxLjQ0LTE2LjUzLDIuNzktNSwxLjMtMTAuMTMsMi0xNSwzLjc0LTYuNTEsMS43OS0xMi45NSwzLjg0LTE5LjM1LDYtOS4zNCwzLjcxLTE4LjgyLDcuMS0yNy43MSwxMS44NmEyNDguNzQsMjQ4Ljc0LDAsMCwwLTU1LjY2LDM2Ljk0QTI2Ni41NSwyNjYuNTUsMCwwLDAsMTU5LjY4LDIyN2EyNTQuODcsMjU0Ljg3LDAsMCwwLTE2LjU0LDI2LjE2Yy0zLjE3LDUuOS02LjIyLDExLjg1LTksMTgtMiw0LjcxLTQuNDIsOS4yNy02LDE0LjE4LTIsNC45LTMuNjQsOS45Mi01LjIyLDE1LTEuODgsNS4wNi0zLDEwLjM1LTQuNDUsMTUuNTMtLjYzLDItMSw0LjExLTEuNTMsNi4xOC0uNjMsMi40OS0xLDUtMS40Nyw3LjU1LS43Nyw0LjI1LTEuNDgsOC41LTIuMDksMTIuNzhhMTE4LjY0LDExOC42NCwwLDAsMC0xLjU3LDEzLjI5Yy0uNzQsMi45NC0uMiw2LS43NCw5LS44MiwzLjY5LS4yOCw3LjQ1LS41MiwxMS4xNi0uMTEsMi42MS0uMTYsNS4yMy0uMDksNy44NSwwLDEuMDctLjQ5LDIuNTcuNjQsMy4wOSwxLjI5LjYsMi4yMy0uNzcsMy4xNi0xLjUzLDMuMTgtMi42LDYuMjktNS4yOSw5LjQtOCwxMC40Ny05LDIxLjA3LTE3Ljg4LDMxLjU4LTI2Ljg1LjkxLS43NywxLjktMi43OSwzLjUyLS43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNMzkwLjExLDM3NS43OGMtMTIuMzctNy4zNS0yNS44OS0xMS42My0zOS43Ny0xNC45MmExOTcuMjUsMTk3LjI1LDAsMCwwLTU1LjY4LTUuMWMtMTMuMjEuNjYtMjYuMzEsMi41LTM4LjQ4LDguM2EzMi42MSwzMi42MSwwLDAsMC00LjIxLDIuNDNjLTkuODUsNi42LTExLjM1LDE1LjQtNC4yMywyNC45MSwxLjQ4LDIsMy4xMiwzLjgxLDUuMSw2LjIyLTYuMzksMC0xMi4wNS0xLjE5LTE3LjY5LTIuMzEtMTUuMTItMy0yOS4zMi04LjI0LTQxLjUtMTgtNS44Ni00LjY4LTExLjIyLTkuOTMtMTUuMTQtMTYuNDUsMS42LTIuNjEsNC4yOC0zLjgzLDYuNzgtNS4yNyw0LjgyLTIsOS4xOS00LjkxLDE0LTcuMDlhMjA3LjU1LDIwNy41NSwwLDAsMSw2Ny40LTE4YzkuMzItLjg3LDE4LjY1LTEuNzYsMjgtMS40MUEzMTEuMzgsMzExLjM4LDAsMCwxLDM3NiwzNDMuMjVjNi44LDIuMTIsMTMuNTIsNC40NSwyMC41OSw2Ljg0LDAtMi0xLjE0LTMuMTktMS45LTQuNDhBOTYuMTgsOTYuMTgsMCwwLDAsMzg1LDMzMS44OGMtMS4zMy0xLjU2LTMuMTgtMi45My0zLjE0LTUuMzMsMy43My44NSw3LjQ2LDEuNjgsMTEuMTgsMi41NiwxLC4yMywyLjE3LjgzLDIuODEsMCwuODUtMS4wOC0uNDMtMi0xLTIuODQtNS40OS04LjE5LTEyLjMzLTE1LjE3LTE5LjY3LTIxLjY4LDMuODktMi4yNiw3Ljg5LS40MiwxMS42OC4wNiwzOC44Nyw1LDc0LjI5LDE4LjgxLDEwNS4xOCw0Myw0MC45LDMyLjA5LDY3LjMzLDczLjU0LDc4LjQ3LDEyNC41MUExODAuNTQsMTgwLjU0LDAsMCwxLDU3My44Nyw1MjRjLTIuMTksMzAuMTEtMTEuNjUsNTcuOS0yOS40NSw4Mi41OC0xLjE3LDEuNjItMi43NSwyLjkxLTMuNjEsNC43Ni00LDYtMTAsMTAuMDgtMTUuNDQsMTQuNTItMjkuNTUsMjQtNjQsMzYuNDYtMTAxLjE0LDQyLjI4YTMxMC4zNCwzMTAuMzQsMCwwLDEtODcuMzEsMS41NCwyODguMTcsMjg4LjE3LDAsMCwxLTEyNy4zOS00OC4xNGMtOS4yNy02LjI5LTE4LjM2LTEyLjg1LTI2LjUxLTIwLjYyYS42NS42NSwwLDAsMSwwLTFjMS43NC0uNjksMi44NC41Nyw0LDEuNDNhMTg5LjA4LDE4OS4wOCwwLDAsMCw2NSwzMS41NiwyMjguNDYsMjI4LjQ2LDAsMCwwLDIzLjg3LDQuNzVjMS44Mi42NiwzLjc1LjM1LDUuNjIuNjZhNy41NSw3LjU1LDAsMCwxLDEuMTMuMjNjMTguMjQsMi4xNiwzNi4zNy44OSw1NC4zNi0yLjI4LDM5LjU0LTcsNzQuNjYtMjMuNTUsMTA0Ljc1LTUwLjE1LDIwLjUtMTguMTIsMzYuNjgtMzkuNTMsNDUuMjQtNjUuOTVzNy4zNS01Mi4xLTQuNjctNzcuNDhjLTIuNDcsMTEuMzgtOC40NCwyMC44LTE1LjkxLDI5LjM4YTEwNi4wOSwxMDYuMDksMCwwLDEtMjYuMDcsMjEuMTljLTEuMTQuNjYtMi40LDEuOTEtMy43MS45LTEuMTMtLjg2LS40NS0yLjM3LS4xLTMuNTFhMTM5LjY0LDEzOS42NCwwLDAsMCw0Ljk0LTI0LjJjMy41LTM0LjUxLTkuODItNjEuMzctMzcuMy04MS43NGExMTkuOCwxMTkuOCwwLDAsMC0xNC4wNi05IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzI2MmY3MSIvPjxwYXRoIGQ9Ik0yNzYuMDgsNjM4LjQxYTE1MS4xNiwxNTEuMTYsMCwwLDEtMjkuODYtNi4xQTE5OC41MywxOTguNTMsMCwwLDEsMTk0LjM1LDYwOGMtMy44My0yLjUxLTcuMDctNS44Ni0xMS4yNC03Ljg5LTIuMzktLjM0LTMuMzktMi42OC01LjMtMy43LTQwLjM4LTM1LjktNjgtODAtODMuODMtMTMxLjQ4QTI4MC41NCwyODAuNTQsMCwwLDEsODEuNjMsMzg3LjdjLjEtMiwuMi0zLjkzLjM2LTcsMiw0LjM2LDMuNDgsNy44Miw1LjA1LDExLjI2LDE0LjUzLDMxLjg2LDMzLjEzLDYwLjkzLDU4Ljc0LDg1LjEyQzE3Myw1MDIuODIsMjA0LjY4LDUyMCwyNDIsNTI2YzQzLjcxLDcuMTEsODQuNjEtLjUxLDEyMi4yMi0yNC4wNiwxOC43NS0xMS43NSwzNC4xNC0yNi45NCw0My00Ny42NSwxMC43Mi0yNS4xMSw2LjY4LTQ4LjQ0LTkuNjUtNjkuOTUtMS40My0xLjg4LTIuOTUtMy42OS00LjQzLTUuNTQsMS45NC0xLjY2LDMsLjI2LDQuMDcsMS4xOGE4My4yMiw4My4yMiwwLDAsMSwyMi42LDI5LjksODgsODgsMCwwLDEsNy44NSwzNS4xOSw3OS43NSw3OS43NSwwLDAsMS04LDM1Ljg3LDUuMzksNS4zOSwwLDAsMCwzLjI0LTEuMTcsOTguMzQsOTguMzQsMCwwLDAsMTQuNjUtMTAuMzVjMS40Mi0xLjIzLDIuNjctMy4wOCw1LTIuOGExNjUuMywxNjUuMywwLDAsMS02LjA5LDI3Ljc1LDEzMS43NCwxMzEuNzQsMCwwLDAsMTcuMjctMTEuNDhjNC4zMy0zLjM4LDcuODMtNy42MiwxMi4wOC0xMS4wNiwxLjgxLjc3LDEuODEsMi41NiwyLjIzLDQuMDgsNi45MiwyNSwxLjkxLDQ4LjI4LTEwLjQyLDcwLjMtMTUsMjYuNy0zNyw0Ni41Ny02Mi42Miw2Mi42NWEyMTMuMzMsMjEzLjMzLDAsMCwxLTY3LjI3LDI3LjU1LDE0Mi4yLDE0Mi4yLDAsMCwxLTQ1LjY3LDIuNjloMGMtMS45LTEtNC4wNy4xOS02LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNNjU0LjE3LDQ1My4wN2EyMTIsMjEyLDAsMCwwLTIwLjc3LTgyLjM1QTIxOC45LDIxOC45LDAsMCwwLDYwMywzMjRjLTEwLjktMTIuOTEtMjMuNDItMjMuOTMtMzYuNTYtMzQuMzgsMS4yMy0xLjIxLDIuNzYtMSw0LjI0LS44YTIzNi4yOCwyMzYuMjgsMCwwLDEsNTMuNzksMTIuNzhBODAuMiw4MC4yLDAsMCwxLDYzNywzMDcuNDNhNDAuMzgsNDAuMzgsMCwwLDEsNC4xNiwyLjQ0Yy4zNC4xOS41My42OSwxLC41OGExLjI3LDEuMjcsMCwwLDEtLjIxLTEuMzdjLTExLjg0LTE1LjQyLTI2LjE1LTI4LjI4LTQxLjE3LTQwLjVhMzAyLDMwMiwwLDAsMC01OC4xOC0zNi45LDI4Ny42NCwyODcuNjQsMCwwLDAtOTEuNTctMjcuNDVjLTIuODMtLjM1LTUuNzUsMC04LjUxLTEtLjI0LTEuODksMS4zNS0yLjUyLDIuNDUtMy40NCwxOC42Ny0xNS41NSwzMy42OS0zNCw0NC4yOC01NS45NGExNTcuMSwxNTcuMSwwLDAsMCw4LjE0LTIwLjUzYy42NC0yLDEtNC4xNywzLTUuNDRhMjg4LjE2LDI4OC4xNiwwLDAsMSw4OC40Nyw2NiwyOTIuMSwyOTIuMSwwLDAsMSw2Ni42NCwyNzBjLS44NC40Ni0xLS4yNi0xLjM0LS43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0MTg5YzkiLz48cGF0aCBkPSJNNTQwLjgxLDYxMS4zN2MwLTIuOTQsMi4zNC00LjYsMy43OS02LjY2LDEzLjY2LTE5LjUxLDIyLTQxLjEyLDI2LjMxLTY0LjQ4LDIuNjctMTQuNDcsMi45LTI5LjA4LDItNDMuNTctMS40Ny0yMi4zNC03LjE4LTQzLjgzLTE2LjE5LTY0LjQyYTIxMi4yNSwyMTIuMjUsMCwwLDAtMjQuNzMtNDIuNTcsMjIxLjI0LDIyMS4yNCwwLDAsMC0zNi4xNi0zNy42MkEyMDcuNTYsMjA3LjU2LDAsMCwwLDQyNS4xOSwzMTRhMTk4LjEsMTk4LjEsMCwwLDAtNDIuMjUtOC42OWMtMi41OS0uMjMtNS4xNS0uODUtNy43OC0uNjktOS4xMy02LjczLTE4LjM5LTEzLjI0LTI4Ljc5LTE3Ljk0LDAtLjMzLDAtLjY3LjA3LTEsMy43NCwwLDcuNDkuMDYsMTEuMjMsMCw1Mi40My0uOTQsMTAwLjc1LDExLjkxLDE0Myw0My44NEM1NDQuNCwzNjIuNTksNTcxLjc0LDQwNi4zMiw1ODIsNDYwLjNjOC43Myw0Ni4wNSwyLDg5LjU0LTIzLjU2LDEyOS40NC01LDcuODUtMTAuNTMsMTUuNDEtMTcuNjEsMjEuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTUwMC40LDExNy45MWMtNS4yNSwxNi4wNS0xMS44NCwzMS40Ny0yMS4yNyw0NS41OWExNzIuNzgsMTcyLjc4LDAsMCwxLTM0LjQyLDM3LjczYy0uNzYuNjMtMS40NSwxLjM1LTIuMTcsMi00LjU4LDIuMzMtOC4zNSw1Ljg1LTEyLjU5LDguNjhhMjY3LjY4LDI2Ny42OCwwLDAsMS00OS4zOSwyNS41Myw4LjA5LDguMDksMCwwLDEtMS4yOS4zMmMtLjc2LTEuMTIuMTQtMS41My42LTIsOS44Mi05LjM1LDE1LjkxLTIwLjkyLDIwLTMzLjY2YTUsNSwwLDAsMSwzLjE3LTMuNjVjMzAuNTEtMTIuMDgsNTQuODYtMzIuMTUsNzQuOC01Ny45LDEuODEtMi4zNCwzLjU4LTQuNzEsNS44Mi03LjY2LTYuMTctLjEyLTEwLjksMy0xNi4xMiwzLjgyLTEsLjA2LTIuMjcuODgtMi41LTFhMjE1LjI3LDIxNS4yNywwLDAsMCw0MS44NC03NS42NWMuNTUtMS43OCwwLTQuMjMsMi40OC01LjEzYS40NC40NCwwLDAsMSwuMjUuNDVjMCwuMTgtLjA4LjI2LS4xMy4yNmEyMzAuNDksMjMwLjQ5LDAsMCwxLTguMzUsNTguNTYsMzYuODgsMzYuODgsMCwwLDAtLjY5LDMuNjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTYxZjQyIi8+PHBhdGggZD0iTTM4MS44MiwzMjYuNTRhMTIwLDEyMCwwLDAsMSwxNi4wNiwyMi40Yy40My43OSwxLjU0LDEuNjguNTUsMi42MS0uNzUuNy0xLjYyLS4xNi0yLjQxLS40NmEzNDksMzQ5LDAsMCwwLTYyLjU2LTE3Yy0xMC43NS0xLjg1LTIxLjY2LTIuNjYtMzIuNTgtMy40NWExOTQuMDksMTk0LjA5LDAsMCwwLTI5LjQ1LjQyYy0yMi40MiwxLjgtNDQuMjQsNi41OS02NSwxNS41Ni02LjQsMi43Ny0xMi45NCw1LjI1LTE4Ljg5LDktLjY4LjQzLTEuNDksMS4xMy0yLjI3LjA2YTE5OS41OSwxOTkuNTksMCwwLDEsNTkuMi0yOC40MWMyOS4xNS04LjcsNTguOTMtMTAuODQsODkuMTUtOC40NmEzMjguNDIsMzI4LjQyLDAsMCwxLDQ1Ljc0LDYuOTUsMjEuOTIsMjEuOTIsMCwwLDEsMi40NC44MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzc0LjMyLDExNi4zOGg0LjVjMi40MiwxLDUuMDctLjI4LDcuNS43NGg0LjQ5Yy4zOCwyLjE3LTEuNDEsMy4wOC0yLjY1LDQuMTMtMjAuNzgsMTcuNTYtNDEuNDEsMzUuMjktNjIuMiw1Mi44My02Ljg3LDUuNzktMTMuNjgsMTEuNjUtMjAuNTQsMTcuNDVhNi4xNCw2LjE0LDAsMCwwLTIuMzUsMi44M2MtOSwzLjM3LTE3LjM2LDcuNi0yNCwxNC45NC0zLjEzLDMuNDgtNS4xOCw3LjUtNy40NCwxMS40Ni02LjE3LDQtMTEuMzYsOS4yNi0xNywxNC0xNC43NywxMi40Mi0yOS4zNSwyNS4wNi00NC4xNiwzNy40My0xLjI1LDEtMi4wNywyLjUtMy41MiwzLjMxLTIuNTUtMy44LTItOC0xLjM5LTEyLjEyLDEuODYtMy4wNiw0LjgtNSw3LjQ0LTcuMjhxMjEuNTQtMTguMjcsNDMtMzYuNTljMTQtMTEuODUsMjcuOTItMjMuNzcsNDEuOS0zNS42M3EyNC4xMi0yMC40NSw0OC4xNy00MWM4LjkzLTcuNiwxNy44LTE1LjI2LDI2Ljg2LTIyLjcxLDEuMzctMS4xMywyLjMzLTIsMS4yOC0zLjgxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzVjOTRjZSIvPjxwYXRoIGQ9Ik02MzcuNTEsMzA4LjQxYy0xNy42My04LjU2LTM2LjI3LTEzLjc4LTU1LjU0LTE2LjktNS4xNS0uODQtMTAuMy0xLjg3LTE1LjU1LTEuOTEtNi43Mi00LjI1LTEzLjMxLTguNzMtMjAuMTktMTIuN2EyMDkuNzMsMjA5LjczLDAsMCwwLTcyLjE4LTI1Ljc1LDkuMDksOS4wOSwwLDAsMS0xLjY1LS42NGM3LjY1LTEuNCwzMy42OSwyLjUxLDUxLjcyLDcuNDdhMjQzLjA3LDI0My4wNywwLDAsMSw0OC40NywxOWMtMS42Mi00Ljg1LTQuNTgtOC4xMy02LjM5LTEyLS4xOC0xLTEuNjMtMS45NC0uNjYtM3MyLjA3LjA4LDMsLjQ5YzIuNiwxLjE4LDUuMDgsMi42MSw3LjY5LDMuNzdhMzQ3LjUyLDM0Ny41MiwwLDAsMSw2MS40LDQwLjQ5YzEuMDYsMS40LDEuMDYsMS40LS4xMSwxLjY5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzE2MWY0MiIvPjxwYXRoIGQ9Ik0zNzQuMzIsMTE2LjM4Yy40NiwxLjEsMS45Mi4zLDIuNjEsMS41My00LjE4LDMuNjItOC4zNiw3LjMtMTIuNjEsMTAuOTFxLTExLjUxLDkuNzgtMjMuMDcsMTkuNDhRMzI0Ljg3LDE2Mi4xMywzMDguNSwxNzZjLTcuNTgsNi40NC0xNS4wNSwxMy0yMi42MywxOS40Ni05LjE4LDcuOC0xOC40NSwxNS41MS0yNy42NSwyMy4zLTcuMyw2LjE5LTE0LjUzLDEyLjQ3LTIxLjgyLDE4LjY4LTcuNjcsNi41Mi0xNS4zNywxMy0yMy4wNiwxOS40OWwtNy43MSw2LjQ3LDIuMTktOS43NmMtMS4yNC0zLjE5LDEuMzUtNC42MywzLjEzLTYuMSw3LTUuODQsMTMuODgtMTEuODEsMjAuODMtMTcuNzFxMjQuMjUtMjAuNTgsNDguNDktNDEuMjIsMjAuODQtMTcuNyw0MS42Ni0zNS4zOWMxMi45Mi0xMSwyNS45My0yMS45MSwzOC43Mi0zMy4wNywxLS44NiwyLjg1LTEuODcuMTUtMyw0LjQzLTEuNjEsOS0uMzMsMTMuNTItLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzY0OTdkMCIvPjxwYXRoIGQ9Ik0zNjAuOCwxMTcuMTFjMS4wNS4xOSwyLjItLjM3LDMuMy40OS0yLjY1LDMuOS02LjU1LDYuNDUtMTAsOS40NC05LjgyLDguNTYtMTkuNzksMTctMjkuNzQsMjUuMzctOS4xLDcuNjgtMTguMjksMTUuMjYtMjcuMzcsMjNzLTE4LjIzLDE1Ljc0LTI3LjQsMjMuNTQtMTguMjksMTUuMjctMjcuMzYsMjNTMjI0LDIzNy41OCwyMTQuODcsMjQ1LjQ1Yy0yLjc0LDIuMzctNi4zNyw0LTcuMDUsOC4xNS00Ljg0LjU1LTcuNCw0LjY0LTEwLjk0LDcuMTYtNS41OSw0LTkuODQsOS40Ny0xNSwxMy45NS01LjE5LDMuNjktOS43Nyw4LjEtMTQuNjEsMTIuMi0xNC4zOCwxMi4xOS0yOC43LDI0LjQ2LTQzLjEzLDM2LjU5LTIsMS42OC0zLjc3LDMuNjYtNiw1LjA2LTEsLjYyLTEuOTEsMS43OS0zLjMyLjgxYTE2LjksMTYuOSwwLDAsMSwxLjUxLTcuNTFjNy4xOS00LjU5LDEzLjE3LTEwLjY3LDE5LjY2LTE2LjEsMTcuODgtMTUsMzUuNjEtMzAuMTYsNTMuMzgtNDUuMjlzMzUuMy0zMC4xMyw1My00NS4xNXEyNi0yMiw1MS45NC00NC4wOGMxNy42OC0xNSwzNS40NC0zMCw1My00NS4xNSwzLjQ5LTMsNy4xNi01LjgzLDEwLjU2LTloMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMzk5LjgxLDExNy44N2M0LjA3LS4wNSw4LDEsMTIsMS41LDEuMDksMi4zOS0xLDMuMzItMi4yMyw0LjQzLTUsNC4zNy0xMC4yMyw4LjQ4LTE1LjEsMTMtLjUyLS42OS0xLjA4LTEuMzYtMS41Ni0yLjA5LTEuMTEtMS42NS0xLjg5LTEuMjEtMi42MS4zMy01LjksMTIuNjYtMTYuMDUsMjEuNDYtMjcuMSwyOS4zYTIwMi4xNCwyMDIuMTQsMCwwLDEtMzkuODcsMjEuNzljLS43Ni0xLjQ0LS44My0xLjUuNDctMi44NCwyLjY5LTIuNzgsNS43Ny01LjE0LDguNzItNy42NCwyMS4yOS0xOC4xLDQyLjY0LTM2LjEyLDYzLjgxLTU0LjM3LDEuMjMtMS4wNywyLjI5LTIuMywzLjQ3LTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTM5OS44MSwxMTcuODdhNC41NSw0LjU1LDAsMCwxLTEuNzUsMy4xNHEtMjAuNiwxNy40My00MS4xMywzNC45My0xNS43MiwxMy40LTMxLjM2LDI2Ljg5Yy0uOTQuODItMi43MSwxLjQtMi4yMywzLjNhMTg3LjQsMTg3LjQsMCwwLDEtMjAuMjcsOC4yNGMtMi4zMy0uNjQtLjQtMS40NywwLTEuODUsNC4wOS0zLjYyLDguMjMtNy4xOCwxMi4zOS0xMC43MnExMS40Ny05Ljc1LDIzLTE5LjQ3YzcuNTctNi40LDE1LjE4LTEyLjc3LDIyLjczLTE5LjE5czE1LjEyLTEyLjg3LDIyLjU3LTE5LjQyYzIuNDEtMi4xMiw1LjM2LTMuNjgsNy02LjU5LDMuMDYtLjQ0LDYsLjYsOSwuNzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTM0Ni42MSwyMDhjNy45Mi0zLjkyLDE2LjE5LTcuMjEsMjMuMS0xMi45MywxLjQ0LS4wNiwxLjI4Ljc2Ljk0LDEuNjktNi4zOCwyNi40Mi0yNi40Miw0My43Ny01My41Miw0Ni4zLTUuMjIuNDktMTAuNDMsMS4wOS0xNS42OS41OS42OC0xLjkzLDIuNTEtMS43Niw0LTIuMTcsNS44OC0xLjYsMTEuNzEtMy4zMSwxNy4xNi02LjEzLDEwLjIyLTUuMjgsMTcuNzEtMTMuMDcsMjItMjMuODRhOC4yMiw4LjIyLDAsMCwxLDIuMDUtMy41MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMxNjFmNDIiLz48cGF0aCBkPSJNMzQ2LjYxLDIwOGMtMy4yNiwxMi42LTExLjI5LDIxLjMxLTIyLjM5LDI3LjU1LTcuMTMsNC0xNSw1Ljg2LTIyLjc3LDguMS0xLjkxLTUuNTkuMTYtMTAuMzIsMy41Mi0xNC41NywzLjk0LTUsOS4zLTguMDgsMTUtMTAuNjlBMjc3LjA4LDI3Ny4wOCwwLDAsMSwzNDYuNjEsMjA4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQxOGFjOSIvPjxwYXRoIGQ9Ik0xMTQuOCwzMjkuMzdjNC40NS0xLjY1LDcuMzEtNS40MSwxMC44MS04LjI4LDExLjI5LTkuMjcsMjIuMzgtMTguNzgsMzMuNTEtMjguMjQsNS44NS01LDExLjYxLTEwLjA1LDE3LjQxLTE1LjA4LDEuNTgtMS4zNywzLjA1LTIuOTQsNS4zNC0zLjA2LTYsNy41Mi0xMS43MywxNS4yNC0xNiwyMy45M3EtMTcuMjUsMTQuNi0zNC40NCwyOS4yN2MtNS4zLDQuNTMtMTAuNzEsOC45NC0xNS45MywxMy41Ny0uOC43MS0xLjcsMS42LTIuOTQuNjRhNTQuMTMsNTQuMTMsMCwwLDEsMi4yNC0xMi43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2NDk3ZDAiLz48cGF0aCBkPSJNMTU4LjgxLDM0OS41OGMtMy41NC4yNy01LjE0LDMuNDQtNy40OCw1LjMzLTkuODUsNy45NS0xOS40NSwxNi4yMi0yOSwyNC40OS0zLjIsMi43Ni02LjMsNS42Mi05LjY5LDguMTYtMi4yMywxLjY4LTMuMDcsMS0zLTEuNTgsMC0zLjEyLDAtNi4yNCwwLTkuMzYsMy40Ni0zLjc1LDcuNjEtNi43MiwxMS40OC0xMCwxMS4xNy05LjQ4LDIyLjIzLTE5LjEsMzMuNTUtMjguNDIsMS0uOCwxLjc5LTIuMjYsMy40Ni0xLjMxbC43NSwxMi42OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA3LDI3NS40OGE0LjE3LDQuMTcsMCwwLDEsMS45MS0zLjA4YzktNy42LDE4LTE1LjE1LDI3LTIyLjc2LDcuMzktNi4yNSwxNC43Mi0xMi41NiwyMi4wNy0xOC44NywzLjg2LTMuMzEsNy42OS02LjY2LDExLjUyLTEwLC43My0uNjQsMS40MS0xLjEyLDIuMTIsMC0uODMsMy40MS0xLjgyLDYuNzktMS43MiwxMC4zNS00LDQuNDMtOC44OSw3LjkzLTEzLjQyLDExLjgtMTQsMTItMjcuOTUsMjMuOTMtNDIsMzUuNzZhMTEuMzQsMTEuMzQsMCwwLDAtMS40OCwxLjY4LDcuOTMsNy45MywwLDAsMS02LTQuODgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNTU5MWNkIi8+PHBhdGggZD0iTTExMi41NiwzNDIuMTJjMy4yNC0xLDUuMTMtMy44MSw3LjU2LTUuODIsMTMuMTctMTAuODksMjYuMTMtMjIsMzkuMTctMzMuMDgsMi4wNS0xLjczLDMuNDktNC4zMyw2LjU4LTQuNThhMTUwLjg5LDE1MC44OSwwLDAsMC02LDE4Yy0yLjM0LS4yMy0zLjUzLDEuNjQtNSwyLjg4LTEzLjU4LDExLjY3LTI3LjI4LDIzLjItNDAuOTIsMzQuOC0uODIuNjktMS41NSwxLjcxLTIuODksMS4yNmE0NC44OCw0NC44OCwwLDAsMSwxLjUtMTMuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1Yzk0Y2UiLz48cGF0aCBkPSJNMjEzLDI4MC4zNmMtLjkzLTEuNjguNjUtMi4yMywxLjQ3LTIuOTNxMTcuMi0xNC43MSwzNC40OS0yOS4zNCw5Ljc3LTguMjgsMTkuNTktMTYuNDlhNC4xNiw0LjE2LDAsMCwxLDEuMzgtLjQ3LDI5LjkyLDI5LjkyLDAsMCwwLDEuMzgsOWMtMy45Myw0LjU2LTguODcsOC0xMy4zOSwxMS44NnEtMTUuMTMsMTMtMzAuNDUsMjUuOTNhMy41LDMuNSwwLDAsMC0xLjU0LDJjLTQuMjYsMS41OC04LjU2LDIuMjEtMTIuOTMuNDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC4wNiwzMzYuODljLTQuMjEsMi40MS03LjU3LDUuOTEtMTEuMjcsOS05Ljc2LDgtMTkuMzcsMTYuMjUtMjguOTQsMjQuNS0yLjY0LDIuMjgtNSw0LjgyLTguMjgsNi4yNy4zOS00LS44NC04LjA4Ljc0LTEycTIyLjE3LTE4Ljk0LDQ0LjQ2LTM3Ljc2YzEtLjg2LDIuMDYtMS45MSwzLjY0LTEuMjMtLjEyLDMuNzUtLjIzLDcuNS0uMzUsMTEuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNGU4ZmNjIi8+PHBhdGggZD0iTTE1OC40MSwzMjUuNjNjLTQuNzUsMi41NS04LjQyLDYuNS0xMi41Miw5Ljg4LTkuNjgsNy45NS0xOS4xNCwxNi4xNi0yOC43MywyNC4yMi0yLjE0LDEuODEtMy42NCw0LjU2LTYuODUsNC44OS4zOC0zLS44LTYuMTEuNzUtOXExNC0xMiwyOC4wNi0yMy45MmM2LjM0LTUuMzksMTIuNzQtMTAuNzEsMTkuMDctMTYuMSwyLTEuNzIsMS40Ny4xNywxLjY1LDEuMDhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1OTFjZCIvPjxwYXRoIGQ9Ik0yMjYsMjgwYy0xLjM4LTEtLjQxLTEuNzQuMzItMi4zNSw4LjgyLTcuNCwxNy42OC0xNC43NSwyNi40OS0yMi4xNiw1LjUtNC42MywxMC45My05LjM0LDE2LjM3LTE0YTMuNjYsMy42NiwwLDAsMSwyLjItMS4yOGwyLjI1LDQuNDljLTEuNzMsMi42Ny00LjUsNC4zMy02LjQ1LDYuNzktMTAuODMsMTItMjIuOTUsMjIuMTQtMzguMjksMjcuOTFBMTkuNTMsMTkuNTMsMCwwLDEsMjI2LDI4MCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0ODhkY2EiLz48cGF0aCBkPSJNMzk0LjQ4LDEzNi44YzEuMzYtNC4yNSw1Ljc3LTUuNDcsOC4zOC04LjQ3LDIuNzgtMy4xOSw3LjMzLTQuNjEsOC45NS05LDMuMjYsMCw2LjM4Ljg2LDkuNTUsMS40NSwyLjc0LjUxLDIuODYsMS43LDEsMy4zOS00LjA4LDMuNjQtOC4yLDcuMjYtMTIuMzQsMTAuODItMy44NiwzLjMyLTcuNzgsNi41Ny0xMS42OCw5Ljg1WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM0NjhjY2EiLz48cGF0aCBkPSJNMjA5LjM3LDMwNy44MWMuNjYsMS42Ni0xLjMzLDIuNDktMS4xLDQtMS00LjU2LTMuNTEtNi4zMy04LjA4LTUuNDJhMjMuNjUsMjMuNjUsMCwwLDAtMTIuNjQsNy4zNWMtLjk0LDEtMiwxLjg5LTMsMi44NC0uODItMSwwLTEuODcuMzMtMi43NiwyLTYuNTEsNi4zOS0xMS4xNCwxMS45My0xNC44M2ExMi41NywxMi41NywwLDAsMSw0LjA2LTEuODVjNi40Mi0xLjUzLDkuOTQsMS42MSw5LjA2LDguMTJhOC4yOCw4LjI4LDAsMCwxLS42MSwyLjUzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyOGFjOSIvPjxwYXRoIGQ9Ik0yMDkuMzcsMzA3LjgxYzAtMSwuMDYtMiwuMDctMywuMTEtNi41NC0zLjYtOS05LjY3LTYuMjUtNywzLjItMTEuNDIsOC45Mi0xNC40OSwxNS43OS0uNzEuMTMtMS4wOC0uMDctLjg2LS44NiwyLjIxLTguMTYsNi40Ny0xNC45MiwxMy41Ni0xOS43M2ExNC44MiwxNC44MiwwLDAsMSw1Ljg1LTIuMjgsNi4yNSw2LjI1LDAsMCwxLDcuNDEsNC42MSwxNC44OCwxNC44OCwwLDAsMS0xLjg3LDExLjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjMTgyMTQ0Ii8+PHBhdGggZD0iTTI2Ny4xMywyNTEuNDFjLTEuMjYtMS0uMTUtMS40LjUyLTEuODcsMi4xMS0xLjQ3LDMuMjctNC4xLDUuOTMtNC45MiwzLjQsNS4zOCw4LjgzLDcuNzUsMTQuNDksOS43NywxLjE0LjQxLDIuMzMuNjcsNC4xOSwxLjE5LTguNzIsMi4yNy0xNi4yNCwxLjM5LTIzLjE1LTMuMzNhMywzLDAsMCwwLTItLjg0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQ1OGNjYSIvPjxwYXRoIGQ9Ik01NzYuMjIsMjY2LjIzYy0yLjc1LS4zMi00Ljg0LTIuMi03LjM0LTMuMTMtMS0uMzYtMS44OS0xLjY0LTIuOTItLjgtLjg1LjcuNTQsMS43NC4yNCwyLjcxLTEuNTMtMS4zNC0yLjA2LTMuMjYtMi44Ni01LjIxLDQuNDYsMS44NSw4LjkxLDMuNjQsMTIuODgsNi40MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2MzY1N2QiLz48cGF0aCBkPSJNNjM3LjUxLDMwOC40MWMuODEtLjUxLDAtMS4xMy4xMS0xLjY5bDQuMzUsMi4zNiwyLjM0LDNjLTIuODUtLjc2LTQuNzgtMi4zMS02LjgtMy42NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMyNjMxNTQiLz48cGF0aCBkPSJNNDY1LjE5LDI0OS4yNmExNC4yNiwxNC4yNiwwLDAsMSw2LC40NWMtMi4zMiwxLjI2LTMuOTIsMS4wOS02LS40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiNhMDlhYTkiLz48cGF0aCBkPSJNMTc3LjgxLDU5Ni4zNmMyLjMzLjQyLDMuMzksMi42Nyw1LjMsMy43TDE4Myw2MDFhMTQuMjIsMTQuMjIsMCwwLDEtNS4yMS00LjU5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzQyNGE3ZiIvPjxwYXRoIGQ9Ik02NTQuMTcsNDUzLjA3bDEuMzQuNzVjLjE5LDEuNTEtLjQ1LDIuNzUtMS4zNCw0LjZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzhjYjdkZSIvPjxwYXRoIGQ9Ik00NjUsMTM1Ljc5Yy41MSwxLjE1LDEuNjYuNjgsMi41LDFsLTQsMS41NWMtLjMxLTEuNTkuNzctMS45NSwxLjUxLTIuNTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNWE1ZDc2Ii8+PHBhdGggZD0iTTE4NC40MiwzMTMuNTFsLjg2Ljg2Yy0uMjMuNzQtLjQ1LDEuNDktLjY4LDIuMjNMMTgzLDMxOC42N2MuNDgtMi40Mi41MS0zLjksMS40My01LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzRmNjY4YSIvPjxwYXRoIGQ9Ik0zNzAuNjUsMTk2LjczYy0uMjItLjYyLS4xMy0xLjQtLjk0LTEuNjkuMjQtLjU4Ljg5LTEuMzksMS4xOS0xLjEuOS44Ny41MiwxLjkxLS4yNSwyLjc5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzU1NWE3MyIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZhNjEuNDQsNjEuNDQsMCwwLDEsNC41LTE1Ljc3YzguODItNi4xNSwxNi41OC0xMy42LDI0Ljc5LTIwLjVxMjEuMzUtMTgsNDIuNTMtMzYuMTQsMTkuMzUtMTYuNTUsMzguNzktMzMsMjEtMTcuOCw0Mi0zNS42NmMxMi43NC0xMC44MywyNS41Mi0yMS42MywzOC4yMS0zMi41Myw4LjktNy42NSwxOC0xNS4wNywyNi43NC0yMi44OGE1Myw1MywwLDAsMSwxNC4yNC0xLjUyLDEuNDQsMS40NCwwLDAsMSwxLjU0LS4xOGMxLjA2LDEuODEtLjI5LDIuODQtMS4zOSwzLjc2cS0xOC4xMywxNS4zNi0zNi4xOSwzMC44MVEyOTQuMjgsMTY4LjYzLDI3NSwxODVxLTE3Ljc5LDE1LjE4LTM1LjY0LDMwLjI5UTIxNy43LDIzMy42NywxOTYsMjUyLjFjLTE4LDE1LjI1LTM1Ljg4LDMwLjU5LTUzLjksNDUuNzktNyw1Ljg3LTEzLjgxLDExLjg4LTIwLjg3LDE3LjYzLS44OC43MS0yLjA3LDMtMy40Ny4zNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ZDljZDIiLz48cGF0aCBkPSJNMzM1LjMxLDExOS4zOGMtMS4yNiw0LjIxLTUuMzMsNS43OS04LjIyLDguMzYtOS40Nyw4LjQyLTE5LjI2LDE2LjQ5LTI4Ljk0LDI0LjY3LTEwLjgzLDkuMTMtMjEuNzIsMTguMi0zMi41MSwyNy4zOC05LjM4LDgtMTguNjIsMTYuMTEtMjgsMjQuMS05LjA5LDcuNzQtMTguMjksMTUuMzQtMjcuMzgsMjMuMDZzLTE4LjExLDE1LjU1LTI3LjIxLDIzLjI4LTE4LjI1LDE1LjM3LTI3LjM1LDIzLjA5Yy03LjQ5LDYuMzYtMTQuOTIsMTIuNzktMjIuMzksMTkuMTYtMywyLjU4LTYuMTEsNS4xLTkuMTYsNy42NS0uNjYuNTUtMS4yNi44Mi0xLjg2LDBhNjAsNjAsMCwwLDEsNS4yNS0xNWM2LjktNC4zNSwxMi42Ny0xMC4xLDE4Ljg2LTE1LjMycTIxLjMzLTE4LDQyLjUxLTM2LjEzLDIxLjkyLTE4Ljc1LDQzLjkyLTM3LjM5LDE4LjEtMTUuNDIsMzYuMjUtMzAuNzljMTUuNzMtMTMuMywzMS4zMy0yNi43Niw0Ny4xMy00MGE2Ljk0LDYuOTQsMCwwLDAsMi41OC0zLjEzYzUuMzEtMi4wNiwxMS0xLjkzLDE2LjUxLTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjNzI5ZmQ0Ii8+PHBhdGggZD0iTTMxOC44LDEyMi4zNmMyLjMzLjYxLjQzLDEuNDYsMCwxLjg1LTQuMjUsMy44Mi04LjU0LDcuNjEtMTIuODksMTEuMzEtNy41Nyw2LjQzLTE1LjIsMTIuNzktMjIuNzksMTkuMnEtMTYuNjcsMTQtMzMuMjksMjguMTNjLTkuMDksNy43My0xOC4wOCwxNS41Ni0yNy4xNiwyMy4yOS05LjM2LDgtMTguNzksMTUuODUtMjguMTYsMjMuODItOS4wOCw3LjczLTE4LjA5LDE1LjU0LTI3LjE3LDIzLjI3UzE0OS4xLDI2OC42MSwxNDAsMjc2LjI5Yy0zLjMzLDIuOC02LjY0LDUuNjItMTAsOC4zNy0uNjYuNTQtMS4zNywxLjc2LTIuNDQuNDQsMS01LjE2LDMuNzItOS42MSw2LTE0LjI0LDEyLjMzLTEwLjU0LDI0LjcyLTIxLDM3LjA2LTMxLjU2cTE5LjA4LTE2LjI5LDM4LjIxLTMyLjUyLDE4LjI1LTE1LjUzLDM2LjUzLTMxUTI2NC42LDE1OS4zOSwyODMuODYsMTQzYzYuNjUtNS42NCwxMy4wOS0xMS41NCwxOS45NS0xNyw0Ljc1LTIuMjEsOS45LTIuODMsMTUtMy43MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM3OGEyZDUiLz48cGF0aCBkPSJNMzAzLjgxLDEyNi4wN2MtNC43Niw2LjE5LTExLjIyLDEwLjU1LTE3LDE1LjYzLTcuNTcsNi42NC0xNS4zMiwxMy4wNS0yMywxOS41NS03LjQ5LDYuMzQtMTUsMTIuNjUtMjIuNDksMTlTMjI2LjM5LDE5MywyMTguOSwxOTkuNHMtMTUuMjEsMTIuOC0yMi43OSwxOS4yM2MtNy4zOSw2LjI4LTE0LjcxLDEyLjYzLTIyLjEsMTguOTFxLTE0LjA2LDEyLTI4LjE3LDIzLjg1Yy0zLjMyLDIuODEtNi42Niw1LjYtMTAsOC40YTMuNDMsMy40MywwLDAsMS0yLjMyLDEuMDcsOTkuOTMsOTkuOTMsMCwwLDEsOS0xOGMxNy4xMi0xMy45MSwzMy43Ny0yOC40LDUwLjU3LTQyLjcsMTkuNDUtMTYuNTcsMzktMzMsNTguMzQtNDkuNzMsMTAuOTQtOS40NSwyMi4zLTE4LjQxLDMyLjg1LTI4LjMyYTExMy40MywxMTMuNDMsMCwwLDEsMTkuNS02IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzdkYTVkNiIvPjxwYXRoIGQ9Ik0yODQuMzEsMTMyLjExYy43NSwxLjM0LS42LDEuNzQtMS4xOCwyLjI2cS0xMi40OCwxMC45NC0yNS4wNiwyMS43M2MtNy4zNSw2LjMxLTE0Ljc3LDEyLjU0LTIyLjE2LDE4LjhxLTEzLjc4LDExLjY3LTI3LjU4LDIzLjM0Yy03LjQ3LDYuMzUtMTQuOSwxMi43Ni0yMi4zOCwxOS4xMS05LjM3LDgtMTguNzgsMTUuODctMjguMTUsMjMuODJxLTUuODQsNS0xMS42MSwxMGE2LjQ1LDYuNDUsMCwwLDEtMy42NCwxLjc0LDE1OS4yNiwxNTkuMjYsMCwwLDEsMTYuNTItMjYuMjRjNS44LTQuMjcsMTEuMS05LjE2LDE2LjU5LTEzLjgxcTIxLjM5LTE4LjEyLDQyLjcyLTM2LjMyLDE2LjUtMTQuMDYsMzMtMjguMTRjMS43LTEuNDUsMy44My0yLjM4LDUuMTMtNC4yOSw4LjcyLTUuMjgsMTguMy04LjUzLDI3LjgyLTExLjk1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzgxYTdkOCIvPjxwYXRoIGQ9Ik00NDIuNTUsNDY2LjY0Yy03LjU1LDYuMTYtMTQuOTUsMTIuNTQtMjUsMTYuODFhODguODYsODguODYsMCwwLDAsNi42My0xOC4yNGM1LjkyLTI2LC40My00OS42Ni0xNC44Ny03MS4yNC0zLjc4LTUuMzItOC44Ni05LjQ0LTEzLjM2LTE0LjA5LS43My0uNzUtMS41Mi0xLjY5LTIuODMtMS4wNi0xLjM1LS42Ni0yLTItMy0zLC42NS0uODMsMS4zMi0uMzcsMiwwLDE4LjEzLDEwLjI4LDMzLjI0LDIzLjYyLDQyLjQ3LDQyLjY5YTg1LjIzLDg1LjIzLDAsMCwxLDguMTgsMzAsODYuODYsODYuODYsMCwwLDEtLjE3LDE4LjE3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjMuNzggLTIzLjc3KSIgZmlsbD0iIzBlMWY2NiIvPjxwYXRoIGQ9Ik0xMTcuOCwzMTUuODZjMywxLjA4LDQtMS45MSw1LjU0LTMuMTQsMTUuMjEtMTIuNTksMzAuMjEtMjUuNDQsNDUuMjMtMzguMjYsMTQuMTctMTIuMSwyOC4yNS0yNC4zMSw0Mi40NS0zNi4zOCwxNS44MS0xMy40MywzMS43NC0yNi43LDQ3LjU1LTQwLjEzLDE0LjItMTIuMDcsMjguMjgtMjQuMjcsNDIuNDQtMzYuMzhRMzI0LDE0MiwzNDcsMTIyLjRjMS41Ny0xLjM0LDMuODMtMiw0LjExLTQuNTMuODYtLjgyLDIuMTMuMDgsMy0uNzNsMy43NiwwYy0xLjE1LDQtNSw1LjM5LTcuNyw3LjgxLTcuNzYsNy0xNS44NSwxMy41OS0yMy44MiwyMC4zMy05LjExLDcuNy0xOC4yNiwxNS4zNi0yNy4zNiwyMy4wOC03LjM5LDYuMjctMTQuNzIsMTIuNjItMjIuMTIsMTguOS0xMC45LDkuMjQtMjEuODUsMTguNDItMzIuNzQsMjcuNjctNy40LDYuMjgtMTQuNzIsMTIuNjQtMjIuMSwxOC45Mi05LjM4LDgtMTguOCwxNS44OC0yOC4xOCwyMy44NS03LjM5LDYuMjgtMTQuNzEsMTIuNjQtMjIuMSwxOC45Mi03LjU3LDYuNDQtMTUuMjEsMTIuODEtMjIuNzgsMTkuMjVzLTE1LjA4LDEzLTIyLjY1LDE5LjQzYy0yLjY0LDIuMjUtNS4zOCw0LjQtOC4wOCw2LjYtLjY0LjUyLTEuMjUuODUtMS44NywwYTExLjc1LDExLjc1LDAsMCwxLDEuNDktNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2OTlhZDEiLz48cGF0aCBkPSJNMjU2LjQ5LDE0NC4wNmMtLjYzLDMuNTUtNC4wOSw0LjQ4LTYuMjksNi40Ni03LjY2LDYuODktMTUuNjMsMTMuNDMtMjMuNDksMjAuMDgtOS4yLDcuNzctMTguNDIsMTUuNS0yNy42LDIzLjI5LTcuMzksNi4yNi0xNC43MywxMi41OS0yMi4wOCwxOC44OXEtOC4wNiw2LjktMTYuMSwxMy44M2MtLjYzLjU0LTEuMjQuODctMS44NiwwYTE0MS43MiwxNDEuNzIsMCwwLDEsMTMuMTQtMTcuMTFjMTcuNjUtMjAuNSwzNy43LTM4LjMsNjAuNzMtNTIuNiw3LjYtNC43MSwxNS4xNC05LjYsMjMuNTUtMTIuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMy43OCAtMjMuNzcpIiBmaWxsPSIjODhhYmQ5Ii8+PHBhdGggZD0iTTM4Ni4zMiwxMTcuMTJjLTIuNDktLjMzLTUuMTMuNzctNy41LS43NCwyLjQ5LjMyLDUuMTItLjc4LDcuNS43NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM1NTkxY2QiLz48cGF0aCBkPSJNMzU0LjA1LDExNy4xNGMtLjc5LDEuMDctMiwuNjItMywuNzNoLTEuNTFjMS4zMy0xLjMsMy0uNTIsNC41LS43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiM2ODlhZDEiLz48cGF0aCBkPSJNMjgyLjA2LDYzOS4xMmExODIuMywxODIuMywwLDAsMCw3MS44MS0xMS4zMSwyMTQsMjE0LDAsMCwwLDYxLjYxLTM0LjY3YzE4LjA5LTE0LjY4LDMzLjY2LTMxLjUzLDQ0LjA2LTUyLjYxYTEwMS4zNiwxMDEuMzYsMCwwLDAsMTAuMjItMzZjMS0xMS4zMS0uODgtMjItMy45NS0zMi42NC4zNC0yLjYxLDIuNzItMy44LDQuMTEtNS42Myw1LjM4LTcuMDcsOS4zNS0xNC42OSwxMS0yMy40NmEyNy40MywyNy40MywwLDAsMSwxLjIxLTMuNDMsMTExLDExMSwwLDAsMSw4LDIxLjE2YzIuNjMsMTAuMzEsNC4xMSwyMC44LDMuMzMsMzEuNGExMjMuMzEsMTIzLjMxLDAsMCwxLTE2LjA2LDUyLjMyYy05LjE2LDE2LjE1LTIxLDMwLTM0LjYsNDIuMzdhMTk5Ljg5LDE5OS44OSwwLDAsMS0zOS4zNywyNy41NCwyMTkuNSwyMTkuNSwwLDAsMS01NC4yNiwyMC43MSwyMDkuMjcsMjA5LjI3LDAsMCwxLTM2LjA1LDUuMmMtNS44NS4zMy0xMS43MS44My0xNy41Mi40Ni00LjUxLS4yOS05LjE0LDAtMTMuNTYtMS4zNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIzLjc4IC0yMy43NykiIGZpbGw9IiMwZTFmNjYiLz48L2c+PC9zdmc+',
    protocol: 'uniswap_v2',

    slippage: true,

    blockchains: ['polygon'],
    
    polygon: {
      router: {
        address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        api: UniswapV2.ROUTER
      },
      factory: {
        address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        api: UniswapV2.FACTORY
      },
      pair: {
        api: UniswapV2.PAIR
      },
    }
  };

  var quickswap = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$d, {
        scope,
        findPath: (args)=>UniswapV2.findPath({ ...args, exchange: exchange$d }),
        pathExists: (args)=>UniswapV2.pathExists({ ...args, exchange: exchange$d }),
        getAmounts: (args)=>UniswapV2.getAmounts({ ...args, exchange: exchange$d }),
        getPrep: (args)=>UniswapV2.getPrep({ ...args, exchange: exchange$d }),
        getTransaction: (args)=>UniswapV2.getTransaction({ ...args, exchange: exchange$d }),
      })
    )
  };

  const exchange$c = {
    
    name: 'spookyswap',
    label: 'SpookySwap',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNjQxIDY0MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjQxIDY0MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGZpbGw9IiMxMjExMjIiIGQ9Ik0zNC4yLDMyMGMwLDE1OC41LDEyOC41LDI4Ni4zLDI4Ni4zLDI4Ni4zYzE1OC41LDAsMjg2LjMtMTI4LjUsMjg2LjMtMjg2LjNjMC0xNTguNS0xMjguNS0yODYuMy0yODYuMy0yODYuMwoJCUMxNjIuNywzMy43LDM0LjIsMTYyLjIsMzQuMiwzMjBMMzQuMiwzMjB6Ii8+Cgk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0YyRjRGOCIgZD0iTTEyMC45LDI0Ny42Yy0zLjMsMjIuMiwwLjcsNDUuNyw0LjYsNjcuOGMyLDMuMyw1LjIsNS45LDkuOCw3LjJjLTkuMSwxOS42LTE0LjMsNDAuNC0xNC4zLDYyLjYKCQljMCw5My4zLDkwLDE2OC45LDIwMS41LDE2OC45UzUyNCw0NzguNSw1MjQsMzg1LjJjMC0yMS41LTUuMi00My0xNC4zLTYyLjZjMy45LTEuMyw2LjUtMy45LDcuOC03LjJjNC42LTIyLjIsOC41LTQ1LjcsNS4yLTY3LjgKCQljLTMuMy0zMC0xMy43LTM5LjgtNDUtMzJjLTE1LjcsMy45LTM2LjUsMTMtNTIuOCwyNC4xYy0zMC0xNS02NS4yLTIzLjUtMTAyLjQtMjMuNWMtMzcuOCwwLTczLjcsOS4xLTEwMy43LDI0LjEKCQljLTE2LjMtMTEuMS0zNy4yLTIwLjktNTMuNS0yNC44QzEzNCwyMDcuOCwxMjQuMiwyMTcuNiwxMjAuOSwyNDcuNkwxMjAuOSwyNDcuNnogTTIzOC4zLDM4MC43Yy0yMy41LTEwLjQtNjMuOS03LjgtNjMuOS03LjgKCQlzMiwzNy44LDI0LjgsNTAuOWMyNy40LDE1LDc4LjksNy44LDc4LjksNy44UzI3My41LDM5Ni4zLDIzOC4zLDM4MC43TDIzOC4zLDM4MC43eiBNMzY5LjQsNDMyLjJjMCwwLDUwLjksNy44LDc4LjktNy44CgkJYzIzLjUtMTMsMjQuOC01MC45LDI0LjgtNTAuOXMtNDAuNC0yLjYtNjMuOSw3LjhDMzc0LDM5Ni4zLDM2OS40LDQzMS41LDM2OS40LDQzMi4yTDM2OS40LDQzMi4yeiBNMzEyLjcsNDU4LjkKCQljMCwyLjYsNS4yLDUuMiwxMS43LDUuMnMxMS43LTIsMTEuNy01LjJjMC0yLjYtNS4yLTUuMi0xMS43LTUuMkMzMTcuOSw0NTMuNywzMTIuNyw0NTUuNywzMTIuNyw0NTguOUwzMTIuNyw0NTguOXoiLz4KCTxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRjJGNEY4IiBkPSJNNTUyLjcsNDM1LjRjLTE4LjktNy4yLTM5LjEtMTEuMS01OS4zLTExLjFjLTUuMiwwLTUuMi03LjgsMC03LjhjMjAuOSwwLDQxLjcsMy45LDYxLjMsMTEuNwoJCWMyLDAuNywzLjMsMi42LDIuNiw0LjZDNTU2LjYsNDM0LjgsNTU0LjYsNDM2LjEsNTUyLjcsNDM1LjRMNTUyLjcsNDM1LjR6IE05Mi4yLDQyNy42YzE5LjYtNy44LDQwLjQtMTEuMSw2MS4zLTExLjcKCQljNS4yLDAsNS4yLDcuOCwwLDcuOGMtMjAuMiwwLTQwLjQsMy45LTU5LjMsMTEuMWMtMiwwLjctNC42LTAuNy01LjItMi42Qzg5LDQzMC45LDkwLjMsNDI4LjMsOTIuMiw0MjcuNkw5Mi4yLDQyNy42eiBNMTMyLjcsNDUwLjQKCQljOS44LTMuMywyMC4yLTQuNiwzMC01LjJjNS4yLDAsNS4yLDcuOCwwLDcuOGMtOS4xLDAtMTguOSwyLTI3LjQsNC42Yy04LjUsMi42LTE3LjYsNS45LTI0LjEsMTEuN2MtMy45LDMuMy05LjEtMi01LjktNS45CgkJQzExMy4xLDQ1NywxMjMuNSw0NTMuNywxMzIuNyw0NTAuNEwxMzIuNyw0NTAuNHogTTE3MS44LDQ2NS40Yy03LjgsMy4zLTE1LjcsNy44LTIyLjgsMTIuNGMtNy4yLDQuNi0xMy43LDEwLjQtMTguOSwxNwoJCWMtMS4zLDItMC43LDQuNiwxLjMsNS4yYzIsMS4zLDQuNiwwLjcsNS4yLTEuM2M0LjYtNS45LDExLjEtMTEuMSwxNy0xNWM3LjItNC42LDE0LjMtOC41LDIxLjUtMTEuN2MyLTEuMywyLjYtMy4zLDEuMy01LjIKCQlDMTc2LjQsNDY0LjgsMTczLjgsNDY0LjEsMTcxLjgsNDY1LjRMMTcxLjgsNDY1LjR6IE00ODMuNSw0NTMuN2M5LjEsMCwxOC45LDIsMjcuNCw0LjZjNC42LDEuMyw5LjEsMy4zLDEzLjcsNS4yCgkJYzMuOSwxLjMsNy4yLDMuOSwxMC40LDYuNWMzLjksMy4zLDkuMS0yLDUuOS01LjljLTcuMi02LjUtMTcuNi0xMC40LTI2LjctMTNjLTkuOC0zLjMtMjAuMi00LjYtMzAtNS4yCgkJQzQ3OSw0NDUuMiw0NzksNDUzLjcsNDgzLjUsNDUzLjdMNDgzLjUsNDUzLjd6IE00OTIuNyw0ODMuN2MtNy4yLTQuNi0xNC4zLTcuOC0yMS41LTExLjFsMCwwYy0yLTEuMy0yLjYtMy4zLTEuMy01LjIKCQljMS4zLTIsMy4zLTIuNiw1LjItMS4zYzE1LjcsNi41LDMyLDE1LjcsNDEuNywyOS4zYzEuMywyLDAuNyw0LjYtMS4zLDUuMmMtMiwxLjMtNC42LDAuNy01LjItMS4zCgkJQzUwNS43LDQ5Mi44LDQ5OS4yLDQ4Ny42LDQ5Mi43LDQ4My43TDQ5Mi43LDQ4My43eiIvPgoJPHBhdGggZmlsbD0iIzY2NjVERCIgZD0iTTYyLjIsMzM1LjdjMy45LTUuOSwzNS45LTIyLjgsNzUuNy0zMy4zYzguNS0yNC44LDE5LjYtNDguMywzMi03MS4xbDMyLTU4Yy05LjEtMy45LTE4LjMtOS4xLTI2LjctMTUKCQljLTEuMy0xLjMtMi42LTIuNi0zLjktMy45Yy0wLjctMS4zLTEuMy0zLjMtMS4zLTQuNnMyLTMuOSwyLjYtNC42YzItMi42LDQuNi00LjYsNy4yLTcuMmM1LjktNS4yLDEyLjQtOS44LDE5LjYtMTMuNwoJCWMzLjMtMiw2LjUtMy45LDkuOC02LjVjMjIuOC0xNC4zLDM1LjktMjUuNCw1Ni43LTM3LjhjMjAuMi0xMS43LDMwLTE4LjMsNTIuOC0xNy42YzI5LjMsMCwxMDEuNyw5Mi42LDEzNC4zLDE0MC4yCgkJYzE5LjYsMjguNyw0Ni4zLDgwLjIsNTYuMSw5OS44YzIsMC43LDQuNiwxLjMsNi41LDJjMzAsOS4xLDU4LjcsMjIuMiw2NS45LDMwLjdjNi41LDcuMi0yMS41LDEwLjQtNDguOSwxNS43CgkJYy0yNy40LDQuNi0xMjAuNyw3LjItMjEwLDcuOGMtODkuMywwLjctMTkzLjctMi42LTIxNi41LTUuOUM4My4xLDM0OS4zLDU3LjcsMzQyLjgsNjIuMiwzMzUuN0w2Mi4yLDMzNS43eiIvPgoJPHBhdGggZmlsbD0iI0ZGOTlBNSIgZD0iTTQ4My41LDI1Ni4xYzAsMC01OC43LTE1LTE2Mi40LTE1Yy0xMTEuNSwwLTE2NSwxNy0xNjUsMTdzLTYuNSwxMi40LTkuMSwxOC45Yy0yLjYsNy4yLTkuMSwyNS40LTkuMSwyNS40CgkJUzIxOC44LDI4OCwzMjIuNSwyODhjNjIuNiwwLDEyNC42LDUuMiwxODYuNSwxNS43YzAsMC05LjEtMjIuMi0xNS0zMS4zQzQ5MC43LDI2Ny4yLDQ4Ny41LDI2MS4zLDQ4My41LDI1Ni4xTDQ4My41LDI1Ni4xeiIvPgoJPHBhdGggZmlsbD0iI0ZGRTYwMCIgZD0iTTEzMy4zLDEzMS41YzYuNS0wLjcsMTUuNywxOS42LDE1LjcsMTkuNnMyMC45LTUuOSwyNC44LDBjMy4zLDUuOS0xNSwxOS42LTE1LDE5LjZzMTEuMSwxOS42LDcuMiwyMy41CgkJYy0zLjMsMy45LTIyLjgtOC41LTIyLjgtOC41cy0xNSwxNy0xOS42LDE0LjNjLTUuMi0yLjYsMC43LTI0LjgsMC43LTI0LjhzLTIxLjUtOS4xLTE5LjYtMTQuM2MxLjMtNS4yLDIzLjUtNy4yLDIzLjUtNy4yCgkJUzEyNi44LDEzMi44LDEzMy4zLDEzMS41TDEzMy4zLDEzMS41eiIvPgo8L2c+Cjwvc3ZnPgo=',
    protocol: 'uniswap_v2',
    
    slippage: true,

    blockchains: ['fantom'],

    fantom : {
      router: {
        address: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
        api: UniswapV2.ROUTER
      },
      factory: {
        address: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
        api: UniswapV2.FACTORY
      },
      pair: {
        api: UniswapV2.PAIR
      }
    }
  };

  var spookyswap = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$c, {
        scope,
        findPath: (args)=>UniswapV2.findPath({ ...args, exchange: exchange$c }),
        pathExists: (args)=>UniswapV2.pathExists({ ...args, exchange: exchange$c }),
        getAmounts: (args)=>UniswapV2.getAmounts({ ...args, exchange: exchange$c }),
        getPrep: (args)=>UniswapV2.getPrep({ ...args, exchange: exchange$c }),
        getTransaction: (args)=>UniswapV2.getTransaction({ ...args, exchange: exchange$c }),
      })
    )
  };

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const getExchangePath$1 = ({ blockchain, path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === Blockchains__default['default'][blockchain].currency.address && path[index+1] != Blockchains__default['default'][blockchain].wrapped.address &&
        path[index-1] != Blockchains__default['default'][blockchain].wrapped.address
      ) {
        return Blockchains__default['default'][blockchain].wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == Blockchains__default['default'][blockchain].currency.address && exchangePath[1] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == Blockchains__default['default'][blockchain].currency.address && exchangePath[exchangePath.length-2] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  const getBestPool$1 = async ({ exchange, blockchain, path, amountIn, amountOut, block }) => {
    path = getExchangePath$1({ blockchain, path });
    
    let bestPool;
      
    if(amountIn) {

      bestPool = await request({
        blockchain: Blockchains__default['default'][blockchain].name,
        address: exchange[blockchain].quoter.address,
        method: 'findBestPathFromAmountIn',
        api: exchange[blockchain].quoter.api,
        cache: 5000, // 5 seconds in ms
        block,
        params: {
          route: path,
          amountIn,
        },
      }).catch(()=>{});

    } else { // amountOut

      bestPool = await request({
        blockchain: Blockchains__default['default'][blockchain].name,
        address: exchange[blockchain].quoter.address,
        method: 'findBestPathFromAmountOut',
        api: exchange[blockchain].quoter.api,
        cache: 5000, // 5 seconds in ms
        block,
        params: {
          route: path,
          amountOut
        },
      }).catch(()=>{});
    }

    if(!bestPool || bestPool.virtualAmountsWithoutSlippage.some((amount)=>amount.toString() === '0')) {
      return
    }

    return bestPool
  };

  const pathExists$2 = async ({ exchange, blockchain, path, amountIn, amountOut, amountInMax, amountOutMin }) => {
    return !!(await getBestPool$1({ exchange, blockchain, path, amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) }))
  };

  const findPath$2 = async ({ exchange, blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
    if(
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) &&
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path;
    let pools = [];

    // DIRECT PATH
    pools = [
      await getBestPool$1({ exchange, blockchain, path: [tokenIn, tokenOut], amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) })
    ];
    if (pools.filter(Boolean).length) {
      path = [tokenIn, tokenOut];
    }

    // PATH VIA WRAPPED
    if(
      !path &&
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address
    ) {
      pools = [];
      if(amountOut || amountOutMin){
        pools.push(await getBestPool$1({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountOut: (amountOut || amountOutMin) }));
        if(pools.filter(Boolean).length) {
          pools.unshift(await getBestPool$1({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountOut: pools[0].virtualAmountsWithoutSlippage[0] }));
        }
      } else { // amountIn
        pools.push(await getBestPool$1({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountIn: (amountIn || amountInMax) }));
        if(pools.filter(Boolean).length) {
          pools.push(await getBestPool$1({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountIn: pools[0].virtualAmountsWithoutSlippage[1] }));
        }
      }
      if (pools.filter(Boolean).length === 2) {
        // path via WRAPPED
        path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
      }
    }

    // PATH VIA USD STABLE
    if(
      !path
    ) {
      pools = [];
      let allPoolsForAllUSD = await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async(stable)=>{
        let pools = [];
        if(amountOut || amountOutMin){
          pools.push(await getBestPool$1({ exchange, blockchain, path: [stable, tokenOut], amountOut: (amountOut || amountOutMin) }));
          if(pools.filter(Boolean).length) {
            pools.unshift(await getBestPool$1({ exchange, blockchain, path: [tokenIn, stable], amountOut: pools[0].virtualAmountsWithoutSlippage[0] }));
          }
        } else { // amountIn
          pools.push(await getBestPool$1({ exchange, blockchain, path: [tokenIn, stable], amountIn: (amountIn || amountInMax) }));
          if(pools.filter(Boolean).length) {
            pools.push(await getBestPool$1({ exchange, blockchain, path: [stable, tokenOut], amountIn: pools[0].virtualAmountsWithoutSlippage[1] }));
          }
        }
        if(pools.filter(Boolean).length === 2) {
          return [stable, pools]
        }
      }));

      let usdPath = allPoolsForAllUSD.filter(Boolean)[0];
      if(usdPath) {
        path = [tokenIn, usdPath[0], tokenOut];
        pools = usdPath[1];
      }
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain$1([path, 'optionalAccess', _ => _.length]) && path[0] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    } else if(_optionalChain$1([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(path.length-1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    }

    if(!path) { pools = []; }
    return { path, pools, exchangePath: getExchangePath$1({ blockchain, path }) }
  };

  let getAmountOut$1 = async({ exchange, blockchain, path, pools, amountIn }) => {
    let bestPath = await request({
      blockchain: Blockchains__default['default'][blockchain].name,
      address: exchange[blockchain].quoter.address,
      method: 'findBestPathFromAmountIn',
      api: exchange[blockchain].quoter.api,
      cache: 5000, // 5 seconds in ms
      params: {
        route: getExchangePath$1({ blockchain, path }),
        amountIn,
      },
    }).catch(()=>{});
    if(bestPath) {
      return bestPath.virtualAmountsWithoutSlippage[bestPath.virtualAmountsWithoutSlippage.length-1]
    }
  };

  let getAmountIn$1 = async ({ exchange, blockchain, path, pools, amountOut, block }) => {
    let bestPath = await request({
      blockchain: Blockchains__default['default'][blockchain].name,
      address: exchange[blockchain].quoter.address,
      method: 'findBestPathFromAmountOut',
      api: exchange[blockchain].quoter.api,
      cache: 5000, // 5 seconds in ms
      block,
      params: {
        route: getExchangePath$1({ blockchain, path }),
        amountOut
      },
    }).catch(()=>{});
    if(bestPath) {
      return bestPath.virtualAmountsWithoutSlippage[0]
    }
  };

  let getAmounts$2 = async ({
    exchange,
    blockchain,
    path,
    pools,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {
    if (amountOut) {
      amountIn = await getAmountIn$1({ exchange, blockchain, block, path, pools, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut$1({ exchange, blockchain, path, pools, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn$1({ exchange, blockchain, block, path, pools, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut$1({ exchange, blockchain, path, pools, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin, pools }
  };

  let getPrep$1 = async({
    exchange,
    blockchain,
    tokenIn,
    amountIn,
    account
  })=> {

    if(tokenIn === Blockchains__default['default'][blockchain].currency.address) { return } // NATIVE

    const allowance = await request({
      blockchain,
      address: tokenIn,
      method: 'allowance',
      api: Token[blockchain]['20'],
      params: [account, exchange[blockchain].router.address]
    });

    if(allowance.gte(amountIn)) { return }

    let transaction = {
      blockchain,
      from: account,
      to: tokenIn,
      api: Token[blockchain]['20'],
      method: 'approve',
      params: [exchange[blockchain].router.address, amountIn.sub(allowance)]
    };
    
    return { transaction }
  };

  let getTransaction$2 = async({
    exchange,
    blockchain,
    pools,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account
  }) => {

    const transaction = {
      blockchain,
      from: account,
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api
    };

    const deadline = Math.round(Date.now() / 1000) + 60 * 60 * 24; // 24 hours

    const fullPath = [
      pools.map((pool)=>pool.binSteps[0]),
      pools.map((pool)=>pool.versions[0]),
      getExchangePath$1({ blockchain, path })
    ];

    if(path[0] === Blockchains__default['default'][blockchain].currency.address) { // NATIVE START
      if(amountInMaxInput) {
        transaction.method = 'swapNATIVEForExactTokens';
        transaction.params = {
          amountOut,
          path: fullPath,
          to: account,
          deadline,
        };
        transaction.value = amountInMax;
      } else {
        transaction.method = 'swapExactNATIVEForTokens';
        transaction.params = {
          amountOutMin: (amountOutMin || amountOut),
          path: fullPath,
          to: account,
          deadline,
        };
        transaction.value = amountIn;
      }
    } else if (path[path.length-1] === Blockchains__default['default'][blockchain].currency.address) { // NATIVE END
      if(amountInMaxInput) {
        transaction.method = 'swapTokensForExactNATIVE';
        transaction.params = {
          amountNATIVEOut: amountOut,
          amountInMax,
          path: fullPath,
          to: account,
          deadline,
        };
      } else {
        transaction.method = 'swapExactTokensForNATIVE';
        transaction.params = {
          amountIn,
          amountOutMinNATIVE: (amountOutMin || amountOut),
          path: fullPath,
          to: account,
          deadline,
        };
      }
    } else { // TOKENS
      if(amountInMaxInput) {
        transaction.method = 'swapTokensForExactTokens';
        transaction.params = {
          amountOut,
          amountInMax,
          path: fullPath,
          to: account,
          deadline,
        };
      } else {
        transaction.method = 'swapExactTokensForTokens';
        transaction.params = {
          amountIn,
          amountOutMin: (amountOutMin || amountOut),
          path: fullPath,
          to: account,
          deadline,
        };
      }
    }

    return transaction
  };

  const ROUTER$1 = [{"inputs":[{"internalType":"contract ILBFactory","name":"factory","type":"address"},{"internalType":"contract IJoeFactory","name":"factoryV1","type":"address"},{"internalType":"contract ILBLegacyFactory","name":"legacyFactory","type":"address"},{"internalType":"contract ILBLegacyRouter","name":"legacyRouter","type":"address"},{"internalType":"contract IWNATIVE","name":"wnative","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AddressHelper__CallFailed","type":"error"},{"inputs":[],"name":"AddressHelper__NonContract","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientAmount","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientLiquidity","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountSlippage","type":"uint256"}],"name":"LBRouter__AmountSlippageBPTooBig","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"}],"name":"LBRouter__AmountSlippageCaught","type":"error"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"LBRouter__BinReserveOverflows","type":"error"},{"inputs":[],"name":"LBRouter__BrokenSwapSafetyCheck","type":"error"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"currentTimestamp","type":"uint256"}],"name":"LBRouter__DeadlineExceeded","type":"error"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LBRouter__FailedToSendNATIVE","type":"error"},{"inputs":[{"internalType":"uint256","name":"idDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"}],"name":"LBRouter__IdDesiredOverflows","type":"error"},{"inputs":[{"internalType":"int256","name":"id","type":"int256"}],"name":"LBRouter__IdOverflows","type":"error"},{"inputs":[{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"uint256","name":"activeId","type":"uint256"}],"name":"LBRouter__IdSlippageCaught","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"LBRouter__InsufficientAmountOut","type":"error"},{"inputs":[{"internalType":"address","name":"wrongToken","type":"address"}],"name":"LBRouter__InvalidTokenPath","type":"error"},{"inputs":[{"internalType":"uint256","name":"version","type":"uint256"}],"name":"LBRouter__InvalidVersion","type":"error"},{"inputs":[],"name":"LBRouter__LengthsMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"name":"LBRouter__MaxAmountInExceeded","type":"error"},{"inputs":[],"name":"LBRouter__NotFactoryOwner","type":"error"},{"inputs":[{"internalType":"address","name":"tokenX","type":"address"},{"internalType":"address","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBRouter__PairNotCreated","type":"error"},{"inputs":[],"name":"LBRouter__SenderIsNotWNATIVE","type":"error"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"LBRouter__SwapOverflows","type":"error"},{"inputs":[{"internalType":"uint256","name":"excess","type":"uint256"}],"name":"LBRouter__TooMuchTokensIn","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"reserve","type":"uint256"}],"name":"LBRouter__WrongAmounts","type":"error"},{"inputs":[{"internalType":"address","name":"tokenX","type":"address"},{"internalType":"address","name":"tokenY","type":"address"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"msgValue","type":"uint256"}],"name":"LBRouter__WrongNativeLiquidityParameters","type":"error"},{"inputs":[],"name":"LBRouter__WrongTokenOrder","type":"error"},{"inputs":[],"name":"TokenHelper__TransferFailed","type":"error"},{"inputs":[{"components":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"int256[]","name":"deltaIds","type":"int256[]"},{"internalType":"uint256[]","name":"distributionX","type":"uint256[]"},{"internalType":"uint256[]","name":"distributionY","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"refundTo","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ILBRouter.LiquidityParameters","name":"liquidityParameters","type":"tuple"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountXAdded","type":"uint256"},{"internalType":"uint256","name":"amountYAdded","type":"uint256"},{"internalType":"uint256","name":"amountXLeft","type":"uint256"},{"internalType":"uint256","name":"amountYLeft","type":"uint256"},{"internalType":"uint256[]","name":"depositIds","type":"uint256[]"},{"internalType":"uint256[]","name":"liquidityMinted","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"},{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256","name":"activeIdDesired","type":"uint256"},{"internalType":"uint256","name":"idSlippage","type":"uint256"},{"internalType":"int256[]","name":"deltaIds","type":"int256[]"},{"internalType":"uint256[]","name":"distributionX","type":"uint256[]"},{"internalType":"uint256[]","name":"distributionY","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"refundTo","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ILBRouter.LiquidityParameters","name":"liquidityParameters","type":"tuple"}],"name":"addLiquidityNATIVE","outputs":[{"internalType":"uint256","name":"amountXAdded","type":"uint256"},{"internalType":"uint256","name":"amountYAdded","type":"uint256"},{"internalType":"uint256","name":"amountXLeft","type":"uint256"},{"internalType":"uint256","name":"amountYLeft","type":"uint256"},{"internalType":"uint256[]","name":"depositIds","type":"uint256[]"},{"internalType":"uint256[]","name":"liquidityMinted","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint24","name":"activeId","type":"uint24"},{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"createLBPair","outputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getFactory","outputs":[{"internalType":"contract ILBFactory","name":"lbFactory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"getIdFromPrice","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyFactory","outputs":[{"internalType":"contract ILBLegacyFactory","name":"legacyLBfactory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyRouter","outputs":[{"internalType":"contract ILBLegacyRouter","name":"legacyRouter","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint24","name":"id","type":"uint24"}],"name":"getPriceFromId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapIn","outputs":[{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"uint128","name":"amountOutLeft","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"},{"internalType":"uint128","name":"amountIn","type":"uint128"},{"internalType":"bool","name":"swapForY","type":"bool"}],"name":"getSwapOut","outputs":[{"internalType":"uint128","name":"amountInLeft","type":"uint128"},{"internalType":"uint128","name":"amountOut","type":"uint128"},{"internalType":"uint128","name":"fee","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getV1Factory","outputs":[{"internalType":"contract IJoeFactory","name":"factoryV1","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWNATIVE","outputs":[{"internalType":"contract IWNATIVE","name":"wnative","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint256","name":"amountXMin","type":"uint256"},{"internalType":"uint256","name":"amountYMin","type":"uint256"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountX","type":"uint256"},{"internalType":"uint256","name":"amountY","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountNATIVEMin","type":"uint256"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityNATIVE","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountNATIVE","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactNATIVEForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactNATIVEForTokensSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinNATIVE","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForNATIVE","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinNATIVE","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForNATIVESupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapNATIVEForExactTokens","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountNATIVEOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactNATIVE","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"components":[{"internalType":"uint256[]","name":"pairBinSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"contract IERC20[]","name":"tokenPath","type":"address[]"}],"internalType":"struct ILBRouter.Path","name":"path","type":"tuple"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amountsIn","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"sweep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ILBToken","name":"lbToken","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"sweepLBToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY$1 = [{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"},{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"LBFactory__AddressZero","type":"error"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__BinStepHasNoPreset","type":"error"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__BinStepTooLow","type":"error"},{"inputs":[{"internalType":"uint256","name":"fees","type":"uint256"},{"internalType":"uint256","name":"maxFees","type":"uint256"}],"name":"LBFactory__FlashLoanFeeAboveMax","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"LBFactory__IdenticalAddresses","type":"error"},{"inputs":[],"name":"LBFactory__ImplementationNotSet","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"_binStep","type":"uint256"}],"name":"LBFactory__LBPairAlreadyExists","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__LBPairDoesNotExist","type":"error"},{"inputs":[],"name":"LBFactory__LBPairIgnoredIsAlreadyInTheSameState","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__LBPairNotCreated","type":"error"},{"inputs":[{"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBFactory__LBPairSafetyCheckFailed","type":"error"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"LBFactory__PresetIsLockedForUsers","type":"error"},{"inputs":[],"name":"LBFactory__PresetOpenStateIsAlreadyInTheSameState","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"LBFactory__QuoteAssetAlreadyWhitelisted","type":"error"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"LBFactory__QuoteAssetNotWhitelisted","type":"error"},{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"LBFactory__SameFeeRecipient","type":"error"},{"inputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"name":"LBFactory__SameFlashLoanFee","type":"error"},{"inputs":[{"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBFactory__SameImplementation","type":"error"},{"inputs":[],"name":"PairParametersHelper__InvalidParameter","type":"error"},{"inputs":[],"name":"PendingOwnable__AddressZero","type":"error"},{"inputs":[],"name":"PendingOwnable__NoPendingOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__NotOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__NotPendingOwner","type":"error"},{"inputs":[],"name":"PendingOwnable__PendingOwnerAlreadySet","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds16Bits","type":"error"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"int256","name":"y","type":"int256"}],"name":"Uint128x128Math__PowUnderflow","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":false,"internalType":"address","name":"newRecipient","type":"address"}],"name":"FeeRecipientSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFlashLoanFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFlashLoanFee","type":"uint256"}],"name":"FlashLoanFeeSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"tokenX","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"tokenY","type":"address"},{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":false,"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"indexed":false,"internalType":"uint256","name":"pid","type":"uint256"}],"name":"LBPairCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"indexed":false,"internalType":"bool","name":"ignored","type":"bool"}],"name":"LBPairIgnoredStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldLBPairImplementation","type":"address"},{"indexed":false,"internalType":"address","name":"LBPairImplementation","type":"address"}],"name":"LBPairImplementationSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"pendingOwner","type":"address"}],"name":"PendingOwnerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":true,"internalType":"bool","name":"isOpen","type":"bool"}],"name":"PresetOpenStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"PresetRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"binStep","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"baseFactor","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"filterPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"decayPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"reductionFactor","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"variableFeeControl","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"protocolShare","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxVolatilityAccumulator","type":"uint256"}],"name":"PresetSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"QuoteAssetAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"QuoteAssetRemoved","type":"event"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"addQuoteAsset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"becomeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint24","name":"activeId","type":"uint24"},{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"createLBPair","outputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ILBPair","name":"pair","type":"address"}],"name":"forceDecay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllBinSteps","outputs":[{"internalType":"uint256[]","name":"binStepWithPreset","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"}],"name":"getAllLBPairs","outputs":[{"components":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"internalType":"bool","name":"createdByOwner","type":"bool"},{"internalType":"bool","name":"ignoredForRouting","type":"bool"}],"internalType":"struct ILBFactory.LBPairInformation[]","name":"lbPairsAvailable","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeRecipient","outputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFlashLoanFee","outputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getLBPairAtIndex","outputs":[{"internalType":"contract ILBPair","name":"lbPair","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLBPairImplementation","outputs":[{"internalType":"address","name":"lbPairImplementation","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenA","type":"address"},{"internalType":"contract IERC20","name":"tokenB","type":"address"},{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"getLBPairInformation","outputs":[{"components":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"contract ILBPair","name":"LBPair","type":"address"},{"internalType":"bool","name":"createdByOwner","type":"bool"},{"internalType":"bool","name":"ignoredForRouting","type":"bool"}],"internalType":"struct ILBFactory.LBPairInformation","name":"lbPairInformation","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMaxFlashLoanFee","outputs":[{"internalType":"uint256","name":"maxFee","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getMinBinStep","outputs":[{"internalType":"uint256","name":"minBinStep","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getNumberOfLBPairs","outputs":[{"internalType":"uint256","name":"lbPairNumber","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNumberOfQuoteAssets","outputs":[{"internalType":"uint256","name":"numberOfQuoteAssets","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOpenBinSteps","outputs":[{"internalType":"uint256[]","name":"openBinStep","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"binStep","type":"uint256"}],"name":"getPreset","outputs":[{"internalType":"uint256","name":"baseFactor","type":"uint256"},{"internalType":"uint256","name":"filterPeriod","type":"uint256"},{"internalType":"uint256","name":"decayPeriod","type":"uint256"},{"internalType":"uint256","name":"reductionFactor","type":"uint256"},{"internalType":"uint256","name":"variableFeeControl","type":"uint256"},{"internalType":"uint256","name":"protocolShare","type":"uint256"},{"internalType":"uint256","name":"maxVolatilityAccumulator","type":"uint256"},{"internalType":"bool","name":"isOpen","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getQuoteAssetAtIndex","outputs":[{"internalType":"contract IERC20","name":"asset","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"isQuoteAsset","outputs":[{"internalType":"bool","name":"isQuote","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"}],"name":"removePreset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"quoteAsset","type":"address"}],"name":"removeQuoteAsset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"revokePendingOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"setFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"}],"name":"setFeesParametersOnPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"flashLoanFee","type":"uint256"}],"name":"setFlashLoanFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenX","type":"address"},{"internalType":"contract IERC20","name":"tokenY","type":"address"},{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"bool","name":"ignored","type":"bool"}],"name":"setLBPairIgnored","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newLBPairImplementation","type":"address"}],"name":"setLBPairImplementation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"pendingOwner_","type":"address"}],"name":"setPendingOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"uint16","name":"baseFactor","type":"uint16"},{"internalType":"uint16","name":"filterPeriod","type":"uint16"},{"internalType":"uint16","name":"decayPeriod","type":"uint16"},{"internalType":"uint16","name":"reductionFactor","type":"uint16"},{"internalType":"uint24","name":"variableFeeControl","type":"uint24"},{"internalType":"uint16","name":"protocolShare","type":"uint16"},{"internalType":"uint24","name":"maxVolatilityAccumulator","type":"uint24"},{"internalType":"bool","name":"isOpen","type":"bool"}],"name":"setPreset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"binStep","type":"uint16"},{"internalType":"bool","name":"isOpen","type":"bool"}],"name":"setPresetOpenState","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  const PAIR = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sync","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
  const QUOTER$1 = [{"inputs":[{"internalType":"address","name":"factoryV1","type":"address"},{"internalType":"address","name":"legacyFactoryV2","type":"address"},{"internalType":"address","name":"factoryV2","type":"address"},{"internalType":"address","name":"legacyRouterV2","type":"address"},{"internalType":"address","name":"routerV2","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"JoeLibrary__AddressZero","type":"error"},{"inputs":[],"name":"JoeLibrary__IdenticalAddresses","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientAmount","type":"error"},{"inputs":[],"name":"JoeLibrary__InsufficientLiquidity","type":"error"},{"inputs":[],"name":"LBQuoter_InvalidLength","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds128Bits","type":"error"},{"inputs":[],"name":"SafeCast__Exceeds24Bits","type":"error"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"int256","name":"y","type":"int256"}],"name":"Uint128x128Math__PowUnderflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulDivOverflow","type":"error"},{"inputs":[],"name":"Uint256x256Math__MulShiftOverflow","type":"error"},{"inputs":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"uint128","name":"amountIn","type":"uint128"}],"name":"findBestPathFromAmountIn","outputs":[{"components":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"address[]","name":"pairs","type":"address[]"},{"internalType":"uint256[]","name":"binSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint128[]","name":"virtualAmountsWithoutSlippage","type":"uint128[]"},{"internalType":"uint128[]","name":"fees","type":"uint128[]"}],"internalType":"struct LBQuoter.Quote","name":"quote","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"uint128","name":"amountOut","type":"uint128"}],"name":"findBestPathFromAmountOut","outputs":[{"components":[{"internalType":"address[]","name":"route","type":"address[]"},{"internalType":"address[]","name":"pairs","type":"address[]"},{"internalType":"uint256[]","name":"binSteps","type":"uint256[]"},{"internalType":"enum ILBRouter.Version[]","name":"versions","type":"uint8[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint128[]","name":"virtualAmountsWithoutSlippage","type":"uint128[]"},{"internalType":"uint128[]","name":"fees","type":"uint128[]"}],"internalType":"struct LBQuoter.Quote","name":"quote","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFactoryV1","outputs":[{"internalType":"address","name":"factoryV1","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFactoryV2","outputs":[{"internalType":"address","name":"factoryV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyFactoryV2","outputs":[{"internalType":"address","name":"legacyFactoryV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLegacyRouterV2","outputs":[{"internalType":"address","name":"legacyRouterV2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRouterV2","outputs":[{"internalType":"address","name":"routerV2","type":"address"}],"stateMutability":"view","type":"function"}];

  var TraderJoeV2_1 = {
    findPath: findPath$2,
    pathExists: pathExists$2,
    getAmounts: getAmounts$2,
    getTransaction: getTransaction$2,
    getPrep: getPrep$1,
    ROUTER: ROUTER$1,
    FACTORY: FACTORY$1,
    PAIR,
    QUOTER: QUOTER$1,
  };

  const exchange$b = {

    name: 'trader_joe_v2_1',
    label: 'Trader Joe v2.1',
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABvCAYAAAA0YEQFAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAABPXpUWHRSYXcgcHJvZmlsZSB0eXBlIGljYwAAKJGdU9mtxCAM/KeKLcH4JOUkJEiv/waeuaJslP3YHYkgOWbGHkz4yzm8Klg0QEXMCSaY2qa7HsaGgmyMCJJkkRUB7GgnxjoRNCoZGfyIRlZcNVyZd8L9V8bwZf6irGKkvX8oI4wc3IXWfS808qiY1a5xTGf8LZ/yjAcztxSsE0SB+cMF2I3uylGHACYXeIwH/XTAL8BwCqShTNl9zSaztRNxepRV9BCRmTBbcQLzmPi9e+HAeI7BBVpWbESUSu+JFnhMxGWp+2ZJeoH7es8L3fPuHZTUWtk0lyfCOi9wGxcDjYYar9c//AFURzuIa5/UXVpFkcaYrbLdPPLJ/mDe2G/ezQqrd9UzLWOZV6QeVOlJ7Mrqj6kS49Fj5J/KQ05OGv4BiF6+ZwMoFgoAADX7SURBVHja7b17mB1XdSf6W2vvqjrv02+13tZblmyDLFu2wYAdwiMQM4GJHJhkbgjMmHxwYZJw79xMEi7tzP0yk3wkMxnu5Bu45INkJpCRZpLwGJyEEAmMjTGW8Uuy9bDe6m71u8/7VNXe6/5RVefRaj1stS0leH9q9TmnT1Xt2r+91v6tx15FeK29Yk0AwsgIAft57EDeTSvlSqUix2dna7cdOBAsxTXoWt/kP8YWA6fOHjzouKWpzWpi6qdC07jLMvrY2mkY2RMUlv3l6u9/v36113oNwCVsAhB27+ZJTKbTyO8yfviAP3ruJ4Og3FdO+Wh6DThiUZjSZ90g9QunC0Pfv1pJ1Nf6pv+xNBkZYUwczJTm5U2psOdfmND8RFibL856ZYz3zqOe8sFOCMcJIZIa7htV963J158UICRAXu51XwPwKpuI0NwvvbdYOXnknWT5X7CYt4Shr2szozJuzsv5YpXENYAOCWxhlUijELCcC28cHDN0NeABrwH4spuMjHDthReGK//bz71HU+qfM8utAqTCRgXzEyfkrDsjc8UGWW2IlIBYABIIAcICYdixXNlcbT9eA/AlNhkZ4ZkXfrSyfOzZ97PLHyLwRlJKwxoElTlMT7woJ9w51LM+GWWJlAWzgEnADDAJVMiARWl5vScERq+qP3ytB2RJBlWEZGTkFb2XkZERLn/gvu2lI8/8oaedH7LS/46Us4W01oCgWZ7FxORRe8SZRzkVwichwwCIAAKICJpFFAOqQdaCzmL79h9PCRQB4UsjHmbH+88/8tyqI3fe+Lra2HT/D4sZMlZsaGQqNOGpQPhskMud+6mZmfLLWWsEoGMf/yl3YNLZ5hx75mOkvQ8QqwwRA8QROCIIqiWMT78oR3WZ6q6BkBAAaAEsACUQJgFYABHohmpSiOexd6+92rH4B2NGiIDw4AhhZW2LhX1fc2LqvtH/9cMbJg+e7KlXGo61lmwEkgjBCtA0QAWCow7Rn4XWfuVdQOnKriWEBx90KkeeeSOA3yLmNxCzB1YUjVgMHgTN6jzGzh+Vw5hF2QlB2hKxQCkLrS2UsvCUEVdZuNqCA8HwM/kzuZL7vhWnpw5c7bj8gwBQRka4OTyzQSvnQRK8q/rCyczzX/obXZ2tkhGJUANgAElet44FIARfQD8wIp94L/AsRYKx6HVqo8eW2Wr1fTDyy9DqRtaOiiQtHiqmGDzAL8/J6fPP4yCVUFUWpC0xCxQLtDbQSuBpK642SCkDrSwwS1j2bP7bGv0/u+H48fmrHZvrWoWKgLD3D1K2fO4Xteh/Q5Dh6vOn1HOf+19crTaoE6z4NdkFnxEgELgCuZuI/uqrIu8B8GzXdR54wKmcP7+p8sJT7yfgg+zolXA1g1Q8JaITgbjVsWZpFmcnj+IZKaPMFswWDBFAoFiIYyFlEjhsobQIhQI97ogXqIfWnjleXooxum4BFBHClx4sGnPuPxHRPyURR6p1PvqVfVytNlpAESJxSsDsFK0E1PgtschaQ/Q7nxN539jIiPnlRx8d0J68ozR59p+zp98Ix8mQ40ZSJtQGDzF4BIgImrMTcnr6OA5IBRVloZVACAIWsIqOsQJyCKLYgpUIQSDzhOy8cw7s/OXFtMA/CgBFhOpf/OQqV+iPCHgbRDRMiKnvH6S58dkuKUtoXOdnyfsLzguQZnrzW7du+mDPI3//OpXP/ox23eWkNZPWgNaIiLkk/QCBWkxSrEVt8qwcnT8tP7J1qkfgiSGBQ2IViRDAIJAiEa0MlGNFsQiaIG/UNZma+58fP33+9FKN1XUHoIgQ/vQ3+lxLf0xEbwJEQSzQDHD+B4fRueYt/AHaEhkD1l7kiVAs5mXV+rXZ/lXDn9XptEuOJlIxcMTxt+MzWQuiZL0jWBOgMnlKDlfG5QlTp5AtNAtEAMUSKiWiInuPmGGVEtZaxGERMkLuaW2KU+n/Wsgt/6P7MXvV5sN1CaCIED77CdfmUp8iojdBrANrAWvhj8+hND5zUXXZOkcHYAwgnUphcPmgDKwcpuLQAGnXUVBKgTkCTukWKWmfVABumwnGr2Fu8pQcrk/LM0GNfBLRLAQWYRLLJFYRDLMlxYBWolhbcZQRDi3SJ5xqcSz9X4fQ85u9hw5VlnLMrisAgQfJpJ2fI2s/DEBHnEAAK6iPTSMIDHUSlE7QWiqUCFopDAz1yfIbVlFhsB9OyiNSCmACsQKYIYohxCBIpCo7T8yR1EEEQb2MuelT8lR9Vg6HDfJhRUVLpAgAIhFmGKVsoBRIKSsOi0rrQNzAhvnT7rHi+fTv1qreX/SeP1ld6hG7bgCUkRHGl+bWkPC/BsOFMZE1BwuIoD4+E2GJtmokAEKRaaYVI1vIYXjNCgysHEaqkCPSDqhF+zniJUQtdUkxYJH8xWeMtaiIhV+ZlqmZs3jaL8nRoE4BIKQgloSYRYhElIJhFsMsVrF1XW2Up8IJrylP95xO/a0edb++8czciaUiLdclgLHhzKFPH2HCBhijYAUQC9hIAmuTc7Cx3BEi15TSCinPRbGvKD1DfSgMDUAXsmQVxJcAsCFIOLlGzCojMCmJA4iF2BCw8doqFiJG/EYJk80qPd6YlwkTUkiwIAhDLDEJE0JX29Bzw6arw5qnTNVR9qgi+9ew9jvDwNltP6jXCPVXBLjrCkDcfz/jHRtuYMsfgNi26jSxeFiLoFKHBYiY4TgK+WwGub4CUsP9cAYL5HsKY0oh1AEEBrBEEICtBVkLismPslaUWHLEgolFFEEIqJsm6n5DAmOoag2NBU2cqNelbgRakWFCQ5FUlcKsVjitIIc9x55xdHA+44bjFIYnzpVw+hMPwcdVhoj+QQEYR7FhZx//BTCWQYRaNCXWmdII4GbS8HIZ8Yp56GKG9Loh+JtWwgz3wikW4BT6kM0PQKdyYC9LVmdgVWwWWAMThPCrJfhnDhJLCOs4sLF7xRiDqdGz8p3vPSLVStU3Ydg0QIUI55n5HAHHteLnlQRnmflshpyzU33Fcnn7ofDTI5CrjeldTbvmrjQBaPI/fzTbr7zvAnIzxFLEPAUILaQZIqg0MXZ2FmPzFZZ8ivK33ACvNw92XeRXbUFh/Q5wKgd2PIiNSEl0cxILsMBai8bMJGae3QcFiRkmINZAjIFYi9FzZ0vfe/TR35ienn40DZ5oVoO50p2r/M99/sBVRc1fyXbtARwZYayo3mIl3Adr8jA2Up1BCEsa4YqNUh9eR/VsD00ffJQ8qhIxoLRCz5ZdyK69GazTiNCIjO2WCo7NALEC4/uYeO4R+NNn4LguEpYp1sTCLmj6FjZV/O/pFRv/z41veceZaz02V9KuuQoFAMtyN3ybgrFAaABokdXbxWy9DVi2ll3W3Dh7mNJeAFgGxCK3chNya28BlAsJmgiqVYR+AzYMQaygtAtSDGtChM065k8eQmP8OBzFIM8DENkBzBoWQGAI6bWb4Q2seK9yU2smz537pcGVKw9f67G5XLv2AC5friQ8ejuFohBCZGidNdvvgl22limdYwui2uQo1U/8EAQLEQs3V0B+zU2wfoDy2BGUzh6BX5mHNSEoZpoUx6rFhoBYkAkgfgDjKOhMvsMOAYyxcJZvhdO3AkLsWhPemVLqQRH5IBE1rvUQXapdcwBL6vF81i9shpOxdscbrVm7TSGVUeRlyJKioDpP9fPHgKAWGdzM8HqGUZuZwPyJv4NtRp870mEGJOtgbCbACkwQRhrVWMAaQDmIAhWCcsOAqyFmZg4j3z+IXP8gBc3m28rl8u0AHr7WY3Spdk0BFBGn+e2v7ILfGAxvuMXY3iEX2iNol0hpQhggbFRhSpPJEQAIlbETkPHTERACkBWIWFgbrXdhELYFTAB0rYuAiAFBgwAEocXh54/Af+IpMDPShV7csOMurLp5ZyHd378BrwG4aKOJg/uyZ7/2mQ8K86/q/MBwLpP1HJ0iaA2wIhsGZAI/kjrrR75N1pCYrMAaWCuo1nycODOJyal5lKs+XK3heimsHO5Bf28BygZw4mQiLQBIWk5qsYJSuQK/WoWKPTrwGxh97nEUe3spPzhcFBEiouuSgQLXAEARoZPf+PyW0nN//x8lqL0VJKpZGiOVGxCV7YNiJdYaMqGPsF5DOHcO8KPYp8TM0VqgVPVRV3l859HncOjwSRCAFcuGMTDUh3ve//PIFQpgsajPTmH80I+Q9meQcwQAQ4yNgnUCzM7MR+YGEZTWMGEIv1rD6DOPNdGsvbj53buvW/CAVxlAgdChvQ8uc4P6n8CGt4kVBgMgQVidjdxaImRNiMbkSTTOPgtTm4OYsBVbtRYwBpieq8NdNoyJuSqstchnc/j5X/0VkBX0L1uGZq2ObP9y9K/eACedxejDXwO5iEmOAMQQhGg0GrGqJYxNVTA+PYeefBaOdpWET15rfC7bXlUADx3c67hP1f4fmHCnWGGBAJbiCHi0TlljqDlzBrXj34cEPsTaOFEhdv/HDudlAznUK2exfW0fTL2Cas3HN7/85+AghOd6KBbyeM8nfi0iNY0SMi4iu48QrZ1xdkTghxAR/Oj4KM5Ol7B25RqsuflWpFIIxZSva+kDXkUARYQO/c9/ux1if8aISHlu3tarVeoZ7CcvlQIpN+Ijfg21k09CAh8ARYZ5zPeJFaxE8QhXKzjZNN5wy3psXT2Ic+fncOL0OOZKPtKeg51vej8IgkZpFvXTh+AqaRMb2w4fERFCIxifLWHj1u3YduM2OFrB68kGbtVfkryVV7K9agDu379frTT+T0MoX6tWaXpskppNn9K5LLx0GuzlCCDUzx+Dqc0iTkdCJCqRQ1+S6JKJzARrozWtr6eAnkIOm9Yuw8xcFexmsWwgg/njT6M6fgphaRrKUJSgGXtfKPaMKa3AADylMHX6FJ6emsJNu26D6nHnqF4vX+8kRr0aFxGAmu97c1Y1Jz8p1mwozc5TebbM1lgU+3uQyhWQW7MDKtuD+rmDsLV5RJ6S2KZDlLpgrYVYC2Ns9Dp2kwWBgTUCZoVs2kNaA9XzZ1AZPYGwNANXUxSjFYkyxZSCyuQgAtSqNZTmS8i6DsSEKHiEDBpQtbmU9YP1L/79Nw5s/Mn7Zvbv339dgviqpNYTgGUFVgCtEhHy6z5FKpHgpVNQqTx0ti/yWSbgWWn7NePX1liYWPpMaBH6IcIghLWC0Bj4fhCBC4okNDRIpzW8tAPHVVAcO7BDHzAhWCkUiwUAwFBvFttuGMTaFb3IKJF6reqVG413hDb403vDsQ24DvzG1wxAACKhL5bYEyEyYUgCIFfMQ7sunMIysJOCtSFgwlZEXCSWvvgk1ghMaBAGJgKKNESlAScL6BTCUNCoNeHXmzChgesxPE8j0gECUgQiwBoL22yCFCOXz0I7TjQYzGAioThUH4YB1Rr+rZUg+Ff7Rj7oyXUI4qu1BtIsAAiFzEAml5FqqUK5njyYNVL9NwDsgElAjgv41Ygxttxh0XonIoDScAt9yAytg1PohxAjDAL4jRrCWgWN+WmUzryIsFZCLptFEleM0gMZlgSwFqZeBWdycFIu+gZ6MTE2AREBE0EgZEFgiBhjOAjDfwqk/t/9Ix88uW//yfDe/fsNrpPw0quzBoqQf+yQajTmfxoSrFMOi4hQsb+X3OIQCjfcDnIzINYIqjMwlZnowGSdA8FagUrlUFj3euRvuAmZwRVwMnkoLw12XSjXg3LTcPI9cIr9qFercNGE56qOhKU439MKSAxUKgOlXWhmTJyfitdIQvQPoCQTm8jNpHM/DOs47t40lNq97S77Z48//oqmSlxXAI6MjNDcRE1J8/wG69fvZiKkMmkorSmz6iakhzbG6X0AkUY4Px7lsxCB4rCsk+9HYeMuZJfdAC9bADtuO5eTFUg5IMcBs4JyXKQLPfAbPhxpgCMrsiUzBIK1NjIrUmm4rotapYZqtRbBFduazATWGm6uIIPbbzf9m7efDUr+rE4L79iWtw89fuyag/jqALh9u2quXu2Sl3qjPz96l1hfEYN0ukiF9W+EThdBrKKUZu1AiCIpFAsQoNNF5DfsQrp3OZTrxV6UyLiIVCtAzGClQNqBdlwo7UKUi3qlCmWb4NgUiRaxOPgbBmDtgl0P6bSHqYkZWGNAABRrKa5cT2vuvJdW7XyTyq5Yu11l8z+XHlymBXPPEHL++x5YEe7de+iaqtJXBcAVP/mT+uZB7YXp4gMGzrBUJjJETKnVr0dm+RYopVvqiiDQ6SI4nYeYAMwKmbW3wusdBmsnckIDre1dEkf+IgcZgVmBlAY7LpTjwbJGrVyBY5tgktiRE8NoJGKjngfHdUDMmJudByuNFTffTuvvfjsyfQNQXgqsHWLtOOyldjipnoni7OgLwFDwJ1/dH15LAF9xFioi1NvbS75T6COd3ub0rw2ameVNLi6X9PBWsHJBlMwjArEGKRde7yrk1u9CduOd8HqXg5UTSx6BlAIzg4hBTLCxnQi0wWXtwM3lkVu2GunlG1GnbJRm2kqXB0ACG/gozc2iVJpHvpCB1hrDN+7A6h1vgHJcsONBOR5Yq8h+dNyUKvR9OCwMFcPzdS9Ou7lm7dVgobR9+3ZYqr+OQEUmcrMrtvqpTNFxsr3EHEseRbYbmEFQABEUMRw320p/FxBYRV221kJIEJoQvh9GPlNEnhXiiIWQ0nCzOeSWr8Fcs4bmxFGkbD1JLAVACECoVBstf2vv6g1YveMu6HQW2ktFqplV7EwQWGOJlV6dXrn+pjW12vSevbv5fuxdsr0O1xWAIkKf//zn1e6d69ON7LKfEoijWLvZ4rDnZAusHBeEFuWL4nRATCDibczxVi8hQMVSSBBYiWzCeqWKY0/9CC8eOojQWty483as374d2nUiEqQc6HQOhdUbUQ6bMJOHwbHj3IBQDiTKZATB6hzW7rgbXr4IlUqDdUyKlIoz2wIQkYhopbzU0Jhv3Nz4sEZ7k9Sr3l5pFUo7d+5EWQ+uEqI7CVaTYsVuSmk3BW7T9PhXtDpxvL5BqUhtEoE5GkzW0Z6GaHOC4Id/9y18879/BSeOHcWWHbdBaQcnX3gBzVpUxUoAkNZwMnnkbtgGWrYZwg4sMSqhwAhBhBDCxcC2O5AbGoZOZaC1A8UaSukIRK2glANWKt45yGEmM4C02uqMvMIFFi7VXjEJHBkZ4b1799KOHTtYB/V7mGhYrGhiR2vHI2YVSV+8kYQWlLwhVmjtWlDR+hNJlILYENYazJw/j7mZaazbsAkz83PYsuNWZLJ5BM0Gmn69bccxwI4HN98DXnsLgv6VCObGwbMzcAVgL4P8ys3ILFsR2ZPKAbMGJ2utUiBrAQ1IYCFCDZbwfE/amszAKvr0Rz+KkZGRf/gAtlxNIth7//20fvly9srlfqSd+8CcI2il3JRyXA+aNSgqnAISQCj2liQbTJKtehTvKCKK1zZupUQ06nXc8RNvw6nnD+Lct/8O506ewKbtt8DxPLDWEdASObqhFJgIOl+ESqfh9i5DZo2Jz6vBXgrK8aCUhtIaRAqsGMTJxNFgQGwYComMKsE5k81COQ7t3bv3mhGZpZXAyJMhIw8+yG/56Edpol7nIVe9BUQ3A6ydVE45jktJzmYERnJsLI0xzZfYREh2yCbrpCQJuyAMLF+OMLRYXq9jePkKPPY3D+GGzTfCcR0wMywUWBgQRH5WYijtQJQGu1GkA2IjG1RHxzArMOsIOKb4fdRXa0OIiHXSqbEQTrky06T6qgqtXz/LuEbr4JLp7iRuJiK0bds2AoCtfX09IPoZYu5hpUgpxUo54JiwRIBxS7oiKhgnxBODmBPXVntLWEJ4mJEtFJHN59G3ciVuueNO1GZn8Njf/Q3CIOwiRaw0WEVraJT0Gxn72nGh4p8EtOg7HIPH8V7QuFCFiCjtmFxP/42ZzZt3ecWiBXqvBW5LC2AMHoAocAtA5fN50hnvToLcBZBiZiZW0feS3a/olEC09qJHZVhiczvezxf9ojg7jePB1dCOi1Quh7U33Yxd99yLZx99GN/52l+gUasD4Jb0MKsYSI1ERxMrsHLi3wzF0d+JGIzomFafABARpbI5h1gtZ+X9X/ldt24Ig/Oyc+cD18yldtWeGBGhB4loPyAjIyO8rLxMF9cVbQ+VC6l0/tesyE6ttVbaYaUdYqUi9QmOLIRkh2xiYCeSQ21yQ7HEtdGmOEgRHSdWQEohW+hBb28vjj33LM4cfxF9Q4NIZ3Nd52ivodwiUUwKrHUshRzbfhxLHrXsxvZnUETcJ6L6OD/wN/39/Uu6bfqltKtdAykWvdbOyTPeGbvzCCh7xx1vsdbeA2KHmCMB5EStRYdY25IFtCQzBig6OUfSyAqt7bQxU2LFkS1nAeU40GKRLuSxZtt29C1fjtNHjuCRh76B/uEVWLt5C3oHh5BKp9tslggWUTKwCXxIU5DKZOAoHUstdXQldgwwAwKOpJe1Vs67e3I9nzpz8MynV29fPXMtALxa9sQjGMGn5dPy4IMP0raD22jwo4O0eWBguS/NLxhj36K1o9O5PLmux452I4bHSUWIeGBioNBhF9ICSWz1NA4JtbKwjYUNDYIgQBj4sGEIYy2sCRE0fcxNTWLi3Dk06jUoreG6HrxMBql0Gtrz4HkessUeFHr7oHWkPkkl3qEkpJQw4IRZRRPQhAa+36yKmD+cmpv591u3bn3Vk6CuRgKjIR0BvvGNb6R37eozlW0IV9XrKpTmL4VBuEus1eylwMzExLF3pT1nEkKCWDKFEtaJLpXaWf1jYQ+YI8ml5PxaRwu7uHBTaWSLRazcsDFmohbWGhAxtBOZCxzbmwlY1NGHqE5MV5e71HikUZAVwcf7i/3N8fHx3x8eHl7yQgavCIAjAI3E5xgcHNT1es5Pp0FOLrfN98OfD0I/S0qRjmJ0xCpmmy0CEa1BUeWI5G+dc6Nr1NoIxqZEp90vMcFhpUEsMeYdBQvi322JTrw98bkTppuo8uT7aHOrjo50dIuhWEFE8gL5pLZspqenP9vf339FRfWuFYCt0d2zZw8Vi0UnfzrfuAOn5dzNa3saDfvrzVp9bTNoqN6eQdHa4WjhbxvgXa8XSCVwwduLdiPqSJwWH18D6KiudMGoU1zysR2KotYXOulwAhy1NsjQwvkEgATQKsqnCYKgIIRfl2a4ZXR09LdWrFixZNWYLtVethmxbfduAuDm83l7EAfNQ7mcrlbsR/xG451zpVlXQHAzaWJW1Ar9tIBDh51GCwSuY6Q6KPwFIHPbf8rMYM1gFQd1YxdY9D5yhUHFXp/EdEnUJbftxU493dWdmEDJAjUukeMWSms4jgMIcgL6gAv3/xs7dWq7iFzRVHy1AaTdu3cT7trtFosNPnv2rD84OEgb+nveFfrNX5mcGMuVyyX09A6I43iUOIM7Z3oLSOYLgEtUWXvgusegu/5ch5kR+0ujH449PYkkdqxlnIDXnhPdsHWbL93qtd2d1jGxe09pB67rgmCVRfhW18t9fWps6gNy5kz6lQTwJc+Q3bt3q1/dvdttDg4qAI17ABzNujf5gf/lqanzm48cfV7tvP2NdvmqtXAcj13XhU6oecvTodrgJSDFeqptvNOiAEbZanH8EBJt2ERUE8gmCMeZbC1lKJ2HL8KGOr5CHRLfpV5b62o3o5J4coiJ3HJh4KNerwNM4nmpuTBofrEy3/jsDVtvOE1ES27wvyQJFIA++q53OcXBQXXkyJEmABxKq81BGHxubm5m09PPPqX6B5fZwWUroZXDWuuOtYlic4FbAdfu6DgtUFsLiUy7da1pMWOlyLqO3XRoGfotPNEpvR1iFFuw1MF82+67topvseP4aGmB3hFNAUFpB6lUCjYMqVqa7wXUv8r35L4xcWb8l1984oniUqvVKwZQRGj/F7/oDd1wg8bkpD82NiarHGeLCcPfn5me2PHMM0/qQqEoN998m6TSGXZcF1o7bWoeu6uYqRu4hai0Bo0Wwa/9txbFb4Wk4n6250PbHYf2KbskqEMDJKBRp1Zo4Ucdxyffb58m2sIRM2vFcBwX6XQWYgVz05PKBP52x3P+Q2HFqq9Onh7ffeqZU70isiRuzCueDXv27HG3Dw66GSD84eRksLk/PUza+6Pp6Yl3Pf/CIW0guPvNbw1XrdnIruOyVgqcOKSZo5CNUh21y9DSnC1Wl7xoObnRITaJ1EirLEjynpnjilxx2oMgSsfv+E5ymeijWHa6vC3o7EiyIrcBi7FvCXF8nfahSXGi6NrWGjTrdcxMT6E8P4/+wSFkiwUBcRnGfN8E9svloPrXTz755PT999//siMZVwTgvn37dJ/ve+MA3v72tzd++M1vDnLK/MH05OTPHn3xmNP0m9h5+xvCrdt3kOumlOc6bUcwYs9+zAzb7rIYwNbLLtG5iAQirnYnsRTadoZZ/HGSwS1dmd1t0LrvvgPARJV2I9hhU3ZMoNY8ko7jbHuSxH00JkSjVsPo2dOYPD+OoeEV6B0YRLSdTjVJ7DFr7TfYBP+zXi6/uGpiooR77jEdk+uyKYuXBXDPnj1qFVa52S1lDh476fONq3ua1cbnxsdH33Py9EllrcWWG7eFO3bejUw2rx3HgUqi6Uk4iNuUHZ2mxMLB7Mwa44t0rbWYLWSn0WDaZN2zFlY6ddzCk3RKW7ckJkSqzYgTe7BdybcNZrx7I9nGmKRHxlnlJvRRLpdx8sUjOHf6NIrFHvT2D6K3vx/pTBbKcYRBJQs5BsFThPDA+dFTj5899qOj7/qFT1zWIXBJQ35kZIQHBwedIprq4OF5f83qgWWV85N/cG7s7D+Znp6GcvTM2nUbajfdcsdAJpvzWuB1UvBWTC9ZsS4cw04ic4VW/ALrOmaCHWAkZSijXbkL3HdygcjFf0u8ROj6W+dm0Bbr7HTRmJjxCrUFlaJMA1YOMpks1qxdj/LcPMZHz2FifAyO5yKdySCTyZHneQVifr014abA92+sVmYrdGzm+SsZhouOlojQsYcecrNDQ+p7x4+HXrO0pl6b+y8TkxOvbwbBiUw6+/CGDVsqW7bd8v5CsW+DE697iaM6CYomALbSI7qYZ/JfO8oOoF1w9WK9W7TqawRIi3HGW9LiGDG6tmhSW4qoY52LLk0LVPuCF8n6K+1OWGu7TZFkmRABxf7XZqOBmZlJPP/0U6XRM6enQhMSWVtnpefZ4ZNk7DEmfrruV55wBteMfuQjH7mix9ItOkQjIyP89m3bPKwC/vZvDzW3YZuu9h9bf2b0zLLSrD/d01+YvfctP7F91ep1v5PLF16nHVfr2MaLNE4c8+N2xSQkOS/JzcXSIgl4CYDRptsrl8QFllWn1pQOwiMLV9suSWwPRedVW1vyF3YlVtOJCjVhxEEoyRoXtCMaSaEhE6Jeq6FSKZXOnTj+rw8+/fRD5cZkTSpUL5RK/tiKFWZkZOQl24kXjNLIyAh/+O1v90pnz5ptu3cH8fbils756h//bm54w86bVixf/rupdPYurR2ltSbVSkWI7L5u53Xb+I7WtwVTekEc8KIE5mKtRVTQkoT2285NLdH/CW4tUDsO6Lpspym60NvWsR4aYxD6fmw2UfteE3dfUvc78NGo11Apl06MnTn94eCxxx6+d2TkqlLzL4jI79+/H8XVq839H/tY+OCDD7ZuZffu3eoLXxjxVq+59fVDQ8O/l0ql79DaUcyKiJmilAUVbzJpkxVWsZSJtEyILnusa92jlw7ewlGnhW873G1E8TqJlgboOn6h5uaLXKNzOhBAxDAmSnWM9nm0swU6yRC319herd3b5z338fU33jh2Ndu3r2SoCAA98fWvp4Y3rn1dKlP4fVJqJzPrKMquIn9nC7wkVYFjdRLta0+iEF0ZZq0rXJ7EWGMjqb5U65Ak6ViTFosntr0ycgFJXbQHnYuhLBT3KMW/Uasim81F+xlNvMZyh9FvLawxaDbraDTqUpqd2Vebnf3QrW9966mXC+ClRoQA0J49u/mJr389Nbxty71etvinynFud7TjuNplR7vkOFGUnVWUvcwcVYc3YQDTqMGvVWGNaQ/wRQfr4nNJRNCoNyCXm6fU/XJRxnvBF+jys7jrCwvYUDwZFStAgEa9Cq1VpIUgceG9+ByxPew4HjwvRblC8e5sT8//sW/fvtTLBXAxM4KAaFMmAH7bpn+SM/29HyNWv+I4bp9izZFLLM5Y7jAVQNEDMkyzCeP7sGJhxMJTGox47etaS7op/kVBFKBULkEphpe+zL12WAidQdnOz4CFQtn97gK8F6WkbRYrcUzSdT2Mj56B0i5S6QxCCeLUD4BUYlYJtFYgeIBYV6z54Apjnn3ic5/74m1XyDwvCmDiaL3//vt5165dete2beutps+4TuodjuMoTthlkjeiEm+LRLko9TpCvwljwpj5xfZth1HeokQxtW+N6yXWvjAMETSbKJdKcD2v63wXBRAXas5FNGnH32KJudR5k5edWhRt9qldF6lMFmdOvoj1W7ZCOxphGMZ1bdpEO1pmFERSgCBnrfk3uO225wF87xJdXLR1kZhDhw6p3btBb33rJ7LrBvo+4LjeF7xUdqfjuqy0BmsNav2o1i5X22ggqFcRNJswxrTAS+7b9TJdUtqeyB3mwyUAbDaaKM3PAyJwXC8Knl5K7y1up18IxIL3nW8vdRwkYtcXMFYQtNI4d+o4IEChtxesuP1MvA7exorBxHHpE+qxYm68/773/MUf/7f/9pKeLa+BWPL27uWzd93lVsbp3VkPn+J88SZWipMQkCQMUgQ2CGADHyYIYMKwDZpE5TxaZUEg0EoLqST7MLnpTj2HFju8WKtVqwjCAI7rolqpQGsNx3MufWedIHZ61Bao0sUPuoQaRfcq0GK0Mb11XRfFnn6cOXUcmVwOvUND0E5UBVGsdPWLHQWIhuu5CG1m1/CqFf/+iSee+Nhtt912xapUiwhPHT6cLbz57vuGU96vkvZeT9rRrQcdxixSmkGkJk0Ia6JK7zb2SNgOoza6sWioxNiq9hwmUKYjA6U9DIk5cQnwjDEol0qo12rwXBehcVCtVlBweqLQ1KUAvAhgnTb8BfZ8vKpdeD5qr9vo2IjT4dAGIi9M38CgjJ49RedOn0Qqk0Emn4eChsQ1TpMZRQDYceBaiyAI2Hrpf9YXmG8B+B+4QlWqQSQDImE4O3sKjveX1oR+UKlvBWwOVrSIMBLHsACC2G3U4Y1vxb6jBc4KMGWNfViTPO54qV8HUYYW1VVdXHHR1mw0UK/X4Ad+tJ5YC9/30ajVkMlmr0yVom12LuYLX+ge7TYVkhbrvm60u126AMCMdDZHuXxeJsZHiUBYv/VGZPL5aPu4FUAMOk0R5blIWQMrNg3m337yu9/df+ub3zyJK2gLtQRhzx4+f+ut/Y5S66FoGxHfKNauBaMfQjnA9gAoEMiVyIvcFGBGrD1FpJ4ByRN+YA94E2bWW5P+kJsv/B4p7VAc30s8/clP4nRebLqJCKYmJjB67hyajQZ6enuQzxeh45IkhZ5eeCn30nfYaRsCXQLTiYUsduBCBpS8WBAHbIe0Yo0UGoyPnrNPPv49Tnkp9A8OYf2WregZGGz7hWMNFjnGLcQIGtUK/MA31XL5yyfOn//Qvffee1kvTRcLJUAQBRcn4p8fxE5fPnbsmM7n8zrVbLohcyYwxtVK+WZuLnQymcZYo1E/uG2b2Q1YIpIzBw/2Zdzi64kjiwhdaqdDfV6ihWGISqWKMAi6UyII0fOUymVoVYRyLhFU6VClCWgJE75AlS48kDpAXChqrc+pG1xEarSnt5dcx5NypUwgQRgEWLthE4ZWrgQrBWgFNtHyRGBAWXjpNKy1KpPL7d5I9Fci8lUiumSw93J5oRIHFk380wRQBTB7yYNEeG701FqlnR0Uh9a73FaL0b8LTgJUK1XUa9VWCSzT4RAQAIHvo1KpolAsXN60WABi559kkdeLfqFrYNoTocMyamkV10tR/9CwmX7hOSUCGCPwfR/z83NYs2490rkckGTOWQsIQzkOUpksUKumkM///qmjR58XkcOXSoZ6RfZ279+/30276TtYqXXdGdedA3NpAIMwxNzsLALfb41kFLaxLSQEQL1WRaNWXzzb7CJAXta06Hp3cZJ1UZuSIo/L8PKVZEXEbzZRrdYwNzeL08eO4bknD2BybCxipUyAVpFZphjac5HOZuFqvbaQzX154syZdZfKn1nyPfIiQtPTZ/uV9t4GVtmOaAba9h5d7hwol0qo1SpRSazYf2qtbWVUSEucBKXSHJRWcFPepcHr7kk79BN/sHjmxSJk5gpcyESEnr4+cl1PqpUyJSGtMDTwwwC1ShnLVq7GyjVrkSsU4tipAligyINrLQW+/zpi/vyZ5449ICInFpPEJZfAvXv3cl5n7iStdlGS49da+jqc1pdovh+gXJqHCaI1PAkS26R+aMxMRCwAhjEW83Oz0c7cl9AWavJ2lOKCb10cs0UtjmiSul6K+geWWd/34fs+/KYP32+iXq9jdn4eLx45jAPffwTPP/0UpsbGEfjN1sNN3EwaXiZNjuvemx8ofGn6xInbjh49esEMXXIAb9+0KU/a+WkwL2tTTbTtPb6M9FmL0vwcatUqjLVxDc9opKLdRUlwNhlpC2KC7/soz8/HZZgvhdiVgXjpTsol9Gf7t9Iaq9esMbV6E34QIAxDhIGB3wzQqDdQrdcxMzuLY0eP4MAPHsOPHvsBzhw/jmqpDGMslOvCSaXIS3l3O7n8n/dmMv/yzMGDfSKiRkZGWABa0lppMjLC2fe86yZm/UlSqh8JAQXa26ovKX2CarmKmakpNBp1JCqXEO3CtVaQTqehdLIBkzoIbQSiYobrehcHoYMIXwDaAmHripRcJMfiAqml5E6iNxqQhx99pNRs+g4ROLGbrbEw1sAag9DYSOuUS5gcP4+JsTFUKxWYMIzj3QyldK9ifqeTytw5Pz3FG9dsHf+LW29uLNkaKCI0M3Msl7f8z+DwKihFLe5PV7b21Wt1TE1OoF6vRZgTwYqNJI4JEprYdadiL26SYyOxcDPKpRKIGNlc9rLXW+j4BjrMig7m2nrcAeQCQ771nQTE+E9MBEsCL53VG9et/+tvfutbY4MD/XcN9PRsTmfSvZ7jstYOlFJQ3N7TwaxQqdYwNT0DrY8glUrBdT1RWhsAvmIayGayG4w46c1jm2UpSQwV3OHXk1LvgdKRo5I6wesesIUt8H3MTE2iVqu2iAti/KXDcDbGwJrIdkpyf5MAMXFEdCrleTAT0tnsFfS6u08LCU13OuhFXd0XOLYTraAdTZvWb+wZm/zyvztx7Mzn1qxbsXpoaOj2Qia71Us5y1zXHdJKDzJRXintaVaktAYAw8R1MNeJ6CRgDxhrH/N9/wdqNDv28f/0cZ/eSksDoIjQ3NxcIe86v0hKrYrqFndMy8sY7YEfYHJiAuVSGcaErXR8G9fNTiSNiBGayA1lrQGDIHHFpxbjJ4IxFuX5eRAzUqnUlUkiLgRyoTTKJda9VpbhAs8OEaHYU1y/7YZN+rtPfO3E//irx4/u3Lnzu/fddx/19fXR6dOndY4oz8z92nX7WCkjgWkyuTVrTN3J5SrMXC2VSkGc9CQA5BOf/QSApTMjVMZ17yFHvRsqLifYGQa4yAAKgGaziemJCZRK8whMgM4dQEmEgwQt8mNM2DqfjR9THpXlas96IkFoDebnZkE9vfDSV7jD6xLS2ML4Qu25SFip00wRZHO55W+849b0f/nTP64BkAMHDgQHDhygkZER+sxnPuMDqAEY7zqsY95cqstXzUKjtW9muVLqfwfxQPf9LGALHURARFCv1jA1Po5yaR5hGCIpTB5FOCKmR3FRO4CEiIIwDKcBCKsoHmmNgRXTZcgnmzhNaDA3O4tGrYbL52N0A3DBR/G8Wrih+HK+dAIhk82lV61YsR7dSZDSKVELRiiZN5ft9NWbEWNj6Z5c5hfBdFcc32nTs4sEG6yNDPXpqfOoVCux2mwhGyfmIp6GJCIwInaCCH8Eaz9ujDmWLK3RE1yiJ3vaJJBMreLlMMagNDeHZuMlPIhzkX53mhddm0M7v7dguKOtIQwvlVLZfH7dVY/1Iu2qzAjZs0c1b7rpzcrRv0PMPWiVB1zsy9EvYwzmpqdRmptFrVaN0i/aaERpGK11RACiQKx9WhR/cmJq6gt13z/U29f3rKPUu4k5I7G0tpfZ7lo0BIEYg6bfhOu4kYa/vCOlA7UFbxf4Ilq0ZlHThOInhlqqVSpHhlat+uZSPwHmZa+BIkLNUmm99tzfBPEgRPiSAyMCv+ljfm4WlWoZzUYjck4nMznO3kr2/QGwpNS8GNljQ/rDZ5576liSbi4i+04dP/6LrPjPWHExeYy4BSLTU9rqK0HWmBBzM9Po7euHk3oJSWCXWRcvRWwgaO3M0kqvQueDoJaovWwVOj8/38Pp1G8S0RsQBYYvEtQDbGhRq5QxPT2BUnkezUY9SjWkuLCddBcQIKBJpJ4Ua3+dmvVPPfPCM8ceeOCBVliFiOza9esfQmh+hUCTzBzvSIoM5KT8cmJMS5wJHgYhZmdn4DeaL+1mL7MuLprWmjiL4qw9VrRm2+Dgy04fXDIAI2f1dCGbzf6WIt4NUHdEtSP13IYhaqV5TJ4fxcTEeZRL82g267DWQJham0Raj7YV8Ql4HuD/W3z87PmpqT/Z8aY3TX3kIx8JFjpyiciu3rDhT3xr3w8r56JE4ujJZBI/JCvhAdRB6YJmEzNTkxGxeakgLqJSLyh8sNBfQVEVDddLLwM3i0sN4MtRoalsNvsAET0A4AJ+LtYibDbRqNdQb9TRaNTR9P0ol6YlaSxiheKNJyIC31o5CcifK+av3HLbrS8CMJd77Ftc3nLfcwcOfCiVyfxH7TpbrDEskOiZuDZOV2w9tTMa4TAMMDs9jaKxSOeyHWVGXl7rijEucLklTgblOG5K5XoAnHvVAWxtzB8bS9sgeEAr9RuwNicxYMYYmMBHs9FAs9lA0/cRhpHz1hjTofQj21CMNSKoCHDaWnmSrH0Y1n5XXPfU615CRlYC4p49e769YmDFeweGen7P89x3W2uVRdgqwdXygnXEi4wJMT83A7/ZQL6nB7H348rQag3MAhBxoUEPRBl3qVTK6evt7VtK8K4YQERsVXzXXduYn79XjJk1Yo01YSoMjWutUUEYUmgCBKGBtdZGoR4ARIZAgYg0IJiAkSMCeoyIfijMx2XMTNz607c3rqYER7zH/PBjjz32QNGmfttzvZ+3BhmxlpglrgbVMeiSgGhQrVYQhCEKPT1wU6krJqhdqHW8Bbpdf4kHyUunHLenZ3CpAbyi/naUxuCTJ0/mfX8+mwlNusmZorbBUGCp3yDIh0ZSzAoWxrfWhgQVWIsSEM6yqElOmYmJiercd77zHf/l7IW7kvbEE084Web3OKnUb4OwiQhOUoW344bapZtje1FrF4VC8eWr1MUSoBKRtBZBo25PPvP0L9/45jd/AVdgoF9puzrlH5+jwwuy2Pmitf1Vfozpi88/v1lgP0ZC7wZhLTHrVlmtJL3QJmsjRVnSSiFfjMo4dwF+JW2xQH0HoTNBgHOHX/jUuq997XdoCSfvUgB43bajR4961vdvVyT/kojeTsRDxO1K60kxBMRPjImCx4x0Nouevr7WjuOraolTwhjMnjv7h4Pr1//aUlZselUfQ/5qt02bNjUBfO+Jb33r2Z4Vy94AkV8Sxfcyc1+UyxcZ+mIjb401URjLzM8j8H0UenqQymSujqW2DHqGl8sNff7zn1dYQmP+H7UELmwn9u1LhQMDdxLTB4jonazUShFR8fN2244gAjFHRWFTqTTy+QK8qzU3BAgazUcPHn7+bbfddttLNEIv3n6sAEzavn379Oq+vq2i+YMs+BkAayGWbRiK5bjCAhERxZWGtUImm0UmGz8yXeuXC+YppdTtRHRFafNX0n4sAUzaiAh/+OnvL28a771Q/D4huYVEstZC2WiPC8fZGsSOhoqfNZHNZpDO5uCkvJdKduaNMW/wPO/QUt3DjzWAne3gwYMuyuWNjsN3MPE91srtRDRsjc1StLmOhcCsHSjtRLuKUilkslmkokfwXD7yD4QA3qe1/vpS9fs1ABdpIkIvfPvbfZxKbSPGHZbVbQTZAivLiFBkJo+Vw6QdUo4TPfbA9eClU/AyGSjPjYupX3hqa+0nXdf9D0vV19cAvEyLnRj6kUceSS3TQTFs8hqxwRom3iZMNzLzBlZ6kB2voBydUo6rteOSk/LIy+bgpqIHcVE71v1nDz/88AfvvYKdR1fSXgPwKlpUCBDuULGYb6bTA47COiu8iR21WbFew1qvIKX7tdY5N51yUpksa9edViZ8pzcwcEW10C7XXgNwaVvkldq/X50ENHp6Us1qNQMgT46TMlapdCbtmGZ1dOOuXWeW5ILX+o5/TFprnBMfLC2RP/T/B96QkmdPWpSQAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA3VDA5OjE5OjA4KzAwOjAwC8IICQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wN1QwOToxOTowOCswMDowMHqfsLUAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDctMDdUMDk6MTk6MDgrMDA6MDAtipFqAAAAHnRFWHRpY2M6Y29weXJpZ2h0AEdvb2dsZSBJbmMuIDIwMTasCzM4AAAAFHRFWHRpY2M6ZGVzY3JpcHRpb24Ac1JHQrqQcwcAAAAASUVORK5CYII=',
    protocol: 'trader_joe_v2_1',
    
    slippage: true,
    
    blockchains: ['avalanche'],
    
    avalanche: {
      router: {
        address: '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30',
        api: TraderJoeV2_1.ROUTER
      },
      factory: {
        address: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
        api: TraderJoeV2_1.FACTORY
      },
      pair: {
        api: TraderJoeV2_1.PAIR
      },
      quoter: {
        address: '0x64b57F4249aA99a812212cee7DAEFEDC40B203cD',
        api: TraderJoeV2_1.QUOTER
      }
    }
    
  };

  var trader_joe_v2_1 = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$b, {
        scope,
        findPath: (args)=>TraderJoeV2_1.findPath({ ...args, exchange: exchange$b }),
        pathExists: (args)=>TraderJoeV2_1.pathExists({ ...args, exchange: exchange$b }),
        getAmounts: (args)=>TraderJoeV2_1.getAmounts({ ...args, exchange: exchange$b }),
        getPrep: (args)=>TraderJoeV2_1.getPrep({ ...args, exchange: exchange$b }),
        getTransaction: (args)=>TraderJoeV2_1.getTransaction({ ...args, exchange: exchange$b }),
      })
    )
  };

  const exchange$a = {
    
    name: 'uniswap_v2',
    label: 'Uniswap v2',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQxIiBoZWlnaHQ9IjY0MCIgdmlld0JveD0iMCAwIDY0MSA2NDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMjQuNTM0IDEyMy4yMjZDMjE4LjY5MiAxMjIuMzIgMjE4LjQ0NSAxMjIuMjEzIDIyMS4xOTUgMTIxLjc5MUMyMjYuNDY0IDEyMC45OCAyMzguOTA1IDEyMi4wODUgMjQ3LjQ3OSAxMjQuMTIzQzI2Ny40OTQgMTI4Ljg4MSAyODUuNzA3IDE0MS4wNjkgMzA1LjE0OCAxNjIuNzE0TDMxMC4zMTMgMTY4LjQ2NUwzMTcuNzAxIDE2Ny4yNzdDMzQ4LjgyOCAxNjIuMjc1IDM4MC40OTMgMTY2LjI1IDQwNi45NzggMTc4LjQ4NUM0MTQuMjY0IDE4MS44NTEgNDI1Ljc1MiAxODguNTUyIDQyNy4xODcgMTkwLjI3NEM0MjcuNjQ1IDE5MC44MjIgNDI4LjQ4NSAxOTQuMzU1IDQyOS4wNTMgMTk4LjEyNEM0MzEuMDIgMjExLjE2NCA0MzAuMDM2IDIyMS4xNiA0MjYuMDQ3IDIyOC42MjVDNDIzLjg3NyAyMzIuNjg4IDQyMy43NTYgMjMzLjk3NSA0MjUuMjE1IDIzNy40NTJDNDI2LjM4IDI0MC4yMjcgNDI5LjYyNyAyNDIuMjggNDMyLjg0MyAyNDIuMjc2QzQzOS40MjUgMjQyLjI2NyA0NDYuNTA5IDIzMS42MjcgNDQ5Ljc5MSAyMTYuODIzTDQ1MS4wOTUgMjEwLjk0M0w0NTMuNjc4IDIxMy44NjhDNDY3Ljg0NiAyMjkuOTIgNDc4Ljk3NCAyNTEuODExIDQ4MC44ODUgMjY3LjM5M0w0ODEuMzgzIDI3MS40NTVMNDc5LjAwMiAyNjcuNzYyQzQ3NC45MDMgMjYxLjQwNyA0NzAuNzg1IDI1Ny4wOCA0NjUuNTEyIDI1My41OTFDNDU2LjAwNiAyNDcuMzAxIDQ0NS45NTUgMjQ1LjE2MSA0MTkuMzM3IDI0My43NThDMzk1LjI5NiAyNDIuNDkxIDM4MS42OSAyNDAuNDM4IDM2OC4xOTggMjM2LjAzOEMzNDUuMjQ0IDIyOC41NTQgMzMzLjY3MiAyMTguNTg3IDMwNi40MDUgMTgyLjgxMkMyOTQuMjk0IDE2Ni45MjMgMjg2LjgwOCAxNTguMTMxIDI3OS4zNjIgMTUxLjA1MUMyNjIuNDQyIDEzNC45NjQgMjQ1LjgxNiAxMjYuNTI3IDIyNC41MzQgMTIzLjIyNloiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTQzMi42MSAxNTguNzA0QzQzMy4yMTUgMTQ4LjA1NyA0MzQuNjU5IDE0MS4wMzMgNDM3LjU2MiAxMzQuNjJDNDM4LjcxMSAxMzIuMDgxIDQzOS43ODggMTMwLjAwMyA0MzkuOTU0IDEzMC4wMDNDNDQwLjEyIDEzMC4wMDMgNDM5LjYyMSAxMzEuODc3IDQzOC44NDQgMTM0LjE2N0M0MzYuNzMzIDE0MC4zOTIgNDM2LjM4NyAxNDguOTA1IDQzNy44NCAxNTguODExQzQzOS42ODYgMTcxLjM3OSA0NDAuNzM1IDE3My4xOTIgNDU0LjAxOSAxODYuNzY5QzQ2MC4yNSAxOTMuMTM3IDQ2Ny40OTcgMjAxLjE2OCA0NzAuMTI0IDIwNC42MTZMNDc0LjkwMSAyMTAuODg2TDQ3MC4xMjQgMjA2LjQwNUM0NjQuMjgyIDIwMC45MjYgNDUwLjg0NyAxOTAuMjQgNDQ3Ljg3OSAxODguNzEyQzQ0NS44OSAxODcuNjg4IDQ0NS41OTQgMTg3LjcwNSA0NDQuMzY2IDE4OC45MjdDNDQzLjIzNSAxOTAuMDUzIDQ0Mi45OTcgMTkxLjc0NCA0NDIuODQgMTk5Ljc0MUM0NDIuNTk2IDIxMi4yMDQgNDQwLjg5NyAyMjAuMjA0IDQzNi43OTcgMjI4LjIwM0M0MzQuNTggMjMyLjUyOSA0MzQuMjMgMjMxLjYwNiA0MzYuMjM3IDIyNi43MjNDNDM3LjczNSAyMjMuMDc3IDQzNy44ODcgMjIxLjQ3NCA0MzcuODc2IDIwOS40MDhDNDM3Ljg1MyAxODUuMTY3IDQzNC45NzUgMTc5LjMzOSA0MTguMDk3IDE2OS4zNTVDNDEzLjgyMSAxNjYuODI2IDQwNi43NzYgMTYzLjE3OCA0MDIuNDQyIDE2MS4yNDlDMzk4LjEwNyAxNTkuMzIgMzk0LjY2NCAxNTcuNjM5IDM5NC43ODkgMTU3LjUxNEMzOTUuMjY3IDE1Ny4wMzggNDExLjcyNyAxNjEuODQyIDQxOC4zNTIgMTY0LjM5QzQyOC4yMDYgMTY4LjE4MSA0MjkuODMzIDE2OC42NzIgNDMxLjAzIDE2OC4yMTVDNDMxLjgzMiAxNjcuOTA5IDQzMi4yMiAxNjUuNTcyIDQzMi42MSAxNTguNzA0WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMjM1Ljg4MyAyMDAuMTc1QzIyNC4wMjIgMTgzLjg0NiAyMTYuNjg0IDE1OC44MDkgMjE4LjI3MiAxNDAuMDkzTDIxOC43NjQgMTM0LjMwMUwyMjEuNDYzIDEzNC43OTRDMjI2LjUzNCAxMzUuNzE5IDIzNS4yNzUgMTM4Ljk3MyAyMzkuMzY5IDE0MS40NTlDMjUwLjYwMiAxNDguMjgxIDI1NS40NjUgMTU3LjI2MyAyNjAuNDEzIDE4MC4zMjhDMjYxLjg2MiAxODcuMDgzIDI2My43NjMgMTk0LjcyOCAyNjQuNjM4IDE5Ny4zMTdDMjY2LjA0NyAyMDEuNDgzIDI3MS4zNjkgMjExLjIxNCAyNzUuNjk2IDIxNy41MzRDMjc4LjgxMyAyMjIuMDg1IDI3Ni43NDMgMjI0LjI0MiAyNjkuODUzIDIyMy42MkMyNTkuMzMxIDIyMi42NyAyNDUuMDc4IDIxMi44MzQgMjM1Ljg4MyAyMDAuMTc1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNNDE4LjIyMyAzMjEuNzA3QzM2Mi43OTMgMjk5LjM4OSAzNDMuMjcxIDI4MC4wMTcgMzQzLjI3MSAyNDcuMzMxQzM0My4yNzEgMjQyLjUyMSAzNDMuNDM3IDIzOC41ODUgMzQzLjYzOCAyMzguNTg1QzM0My44NCAyMzguNTg1IDM0NS45ODUgMjQwLjE3MyAzNDguNDA0IDI0Mi4xMTNDMzU5LjY0NCAyNTEuMTI4IDM3Mi4yMzEgMjU0Ljk3OSA0MDcuMDc2IDI2MC4wNjJDNDI3LjU4IDI2My4wNTQgNDM5LjExOSAyNjUuNDcgNDQ5Ljc2MyAyNjlDNDgzLjU5NSAyODAuMjIgNTA0LjUyNyAzMDIuOTkgNTA5LjUxOCAzMzQuMDA0QzUxMC45NjkgMzQzLjAxNiA1MTAuMTE4IDM1OS45MTUgNTA3Ljc2NiAzNjguODIyQzUwNS45MSAzNzUuODU3IDUwMC4yNDUgMzg4LjUzNyA0OTguNzQyIDM4OS4wMjNDNDk4LjMyNSAzODkuMTU4IDQ5Ny45MTcgMzg3LjU2MiA0OTcuODEgMzg1LjM4OUM0OTcuMjQgMzczLjc0NCA0OTEuMzU1IDM2Mi40MDYgNDgxLjQ3MiAzNTMuOTEzQzQ3MC4yMzUgMzQ0LjI1NyA0NTUuMTM3IDMzNi41NjkgNDE4LjIyMyAzMjEuNzA3WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBkPSJNMzc5LjMxIDMzMC45NzhDMzc4LjYxNSAzMjYuODQ2IDM3Ny40MTEgMzIxLjU2OCAzNzYuNjMzIDMxOS4yNUwzNzUuMjE5IDMxNS4wMzZMMzc3Ljg0NiAzMTcuOTg1QzM4MS40ODEgMzIyLjA2NSAzODQuMzU0IDMyNy4yODcgMzg2Ljc4OSAzMzQuMjQxQzM4OC42NDcgMzM5LjU0OSAzODguODU2IDM0MS4xMjcgMzg4Ljg0MiAzNDkuNzUzQzM4OC44MjggMzU4LjIyMSAzODguNTk2IDM1OS45OTYgMzg2Ljg4IDM2NC43NzNDMzg0LjE3NCAzNzIuMzA3IDM4MC44MTYgMzc3LjY0OSAzNzUuMTgxIDM4My4zODNDMzY1LjA1NiAzOTMuNjg4IDM1Mi4wMzggMzk5LjM5MyAzMzMuMjUzIDQwMS43NkMzMjkuOTg3IDQwMi4xNzEgMzIwLjQ3IDQwMi44NjQgMzEyLjEwMyA0MDMuMjk5QzI5MS4wMTYgNDA0LjM5NSAyNzcuMTM4IDQwNi42NjEgMjY0LjY2OCA0MTEuMDRDMjYyLjg3NSA0MTEuNjcgMjYxLjI3NCA0MTIuMDUyIDI2MS4xMTIgNDExLjg5QzI2MC42MDcgNDExLjM4OCAyNjkuMDk4IDQwNi4zMjYgMjc2LjExMSA0MDIuOTQ4QzI4NS45OTkgMzk4LjE4NSAyOTUuODQyIDM5NS41ODYgMzE3Ljg5NyAzOTEuOTEzQzMyOC43OTIgMzkwLjA5OCAzNDAuMDQzIDM4Ny44OTcgMzQyLjkgMzg3LjAyMUMzNjkuODggMzc4Ljc0OSAzODMuNzQ4IDM1Ny40MDIgMzc5LjMxIDMzMC45NzhaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGQ9Ik00MDQuNzE5IDM3Ni4xMDVDMzk3LjM1NSAzNjAuMjczIDM5NS42NjQgMzQ0Ljk4OCAzOTkuNjk4IDMzMC43MzJDNDAwLjEzIDMyOS4yMDkgNDAwLjgyNCAzMjcuOTYyIDQwMS4yNDIgMzI3Ljk2MkM0MDEuNjU5IDMyNy45NjIgNDAzLjM5NyAzMjguOTAyIDQwNS4xMDMgMzMwLjA1QzQwOC40OTcgMzMyLjMzNSA0MTUuMzAzIDMzNi4xODIgNDMzLjQzNyAzNDYuMDY5QzQ1Ni4wNjUgMzU4LjQwNiA0NjguOTY2IDM2Ny45NTkgNDc3Ljc0IDM3OC44NzNDNDg1LjQyMyAzODguNDMyIDQ5MC4xNzggMzk5LjMxOCA0OTIuNDY3IDQxMi41OTNDNDkzLjc2MiA0MjAuMTEzIDQ5My4wMDMgNDM4LjIwNiA0OTEuMDc0IDQ0NS43NzhDNDg0Ljk5IDQ2OS42NTMgNDcwLjg1IDQ4OC40MDYgNDUwLjY4MiA0OTkuMzQ5QzQ0Ny43MjcgNTAwLjk1MiA0NDUuMDc1IDUwMi4yNjkgNDQ0Ljc4OCA1MDIuMjc1QzQ0NC41MDEgNTAyLjI4IDQ0NS41NzcgNDk5LjU0MyA0NDcuMTggNDk2LjE5MUM0NTMuOTY1IDQ4Mi4wMDkgNDU0LjczNyA0NjguMjE0IDQ0OS42MDggNDUyLjg1OUM0NDYuNDY3IDQ0My40NTcgNDQwLjA2NCA0MzEuOTg1IDQyNy4xMzUgNDEyLjU5NkM0MTIuMTAzIDM5MC4wNTQgNDA4LjQxNyAzODQuMDU0IDQwNC43MTkgMzc2LjEwNVoiIGZpbGw9IiNGRjAwN0EiLz4KPHBhdGggZD0iTTE5Ni41MTkgNDYxLjUyNUMyMTcuMDg5IDQ0NC4xNTcgMjQyLjY4MiA0MzEuODE5IDI2NS45OTYgNDI4LjAzMkMyNzYuMDQzIDQyNi4zOTkgMjkyLjc4IDQyNy4wNDcgMzAyLjA4NCA0MjkuNDI4QzMxNi45OTggNDMzLjI0NSAzMzAuMzM4IDQ0MS43OTMgMzM3LjI3NiA0NTEuOTc4QzM0NC4wNTcgNDYxLjkzMiAzNDYuOTY2IDQ3MC42MDYgMzQ5Ljk5NSA0ODkuOTA2QzM1MS4xODkgNDk3LjUxOSAzNTIuNDg5IDUwNS4xNjQgMzUyLjg4MiA1MDYuODk1QzM1NS4xNTYgNTE2Ljg5NyAzNTkuNTgzIDUyNC44OTIgMzY1LjA2NyA1MjguOTA3QzM3My43NzkgNTM1LjI4MyAzODguNzggNTM1LjY4IDQwMy41MzYgNTI5LjkyNEM0MDYuMDQxIDUyOC45NDcgNDA4LjIxNSA1MjguMjcxIDQwOC4zNjggNTI4LjQyNEM0MDguOTAzIDUyOC45NTUgNDAxLjQ3MyA1MzMuOTMgMzk2LjIzIDUzNi41NDhDMzg5LjE3NyA1NDAuMDcxIDM4My41NjggNTQxLjQzNCAzNzYuMTE1IDU0MS40MzRDMzYyLjYgNTQxLjQzNCAzNTEuMzc5IDUzNC41NTggMzQyLjAxNiA1MjAuNTM5QzM0MC4xNzQgNTE3Ljc4IDMzNi4wMzIgNTA5LjUxNiAzMzIuODEzIDUwMi4xNzZDMzIyLjkyOCA0NzkuNjI4IDMxOC4wNDYgNDcyLjc1OSAzMDYuNTY4IDQ2NS4yNDJDMjk2LjU3OSA0NTguNzAxIDI4My42OTcgNDU3LjUzIDI3NC4wMDYgNDYyLjI4MkMyNjEuMjc2IDQ2OC41MjMgMjU3LjcyNCA0ODQuNzkxIDI2Ni44NDIgNDk1LjEwMUMyNzAuNDY1IDQ5OS4xOTggMjc3LjIyMyA1MDIuNzMyIDI4Mi43NDkgNTAzLjQxOUMyOTMuMDg2IDUwNC43MDUgMzAxLjk3IDQ5Ni44NDEgMzAxLjk3IDQ4Ni40MDRDMzAxLjk3IDQ3OS42MjcgMjk5LjM2NSA0NzUuNzYgMjkyLjgwOCA0NzIuODAxQzI4My44NTIgNDY4Ljc2IDI3NC4yMjYgNDczLjQ4MyAyNzQuMjcyIDQ4MS44OTdDMjc0LjI5MiA0ODUuNDg0IDI3NS44NTQgNDg3LjczNyAyNzkuNDUgNDg5LjM2NEMyODEuNzU3IDQ5MC40MDggMjgxLjgxMSA0OTAuNDkxIDI3OS45MjkgNDkwLjFDMjcxLjcxMiA0ODguMzk2IDI2OS43ODcgNDc4LjQ5IDI3Ni4zOTQgNDcxLjkxM0MyODQuMzI2IDQ2NC4wMTggMzAwLjcyOSA0NjcuNTAyIDMwNi4zNjIgNDc4LjI3OUMzMDguNzI4IDQ4Mi44MDUgMzA5LjAwMyA0OTEuODIgMzA2Ljk0IDQ5Ny4yNjRDMzAyLjMyMiA1MDkuNDQ4IDI4OC44NTkgNTE1Ljg1NSAyNzUuMjAxIDUxMi4zNjhDMjY1LjkwMyA1MDkuOTk0IDI2Mi4xMTcgNTA3LjQyNCAyNTAuOTA2IDQ5NS44NzZDMjMxLjQyNSA0NzUuODA5IDIyMy44NjIgNDcxLjkyIDE5NS43NzcgNDY3LjUzNkwxOTAuMzk1IDQ2Ni42OTZMMTk2LjUxOSA0NjEuNTI1WiIgZmlsbD0iI0ZGMDA3QSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQ5LjYyMDIgMTIuMDAzMUMxMTQuNjc4IDkwLjk2MzggMjE0Ljk3NyAyMTMuOTAxIDIxOS45NTcgMjIwLjc4NEMyMjQuMDY4IDIyNi40NjcgMjIyLjUyMSAyMzEuNTc2IDIxNS40NzggMjM1LjU4QzIxMS41NjEgMjM3LjgwNyAyMDMuNTA4IDI0MC4wNjMgMTk5LjQ3NiAyNDAuMDYzQzE5NC45MTYgMjQwLjA2MyAxODkuNzc5IDIzNy44NjcgMTg2LjAzOCAyMzQuMzE4QzE4My4zOTMgMjMxLjgxIDE3Mi43MjEgMjE1Ljg3NCAxNDguMDg0IDE3Ny42NDZDMTI5LjIzMyAxNDguMzk2IDExMy40NTcgMTI0LjEzMSAxMTMuMDI3IDEyMy43MjVDMTEyLjAzMiAxMjIuNzg1IDExMi4wNDkgMTIyLjgxNyAxNDYuMTYyIDE4My44NTRDMTY3LjU4MiAyMjIuMTgxIDE3NC44MTMgMjM1LjczMSAxNzQuODEzIDIzNy41NDNDMTc0LjgxMyAyNDEuMjI5IDE3My44MDggMjQzLjE2NiAxNjkuMjYxIDI0OC4yMzhDMTYxLjY4MSAyNTYuNjk0IDE1OC4yOTMgMjY2LjE5NSAxNTUuODQ3IDI4NS44NTlDMTUzLjEwNCAzMDcuOTAyIDE0NS4zOTQgMzIzLjQ3MyAxMjQuMDI2IDM1MC4xMjJDMTExLjUxOCAzNjUuNzIyIDEwOS40NzEgMzY4LjU4MSAxMDYuMzE1IDM3NC44NjlDMTAyLjMzOSAzODIuNzg2IDEwMS4yNDYgMzg3LjIyMSAxMDAuODAzIDM5Ny4yMTlDMTAwLjMzNSA0MDcuNzkgMTAxLjI0NyA0MTQuNjE5IDEwNC40NzcgNDI0LjcyNkMxMDcuMzA0IDQzMy41NzUgMTEwLjI1NSA0MzkuNDE3IDExNy44IDQ1MS4xMDRDMTI0LjMxMSA0NjEuMTg4IDEyOC4wNjEgNDY4LjY4MyAxMjguMDYxIDQ3MS42MTRDMTI4LjA2MSA0NzMuOTQ3IDEyOC41MDYgNDczLjk1IDEzOC41OTYgNDcxLjY3MkMxNjIuNzQxIDQ2Ni4yMTkgMTgyLjM0OCA0NTYuNjI5IDE5My4zNzUgNDQ0Ljg3N0MyMDAuMTk5IDQzNy42MDMgMjAxLjgwMSA0MzMuNTg2IDIwMS44NTMgNDIzLjYxOEMyMDEuODg3IDQxNy4wOTggMjAxLjY1OCA0MTUuNzMzIDE5OS44OTYgNDExLjk4MkMxOTcuMDI3IDQwNS44NzcgMTkxLjgwNCA0MDAuODAxIDE4MC4yOTIgMzkyLjkzMkMxNjUuMjA5IDM4Mi42MjEgMTU4Ljc2NyAzNzQuMzIgMTU2Ljk4NyAzNjIuOTA0QzE1NS41MjcgMzUzLjUzNyAxNTcuMjIxIDM0Ni45MjggMTY1LjU2NSAzMjkuNDRDMTc0LjIwMiAzMTEuMzM4IDE3Ni4zNDIgMzAzLjYyNCAxNzcuNzkgMjg1LjM3OEMxNzguNzI1IDI3My41ODkgMTgwLjAyIDI2OC45NCAxODMuNDA3IDI2NS4yMDlDMTg2LjkzOSAyNjEuMzE3IDE5MC4xMTkgMjYwIDE5OC44NjEgMjU4LjgwNUMyMTMuMTEzIDI1Ni44NTggMjIyLjE4OCAyNTMuMTcxIDIyOS42NDggMjQ2LjI5N0MyMzYuMTE5IDI0MC4zMzQgMjM4LjgyNyAyMzQuNTg4IDIzOS4yNDMgMjI1LjkzOEwyMzkuNTU4IDIxOS4zODJMMjM1Ljk0MiAyMTUuMTY2QzIyMi44NDYgMTk5Ljg5NiA0MC44NSAwIDQwLjA0NCAwQzM5Ljg3MTkgMCA0NC4xODEzIDUuNDAxNzggNDkuNjIwMiAxMi4wMDMxWk0xMzUuNDEyIDQwOS4xOEMxMzguMzczIDQwMy45MzcgMTM2LjggMzk3LjE5NSAxMzEuODQ3IDM5My45MDJDMTI3LjE2NyAzOTAuNzkgMTE5Ljg5NyAzOTIuMjU2IDExOS44OTcgMzk2LjMxMUMxMTkuODk3IDM5Ny41NDggMTIwLjU4MiAzOTguNDQ5IDEyMi4xMjQgMzk5LjI0M0MxMjQuNzIgNDAwLjU3OSAxMjQuOTA5IDQwMi4wODEgMTIyLjg2NiA0MDUuMTUyQzEyMC43OTcgNDA4LjI2MiAxMjAuOTY0IDQxMC45OTYgMTIzLjMzNyA0MTIuODU0QzEyNy4xNjIgNDE1Ljg0OSAxMzIuNTc2IDQxNC4yMDIgMTM1LjQxMiA0MDkuMThaIiBmaWxsPSIjRkYwMDdBIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjQ4LjU1MiAyNjIuMjQ0QzI0MS44NjIgMjY0LjI5OSAyMzUuMzU4IDI3MS4zOSAyMzMuMzQ0IDI3OC44MjZDMjMyLjExNiAyODMuMzYyIDIzMi44MTMgMjkxLjMxOSAyMzQuNjUzIDI5My43NzZDMjM3LjYyNSAyOTcuNzQ1IDI0MC40OTkgMjk4Ljc5MSAyNDguMjgyIDI5OC43MzZDMjYzLjUxOCAyOTguNjMgMjc2Ljc2NCAyOTIuMDk1IDI3OC4zMDQgMjgzLjkyNUMyNzkuNTY3IDI3Ny4yMjkgMjczLjc0OSAyNjcuOTQ4IDI2NS43MzYgMjYzLjg3NEMyNjEuNjAxIDI2MS43NzIgMjUyLjgwNyAyNjAuOTM4IDI0OC41NTIgMjYyLjI0NFpNMjY2LjM2NCAyNzYuMTcyQzI2OC43MTQgMjcyLjgzNCAyNjcuNjg2IDI2OS4yMjUgMjYzLjY5IDI2Ni43ODVDMjU2LjA4IDI2Mi4xMzggMjQ0LjU3MSAyNjUuOTgzIDI0NC41NzEgMjczLjE3M0MyNDQuNTcxIDI3Ni43NTIgMjUwLjU3MiAyODAuNjU2IDI1Ni4wNzQgMjgwLjY1NkMyNTkuNzM1IDI4MC42NTYgMjY0Ljc0NiAyNzguNDczIDI2Ni4zNjQgMjc2LjE3MloiIGZpbGw9IiNGRjAwN0EiLz4KPC9zdmc+Cg==',
    protocol: 'uniswap_v2',
    
    slippage: true,

    blockchains: ['ethereum'],

    ethereum: {
      router: {
        address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        api: UniswapV2.ROUTER
      },
      factory: {
        address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        api: UniswapV2.FACTORY
      },
      pair: {
        api: UniswapV2.PAIR
      },
    },

    base: {
      router: {
        address: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
        api: UniswapV2.ROUTER
      },
      factory: {
        address: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
        api: UniswapV2.FACTORY
      },
      pair: {
        api: UniswapV2.PAIR
      },
    }
  };

  var uniswap_v2 = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$a, {
        scope,
        findPath: (args)=>UniswapV2.findPath({ ...args, exchange: exchange$a }),
        pathExists: (args)=>UniswapV2.pathExists({ ...args, exchange: exchange$a }),
        getAmounts: (args)=>UniswapV2.getAmounts({ ...args, exchange: exchange$a }),
        getPrep: (args)=>UniswapV2.getPrep({ ...args, exchange: exchange$a }),
        getTransaction: (args)=>UniswapV2.getTransaction({ ...args, exchange: exchange$a }),
      })
    )
  };

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  const SENDER_AS_RECIPIENT = '0x0000000000000000000000000000000000000001';
  const ROUTER_AS_RECIPIENT = '0x0000000000000000000000000000000000000002';

  const { BigNumber } = ethers.ethers;
  const TWO = BigNumber.from(2);
  const FIVE = BigNumber.from(5);
  const HUNDRED = BigNumber.from(100);

  // Replaces 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE with the wrapped token and implies wrapping.
  //
  // We keep 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE internally
  // to be able to differentiate between ETH<>Token and WETH<>Token swaps
  // as they are not the same!
  //
  const getExchangePath = ({ blockchain, exchange, path }) => {
    if(!path) { return }
    let exchangePath = path.map((token, index) => {
      if (
        token === Blockchains__default['default'][blockchain].currency.address && path[index+1] != Blockchains__default['default'][blockchain].wrapped.address &&
        path[index-1] != Blockchains__default['default'][blockchain].wrapped.address
      ) {
        return Blockchains__default['default'][blockchain].wrapped.address
      } else {
        return token
      }
    });

    if(exchangePath[0] == Blockchains__default['default'][blockchain].currency.address && exchangePath[1] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(0, 1);
    } else if(exchangePath[exchangePath.length-1] == Blockchains__default['default'][blockchain].currency.address && exchangePath[exchangePath.length-2] == Blockchains__default['default'][blockchain].wrapped.address) {
      exchangePath.splice(exchangePath.length-1, 1);
    }

    return exchangePath
  };

  const getInputAmount = async ({ exchange, pool, outputAmount })=>{

    const data = await request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactOutput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[1], pool.fee, pool.path[0]]),
        amountOut: outputAmount
      },
      cache: 5000 // 5 seconds in ms
    });

    return data.amountIn
  };

  const getOutputAmount = async ({ exchange, pool, inputAmount })=>{

    const data = await request({
      blockchain: pool.blockchain,
      address: exchange[pool.blockchain].quoter.address,
      api: exchange[pool.blockchain].quoter.api,
      method: 'quoteExactInput',
      params: {
        path: ethers.ethers.utils.solidityPack(["address","uint24","address"],[pool.path[0], pool.fee, pool.path[1]]),
        amountIn: inputAmount
      },
      cache: 5000 // 5 seconds in ms
    });

    return data.amountOut
  };

  const getBestPool = async ({ blockchain, exchange, path, amountIn, amountOut, block }) => {
    path = getExchangePath({ blockchain, exchange, path });
    if(path.length > 2) { throw('Uniswap V3 can only check paths for up to 2 tokens!') }

    try {

      let pools = (await Promise.all(exchange.fees.map((fee)=>{
        return request({
          blockchain: Blockchains__default['default'][blockchain].name,
          address: exchange[blockchain].factory.address,
          method: 'getPool',
          api: exchange[blockchain].factory.api,
          cache: 3600000, // 1 hour in ms
          params: [path[0], path[1], fee],
        }).then((address)=>{
          return {
            blockchain,
            address,
            path,
            fee,
            token0: [...path].sort()[0],
            token1: [...path].sort()[1],
          }
        }).catch(()=>{})
      }))).filter(Boolean);
      
      pools = pools.filter((pool)=>pool.address != Blockchains__default['default'][blockchain].zero);

      pools = (await Promise.all(pools.map(async(pool)=>{

        try {

          let amount;
          if (amountIn) {
            // exact-in: base output and doubled-input output
            amount = await getOutputAmount({ exchange, pool, inputAmount: amountIn });
            const doubledIn = BigNumber.from(amountIn).mul(TWO);
            const amountDoubled = await getOutputAmount({ exchange, pool, inputAmount: doubledIn.toString() });

            // ideal linear vs actual require deviation/ideal ≤ 5%
            const ideal = amount.mul(TWO);
            const deviation = ideal.sub(amountDoubled).abs();
            const enoughLiquidity = deviation.mul(HUNDRED).lte(ideal.mul(FIVE));
            if (!enoughLiquidity) return
          } else {
            // exact-out: base input and input for doubled output
            amount = await getInputAmount({ exchange, pool, outputAmount: amountOut });
            const doubledOut = BigNumber.from(amountOut).mul(TWO);
            const inputForDouble = await getInputAmount({ exchange, pool, outputAmount: doubledOut.toString() });

            const idealIn = amount.mul(TWO);
            const deviationIn = idealIn.sub(inputForDouble).abs();
            const enoughLiquidity = deviationIn.mul(HUNDRED).lte(idealIn.mul(FIVE));
            if (!enoughLiquidity) return
          }

          return { ...pool, amountIn: amountIn || amount, amountOut: amountOut || amount }
        } catch (e) {}

      }))).filter(Boolean);
      
      if(amountIn) {
        // highest amountOut is best pool
        return pools.sort((a,b)=>(b.amountOut.gt(a.amountOut) ? 1 : -1))[0]
      } else {
        // lowest amountIn is best pool
        return pools.sort((a,b)=>(b.amountIn.lt(a.amountIn) ? 1 : -1))[0]
      }

    } catch (e2) { return }
  };

  const pathExists$1 = async ({ blockchain, exchange, path, amountIn, amountOut, amountInMax, amountOutMin }) => {
    try {
      return !!(await getBestPool({ blockchain, exchange, path, amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) }))
    } catch (e3) { return false }
  };

  const findPath$1 = async ({ blockchain, exchange, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin }) => {
    if(
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) &&
      [tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path;
    let pools = [];

    // DIRECT PATH
    pools = [
      await getBestPool({ exchange, blockchain, path: [tokenIn, tokenOut], amountIn: (amountIn || amountInMax), amountOut: (amountOut || amountOutMin) })
    ];
    if (pools.filter(Boolean).length) {
      path = [tokenIn, tokenOut];
    }

    // PATH VIA WRAPPED
    if(
      !path &&
      tokenIn != Blockchains__default['default'][blockchain].wrapped.address &&
      tokenOut != Blockchains__default['default'][blockchain].wrapped.address
    ) {
      pools = [];
      if(amountOut || amountOutMin){
        pools.push(await getBestPool({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountOut: (amountOut || amountOutMin) }));
        if(pools.filter(Boolean).length) {
          pools.unshift(await getBestPool({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountOut: pools[0].amountIn }));
        }
      } else { // amountIn
        pools.push(await getBestPool({ exchange, blockchain, path: [tokenIn, Blockchains__default['default'][blockchain].wrapped.address], amountIn: (amountIn || amountInMax) }));
        if(pools.filter(Boolean).length) {
          pools.push(await getBestPool({ exchange, blockchain, path: [Blockchains__default['default'][blockchain].wrapped.address, tokenOut], amountIn: pools[0].amountOut }));
        }
      }
      if (pools.filter(Boolean).length === 2) {
        // path via WRAPPED
        path = [tokenIn, Blockchains__default['default'][blockchain].wrapped.address, tokenOut];
      }
    }

    // PATH VIA USD STABLE
    if(
      !path
    ) {
      pools = [];
      let allPoolsForAllUSD = await Promise.all(Blockchains__default['default'][blockchain].stables.usd.map(async(stable)=>{
        let pools = [];
        if(amountOut || amountOutMin){
          pools.push(await getBestPool({ exchange, blockchain, path: [stable, tokenOut], amountOut: (amountOut || amountOutMin) }));
          if(pools.filter(Boolean).length) {
            pools.unshift(await getBestPool({ exchange, blockchain, path: [tokenIn, stable], amountOut: pools[0].amountIn }));
          }
        } else { // amountIn
          pools.push(await getBestPool({ exchange, blockchain, path: [tokenIn, stable], amountIn: (amountIn || amountInMax) }));
          if(pools.filter(Boolean).length) {
            pools.push(await getBestPool({ exchange, blockchain, path: [stable, tokenOut], amountIn: pools[0].amountOut }));
          }
        }
        if(pools.filter(Boolean).length === 2) {
          return [stable, pools]
        }
      }));

      let usdPath = allPoolsForAllUSD.filter(Boolean)[0];
      if(usdPath) {
        path = [tokenIn, usdPath[0], tokenOut];
        pools = usdPath[1];
      }
    }

    // Add WRAPPED to route path if things start or end with NATIVE
    // because that actually reflects how things are routed in reality:
    if(_optionalChain([path, 'optionalAccess', _ => _.length]) && path[0] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    } else if(_optionalChain([path, 'optionalAccess', _2 => _2.length]) && path[path.length-1] == Blockchains__default['default'][blockchain].currency.address) {
      path.splice(path.length-1, 0, Blockchains__default['default'][blockchain].wrapped.address);
    }

    if(!path) { pools = []; }
    return { path, pools, exchangePath: getExchangePath({ blockchain, exchange, path }) }
  };

  let getAmountOut = ({ blockchain, exchange, path, pools, amountIn }) => {
    return pools[pools.length-1].amountOut
  };

  let getAmountIn = async ({ blockchain, exchange, path, pools, amountOut, block }) => {
    if(block === undefined) {
      return pools[0].amountIn
    } else {
      
      let path;
      if(pools.length == 2) {
        path = ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"],[
          pools[1].path[1], pools[1].fee, pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      } else if(pools.length == 1) { 
        path = ethers.ethers.utils.solidityPack(["address","uint24","address"],[
          pools[0].path[1], pools[0].fee, pools[0].path[0]
        ]);
      }

      const data = await request({
        block,
        blockchain,
        address: exchange[blockchain].quoter.address,
        api: exchange[blockchain].quoter.api,
        method: 'quoteExactOutput',
        params: { path, amountOut },
      });

      return data.amountIn
    }
  };

  let getAmounts$1 = async ({
    blockchain,
    exchange,
    path,
    pools,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {
    if (amountOut) {
      amountIn = await getAmountIn({ blockchain, exchange, block, path, pools, amountOut, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if (amountIn) {
      amountOut = await getAmountOut({ blockchain, exchange, path, pools, amountIn, tokenIn, tokenOut });
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    } else if(amountOutMin) {
      amountIn = await getAmountIn({ blockchain, exchange, block, path, pools, amountOut: amountOutMin, tokenIn, tokenOut });
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return {}
      } else if (amountInMax === undefined) {
        amountInMax = amountIn;
      }
    } else if(amountInMax) {
      amountOut = await getAmountOut({ blockchain, exchange, path, pools, amountIn: amountInMax, tokenIn, tokenOut });
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return {}
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut;
      }
    }
    return { amountOut, amountIn, amountInMax, amountOutMin, pools }
  };

  let getPrep = async({
    exchange,
    blockchain,
    tokenIn,
    amountIn,
    account
  })=> {

    if(tokenIn === Blockchains__default['default'][blockchain].currency.address) { return } // NATIVE

    const allowance = await request({
      blockchain,
      address: tokenIn,
      method: 'allowance',
      api: Token[blockchain]['20'],
      params: [account, exchange[blockchain].router.address]
    });

    if(allowance.gte(amountIn)) { return }

    let transaction = {
      blockchain,
      from: account,
      to: tokenIn,
      api: Token[blockchain]['20'],
      method: 'approve',
      params: [exchange[blockchain].router.address, amountIn.sub(allowance)]
    };
    
    return { transaction }

  };

  let packPath = (pools)=>{
    if(pools.length == 1) {
      return ethers.ethers.utils.solidityPack(["address","uint24","address"], [pools[0].path[0], pools[0].fee, pools[0].path[1]])
    } else if (pools.length == 2) {
      return ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [pools[0].path[0], pools[0].fee, pools[0].path[1], pools[1].fee, pools[1].path[1]])
    } else {
      throw 'more than 2 pools not supported!'
    }
  };

  let packPathReverse = (pools)=>{
    if(pools.length == 1) {
      return ethers.ethers.utils.solidityPack(["address","uint24","address"], [pools[0].path[1], pools[0].fee, pools[0].path[0]])
    } else if (pools.length == 2) {
      return ethers.ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [pools[1].path[1], pools[1].fee, pools[1].path[0], pools[0].fee, pools[0].path[0]])
    } else {
      throw 'more than 2 pools not supported!'
    }
  };

  let getTransaction$1 = async({
    blockchain,
    exchange,
    pools,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account,
    inputTokenPushed,
  }) => {

    let value = "0";
    const contract = new ethers.ethers.Contract(exchange[blockchain].router.address, exchange[blockchain].router.api);
    const exactInput = !!(amountOutMinInput || amountInInput);
    const wrapETH = path[0] === Blockchains__default['default'][blockchain].currency.address;
    const unwrapETH = path[path.length-1] === Blockchains__default['default'][blockchain].currency.address;
    const recipient = unwrapETH ? ROUTER_AS_RECIPIENT : SENDER_AS_RECIPIENT;
    const refundETH = wrapETH || unwrapETH;

    let multicalls = [];

    if (wrapETH) {
      value = (amountIn || amountInMax).toString();
      if(exactInput) { // exactOut does not need to wrapETH!
        multicalls.push(
          contract.interface.encodeFunctionData('wrapETH', [(amountIn || amountInMax)])
        );
      }
    }

    if (exactInput) {
      multicalls.push(
        contract.interface.encodeFunctionData('exactInput', [{
          path: packPath(pools),
          amountIn: wrapETH ? 0 : (amountIn || amountInMax),
          amountOutMinimum: amountOutMin,
          recipient
        }])
      );
    } else {
      multicalls.push(
        contract.interface.encodeFunctionData('exactOutput', [{
          path: packPathReverse(pools),
          amountOut,
          amountInMaximum: amountInMax,
          recipient
        }])
      );
    }

    if (unwrapETH) {
      multicalls.push(
        contract.interface.encodeFunctionData('unwrapWETH9(uint256)', [amountOut || amountOutMin])
      );
    }

    if(refundETH) {
      multicalls.push(
        contract.interface.encodeFunctionData('refundETH')
      );
    }

    const transaction = {
      blockchain,
      from: account,
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api,
      method: 'multicall',
      params: { data: multicalls },
      value
    };

    return transaction
  };

  const ROUTER = [{"inputs":[{"internalType":"address","name":"_factoryV2","type":"address"},{"internalType":"address","name":"factoryV3","type":"address"},{"internalType":"address","name":"_positionManager","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveMax","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveMaxMinusOne","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveZeroThenMax","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"approveZeroThenMaxMinusOne","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"data","type":"bytes"}],"name":"callPositionManager","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"paths","type":"bytes[]"},{"internalType":"uint128[]","name":"amounts","type":"uint128[]"},{"internalType":"uint24","name":"maximumTickDivergence","type":"uint24"},{"internalType":"uint32","name":"secondsAgo","type":"uint32"}],"name":"checkOracleSlippage","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint24","name":"maximumTickDivergence","type":"uint24"},{"internalType":"uint32","name":"secondsAgo","type":"uint32"}],"name":"checkOracleSlippage","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct IV3SwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IV3SwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"}],"internalType":"struct IV3SwapRouter.ExactOutputParams","name":"params","type":"tuple"}],"name":"exactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IV3SwapRouter.ExactOutputSingleParams","name":"params","type":"tuple"}],"name":"exactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factoryV2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"getApprovalType","outputs":[{"internalType":"enum IApproveAndCall.ApprovalType","name":"","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"amount0Min","type":"uint256"},{"internalType":"uint256","name":"amount1Min","type":"uint256"}],"internalType":"struct IApproveAndCall.IncreaseLiquidityParams","name":"params","type":"tuple"}],"name":"increaseLiquidity","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint256","name":"amount0Min","type":"uint256"},{"internalType":"uint256","name":"amount1Min","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"internalType":"struct IApproveAndCall.MintParams","name":"params","type":"tuple"}],"name":"mint","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"previousBlockhash","type":"bytes32"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"positionManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"pull","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"refundETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowed","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowedIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"wrapETH","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];
  const FACTORY = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  const POOL = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"Collect","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"CollectProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid1","type":"uint256"}],"name":"Flash","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextOld","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextNew","type":"uint16"}],"name":"IncreaseObservationCardinalityNext","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Initialize","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"feeProtocol0Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol0New","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1New","type":"uint8"}],"name":"SetFeeProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"int256","name":"amount0","type":"int256"},{"indexed":false,"internalType":"int256","name":"amount1","type":"int256"},{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"uint128","name":"liquidity","type":"uint128"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Swap","type":"event"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collect","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collectProtocol","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal0X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal1X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"flash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"}],"name":"increaseObservationCardinalityNext","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"liquidity","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxLiquidityPerTick","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"observations","outputs":[{"internalType":"uint32","name":"blockTimestamp","type":"uint32"},{"internalType":"int56","name":"tickCumulative","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityCumulativeX128","type":"uint160"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32[]","name":"secondsAgos","type":"uint32[]"}],"name":"observe","outputs":[{"internalType":"int56[]","name":"tickCumulatives","type":"int56[]"},{"internalType":"uint160[]","name":"secondsPerLiquidityCumulativeX128s","type":"uint160[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"positions","outputs":[{"internalType":"uint128","name":"liquidity","type":"uint128"},{"internalType":"uint256","name":"feeGrowthInside0LastX128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthInside1LastX128","type":"uint256"},{"internalType":"uint128","name":"tokensOwed0","type":"uint128"},{"internalType":"uint128","name":"tokensOwed1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"protocolFees","outputs":[{"internalType":"uint128","name":"token0","type":"uint128"},{"internalType":"uint128","name":"token1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"feeProtocol0","type":"uint8"},{"internalType":"uint8","name":"feeProtocol1","type":"uint8"}],"name":"setFeeProtocol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"slot0","outputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"internalType":"int24","name":"tick","type":"int24"},{"internalType":"uint16","name":"observationIndex","type":"uint16"},{"internalType":"uint16","name":"observationCardinality","type":"uint16"},{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"},{"internalType":"uint8","name":"feeProtocol","type":"uint8"},{"internalType":"bool","name":"unlocked","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"}],"name":"snapshotCumulativesInside","outputs":[{"internalType":"int56","name":"tickCumulativeInside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityInsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsInside","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"bool","name":"zeroForOne","type":"bool"},{"internalType":"int256","name":"amountSpecified","type":"int256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[{"internalType":"int256","name":"amount0","type":"int256"},{"internalType":"int256","name":"amount1","type":"int256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int16","name":"","type":"int16"}],"name":"tickBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"","type":"int24"}],"name":"ticks","outputs":[{"internalType":"uint128","name":"liquidityGross","type":"uint128"},{"internalType":"int128","name":"liquidityNet","type":"int128"},{"internalType":"uint256","name":"feeGrowthOutside0X128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthOutside1X128","type":"uint256"},{"internalType":"int56","name":"tickCumulativeOutside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityOutsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsOutside","type":"uint32"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
  const QUOTER = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"name":"quoteExactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactInputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"quoteExactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160[]","name":"sqrtPriceX96AfterList","type":"uint160[]"},{"internalType":"uint32[]","name":"initializedTicksCrossedList","type":"uint32[]"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IQuoterV2.QuoteExactOutputSingleParams","name":"params","type":"tuple"}],"name":"quoteExactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceX96After","type":"uint160"},{"internalType":"uint32","name":"initializedTicksCrossed","type":"uint32"},{"internalType":"uint256","name":"gasEstimate","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"path","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"view","type":"function"}];
  const PERMIT2 = [{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"AllowanceExpired","type":"error"},{"inputs":[],"name":"ExcessiveInvalidation","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"}],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidContractSignature","type":"error"},{"inputs":[],"name":"InvalidNonce","type":"error"},{"inputs":[],"name":"InvalidSignature","type":"error"},{"inputs":[],"name":"InvalidSignatureLength","type":"error"},{"inputs":[],"name":"InvalidSigner","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"signatureDeadline","type":"uint256"}],"name":"SignatureExpired","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"}],"name":"Lockdown","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint48","name":"newNonce","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"oldNonce","type":"uint48"}],"name":"NonceInvalidation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"nonce","type":"uint48"}],"name":"Permit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"word","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"mask","type":"uint256"}],"name":"UnorderedNonceInvalidation","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint48","name":"newNonce","type":"uint48"}],"name":"invalidateNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wordPos","type":"uint256"},{"internalType":"uint256","name":"mask","type":"uint256"}],"name":"invalidateUnorderedNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"internalType":"struct IAllowanceTransfer.TokenSpenderPair[]","name":"approvals","type":"tuple[]"}],"name":"lockdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"nonceBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails[]","name":"details","type":"tuple[]"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitBatch","name":"permitBatch","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"internalType":"struct IAllowanceTransfer.AllowanceTransferDetails[]","name":"transferDetails","type":"tuple[]"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  var UniswapV3 = {
    findPath: findPath$1,
    pathExists: pathExists$1,
    getAmounts: getAmounts$1,
    getPrep,
    getTransaction: getTransaction$1,
    ROUTER,
    FACTORY,
    POOL,
    QUOTER,
    PERMIT2,
  };

  const exchange$9 = {

    name: 'uniswap_v3',
    label: 'Uniswap v3',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGRhdGEtdGVzdGlkPSJ1bmlzd2FwLWxvZ28iIGNsYXNzPSJyZ3c2ZXo0NHAgcmd3NmV6NGVqIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMzUyNiAxOS45MjQyQzIwLjI5MjggMjAuMTU0OSAyMC4xODg1IDIwLjM3MTUgMjAuMDQ1NSAyMC41NjE4QzE5Ljc3OTMgMjAuOTA4OCAxOS40MjcgMjEuMTc5NCAxOS4wMjM5IDIxLjM0NjZDMTguNjYxNCAyMS41MDM1IDE4LjI3NzQgMjEuNjA1IDE3Ljg4NDkgMjEuNjQ3NUMxNy44MDQyIDIxLjY1NzggMTcuNzIwNiAyMS42NjQxIDE3LjYzOTUgMjEuNjcwM0wxNy42MjYzIDIxLjY3MTNDMTcuMzc3NyAyMS42ODA4IDE3LjEzODcgMjEuNzcgMTYuOTQ0MiAyMS45MjU4QzE2Ljc0OTcgMjIuMDgxNyAxNi42MSAyMi4yOTYgMTYuNTQ1NSAyMi41MzczQzE2LjUxNiAyMi42NTc0IDE2LjQ5NCAyMi43NzkyIDE2LjQ3OTggMjIuOTAyMUMxNi40NTcyIDIzLjA4NzQgMTYuNDQ1NiAyMy4yNzcxIDE2LjQzMyAyMy40ODIzQzE2LjQyNCAyMy42Mjk1IDE2LjQxNDQgMjMuNzg0OCAxNi40IDIzLjk1MjFDMTYuMzE1NiAyNC42MzM3IDE2LjExOTMgMjUuMjk2NSAxNS44MTkyIDI1LjkxMzZDMTUuNzU3OSAyNi4wNDMzIDE1LjY5NTQgMjYuMTY5MSAxNS42MzM5IDI2LjI5MjZDMTUuMzA0OSAyNi45NTQ2IDE1LjAwNzYgMjcuNTUyNiAxNS4wOTI5IDI4LjM1MzVDMTUuMTU5NyAyOC45NzA2IDE1LjQ3NDQgMjkuMzg0MSAxNS44OTI1IDI5LjgxMDZDMTYuMDkxMSAzMC4wMTQ2IDE2LjM1NDQgMzAuMTg4OSAxNi42Mjc3IDMwLjM2OTlDMTcuMzkyNyAzMC44NzYzIDE4LjIzNjEgMzEuNDM0NyAxNy45NTgyIDMyLjg0MTVDMTcuNzMwOCAzMy45ODE0IDE1Ljg0OTQgMzUuMTc3NiAxMy4yMDUgMzUuNTk1NEMxMy40NjE1IDM1LjU1NjMgMTIuODk2NSAzNC41ODc5IDEyLjgzMzggMzQuNDgwNEwxMi44MyAzNC40NzM5QzEyLjc1NzEgMzQuMzU5MiAxMi42ODI0IDM0LjI0NjIgMTIuNjA3OSAzNC4xMzM0TDEyLjYwNzkgMzQuMTMzNEwxMi42MDc4IDM0LjEzMzRDMTIuMzkyNiAzMy44MDc2IDEyLjE3ODMgMzMuNDgzNSAxMi4wMTExIDMzLjEyNDFDMTEuNTY5MyAzMi4xODU2IDExLjM2NDUgMzEuMDk5OCAxMS41NDU1IDMwLjA3MTRDMTEuNzA5NSAyOS4xNDA3IDEyLjMyMjEgMjguMzk3MiAxMi45MTE4IDI3LjY4MTNMMTIuOTExOCAyNy42ODEzQzEzLjAwOCAyNy41NjQ2IDEzLjEwMzUgMjcuNDQ4NyAxMy4xOTY0IDI3LjMzMjhDMTMuOTg1MiAyNi4zNDg4IDE0LjgxMjggMjUuMDU5NSAxNC45OTU5IDIzLjc4MjJDMTUuMDExNCAyMy42NzEyIDE1LjAyNTIgMjMuNTUwMiAxNS4wMzk3IDIzLjQyMjlMMTUuMDM5NyAyMy40MjI5TDE1LjAzOTcgMjMuNDIyOUMxNS4wNjU3IDIzLjE5NSAxNS4wOTM5IDIyLjk0NjkgMTUuMTM4MiAyMi42OTk3QzE1LjIwMzkgMjIuMjcyOCAxNS4zMzcxIDIxLjg1OTEgMTUuNTMyNiAyMS40NzQzQzE1LjY2NiAyMS4yMjIgMTUuODQxNyAyMC45OTQ2IDE2LjA1MiAyMC44MDIxQzE2LjE2MTYgMjAuNjk5OSAxNi4yMzM5IDIwLjU2MzcgMTYuMjU3NCAyMC40MTUzQzE2LjI4MDggMjAuMjY3IDE2LjI1NCAyMC4xMTUgMTYuMTgxMyAxOS45ODM3TDExLjk2NTggMTIuMzY3M0wxOC4wMjA3IDE5Ljg3MzNDMTguMDg5NyAxOS45NjAzIDE4LjE3NjggMjAuMDMxIDE4LjI3NiAyMC4wODAzQzE4LjM3NTIgMjAuMTI5NiAxOC40ODQgMjAuMTU2NCAxOC41OTQ2IDIwLjE1ODhDMTguNzA1MyAyMC4xNjEyIDE4LjgxNTEgMjAuMTM5MSAxOC45MTYzIDIwLjA5NEMxOS4wMTc1IDIwLjA0OSAxOS4xMDc2IDE5Ljk4MjEgMTkuMTgwMiAxOS44OTgyQzE5LjI1NjkgMTkuODA4NCAxOS4zMDA0IDE5LjY5NDcgMTkuMzAzMyAxOS41NzYzQzE5LjMwNjMgMTkuNDU4IDE5LjI2ODUgMTkuMzQyMyAxOS4xOTYzIDE5LjI0ODdDMTguOTE0OCAxOC44ODczIDE4LjYyMTggMTguNTIxIDE4LjMzMDIgMTguMTU2M0wxOC4zMyAxOC4xNTZDMTguMjEyIDE4LjAwODUgMTguMDk0MyAxNy44NjEzIDE3Ljk3NzYgMTcuNzE0OEwxNi40NTM5IDE1LjgyMDVMMTMuMzk1NyAxMi4wMzgyTDEwIDhMMTMuNzg4IDExLjY5OTRMMTcuMDQzMyAxNS4zMTQ5TDE4LjY2NzMgMTcuMTI3QzE4LjgxNjUgMTcuMjk1OCAxOC45NjU3IDE3LjQ2MzEgMTkuMTE0OCAxNy42MzAzQzE5LjUwNDQgMTguMDY3MSAxOS44OTQgMTguNTAzOSAyMC4yODM2IDE4Ljk2NzNMMjAuMzcyIDE5LjA3NTVMMjAuMzkxNCAxOS4yNDMzQzIwLjQxNzYgMTkuNDcwOCAyMC40MDQ1IDE5LjcwMTIgMjAuMzUyNiAxOS45MjQyWk0zNS45MjQ3IDIyLjQ2OTdMMzUuOTMxMSAyMi40Nzk1QzM1LjkzIDIxLjY3MTkgMzUuNDMyMiAyMC4zMzk0IDM0LjQyNDcgMTkuMDU3N0wzNC40MDEgMTkuMDI2M0MzNC4wOTA2IDE4LjY0MSAzMy43NTI0IDE4LjI3OTIgMzMuMzg5MSAxNy45NDM4QzMzLjMyMTIgMTcuODc3OCAzMy4yNDggMTcuODEyOCAzMy4xNzM2IDE3Ljc0NzlDMzIuNzA4MSAxNy4zNDAxIDMyLjE5OTMgMTYuOTg1IDMxLjY1NjQgMTYuNjg5MkwzMS42MTc2IDE2LjY2OTdDMjkuOTExOCAxNS43MzY2IDI3LjY5MiAxNS4yNTYgMjQuOTU0OSAxNS43OTcyQzI0LjU4NzMgMTUuMzQ4OSAyNC4xOTE0IDE0LjkyNDggMjMuNzY5NiAxNC41Mjc1QzIzLjEyMzYgMTMuOTA5MSAyMi4zNjMyIDEzLjQyNDEgMjEuNTMxNSAxMy4wOTk3QzIwLjcwNzIgMTIuNzk2NiAxOS44MjQ0IDEyLjY4ODQgMTguOTUxNyAxMi43ODM2QzE5Ljc5MjkgMTIuODU5NyAyMC42MTIzIDEzLjA5NDcgMjEuMzY2NiAxMy40NzY0QzIyLjA5NTEgMTMuODY4NSAyMi43NTEyIDE0LjM4MzMgMjMuMzA2MiAxNC45OTg0QzIzLjg2ODggMTUuNjI2MyAyNC4zOTc2IDE2LjI4MzkgMjQuODkwMyAxNi45Njg1TDI1LjAxMzkgMTcuMTMwMkMyNS40OTYgMTcuNzYwOSAyNS45ODY4IDE4LjQwMyAyNi41OTgyIDE4Ljk3NDRDMjYuOTM0OCAxOS4yOTI1IDI3LjMxMDMgMTkuNTY2NCAyNy43MTU3IDE5Ljc4OTVDMjcuODIzNCAxOS44NDQ3IDI3LjkzMjMgMTkuODk2NiAyOC4wMzkgMTkuOTQyMUMyOC4xNDU2IDE5Ljk4NzYgMjguMjQ1OCAyMC4wMjk4IDI4LjM1MzYgMjAuMDY4OEMyOC41NjE2IDIwLjE0OTkgMjguNzc3MSAyMC4yMTcxIDI4Ljk5MjYgMjAuMjc4OEMyOS44NTQ3IDIwLjUyNTYgMzAuNzM3MiAyMC42MTQzIDMxLjU5OTMgMjAuNjYyQzMxLjcxOTIgMjAuNjY4MyAzMS44Mzg5IDIwLjY3NDIgMzEuOTU4MSAyMC42ODAxTDMxLjk1ODMgMjAuNjgwMUMzMi4yNjYyIDIwLjY5NTQgMzIuNTcxMyAyMC43MTA1IDMyLjg3MTkgMjAuNzMyM0MzMy4yODM3IDIwLjc1NjkgMzMuNjkyMiAyMC44MjE0IDM0LjA5MTcgMjAuOTI1QzM0LjY5MTggMjEuMDgyMiAzNS4yMjAxIDIxLjQ0MTMgMzUuNTg4NSAyMS45NDI1QzM1LjcxMzcgMjIuMTA5NSAzNS44MjYxIDIyLjI4NTcgMzUuOTI0NyAyMi40Njk3Wk0zMy40MDEzIDE3Ljk0NTFDMzMuMzU4IDE3LjkwNDkgMzMuMzEzOSAxNy44NjUxIDMzLjI3IDE3LjgyNTRMMzMuMjcgMTcuODI1NEMzMy4yNDE4IDE3Ljc5OTkgMzMuMjEzNiAxNy43NzQ1IDMzLjE4NTggMTcuNzQ5MUMzMy4yMDczIDE3Ljc2ODggMzMuMjI4OCAxNy43ODg3IDMzLjI1MDMgMTcuODA4N0MzMy4zMDA5IDE3Ljg1NTYgMzMuMzUxNCAxNy45MDI1IDMzLjQwMTMgMTcuOTQ1MVpNMzIuMzIzOCAyNS45MTcyQzI5LjU1MTYgMjQuNzg3MiAyNi42NTE4IDIzLjYwNTEgMjcuMDgzNSAyMC4yODc1QzI4LjAwOTEgMjEuMjgwMiAyOS40NjIgMjEuNDg4NCAzMS4wNDIyIDIxLjcxNDlDMzIuNDc1NyAyMS45MjAzIDM0LjAxMzkgMjIuMTQwNyAzNS4zNTgzIDIyLjk3NTNDMzguNTMwNiAyNC45NDMzIDM4LjA2NzMgMjguNzY2NiAzNi45ODk3IDMwLjE3MzlDMzcuMDg2OSAyNy44NTg3IDM0Ljc1NDQgMjYuOTA4IDMyLjMyMzggMjUuOTE3MlpNMjEuMTU1MSAyNC4yNTY3QzIxLjg4NjggMjQuMTg2MyAyMy40NDYxIDIzLjgwNDIgMjIuNzQ4OSAyMi41NzEyQzIyLjU5ODkgMjIuMzIwNCAyMi4zODE1IDIyLjExNzIgMjIuMTIxNyAyMS45ODQ4QzIxLjg2MTkgMjEuODUyNSAyMS41NzAyIDIxLjc5NjUgMjEuMjgwMSAyMS44MjMyQzIwLjk4NTggMjEuODU1IDIwLjcwODIgMjEuOTc2OSAyMC40ODUyIDIyLjE3MjVDMjAuMjYyMiAyMi4zNjgxIDIwLjEwNDQgMjIuNjI3OCAyMC4wMzM0IDIyLjkxNjVDMTkuODE2OCAyMy43MjMgMjAuMDQ2MyAyNC4zNjQ5IDIxLjE1NTEgMjQuMjU2N1pNMjAuOTQ0OCAxNC41MDE0QzIwLjQ4NTggMTMuOTY4OCAxOS43NzM1IDEzLjY4OTUgMTkuMDc1MiAxMy41ODc4QzE5LjA0OTEgMTMuNzYyNSAxOS4wMzI2IDEzLjkzODUgMTkuMDI1NyAxNC4xMTVDMTguOTk0NCAxNS41Njg3IDE5LjUwODQgMTcuMTY1NCAyMC41MDMgMTguMjc1QzIwLjgyMTIgMTguNjMzNyAyMS4yMDQ5IDE4LjkyNzYgMjEuNjMzNCAxOS4xNDFDMjEuODgxMiAxOS4yNjIyIDIyLjUzODYgMTkuNTYzMSAyMi43ODIxIDE5LjI5MjVDMjIuODAwNiAxOS4yNjc3IDIyLjgxMjMgMTkuMjM4NCAyMi44MTU5IDE5LjIwNzZDMjIuODE5NSAxOS4xNzY4IDIyLjgxNDkgMTkuMTQ1NiAyMi44MDI2IDE5LjExNzJDMjIuNzYyMiAxOS4wMDEzIDIyLjY4NDMgMTguODk2MSAyMi42MDY5IDE4Ljc5MTdDMjIuNTUyIDE4LjcxNzcgMjIuNDk3NCAxOC42NDQxIDIyLjQ1NjcgMTguNTY3MkMyMi40MTU1IDE4LjQ4OTggMjIuMzcxNCAxOC40MTQyIDIyLjMyNzQgMTguMzM4OEwyMi4zMjc0IDE4LjMzODhDMjIuMjQ0NyAxOC4xOTcgMjIuMTYyMiAxOC4wNTU1IDIyLjA5ODkgMTcuOTAxNUMyMS45MzE5IDE3LjQ5ODQgMjEuODQ1IDE3LjA2OTggMjEuNzU4MyAxNi42NDI1TDIxLjc1ODMgMTYuNjQyNEwyMS43NTgzIDE2LjY0MjRMMjEuNzU4MyAxNi42NDIzTDIxLjc1ODIgMTYuNjQyMkwyMS43NTgyIDE2LjY0MjFMMjEuNzU4MiAxNi42NDJDMjEuNzQwOSAxNi41NTY2IDIxLjcyMzYgMTYuNDcxMiAyMS43MDU2IDE2LjM4NkMyMS41NzMxIDE1LjcyNjggMjEuNDAzOSAxNS4wMzQgMjAuOTQ0OCAxNC41MDE0Wk0zMC43NTI0IDI2LjA5OEMzMC4wNDAzIDI4LjA5NDMgMzEuMTg4OCAyOS43ODA0IDMyLjMzMDYgMzEuNDU2NkMzMy42MDc3IDMzLjMzMTUgMzQuODc2NCAzNS4xOTQgMzMuNTIyOCAzNy40NjQyQzM2LjE1MzIgMzYuMzczMSAzNy40MDIxIDMzLjA3NjkgMzYuMzEwNSAzMC40NjE2QzM1LjYyMjcgMjguODA3NCAzMy45NjQ5IDI3LjkxMDYgMzIuNDI2MSAyNy4wNzgzTDMyLjQyNjEgMjcuMDc4M0wzMi40MjYgMjcuMDc4MkMzMS44MjkgMjYuNzU1MyAzMS4yNDk5IDI2LjQ0MjEgMzAuNzUyNCAyNi4wOThaTTIzLjA1NTIgMzAuODYzM0MyMi41Nzg1IDMxLjA1ODcgMjIuMTI5IDMxLjMxNTIgMjEuNzE3OSAzMS42MjY1QzIyLjY1MjcgMzEuMjg1OSAyMy42MzM5IDMxLjA5MTQgMjQuNjI3NCAzMS4wNDk1QzI0LjgwNzQgMzEuMDM4OCAyNC45ODg3IDMxLjAzMDQgMjUuMTcxNSAzMS4wMjE5TDI1LjE3MTcgMzEuMDIxOUwyNS4xNzIgMzEuMDIxOUMyNS40ODc4IDMxLjAwNzMgMjUuODA4NSAzMC45OTI1IDI2LjEzNiAzMC45NjUxQzI2LjY3MjkgMzAuOTI4NSAyNy4yMDI1IDMwLjgxOTIgMjcuNzEwMyAzMC42NDAzQzI4LjI0MjUgMzAuNDUzMyAyOC43MjY4IDMwLjE1MDEgMjkuMTI4NCAyOS43NTI3QzI5LjUzNDIgMjkuMzQyNCAyOS44MTg4IDI4LjgyNzIgMjkuOTUwNiAyOC4yNjQyQzMwLjA2NjYgMjcuNzMyNCAzMC4wNTAzIDI3LjE4MDEgMjkuOTAzMiAyNi42NTYyQzI5Ljc1NiAyNi4xMzIyIDI5LjQ4MjUgMjUuNjUyOCAyOS4xMDY5IDI1LjI2MDNDMjkuMjg4MSAyNS43MjIxIDI5LjM5OTYgMjYuMjA4NCAyOS40Mzc3IDI2LjcwMzNDMjkuNDcwNSAyNy4xNjQgMjkuNDA4MSAyNy42MjY1IDI5LjI1NDUgMjguMDYxOEMyOS4xMDQ1IDI4LjQ3NDQgMjguODU5MyAyOC44NDU0IDI4LjUzOSAyOS4xNDQzQzI4LjIwODEgMjkuNDQ2MiAyNy44MjUgMjkuNjg0NiAyNy40MDg2IDI5Ljg0NzlDMjYuODI5OSAzMC4wODIxIDI2LjE3NTUgMzAuMTc3OSAyNS40OTM5IDMwLjI3NzdDMjUuMTgzIDMwLjMyMzIgMjQuODY2NCAzMC4zNjk2IDI0LjU0ODcgMzAuNDMwM0MyNC4wMzc4IDMwLjUyNDMgMjMuNTM3NCAzMC42Njk0IDIzLjA1NTIgMzAuODYzM1pNMzEuMzE4NyAzOS4xMDQ2TDMxLjI3MyAzOS4xNDE1TDMxLjI3MyAzOS4xNDE2QzMxLjE1MjUgMzkuMjM4OSAzMS4wMzAxIDM5LjMzNzkgMzAuODk4MiAzOS40MjY4QzMwLjczMDEgMzkuNTM4IDMwLjU1NCAzOS42MzY1IDMwLjM3MTMgMzkuNzIxMkMyOS45OTA4IDM5LjkwNzcgMjkuNTcyNiA0MC4wMDI5IDI5LjE0OTMgMzkuOTk5NEMyOC4wMDI4IDM5Ljk3NzggMjcuMTkyNCAzOS4xMjA1IDI2LjcxODMgMzguMTUxNkMyNi41OTQgMzcuODk3NyAyNi40ODQ1IDM3LjYzNTkgMjYuMzc1IDM3LjM3NDFMMjYuMzc1IDM3LjM3NDFDMjYuMTk5NyAzNi45NTUxIDI2LjAyNDQgMzYuNTM2MSAyNS43ODgzIDM2LjE0OUMyNS4yMzk5IDM1LjI0OTUgMjQuMzAxMyAzNC41MjUzIDIzLjIwMjIgMzQuNjU5NUMyMi43NTM5IDM0LjcxNTggMjIuMzMzNiAzNC45MTgyIDIyLjA4NDcgMzUuMzA5QzIxLjQyOTUgMzYuMzI5OCAyMi4zNzAzIDM3Ljc1OTggMjMuNTY5NiAzNy41NTczQzIzLjY3MTYgMzcuNTQxNyAyMy43NzE0IDM3LjUxNDEgMjMuODY3IDM3LjQ3NTFDMjMuOTYyMyAzNy40MzQzIDI0LjA1MTIgMzcuMzggMjQuMTMxIDM3LjMxMzhDMjQuMjk4NiAzNy4xNzM2IDI0LjQyNDggMzYuOTkwMyAyNC40OTYzIDM2Ljc4MzRDMjQuNTc1MSAzNi41Njc2IDI0LjU5MjYgMzYuMzM0MSAyNC41NDcgMzYuMTA5QzI0LjQ5NzggMzUuODczNiAyNC4zNTk0IDM1LjY2NjggMjQuMTYxMiAzNS41MzJDMjQuMzkxNyAzNS42NDA0IDI0LjU3MTMgMzUuODM0NSAyNC42NjIzIDM2LjA3MzJDMjQuNzU2NiAzNi4zMTkgMjQuNzgwOSAzNi41ODYyIDI0LjczMjMgMzYuODQ1MUMyNC42ODUyIDM3LjExNDcgMjQuNTY2OSAzNy4zNjY3IDI0LjM4OTYgMzcuNTc0N0MyNC4yOTU1IDM3LjY4MTYgMjQuMTg2NiAzNy43NzQ2IDI0LjA2NjQgMzcuODUwN0MyMy45NDcyIDM3LjkyNTkgMjMuODE5NSAzNy45ODY2IDIzLjY4NiAzOC4wMzE1QzIzLjQxNTMgMzguMTI0NCAyMy4xMjcyIDM4LjE1NDQgMjIuODQzMyAzOC4xMTkyQzIyLjQ0NDcgMzguMDYyMSAyMi4wNjg4IDM3Ljg5ODMgMjEuNzU1IDM3LjY0NUMyMS42OTcgMzcuNTk5IDIxLjY0MTQgMzcuNTUwOCAyMS41ODc1IDM3LjUwMDhDMjEuMzc0IDM3LjMxNTggMjEuMTgwMiAzNy4xMDg3IDIxLjAwOTMgMzYuODgyOUMyMC45MzI2IDM2Ljc5ODEgMjAuODU0NyAzNi43MTQ0IDIwLjc3MzMgMzYuNjM0QzIwLjM4OTEgMzYuMjI5IDE5LjkzNTggMzUuODk2NSAxOS40MzQ5IDM1LjY1MjJDMTkuMDg5NSAzNS40OTk4IDE4LjcyOCAzNS4zODcyIDE4LjM1NzQgMzUuMzE2NkMxOC4xNzA5IDM1LjI3NzYgMTcuOTgyNCAzNS4yNDk1IDE3Ljc5MzggMzUuMjI1N0MxNy43NzMzIDM1LjIyMzYgMTcuNzM0IDM1LjIxNjcgMTcuNjg1IDM1LjIwODJMMTcuNjg0NyAzNS4yMDgxTDE3LjY4NDYgMzUuMjA4MUwxNy42ODQ2IDM1LjIwODFMMTcuNjg0NiAzNS4yMDgxTDE3LjY4NDUgMzUuMjA4MUMxNy41MjcxIDM1LjE4MDYgMTcuMjcxMSAzNS4xMzYgMTcuMjI1OSAzNS4xNzhDMTcuODA4OCAzNC42MzkgMTguNDQ0MSAzNC4xNjAzIDE5LjEyMjQgMzMuNzQ5MUMxOS44MTg5IDMzLjMzNCAyMC41NjY3IDMzLjAxMjYgMjEuMzQ2NiAzMi43OTMzQzIyLjE1NTEgMzIuNTY0NyAyMy4wMDA5IDMyLjQ5OTUgMjMuODM0NyAzMi42MDE3QzI0LjI2MzkgMzIuNjUzNSAyNC42ODQzIDMyLjc2MjcgMjUuMDg0NyAzMi45MjY0QzI1LjUwNDIgMzMuMDk0OCAyNS44OTE0IDMzLjMzNTEgMjYuMjI5MSAzMy42MzY2QzI2LjU2MzIgMzMuOTUyOCAyNi44MzMzIDM0LjMzMTEgMjcuMDI0MyAzNC43NTA0QzI3LjE5NjggMzUuMTQzMSAyNy4zMjU0IDM1LjU1MzcgMjcuNDA3OSAzNS45NzQ3QzI3LjQ1MjEgMzYuMjAxMyAyNy40ODU1IDM2LjQ1MDIgMjcuNTE5OSAzNi43MDc5TDI3LjUyIDM2LjcwNzlMMjcuNTIgMzYuNzA4TDI3LjUyIDM2LjcwOEMyNy42NzcxIDM3Ljg4MjMgMjcuODU4NSAzOS4yMzcyIDI5LjIwNDMgMzkuNDczM0MyOS4yODk4IDM5LjQ5IDI5LjM3NjEgMzkuNTAyMyAyOS40NjI5IDM5LjUxMDJMMjkuNzMxMiAzOS41MTY2QzI5LjkxNTcgMzkuNTAzNCAzMC4wOTkgMzkuNDc3IDMwLjI3OTcgMzkuNDM3NkMzMC42NTQxIDM5LjM0OTIgMzEuMDE5IDM5LjIyNDEgMzEuMzY5MSAzOS4wNjQyTDMxLjMxODcgMzkuMTA0NlpNMjEuMDgwMSAzNi45NjE5QzIxLjExMjMgMzYuOTk4OSAyMS4xNDQ5IDM3LjAzNTUgMjEuMTc3OSAzNy4wNzE4QzIxLjE2NDQgMzcuMDU2NyAyMS4xNTEgMzcuMDQxNSAyMS4xMzc1IDM3LjAyNjRMMjEuMTM3NSAzNy4wMjY0TDIxLjEzNzUgMzcuMDI2NEwyMS4xMzc1IDM3LjAyNjRDMjEuMTE4NCAzNy4wMDQ5IDIxLjA5OTMgMzYuOTgzNCAyMS4wODAxIDM2Ljk2MTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvcGF0aD48L3N2Zz4K',
    protocol: 'uniswap_v3',
    
    slippage: true,
    fees: [100, 500, 3000, 10000],
    
    blockchains: ['ethereum', 'bsc', 'polygon', 'optimism', 'arbitrum', 'base', 'avalanche', 'worldchain', 'gnosis'],
    
    ethereum: {
      router: {
        address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    bsc: {
      router: {
        address: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    polygon: {
      router: {
        address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    optimism: {
      router: {
        address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    arbitrum: {
      router: {
        address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    base: {
      router: {
        address: '0x2626664c2603336E57B271c5C0b26F421741e481',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    avalanche: {
      router: {
        address: '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    worldchain: {
      router: {
        address: '0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0x7a5028BDa40e7B173C278C5342087826455ea25a',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x10158D43e6cc414deE1Bd1eB0EfC6a5cBCfF244c',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

    gnosis: {
      router: {
        address: '0xc6D25285D5C5b62b7ca26D6092751A145D50e9Be',
        api: UniswapV3.ROUTER
      },
      factory: {
        address: '0xe32F7dD7e3f098D518ff19A22d5f028e076489B1',
        api: UniswapV3.FACTORY
      },
      pool: {
        api: UniswapV3.POOL
      },
      quoter: {
        address: '0x7E9cB3499A6cee3baBe5c8a3D328EA7FD36578f4',
        api: UniswapV3.QUOTER
      },
      permit: {
        address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
        api: UniswapV3.PERMIT2
      }
    },

  };

  var uniswap_v3 = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$9, {
        scope,
        findPath: (args)=>UniswapV3.findPath({ ...args, exchange: exchange$9 }),
        pathExists: (args)=>UniswapV3.pathExists({ ...args, exchange: exchange$9 }),
        getAmounts: (args)=>UniswapV3.getAmounts({ ...args, exchange: exchange$9 }),
        getPrep: (args)=>UniswapV3.getPrep({ ...args, exchange: exchange$9 }),
        getTransaction: (args)=>UniswapV3.getTransaction({ ...args, exchange: exchange$9 }),
      })
    )
  };

  let pathExists = async ({ blockchain, path }) => {
    if(!path || path.length !== 2) { return false }
    return (
      path.includes(Blockchains__default['default'][blockchain].currency.address) &&
      path.includes(Blockchains__default['default'][blockchain].wrapped.address)
    )
  };

  let findPath = async ({ blockchain, tokenIn, tokenOut }) => {
    if(
      ![tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].currency.address) ||
      ![tokenIn, tokenOut].includes(Blockchains__default['default'][blockchain].wrapped.address)
    ) { return { path: undefined, exchangePath: undefined } }

    let path = [tokenIn, tokenOut];

    return { path, exchangePath: path }
  };

  let getAmounts = async ({
    path,
    block,
    tokenIn,
    tokenOut,
    amountOut,
    amountIn,
    amountInMax,
    amountOutMin
  }) => {

    if (amountOut) {
      amountIn = amountInMax = amountOutMin = amountOut;
    } else if (amountIn) {
      amountOut = amountInMax = amountOutMin = amountIn;
    } else if(amountOutMin) {
      amountIn = amountInMax = amountOut = amountOutMin;
    } else if(amountInMax) {
      amountOut = amountOutMin = amountIn = amountInMax;
    }

    return { amountOut, amountIn, amountInMax, amountOutMin }
  };

  let getTransaction = ({
    exchange,
    blockchain,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    amountInInput,
    amountOutInput,
    amountInMaxInput,
    amountOutMinInput,
    account
  }) => {
    
    let transaction = {
      blockchain: blockchain,
      from: account,
      to: exchange[blockchain].router.address,
      api: exchange[blockchain].router.api,
    };

    if (path[0] === Blockchains__default['default'][blockchain].currency.address && path[1] === Blockchains__default['default'][blockchain].wrapped.address) {
      transaction.method = 'deposit';
      transaction.value = amountIn.toString();
      return transaction
    } else if (path[0] === Blockchains__default['default'][blockchain].wrapped.address && path[1] === Blockchains__default['default'][blockchain].currency.address) {
      transaction.method = 'withdraw';
      transaction.value = 0;
      transaction.params = { wad: amountIn };
      return transaction
    }
  };

  const WETH = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

  var WETH$1 = {
    findPath,
    pathExists,
    getAmounts,
    getTransaction,
    WETH,
  };

  const exchange$8 = {
    
    name: 'wavax',
    label: 'Wrapped Avax',
    logo: Blockchains__default['default'].avalanche.wrapped.logo,
    protocol: 'weth',
    
    slippage: false,
    
    blockchains: ['avalanche'],

    avalanche: {
      router: {
        address: Blockchains__default['default'].avalanche.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var wavax = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$8, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$8 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$8 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$8 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$8 }),
      })
    )
  };

  const exchange$7 = {
    
    name: 'wbnb',
    label: 'Wrapped BNB',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOTIgMTkyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxOTIgMTkyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0YwQjkwQjt9Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NCw0MS4xbDQyLTI0LjJsNDIsMjQuMmwtMTUuNCw4LjlMOTYsMzQuOUw2OS40LDUwTDU0LDQxLjF6IE0xMzgsNzEuN2wtMTUuNC04LjlMOTYsNzhMNjkuNCw2Mi43bC0xNS40LDl2MTgKCUw4MC42LDEwNXYzMC41bDE1LjQsOWwxNS40LTlWMTA1TDEzOCw4OS43VjcxLjd6IE0xMzgsMTIwLjN2LTE4bC0xNS40LDguOXYxOEMxMjIuNiwxMjkuMSwxMzgsMTIwLjMsMTM4LDEyMC4zeiBNMTQ4LjksMTI2LjQKCWwtMjYuNiwxNS4zdjE4bDQyLTI0LjJWODdsLTE1LjQsOUMxNDguOSw5NiwxNDguOSwxMjYuNCwxNDguOSwxMjYuNHogTTEzMy41LDU2LjRsMTUuNCw5djE4bDE1LjQtOXYtMThsLTE1LjQtOUwxMzMuNSw1Ni40CglMMTMzLjUsNTYuNHogTTgwLjYsMTQ4LjN2MThsMTUuNCw5bDE1LjQtOXYtMThMOTYsMTU3LjFMODAuNiwxNDguM3ogTTU0LDEyMC4zbDE1LjQsOXYtMTguMUw1NCwxMDIuM0w1NCwxMjAuM0w1NCwxMjAuM3oKCSBNODAuNiw1Ni40bDE1LjQsOWwxNS40LTlMOTYsNDcuNUM5Niw0Ny40LDgwLjYsNTYuNCw4MC42LDU2LjRMODAuNiw1Ni40eiBNNDMuMSw2NS40bDE1LjQtOWwtMTUuNC05bC0xNS40LDl2MThsMTUuNCw5TDQzLjEsNjUuNAoJTDQzLjEsNjUuNHogTTQzLjEsOTUuOUwyNy43LDg3djQ4LjVsNDIsMjQuMnYtMThsLTI2LjYtMTUuM1Y5NS45TDQzLjEsOTUuOXoiLz4KPC9zdmc+Cg==',
    
    slippage: false,

    blockchains: ['bsc'],

    bsc: {
      router: {
        address: Blockchains__default['default'].bsc.wrapped.address,
        api: WETH$1.WETH
      }
    }
  };

  var wbnb = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$7, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$7 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$7 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$7 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$7 }),
      })
    )
  };

  const exchange$6 = {
    
    name: 'weth',
    label: 'Wrapped Ethereum',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['ethereum'],

    ethereum: {
      router: {
        address: Blockchains__default['default'].ethereum.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var weth = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$6, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$6 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$6 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$6 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$6 }),
      })
    )
  };

  const exchange$5 = {
    
    name: 'weth_arbitrum',
    label: 'Wrapped Ethereum',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['arbitrum'],

    arbitrum: {
      router: {
        address: Blockchains__default['default'].arbitrum.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var weth_arbitrum = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$5, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$5 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$5 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$5 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$5 }),
      })
    )
  };

  const exchange$4 = {
    
    name: 'weth_optimism',
    label: 'Wrapped Ethereum',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['optimism'],

    optimism: {
      router: {
        address: Blockchains__default['default'].optimism.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var weth_optimism = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$4, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$4 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$4 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$4 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$4 }),
      })
    )
  };

  const exchange$3 = {
    
    name: 'weth_base',
    label: 'Wrapped Ethereum',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIKCSBpZD0iTGF5ZXJfMSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjgzLjUgMjgzLjUiCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgzLjUgMjgzLjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMzQzNDM0O30KCS5zdDF7ZmlsbDojOEM4QzhDO30KCS5zdDJ7ZmlsbDojM0MzQzNCO30KCS5zdDN7ZmlsbDojMTQxNDE0O30KCS5zdDR7ZmlsbDojMzkzOTM5O30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjcsMjUuOWwtMS41LDUuMnYxNTMuM2wxLjUsMS41bDcxLjItNDIuMUwxNDEuNywyNS45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNS45TDcwLjYsMTQzLjhsNzEuMSw0Mi4xdi03NC40VjI1Ljl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MS43LDE5OS40bC0wLjgsMS4xdjU0LjZsMC44LDIuNWw3MS4yLTEwMC4zTDE0MS43LDE5OS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDEuNywyNTcuNnYtNTguMmwtNzEuMS00Mi4xTDE0MS43LDI1Ny42eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNDEuNywxODUuOWw3MS4yLTQyLjFsLTcxLjItMzIuM1YxODUuOXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNzAuNiwxNDMuOGw3MS4xLDQyLjF2LTc0LjRMNzAuNiwxNDMuOHoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['base'],

    base: {
      router: {
        address: Blockchains__default['default'].base.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var weth_base = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$3, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$3 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$3 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$3 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$3 }),
      })
    )
  };

  const exchange$2 = {
    
    name: 'wftm',
    label: 'Wrapped Fantom',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTkyIDE5MiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTkyIDE5MjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iY2lyY2xlIj4KCTxnIGlkPSJGYW50b20tY2lyY2xlIj4KCQk8Y2lyY2xlIGlkPSJPdmFsIiBmaWxsUnVsZT0iZXZlbm9kZCIgY2xpcFJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMxOTY5RkYiIGNsYXNzPSJzdDAiIGN4PSI5NiIgY3k9Ijk2IiByPSI4MC40Ii8+CgkJPHBhdGggaWQ9IlNoYXBlIiBmaWxsPSIjRkZGRkZGIiBkPSJNOTEuMSw0MS4yYzIuNy0xLjQsNi44LTEuNCw5LjUsMGwyNy42LDE0LjZjMS42LDAuOSwyLjUsMi4xLDIuNywzLjVoMHY3My4zCgkJCWMwLDEuNC0wLjksMi45LTIuNywzLjhsLTI3LjYsMTQuNmMtMi43LDEuNC02LjgsMS40LTkuNSwwbC0yNy42LTE0LjZjLTEuOC0wLjktMi42LTIuNC0yLjctMy44YzAtMC4xLDAtMC4zLDAtMC40bDAtNzIuNAoJCQljMC0wLjEsMC0wLjIsMC0wLjNsMC0wLjJoMGMwLjEtMS4zLDEtMi42LDIuNi0zLjVMOTEuMSw0MS4yeiBNMTI2LjYsOTkuOWwtMjYsMTMuN2MtMi43LDEuNC02LjgsMS40LTkuNSwwTDY1LjIsMTAwdjMyLjMKCQkJbDI1LjksMTMuNmMxLjUsMC44LDMuMSwxLjYsNC43LDEuN2wwLjEsMGMxLjUsMCwzLTAuOCw0LjYtMS41bDI2LjItMTMuOVY5OS45eiBNNTYuNSwxMzAuOWMwLDIuOCwwLjMsNC43LDEsNgoJCQljMC41LDEuMSwxLjMsMS45LDIuOCwyLjlsMC4xLDAuMWMwLjMsMC4yLDAuNywwLjQsMS4xLDAuN2wwLjUsMC4zbDEuNiwwLjlsLTIuMiwzLjdsLTEuNy0xLjFsLTAuMy0wLjJjLTAuNS0wLjMtMC45LTAuNi0xLjMtMC44CgkJCWMtNC4yLTIuOC01LjctNS45LTUuNy0xMi4zbDAtMC4ySDU2LjV6IE05My44LDgwLjVjLTAuMiwwLjEtMC40LDAuMS0wLjYsMC4yTDY1LjYsOTUuM2MwLDAtMC4xLDAtMC4xLDBsMCwwbDAsMGwwLjEsMGwyNy42LDE0LjYKCQkJYzAuMiwwLjEsMC40LDAuMiwwLjYsMC4yVjgwLjV6IE05OC4yLDgwLjV2MjkuOGMwLjItMC4xLDAuNC0wLjEsMC42LTAuMmwyNy42LTE0LjZjMCwwLDAuMSwwLDAuMSwwbDAsMGwwLDBsLTAuMSwwTDk4LjgsODAuNwoJCQlDOTguNiw4MC42LDk4LjQsODAuNSw5OC4yLDgwLjV6IE0xMjYuNiw2NC40bC0yNC44LDEzbDI0LjgsMTNWNjQuNHogTTY1LjIsNjQuNHYyNi4xbDI0LjgtMTNMNjUuMiw2NC40eiBNOTguNyw0NS4xCgkJCWMtMS40LTAuOC00LTAuOC01LjUsMEw2NS42LDU5LjdjMCwwLTAuMSwwLTAuMSwwbDAsMGwwLDBsMC4xLDBsMjcuNiwxNC42YzEuNCwwLjgsNCwwLjgsNS41LDBsMjcuNi0xNC42YzAsMCwwLjEsMCwwLjEsMGwwLDBsMCwwCgkJCWwtMC4xLDBMOTguNyw0NS4xeiBNMTMwLjcsNDYuNWwxLjcsMS4xbDAuMywwLjJjMC41LDAuMywwLjksMC42LDEuMywwLjhjNC4yLDIuOCw1LjcsNS45LDUuNywxMi4zbDAsMC4yaC00LjNjMC0yLjgtMC4zLTQuNy0xLTYKCQkJYy0wLjUtMS4xLTEuMy0xLjktMi44LTIuOWwtMC4xLTAuMWMtMC4zLTAuMi0wLjctMC40LTEuMS0wLjdsLTAuNS0wLjNsLTEuNi0wLjlMMTMwLjcsNDYuNXoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['fantom'],

    fantom: {
      router: {
        address: Blockchains__default['default'].fantom.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var wftm = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$2, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$2 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$2 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$2 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$2 }),
      })
    )
  };

  const exchange$1 = {
    
    name: 'wmatic',
    label: 'Wrapped MATIC',
    logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0NS40IDQ1LjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1LjQgNDUuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM4MjQ3RTU7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzEuOSwxNi42Yy0wLjctMC40LTEuNi0wLjQtMi4yLDBsLTUuMywzLjFsLTMuNSwybC01LjEsMy4xYy0wLjcsMC40LTEuNiwwLjQtMi4yLDBsLTQtMi40CgljLTAuNi0wLjQtMS4xLTEuMS0xLjEtMnYtNC42YzAtMC45LDAuNS0xLjYsMS4xLTJsNC0yLjNjMC43LTAuNCwxLjUtMC40LDIuMiwwbDQsMi40YzAuNywwLjQsMS4xLDEuMSwxLjEsMnYzLjFsMy41LTIuMXYtMy4yCgljMC0wLjktMC40LTEuNi0xLjEtMmwtNy41LTQuNGMtMC43LTAuNC0xLjUtMC40LTIuMiwwTDYsMTEuN2MtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjh2OC43YzAsMC45LDAuNCwxLjYsMS4xLDJsNy42LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw1LjEtMi45bDMuNS0yLjFsNS4xLTIuOWMwLjctMC40LDEuNi0wLjQsMi4yLDBsNCwyLjNjMC43LDAuNCwxLjEsMS4xLDEuMSwydjQuNmMwLDAuOS0wLjQsMS42LTEuMSwyCglsLTMuOSwyLjNjLTAuNywwLjQtMS41LDAuNC0yLjIsMGwtNC0yLjNjLTAuNy0wLjQtMS4xLTEuMS0xLjEtMnYtMi45TDIxLDI4Ljd2My4xYzAsMC45LDAuNCwxLjYsMS4xLDJsNy41LDQuNAoJYzAuNywwLjQsMS41LDAuNCwyLjIsMGw3LjUtNC40YzAuNy0wLjQsMS4xLTEuMSwxLjEtMlYyM2MwLTAuOS0wLjQtMS42LTEuMS0yQzM5LjIsMjEsMzEuOSwxNi42LDMxLjksMTYuNnoiLz4KPC9zdmc+Cg==',
    protocol: 'weth',
    
    slippage: false,

    blockchains: ['polygon'],
    
    polygon: {
      router: {
        address: Blockchains__default['default'].polygon.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var wmatic = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange$1, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange: exchange$1 }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange: exchange$1 }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange: exchange$1 }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange: exchange$1 }),
      })
    )
  };

  const exchange = {
    
    name: 'wxdai',
    label: 'Wrapped XDAI',
    logo: Blockchains__default['default'].gnosis.wrapped.logo,
    protocol: 'weth',

    slippage: false,

    blockchains: ['gnosis'],
    
    gnosis: {
      router: {
        address: Blockchains__default['default'].gnosis.wrapped.address,
        api: WETH$1.WETH
      },
    }
  };

  var wxdai = (scope)=>{
    
    return new Exchange(

      Object.assign(exchange, {
        scope,
        findPath: (args)=>WETH$1.findPath({ ...args, exchange }),
        pathExists: (args)=>WETH$1.pathExists({ ...args, exchange }),
        getAmounts: (args)=>WETH$1.getAmounts({ ...args, exchange }),
        getPrep: (args)=>{},
        getTransaction: (args)=>WETH$1.getTransaction({ ...args, exchange }),
      })
    )
  };

  const exchanges = [
    orca(),
    raydium_cp(),
    raydium_cl(),
    uniswap_v3(),
    pancakeswap_v3(),
    uniswap_v2(),
    pancakeswap(),
    trader_joe_v2_1(),
    quickswap(),
    spookyswap(),
    weth(),
    weth_optimism(),
    weth_base(),
    weth_arbitrum(),
    wbnb(),
    wmatic(),
    wftm(),
    wavax(),
    wxdai(),
  ];
  exchanges.forEach((exchange)=>{
    exchanges[exchange.name] = exchange;
  });

  exchanges.ethereum = [
    uniswap_v3('ethereum'),
    uniswap_v2('ethereum'),
    weth('ethereum'),
  ];
  exchanges.ethereum.forEach((exchange)=>{ exchanges.ethereum[exchange.name] = exchange; });

  exchanges.bsc = [
    pancakeswap_v3('bsc'),
    uniswap_v3('bsc'),
    pancakeswap('bsc'),
    wbnb('bsc'),
  ];
  exchanges.bsc.forEach((exchange)=>{ exchanges.bsc[exchange.name] = exchange; });

  exchanges.polygon = [
    uniswap_v3('polygon'),
    quickswap('polygon'),
    wmatic('polygon'),
  ];
  exchanges.polygon.forEach((exchange)=>{ exchanges.polygon[exchange.name] = exchange; });

  exchanges.solana = [
    orca('solana'),
    raydium_cp('solana'),
    raydium_cl('solana'),
  ];
  exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange; });

  exchanges.optimism = [
    uniswap_v3('optimism'),
    weth_optimism('optimism'),
  ];
  exchanges.optimism.forEach((exchange)=>{ exchanges.optimism[exchange.name] = exchange; });

  exchanges.base = [
    uniswap_v3('base'),
    uniswap_v2('base'),
    weth_base('base'),
  ];
  exchanges.base.forEach((exchange)=>{ exchanges.base[exchange.name] = exchange; });

  exchanges.arbitrum = [
    uniswap_v3('arbitrum'),
    weth_arbitrum('arbitrum'),
  ];
  exchanges.arbitrum.forEach((exchange)=>{ exchanges.arbitrum[exchange.name] = exchange; });

  exchanges.fantom = [
    spookyswap('fantom'),
    wftm('fantom'),
  ];
  exchanges.fantom.forEach((exchange)=>{ exchanges.fantom[exchange.name] = exchange; });

  exchanges.avalanche = [
    uniswap_v3('avalanche'),
    trader_joe_v2_1('avalanche'),
    wavax('avalanche'),
  ];
  exchanges.avalanche.forEach((exchange)=>{ exchanges.avalanche[exchange.name] = exchange; });

  exchanges.gnosis = [
    uniswap_v3('gnosis'),
    wxdai('gnosis'),
  ];
  exchanges.gnosis.forEach((exchange)=>{ exchanges.gnosis[exchange.name] = exchange; });

  exchanges.worldchain = [
    uniswap_v3('worldchain'),
  ];
  exchanges.worldchain.forEach((exchange)=>{ exchanges.worldchain[exchange.name] = exchange; });

  let route = ({
    blockchain,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
  }) => {
    return Promise.all(
      exchanges[blockchain].map((exchange) => {
        return exchange.route({
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          amountInMax,
          amountOutMin,
        })
      }),
    )
    .then((routes)=>{
      return routes.filter(Boolean).sort((a, b)=>{
        if ((amountIn || amountInMax) ? (BigInt(a.amountOut) < BigInt(b.amountOut)) : (BigInt(a.amountIn) > BigInt(b.amountIn))) {
          return 1;
        }
        if ((amountIn || amountInMax) ? (BigInt(a.amountOut) > BigInt(b.amountOut)) : (BigInt(a.amountIn) < BigInt(b.amountIn))) {
          return -1;
        }
        return 0;
      })
    })
  };

  exchanges.route = route;

  return exchanges;

})));
