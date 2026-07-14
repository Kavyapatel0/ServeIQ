import { createSlice } from "@reduxjs/toolkit";

/**
 * Cart slice — pure client state (no async thunks).
 * Every action here is synchronous; the server is only hit
 * when the cashier finally presses "Place Order".
 */
const initialState = {
    items: [],            // [{ id, name, price, category, image, quantity, notes }]
    tableId: null,
    tableName: null,
    customerId: null,
    customerName: null,
    coupon: null,         // { code, discount_type, discount_value, discount_amount }
    paymentMethod: "CASH",
    orderType: "DINE_IN",
    taxRate: 18,          // fetched from backend, default 18%
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem(state, action) {
            const existing = state.items.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1, notes: "" });
            }
        },
        removeItem(state, action) {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        incrementItem(state, action) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) item.quantity += 1;
        },
        decrementItem(state, action) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) {
                if (item.quantity > 1) item.quantity -= 1;
                else state.items = state.items.filter((i) => i.id !== action.payload);
            }
        },
        updateItemNotes(state, action) {
            const { id, notes } = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item) item.notes = notes;
        },
        setTable(state, action) {
            state.tableId = action.payload.id;
            state.tableName = action.payload.name;
        },
        setCustomer(state, action) {
            state.customerId = action.payload?.id ?? null;
            state.customerName = action.payload?.name ?? null;
        },
        applyCoupon(state, action) {
            state.coupon = action.payload;
        },
        removeCoupon(state) {
            state.coupon = null;
        },
        setPaymentMethod(state, action) {
            state.paymentMethod = action.payload;
        },
        setOrderType(state, action) {
            state.orderType = action.payload;
        },
        setTaxRate(state, action) {
            state.taxRate = action.payload;
        },
        clearCart() {
            return initialState;
        },
    },
});

export const {
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    updateItemNotes,
    setTable,
    setCustomer,
    applyCoupon,
    removeCoupon,
    setPaymentMethod,
    setOrderType,
    setTaxRate,
    clearCart,
} = cartSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartTable = (state) => ({
    id: state.cart.tableId,
    name: state.cart.tableName,
});
export const selectCartCustomer = (state) => ({
    id: state.cart.customerId,
    name: state.cart.customerName,
});
export const selectCoupon = (state) => state.cart.coupon;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
export const selectOrderType = (state) => state.cart.orderType;
export const selectTaxRate = (state) => state.cart.taxRate;

export const selectCartTotals = (state) => {
    const items = state.cart.items;
    const taxRate = state.cart.taxRate;
    const coupon = state.cart.coupon;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discountAmt = coupon?.discount_amount ?? 0;
    const taxableAmount = Math.max(0, subtotal - discountAmt);
    const tax = parseFloat(((taxableAmount * taxRate) / 100).toFixed(2));
    const total = parseFloat((taxableAmount + tax).toFixed(2));
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return { subtotal, discountAmt, tax, total, itemCount, taxRate };
};

export default cartSlice.reducer;
