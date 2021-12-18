import React, { useEffect, useMemo, useRef, useState } from 'react'
// Хуки для маршрутизации на стороне клиента -
// здесь не используются
// import { Link, useHistory } from 'react-router-dom'

// Хук для формирования выпадающего списка,
// соответствующего всем критериям доступности
import { useCombobox } from 'downshift'
// Полнотекстовый поиск по `title`
import FlexSearch from 'flexsearch'
// Хук для выполнения HTTP-запросов
import useSWR from 'swr'

// Тип и класс для "неточного" поиска по `url`
import { Doc, FuzzySearch } from './fuzzy-search'

// Хук для определения текущей локали -
// здесь не используется
// import { useLocale } from './hooks'

// Утилиты для получения плейсхолдера и
// установки фокуса на инпут при нажатии `/`,
// а также тип для пропов для поиска
import { getPlaceholder, SearchProps, useFocusOnSlash } from './search-utils'

const SHOW_INDEXING_AFTER_MS = 500

// Типы
// Для объекта данных
type Item = {
  url: string
  title: string
}
// Для поискового индекса
type SearchIndex = {
  flex: any
  fuzzy: FuzzySearch
  items: null | Item[]
}
// Для объекта результатов поиска
type ResultItem = {
  title: string
  url: string
  positions: Set<number>
}

// Хук для работы с поисковым индексом
function useSearchIndex(): readonly [
  null | SearchIndex,
  null | Error,
  () => void
] {
  // Состояние инициализации
  const [shouldInitialize, setShouldInitialize] = useState(false)
  // Состояние индекса
  const [searchIndex, setSearchIndex] = useState<null | SearchIndex>(null)
  // const locale = useLocale()

  // Default to 'en-US' if you're on the home page without the locale prefix.
  // По умолчанию локаль имеет значение 'en-US',
  // если мы находимся на главной странице без префикса локали

  // const url = `${locale}/search-index.json`
  // Поиск файла выполняется в директории `public`
  const url = `/search-index.json`

  // Если состояние инициализации имеет значение `true`,
  // вызываем хук `useSWR`:
  // первый аргумент - `url`, он же ключ для кеша,
  // второй - так называемый `fetcher`, функция
  // для запроса-получения данных,
  // третий - настройки (в данном случае мы отключаем
  // выполнение повторного запроса при установке фокуса).
  // Такая сигнатура означает, что хук ожидает инициализации
  // https://swr.vercel.app/docs/conditional-fetching
  const { error, data } = useSWR<null | Item[], Error | undefined>(
    shouldInitialize ? url : null,
    async (url: string) => {
      // Получаем ответ
      const response = await fetch(url)
      if (!response.ok) {
        // Если возникла ошибка, выбрасываем исключение
        // с сообщением в виде текста
        throw new Error(await response.text())
      }
      // Возвращаем ответ в формате `JSON`
      return await response.json()
    },
    // Отключаем повторную валидацию
    { revalidateOnFocus: false }
  )

  // Количество объектов для русской локали
  // console.log(data?.length) // 2910

  // Выполняем побочный эффект
  useEffect(() => {
    // Ничего не делаем при отсутствии данных
    // или наличии поискового индекса
    if (!data || searchIndex) {
      return
    }

    // Создаем поисковый индекс
    // `tokenize` - это режим индексации (в данном случае
    // используется инкрементальная индексация в прямом направлении, т.е. вперед)
    // https://github.com/nextapps-de/flexsearch#tokenizer-prefix-search
    const flex = new FlexSearch.Index({ tokenize: 'forward' })

    // Данными является массив объектов с заголовками и адресами статей -
    // `{ title: 'Заголовок', url: 'https://...' }`
    // Перебираем объекты и помещаем заголовок и его индекс (в массиве) в поисковый индекс
    data!.forEach(({ title }, i) => {
      flex.add(i, title)
    })

    // Создаем экземпляр неточного поиска
    const fuzzy = new FuzzySearch(data as Doc[])

    // Обновляем состояние поискового индекса
    setSearchIndex({ flex, fuzzy, items: data! })
  }, [searchIndex, shouldInitialize, data])

  // Хук возвращает мемоизированный массив из 3 элементов:
  // поискового индекса, ошибки (которая может иметь значение `null`)
  // и функции для обновления состояния инициализации
  return useMemo(
    () => [searchIndex, error || null, () => setShouldInitialize(true)],
    [searchIndex, error, setShouldInitialize]
  )
}

// The fuzzy search is engaged if the search term starts with a '/'
// and does not have any spaces in it.
// Неточный поиск используется в случае, когда строка для поиска
// начинается с `/` и не содержит пробелов.
// Данная утилита определяет, должен ли использоваться такой поиск
function isFuzzySearchString(str: string) {
  return str.startsWith('/') && !/\s/.test(str)
}

// Утилита для подсветки совпадения
// при выполнении полнотекстового поиска
// `title` - это подходящий (совпавший) заголовок
// `q` - совпадение
function HighlightMatch({ title, q }: { title: string; q: string }) {
  // FlexSearch doesn't support finding out which "typo corrections"
  // were done unfortunately.
  // See https://github.com/nextapps-de/flexsearch/issues/99
  // `FlexSearch`, к сожалению, не умеет исправлять опечатки

  // Split on higlight term and include term into parts, ignore case.
  // Разделяем совпадение на части без учета регистра
  const words = q.trim().toLowerCase().split(/[ ,]+/)

  // $& means the whole matched string
  // `$&` означает совпавшую строку целиком
  const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = `\\b(${regexWords.join('|')})`
  // Разделяем заголовок на части по совпадению
  const parts = title.split(new RegExp(regex, 'gi'))

  return (
    <b>
      {/* Перебираем части */}
      {parts.map((part, i) => {
        const key = `${part}:${i}`
        // Если часть является совпадением
        if (words.includes(part.toLowerCase())) {
          // Подсвечиваем ее
          return <mark key={key}>{part}</mark>
        } else {
          return <span key={key}>{part}</span>
        }
      })}
    </b>
  )
  // Если ввести в поиске `query`, то данная утилита вернет такую разметку
  /*
    <b>
      <span>Document.</span>
      // совпадение
      <mark>query</mark>
      <span>Selector()</span>
    </b>
  */
}

// Утилита для генерации "хлебных крошек" для адреса статьи
// и подсветки совпадения
function BreadcrumbURI({
  uri,
  positions
}: {
  uri: string
  positions?: Set<number>
}) {
  // Если имеется совпадение
  // `positions` - набор индексов совпавших символов
  if (positions && positions.size) {
    // Разбиваем строку на массив символов
    const chars = uri.split('')

    return (
      <small>
        {chars.map((char, i) => {
          // Если символ имеется в совпадении
          if (positions.has(i)) {
            return <mark key={i}>{char}</mark>
          } else {
            return <span key={i}>{char}</span>
          }
        })}
      </small>
    )
  }

  // Форматирование `url`
  // В оригинальном файле `search-index.json`
  // адреса статей начинаются с `/`, который удаляется.
  // Также удаляется `docs`
  const keep = uri
    .split('/')
    // .slice(1)
    .slice(3)
    .filter((p) => p !== 'docs')
  // При объединении элементы массива разделяются ' / '
  return <small className='search-item-uri'>{keep.join(' / ')}</small>
  // Было, например: `https://developer.mozilla.org/ru/docs/Web`,
  // стало: `ru / Web`
}

// Тип для поискового виджета
type InnerSearchNavigateWidgetProps = SearchProps & {
  onResultPicked?: () => void
  defaultSelection: [number, number]
}

// Хук для определения изменения значения инпута
function useHasNotChangedFor(value: string, ms: number) {
  // Состояние для изменений
  const [hasNotChanged, setHasNotChanged] = useState(false)
  // Предыдущее значение
  const previousValue = useRef(value)

  // Побочный эффект для определения наличия изменений
  useEffect(() => {
    // Если предыдущее значение равняется текущему,
    // ничего не делаем
    if (previousValue.current === value) {
      return
    }
    // Обновляем предыдущее значение текущим
    previousValue.current = value
    setHasNotChanged(false)
    // while timeouts are not accurate for counting time there error is only
    // upwards, meaning they might trigger after more time than specified,
    // which is fine in this case
    // Здесь речь идет о том, что таймеры не являются
    // хорошим средством для точного измерения времени,
    // поскольку могут срабатывать по истечении времени,
    // больше указанного, но в данном случае такой подход является приемлемым
    const timeout = setTimeout(() => {
      // Если значение инпута в течение указанного времени не изменилось,
      // значит, изменений не было :)
      setHasNotChanged(true)
    }, ms)
    // Очистка побочного эффекта во избежание утечек памяти
    return () => {
      clearTimeout(timeout)
    }
    // Хук запускается повторно при изменении значения инпута или задержки
  }, [value, ms])

  // Возвращаем состояние
  return hasNotChanged
}

// Виджет для поиска
function InnerSearchNavigateWidget(props: InnerSearchNavigateWidgetProps) {
  // Пропы:
  // значение инпута
  // функция для обработки изменения этого значения
  // индикатор того, находится ли инпут в фокусе
  // функция для обработки изменения состояния фокуса
  // функция для сохранения результатов поиска
  // выделение по умолчанию
  const {
    inputValue,
    onChangeInputValue,
    isFocused,
    onChangeIsFocused,
    onResultPicked,
    defaultSelection
  } = props

  // Объект истории браузера и текущая локаль -
  // здесь не используются
  // const history = useHistory()
  // const locale = useLocale()

  // Получаем поисковый индекс, ошибку и функцию для запуска инициализации поискового индекса
  const [searchIndex, searchIndexError, initializeSearchIndex] =
    useSearchIndex()

  // Ссылка на ипнут
  const inputRef = useRef<null | HTMLInputElement>(null)
  // Ссылка на форму
  const formRef = useRef<null | HTMLFormElement>(null)
  // Переменная для выделения
  const isSelectionInitialized = useRef(false)

  // Отображение результатов зависит от состояния изменений
  const showIndexing = useHasNotChangedFor(inputValue, SHOW_INDEXING_AFTER_MS)

  // Побочный эффект для инициализации выделения
  useEffect(() => {
    // Если отсутствует инпут или выделение не инициализировано, ничего не делаем
    if (!inputRef.current || isSelectionInitialized.current) {
      return
    }

    // Если инпут находится в фокусе
    if (isFocused) {
      // Выделение по умолчанию имеет значение `[0, 0]`
      inputRef.current.selectionStart = defaultSelection[0]
      inputRef.current.selectionEnd = defaultSelection[1]
    }
    // Инициализируем выделение
    isSelectionInitialized.current = true
  }, [isFocused, defaultSelection])

  // Мемоизированные результаты поиска
  const resultItems: ResultItem[] = useMemo(() => {
    // Если отсутствует поисковый индекс или инпут, или при инициализации индекса возникла ошибка,
    // ничего не делаем
    if (!searchIndex || !inputValue || searchIndexError) {
      // This can happen if the initialized hasn't completed yet or
      // completed un-successfully.
      // Это может произойти, если инициализация еще не завершилась
      // или завершилась неудачно
      return []
    }

    // The iPhone X series is 812px high.
    // If the window isn't very high, show fewer matches so that the
    // overlaying search results don't trigger a scroll.
    // Данное ограничение позволяет избежать появления
    // полосы прокрутки на экранах с маленькой высотой
    const limit = window.innerHeight < 850 ? 5 : 10

    // Если строка начинается с `/` и не содержит пробелов,
    // выполняется неточный поиск
    if (isFuzzySearchString(inputValue)) {
      // Если значением инпута является `/`
      if (inputValue === '/') {
        // Возвращаем пустой массив
        return []
      } else {
        // Выполняем поиск,
        // удаляя начальный `/`
        const fuzzyResults = searchIndex.fuzzy.search(inputValue.slice(1), {
          // Возвращается 5 или 10 лучших результатов
          limit
        })
        // Возвращаем массив объектов
        return fuzzyResults.map((fuzzyResult) => ({
          // Адрес статьи
          url: fuzzyResult.item.url,
          // Заголовок статьи
          title: fuzzyResult.item.title,
          // Набор индексов совпавших символов
          positions: fuzzyResult.positions
        }))
      }
    } else {
      // Full-Text search
      // Выполняем полнотекстовый поиск
      const indexResults: number[] = searchIndex.flex.search(inputValue, {
        // Ограничение
        limit,
        // Предположения
        suggest: true // This can give terrible result suggestions
        // Это может приводить к ужасным результатам :)
      })
      // Возвращаем массив оригинальных объектов
      return indexResults.map(
        (index: number) => (searchIndex.items || [])[index] as ResultItem
      )
    }
    // Результаты вычисляются повторно при изменении
    // значения инпута, поискового индекса или возникновении ошибки
  }, [inputValue, searchIndex, searchIndexError])

  // Базовый адрес для выполнения HTTP-запроса
  // const formAction = `/${locale}/search`
  const formAction = `https://developer.mozilla.org/ru-RU/search`
  // Формируем полный путь для поиска
  const searchPath = useMemo(() => {
    // Новая строка запроса
    const sp = new URLSearchParams()
    // Получается `?q=inputValue`
    sp.set('q', inputValue.trim())
    // Возвращаем полный путь
    // Если ввести в инпуте `qwerty`,
    // вернется `https://developer.mozilla.org/ru/search?q=qwerty`
    return `${formAction}?${sp.toString()}`
  }, [formAction, inputValue])

  // Пустой результат - когда ничего не найдено
  const nothingFoundItem = useMemo(
    () => ({ url: searchPath, title: '', positions: new Set() }),
    [searchPath]
  )

  // Формируем выпадающий список, отвечающий всем критериям доступности
  const {
    getInputProps,
    getItemProps,
    getMenuProps,
    getComboboxProps,

    // Индекс элемента, на которого наведен курсор или который находится в фокусе
    highlightedIndex,
    // Индикатор того, находится ли меню в открытом состоянии
    isOpen,

    reset,
    toggleMenu
  } = useCombobox({
    // Результаты поиска или пустой результат в виде массива из одного элемента
    items: resultItems.length === 0 ? [nothingFoundItem] : resultItems,
    // Значение инпута
    inputValue,
    // Список по умолчанию будет находится в открытом состоянии
    // только при фокусировке на инпуте
    defaultIsOpen: isFocused,
    // При клике по выделенному (highlightedIndex) результату
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        // history.push(selectedItem.url)
        // Открывается новое окно с соответствующей статьей на MDN
        window.open(selectedItem.url, '_blank')
        // Значение инпута обнуляется
        onChangeInputValue('')
        // Выполняется сброс меню
        reset()
        // Меню скрывается
        toggleMenu()
        // Расфокусировка
        inputRef.current?.blur()
        // Если передана функция для сохранения результатов,
        // вызываем ее
        if (onResultPicked) {
          onResultPicked()
        }
        // Плавная прокрутка в верхнюю часть области просмотра
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
    }
  })

  // При нажатии `/` на инпут устанавливается фокус
  useFocusOnSlash(inputRef)

  // Побочный эффект для инициализации поискового индекса
  useEffect(() => {
    // Если инпут находится в фокусе
    if (isFocused) {
      // Выполняем инициализацию
      initializeSearchIndex()
    }
  }, [initializeSearchIndex, isFocused])

  // Результаты поиска - рендеринг
  // значением переменной является `IIFE` - автоматически вызываемое функциональное выражение
  const searchResults = (() => {
    // Если меню закрыто, т.е. инпут не находится в фокусе,
    // или значение инпута является пустая строка (без учета пробелов),
    // ничего не делаем
    if (!isOpen || !inputValue.trim()) {
      return null
    }

    // Если при инициализации поискового индекса возникла ошибка
    if (searchIndexError) {
      return (
        // <div className='searchindex-error'>Error initializing search index</div>
        <div className='searchindex-error'>
          При инициализации поискового индекса возникла ошибка
        </div>
      )
    }

    // Если инициализация индекса еще не завершилась
    if (!searchIndex) {
      // и не было изменений значения инпута на протяжении 500 мс
      return showIndexing ? (
        <div className='indexing-warning'>
          {/* <em>Initializing index</em> */}
          <em>Инициализация индекса</em>
        </div>
      ) : null
    }

    return (
      <>
        {/* Если отсутствуют результаты поиска и значением инпута не является `/` */}
        {resultItems.length === 0 && inputValue !== '/' ? (
          <div
            {...getItemProps({
              className:
                'nothing-found result-item ' +
                (highlightedIndex === 0 ? 'highlight' : ''),
              // Возвращаем пустой результат
              item: nothingFoundItem,
              index: 0
            })}
          >
            {/* No document titles found. */}
            Подходящих статей не найдено.
            <br />
            {/* <Link to={searchPath}>
              Site search for <code>{inputValue}</code>
            </Link> */}
            {/* Используется полный адрес статьи, сформированный ранее */}
            <a href={searchPath} target='_blank' rel='noopener noreferrer'>
              Искать на сайте MDN <code>{inputValue}</code>
            </a>
          </div>
        ) : (
          // Перебираем результаты поиска
          resultItems.map((item, i) => (
            <div
              {...getItemProps({
                key: item.url,
                className:
                  'result-item ' + (i === highlightedIndex ? 'highlight' : ''),
                item,
                index: i
              })}
            >
              {/* Выполняем подсветку совпадения */}
              <HighlightMatch title={item.title} q={inputValue} />
              <br />
              {/* Формируем хлебные крошки для адреса статьи */}
              <BreadcrumbURI uri={item.url} positions={item.positions} />
            </div>
          ))
        )}
        {/* Если выполняется неточный поиск */}
        {isFuzzySearchString(inputValue) && (
          // <div className='fuzzy-engaged'>Fuzzy searching by URI</div>
          <div className='fuzzy-engaged'>Выполняется поиск по URI</div>
        )}
      </>
    )
  })()

  // Рендеринг
  return (
    <form
      action={formAction}
      {...getComboboxProps({
        // Ссылка на форму
        ref: formRef as any, // downshift's types hardcode it as a div
        // для `downshift` все есть `div` с точки зрения типов :)
        className: 'search-form',
        id: 'nav-main-search',
        role: 'search',
        // Обработчик отправки формы
        onSubmit: (e) => {
          // This comes into effect if the input is completely empty and the
          // user hits Enter, which triggers the native form submission.
          // When something *is* entered, the onKeyDown event is triggered
          // on the <input> and within that handler you can
          // access `event.key === 'Enter'` as a signal to submit the form.

          // Здесь речь идет о том, что если инпут является пустым и
          // пользователь нажимает `Enter`, выполняется нативная отправка формы.
          // Если же инпут не является пустым, отправку формы можно перехватить
          // с помощью`event.key === 'Enter'` в обработчике
          // события нажатия клавиши `onKeyDown`.
          // Отключаем дефолтную обработку отправки формы
          e.preventDefault()
          // Это сломало кнопку для отправки формы в виде лупы (см. ниже)
        }
      })}
    >
      <div className='search-field'>
        <label htmlFor='main-q' className='visually-hidden'>
          {/* Search MDN */}
          Поиск MDN
        </label>

        <input
          {...getInputProps({
            type: 'search',
            className: isOpen
              ? 'has-search-results search-input-field'
              : 'search-input-field',
            id: 'main-q',
            name: 'q',
            // Формируем плейсхолдер с помощью утилиты
            placeholder: getPlaceholder(isFocused),
            // При наведении курсора на инпут
            // запускается инициализация поискового индекса
            onMouseOver: initializeSearchIndex,
            // Метод для обновления состояния фокуса
            onFocus: () => {
              onChangeIsFocused(true)
            },
            // и здесь
            onBlur: () => onChangeIsFocused(false),
            // Обработчик нажатия клавиш
            onKeyDown(event) {
              // Если нажата клавиша `Escape` и имеется инпут
              if (event.key === 'Escape' && inputRef.current) {
                // Меню скрывается, инпут очищается
                toggleMenu()
              } else if (
                // Если нажата клавиша `Enter`, инпут не является пустым и отсутствует выделенный результат поиска
                event.key === 'Enter' &&
                inputValue.trim() &&
                highlightedIndex === -1
              ) {
                // Убираем фокус с инпута
                inputRef.current!.blur()
                // Отправляем форму
                // formRef.current!.submit()
                // Переходим на страницу поиска MDN
                window.open(searchPath, '_blank')
              }
            },
            // обработчик изменения значения инпута
            onChange(event) {
              if (event.target instanceof HTMLInputElement) {
                onChangeInputValue(event.target.value)
              }
            },
            // Ссылка на инпут
            ref: (input) => {
              inputRef.current = input
            }
          })}
        />

        {/* Кнопка для отправки формы, которая не работала */}
        {/* создал пулреквест :) */}
        <input
          type='submit'
          className='search-button'
          value=''
          aria-label='Поиск'
          onClick={() => {
            if (inputValue.trim() && inputValue !== '/') {
              // history.push(searchPath)
              window.open(searchPath, '_blank')
            }
          }}
        />
      </div>

      {/* Выпадающий список с результатами */}
      <div {...getMenuProps()}>
        {searchResults && <div className='search-results'>{searchResults}</div>}
      </div>
    </form>
  )
}

// Предохранитель - обработчик ошибок
class SearchErrorBoundary extends React.Component {
  // Состояние ошибки
  state = { hasError: false }

  // Регистрация ошибки
  static getDerivedStateFromError(error: Error) {
    // console.error('There was an error while trying to render search', error)
    console.error('В процессе рендеринга поиска возникла ошибка', error)
    // Обновляем состояние ошибки
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? (
      // <div>Error while rendering search. Check console for details.</div>
      <div>
        В процессе рендеринга поиска возникла ошибка. Загляните в консоль за
        подробностями.
      </div>
    ) : (
      this.props.children
    )
  }
}

// Экспорт виджета для поиска, обернутого в предохранитель
export default function SearchNavigateWidget(
  props: InnerSearchNavigateWidgetProps
) {
  return (
    <SearchErrorBoundary>
      <InnerSearchNavigateWidget {...props} />
    </SearchErrorBoundary>
  )
}
