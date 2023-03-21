import { isA, pointToValue } from "./pointers.js";

const isP = v => typeof v === 'string';
const isPad = v => isA(v) && v.every(isP);
const isChild = v => isA(v) && !isPad(v[0]);

const toChildren = (callers, args) => {
  const merge = (x,y) => x.reduce(toMerger(callers), [y]);
  if (!isChild(args)) {
    const [first, ...vals] = args;
    return [merge(vals, first)];
  }
  const first = [''].concat(args.map(() => ''));
  return [merge(args, first)];
}

const interlace = ([...p1], p2, i) => {
  const [ pre, post ] = [...p1].splice(i, 2);
  const patch = mergeChildren(p2, pre, post);
  p1.splice(i, 2, ...patch);
  return p1;
}

const mergeChildren = (pads, pre, post) => {
  const start = pads[0] || '';
  const mid = pads.slice(1, -1);
  const end = [...pads].pop() || '';
  return [pre + start, ...mid, end + post];
}

const toMerger = (callers) => {
  return (o, v, i, {length}) => {
    const [ofirst, ...ovals] = o;
    const a = pointToValue(callers, v);
    if (!isA(a)) {
      return [ ofirst, ...ovals, a ];
    }
    if (isChild(a)) { //Untested
      const avals = isA(a) ? a : [a];
      return avals.reduce(toMerger, o);
    }
    const [afirst, ...avals] = a;
    const n = -(1 + length - i);
    return [
      interlace(ofirst, afirst, n),
      ...ovals, ...avals
    ];
  }
}

export { toChildren, mergeChildren };
