import useBoolean from './index';

export default () => {
  const [bool, { toggle, setTrue, setFalse }] = useBoolean(false);
  console.log('toggle 刷新');
  return (
    <div>
      <h1>useBoolean</h1>
      <div>当前值是：{bool ? 'true' : 'false'}</div>
      <button onClick={toggle}>点我切换</button>
      <button onClick={setTrue}>点我设置值为 true</button>
      <button onClick={setFalse}>点我设置值为 false</button>
    </div>
  );
};
