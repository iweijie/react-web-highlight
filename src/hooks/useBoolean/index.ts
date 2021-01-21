import useToggle, { IAction } from '../useToggle';

function useBoolean(
  defaultValue: boolean = false
): [boolean, IAction<boolean>] {
  return useToggle(!!defaultValue, !defaultValue);
}

export default useBoolean;
