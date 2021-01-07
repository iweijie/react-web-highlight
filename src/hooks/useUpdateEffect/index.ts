import { useEffect, useRef } from 'react';

const useUpdateEffect = (effect: Function, deps: any[]) => {
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

export default useUpdateEffect;
