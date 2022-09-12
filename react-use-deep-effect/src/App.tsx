import React, { useState, useCallback, useEffect } from "react";
import useDeepEffect, { areEqual } from "./useDeepEffect";

type Props = {
  count?: number;
  object: Record<string, any>;
};

const Component = ({ count, object }: Props) => {
  useDeepEffect(() => {
    console.log("effect");
  }, [object]);

  return <div>Count: {count}</div>;
};

// const Component = React.memo(({ count, object }: Props) => {
//   console.log("render");

//   useEffect(() => {
//     console.log("effect");
//   }, [object]);

//   return null;
// }, areEqual);

// function showProps(prevProps: Props, nextProps: Props) {
//   console.log("Previous props", prevProps);
//   console.log("Next props", nextProps);

//   return prevProps.object.some === nextProps.object.some;
// }

function App() {
  const [count, setCount] = useState(0);

  const increaseCount = useCallback(() => {
    setCount((count) => count + 1);
  }, []);

  const object = { some: "value" };

  return (
    <>
      <button onClick={increaseCount}>Increase count</button>
      {/* <div>Count: {count}</div> */}
      <Component count={count} object={object} />
    </>
  );
}

export default App;
