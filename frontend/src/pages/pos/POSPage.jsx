import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import {
  selectCartItems, selectCartTotals, selectCartTable,
  selectCartCustomer, selectCoupon, clearCart, setTable,
} from "@/redux/slices/cartSlice";
import {
  getMenuCategories, getMenuItems, getTables, createOrder,
} from "@/services/posApi";

import { CategorySidebar }   from "@/components/pos/CategorySidebar";
import { MenuGrid }           from "@/components/pos/MenuGrid";
import { BillingSummary }     from "@/components/pos/BillingSummary";
import { CouponModal }        from "@/components/pos/CouponModal";
import { CustomerModal }      from "@/components/pos/CustomerModal";
import { PaymentModal }       from "@/components/pos/PaymentModal";
import { TableSelector }      from "@/components/pos/TableSelector";
import { OrderSuccessModal }  from "@/components/pos/OrderSuccessModal";
import { useDebounce }        from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";

export function POSPage() {
  const dispatch = useDispatch();

  const [categories,      setCategories]      = useState([]);
  const [menuItems,       setMenuItems]        = useState([]);
  const [tables,          setTables]           = useState([]);
  const [activeCategoryId,setActiveCategoryId] = useState(null);
  const [searchInput,     setSearchInput]      = useState("");
  const [menuLoading,     setMenuLoading]      = useState(false);

  const [showCoupon,   setShowCoupon]   = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showPayment,  setShowPayment]  = useState(false);
  const [showTable,    setShowTable]    = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [lastOrder,      setLastOrder]      = useState(null);

  const cartItems = useSelector(selectCartItems);
  const totals    = useSelector(selectCartTotals);
  const cartTable = useSelector(selectCartTable);
  const customer  = useSelector(selectCartCustomer);
  const coupon    = useSelector(selectCoupon);

  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    getMenuCategories().then((d) => setCategories(d?.categories ?? [])).catch(() => {});
    getTables().then((d) => setTables(d?.tables ?? [])).catch(() => {});
  }, []);

  const loadMenu = useCallback(() => {
    setMenuLoading(true);
    const params = {};
    if (activeCategoryId) params.category_id = activeCategoryId;
    if (debouncedSearch)  params.search = debouncedSearch;
    getMenuItems(params)
      .then((d) => setMenuItems(d?.items ?? []))
      .catch(() => setMenuItems([]))
      .finally(() => setMenuLoading(false));
  }, [activeCategoryId, debouncedSearch]);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const handlePlaceOrder = async (paymentMethod, amountTendered) => {
    if (!cartItems.length) return;
    setPaymentLoading(true);
    try {
      const payload = {
        items: cartItems.map((i) => ({
          menu_item_id: i.id,
          quantity:     i.quantity,
          unit_price:   i.price,
          notes:        i.notes || undefined,
        })),
        table_id:        cartTable.id ?? undefined,
        customer_id:     customer.id  ?? undefined,
        coupon_code:     coupon?.code  ?? undefined,
        payment_method:  paymentMethod,
        amount_tendered: amountTendered,
        order_type:      cartTable.id ? "DINE_IN" : "TAKEAWAY",
      };
      const result = await createOrder(payload);
      setLastOrder(result?.order ?? result);
      setShowPayment(false);
      setShowSuccess(true);
      dispatch(clearCart());
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.message ?? "Failed to place order.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden bg-warm-100" style={{ height: "calc(100vh - 4rem)" }}>

      {/* ── Category sidebar ──────────────────────────────── */}
      <div className="w-[82px] shrink-0 overflow-y-auto border-r border-warm-200 bg-surface scrollbar-thin">
        <CategorySidebar
          categories={categories}
          activeId={activeCategoryId}
          onSelect={(id) => { setActiveCategoryId(id); setSearchInput(""); }}
        />
      </div>

      {/* ── Menu area ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Search bar */}
        <div className="border-b border-warm-200 bg-surface px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search menu items…"
              className={cn(
                "h-10 w-full rounded-input border border-warm-200 bg-warm-100 py-2 pl-9 pr-9 text-sm",
                "text-text-primary placeholder:text-text-disabled",
                "transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-surface"
              )}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          <MenuGrid items={menuItems} loading={menuLoading} />
        </div>
      </div>

      {/* ── Billing panel ─────────────────────────────────── */}
      <div className="w-[300px] shrink-0 overflow-y-auto border-l border-warm-200 bg-surface">
        <BillingSummary
          onApplyCoupon={() => setShowCoupon(true)}
          onSelectCustomer={() => setShowCustomer(true)}
          onSelectTable={() => setShowTable(true)}
          onCheckout={() => {
            if (!cartItems.length) { toast.error("Cart is empty."); return; }
            setShowPayment(true);
          }}
        />
      </div>

      {/* ── Modals ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCoupon   && <CouponModal   key="coupon"   open onClose={() => setShowCoupon(false)} />}
        {showCustomer && <CustomerModal key="customer" open onClose={() => setShowCustomer(false)} />}
        {showTable    && (
          <TableSelector
            key="table" open
            onClose={() => setShowTable(false)}
            tables={tables}
            selectedId={cartTable.id}
            onSelect={(t) => { dispatch(setTable(t)); setShowTable(false); }}
          />
        )}
        {showPayment  && (
          <PaymentModal
            key="payment" open
            onClose={() => setShowPayment(false)}
            onConfirm={handlePlaceOrder}
            total={totals.total}
            loading={paymentLoading}
          />
        )}
        {showSuccess  && (
          <OrderSuccessModal
            key="success" open
            order={lastOrder}
            onNewOrder={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
