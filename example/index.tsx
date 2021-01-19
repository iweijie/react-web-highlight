import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../src/Note/index';
import ToolBar from '../src/ToolBar/index';
// import useSetState from '../src/hooks/useSetState';
// import usePersistFn from '../src/hooks/usePersistFn';
import { useSetState, usePersistFn } from 'ahooks';
import setSelectRange from '../src/setSelectRange';
import { isEmpty } from 'lodash';
import {
  copyToShearPlate,
  getUUID,
  setLocalStorage,
  getLocalStorage,
} from './util';
import './asset/font/iconfont.css';
import './index.less';

const { useCallback, useMemo, useState } = React;
const tempName = 'iweijie-temp';
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
  const [data, handleData] = useState<any>(() => {
    return ((getLocalStorage(tempName) as Array<any>) || []).filter(
      item => item.mode !== 'temp'
    );
  });

  // 代理数据，本地存储
  const setData = useCallback(
    fn => {
      handleData(data => {
        let part;
        if (typeof fn === 'function') {
          part = fn(data);
        } else {
          part = fn;
        }

        setLocalStorage(tempName, part);

        return part;
      });
    },
    [handleData]
  );

  const [state, setState] = useSetState<any>({
    action: undefined,
    selectText: null,
    selectTextMap: {
      huaxian: null,
      edit: null,
    },
    // 1：只有划线； 2：只有笔记；3：划线和笔记
    updateSelectedMode: 0,
    visible: false,
    loading: false,
    textAreaVisible: false,
    textAreaValue: '',
    selectedUpdateNoteID: '',
  });

  const { action, updateSelectedMode, selectText, textAreaValue } = state;

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

  const onUpdate = useCallback((list = []) => {
    const hasHuaxian = !isEmpty(list.filter(item => item.mode === 'huaxian'));
    const hasEdit = !isEmpty(list.filter(item => item.mode === 'edit'));
    const huaxian = list.find(item => item.mode === 'huaxian');
    const edit = list
      .sort((a, b) => b.createTime - a.createTime)
      .find(item => item.mode === 'edit');
    const updateSelectedMode =
      hasHuaxian && hasEdit ? 3 : hasHuaxian ? 1 : hasEdit ? 2 : 0;

    const param: any = {
      action: 'update',
      selectTextMap: {
        huaxian,
        edit,
      },
      updateSelectedMode,
      selectText,
    };

    if (updateSelectedMode === 2) {
      param.visible = false;
      param.textAreaVisible = true;
      param.textAreaValue = edit.note;
    }

    setState(param);
  }, []);

  const onToolPaneAdd = useCallback(
    mode => {
      setData(d => {
        return d.concat({
          ...selectText,
          mode,
          id: getUUID(),
          createTime: Date.now(),
        });
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
    setData(l => {
      return l.filter(item => item.mode !== 'temp');
    });
    setState({
      textAreaValue: '',
      textAreaVisible: false,
    });
  }, [setData, setState]);

  const onToolBarHuaxianCancel = useCallback(() => {
    setData(l => {
      return l.filter(item => item.mode !== 'temp');
    });
    setState({
      textAreaValue: '',
      textAreaVisible: false,
    });
  }, [setData, setState]);

  const handleSubmitNote = useCallback(() => {
    setData(data => {
      const index = data.findIndex(d => d.mode === 'temp');
      const insertData = {
        ...data[index],
        mode: 'edit',
        note: textAreaValue,
        id: getUUID(),
        createTime: Date.now(),
      };

      data.splice(index === -1 ? 0 : index, 1, insertData);

      return data;
    });

    onToolBarTextAreaCancel();

    console.log('添加笔记成功');
  }, [data, selectText, textAreaValue]);

  const handleSubmitLineation = usePersistFn(() => {
    // todo something
    onToolPaneAdd('huaxian');
    onToolBarCancel();
  });

  const ToolPanes = useMemo(() => {
    if (action === 'add') {
      return (
        <>
          <div className="note-tool-item" onClick={handleSubmitLineation}>
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
              setSelectRange(selectText);
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

    if (action === 'add' && updateSelectedMode === 2) return;

    return (
      <>
        <div className="note-tool-item" onClick={onToolBarHuaxianCancel}>
          <span className="iconfont icon-huaxian"></span>
          <i>取消划线</i>
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
    <div style={{ padding: ' 0 50px' }}>
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
