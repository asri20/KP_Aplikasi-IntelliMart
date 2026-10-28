import { create } from "zustand";
import { mockStores } from "../services/mock/mockData";
import { fakeApi } from "../services/mock/fakeApi";

export const useStoreStore = create((set) => ({
  stores: [],
  activeStore: null,
  isLoadingStores: false,

  loadStores: async () => {
    set({ isLoadingStores: true });
    const stores = await fakeApi(mockStores, 400);
    const saved = localStorage.getItem("im_activeStore");
    const activeStore = saved
      ? stores.find((s) => s.id === JSON.parse(saved).id) || stores[0]
      : null;
    set({ stores, activeStore, isLoadingStores: false });
  },

  setActiveStore: async (store) => {
    localStorage.setItem("im_activeStore", JSON.stringify(store));
    await fakeApi(null, 200);
    set({ activeStore: store });
  },

  clearStore: () => {
    localStorage.removeItem("im_activeStore");
    set({ activeStore: null, stores: [] });
  },
}));