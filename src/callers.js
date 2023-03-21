import { mergeChildren } from "./children.js";
import { isFn } from "./pointers.js";

const toAtt = (tag, fns) => {
  const entries = Object.entries(fns);
  if (entries.length === 0) {
    return [[`<${tag}>`]];
  }
  const pads = entries.reduce((pads, [k]) => {
    const done = k === [...entries].pop()[0];
    const core = [...pads].pop() + `${k}="`;
    const end = done ? '">' : '" ';
    const pre = pads.slice(0, -1);
    return [...pre, core, end];
  }, [`<${tag} `]);
  return [pads, ...Object.values(fns)];
}

const parseFns = (fns) => {
  const { html, key, ...attr } = fns;
  if (!isFn(html) || key === undefined) {
    return { attr, modify: (...a) => a };
  }
  const modify = (...args) => {
    const v = html(...args);
    if (!isFn(v.key)) return v;
    return v.key(`${key}`);
  }
  return { attr, modify };
}

const CALLERS = {
  asArrowAttributer: (tag, children, fns={}) => {
    const { attr, modify } = parseFns(fns);
    const [pads, ...vals] = toAtt(tag, attr);
    const child_pads = [];
    // Insert child templates
    children.forEach(child => {
      const [child_pad, ...child_att] = child;
      child_pads.push(...child_pad);
      vals.push(...child_att);
    });
    // close out the tag
    const pre = pads.pop(0);
    const post = `</${tag}>`;
    pads.push(...mergeChildren(child_pads, pre, post));
    // Return both static and dynamic content
    return modify(pads, ...vals);
  }
}

export { CALLERS };
