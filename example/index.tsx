import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../.';
// import './index.css'

const App = () => {
  const onChange = React.useCallback(list => {
    console.log(list);
  }, []);

  const list = React.useMemo(() => {
    return [
      {
        code: 'fuzhi',
        name: '复制',
        icon: 'ReactNode'
      }
    ];
  }, []);

  return (
    <div>
      <div style={{ height: 100, backgroundColor: "red" }}></div>
      <div style={{ padding: " 0 100px", }}>
        <Note template={template} onChange={onChange} />
      </div>
      <div style={{ height: 100, backgroundColor: "red" }}></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
