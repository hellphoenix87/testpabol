import SortTypes from "@app/constants/SortTypes";
import ToastTypes from "@app/constants/ToastTypes";

export interface ToastState {
  message: string;
  type: ToastTypes;
}

interface Utils {
  loginOpen: boolean;
  toast: ToastState | null;
  filter: {
    selectedGenre: null | number;
    sortType: SortTypes;
  };
}

export default Utils;
