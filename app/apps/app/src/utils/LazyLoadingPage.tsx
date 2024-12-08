import { ComponentType, lazy as _lazy } from "react";

const dynamicImportErrorHandler = (): { default: ComponentType } => {
  window.location.reload();
  return {
    default: () => null,
  };
};

// overriding lazy function with a catch handler
export const lazy = function (factory) {
  return _lazy(() => factory().catch(dynamicImportErrorHandler));
} as typeof _lazy;
