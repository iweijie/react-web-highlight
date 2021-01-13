import { useRef, useCallback } from 'react';
import isFunction from 'lodash/isFunction';

export type noop = (...args: any[]) => any;

const usePersistFn = <T extends noop>(fn: T) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const persistFn = useCallback(
    (...arg) => {
      if (isFunction(fnRef.current)) {
        return fnRef.current(...arg);
      }
      return undefined;
    },
    [fnRef]
  );

  return persistFn;
};

export default usePersistFn;
