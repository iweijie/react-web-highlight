import React from 'react';
import { getUUID } from './tool';

export const cancelType = getUUID();

export const copyType = getUUID();

export default [
  {
    icon: <span className="iconfont icon-fuzhi" />,
    name: '复制',
    type: copyType,
  },
  {
    icon: <span className="iconfont icon-quxiao" />,
    name: '取消',
    type: cancelType,
  },
];
