const isA = v => Array.isArray(v);
const isFn = v => typeof v === 'function';

const methodNeedsCall = (callers, fn) => {
  if (!isFn(fn)) return false;
  return !!Object.keys(callers).find(m => {
    const bound_name = 'bound ' + m;
    return bound_name === fn.name;
  });
}

const pointToValue = (callers, fn) => {
  if (!methodNeedsCall(callers, fn)) return fn;
  return pointToValue(callers, fn());
}

const pointToArray = (callers, fn) => {
  const val = pointToValue(callers, fn());
  return isA(val) ? val : [];
}

export { pointToValue, pointToArray };
