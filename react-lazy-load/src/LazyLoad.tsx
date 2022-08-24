import React from "react";

const Placeholder = (props: {
  width?: number | string;
  height?: number | string;
}) => {
  const width =
    props.width && typeof props.width === "string"
      ? props.width
      : props.width + "px";
  const height =
    props.height && typeof props.height === "string"
      ? props.height
      : props.height + "px";

  return <div className="child-placeholder" style={{ width, height }}></div>;
};

type LazyLoadProps = {
  children: JSX.Element;
  width?: number | string;
  height?: number | string;
  once?: boolean;
  observerOptions?: IntersectionObserverInit;
};

const LazyLoad = (props: LazyLoadProps) => {
  const childRef = React.useRef<HTMLDivElement>(null);
  const [isIntersecting, setIntersecting] = React.useState(false);

  React.useEffect(() => {
    const child = childRef.current as HTMLDivElement;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);

      if (props.once && entry.isIntersecting) {
        observer.unobserve(child);
      }
    }, props.observerOptions);

    observer.observe(child);

    return () => observer.unobserve(child);
  }, []);

  if (props.once && isIntersecting) return props.children;

  return (
    <div ref={childRef} className="lazy-load-box">
      {isIntersecting ? (
        props.children
      ) : (
        <Placeholder width={props.width} height={props.height} />
      )}
    </div>
  );
};

export default LazyLoad;
