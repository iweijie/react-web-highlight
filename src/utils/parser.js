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
      tagName: token.tagName,
    };
    // element.tagName = token.tagName;

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

function isSpace(c) {
  return c === '\u0000' || /^\s$/.test(c);
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
// 开始标签
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
  } else if (isSpace(c)) {
    return tagOpen;
  } else {
    throw new Error('tagOpen error');
  }
}

// 结束标签
function endTagOpen(c) {
  if (c.match(/^[a-zA-Z0-9]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(c);
  } else {
    throw new Error('endTagOpen error');
  }
}

// 注释开始节点
function annotationStart(c) {
  if (c === '-') {
    annotationCount++;

    if (annotationCount >= 2) {
      annotationCount = 0;
      return annotationText;
    }
    return annotationStart;
  } else {
    throw new Error('annotationStart error');
  }
}

// 注释内容
function annotationText(c) {
  if (c === '-') {
    annotationCount++;
    return annotationEnd;
  } else {
    return annotationText;
  }
}

// 注释结束内容
function annotationEnd(c) {
  if (annotationCount >= 2) {
    if (c === '>') {
      annotationCount = 0;
      return data;
    }
    throw new Error('annotationEnd error');
  }
  if (c === '-') {
    annotationCount++;
    return annotationEnd;
  } else {
    annotationCount = 0;
    return annotationText;
  }
}

// 匹配标签名称
function tagName(c) {
  if (isSpace(c)) {
    // 对应 标签前面有空格的情况，如：< p></p>
    if (currentToken.tagName) return beforeAttributeName;
    throw new Error('tagName error');
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z0-9]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === '>') {
    emit(currentToken);
    return data;
  } else {
    throw new Error('tagName error');
  }
}

function beforeAttributeName(c) {
  if (isSpace(c)) {
    return beforeAttributeName;
  } else if (c === '/' || c === '>') {
    return afterAttributeName(c);
  } else if (c === '=') {
    // 对应无属性名的情况，如：<p ="wj"></p>, 直接丢弃
    return lostAttribute;
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}
// 对应 属性错误的方式，直接丢弃
function lostAttribute(c) {
  if (isSpace(c)) {
    return beforeAttributeName;
  } else if (c === '/' || c === '>') {
    return afterAttributeName(c);
  } else {
    return lostAttribute;
  }
}

// 设置 属性名称
function attributeName(c) {
  if (isSpace(c) || c === '/' || c === '>') {
    return afterAttributeName(c);
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '"' || c === "'") {
    console.error('属性名称错误');
    return lostAttribute;
  } else if (c === '<') {
    throw new Error('attributeName 属性解析错误');
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (isSpace(c)) {
    return beforeAttributeValue;
  } else if (c === '/' || c === '>') {
    return afterQuotedAttributeValue(c);
  } else if (c === '"') {
    return doubleQuotedAttributeValue;
  } else if (c === "'") {
    return singleQuotedAttributeValue;
  } else {
    return unQuotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
    // } else if (c === '\u0000') {
    //   return singleQuotedAttributeValue;
    // } else if (c === EOF) {
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
    // } else if (c === EOF) {
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
    // } else if (c === EOF) {
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
