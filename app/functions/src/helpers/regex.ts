export const isEmail = (email: string) => {
  return !!email && /^\w+([.+-]?\w+)*@[a-zA-Z_]+?[.][a-zA-Z]{2,3}$/.test(email);
};

export const isServiceAccountId = (id: string) => /^\d+$/.test(id);
