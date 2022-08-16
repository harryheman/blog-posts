import "./cart.css";
import Total from "../components/Total";
import CartItem from "../components/CartItem";
import useCartStore from "../store/cart";

function Cart() {
  const cart = useCartStore(({ cart }) => cart);

  return (
    <div className="cart">
      <div className="cart__left">
        <div>
          <h3>Shopping Cart</h3>
          {cart.map((i) => (
            <CartItem key={i.id} {...i} />
          ))}
        </div>
      </div>

      <div className="cart__right">
        <Total />
      </div>
    </div>
  );
}

export default Cart;
