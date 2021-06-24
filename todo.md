# 关于 react-web-highlighter

## 基本交互逻辑简介

1. 使用的是 react 的 dangerouslySetInnerHTML 接口，注入不同的字符串；
2. 在初始化时候，parse(HTMLString) 将 HTMLString 转化为虚拟节点
3. 选中和反选都会基于初始的虚拟节点，去修改 构建不同的虚拟节点
4. 虚拟节点可以转化为 HTMLString;

以上就是完整的逻辑;

## 当前可以完善的

1. dangerouslySetInnerHTML 注入不同的 HTMLString 的时候，会销毁之前的所有节点，性能有待优化；
2. parse 接口，基于现有的解析没有问题，但测试不全，可以改写为 基于 DOM 树去解析；
3. 如果要修改 生成 HTMLString 的逻辑， 需要修改对应的更新逻辑

PS：准备参考 React 实现一套试试

## 对于修改文本

1. 现有的功能对于修改文本后批注是无法对应上的，有大佬提出的 可以使用 Diff + 决策树 去实现，可以考虑下
