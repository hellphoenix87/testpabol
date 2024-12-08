export const useValueLengthValidation = (value: string | null | undefined, minLimit: number): boolean => {
  const valueLength = value?.length ?? 0;
  return valueLength >= minLimit;
};
