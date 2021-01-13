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
      setState(l => {
        return [...l, { ...data, id: getUUID(), mode }];
      });
    } else if (action === 'update') {
      console.log(data);
    }
  }, []);

  const toolBarList = React.useMemo(() => {
    return [
      {
        icon: <span className="iconfont icon-huaxian"></span>,
        name: '划线',
        className: 'huaxian',
        type: 'huaxian',
      },
      {
        icon: <span className="iconfont icon-edit"></span>,
        name: '笔记',
        className: 'edit',
        type: 'edit',
      },
    ];
  }, []);

  return (
    <div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
      <div style={{ padding: ' 0 50px', }}>
        <Note
          value={state}
          template={template}
          onChange={onChange}
          // TODO 这个属性要去掉
          toolBarList={toolBarList}
        >
          {/* TODO 需要用户自定义 */}
          {/* <ToolBar>
            <ToolPane></ToolPane>
          </ToolBar> */}
        </Note>
      </div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
77;