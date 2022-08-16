import "./App.css";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import useCartStore from "./store/cart";
import { useEffect } from "react";

function App() {
  const addToCart = useCartStore(({ addToCart }) => addToCart);

  // 10 мс
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
        addToCart(item);
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
