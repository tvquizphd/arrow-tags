import { mergeChildren } from "./children.js";

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

const CALLERS = {
  asArrowAttributer: (tag, children, fns={}) => {
    const [pads, ...vals] = toAtt(tag, fns);
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
    return [pads, ...vals];
  }
}

export { CALLERS };
