"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = require("web3");
const rlp = require("rlp");
const event_emitter_es6_1 = require("event-emitter-es6");
const bn_js_1 = require("bn.js");
const HttpHeaderProvider = require("httpheaderprovider");
const IMKEY_MANAGER_ENDPOINT = "http://localhost:8081/api/imkey";
const IMKEY_ETH_PATH = "m/44'/60'/0'/0/0";
let requestId = 0;
function createJsonRpcRequest(method, params = []) {
    return {
        id: requestId++,
        jsonrpc: "2.0",
        method,
        params,
    };
}
function createJsonRpcResponse(id, result) {
    return {
        id,
        jsonrpc: "2.0",
        result,
    };
}
function createProviderRpcError(code, message) {
    return {
        message,
        code,
    };
}
function chainId2InfuraNetwork(chainId) {
    switch (chainId) {
        case 3:
            return "ropsten";
        case 4:
            return "rinkeby";
        case 5:
            return "goerli";
        case 42:
            return "kovan";
        default:
            return "mainnet";
    }
}
function parseArgsNum(num) {
    if (num instanceof bn_js_1.BN) {
        return num.toNumber().toString();
    }
    else if (typeof num === "string") {
        return web3_1.default.utils.hexToNumberString(num);
    }
    else {
        return num.toString();
    }
}
class ImKeyProvider extends event_emitter_es6_1.default {
    constructor(config) {
        super();
        let rpcUrl = config.rpcUrl;
        this.chainId = config.chainId ?  ? 1 :  : ;
        if (config.infuraId) {
            const network = chainId2InfuraNetwork(this.chainId);
            rpcUrl = `https://${network}.infura.io/v3/${config.infuraId}`;
        }
        // @ts-ignore
        this.infuraProvider = new web3_1.default.providers.HttpProvider(rpcUrl);
        if (config.headers) {
            this.configProvider = new HttpHeaderProvider(rpcUrl, config.headers);
        }
    }
    callInnerProviderApi(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.infuraProvider.send(req, (error, result) => {
                    if (error) {
                        reject(createProviderRpcError(4001, error.message));
                    }
                    else {
                        resolve(result.result);
                    }
                });
            });
        });
    }
    callProviderApiWithHeader(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.configProvider.send(req, (error, result) => {
                    if (error) {
                        reject(createProviderRpcError(4001, error.message));
                    }
                    else {
                        resolve(result.result);
                    }
                });
            });
        });
    }
    enable() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this.imKeyRequestAccounts(requestId++);
            const chainIdHex = yield this.callInnerProviderApi(createJsonRpcRequest("eth_chainId"));
            const chainId = web3_1.default.utils.hexToNumber(chainIdHex);
            if (chainId !== this.chainId) {
                throw new Error("chain id and rpc endpoint don't match");
            }
            else {
                this.emit("connect", { chainId });
                return accounts;
            }
        });
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (args.method) {
                case "eth_getChainId": {
                    return this.chainId;
                }
                /* eslint-disable no-fallthrough */
                case "personal_listAccounts":
                /* eslint-disable no-fallthrough */
                case "eth_accounts":
                /* eslint-disable no-fallthrough */
                case "eth_requestAccounts": {
                    return yield this.imKeyRequestAccounts(requestId++);
                }
                case "personal_sign": {
                    return yield this.imKeyPersonalSign(requestId++, args.params[0], args.params[1]);
                }
                case "eth_signTransaction": {
                    return yield this.imKeySignTransaction(requestId++, args.params[0]);
                }
                case "eth_sendTransaction": {
                    const ret = yield this.imKeySignTransaction(requestId++, args.params[0]);
                    const req = createJsonRpcRequest("eth_sendRawTransaction", [ret.raw]);
                    if (this.configProvider) {
                        return yield this.callProviderApiWithHeader(req);
                    }
                    else {
                        return yield this.callInnerProviderApi(req);
                    }
                }
                /* eslint-disable no-fallthrough */
                case "eth_sign":
                // https://docs.metamask.io/guide/signing-data.html#a-brief-history
                //
                /* eslint-disable no-fallthrough */
                case "eth_signTypedData":
                // case 'eth_signTypedData_v1':
                /* eslint-disable no-fallthrough */
                case "eth_signTypedData_v3":
                /* eslint-disable no-fallthrough */
                case "eth_signTypedData_v4": {
                    return createProviderRpcError(4200, `${args.method} is not support now`);
                }
                default: {
                    const payload = {
                        jsonrpc: "2.0",
                        method: args.method,
                        params: args.params,
                        id: requestId++,
                    };
                    return yield this.callInnerProviderApi(payload);
                }
            }
        });
    }
    sendAsync(args, callback) {
        this.request(args)
            .then((ret) => callback(null, createJsonRpcResponse(args.id, ret)))
            .catch((err) => callback(err, null));
    }
    imKeyRequestAccounts(id, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ret = yield callImKeyApi({
                    jsonrpc: "2.0",
                    method: "eth.getAddress",
                    params: {
                        path: IMKEY_ETH_PATH,
                    },
                    id: requestId++,
                });
                callback ? .(null, [ret.result ? .address : ]) : ;
                return [ret.result ? .address : ];
            }
            catch (error) {
                callback ? .(error, null) : ;
                throw createProviderRpcError(4001, error);
            }
        });
    }
    imKeySignTransaction(id, transactionConfig, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!transactionConfig.to ||
                !transactionConfig.value) {
                throw createProviderRpcError(-32602, "expected to,value");
            }
            //from
            let from;
            if (!transactionConfig.from ||
                typeof transactionConfig.from === "number") {
                const accounts = yield this.imKeyRequestAccounts(requestId++);
                from = accounts[0];
            }
            else {
                from = web3_1.default.utils.toChecksumAddress(transactionConfig.from);
            }
            //gas price
            let gasPrice;
            if (transactionConfig.gasPrice) {
                gasPrice = parseArgsNum(transactionConfig.gasPrice);
            }
            else {
                gasPrice = yield this.callInnerProviderApi(createJsonRpcRequest("eth_gasPrice", []));
                gasPrice = web3_1.default.utils.hexToNumberString(gasPrice);
            }
            //chain id
            let chainId;
            if (transactionConfig.chainId) {
                if (transactionConfig.chainId !== this.chainId) {
                    throw createProviderRpcError(-32602, "expected chainId and connected chainId are mismatched");
                }
                chainId = transactionConfig.chainId;
            }
            else {
                chainId = this.chainId;
            }
            //nonce
            let nonce;
            if (transactionConfig.nonce) {
                nonce = parseArgsNum(transactionConfig.nonce);
            }
            else {
                nonce = yield this.callInnerProviderApi(createJsonRpcRequest("eth_getTransactionCount", [transactionConfig.from, "pending"]));
                nonce = web3_1.default.utils.hexToNumber(nonce).toString();
            }
            //estimate gas
            let gasLimit;
            if (transactionConfig.gas) {
                gasLimit = parseArgsNum(transactionConfig.gas);
            }
            else {
                const gasRet = yield this.callInnerProviderApi(createJsonRpcRequest("eth_estimateGas", [
                    {
                        from: transactionConfig.from,
                        to: transactionConfig.to,
                        gas: transactionConfig.gas,
                        gasPrice: gasPrice,
                        value: transactionConfig.value,
                        data: transactionConfig.data,
                    },
                ]));
                gasLimit = parseArgsNum(gasRet);
            }
            //fee
            let fee = (BigInt(gasLimit) * BigInt(gasPrice)).toString(); //wei
            fee = web3_1.default.utils.fromWei(fee, "Gwei"); //to Gwei
            const temp = Math.ceil(Number(fee));
            fee = (temp * 1000000000).toString(); //to ether
            fee = web3_1.default.utils.fromWei(fee) + " ether";
            const to = web3_1.default.utils.toChecksumAddress(transactionConfig.to);
            const value = parseArgsNum(transactionConfig.value);
            const valueInWei = web3_1.default.utils.fromWei(value);
            try {
                const ret = yield callImKeyApi({
                    jsonrpc: "2.0",
                    method: "eth.signTransaction",
                    params: {
                        transaction: {
                            data: transactionConfig.data,
                            gasLimit,
                            gasPrice,
                            nonce,
                            to,
                            value,
                            chainId,
                            path: IMKEY_ETH_PATH,
                        },
                        preview: {
                            payment: valueInWei + " ETH",
                            receiver: to,
                            sender: from,
                            fee: fee,
                        },
                    },
                    id: requestId++,
                });
                let txData = ret.result ? .txData : ;
                if (!ret.result ? .txData ? .startsWith("0x") :  : ) {
                    txData = "0x" + txData;
                }
                const decoded = rlp.decode(txData, true);
                const rlpTX = {
                    raw: txData,
                    tx: {
                        nonce: nonce,
                        gasPrice: gasPrice,
                        gas: gasLimit,
                        to: to,
                        value: valueInWei,
                        input: transactionConfig.data,
                        // @ts-ignore
                        r: web3_1.default.utils.bytesToHex(decoded.data[7]),
                        // @ts-ignore
                        s: web3_1.default.utils.bytesToHex(decoded.data[8]),
                        // @ts-ignore
                        v: web3_1.default.utils.bytesToHex(decoded.data[6]),
                        hash: ret.result ? .txHash : ,
                    },
                };
                callback ? .(null, rlpTX) : ;
                return rlpTX;
            }
            catch (error) {
                callback ? .(error, null) : ;
                throw createProviderRpcError(4001, error);
            }
        });
    }
    imKeyPersonalSign(id, dataToSign, address, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Number.isInteger(address)) {
                const error = createProviderRpcError(-32602, "Pass the address to sign data with for now");
                callback ? .({
                    name: "address invalid",
                    message: "Pass the address to sign data with for now",
                }, null) : ;
                throw error;
            }
            let data = "";
            try {
                data = web3_1.default.utils.toUtf8(dataToSign);
            }
            catch (error) {
                data = dataToSign;
            }
            const checksumAddress = web3_1.default.utils.toChecksumAddress(address);
            try {
                const ret = yield callImKeyApi({
                    jsonrpc: "2.0",
                    method: "eth.signMessage",
                    params: {
                        data: data,
                        sender: checksumAddress,
                        path: IMKEY_ETH_PATH,
                    },
                    id: requestId++,
                });
                let sigRet = ret.result ? .signature.toLowerCase() : ;
                if (!sigRet.startsWith("0x")) {
                    sigRet = "0x" + sigRet;
                }
                callback ? .(null, sigRet) : ;
                return sigRet;
            }
            catch (error) {
                callback ? .(error, null) : ;
                throw createProviderRpcError(4001, error);
            }
        });
    }
}
exports.default = ImKeyProvider;
function callImKeyApi(arg) {
    return postData(IMKEY_MANAGER_ENDPOINT, arg).then((json) => {
        if (json.error) {
            if (json.error.message.includes("ImkeyUserNotConfirmed")) {
                throw new Error("user not confirmed");
            }
            else {
                throw new Error(json.error.message);
            }
        }
        else {
            return json;
        }
    });
}
function postData(url, data) {
    return fetch(url, {
        body: JSON.stringify(data),
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json",
        },
        method: "POST",
        mode: "cors",
        redirect: "follow",
        referrer: "no-referrer",
    }).then((response) => {
        if (response.status == 200) {
            return response.json();
        }
        else {
            throw new Error("HttpError");
        }
    });
}
