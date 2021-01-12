import { useState, useCallback } from 'react';
import isFunction from 'lodash/isFunction';

const useSetState = <T extends object>(
  defaultValue: T | (() => T)
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
  const [state, setValues] = useState<T>(defaultValue);
  const setState = useCallback(
    patch => {
      setValues(values => {
        return Object.assign(
          {},
          values,
          isFunction(patch) ? patch(values) : patch
        );
      });
    },
    [setValues]
  );
  return [state, setState];
};

export default useSetState;
