// @polkadot/api的含义是在 @polkadot命名空间下的api模块（包）
// ApiPromise是api模块中的一个类，用于连接到Polkadot节点并与之交互
// Keyring是一个类，用于管理密钥
// WsProvider是一个类，用于连接到Polkadot节点的WebSocket端点
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
// 从@polkadot/types/lookup中导入FrameSystemAccountInfo类型，该类型表示系统账户信息
import { FrameSystemAccountInfo } from "@polkadot/types/lookup";
// 导入KeyringPair类型，表示密钥对
import { KeyringPair } from "@polkadot/keyring/types";

// 连接到节点
const WEB_SOCKET = 'ws://localhost:9944';
const connect = async () => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    // ApiPromise.create方法返回一个Promise对象，该对象在连接到节点并准备好与之交互时解析
    const api = await ApiPromise.create({ provider: wsProvider, types: {} });
    await api.isReady;  // 等待连接到节点并准备好与之交互
    return api;

    // Promise 是 JavaScript 中的一个对象，用于处理异步操作。它代表一个最终可能完成（解决）或失败（拒绝）的操作，并返回其值。
    // Promise 对象有三种状态：
    // pending：初始状态，既不是成功，也不是失败状态。
    // fulfilled：表示操作成功完成。
    // rejected：表示操作失败。
    // Promise 是异步编程的一种解决方案，允许你在异步操作完成后执行某些操作，而不是立即得到结果。
    // 这对于网络请求、文件读写等操作特别有用，因为这些操作可能需要一些时间才能完成，而你并不希望这些操作阻塞你的程序的其他部分。
    // 你可以使用 .then 方法来安排当 Promise 解决时应该执行的操作，
    // 使用 .catch 方法来处理 Promise 被拒绝的情况。
    // 还有一个 .finally 方法，无论 Promise 成功还是失败，都会执行的操作。

    // 在 TypeScript 中，你可以使用 async 和 await 关键字来处理 Promise 对象，使得异步代码看起来更像同步代码，更易于理解和维护。
    // async 关键字用于声明一个函数是异步的，这意味着函数总是返回一个 Promise。
    // 如果一个 async 函数返回一个值，这个值会被 Promise.resolve() 包装成一个 Promise 对象。
    // 如果一个 async 函数抛出一个异常，这个异常会被 Promise.reject() 包装成一个 Promise 对象。
    // await 关键字只能在 async 函数中使用，用于等待一个 Promise 解决并返回其值。
    // 如果 Promise 被拒绝，await 表达式会抛出一个异常
}

// 获取链上的常量
const getConst = async (api: ApiPromise) => {
    // 获取链上的常量：最小余额，即只有余额大于这个值的账户才能存活
    // 如果余额小于这个值，账户将被清除remove
    const existentialDeposit = api.consts.balances.existentialDeposit.toHuman();
    return existentialDeposit;
}

// 获取指定地址的可用余额
const getFreeBalance = async (api: ApiPromise, address: string) => {
    // 获取指定地址的余额
    // account()返回一个Promise对象：FrameSystemAccountInfo类型
    // FrameSystemAccountInfo类型包含一个data字段，该字段是一个对象，
    // 而data字段是：PalletBalancesAccountData 类型，该类型包含free字段，表示可用余额
    // 即只取FrameSystemAccountInfo类型的data字段，
    // 然后再取 PalletBalancesAccountData的free字段
    const { data: { free,}, }: FrameSystemAccountInfo = await api.query.system.account(address);
    return free;    
}

// 从一个账户向另一个账户转账
const transfer = async (api: ApiPromise, from: KeyringPair, to: string, amount: number) => {
    await api.tx.balances.transfer(to, amount)
        .signAndSend(from, res => {
            console.log(`Tx status: ${res.status}`);
    });
}

// 获取链上的元数据
const getMetadata = async (api: ApiPromise) => {
    const metadata = await api.rpc.state.getMetadata();
    return metadata.toString();
}

// 订阅账户余额变化，当账户余额发生变化时，打印出新的余额
const onBalancesChanged = async (api: ApiPromise, address: string) => {
    await api.query.system.account(address, (account) => {
        const free = account.data.free.toHuman();
        // 当账户余额发生变化时，打印出新的余额（或者可以写事件的其他处理逻辑）
        console.log(`free balance is ${free}`);
    });
}

// 订阅链上的事件, 打印出事件的index和data
const subscribe = async (api: ApiPromise) => {
    await api.query.system.events((events) => {
        events.forEach((e) => {
            console.log('index ', e['event']['index'].toHuman());
            console.log('data ', e['event']['data'].toHuman());
        })
    });
}

// 订阅 template pallet 中的事件，输出something的新值，和SomthingStore事件的index和data
const onSomthingStored = async (api: ApiPromise) => {
    await api.query.system.events((events) => {
        events.forEach((eventRecord) => {
            const {event, } = eventRecord;
            // console.log(`\t${event.section}:${event.method}`);
            if (event.section === 'templateModule' && event.method === 'SomethingStored') {
                const [something, who] = event.data;
                console.log(`\t\t${who} stored the new value ${something}`);
            }
        })
    });
}

const main = async () => {
    const api = await connect();
    console.log(api.libraryInfo);   // 输出：@polkadot/api v10.1.3
    // const minDeposit = await getConst(api);
    // const keyring = new Keyring({ type: 'sr25519' });
    // const alice = keyring.addFromUri('//Alice');
    // const free = await getFreeBalance(api, alice.address);
    // console.log('minDeposit is ', minDeposit);
    // console.log('free balance is ', free.toHuman());

    // const bob = keyring.addFromUri('//Bob');
    // const bob_balance = await getFreeBalance(api, bob.address);
    // console.log('Bob balance is ', bob_balance.toHuman());
    // // **表示幂运算，即10的10次方
    // await transfer(api, alice, bob.address, 10 ** 10 + 1);
    // await sleep(10000);

    // const bob_balance_after = await getFreeBalance(api, bob.address);
    // const alice_balance_after = await getFreeBalance(api, alice.address);
    // console.log('Bob balance after transfer is ', bob_balance_after.toHuman());
    // console.log('Alice balance after transfer is ', alice_balance_after.toHuman());

    // console.log('========================================');

    // // const metadata = await getMetadata(api);
    // // console.log('metadata is:\n', metadata);

    // console.log('========================================');

    // await onBalancesChanged(api, alice.address);
    // await sleep(20000);

    console.log('========================================');
    // await subscribe(api);
    // await sleep(50000);

    await onSomthingStored(api);
    await sleep(50000);

    console.log('main function');
}

main()
.then(() => {
    console.log('exited successfully');
    process.exit(0);
})
.catch((err) => {
    console.error('error is ', err);
    process.exit(1);
});

// function sleep(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
const sleep = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
}

// 可以将返回 Promise 的函数写成 `async(...) {... await ...}` 函数的形式。
// 在这种情况下，async 关键字表示函数总是返回一个 Promise 对象，而 await 关键字则用于等待一个 Promise 解决并返回其值。
// 上面的transfer 函数就是一个 async 函数，
// 它使用 await 关键字等待 api.tx.balances.transfer(...).signAndSend(...) 返回的 Promise 解决。
// 这个 Promise 在交易被签名并发送到网络后解决。
// 注意，虽然 async/await 使得异步代码看起来更像同步代码，但它并没有改变 JavaScript 的事件循环模型。
// await 表达式会暂停当前的 async 函数的执行，但不会阻塞其他代码的执行。
// 此外，async/await 也有一些限制。例如，不能在普通函数或全局作用域中使用 await 关键字，只能在 async 函数中使用。
// 如果你需要在全局作用域中等待一个 Promise 解决，你可以使用 Promise.then() 或 Promise.catch() 方法。
