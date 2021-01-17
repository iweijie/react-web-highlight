import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import { Note } from '../src/index';
import useSetState from '../src/hooks/useSetState';
import ToolBar from '../src/components/ToolBar';

const { useCallback, useMemo, useState } = React;

/** UUID 为零表示当前标记 */
export const getUUID = (() => {
  let uuid = 0;
  return () => {
    ++uuid;
    return (
      Math.random()
        .toString(16)
        .slice(2) + uuid
    );
  };
})();

/**
 * 文本复制
 */

function copyToShearPlate(str: string): void {
  var input = document.createElement('input');
  input.type = 'text';
  input.value = str;
  document.body.appendChild(input);
  // HTMLInputElement.select() 方法选中一个 <textarea>
  // 元素或者一个 带有 text 字段的 <input> 元素里的所有内容。
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

const App = () => {
  const [data, setData] = useState<any>([]);

  const [state, setState] = useSetState<any>({
    action: undefined,
    selectText: null,
    visible: false,
  });

  const onAdd = useCallback(
    selectText => {
      setState({
        action: 'add',
        selectText,
        visible: true,
      });
    },
    [setState]
  );

  const onUpdate = useCallback(obj => {
    console.log(obj);
  }, []);

  const onToolBarCancel = useCallback(() => {
    setState({
      visible: false,
    });
  }, [setState]);

  const toolBarList = useMemo(() => {
    return [
      {
        className: 'huaxian',
        mode: 'huaxian',
        render: ({ selected, data, position }) => {
          console.log({ selected, data, position });
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-huaxian"></span>
              <i>划线</i>
            </div>
          );
        },
      },
      {
        className: 'edit',
        mode: 'edit',
        render: ({ selected, data, position }) => {
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-edit"></span>
              <i>笔记</i>
            </div>
          );
        },
      },
      {
        mode: 'fuzhi',
        render: ({ selected, data, position }) => {
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-fuzhi"></span>
              <i>复制</i>
            </div>
          );
        },
      },
    ];
  }, []);

  const renderNode = useMemo(() => {
    const selectText: any = {};
    return toolBarList.map((item, index) => {
      // let reactNode: ReactNode | null | string | number | undefined = null;
      let reactNode: any = null;
      if (typeof item.render === 'function') {
        reactNode = item.render({
          selected: selectText?.mode ? false : selectText?.mode === item.mode,
          data: selectText,
          position: [0, 0],
        });
      }
      return (
        // <div key={item.mode || index} onClick={() => onToolPaneClick(item)}>
        <div key={item.mode || index}>{reactNode}</div>
      );
    });
  }, [toolBarList]);

  return (
    <div style={{ padding: ' 0 50px', width: 600 }}>
      <Note
        value={data}
        template={template}
        modes={toolBarList}
        onAdd={onAdd}
        onUpdate={onUpdate}
      >
        <ToolBar visible={state.visible} onCancel={onToolBarCancel}>
          {renderNode}
        </ToolBar>
      </Note>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
