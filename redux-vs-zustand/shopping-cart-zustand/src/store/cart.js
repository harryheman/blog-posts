import create from "zustand";
// import { persist } from "zustand/middleware";

const useCartStore = create((set, get) => ({
  cart: [],
  addToCart: (item) => {
    const { cart } = get();
    const itemInCart = cart.find((i) => i.id === item.id);
    const newCart = itemInCart
      ? cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...cart, { ...item, quantity: 1 }];
    set({ cart: newCart });
  },
  removeItem: (id) => {
    const newCart = get().cart.filter((i) => i.id !== id);
    set({ cart: newCart });
  },
  incrementQuantity: (id) => {
    const newCart = get().cart.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    );
    set({ cart: newCart });
  },
  decrementQuantity: (id) => {
    const newCart = get().cart.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity - 1 } : i
    );
    set({ cart: newCart });
  },
  getTotalItems: () => get().cart.length,
  getTotalQuantity: () => get().cart.reduce((x, y) => x + y.quantity, 0),
  getTotalPrice: () => get().cart.reduce((x, y) => x + y.price * y.quantity, 0),
}));

// const useCartStore = create(
//   persist(
//     (set, get) => ({
//       cart: [],
//       addToCart: (item) => {
//         const { cart } = get();
//         const itemInCart = cart.find((i) => i.id === item.id);
//         const newCart = itemInCart
//           ? cart.map((i) =>
//               i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
//             )
//           : [...cart, { ...item, quantity: 1 }];
//         set({ cart: newCart });
//       },
//       removeItem: (id) => {
//         const newCart = get().cart.filter((i) => i.id !== id);
//         set({ cart: newCart });
//       },
//       incrementQuantity: (id) => {
//         const newCart = get().cart.map((i) =>
//           i.id === id ? { ...i, quantity: i.quantity + 1 } : i
//         );
//         set({ cart: newCart });
//       },
//       decrementQuantity: (id) => {
//         const newCart = get().cart.map((i) =>
//           i.id === id ? { ...i, quantity: i.quantity - 1 } : i
//         );
//         set({ cart: newCart });
//       },
//       getTotalItems: () => get().cart.length,
//       getTotalQuantity: () => get().cart.reduce((x, y) => x + y.quantity, 0),
//       getTotalPrice: () =>
//         get().cart.reduce((x, y) => x + y.price * y.quantity, 0),
//     }),
//     {
//       name: "cart-storage",
//       getStorage: () => localStorage,
//     }
//   )
// );

export default useCartStore;
