import { useEffect, useRef, useState } from "react";

export function areEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b;

  if (a.prototype !== b.prototype) return false;

  const keys = Object.keys(a);

  if (keys.length !== Object.keys(b).length) return false;

  return keys.every((k) => areEqual(a[k], b[k]));
}

function usePrevious(v: any) {
  const ref = useRef<any>();

  useEffect(() => {
    ref.current = v;
  }, [v]);

  return ref.current;
}

function useDeepEffect(cb: (...args: any[]) => void, deps: any[]) {
  const prevDeps = usePrevious(deps);
  const firstRender = useRef(true);
  const [needUpdate, setNeedUpdate] = useState({});

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    for (const i in deps) {
      if (!areEqual(deps[i], prevDeps[i])) {
        setNeedUpdate({});
        break;
      }
    }
  }, deps);

  useEffect(cb, [needUpdate]);
}

export default useDeepEffect;
