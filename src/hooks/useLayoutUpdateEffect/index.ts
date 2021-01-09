import { useLayoutEffect, useRef } from 'react';

const useLayoutUpdateEffect = (effect: Function, deps: any[]) => {
  const isMounted = useRef(false);
  useLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

export default useLayoutUpdateEffect;
