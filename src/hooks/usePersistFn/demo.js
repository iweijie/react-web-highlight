import React, { useState, useCallback } from 'react';
import usePersistFn from './index';

const Com = React.memo(({ log, add }) => {
  return (
    <>
      <h3>{Date.now()}</h3>
      <button onClick={add}>点我数字增加</button>
      <button onClick={log}>点我打印</button>
    </>
  );
});

export default () => {
  const [num, setNum] = useState(0);
  const useCallbackAdd = useCallback(() => {
    setNum(num + 1);
  }, [num]);
  const useCallbackLog = useCallback(() => {
    console.log(`当前数字是： ${num}`);
  }, [num]);
  const usePersistFnAdd = usePersistFn(() => {
    setNum(num + 1);
  });
  const usePersistFnLog = usePersistFn(() => {
    console.log(`当前数字是： ${num}`);
  });
  return (
    <div>
      <h2>useMount</h2>
      <div>当前数字是：{num}</div>
      <Com key="useCallback" add={useCallbackAdd} log={useCallbackLog} />
      <div>--------------</div>
      <Com key="usePersistFn" add={usePersistFnAdd} log={usePersistFnLog} />
    </div>
  );
};
