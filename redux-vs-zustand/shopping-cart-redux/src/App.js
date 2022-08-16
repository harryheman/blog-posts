import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import { addToCart } from "./redux/cartSlice";

function App() {
  const dispatch = useDispatch();

  // 250 мс
  const addToCart2500Items = () => {
    const times = [];
    let id = 0;
    for (let i = 0; i < 25; i++) {
      const start = performance.now();
      for (let j = 0; j < 100; j++) {
        const item = {
          id: id++,
          title: "title",
          image: "image",
          price: "price",
        };
        dispatch(addToCart(item));
      }
      const difference = performance.now() - start;
      times.push(difference);
    }
    const time = Math.round(times.reduce((a, c) => (a += c), 0) / 25);
    console.log("Time:", time);
  };

  useEffect(() => {
    window.addEventListener("load", addToCart2500Items);

    return () => {
      window.removeEventListener("load", addToCart2500Items);
    };
  }, []);

  return (
    <div className="app">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
