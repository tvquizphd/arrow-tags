type ParentNode = Node | DocumentFragment;
type Data = Record<string, Val>;
type Val = (
  string | ((data: Data) => string)
);
type Children = [
  pads: string[], ...vals: Val[]
]
type Inputs = Val[] | Children;
type Opts = Record<string, Val> & {
  data?: Data,
  key?: string
};
type ParseAtt = (
  (tag: string, att: Data) => Children
);
type ArrowFunction = (
  (...children: Children) => ArrowTemplate
);
type AsArrowAtt = (
  (
    html: ArrowFunction, tag: string,
    children: Children, opts: Opts
  ) => ArrowTemplate
);
interface ArrowTemplate {
  (el: ParentNode): ParentNode;
  key: (s: string) => ArrowTemplate;
}

const parseAtt: ParseAtt = (tag, att) => {
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

const asMiddle = (pre, post) => {
  return [pre.slice(-1)[0] + post[0]].map(v => v || '').join('');
}

const mergePadding = (_pre, _post) => {
  const post = Array.isArray(_post)? _post : [_post];
  const pre = Array.isArray(_pre)? _pre : [_pre];
  return [
    ...pre.slice(0, -1), asMiddle(pre, post), ...post.slice(1)
  ];
}

const asArrowAtt: AsArrowAtt = (...args) => {
  const [ html, tag, children, opts={} ] = args;
  const { key, data, ...attr } = opts;
  const [aPads, ...aVals] = parseAtt(tag, attr);
  const [cPads, ...cVals] = children;
  // close out the tag
  const pads = mergePadding(
    mergePadding(aPads, cPads),
    [`</${tag}>`]
  );
  const vals = [...aVals, ...cVals].map((fn: Val) => {
    if (typeof fn !== 'function') return fn;
    if (data === undefined) return fn;
    return () => fn(data);
  });
  if (key !== undefined) {
    return html(pads, ...vals).key(key);
  }
  return html(pads, ...vals);
}

const isTemplate = args => {
  if (!Array.isArray(args[0])) return false;
  return (args[0].length === args.length);
}

const reformatNonTemplate = args => {
  if (isTemplate(args)) return args;
  return args.reduce(o => {
    o[0].push(''); return o;
  }, [[''], args]);
}

export default html => {
  return new Proxy({}, {
    get(_, _tag) {
      if (typeof _tag !== "string") {
        return undefined;
      }
      const tag = _tag.toLowerCase();
      return (...inputs) => {
        return (opts) => {
          const args = reformatNonTemplate(inputs);
          return asArrowAtt(html, tag, args, opts);
        }
      }
    }
  });
};
