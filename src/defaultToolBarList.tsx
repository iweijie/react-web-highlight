import React from 'react';
import { getUUID } from './tool';

export const cancel = getUUID();

export const copy = getUUID();

export default [
  {
    icon: <span className="iconfont icon-fuzhi" />,
    name: '复制',
    type: copy,
  },
  {
    icon: <span className="iconfont icon-quxiao" />,
    name: '取消',
    type: cancel,
  },
];
