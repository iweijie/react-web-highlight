import useSetState from './index';

export default () => {
  const [value, setState] = useSetState({
    name: 'iweijie',
    feature: '帅',
    age: 18,
  });

  return (
    <div>
      <h1>useSetState</h1>
      <pre>{JSON.stringify(value, null, 2)}</pre>
      <button
        onClick={() => {
          setState({ age: age + 1 });
        }}
      >
        加一岁
      </button>
      <button
        onClick={() => {
          setState({ name: 'feng', feature: '漂亮' });
        }}
      >
        修改名字为 feng
      </button>

      <button type="button" onClick={() => setState({ hello: 'world' })}>
        set hello
      </button>
      <button
        type="button"
        onClick={() => setState({ foo: 'bar' })}
        style={{ margin: '0 16px' }}
      >
        set foo
      </button>
    </div>
  );
};
