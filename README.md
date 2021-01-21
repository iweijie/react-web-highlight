<div>
    <h1 align="center"><code>React Web Highlighter</code>&nbsp;&nbsp;🖍️</h1>
    <p align="center">
        <strong>一个富文本高亮笔记前端库，支持高亮文本的持久化存储与还原</strong>
    </p>
</div>

---

## 1. <a name=''></a> 灵感

公司需要做前端文书划线编辑等功能，木得法子， GO GO GO !

非常感谢如下两篇文章提供的思路：

[「划线高亮」和「插入笔记」—— 不止是前端知识点](https://zhuanlan.zhihu.com/p/225773857)

[✨ 如何用 JS 实现“划词高亮”的在线笔记功能？✨🖍️](https://juejin.cn/post/6844903827745832967#heading-8)

## 2. <a name='-1'></a>安装

```bash
npm i react-web-highlighter
```

```bash
yarn add react-web-highlighter
```

## 3. <a name='-1'></a>使用方式

```JavaScript

import React, { useCallback, useMemo, useState } from "react";
import TextHighlight from 'react-web-highlighter';

/** Tip: 如果划线木有效果，看看样式是否有添加 */

const template = "<p>我就是一段文本，想记录点什么，然而却又不知道从何时记录起，那就只能默默的埋藏在心底，生根发芽...</p>";

const App = () => {
  const [data, setState] = useState<any>([]);

  const modes = useMemo(() => {
    return [
      {
        className: "huaxian",
        mode: "huaxian",
        name: "划线",
      },
    ];
  }, []);

  const onAdd = useCallback(
    (selectText) => {
      const d = {
        ...selectText,
        mode: 'huaxian',
        id: Math.random().toString().slice(2)
      };
      data.push(d);
      setState([...data]);
    },
    [data]
  );

  const onUpdate = useCallback(
    (list = []) => {
      setState((d: any) => d);
    },
    [setState]
  );

  return (
    <TextHighlight
      value={data}
      template={template}
      modes={modes}
      onAdd={onAdd}
      onUpdate={onUpdate}
    />
  );
};

export default App;

```

## 4. <a name='-1'></a>示例

[一个更复杂的使用示例，请查看仓库的 DEMO 示例（在`example`文件夹中）](https://github.com/weijie9520/react-text-highlight)

DEMO 安装运行（当前使用的是 [tsdx](https://tsdx.io/)）:

1. 项目根目录：

```
yarn
```

2. example 目录：

```
yarn
```

3. 项目根目录：

```
yarn start
```

4. example 目录：

```
yarn start
```

5. 访问： http://localhost:1234

---

## 5. <a name='-1'></a>TextHighlight 组件参数说明

| 参数名   | 类型                                   | 描述                                                                                                     | 是否必须 | 默认值 |
| -------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ------ |
| template | `string`                               | 富文本 HTML 字符串                                                                                       | 是       | `--`   |
| value    | `INoteTextHighlightInfo[]`             | 高亮的选区数据                                                                                           | 否       | `--`   |
| tagName  | `string`                               | 用于包裹高亮文本的 HTML 标签名                                                                           | 否       | `span` |
| onAdd    | `(data:INoteTextHighlightInfo)=>any`   | 新增选区时触发的回调                                                                                     | 否       | `--`   |
| onUpdate | `(data:INoteTextHighlightInfo[])=>any` | 选中已存在的选区时触发的回调(由于选区会有重叠，所以参数为数组列表，会返回当前标记当前选中选区的所有节点) | 否       | `--`   |
| rowKey   | `string`                               | 每条数据的唯一值                                                                                         | 否       | `id`   |
| modes    | `IModeProps[]`                         | 用于区分类型与不同类型设置样式                                                                           | 否       | `--`   |

<hr>

`INoteTextHighlightInfo` 属性:

| 参数名 | 类型                           | 描述                               | 是否必须 |
| ------ | ------------------------------ | ---------------------------------- | -------- |
| list   | `INoteTextHighlightInfoItem[]` | 选区数据                           | 是       |
| text   | `string`                       | 选区选中的文本数据                 | 是       |
| mode   | `string`                       | 当前数据类型（例如：笔记，画线等） | 否       |

<hr>

`INoteTextHighlightInfoItem` 属性:

| 参数名 | 类型       | 描述                                               | 是否必须 |
| ------ | ---------- | -------------------------------------------------- | -------- |
| level  | `number[]` | 选区层级数据，依据顶级节点一层层下钻到选中文本节点 | 是       |
| start  | `number`   | 当前选中的开始文本节点的偏移量                     | 是       |
| end    | `string`   | 当前选中的结束文本节点的偏移量                     | 是       |
| text   | `string`   | 当前文本节点选中的文本                             | 是       |

<hr>

`IModeProps` 属性:

| 参数名    | 类型     | 描述                   | 是否必须 |
| --------- | -------- | ---------------------- | -------- |
| mode      | `string` | 类型                   | 是       |
| className | `string` | 用于设置当前类型的类名 | 是       |

---

---

## 5.1 <a name='-1'></a> ToolBar 组件参数说明

> ToolBar 需作为 TextHighlight 的子元素存在

| 参数名        | 类型        | 描述                   | 是否必须 | 默认值 |
| ------------- | ----------- | ---------------------- | -------- | ------ |
| mask          | `boolean`   | 是否显示遮罩层         | 否       | true   |
| visible       | `boolean`   | 用于控制弹窗的显示隐藏 | 否       | false  |
| autoClosable  | `boolean`   | 点击自动触发管         | 否       | true   |
| wrapClassName | `string`    | 设置样式               | 否       | --     |
| onCancel      | `function`  | 设置关闭的回调         | 否       | --     |
| children      | `ReactNode` | 弹窗内部的子元素       | 否       | --     |

---

---

## 6. <a name='-1'></a> 方法

`setSelectRange` 方法:
| 参数名 | 类型 | 描述 | 是否必须 |
| --------- | -------- | ---------------------- | -------- |
| node | `INoteTextHighlightInfo` | 用于设置原生选中文本的方法 | 是 |

## 7. <a name='-1'></a> TODO

1. [ ] 编写测试用例
2. [ ] 完善交互逻辑
