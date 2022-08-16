import useCartStore from "../store/cart";
import "./total.css";

function Total() {
  const { getTotalQuantity, getTotalPrice } = useCartStore(
    ({ getTotalQuantity, getTotalPrice }) => ({
      getTotalQuantity,
      getTotalPrice,
    })
  );

  return (
    <div className="total">
      <h2>ORDER SUMMARY</h2>
      <div>
        <p className="total__p">
          total ({getTotalQuantity()} items) :{" "}
          <strong>${getTotalPrice()}</strong>
        </p>
      </div>
    </div>
  );
}

export default Total;
