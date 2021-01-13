import useToggle from './index';

export default () => {
  const [str, { toggle, setLeft, setRight }] = useToggle('1', '2');
  console.log('toggle 刷新');
  return (
    <div>
      <h1>useToggle</h1>
      <div>当前值是：{str}</div>
      <button onClick={toggle}>点我切换</button>
      <button onClick={setLeft}>点我设置值为第一个参数</button>
      <button onClick={setRight}>点我设置值为第二个参数</button>
    </div>
  );
};
