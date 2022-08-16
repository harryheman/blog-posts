import { useCallback } from "react";
import useCartStore from "../store/cart";
import "./item.css";

function Item({ id, title, image, price }) {
  const addToCart = useCartStore(({ addToCart }) => addToCart);

  const addItem = useCallback(() => {
    addToCart({ id, title, image, price });
  }, []);

  return (
    <div className="item">
      <div className="item__info">
        <p className="item__title">{title}</p>
        <p className="item__price">
          <small>$</small>
          <strong>{price}</strong>
        </p>
      </div>
      <img src={image} alt="item" />
      <button onClick={addItem}>Add to Cart</button>
    </div>
  );
}

export default Item;
