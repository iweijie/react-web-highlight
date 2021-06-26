import Parse from '../src/Parse';

describe('文本解析', () => {
  it('html 字符串解析', () => {
    const html = '<div>我是文本</div><div>我也是是文本</div>';
    const parse = new Parse({
      template: html,
    });
    expect(parse.getHTML()).toBe(html);
  });
  it('html 字符串解析-包含属性', () => {
    const html = '<div class="test">我是文本</div>';
    const parse = new Parse({
      template: html,
    });
    expect(parse.getHTML()).toBe(html);
  });
});