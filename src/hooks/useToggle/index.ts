import { useState, useMemo } from 'react';

type IState = string | number | boolean | undefined;

export interface IAction<T = IState> {
  toggle: (value?: T) => void;
  setLeft: () => void;
  setRight: () => void;
}

function useToggle<T = boolean | undefined>(): [T, IAction<T>];
function useToggle<T = IState>(defaultValue: T): [T, IAction<T>];
function useToggle<T = IState, U = IState>(
  defaultValue: T,
  reverseValue: U
): [T | U, IAction<T | U>];
function useToggle<D extends IState = IState, R extends IState = IState>(
  defaultValue: D = false as D,
  reverseValue?: R
) {
  const [value, setValue] = useState<D | R>(defaultValue);

  const action = useMemo(() => {
    const reverseValueOrigin = (reverseValue === void 0
      ? !defaultValue
      : reverseValue) as D | R;

    const toggle = (value?: D | R) => {
      if (value !== undefined) {
        setValue(value);
        return;
      }
      setValue(v => (v === defaultValue ? reverseValueOrigin : defaultValue));
    };
    const setLeft = () => {
      setValue(defaultValue);
    };
    const setRight = () => {
      setValue(reverseValueOrigin);
    };

    return {
      toggle,
      setLeft,
      setRight,
    };
  }, [setValue]);

  return [value, action];
}
export default useToggle;
