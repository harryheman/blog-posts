import { Fzf, FzfResultItem } from 'fzf'

export interface Doc {
  url: string
  title: string
}

export class FuzzySearch {
  docs: Doc[]

  constructor(docs: Doc[]) {
    this.docs = docs
  }

  search(needle: string, { limit = 10 }): FzfResultItem<Doc>[] {
    let docs = this.docs

    if (needle.length <= 3) {
      const needleLowerCase = needle.toLowerCase()
      const shortlistDocs: Doc[] = []
      for (const doc of this.docs) {
        if (doc.url.toLowerCase().includes(needleLowerCase)) {
          shortlistDocs.push(doc)
          if (shortlistDocs.length === limit) {
            break
          }
        }
      }

      if (shortlistDocs.length >= limit) {
        docs = shortlistDocs
      }
    }

    const haystack = new Fzf(docs, {
      limit,
      selector: (item: Doc) => item.url
    })
    return haystack.find(needle)
  }
}
