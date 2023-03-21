// src/pointers.js
var isA = (v) => Array.isArray(v);
var isFn = (v) => typeof v === "function";
var methodNeedsCall = (callers, fn) => {
  if (!isFn(fn))
    return false;
  return !!Object.keys(callers).find((m) => {
    const bound_name = "bound " + m;
    return bound_name === fn.name;
  });
};
var pointToValue = (callers, fn) => {
  if (!methodNeedsCall(callers, fn))
    return fn;
  return pointToValue(callers, fn());
};
var pointToArray = (callers, fn) => {
  const val = pointToValue(callers, fn());
  return isA(val) ? val : [];
};

// src/children.js
var isA2 = (v) => Array.isArray(v);
var isP = (v) => typeof v === "string";
var isPad = (v) => isA2(v) && v.every(isP);
var isChild = (v) => isA2(v) && !isPad(v[0]);
var toChildren = (callers, args) => {
  const merge = (x, y) => x.reduce(toMerger(callers), [y]);
  if (!isChild(args)) {
    const [first2, ...vals] = args;
    return [merge(vals, first2)];
  }
  const first = [""].concat(args.map(() => ""));
  return [merge(args, first)];
};
var interlace = ([...p1], p2, i) => {
  const [pre, post] = [...p1].splice(i, 2);
  const patch = mergeChildren(p2, pre, post);
  p1.splice(i, patch.length, ...patch);
  return p1;
};
var mergeChildren = (pads, pre, post) => {
  const start = pads[0] || "";
  const mid = pads.slice(1, -1);
  const end = [...pads].pop() || "";
  return [pre + start, ...mid, end + post];
};
var toMerger = (callers) => {
  return (o, v, i, { length }) => {
    const [ofirst, ...ovals] = o;
    const a = pointToValue(callers, v);
    if (!isA2(a)) {
      return [ofirst, ...ovals, a];
    }
    if (isChild(a)) {
      const avals2 = isA2(a) ? a : [a];
      return avals2.reduce(toMerger, o);
    }
    const [afirst, ...avals] = a;
    const n = -(1 + length - i);
    return [
      interlace(ofirst, afirst, n),
      ...ovals,
      ...avals
    ];
  };
};

// src/callers.js
var toAtt = (tag, fns) => {
  const entries = Object.entries(fns);
  if (entries.length === 0) {
    return [[`<${tag}>`]];
  }
  const pads = entries.reduce((pads2, [k]) => {
    const done = k === [...entries].pop()[0];
    const core = [...pads2].pop() + `${k}="`;
    const end = done ? '">' : '" ';
    const pre = pads2.slice(0, -1);
    return [...pre, core, end];
  }, [`<${tag} `]);
  return [pads, ...Object.values(fns)];
};
var CALLERS = {
  asArrowAttributer: (tag, children, fns = {}) => {
    const [pads, ...vals] = toAtt(tag, fns);
    const child_pads = [];
    children.forEach((child) => {
      const [child_pad, ...child_att] = child;
      child_pads.push(...child_pad);
      vals.push(...child_att);
    });
    const pre = pads.pop(0);
    const post = `</${tag}>`;
    pads.push(...mergeChildren(child_pads, pre, post));
    return [pads, ...vals];
  }
};

// src/index.js
var switchValue = (data) => {
  return (v) => {
    switch (typeof v) {
      case "function":
        return v.bind(null, data);
      case "number":
        return () => v.parseInt(10);
      case "string":
        return () => v;
      default:
        return () => false;
    }
  };
};
var render = (callers) => {
  return (id, html, data, input) => {
    const el = document.getElementById(id);
    const template = pointToArray(callers, input);
    const [pads, ...vals] = template;
    const bound = switchValue(data);
    const values = vals.map(bound);
    html(pads, ...values)(el);
  };
};
var toArrowTags = (callers) => {
  const asArrowTag = (tag) => {
    const asArrowComponent = (...args) => {
      const children = toChildren(callers, args);
      return callers.asArrowAttributer.bind(null, tag, children);
    };
    return asArrowComponent;
  };
  return {
    render: render(callers),
    _: (pads, ...fns) => [pads, ...fns],
    Div: asArrowTag("div"),
    Em: asArrowTag("em"),
    A: asArrowTag("a")
  };
};
var ArrowTags = toArrowTags(CALLERS);
var src_default = ArrowTags;
export {
  src_default as default
};
