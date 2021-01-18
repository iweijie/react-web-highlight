import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../src/Note/index';
import ToolBar from '../src/ToolBar/index';
import useSetState from '../src/hooks/useSetState';
import selectRange from '../src/selectRange';
import { copyToShearPlate, getUUID } from './util';

import './asset/font/iconfont.css';
import './index.less';

console.log('Note:', Note);

const { useCallback, useMemo, useState } = React;

const toolBarList = [
  {
    className: 'huaxian',
    mode: 'huaxian',
  },
  {
    className: 'edit',
    mode: 'edit',
  },
  {
    mode: 'fuzhi',
  },
];

const App = () => {
  const [data, setData] = useState<any>([]);

  const [state, setState] = useSetState<any>({
    action: undefined,
    selectText: null,
    visible: false,
  });

  const { action, selectText, visible } = state;
  console.log('action', action, state);
  const onAdd = useCallback(
    selectText => {
      console.log('selectText', selectText);
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

  const onToolPaneAdd = useCallback(
    mode => {
      setData(d => {
        return d.concat({ ...selectText, mode, id: getUUID() });
      });
      setState({
        selectText: null,
        action: undefined,
        visible: false,
      });
    },
    [selectText]
  );

  const onToolBarCancel = useCallback(() => {
    setState({
      visible: false,
    });
  }, [setState]);

  const ToolPanes = useMemo(() => {
    if (action === 'add') {
      return (
        <>
          <div
            className="note-tool-item"
            onClick={() => {
              // todo something
              onToolPaneAdd('huaxian');
              onToolBarCancel();
            }}
          >
            <span className="iconfont icon-huaxian"></span>
            <i>划线</i>
          </div>
          <div
            className="note-tool-item"
            onClick={() => {
              console.log('selectText', selectText);
              setTimeout(() => {
                selectRange(selectText);
              });
              onToolBarCancel();
            }}
          >
            <span className="iconfont icon-edit"></span>
            <i>笔记</i>
          </div>
          <div
            className="note-tool-item"
            onClick={() => {
              copyToShearPlate(selectText.text);
              onToolBarCancel();
              console.log('复制成功');
            }}
          >
            <span className="iconfont icon-fuzhi"></span>
            <i>复制</i>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="note-tool-item">
          <span className="iconfont icon-huaxian"></span>
          <i>划线</i>
        </div>
        <div className="note-tool-item">
          <span className="iconfont icon-edit"></span>
          <i>笔记</i>
        </div>

        <div className="note-tool-item">
          <span className="iconfont icon-fuzhi"></span>
          <i>复制</i>
        </div>
      </>
    );
  }, [action, selectText, onToolPaneAdd]);

  return (
    <div style={{ padding: ' 0 50px', width: 600 }}>
      <Note
        value={data}
        template={template}
        modes={toolBarList}
        onAdd={onAdd}
        onUpdate={onUpdate}
      >
        <ToolBar
          // autoClosable={false}
          visible={state.visible}
          onCancel={onToolBarCancel}
        >
          {ToolPanes}
        </ToolBar>
      </Note>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
