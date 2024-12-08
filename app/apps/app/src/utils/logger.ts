export const logger = {
  log: (message?: any, ...optionalParams: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(message, ...optionalParams);
    }
  },
  error: (message?: any, ...optionalParams: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(message, ...optionalParams);
    }
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(message, ...optionalParams);
    }
  },
  dir: (obj: any, options?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.dir(obj, options);
    }
  },
  info: (message?: any, ...optionalParams: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.info(message, ...optionalParams);
    }
  },
};
