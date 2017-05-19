/* eslint-env jest */
/* eslint-disable max-len, react/no-multi-comp */
jest.unmock('../SelectField');

import React from 'react';
import { shallow, mount } from 'enzyme';
import {
  renderIntoDocument,
  findRenderedComponentWithType,
} from 'react-dom/test-utils';

import SelectField from '../SelectField';
import Menu from '../../Menus/Menu';

const PROPS = { id: 'test' };
describe('SelectField', () => {
  it('merges className and style', () => {
    const props = Object.assign({}, PROPS, {
      id: 'woop',
      style: { background: 'orange' },
      className: 'woop-woop',
    });

    const field = renderIntoDocument(<SelectField {...props} />);
    const menu = findRenderedComponentWithType(field, Menu);
    expect(menu.props.style).toBe(props.style);
    expect(menu.props.className).toContain(props.className);
  });

  it('can get the value with a ref', () => {
    let _field = null;
    const ref = f => { _field = f; };
    let field = renderIntoDocument(<SelectField {...PROPS} ref={ref} />);
    expect(_field).not.toBe(null);
    expect(_field.value).toBe('');
    expect(field.value).toBe('');

    field.setState({ value: 'hello' });
    expect(_field.value).toBe('hello');
    expect(field.value).toBe('hello');

    _field = null;
    field = renderIntoDocument(<SelectField {...PROPS} value="testing" ref={ref} onChange={jest.fn()} />);
    expect(_field).not.toBe(null);
    expect(_field.value).toBe('testing');
    expect(field.value).toBe('testing');
  });

  describe('_getItemPart', () => {
    it('should return the item if it is a number or string', () => {
      const field = shallow(<SelectField id="test" />).instance();
      expect(field._getItemPart('apple', 'label', 'value', false)).toBe('apple');
      expect(field._getItemPart('apple', 'label', 'value', true)).toBe('apple');
      expect(field._getItemPart('', 'label', 'value', false)).toBe('');
      expect(field._getItemPart('', 'label', 'value', true)).toBe('');
      expect(field._getItemPart(-100, 'label', 'value', false)).toBe(-100);
      expect(field._getItemPart(-100, 'label', 'value', true)).toBe(-100);
      expect(field._getItemPart(3, 'label', 'value', false)).toBe(3);
      expect(field._getItemPart(3, 'label', 'value', true)).toBe(3);
      expect(field._getItemPart(0, 'label', 'value', false)).toBe(0);
      expect(field._getItemPart(0, 'label', 'value', true)).toBe(0);
    });

    it('should return the item value if it exists and fallback to the item label', () => {
      const field = shallow(<SelectField id="test" />).instance();

      expect(field._getItemPart({ label: 'Hello', value: 'a' }, 'label', 'value', false)).toBe('a');
      expect(field._getItemPart({ label: 'Hello', value: 'a' }, 'label', 'value', true)).toBe('Hello');

      expect(field._getItemPart({ label: 'Hello', value: '' }, 'label', 'value', false)).toBe('');
      expect(field._getItemPart({ label: 'Hello', value: '' }, 'label', 'value', true)).toBe('Hello');

      expect(field._getItemPart({ label: 'Hello', value: 0 }, 'label', 'value', false)).toBe(0);
      expect(field._getItemPart({ label: 'Hello', value: 0 }, 'label', 'value', true)).toBe('Hello');

      expect(field._getItemPart({ label: '', value: 'a' }, 'label', 'value', false)).toBe('a');
      expect(field._getItemPart({ label: '', value: 'a' }, 'label', 'value', true)).toBe('');

      expect(field._getItemPart({ label: 0, value: 'a' }, 'label', 'value', false)).toBe('a');
      expect(field._getItemPart({ label: 0, value: 'a' }, 'label', 'value', true)).toBe(0);
    });
  });

  describe('_getActiveItemLabel', () => {
    it('it should return the item if it is a number or a string and equals the current value', () => {
      const field = shallow(<SelectField id="test" />).instance();

      expect(field._getActiveItemLabel('3', '', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel('3', 'monkey', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel('monkey', 'monkey', 'label', 'value')).toBe('monkey');
      expect(field._getActiveItemLabel('3', '3', 'label', 'value')).toBe('3');
      expect(field._getActiveItemLabel(3, 3, 'label', 'value')).toBe(3);
      expect(field._getActiveItemLabel(0, 0, 'label', 'value')).toBe(0);
    });

    it('should return the item\'s label if it is an object and it\'s value equals the current value', () => {
      const field = shallow(<SelectField id="test" />).instance();
      expect(field._getActiveItemLabel({ label: 'No Way', value: 3 }, '', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel({ label: 'No Way', value: 3 }, '3', 'label', 'value')).toBe('No Way');
      expect(field._getActiveItemLabel({ label: 'No Way', value: '3' }, '3', 'label', 'value')).toBe('No Way');
      expect(field._getActiveItemLabel({ label: 'No Way' }, '3', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel({ label: 'No Way', value: 0 }, '', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel({ label: 'No Way', value: '0' }, '', 'label', 'value')).toBe('');
      expect(field._getActiveItemLabel({ label: 'No Way', value: '' }, '', 'label', 'value')).toBe('No Way');
    });
  });

  it('should update the activeLabel if the prop value changes', () => {
    const field = shallow(<SelectField id="test" menuItems={['1', '2', '3']} value="" onChange={jest.fn()} />);
    expect(field.state('activeLabel')).toBe('');

    field.setProps({ value: '2' });
    expect(field.state('activeLabel')).toBe('2');
  });

  it('should update the activeLabel if the menuItems prop changes', () => {
    const menuItems = ['Hello', 'World!', 'Yes', 'No'];
    const field = shallow(<SelectField id="test" menuItems={menuItems} value="Missing" onChange={jest.fn()} />);
    expect(field.state('activeLabel')).toBe('');

    field.setProps({ menuItems: [...menuItems, 'Missing'] });
    expect(field.state('activeLabel')).toBe('Missing');
  });

  it('should still have the correct label if the menuItems are defined as a list in the render and the parent component rerenders', () => {
    let renderCount = 0;
    class Test extends React.Component {
      render() {
        renderCount += 1;

        return (
          <div>
            <SelectField id="test" menuItems={['1', '2', '3']} defaultValue="2" />
          </div>
        );
      }
    }

    const test = mount(<Test />);
    expect(renderCount).toBe(1);
    expect(test.find(SelectField).get(0).state.activeLabel).toBe('2');
    test.update();
    expect(renderCount).toBe(2);
    expect(test.find(SelectField).get(0).state.activeLabel).toBe('2');
  });

  it('should still have the correct label if the menuItems of objects are defined as a list in the render and the parent component rerenders', () => {
    let renderCount = 0;
    class Test extends React.Component {
      render() {
        renderCount += 1;

        return (
          <div>
            <SelectField
              id="test"
              menuItems={[{ label: 'Hello', value: 0 }, { label: 'World', value: 1 }, { label: 'Omega', value: 2 }]}
              defaultValue={1}
            />
          </div>
        );
      }
    }

    const test = mount(<Test />);
    expect(renderCount).toBe(1);
    expect(test.find(SelectField).get(0).state.activeLabel).toBe('World');
    test.update();
    expect(renderCount).toBe(2);
    expect(test.find(SelectField).get(0).state.activeLabel).toBe('World');
  });

  it('should not update the error state on update if it has not been focused yet', () => {
    let renderCount = 0;
    class Test extends React.Component {
      render() {
        renderCount += 1;

        return (
          <div>
            <SelectField
              id="test"
              menuItems={[{ label: 'Hello', value: 0 }, { label: 'World', value: 1 }, { label: 'Omega', value: 2 }]}
              required
            />
          </div>
        );
      }
    }

    const test = mount(<Test />);
    expect(renderCount).toBe(1);

    let field = test.find(SelectField).get(0);
    expect(field.state.error).toBe(false);

    test.update();
    expect(renderCount).toBe(2);
    field = test.find(SelectField).get(0);
    expect(field.state.error).toBe(false);

    const input = test.find('.md-select-field');
    expect(input.length).toBe(1);

    input.simulate('focus');
    expect(field.state.error).toBe(false);

    input.simulate('blur');
    expect(field.state.error).toBe(true);
  });
});
