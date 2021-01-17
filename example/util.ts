/** UUID 为零表示当前标记 */
export const getUUID = (() => {
  let uuid = 0;
  return () => {
    ++uuid;
    return (
      Math.random()
        .toString(16)
        .slice(2) + uuid
    );
  };
})();

/**
 * 文本复制
 */

export function copyToShearPlate(str: string): void {
  var input = document.createElement('input');
  input.type = 'text';
  input.value = str;
  document.body.appendChild(input);
  // HTMLInputElement.select() 方法选中一个 <textarea>
  // 元素或者一个 带有 text 字段的 <input> 元素里的所有内容。
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
