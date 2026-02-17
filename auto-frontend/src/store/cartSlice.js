import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const exist = state.cartItems.find(item => item._id === product._id);
      if (exist) {
        exist.quantity += 1;
      } else {
        state.cartItems.push({ ...product, quantity: 1 });
      }
      state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
      state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
