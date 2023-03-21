import { CALLERS } from './callers.js';
import { toChildren } from './children.js';
import { pointToArray } from './pointers.js';

const switchValue = data => {
  return v => {
    switch(typeof v) {
      case 'function':
        return v.bind(null, data);
      case 'number':
        return () => v.parseInt(10);
      case 'string':
        return () => v;
      default:
        return () => false
    }
  }
}

const render = (callers) => {
  return (id, html, data, input) => {
    const el = document.getElementById(id);
    const template = pointToArray(callers, input);
    const [pads, ...vals] = template;
    const bound = switchValue(data);
    const values = vals.map(bound);
    html(pads, ...values)(el);
  }
}

const toArrowTags = (callers) => {
  const asArrowTag = (tag) => {
    const asArrowComponent = (...args) => {
      // Insert own attributes and children
      const children = toChildren(callers, args);
      return callers.asArrowAttributer.bind(null, tag, children);
    }
    return asArrowComponent;
  }
  return {
    render: render(callers),
    _: (pads, ...fns) => [pads, ...fns],
    Div: asArrowTag('div'),
    Em: asArrowTag('em'),
    A: asArrowTag('a'),
  }
}

const ArrowTags = toArrowTags(CALLERS);

export default ArrowTags;
