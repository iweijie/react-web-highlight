import useUpdate from './index';

export default () => {
  const updateHandle = useUpdate();
  return (
    <div>
      <h1>useUpdate</h1>
      <div>当前值是：{Date.now()}</div>
      <button onClick={updateHandle}>点我刷新</button>
    </div>
  );
};
