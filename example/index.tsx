import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import template from './htmlString';
import Note from '../.';

const App = () => {
  const onChange = React.useCallback(list => {
    console.log(list);
  }, []);

  return (
    <div>
      <Note template={template} onChange={onChange} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
