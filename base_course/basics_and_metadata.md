## 基础和元数据
理解 @polkadot/api 的最重要的一点是，当它连接到一个运行的节点时，大多数接口实际上是自动生成的。这与其他项目中的接口是静态的这一点相去甚远。虽然听起来很可怕，但这实际上是一个在 Polkadot 和 Substrate 链中存在的强大概念，它允许 API 在链被定制的环境中使用。

为了解释这一点，我们将从元数据开始，解释它实际上提供了什么，因为这对于理解如何与 API 和任何底层链进行交互至关重要。
### 元数据
当 API 连接到一个节点时，它做的第一件事之一就是获取元数据并根据元数据信息装饰 API。元数据有效地提供了形如 `api.<type>.<module>.<section>` 的数据，这些数据可以归入以下类别：

- consts - 所有运行时常量，例如 `api.consts.balances.existentialDeposit`。这些不是函数，而是直接访问端点即可立即得到定义的结果。
- query - 所有链状态，例如 `api.query.system.account(<accountId>)`。
- tx - 所有外部调用，例如 `api.tx.balances.transfer(<accountId>, <value>)`。

此外，元数据还提供了关于事件的信息，这些信息可以通过 `api.query.system.events()` 接口查询，也会出现在交易中...这两种情况将在后面详细介绍。

`api.{consts, query, tx}.<module>.<method>` 端点中包含的信息都不是在 API 中硬编码的。相反，所有的内容都是由元数据暴露的内容完全装饰的，因此完全是动态的。这意味着当你连接到不同的链时，元数据和 API 装饰会改变，API 接口将反映你所连接的链上可用的内容。

### 类型
元数据定义了所有接口中使用的类型名称的调用。目前（这正在进行调查，并可能在未来的元数据版本中得到改进），这也意味着 API 和节点之间的类型需要对齐。例如，Substrate 默认将 BlockNumber 类型定义为 u32，API 遵循 Substrate 的默认设置 - 如果一个链有不同的定义，API 需要知道这一点，以便它实际上可以解码（和编码）该类型。

在这一点上，只需要知道它，我们将在后面的部分讨论类型、自定义链及其影响。

### 链默认值
除了上面详细介绍的 api.[consts | query | tx]以外，API 在连接到链时，会填充一些信息并直接在 API 接口上提供。这些包括：

- api.genesisHash - 已连接链的创世哈希
- api.runtimeMetadata - 从链中检索的元数据
- api.runtimeVersion - 链运行时版本（包括规范/实现版本和类型）
- api.libraryInfo - API 的版本，例如 @polkadot/api v0.90.1
