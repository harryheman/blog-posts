const storageLocal = {
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string) {
    return localStorage.getItem(key)
      ? (JSON.parse(localStorage.getItem(key) as string) as T)
      : null;
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export default storageLocal;
