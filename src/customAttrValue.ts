let customValue: any = {};

export const getCustomValue = (key?: string): any => {
  return key ? customValue[key] : customValue;
};
export const setCustomValue = (value: object): void => {
  customValue = {
    ...customValue,
    ...value,
  };
};
