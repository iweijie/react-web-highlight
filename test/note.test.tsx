import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Note from '../src/Note';

const getHtml = (html: string): string => {
  return `<div class="text-highlight-wrap"><div class="text-highlight" id="text-highlight">${html}</div></div>`;
};

describe('测试划线功能', () => {
  const template = '<p>我是很长很长很长的文本</p>';

  const modes = [
    {
      className: 'huaxian',
      mode: 'huaxian',
      name: '划线',
    },
    {
      className: 'edit',
      mode: 'edit',
      name: '笔记',
    },
  ];

  it('basic', () => {
    const wrapper = render(<Note modes={modes} template={template} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('text', () => {
    const app = render(<Note modes={modes} template={template} />);
    expect(app.text()).toEqual('我是很长很长很长的文本');
  });

  it('单一下划线', () => {
    const value = [
      {
        list: [{ level: [0, 0], start: 2, end: 8, text: '很长很长很长' }],
        text: '很长很长很长',
        mode: 'huaxian',
        id: '8f5e0551a588f1',
      },
    ];

    const app = mount(<Note modes={modes} template={template} value={value} />);

    expect(app.find('.huaxian').text()).toEqual('很长很长很长');

    expect(app.html()).toEqual(
      getHtml(
        '<p>' +
          '<span data-wj-custom-text="true">' +
          '我是' +
          '<span data-wj-custom-split="true" data-wj-custom-id="8f5e0551a588f1" class="huaxian">很长很长很长</span>' +
          '的文本' +
          '</span>' +
          '</p>'
      )
    );

    expect(toJson(app)).toMatchSnapshot();
  });

  it('多下划线', () => {
    const value = [
      {
        list: [{ level: [0, 0], start: 2, end: 8, text: '很长很长很长' }],
        text: '很长很长很长',
        mode: 'huaxian',
        id: '8f5e0551a588f1',
      },
      {
        list: [{ level: [0, 0], start: 3, end: 5, text: '长很' }],
        text: '长很',
        mode: 'huaxian',
        id: '8f5e0551a588f2',
      },
    ];

    const app = mount(<Note modes={modes} template={template} value={value} />);
    app.update();

    expect(
      app
        .find('[data-wj-custom-id="8f5e0551a588f1"]')
        .find('[data-wj-custom-id="8f5e0551a588f2"]')
        .text()
    ).toEqual('长很');

    expect(app.find('[data-wj-custom-id="8f5e0551a588f1"]').length).toBe(3);
    
    const testText = ['很', '长很', '长很长']
    app.find('[data-wj-custom-id="8f5e0551a588f1"]').forEach((node, index) => {
      expect(node.text()).toEqual(testText[index]);
    });

    expect(app.html()).toEqual(
      getHtml(
        '<p>' +
          '<span data-wj-custom-text="true">' +
          '我是' +
          '<span class="huaxian" data-wj-custom-split="true" data-wj-custom-id="8f5e0551a588f1">很</span>' +
          '<span class="huaxian" data-wj-custom-split="true" data-wj-custom-id="8f5e0551a588f1">' +
          '<span class="huaxian" data-wj-custom-split="true" data-wj-custom-id="8f5e0551a588f2">' +
          '长很' +
          '</span>' +
          '</span>' +
          '<span class="huaxian" data-wj-custom-split="true" data-wj-custom-id="8f5e0551a588f1">长很长</span>' +
          '的文本' +
          '</span>' +
          '</p>'
      )
    );

    expect(toJson(app)).toMatchSnapshot();
  });

  it('测试修改props，dom结构更新', () => {
    const value = [
      {
        list: [{ level: [0, 0], start: 2, end: 8, text: '很长很长很长' }],
        text: '很长很长很长',
        mode: 'huaxian',
        id: '8f5e0551a588f1',
      },
    ];

    const app = mount(<Note modes={modes} template={template} />);
    app.update();

    expect(app.find('.huaxian').length).toBe(0);

    app.setProps({
      value,
    });
    app.update();

    expect(app.find('.huaxian').length).toBe(1);

    expect(app.find('.huaxian').text()).toEqual('很长很长很长');
  });
});
