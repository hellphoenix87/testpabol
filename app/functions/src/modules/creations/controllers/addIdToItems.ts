export const addIdToItems = <T>(list: T[]): Array<T & { id: string }> => {
  return list.map((item, index) => ({ ...item, id: `${index}` }));
};
