import { useState } from "react";
import Slider from "./components/Slider";
import Table from "./components/Table";
import data from "./data";

function App() {
  const [slideWidth, setSlideWidth] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  return (
    <div className="app">
      <Slider
        items={data}
        setSlideWidth={setSlideWidth}
        setScrollLeft={setScrollLeft}
        offsetX={offsetX}
      />
      <Table
        items={data}
        slideWidth={slideWidth}
        scrollLeft={scrollLeft}
        setOffsetX={setOffsetX}
      />
    </div>
  );
}

export default App;
