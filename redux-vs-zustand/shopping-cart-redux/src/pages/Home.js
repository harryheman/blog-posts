import "./home.css";
import Item from "../components/Item";
import { ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Home() {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);

  const getTotalQuantity = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.quantity;
    });
    return total;
  };

  return (
    <div className="home">
      <div className="home__container">
        <div className="home__row">
          <Item
            id={4}
            title="Amazon Echo (3rd generation) | Smart speaker with Alexa, Charcoal Fabric"
            price={98}
            image="https://media.very.co.uk/i/very/P6LTG_SQ1_0000000071_CHARCOAL_SLf?$300x400_retinamobilex2$"
          />

          <Item
            id={2}
            title="The Lean Startup: How Constant Innovation Create Radically Successful Businesses Paperback"
            price={29}
            image="https://images-na.ssl-images-amazon.com/images/I/51Zymoq7UnL.SX325_B01,204,203,200_.jpg"
          />

          <Item
            id={3}
            title="Samsung LC49RG90SSUXEN 49 Curve Led Gaming Monitor"
            price={199}
            image="https://images-na.ssl-images-amazon.com/images/I/71Swqqe7XAL._AC_SX466_.jpg"
          />

          <Item
            id={5}
            title="New Apple iPad Pro (12.9-inch, Wi-fi, 128GB) - Siver (4th Generation)"
            price={598}
            image="https://images-na.ssl-images-amazon.com/images/I/816ctt5WV5L._AC_SX385_.jpg"
          />

          <Item
            id={1}
            title="Kenwood kMix Stand Miser for Baking, Stylish Kitchen Mixer with K-beater, Dough Hook and Whisk"
            price={229}
            image="https://st.depositphotos.com/1765561/4857/i/450/depositphotos_48579839-stock-photo-opened-blue-stand-mixer.jpg"
            rating={4}
          />

          <Item
            id={6}
            title="Samsung LC49RG90SSUXEN 49' Curved LED Gaming Monitor - Super Ultra Wide Dual QHD 5120 x 1440"
            price={1094}
            image="https://images-na.ssl-images-amazon.com/images/I/6125mFrzr6L._AC_SX355_.jpg"
          />
        </div>
      </div>
      <div className="shopping-cart" onClick={() => navigate("/cart")}>
        <ShoppingCart id="cartIcon" />
        <p>{getTotalQuantity() || 0}</p>
      </div>
    </div>
  );
}

export default Home;
