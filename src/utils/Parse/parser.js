const EOF = Symbol('EOF');
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let annotationCount = 0;

const customAttr = {
  type: true,
  tagName: true,
  isSelfClosing: true,
};

{
  /* <br>  插入一个简单的换行符，标签是空标签（意味着它没有结束标签，因此这是错误的：<br></br>）。

<hr>  创建一条水平线，在HTML中，<hr> 没有结束标签。在XHTML中，<hr> 必须被正确地关闭，比如 <hr />。

<img> 插入一幅图像，在HTML中，<img> 没有结束标签。在XHTML中，<img> 必须被正确地关闭，比如 <img />。

<link>最常见的用途是链接样式表。在HTML中，<link> 没有结束标签。在XHTML中，<link> 必须被正确地关闭，比如 <link />

<base> 页面上的所有链接规定默认地址或默认目标，在HTML中，<base> 没有结束标签。在XHTML中，<base> 必须被正确地关闭，比如 <base />。

<area> 定义图像映射中的区域，在HTML中，<area> 没有结束标签。在XHTML中，<area> 必须正确地关闭，比如<area />。

<input> 输入框，在HTML中，<input> 没有结束标签。在XHTML中，<input> 必须被正确地关闭，比如 <input />。

<source> 标签为媒介元素（比如 <video> 和 <audio>）定义媒介资源。 */
}
const selfCloseTag = {
  input: true,
  img: true,
  hr: true,
  link: true,
  br: true,
  base: true,
  area: true,
  source: true,
};

let stack = [{ type: 'document', children: [] }];

function emit(token) {
  let top = stack[stack.length - 1];

  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    };
    element.tagName = token.tagName;

    for (let p in token) {
      if (p === 'id') {
        element.id = token[p];
      } else if (p === 'class') {
        element.class = token[p];
      }
      if (!customAttr[p]) {
        element.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }

    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentTextNode = null;
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      if (selfCloseTag[top.tagName]) {
        stack.pop();
        return emit(token);
      } else {
        throw new Error(`Tag start end doesn't match!`);
      }
    }
    stack.pop();
    currentTextNode = null;
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        parent: top,
        content: '',
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c === EOF) {
    emit({
      type: 'EOF',
    });
    return;
  } else {
    emit({
      type: 'text',
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  // <!--这是一个注释，注释在浏览器中不会显示-->
  if (c === '!') {
    return annotationStart;
  } else if (c === '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: '',
    };
    return tagName(c);
  } else {
    return;
  }
}

function annotationStart(c) {
  if (c === '-') {
    annotationCount++;

    if (annotationCount >= 2) {
      annotationCount = 0;
      return annotationText;
    }
    return annotationStart;
  } else {
    throw new Error('html 格式错误');
  }
}

function annotationText(c) {
  if (c === '-') {
    annotationCount++;
    return annotationEnd;
  } else {
    return annotationText;
  }
}

function annotationEnd(c) {
  if (annotationCount >= 2) {
    if (c === '>') {
      annotationCount = 0;
      return data;
    }
    throw new Error('html 格式错误');
  }
  if (c === '-') {
    annotationCount++;
    return annotationEnd;
  } else {
    annotationCount = 0;
    return annotationText;
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z0-9]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === '>') {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(c);
  } else if (c === '>') {
  } else if (c === EOF) {
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c);
  } else if (c === '=') {
    // return beforeAttributeName
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c);
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '\u0000') {
  } else if (c === '"' || c === "'" || c === '<') {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
  } else if (c === '"') {
    return doubleQuotedAttributeValue;
  } else if (c === "'") {
    return singleQuotedAttributeValue;
  } else if (c === '>') {
  } else {
    return unQuotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
    // 可以抛错 这里对应<div class="a"b>这种情况
    throw new Error('afterQuotedAttributeValue error');
    // currentAttribute.value += c
    // return afterQuotedAttributeValue
  }
}

function unQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === '/') {
    // 这里可以处理 <img id=b/>这种情况
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === '\u0000') {
  } else if (c === '"' || c === "'" || c === '<' || c === '=' || c === '`') {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return unQuotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
    // 理论上这条分支是多余的，从beforeAttributeName或者attributeName状态进入时c已经确定了
    // currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

export default function parserHTML(html) {
  html = html.trim();
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
  const children = stack[0].children;

  stack = [{ type: 'document', children: [] }];
  currentAttribute = {};

  return children.map(item => {
    return {
      ...item,
      parent: undefined,
    };
  });
}
