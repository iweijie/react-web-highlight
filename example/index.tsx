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

const { useCallback, useMemo, useState } = React;

const toolBarList = [
  {
    className: 'huaxian',
    mode: 'huaxian',
    name: '划线',
  },
  {
    className: 'edit',
    mode: 'edit',
    name: '笔记',
  },
  {
    mode: 'temp',
    className: 'temp',
    name: '临时变量',
  },
];

const App = () => {
  const [data, setData] = useState<any>([]);

  const [state, setState] = useSetState<any>({
    action: undefined,
    selectText: null,
    visible: false,
    textAreaVisible: false,
    textAreaValue: '',
    selectedUpdateNoteID: '',
  });

  const { action, selectText, textAreaValue } = state;

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

  const onToolBarCancel = useCallback(
    (visibleLabel = 'visible') => {
      setState({
        [visibleLabel]: false,
      });
    },
    [setState]
  );

  const onToolBarTextAreaCancel = useCallback(() => {
    onToolBarCancel('textAreaVisible');
    setData(l => {
      return l.filter(item => item.mode !== 'temp');
    });
    setState({
      textAreaValue: '',
    });
  }, [onToolBarCancel, setData, setState]);

  const handleSubmitNote = useCallback(() => {
    return new Promise((r, j) => {
      const selectTextData = data.find(d => d.mode === 'temp');
      if (!selectTextData) throw new Error('数据错误');

      setTimeout(() => {
        r({
          code: 0,
          data: {
            ...selectTextData,
            mode: 'edit',
            note: textAreaValue,
            id: getUUID(),
          },
          message: '新增成功',
        });
      }, 2000);
    }).then((data: any) => {
      if (data.code !== 0) throw data;
      onToolBarTextAreaCancel();
      console.log(data.message);
      setData(d => {
        const list = d.filter(item => item.mode !== 'temp');
        return list.concat(data.data);
      });
    });
  }, [data, textAreaValue]);

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
              setState({
                visible: false,
                textAreaVisible: true,
              });
              selectRange(selectText);
              setData(d => {
                return d.concat({ ...selectText, mode: 'temp', id: getUUID() });
              });
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
  }, [action, setState, selectText, onToolPaneAdd]);

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
          {ToolPanes}
        </ToolBar>
        <ToolBar
          visible={state.textAreaVisible}
          onCancel={onToolBarTextAreaCancel}
        >
          <div className="edit-textarea-wrap">
            <textarea
              className="edit-textarea"
              value={state.textAreaValue}
              onChange={e => {
                setState({
                  textAreaValue: e.target.value,
                });
              }}
            ></textarea>
            <button onClick={handleSubmitNote}>提交</button>
          </div>
        </ToolBar>
      </Note>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
