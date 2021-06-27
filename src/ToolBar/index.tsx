import React, { useRef, useContext, FC, useEffect } from 'react';
import context, { INoteContextProps } from '../Note/context';
import { marginVertical } from '../constants';

import { classNames } from '../tool';
import insideElement from '../insideElement';

import { IToolBarProps } from './type';
import './index.less';

const ToolBar: FC<IToolBarProps> = props => {
  const {
    visible,
    children,
    mask = true,
    autoClosable = true,
    wrapClassName,
    onCancel,
  } = props;

  const wrapContext = useContext(context);

  const toolContainer = useRef<HTMLDivElement>(null);
  // 用于设置弹窗的显隐
  useEffect(() => {
    const { wrapContainer, action } = (wrapContext as INoteContextProps) || {};
    if (!wrapContainer?.current || !toolContainer.current) return;

    toolContainer.current.style.display = visible ? 'flex' : 'none';

    if (!visible) return;

    let range: Range | undefined;

    // if (action?.current === 'add') {
    range = window?.getSelection()?.getRangeAt(0);

    // TODO 不太确定更新时如何处理，所以直接使用当前点击定位
    // } else if (action?.current === 'update') {
    //   debugger
    // }

    if (!range) return;

    const rangeRect = range.getBoundingClientRect();

    const wrapContainerRect = wrapContainer.current.getBoundingClientRect();
    const toolContainerRect = toolContainer.current.getBoundingClientRect();

    let top: number;
    let toolClassName: string;
    let left: number;
    // let arrowLeft: number;

    if (rangeRect.top > marginVertical + toolContainerRect.height) {
      toolClassName = 'up';
      top =
        rangeRect.top -
        wrapContainerRect.top -
        marginVertical -
        toolContainerRect.height;
    } else {
      toolClassName = 'down';
      top = rangeRect.bottom - wrapContainerRect.top + marginVertical;
    }

    const leftPoint =
      (rangeRect.left + rangeRect.right) / 2 - wrapContainerRect.left;

    if (leftPoint - toolContainerRect.width / 2 < 0) {
      left = 0;
      // arrowLeft = leftPoint < 6 ? 6 : leftPoint;
    } else if (
      leftPoint + toolContainerRect.width / 2 >
      wrapContainerRect.width
    ) {
      left = wrapContainerRect.width - toolContainerRect.width;
      // arrowLeft = wrapContainerRect.left - leftPoint < 6 ? 6 : leftPoint;
    } else {
      left =
        (rangeRect.left + rangeRect.right) / 2 -
        toolContainerRect.width / 2 -
        wrapContainerRect.left;
      // arrowLeft = leftPoint;
    }

    toolContainer.current.style.top = `${top}px`;
    toolContainer.current.style.left = `${left}px`;
    toolContainer.current.classList.remove('up', 'down');
    toolContainer.current.classList.add(toolClassName);

    const handle = (e: Event) => {
      if (
        !toolContainer.current ||
        typeof onCancel !== 'function' ||
        insideElement(e.target as Element, toolContainer.current)
      )
        return;
      if (autoClosable) {
        onCancel();
      }
    };

    // TODO 没有想到好的方式去移除弹窗，后续优化
    setTimeout(() => {
      document.addEventListener('click', handle);
    });

    return () => {
      document.removeEventListener('click', handle);
    };
  }, [autoClosable, onCancel, visible, wrapContext]);
  return (
    <>
      <div
        className={classNames('note-none', {
          'note-tool-mask': visible && mask,
        })}
      />
      <div className="note-tool" ref={toolContainer}>
        {children}
      </div>
    </>
  );
};

export default ToolBar;
