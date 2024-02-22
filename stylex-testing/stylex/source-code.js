// packages/stylex/src/stylex.js
// 294 - номер строки кода
export default _stylex

// 239
function _stylex(...styles) {
  const [className] = styleq(styles)
  return className
}
_stylex.props = props
_stylex.create = create

// 36
import { styleq } from 'styleq'

// 136
export const create = stylexCreate

// 76
function stylexCreate(styles) {
  if (__implementations.create != null) {
    const create = __implementations.create
    return create(styles)
  }
  throw new Error(
    'stylex.create should never be called. It should be compiled away.',
  )
}

// 280
const __implementations = {}

// 282
export function __monkey_patch__(key, implementation) {
  __implementations[key] = implementation
}

// ---
// packages/dev-runtime/src/index.js
// 10
import { __monkey_patch__ } from '@stylexjs/stylex'
import { styleSheet } from '@stylexjs/stylex/lib/StyleXSheet';

// 45
export default function inject({
  insert = defaultInsert,
  ...config
}) {
  __monkey_patch__('create', getStyleXCreate({ ...config, insert }));
}

// 24
const defaultInsert = (
  key,
  ltrRule,
  priority,
  rtlRule,
) => {
  if (priority === 0) {
    if (injectedVariableObjs.has(key)) {
      throw new Error('A VarGroup with this name already exists: ' + key);
    } else {
      injectedVariableObjs.add(key);
    }
  }
  styleSheet.insert(ltrRule, priority, rtlRule);
};

// 22
const injectedVariableObjs = new Set();

// 20
import getStyleXCreate from './stylex-create';

// ---
// packages/stylex/src/StyleXSheet.js
// 364
export const styleSheet = new StyleXSheet({
  supportsVariables: true,
  rootTheme: {},
  rootDarkTheme: {},
});

// 85
export class StyleXSheet {
  static LIGHT_MODE_CLASS_NAME = LIGHT_MODE_CLASS_NAME;
  static DARK_MODE_CLASS_NAME = DARK_MODE_CLASS_NAME;

  constructor(opts) {
    this.tag = null;
    this.injected = false;
    this.ruleForPriority = new Map();
    this.rules = [];

    this.rootTheme = opts.rootTheme;
    this.rootDarkTheme = opts.rootDarkTheme;
  }

  // Цветовые схемы
  rootTheme;
  rootDarkTheme;

  // Массив, содержащий все добавленные правила. Используется для
  // отслеживания индексов правил в таблице стилей
  rules;

  // Индикатор добавления тега `style` в `document`
  injected;

  // Элемент `style` для добавления правил
  tag;

  // Для поддержки приоритетов необходимо хранить правило,
  // которое находится в начале приоритета
  ruleForPriority;

  /**
   * Извлекает тег `style`
   */
  getTag() {
    const { tag } = this;
    invariant(tag != null, 'expected tag');
    return tag;
  }

  /**
   * Добавляет тег `style` в `head`
   */
  inject() {
    if (this.injected) {
      return;
    }

    this.injected = true;

    // Создаем тег `style`
    this.tag = makeStyleTag();
    this.injectTheme();
  }

  /**
   * Вставляет стили темы - переменные/токены
   */
  injectTheme() {
    if (this.rootTheme != null) {
      this.insert(
        buildTheme(`:root, .${LIGHT_MODE_CLASS_NAME}`, this.rootTheme),
        0,
      );
    }
    if (this.rootDarkTheme != null) {
      this.insert(
        buildTheme(
          `.${DARK_MODE_CLASS_NAME}:root, .${DARK_MODE_CLASS_NAME}`,
          this.rootDarkTheme,
        ),
        0,
      );
    }
  }

  /**
   * Добавляет правила в таблицу стилей
   */
  insert(rawLTRRule, priority) {
    // Добавляем таблицу стилей при отсутствии
    if (this.injected === false) {
      this.inject();
    }

    const rawRule = rawLTRRule;

    // Не добавляем правило при наличии (исключаем дубликаты)
    if (this.rules.includes(rawRule)) {
      return;
    }

    // Нормализованное правило с определенной специфичностью
    // Нормализация нас не интересует
    const rule = this.normalizeRule(
      addSpecificityLevel(rawRule, Math.floor(priority / 1000)),
    );

    // Получаем позицию для вставки правила по его приоритету
    // Вычисление позиции по приоритету нас не интересует
    const insertPos = this.getInsertPositionForPriority(priority);
    this.rules.splice(insertPos, 0, rule);

    // Устанавливаем правило как конец группы приоритета
    this.ruleForPriority.set(priority, rule);

    const tag = this.getTag();
    const sheet = tag.sheet;

    if (sheet != null) {
      try {
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
        sheet.insertRule(rule, Math.min(insertPos, sheet.cssRules.length));
      } catch (err) {
        console.error('insertRule error', err, rule, insertPos);
      }
    }
  }
}

// 344
/**
 * Функция добавления `:not(#\#)` для повышения специфичности; полифилл для @layer
 */
function addSpecificityLevel(selector, index) {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  // Чем больше `not(#\\#)`, тем выше специфичность
  const pseudo = Array.from({ length: index })
    .map(() => ':not(#\\#)')
    .join('');

  const lastOpenCurly = selector.includes('::')
    ? selector.indexOf('::')
    : selector.lastIndexOf('{');
  const beforeCurly = selector.slice(0, lastOpenCurly);
  const afterCurly = selector.slice(lastOpenCurly);

  return `${beforeCurly}${pseudo}${afterCurly}`;
}

// 45
/**
 * Создает тег `style` и добавляет его в `head`
 */
function makeStyleTag() {
  const tag = document.createElement('style');
  tag.setAttribute('type', 'text/css');
  tag.setAttribute('data-stylex', 'true');

  const head = document.head || document.getElementsByTagName('head')[0];
  invariant(head, 'expected head');
  head.appendChild(tag);

  return tag;
}

// 28
/**
 * Принимает тему и генерирует соответствующие переменные CSS
 */
function buildTheme(selector, theme) {
  const lines = [];
  lines.push(`${selector} {`);

  for (const key in theme) {
    const value = theme[key];
    lines.push(`  --${key}: ${value};`);
  }

  lines.push('}');

  return lines.join('\n');
}

// ---
// packages/dev-runtime/src/stylex-create.js
// 177
export default function getStyleXCreate(
  config,
) {
  const stylexCreate = (
    styles,
  ) => {
    return createWithFns(styles, config);
  };

  return stylexCreate;
}

// 106
// Значением поля объекта стилей может быть функция,
// мы не будем рассматривать такой вариант
function createWithFns(
  styles,
  { insert, ...config },
) {
  const stylesWithoutFns = {};
  for (const key in styles) {
    const value = styles[key];
    stylesWithoutFns[key] = value;
  }
  // Одна из самых важных строк
  const [compiledStyles, injectedStyles] = create(stylesWithoutFns, config);
  // Добавляем хеш-классы и стили в таблицу стилей
  for (const key in injectedStyles) {
    const { ltr, priority, rtl } = injectedStyles[key];
    insert(key, ltr, priority, rtl);
  }

  const temp = compiledStyles;

  const finalStyles = { ...temp };

  return finalStyles;
}

// 16
import { create, IncludedStyles, utils } from '@stylexjs/shared';

// ---
// packages/stylex/src/stylex.js
// 47
export function props(
  this,
  ...styles
) {
  const options = this;
  if (__implementations.props) {
    return __implementations.props.call(options, styles);
  }
  const [className, style] = styleq(styles);
  const result = {};
  if (className != null && className !== '') {
    result.className = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style;
  }
  return result;
}

// ---
// packages/shared/src/index.js
// 43
export const create = styleXCreateSet;

// 23
import styleXCreateSet from './stylex-create';

// packages/shared/src/stylex-create.js
// 24
// Эта функция принимает объект со стилями, передаваемый в метод `stylex.create` и преобразует его.
// Преобразование заключается в замене значений стилей на названия CSS-классов.
//
// Функция также собирает все внедряемые (injected) стили.
// Возвращает кортеж с преобразованным объектом стилей и объектом внедряемых стилей.
//
// Перед возвратом выполняется проверка отсутствия дубликатов во внедряемых стилях.
export default function styleXCreateSet(
  namespaces,
  options = defaultOptions,
) {
  const resolvedNamespaces = {};
  const injectedStyles = {};

  for (const namespaceName of Object.keys(namespaces)) {
    const namespace = namespaces[namespaceName];

    const flattenedNamespace = flattenRawStyleObject(namespace, options);
    const compiledNamespaceTuples = flattenedNamespace.map(([key, value]) => {
      return [key, value.compiled(options)];
    });

    const compiledNamespace = objFromEntries(compiledNamespaceTuples);

    const namespaceObj = {};
    for (const key of Object.keys(compiledNamespace)) {
      const value = compiledNamespace[key];
      if (value instanceof IncludedStyles) {
        namespaceObj[key] = value;
      } else {
        const classNameTuples =
          value.map((v) => (Array.isArray(v) ? v : null)).filter(Boolean);
        const className =
          classNameTuples.map(([className]) => className).join(' ') || null;
        namespaceObj[key] = className;
        for (const [className, injectable] of classNameTuples) {
          if (injectedStyles[className] == null) {
            injectedStyles[className] = injectable;
          }
        }
      }
    }
    // `$$css: true` требуется для `styleq`
    resolvedNamespaces[namespaceName] = { ...namespaceObj, $$css: true };
  }

  return [resolvedNamespaces, injectedStyles];
}
