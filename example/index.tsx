import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../.';
import { getUUID } from '../src/tool';
// import './index.css'

const App = () => {

  const [state, setState] = React.useState([]);

  const onChange = React.useCallback(obj => {
    const { action, data, mode } = obj;

    if (action === 'add') {

      setState((l) => {
        return [...l, { ...data, id: getUUID(), mode }];
      });
    }
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
        className: 'fuzhi',
        mode: 'fuzhi',
      },
      {
        icon: <span className="iconfont icon-quxiao"></span>,
        name: '取消',
        className: 'quxiao',
        mode: 'quxiao',
      }
    ];
  }, []);

  return (
    <div>
      <div style={{ height: 100, backgroundColor: "red" }}></div>
      <div style={{ padding: " 0 100px", }}>
        <Note value={state} template={template} onChange={onChange} toolBarList={toolBarList} />
      </div>
      <div style={{ height: 100, backgroundColor: "red" }}></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
