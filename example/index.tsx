/**
 * 写了一堆代码，实现了 极客时间的标注功能 ...
 */

import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './note/1';
// import template from './note/2';
import Note from '../src/Note/index';
import ToolBar from '../src/ToolBar/index';
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

  const {
    action,
    updateSelectedMode,
    selectTextMap,
    selectText,
    textAreaValue,
    selectedUpdateNoteID,
  } = state;

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
    console.log(list);
    const hasHuaxian = !isEmpty(list.filter(item => item.mode === 'huaxian'));
    const hasEdit = !isEmpty(list.filter(item => item.mode === 'edit'));
    const huaxian = list.find(item => item.mode === 'huaxian');
    // 自定义规则选择一条
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
      param.selectedUpdateNoteID = edit.id;
    } else if (updateSelectedMode === 1 || updateSelectedMode === 3) {
      param.visible = true;
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
      selectedUpdateNoteID: '',
      textAreaValue: '',
      textAreaVisible: false,
    });
  }, [setData, setState]);

  const onToolBarHuaxianCancel = useCallback(() => {
    const { huaxian } = selectTextMap;
    if (huaxian) {
      setData(data => {
        return data.filter(d => d !== huaxian);
      });
    }

    onToolBarCancel();
  }, [setData, setState, selectTextMap]);

  const onToolBarEditShow = useCallback(() => {
    const { edit } = selectTextMap || {};
    if (!edit) return;
    setSelectRange(edit);
    setState({
      visible: false,
      textAreaValue: edit.note,
      textAreaVisible: true,
      selectedUpdateNoteID: edit.id,
    });
  }, [setData, setState, selectTextMap]);

  const handleSubmitNote = useCallback(() => {
    setData(data => {
      if (action === 'add') {
        const index = data.findIndex(d => d.mode === 'temp');
        const insertData = {
          ...data[index],
          mode: 'edit',
          note: textAreaValue,
          id: getUUID(),
          createTime: Date.now(),
        };

        data.splice(index === -1 ? 0 : index, 1, insertData);

        console.log('添加笔记成功');
      } else if (action === 'update') {
        const { edit } = selectTextMap;
        if (!edit) return;
        edit.note = textAreaValue;
        console.log('更新笔记成功');
      }

      return data;
    });

    onToolBarTextAreaCancel();
  }, [data, selectText, selectTextMap, action, textAreaValue]);

  const handleDeleteNote = useCallback(() => {
    setData(data => {
      return data.filter(item => item.id !== selectedUpdateNoteID);
    });
    onToolBarTextAreaCancel();
  }, [selectedUpdateNoteID, onToolBarTextAreaCancel, setData]);

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
    // 纯笔记编辑
    if (action === 'update') {
      if (updateSelectedMode === 2) return;
      return (
        <>
          <div className="note-tool-item" onClick={onToolBarHuaxianCancel}>
            <span className="iconfont icon-huaxian"></span>
            <i>取消划线</i>
          </div>
          {updateSelectedMode === 3 ? (
            <div className="note-tool-item" onClick={onToolBarEditShow}>
              <span className="iconfont icon-edit"></span>
              <i>查看笔记</i>
            </div>
          ) : null}
        </>
      );
    }
  }, [
    action,
    setState,
    selectText,
    updateSelectedMode,
    onToolBarEditShow,
    onToolPaneAdd,
  ]);

  return (
    <div style={{ padding: ' 0 50px', width: '80%', margin:'o auto' }}>
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
            {selectedUpdateNoteID ? (
              <button onClick={handleDeleteNote}>删除</button>
            ) : null}
          </div>
        </ToolBar>
      </Note>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
