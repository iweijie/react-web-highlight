import { useState } from 'react';
import useToggle, { IAction } from '../useToggle';

function useBoolean(): [boolean, IAction];
function useBoolean(defaultValue: boolean): [boolean, IAction];
function useBoolean(defaultValue?: boolean) {
  return useToggle(!!defaultValue, !defaultValue);
}

export default useBoolean;
