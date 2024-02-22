import parser from 'postcss-value-parser'
import { styleq } from 'styleq'

const defaultOptions = {
  dev: false,
  useRemForFontSize: true,
  test: false,
  classNamePrefix: 'x',
  styleResolution: 'application-order',
}

const normalizers = [detectUnclosedFns]

const logicalToPhysical = {
  start: 'left',
  end: 'right',
}

const propertyToLTR = {
  'margin-start': ([_key, val]) => ['margin-left', val],
  // 'margin-inline-start': ([_key, val]) => ['margin-left', val],
  'margin-end': ([_key, val]) => ['margin-right', val],
  // 'margin-inline-end': ([_key, val]) => ['margin-right', val],
  'padding-start': ([_key, val]) => ['padding-left', val],
  // 'padding-inline-start': ([_key, val]) => ['padding-left', val],
  'padding-end': ([_key, val]) => ['padding-right', val],
  // 'padding-inline-end': ([_key, val]) => ['padding-right', val],
  'border-start': ([_key, val]) => ['border-left', val],
  // 'border-inline-start': ([_key, val]) => ['border-left', val],
  'border-end': ([_key, val]) => ['border-right', val],
  // 'border-inline-end': ([_key, val]) => ['border-right', val],
  'border-start-width': ([_key, val]) => ['border-left-width', val],
  // 'border-inline-start-width': ([key, val]) => ['border-left-width', val],
  'border-end-width': ([_key, val]) => ['border-right-width', val],
  // 'border-inline-end-width': ([_key, val]) => ['border-right-width', val],
  'border-start-color': ([_key, val]) => ['border-left-color', val],
  // 'border-inline-start-color': ([_key, val]) => ['border-left-color', val],
  'border-end-color': ([_key, val]) => ['border-right-color', val],
  // 'border-inline-end-color': ([_key, val]) => ['border-right-color', val],
  'border-start-style': ([_key, val]) => ['border-left-style', val],
  // 'border-inline-start-style': ([_key, val]) => ['border-left-style', val],
  'border-end-style': ([_key, val]) => ['border-right-style', val],
  // 'border-inline-end-style': ([_key, val]) => ['border-right-style', val],
  'border-top-start-radius': ([_key, val]) => ['border-top-left-radius', val],
  // 'border-start-start-radius': ([_key, val]) => ['border-top-left-radius', val],
  'border-bottom-start-radius': ([_key, val]) => [
    'border-bottom-left-radius',
    val,
  ],
  // 'border-end-start-radius': ([_key, val]) => ['border-bottom-left-radius', val],
  'border-top-end-radius': ([_key, val]) => ['border-top-right-radius', val],
  // 'border-start-end-radius': ([_key, val]) => ['border-top-right-radius', val],
  'border-bottom-end-radius': ([_key, val]) => [
    'border-bottom-right-radius',
    val,
  ],
  // 'border-end-end-radius': ([key, val]) => ['border-bottom-right-radius', val],
  'text-align': ([key, val]) => [key, logicalToPhysical[val] ?? val],
  float: ([key, val]) => [key, logicalToPhysical[val] ?? val],
  clear: ([key, val]) => [key, logicalToPhysical[val] ?? val],
  start: ([_key, val]) => ['left', val],
  // 'inset-inline-start': ([key, val]) => ['left', val],
  end: ([_key, val]) => ['right', val],
  // 'inset-inline-end': ([key, val]) => ['right', val],
  'background-position': ([key, val]) => [
    key,
    val
      .split(' ')
      .map((word) =>
        word === 'start' ? 'left' : word === 'end' ? 'right' : word,
      )
      .join(' '),
  ],
}

const PRIORITIES = {
  ':is': 40,
  ':where': 40,
  ':not': 40,
  ':has': 45,
  ':dir': 50,
  ':lang': 51,
  ':first-child': 52,
  ':first-of-type': 53,
  ':last-child': 54,
  ':last-of-type': 55,
  ':only-child': 56,
  ':only-of-type': 57,

  ':nth-child': 60,
  ':nth-last-child': 61,
  ':nth-of-type': 62,
  ':nth-last-of-type': 63, // 'nth-last-of-type' is the same priority as 'nth-of-type
  ':empty': 70,

  ':link': 80,
  ':any-link': 81,
  ':local-link': 82,
  ':target-within': 83,
  ':target': 84,
  ':visited': 85,

  ':enabled': 91,
  ':disabled': 92,
  ':required': 93,
  ':optional': 94,
  ':read-only': 95,
  ':read-write': 96,
  ':placeholder-shown': 97,
  ':in-range': 98,
  ':out-of-range': 99,

  ':default': 100,
  ':checked': 101,
  ':indeterminate': 101,
  ':blank': 102,
  ':valid': 103,
  ':invalid': 104,
  ':user-invalid': 105,

  ':autofill': 110,

  ':picture-in-picture': 120,
  ':modal': 121,
  ':fullscreen': 122,
  ':paused': 123,
  ':playing': 124,
  ':current': 125,
  ':past': 126,
  ':future': 127,

  ':hover': 130,
  ':focusWithin': 140,
  ':focus': 150,
  ':focusVisible': 160,
  ':active': 170,
}

const unitlessNumberProperties = new Set([
  'WebkitLineClamp',
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'counterSet',
  'columnCount',
  'flex', // Unsupported
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexOrder',
  'gridRow',
  'gridColumn',
  'fontWeight',
  'hyphenateLimitChars',
  'lineClamp',
  'lineHeight',
  'maskBorderOutset',
  'maskBorderSlice',
  'maskBorderWidth',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'fillOpacity',
  'floodOpacity',
  'rotate',
  'scale',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'scale',

  'mathDepth',
])

const numberPropertySuffixes = {
  animationDelay: 'ms',
  animationDuration: 'ms',
  transitionDelay: 'ms',
  transitionDuration: 'ms',
  voiceDuration: 'ms',
}

const longHandPhysical = new Set()
const longHandLogical = new Set()
const shorthandsOfLonghands = new Set()
const shorthandsOfShorthands = new Set()

const THUMB_VARIANTS = [
  '::-webkit-slider-thumb',
  '::-moz-range-thumb',
  '::-ms-thumb',
]

const stringify = (obj) => JSON.stringify(obj, null, 2)

class NullPreRule {
  compiled() {
    return [null]
  }

  equals(other) {
    return other instanceof NullPreRule
  }
}

class PreRule {
  constructor(property, value, pseudos, atRules) {
    this.property = property
    this.value = value
    this.pseudos = pseudos ? arraySort(pseudos, stringComparator) : []
    this.atRules = atRules ? arraySort(atRules) : []
  }

  compiled(options) {
    const [_key, className, rule] = convertStyleToClassName(
      [this.property, this.value],
      this.pseudos ?? [],
      this.atRules ?? [],
      options,
    )
    return [[className, rule]]
  }

  equals(other) {
    if (!(other instanceof PreRule)) {
      return false
    }

    const valuesEqual =
      Array.isArray(this.value) && Array.isArray(other.value)
        ? arrayEquals(this.value, other.value)
        : this.value === other.value

    return (
      this.property === other.property &&
      valuesEqual &&
      arrayEquals(this.pseudos, other.pseudos) &&
      arrayEquals(this.atRules, other.atRules)
    )
  }
}

class PreRuleSet {
  constructor(rules) {
    this.rules = rules
  }

  static create(rules) {
    const flatRules = rules.flatMap((rule) =>
      rule instanceof PreRuleSet ? rule.rules : [rule],
    )
    if (flatRules.length === 0) {
      return new NullPreRule()
    }
    if (flatRules.length === 1) {
      return flatRules[0]
    }
    return new PreRuleSet(flatRules)
  }

  compiled(options) {
    const styleTuple = this.rules
      .flatMap((rule) => rule.compiled(options))
      .filter(Boolean)
    return styleTuple.length > 0 ? styleTuple : [null]
  }

  equals(other) {
    if (!(other instanceof PreRuleSet)) {
      return false
    }
    if (this.rules.length !== other.rules.length) {
      return false
    }
    return arrayEquals(this.rules, other.rules, (a, b) => a.equals(b))
  }
}

function flattenRawStyleObject(style, options) {
  return _flattenRawStyleObject(style, [], [], options)
}

function objFromEntries(entries) {
  const retVal = {}
  for (const [key, value] of entries) {
    retVal[key] = value
  }
  return retVal
}

function _flattenRawStyleObject(style, pseudos, atRules, options) {
  const flattened = []
  for (const _key in style) {
    const value = style[_key]
    const key = _key.match(/var\(--[a-z0-9]+\)/) ? _key.slice(4, -1) : _key

    // Default styles
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      const pairs = flatMapExpandedShorthands([key, value], options)
      for (const [property, value] of pairs) {
        if (value === null) {
          flattened.push([property, new NullPreRule()])
        } else {
          flattened.push([
            property,
            new PreRule(property, value, pseudos, atRules),
          ])
        }
      }
      continue
    }

    // Fallback Styles
    if (Array.isArray(value)) {
      const equivalentPairs = {}
      for (const eachVal of value) {
        const pairs = flatMapExpandedShorthands([key, eachVal], options)
        for (const [property, val] of pairs) {
          if (Array.isArray(val)) {
            if (equivalentPairs[property] == null) {
              equivalentPairs[property] = [...val]
            } else {
              equivalentPairs[property].push(...val)
            }
          } else if (equivalentPairs[property] == null) {
            equivalentPairs[property] = [val]
          } else {
            equivalentPairs[property].push(val)
          }
        }
      }
      // Deduplicate
      Object.entries(equivalentPairs)
        // Remove Nulls
        .map(([property, values]) => [
          property,
          [...new Set(values.filter(Boolean))],
        ])
        // Deduplicate and default to null when no values are found
        .map(([property, values]) => [
          property,
          values.length === 0 ? null : values.length === 1 ? values[0] : values,
        ])
        // Push to flattened
        .forEach(([property, value]) => {
          if (value === null) {
            flattened.push([property, new NullPreRule()])
          } else {
            flattened.push([
              property,
              new PreRule(property, value, pseudos, atRules),
            ])
          }
        })
      continue
    }

    // Object Values for propetiies. e.g. { color: { hover: 'red', default: 'blue' } }
    if (
      typeof value === 'object' &&
      !key.startsWith(':') &&
      !key.startsWith('@')
    ) {
      const equivalentPairs = {}
      for (const condition in value) {
        const innerValue = value[condition]

        const pseudosToPassDown = [...pseudos]
        const atRulesToPassDown = [...atRules]
        if (condition.startsWith(':')) {
          pseudosToPassDown.push(condition)
        } else if (condition.startsWith('@')) {
          atRulesToPassDown.push(condition)
        }

        const pairs = _flattenRawStyleObject(
          { [key]: innerValue },
          pseudosToPassDown,
          atRulesToPassDown,
          options,
        )
        for (const [property, preRule] of pairs) {
          if (equivalentPairs[property] == null) {
            equivalentPairs[property] = { [condition]: preRule }
          } else {
            equivalentPairs[property][condition] = preRule
          }
        }
      }
      for (const [property, obj] of Object.entries(equivalentPairs)) {
        const sortedKeys = Object.keys(obj) //.sort();
        const rules = []
        for (const condition of sortedKeys) {
          rules.push(obj[condition])
        }
        // If there are many conditions with `null` values, we will collapse them into a single `null` value.
        // `PreRuleSet.create` takes care of that for us.
        flattened.push([property, PreRuleSet.create(rules)])
      }
    }

    // Object Values for pseudos and at-rules. e.g. { ':hover': { color: 'red' } }
    if (
      typeof value === 'object' &&
      (key.startsWith(':') || key.startsWith('@'))
    ) {
      const pseudosToPassDown = [...pseudos]
      const atRulesToPassDown = [...atRules]
      if (key.startsWith(':')) {
        pseudosToPassDown.push(key)
      } else if (key.startsWith('@')) {
        atRulesToPassDown.push(key)
      }
      const pairs = _flattenRawStyleObject(
        value,
        pseudosToPassDown,
        atRulesToPassDown,
        options,
      )
      for (const [property, preRule] of pairs) {
        flattened.push([key + '_' + property, preRule])
      }
    }
  }
  return flattened
}

function flatMapExpandedShorthands(objEntry) {
  const [key, value] = objEntry
  return [[key, value]]
}

function arraySort(arr, fn) {
  return [...arr].sort(fn)
}

function arrayEquals(arr1, arr2, equals = (a, b) => a === b) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (!equals(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
}

function stringComparator(a, b) {
  if (a === 'default') {
    return -1
  }
  if (b === 'default') {
    return 1
  }
  return a.localeCompare(b)
}

function convertStyleToClassName(
  objEntry,
  pseudos,
  atRules,
  options = defaultOptions,
) {
  // console.log(stringify({ objEntry, pseudos, atRules }))

  const { classNamePrefix = 'x' } = options
  const [key, rawValue] = objEntry
  const dashedKey = dashify(key)

  const value = Array.isArray(rawValue)
    ? rawValue.map((eachValue) => transformValue(key, eachValue, options))
    : transformValue(key, rawValue, options)

  const sortedPseudos = arraySort(pseudos ?? [])
  const sortedAtRules = arraySort(atRules ?? [])

  const atRuleHashString = sortedPseudos.join('')
  const pseudoHashString = sortedAtRules.join('')

  const modifierHashString = atRuleHashString + pseudoHashString || 'null'

  const stringToHash = Array.isArray(value)
    ? dashedKey + value.join(', ') + modifierHashString
    : dashedKey + value + modifierHashString
  // console.log(stringify({ dashedKey, value, modifierHashString, stringToHash }))

  // Обратите внимание: `<>` используется для обеспечения стабильности хешей.
  // Это должно быть удалено в будущих версиях.
  const className = classNamePrefix + createHash('<>' + stringToHash)

  const cssRules = generateRule(className, dashedKey, value, pseudos, atRules)

  // console.log(stringify({ key, className, cssRules }))
  return [key, className, cssRules]
}

function dashify(str) {
  return str.replace(/(^|[a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function transformValue(key, rawValue, options) {
  const value =
    typeof rawValue === 'number'
      ? String(Math.round(rawValue * 10000) / 10000) + getNumberSuffix(key)
      : rawValue

  // content is one of the values that needs to wrapped in quotes.
  // Users may write `''` without thinking about it, so we fix that.
  if (
    (key === 'content' ||
      key === 'hyphenateCharacter' ||
      key === 'hyphenate-character') &&
    typeof value === 'string'
  ) {
    const val = value.trim()
    if (val.match(/^attr\([a-zA-Z0-9-]+\)$/)) {
      return val
    }
    if (
      !(
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
    ) {
      return `"${val}"`
    }
  }

  return normalizeValue(value, key, options)
}

function detectUnclosedFns(ast, _) {
  ast.walk((node) => {
    if (node.type === 'function' && node.unclosed) {
      throw new Error('Rule contains an unclosed function')
    }
  })
  return ast
}

function normalizeValue(value, key) {
  if (value == null) {
    return value
  }
  const parsedAST = parser(value)
  const relevantNormalizers = normalizers
  return relevantNormalizers
    .reduce((ast, fn) => fn(ast, key), parsedAST)
    .toString()
}

function murmurhash2_32_gc(str, seed = 0) {
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24)

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)
    k ^= k >>> 24
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)

    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k

    l -= 4
    ++i
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8
    case 1:
      h ^= str.charCodeAt(i) & 0xff
      h =
        (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  }

  h ^= h >>> 13
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  h ^= h >>> 15

  return h >>> 0
}

function createHash(str) {
  return murmurhash2_32_gc(str, 1).toString(36)
}

function generateRule(
  className,
  key, // pre-dashed
  value,
  pseudos,
  atRules,
) {
  const pairs = Array.isArray(value)
    ? value.map((eachValue) => [key, eachValue])
    : [[key, value]]

  const ltrPairs = pairs.map(generateLtr)
  const ltrDecls = ltrPairs.map((pair) => pair.join(':')).join(';')

  const ltrRule = genCSSRule(className, ltrDecls, pseudos, atRules)
  const rtlRule = null

  const priority =
    getPriority(key) +
    pseudos.map(getPriority).reduce((a, b) => a + b, 0) +
    atRules.map(getPriority).reduce((a, b) => a + b, 0)

  return { priority, ltr: ltrRule, rtl: rtlRule }
}

function generateLtr(pair) {
  const [key] = pair
  if (propertyToLTR[key]) {
    return propertyToLTR[key](pair)
  }
  return pair
}

function genCSSRule(className, decls, pseudos, atRules) {
  const pseudo = pseudos.filter((p) => p !== '::thumb').join('')
  let selectorForAtRules =
    `.${className}` + atRules.map(() => `.${className}`).join('') + pseudo

  if (pseudos.includes('::thumb')) {
    selectorForAtRules = THUMB_VARIANTS.map(
      (suffix) => selectorForAtRules + suffix,
    ).join(', ')
  }

  return atRules.reduce(
    (acc, atRule) => `${atRule}{${acc}}`,
    `${selectorForAtRules}{${decls}}`,
  )
}

function getPriority(key) {
  if (key.startsWith('--')) {
    return 1
  }

  if (key.startsWith('@supports')) {
    return 30
  }
  if (key.startsWith('@media')) {
    return 200
  }

  if (key.startsWith('@container')) {
    return 300
  }

  if (key.startsWith('::')) {
    return 5000
  }

  if (key.startsWith(':')) {
    const prop =
      key.startsWith(':') && key.includes('(')
        ? key.slice(0, key.indexOf('('))
        : key

    return PRIORITIES[prop] ?? 40
  }

  if (longHandPhysical.has(key)) {
    return 4000
  }
  if (longHandLogical.has(key)) {
    return 3000
  }
  if (shorthandsOfLonghands.has(key)) {
    return 2000
  }
  if (shorthandsOfShorthands.has(key)) {
    return 1000
  }
  return 3000
}

function getNumberSuffix(key) {
  if (unitlessNumberProperties.has(key)) {
    return ''
  }

  const suffix = numberPropertySuffixes[key]
  if (suffix == null) {
    return 'px'
  } else {
    return suffix
  }
}

// !
function styleXCreateSet(namespaces, options = defaultOptions) {
  const resolvedNamespaces = {}
  const injectedStyles = {}

  for (const namespaceName of Object.keys(namespaces)) {
    const namespace = namespaces[namespaceName]
    // console.log(stringify({ namespace }))

    const flattenedNamespace = flattenRawStyleObject(namespace, options)
    // console.log(stringify({ flattenedNamespace }))

    const compiledNamespaceTuples = flattenedNamespace.map(([key, value]) => {
      return [key, value.compiled(options)]
    })
    // console.log(stringify({ compiledNamespaceTuples }))

    const compiledNamespace = objFromEntries(compiledNamespaceTuples)
    // console.log(stringify({ compiledNamespace }))

    const namespaceObj = {}
    for (const key of Object.keys(compiledNamespace)) {
      const value = compiledNamespace[key]
      const classNameTuples = value
        .map((v) => (Array.isArray(v) ? v : null))
        .filter(Boolean)
      const className =
        classNameTuples.map(([className]) => className).join(' ') || null
      namespaceObj[key] = className
      for (const [className, injectable] of classNameTuples) {
        if (injectedStyles[className] == null) {
          injectedStyles[className] = injectable
        }
      }
    }
    resolvedNamespaces[namespaceName] = { ...namespaceObj, $$css: true }
  }

  return [resolvedNamespaces, injectedStyles]
}

function props(...styles) {
  const [className, style] = styleq(styles)
  const result = {}
  if (className != null && className !== '') {
    result.className = className
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style
  }
  return result
}

const [compiledStyles, injectedStyles] = styleXCreateSet({
  root: {
    display: 'flex',
    // flexDirection: 'column',
  },
})
// console.log(stringify({ compiledStyles, injectedStyles }))

const result = props(compiledStyles.root)
// console.log(stringify({ result }))
const result2 = props(compiledStyles.root, { display: 'flex' })
// console.log(stringify({ result2 }))
