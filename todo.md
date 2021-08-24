# 关于 react-web-highlighter

## 基本交互逻辑简介(v1)

1. 使用的是 react 的 dangerouslySetInnerHTML 接口，注入不同的字符串；
2. 在初始化时候，parse(HTMLString) 将 HTMLString 转化为虚拟节点
3. 选中和反选都会基于初始的虚拟节点，去修改 构建不同的虚拟节点
4. 虚拟节点可以转化为 HTMLString;

以上就是完整的逻辑;

## 当前可以完善的

### v2:

> V1本采用的是 dangerouslySetInnerHTML 接口，会让整个组件树全部销毁，需要修改

TODO:

    1. 解析HTMLString 生成 JSON，依据当前JSON去更新 （已完成）
    2. parse 接口，基于现有的解析没有问题，但测试不全，可以改写为 基于 DOM 树去解析；（已完成）
    3. 如果要修改 生成 HTMLString 的逻辑， 需要修改对应的更新逻辑；（已完成）

### V3

> V2 版本只是考虑了客户端渲染，未考虑服务端渲染，所以需要调整

TODO :

    1. 修改DOM解析方式，支持客户端与服务端
    2. 支持移动端

## 对于修改文本

1. 现有的功能对于修改文本后批注是无法对应上的，有大佬提出的 可以使用 Diff + 决策树 去实现，可以考虑下
