import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import { Note, NoteWithTool } from '../src/index';
import { getUUID } from '../src/tool';

const App = () => {
  const [state, setState] = React.useState([]);

  const onAdd = React.useCallback(obj => {
    setState((l: any[]) => {
      return [
        ...l,
        {
          ...obj,
          id: getUUID(),
          mode: Math.random() > 0.5 ? 'edit' : 'huaxian',
        },
      ];
    });
  }, []);

  const onUpdate = React.useCallback(obj => {
    console.log(obj);
  }, []);

  const toolBarList = React.useMemo(() => {
    return [
      {
        icon: <span className="iconfont icon-huaxian"></span>,
        name: '划线',
        className: 'huaxian',
        mode: 'huaxian',
      },
      {
        icon: <span className="iconfont icon-edit"></span>,
        name: '笔记',
        className: 'edit',
        mode: 'edit',
      },
      {
        icon: <span className="iconfont icon-fuzhi"></span>,
        name: '复制',
        mode: 'fuzhi',
      },
      {
        icon: <span className="iconfont icon-quxiao"></span>,
        name: '取消',
        mode: 'quxiao',
      },
    ];
  }, []);

  return (
    <div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
      <div style={{ padding: ' 0 50px', width: 600 }}>
        <NoteWithTool
          value={state}
          template={template}
          onAdd={onAdd}
          onUpdate={onUpdate}
          modes={toolBarList}
        ></NoteWithTool>
      </div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
