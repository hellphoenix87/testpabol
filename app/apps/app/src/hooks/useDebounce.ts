import { debounce } from "lodash";
import { useRef } from "react";

export const useDebounce = <T extends (...args: any) => any>(fn: T, wait = 700) => {
  return useRef(debounce<T>(fn, wait, { leading: false, trailing: true })).current;
};
