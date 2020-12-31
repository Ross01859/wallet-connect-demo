import Web3 from 'web3'
import Onboard from 'bnc-onboard'
//import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

import Notify from "bnc-notify"


const notify = Notify({
    dappId: 'c68d8ec3-9b9a-4ba5-a3eb-6232eff79030',
    networkId: 4,
    desktopPosition: 'topRight',
})


export function notifyNotification(message, type = 'pending') {
    let notificationObject = {
        eventCode: 'notification',
        type: type,
        message: message,
    }

    return notify.notification(notificationObject)
}


// import Transport from "@ledgerhq/hw-transport-node-hid";
import Transport from "@ledgerhq/hw-transport-webusb";
// import Transport from "@ledgerhq/react-native-hw-transport-ble";
// import AppBtc from "@ledgerhq/hw-app-btc";
// console.log('==========Onboard===========', Onboard)

// console.log('============Transport===============', Transport)
export const getBtcAddress = async () => {
    const transport = await Transport.create();
    //   const btc = new AppBtc(transport);
    //   const result = await btc.getWalletPublicKey("44'/0'/0'/0/0");
    //   return result.bitcoinAddress;
    console.log(transport)
};
getBtcAddress().then(a => console.log(a));

let engine = {}
export var infura_url = 'https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b'
let wallets = [{
        walletName: "metamask"
    },
    {
        walletName: "trezor",
        appUrl: "https://curve.fi",
        email: "info@curve.fi",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b"
    },
    {
        walletName: "ledger",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b",
        //LedgerTransport: TransportWebUSB,
    },
    {
        walletName: "lattice",
        appName: "Curve Finance",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b"
    },
    {
        walletName: "dapper"
    },
    {
        walletName: "coinbase"
    },
    {
        walletName: "status"
    },
    {
        walletName: "fortmatic",
        apiKey: "pk_live_190B10CE18F47DCD"
    },
    {
        walletName: "authereum",
        apiKey: "_BTsipRcEmPeuVteLOGdoh1CXt733YLZ7u3ipbe_dAk"
    },
    {
        walletName: "trust",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b",
    },
    {
        walletName: "walletConnect",
        infuraKey: "c334bb4b45a444979057f0fb8a0c9d1b"
    },
    {
        walletName: "walletLink",
        appName: 'Curve Finance',
        appLogoUrl: 'https://www.curve.fi/logo.png',
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b",
    },
    {
        walletName: "portis",
        apiKey: "a3bb2525-5101-4a9c-b300-febc6319c3b4"
    },
    {
        walletName: "torus"
    },
    {
        walletName: "squarelink",
        apiKey: "db2074f87c34f247593c"
    },
    {
        walletName: "opera"
    },
    {
        walletName: "operaTouch"
    },
    {
        walletName: "unilogin"
    },
    {
        walletName: "imToken",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b"
    },
    {
        walletName: "meetone"
    },
    {
        walletName: "imKey",
        rpcUrl: "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b",
        //LedgerTransport: TransportWebUSB,
    }
]

let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile && !window.web3) {
    wallets = wallets.filter(wallet => !['trust', 'imToken', 'status', 'coinbase'].includes(wallet.walletName))
}

if (isMobile && window.web3) {
    if (!window.web3.currentProvider.isTrust) {
        wallets = wallets.filter(wallet => wallet.walletName != 'trust')
    }

    if (!window.web3.currentProvider.isImToken) {
        wallets = wallets.filter(wallet => wallet.walletName != 'imToken')
    }

    if (!window.web3.currentProvider.isStatus) {
        wallets = wallets.filter(wallet => wallet.walletName != 'status')
    }

    if (!window.web3.currentProvider.isCoinbaseWallet) {
        wallets = wallets.filter(wallet => wallet.walletName != 'coinbase')
    }
}


if (window.web3 && window.web3.currentProvider.isTrust) {
    wallets.find(wallet => wallet.walletName == 'trust').preferred = true
}

if (window.web3 && window.web3.currentProvider.isImToken) {
    wallets.find(wallet => wallet.walletName == 'imToken').preferred = true
}

if (window.web3 && window.web3.currentProvider.isStatus) {
    wallets.find(wallet => wallet.walletName == 'status').preferred = true
}

if (window.web3 && window.web3.currentProvider.isCoinbaseWallet) {
    wallets.find(wallet => wallet.walletName == 'coinbase').preferred = true
}

if (window.web3 && window.web3.currentProvider.wallet == "MEETONE") {
    wallets.find(wallet => wallet.walletName == 'meetone').preferred = true
}

export const onboard = Onboard({
    dappId: 'c68d8ec3-9b9a-4ba5-a3eb-6232eff79030', // [String] The API key created by step one above
    networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
    subscriptions: {
        wallet: wallet => {
            engine.web3 = window.web3 = new Web3(wallet.provider)
            engine.walletName = wallet.name;
            localStorage.setItem('selectedWallet', wallet.name)
        },
        network: network => {
            if (network != 1) {
                engine.error = 'Error: wrong network type. Please switch to mainnet';
                engine.showShares = false
                window.web3 = new Web3(infura_url)
            } else {
                engine.error = ''
                engine.showShares = true;
            }
        },
        address: account => {
            if (account === undefined) {
                if (localStorage.getItem('-walletlink:https://www.walletlink.org:session:id') === null)
                    changeWallets()
            } else {
                if (engine.default_account && engine.initializedContracts)
                    // common.update_fee_info()
                    engine.default_account = account;
            }
        }
    },
    walletSelect: {
        wallets: wallets,
    },
    walletCheck: [{
            checkName: 'derivationPath'
        },
        {
            checkName: 'connect'
        },
        {
            checkName: 'accounts'
        },
        {
            checkName: 'network'
        },
    ],
});

export async function changeWallets() {
    engine.default_account = ''
    await onboard.walletReset()
    localStorage.removeItem('selectedWallet')
    engine.totalShare = 0
    let userSelectedWallet = await onboard.walletSelect();
    console.log('=============userSelectedWallet============', userSelectedWallet)
    await onboard.walletCheck();
}