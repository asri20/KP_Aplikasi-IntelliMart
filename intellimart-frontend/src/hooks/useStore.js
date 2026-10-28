import { useStoreStore } from "../store/storeStore";

export const useStore = () => {
  const { stores, activeStore, isLoadingStores, loadStores, setActiveStore, clearStore } =
    useStoreStore();
  return { stores, activeStore, isLoadingStores, loadStores, setActiveStore, clearStore };
};