<template>
  <div>
    <div @click="login">连接metamask</div>
  </div>
</template>

<script>
// import vue from 'vue'
// import {getBtcAddress,notifyNotification,onboard ,changeWallets} from '@/init'
import {changeWallets} from '@/init'
// import Transport from "@ledgerhq/hw-transport-webusb";
// import Transport from "@ledgerhq/hw-transport-node-hid";

    export default {
        title:'WalletConnect',
        methods: {
           async login() {
                // await onboard.walletCheck();
               await changeWallets()
            // console.log(Transport)
              //  Transport.create().then(res=>{
              //      console.log(res)
              //  })
                // getBtcAddress()
                // notifyNotification('1234123')
            }
        },
    }
</script>

<style lang="scss" scoped>
</style>