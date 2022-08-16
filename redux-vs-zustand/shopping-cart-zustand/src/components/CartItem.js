import useCartStore from "../store/cart";
import "./cartItem.css";

function CartItem({ id, image, title, price, quantity = 0 }) {
  const { incrementQuantity, decrementQuantity, removeItem } = useCartStore(
    ({ incrementQuantity, decrementQuantity, removeItem }) => ({
      incrementQuantity,
      decrementQuantity,
      removeItem,
    })
  );

  return (
    <div className="cartItem">
      <img className="cartItem__image" src={image} alt="item" />

      <div className="cartItem__info">
        <p className="cartItem__title">{title}</p>
        <p className="cartItem__price">
          <small>$</small>
          <strong>{price}</strong>
        </p>
        <div className="cartItem__incrDec">
          <button
            onClick={() => {
              if (quantity === 1) return;
              decrementQuantity(id);
            }}
          >
            -
          </button>
          <p>{quantity}</p>
          <button onClick={() => incrementQuantity(id)}>+</button>
        </div>
        <button
          className="cartItem__removeButton"
          onClick={() => removeItem(id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
