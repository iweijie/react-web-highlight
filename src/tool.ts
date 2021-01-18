// 将HTML转义为实体
export function escape(html: string): string {
  var elem = document.createElement('div');
  var txt = document.createTextNode(html);
  elem.appendChild(txt);
  return elem.innerHTML;
}
// 将实体转回为HTML
export function unescape(str: string): string {
  var elem = document.createElement('div');
  elem.innerHTML = str;
  return elem.innerText || elem.textContent || '';
}

/**
 * 设置class
 */

export function classNames(...arg: any[]): string {
  // @ts-ignore
  const classNameMap = arg.reduce((classNameMap, name) => {
    classNameMap as object;
    if (typeof name === 'string') {
      classNameMap[name] = true;
    } else if (typeof name === 'object') {
      Object.keys(name).forEach(key => {
        if (name[key]) {
          classNameMap[key] = true;
        }
      });
    }
    return classNameMap;
  }, {});

  return Object.keys(classNameMap).join(' ');
}
