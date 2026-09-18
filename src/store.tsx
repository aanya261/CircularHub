import React, { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "./types";

type Store = {
  saved: number[];
  toggleSaved: (id: number) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  toast: string;
  notify: (message: string) => void;
  closeToast: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ch_saved") || "[]");
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState("");

  const toggleSaved = (id: number) => {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      localStorage.setItem("ch_saved", JSON.stringify(next));
      return next;
    });
  };

  const addProduct = (product: Product) => {
    setProducts((current) => [product, ...current]);
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const value = useMemo(
    () => ({
      saved,
      toggleSaved,
      products,
      addProduct,
      toast,
      notify,
      closeToast: () => setToast(""),
    }),
    [saved, products, toast]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-dot" /> {toast}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
};
