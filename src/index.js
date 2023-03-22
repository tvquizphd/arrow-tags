import { CALLERS } from './callers.js';
import { toChildren } from './children.js';
import { pointToArray } from './pointers.js';

const TAGS = [
  'A', 'Abbr', 'Acronym', 'Address', 'Applet', 'Area', 'Article', 'Aside', 'Audio',
  'B', 'Base', 'Bdi', 'Bdo', 'Bgsound', 'Big', 'Blink', 'Blockquote', 'Body', 'Br',
  'Button', 'Canvas', 'Caption', 'Center', 'Cite', 'Code', 'Col', 'Colgroup', 'Content',
  'Data', 'Datalist', 'Dd', 'Del', 'Details', 'Dfn', 'Dialog', 'Dir', 'Div', 'Dl', 'Dt',
  'Em', 'Embed', 'Fieldset', 'Figcaption', 'Figure', 'Font', 'Footer', 'Form', 'Frame',
  'Frameset', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Head', 'Header', 'Hr', 'I', 'Iframe',
  'Image', 'Img', 'Input', 'Ins', 'Kbd', 'Keygen', 'Label', 'Legend', 'Li', 'Link',
  'Main', 'Map', 'Mark', 'Marquee', 'Menu', 'Menuitem', 'Meta', 'Meter', 'Nav', 'Nobr',
  'Noembed', 'Noframes', 'Noscript', 'Object', 'Ol', 'Optgroup', 'Option', 'Output',
  'P', 'Param', 'Picture', 'Plaintext', 'Portal', 'Pre', 'Progress', 'Q', 'Rb', 'Rp',
  'Rt', 'Rtc', 'Ruby', 'S', 'Samp', 'Script', 'Section', 'Select', 'Shadow', 'Slot',
  'Small', 'Source', 'Spacer', 'Span', 'Strike', 'Strong', 'Style', 'Sub', 'Summary',
  'Sup', 'Svg', 'Table', 'Tbody', 'Td', 'Template', 'Textarea', 'Tfoot', 'Th', 'Thead',
  'Time', 'Title', 'Tr', 'Track', 'Tt', 'U', 'Ul', 'Var', 'Video', 'Wbr', 'Xmp'
];

const switchValue = data => {
  return v => {
    switch(typeof v) {
      case 'function':
        return (...a) => v(data, ...a);
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

const toArrowTags = (callers, tags) => {
  const asArrowTag = (tag) => {
    const asArrowComponent = (...args) => {
      // Insert own attributes and children
      const children = toChildren(callers, args);
      return callers.asArrowAttributer.bind(null, tag, children);
    }
    return asArrowComponent;
  }
  const templates = Object.fromEntries(tags.map(tag => {
    return [tag, asArrowTag(tag.toLowerCase())]
  }));
  return {
    ...templates,
    render: render(callers),
    _: (pads, ...fns) => [pads, ...fns],
  }
}

const ArrowTags = toArrowTags(CALLERS, TAGS);

export default ArrowTags;
