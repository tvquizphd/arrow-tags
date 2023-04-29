type Data = Record<string, Content>;
type ParentNode = Node | DocumentFragment;
type RenderHTML = (
  (
    html: ArrowFunction, tag: string,
    children: Children, opts: Properties
  ) => ArrowTemplate
);
type ArrowTags = (
  (html: ArrowFunction) => Record<string, Tag>
);
type ArrowAttributes = (
  (tag: string, att: Data) => Children
);
export type Properties = Record<string, Content> & {
  data?: Data,
  key?: string
};
export type Content = (
  string | ((data: Data) => string)
);
export type Children = [
  pads: string[], ...vals: Content[]
]
export type Inputs = Content[] | Children;
export type ArrowFunction = (
  (...children: Children) => ArrowTemplate
);
export interface ArrowTemplate {
  (el: ParentNode): ParentNode;
  key: (s: string) => ArrowTemplate;
}
export type Tag = (
  (i: Inputs) => (o: Properties) => ArrowTemplate
)

/**
 * Format HTML attributes as tagged tmplate
 *
 * @example
 *
 * Format properties for to ArrowJS
 *
 * ```
 * import { html } from '@arrow-js/core';
 * import { arrowTags } from 'arrow-tags';
 * const props = {style: 'color: red;', id: 'red-span'};
 * const [ pads, ...vals ] = arrowAttributes('span', props);
 * // <span style="color: red;" id="red-span">hello</span>
 * const el = document.getElementById('root');
 * html([...pads, '</span>'], ...[...vals, 'hello'])(el);
 * ```
 *
 * @param tag - string for valid HTML tag
 * @param att - object with attributes
 * @returns tagged tmplate inputs
 */
const arrowAttributes: ArrowAttributes = (tag, att) => {
  const entries = Object.entries(att);
  if (entries.length === 0) {
    return [[`<${tag}>`]];
  }
  const aPads = entries.reduce((pads, [k]) => {
    const done = k === [...entries].pop()[0];
    const core = [...pads].pop() + `${k}="`;
    const end = done ? '">' : '" ';
    const pre = pads.slice(0, -1);
    return [...pre, core, end];
  }, [`<${tag} `]);
  return [aPads, ...Object.values(att)];
}

/**
 * Join a last item with a first item
 * @param pre - first array
 * @param post - second array
 * @returns joined string
 */
const join = (pre, post) => {
  return [pre.slice(-1)[0] + post[0]].map(v => v || '').join('');
}

/**
 * Merge the padding for two templates
 * @param v1 - first array or item
 * @param v2 - second array or item
 * @returns merged padding
 */
const mergePadding = (v0, v1) => {
  const pre = Array.isArray(v0)? v0 : [v0];
  const post = Array.isArray(v1)? v1 : [v1];
  return [
    ...pre.slice(0, -1), join(pre, post), ...post.slice(1)
  ];
}

/**
 * Render an HTML template with content and attributes
 * @param html - template function
 * @param tag - string for valid HTML tag
 * @param children - html inner content
 * @param opts - object with attributes
 * @returns ArrowJS DOM function
 */
const renderHTML: RenderHTML = (...args) => {
  const [ html, tag, children, opts={} ] = args;
  const { key, data, ...attr } = opts;
  const [aPads, ...aContents] = arrowAttributes(tag, attr);
  const [cPads, ...cContents] = children;
  // close out the tag
  const pads = mergePadding(
    mergePadding(aPads, cPads),
    [`</${tag}>`]
  );
  const vals = [...aContents, ...cContents].map((fn: Content) => {
    if (typeof fn !== 'function') return fn;
    if (data === undefined) return fn;
    return () => fn(data);
  });
  if (key !== undefined) {
    return html(pads, ...vals).key(key);
  }
  return html(pads, ...vals);
}

/**
 * True for invocations by tagged template
 * @param args - inputs with or without padding
 * @returns true for tagged template calls
 */
const isTemplate = args => {
  if (!Array.isArray(args[0])) return false;
  return (args[0].length === args.length);
}

/**
 * Nomalize direct invocation as tagged template
 * @param args - inputs with or without padding
 * @returns padding and input content
 */
const reformatNonTemplate = args => {
  if (isTemplate(args)) return args;
  return args.reduce(o => {
    o[0].push(''); return o;
  }, [[''], args]);
}

/**
 * Format tagged templates for HTML tags
 * @example
 * Pass contents, attributes, then html element
 * ```
 * import { html } from '@arrow-js/core';
 * import { arrowTags } from 'arrow-tags';
 * const greeting = 'Hello';
 * const style = 'color: red;';
 * // Render a span with red text to the DOM
 * const el = document.getElementById('root');
 * arrowTags(html).span`${greeting}`({ style })(el);
 * ```
 * @example
 * Pass reactive contents that update interactively
 * ```
 * import { reactive, html } from '@arrow-js/core';
 * import { arrowTags } from 'arrow-tags';
 * const data = reactive({ i: 0 });
 * const greetings = ['Hello', 'Goodbye'];
 * const toGreeting = ({ i }) => greetings[i % 2];
 * const props = { data, "@click": () => data.i += 1 };
 * // The button greeting reacts to user input
 * const el = document.getElementById('root');
 * arrowTags(html).button`${toGreeting}`(props)(el);
 * ```
 * @example
 * Pass attributes that update interactively
 * ```
 * import { reactive, html } from '@arrow-js/core';
 * import { arrowTags } from 'arrow-tags';
 * const data = reactive({ i: 0 });
 * const colors = ['red', 'pink'];
 * const toColors = ({ i }) => colors[i % 2];
 * const style = d => `color: ${toColors(d)};`;
 * // The button color reacts to user input
 * const el = document.getElementById('root');
 * arrowTags(html).button`Hello`({
 *    data, style, "@click": () => data.i += 1
 * })(el);
 * ```
 *
 * @param html - ArrowJS tagged template
 * @returns ArrowJS tagged template wrapper
 */
const arrowTags: ArrowTags = (html) => {
  return new Proxy({}, {
    get(_, _tag) {
      if (typeof _tag !== "string") {
        return undefined;
      }
      const tag = _tag.toLowerCase();
      return (...inputs) => {
        return (opts) => {
          const args = reformatNonTemplate(inputs);
          return renderHTML(html, tag, args, opts);
        }
      }
    }
  });
};

export { arrowTags, arrowAttributes };
