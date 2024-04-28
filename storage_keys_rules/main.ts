import { ApiPromise, WsProvider } from '@polkadot/api';
import { xxhashAsU8a } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';


const WEB_SOCKET = 'ws://localhost:9944';
// const WEB_SOCKET = 'wss://rpc.polkadot.io';
const connect = async () => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({ provider: wsProvider, types: {} });
    await api.isReady;
    return api;
}
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

const main = async () => {
    const api = await connect();
    
    // show the key for an entry without argument
    console.log("1. key of timestamp.now: " + api.query.timestamp.now.key());

    // show the key for an entry with a single argument
    console.log("2. key for Alice: " + api.query.system.account.key(ALICE));

    // show the key prefix for a map
    console.log("3. key prefix for an account: " + api.query.system.account.keyPrefix());

    // show the key for a double map
    // console.log("4. key for a double map: " + api.query.staking.erasStaker.key(0, ALICE));

    // show the key prefix for a double map
    // console.log("5. key prefix for a double map: " + api.query.staking.erasStaker.keyPrefix(ALICE));

    // 演示如何计算 Pallet name 和 method name 的 key
    const palletName = 'Timestamp';
    const methodName = 'Now';

    let moduleHash = xxhashAsU8a(palletName, 128);
    let methodHash = xxhashAsU8a(methodName, 128);

    console.log({
        moduleHash: u8aToHex(moduleHash),
        methodHash: u8aToHex(methodHash),
        storageKey: u8aToHex(new Uint8Array([...moduleHash, ...methodHash])) // ... 是扩展运算符（Spread Operator）。它可以将一个数组或者对象的所有元素或属性展开。
    });
}

main()
.then(() => {
    console.log('done');
    process.exit(0);
})
.catch((error) => {
    console.error(error);
    process.exit(-1);
});