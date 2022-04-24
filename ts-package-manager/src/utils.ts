export type Obj = { [key: string]: any }

export const sortKeys = (obj: Obj) =>
  Object.keys(obj)
    .sort()
    .reduce((_obj: Obj, cur) => {
      _obj[cur] = obj[cur]
      return _obj
    }, Object.create(null))
