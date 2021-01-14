import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../src/index';
import { getUUID } from '../src/tool';

const App = () => {
  const [state, setState] = React.useState([]);

  const onChange = React.useCallback(obj => {

    const { action, payload, mode } = obj;
    if (action === 'add') {
      setState((l: any[]) => {
        return [...l, { ...payload, id: getUUID(), mode: mode || "huaxian" }];
      });
    } else if (action === 'update') {
      console.log(payload);
    }
  }, []);

  const toolBarList = React.useMemo(() => {
    return [
      {
        className: 'huaxian',
        mode: 'huaxian',
      },
      {
        className: 'edit',
        mode: 'edit',
      },
    ];
  }, []);

  return (
    <div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
      <div style={{ padding: ' 0 50px', width: 600 }}>
        <Note
          value={state}
          template={template}
          onChange={onChange}
          modes={toolBarList}
        >
        </Note>
      </div>
      <div style={{ height: 100, backgroundColor: 'red' }}></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

