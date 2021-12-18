import { Fzf, FzfResultItem } from 'fzf'

// Тип для результата поиска
export interface Doc {
  url: string
  title: string
}

// Класс-обертка для поиска
export class FuzzySearch {
  // Данные для поиска
  docs: Doc[]

  constructor(docs: Doc[]) {
    // Инициализация данных для поиска
    this.docs = docs
  }

  // Метод для поиска
  // Принимает строку для поиска и объект с настройками:
  // настройкой по умолчанию является
  // ограничение на 10 элементов (см. ниже)
  search(needle: string, { limit = 10 }): FzfResultItem<Doc>[] {
    // Use `let` because we might come up with a new list (aka. shortlist)
    // that makes the haystack search much simpler to send to `Fzf()`.

    // Используем `let`, поскольку список переданных объектов (данных для поиска)
    // в случае, когда строка состоит менее чем из 4 символов,
    // будет сокращен
    let docs = this.docs
    // The list of docs is possible over 10,000 entries (in 2021). If the
    // search input is tiny, don't bother with the overhead of Fzf().
    // Because we don't even need it when the test is so easy in that
    // it just needs to contain a single character.

    // Количество объектов для русской локали по состоянию на 24.10.2021 составляет 2910.
    // Если строка для поиска состоит менее чем из 4 символов
    if (needle.length <= 3) {
      const needleLowerCase = needle.toLowerCase()
      // The reason this works and makes sense is because the `this.docs` is
      // already sorted by popularity.
      // So if someone searches for something short like `x` we just take
      // the top 'limit' docs that have an `x` in the `.url`. This is
      // faster than going through every doc with Fzf.

      // Причина, по которой это работает, состоит в том,
      // что объекты `this.docs` уже отсортированы по популярности.
      // Поэтому если строка для поиска состоит, например, из `x`,
      // мы просто берем 10 первых документов, в которых встречается `x`. Это быстрее, чем исследование каждого документа с помощью `Fzf`.
      // Создаем переменную для сокращенного списка
      const shortlistDocs: Doc[] = []
      // Перебираем данные для поиска
      for (const doc of this.docs) {
        // Если в документе встречается строка для поиска (без учета регистра)
        if (doc.url.toLowerCase().includes(needleLowerCase)) {
          // Помещаем документ в сокращенный список
          shortlistDocs.push(doc)
          // Прекращаем перебор при достижении лимита
          if (shortlistDocs.length === limit) {
            break
          }
        }
      }
      // Suppose the needle was `yx` and the `limit` as 10, then if we only found
      // 9 (which is less than 10) docs that match exactly this, then we might
      // be missing out, so we can't use the shortlist.
      // For example, there might be more docs like `aaYbbbbXccc` which
      // will be found by Fzf() but wouldn't be find in our shortlist because
      // the two characters aren't next to each other.

      // Предположим, что строка имеет значение `yx`, а `limit` - 10,
      // если мы обнаружили только 9 (т.е. менее 10) подходящих документов,
      // то не можем использовать сокращенный список.
      // Предположим, что в документе имеется строка `aaYbbbbXccc`.
      // Такая строка будет обнаружена `Fzf`, но ее не будет в нашем сокращенном списке,
      // поскольку символы `y` и `x` не следуют друг за другом.
      // Используем сокращенный список, только если его
      // длина превышает или равняется лимиту
      if (shortlistDocs.length >= limit) {
        docs = shortlistDocs
      }
    }

    // Создаем экземпляр поиска
    const haystack = new Fzf(docs, {
      // Лимит
      limit,
      // Поле для поиска
      selector: (item: Doc) => item.url
    })
    // All longer strings, default to using the already initialized `Fzf()` instance.
    // Для более длинных строк используется существующий экземпляр поиска
    return haystack.find(needle)
  }
}
