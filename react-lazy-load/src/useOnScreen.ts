import React from "react";

export const range = (
  start: number = 0,
  stop: number = 1,
  step: number = 0.1,
  precision: number = 1
) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) =>
    Number((start + i * step).toFixed(precision))
  );

const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  observerOptions?: IntersectionObserverInit
) => {
  const [isIntersecting, setIntersecting] = React.useState(false);
  const [ratio, setRatio] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const observable = ref.current as HTMLElement;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
      setRatio(entry.intersectionRatio);
      setWidth(entry.intersectionRect.width);
      setHeight(entry.intersectionRect.height);
    }, observerOptions);

    observer.observe(observable);

    return () => observer.unobserve(observable);
  }, []);

  const values = React.useMemo(
    () => ({
      isIntersecting,
      ratio: Math.round(ratio * 100),
      width: Math.round(width),
      height: Math.round(height),
    }),
    [isIntersecting, ratio, width, height]
  );

  return values;
};

export default useOnScreen;
