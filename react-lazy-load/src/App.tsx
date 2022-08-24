import React from "react";
import LazyLoad from "./LazyLoad";
import useOnScreen, { range } from "./useOnScreen";

const Item = (props: { n: number }) => {
  console.log("render");

  return <div className="item">{props.n}</div>;
};

const List = () => (
  <div className="list">
    {Array.from({ length: 10 }).map((_, i) => (
      <LazyLoad key={i} height="50vh" once>
        <Item n={i + 1} />
      </LazyLoad>
    ))}
  </div>
);

function App() {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const { ratio, height } = useOnScreen(outerRef, {
    threshold: range(0, 1, 0.01, 2),
  });

  // return <List />;

  return (
    <div className="outer" ref={outerRef}>
      <div className="inner" style={{ height }}>
        <p
          style={{
            opacity: ratio / 100 - 0.1,
            transform: ratio > 90 ? "scale(1.25)" : "none",
          }}
        >
          Follow You!
        </p>
      </div>
    </div>
  );
}

export default App;
