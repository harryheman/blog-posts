var htmx = {
  config: {
    historyEnabled: true,
    historyCacheSize: 10,
    refreshOnHistoryMiss: false,
    defaultSwapStyle: 'innerHTML',
    defaultSwapDelay: 0,
    defaultSettleDelay: 20,
    includeIndicatorStyles: true,
    indicatorClass: 'htmx-indicator',
    requestClass: 'htmx-request',
    addedClass: 'htmx-added',
    settlingClass: 'htmx-settling',
    swappingClass: 'htmx-swapping',
    allowEval: true,
    allowScriptTags: true,
    inlineScriptNonce: '',
    attributesToSettle: ['class', 'style', 'width', 'height'],
    withCredentials: false,
    timeout: 0,
    wsReconnectDelay: 'full-jitter',
    wsBinaryType: 'blob',
    disableSelector: '[hx-disable], [data-hx-disable]',
    useTemplateFragments: false,
    scrollBehavior: 'smooth',
    defaultFocusScroll: false,
    getCacheBusterParam: false,
    globalViewTransitions: false,
    methodsThatUseUrlParams: ['get'],
    selfRequestsOnly: false,
    ignoreTitle: false,
    scrollIntoViewOnBoost: true,
    triggerSpecsCache: null,
  },
}

function getDocument() {
  return document
}

var isReady = false
getDocument().addEventListener('DOMContentLoaded', function () {
  isReady = true
})

function ready(fn) {
  if (isReady || getDocument().readyState === 'complete') {
    fn()
  } else {
    getDocument().addEventListener('DOMContentLoaded', fn)
  }
}

ready(function () {
  var body = getDocument().body
  processNode(body)

  setTimeout(function () {
    triggerEvent(body, 'htmx:load', {})
    body = null
  }, 0)
})

function triggerEvent(elt, eventName, detail) {
  // console.log({ elt, eventName, detail })
  elt = resolveTarget(elt)
  if (detail == null) {
    detail = {}
  }
  detail['elt'] = elt
  var event = makeEvent(eventName, detail)
  var eventResult = elt.dispatchEvent(event)
  return eventResult
}

function resolveTarget(arg2) {
  if (isType(arg2, 'String')) {
    return find(arg2)
  } else {
    return arg2
  }
}

function isType(o, type) {
  return Object.prototype.toString.call(o) === '[object ' + type + ']'
}

function find(eltOrSelector, selector) {
  if (selector) {
    return eltOrSelector.querySelector(selector)
  } else {
    return find(getDocument(), eltOrSelector)
  }
}

function makeEvent(eventName, detail) {
  var evt
  if (window.CustomEvent && typeof window.CustomEvent === 'function') {
    evt = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: detail,
    })
  } else {
    evt = getDocument().createEvent('CustomEvent')
    evt.initCustomEvent(eventName, true, true, detail)
  }
  return evt
}

function forEach(arr, func) {
  if (arr) {
    for (var i = 0; i < arr.length; i++) {
      func(arr[i])
    }
  }
}

function getAttributeValue(elt, qualifiedName) {
  return (
    getRawAttribute(elt, qualifiedName) ||
    getRawAttribute(elt, 'data-' + qualifiedName)
  )
}

function getRawAttribute(elt, name) {
  return elt.getAttribute && elt.getAttribute(name)
}

function parentElt(elt) {
  return elt.parentElement
}

function processNode(elt) {
  elt = resolveTarget(elt)
  initNode(elt)
  forEach(findElementsToProcess(elt), function (child) {
    initNode(child)
  })
}

function closest(elt, selector) {
  elt = resolveTarget(elt)
  return elt.closest(selector)
}

function cleanUpElement(element) {
  triggerEvent(element, 'htmx:beforeCleanupElement')
  deInitNode(element)
}

function deInitNode(element) {
  var internalData = getInternalData(element)
  if (internalData.listenerInfos) {
    forEach(internalData.listenerInfos, function (info) {
      if (info.on) {
        info.on.removeEventListener(info.trigger, info.listener)
      }
    })
  }
  forEach(Object.keys(internalData), function (key) {
    delete internalData[key]
  })
}

function getInternalData(elt) {
  var dataProp = 'htmx-internal-data'
  var data = elt[dataProp]
  if (!data) {
    data = elt[dataProp] = {}
  }
  return data
}

var VERBS = ['get', 'post', 'put', 'delete', 'patch']
var VERB_SELECTOR = VERBS.map(function (verb) {
  return '[hx-' + verb + '], [data-hx-' + verb + ']'
}).join(', ')

function findElementsToProcess(elt) {
  var boostedSelector =
    ', [hx-boost] a, [data-hx-boost] a, a[hx-boost], a[data-hx-boost]'
  var results = elt.querySelectorAll(
    VERB_SELECTOR +
      boostedSelector +
      ", form, [type='submit'], [hx-sse], [data-hx-sse], [hx-ws]," +
      ' [data-hx-ws], [hx-ext], [data-hx-ext], [hx-trigger], [data-hx-trigger], [hx-on], [data-hx-on]',
  )
  return results
}

function hasAttribute(elt, qualifiedName) {
  return (
    elt.hasAttribute &&
    (elt.hasAttribute(qualifiedName) ||
      elt.hasAttribute('data-' + qualifiedName))
  )
}

function initNode(elt) {
  var nodeData = getInternalData(elt)
  // console.log({ nodeData })
  if (nodeData.initHash !== attributeHash(elt)) {
    deInitNode(elt)

    nodeData.initHash = attributeHash(elt)

    triggerEvent(elt, 'htmx:beforeProcessNode')

    if (elt.value) {
      nodeData.lastValue = elt.value
    }

    var triggerSpecs = getTriggerSpecs(elt)
    var hasExplicitHttpAction = processVerbs(elt, nodeData, triggerSpecs)
    // console.log({ triggerSpecs, hasExplicitHttpAction })

    triggerEvent(elt, 'htmx:afterProcessNode')
  }
}

function attributeHash(elt) {
  var hash = 0
  if (elt.attributes) {
    for (var i = 0; i < elt.attributes.length; i++) {
      var attribute = elt.attributes[i]
      if (attribute.value) {
        hash = stringHash(attribute.name, hash)
        hash = stringHash(attribute.value, hash)
      }
    }
  }
  return hash
}

// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0,
function stringHash(string, hash) {
  var char = 0
  while (char < string.length) {
    hash = ((hash << 5) - hash + string.charCodeAt(char++)) | 0
  }
  return hash
}

function getTriggerSpecs(elt) {
  var triggerSpecs = []

  if (triggerSpecs.length > 0) {
    return triggerSpecs
  } else if (matches(elt, 'form')) {
    return [{ trigger: 'submit' }]
  } else if (matches(elt, 'input[type="button"], input[type="submit"]')) {
    return [{ trigger: 'click' }]
  } else if (matches(elt, 'input, textarea, select')) {
    return [{ trigger: 'change' }]
  } else {
    return [{ trigger: 'click' }]
  }
}

function matches(elt, selector) {
  var matchesFunction =
    elt.matches ||
    elt.matchesSelector ||
    elt.msMatchesSelector ||
    elt.mozMatchesSelector ||
    elt.webkitMatchesSelector ||
    elt.oMatchesSelector
  return matchesFunction && matchesFunction.call(elt, selector)
}

var WHITESPACE_OR_COMMA = /[\s,]/
var SYMBOL_START = /[_$a-zA-Z]/
var SYMBOL_CONT = /[_$a-zA-Z0-9]/
var STRINGISH_START = ['"', "'", '/']
var NOT_WHITESPACE = /[^\s]/
var COMBINED_SELECTOR_START = /[{(]/
var COMBINED_SELECTOR_END = /[})]/

function consumeUntil(tokens, match) {
  var result = ''
  while (tokens.length > 0 && !match.test(tokens[0])) {
    result += tokens.shift()
  }
  return result
}

function tokenizeString(str) {
  var tokens = []
  var position = 0
  while (position < str.length) {
    if (SYMBOL_START.exec(str.charAt(position))) {
      var startPosition = position
      while (SYMBOL_CONT.exec(str.charAt(position + 1))) {
        position++
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1))
    } else if (STRINGISH_START.indexOf(str.charAt(position)) !== -1) {
      var startChar = str.charAt(position)
      var startPosition = position
      position++
      while (position < str.length && str.charAt(position) !== startChar) {
        if (str.charAt(position) === '\\') {
          position++
        }
        position++
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1))
    } else {
      var symbol = str.charAt(position)
      tokens.push(symbol)
    }
    position++
  }
  return tokens
}

function parseInterval(str) {
  if (str == undefined) {
    return undefined
  }

  let interval = NaN
  if (str.slice(-2) == 'ms') {
    interval = parseFloat(str.slice(0, -2))
  } else if (str.slice(-1) == 's') {
    interval = parseFloat(str.slice(0, -1)) * 1000
  } else if (str.slice(-1) == 'm') {
    interval = parseFloat(str.slice(0, -1)) * 1000 * 60
  } else {
    interval = parseFloat(str)
  }
  return isNaN(interval) ? undefined : interval
}

function consumeCSSSelector(tokens) {
  var result
  if (tokens.length > 0 && COMBINED_SELECTOR_START.test(tokens[0])) {
    tokens.shift()
    result = consumeUntil(tokens, COMBINED_SELECTOR_END).trim()
    tokens.shift()
  } else {
    result = consumeUntil(tokens, WHITESPACE_OR_COMMA)
  }
  return result
}

function processVerbs(elt, nodeData, triggerSpecs) {
  var explicitAction = false
  forEach(VERBS, function (verb) {
    if (hasAttribute(elt, 'hx-' + verb)) {
      var path = getAttributeValue(elt, 'hx-' + verb)
      explicitAction = true
      nodeData.path = path
      nodeData.verb = verb
      triggerSpecs.forEach(function (triggerSpec) {
        addTriggerHandler(elt, triggerSpec, nodeData, function (elt, evt) {
          issueAjaxRequest(verb, path, elt, evt)
        })
      })
    }
  })
  return explicitAction
}

function addTriggerHandler(elt, triggerSpec, nodeData, handler) {
  addEventListener(elt, handler, nodeData, triggerSpec)
}

function addEventListener(elt, handler, nodeData, triggerSpec) {
  var eltsToListenOn = [elt]

  forEach(eltsToListenOn, function (eltToListenOn) {
    var eventListener = function (evt) {
      var eventData = getInternalData(evt)
      eventData.triggerSpec = triggerSpec
      if (eventData.handledFor == null) {
        eventData.handledFor = []
      }
      if (eventData.handledFor.indexOf(elt) < 0) {
        eventData.handledFor.push(elt)

        triggerEvent(elt, 'htmx:trigger')
        handler(elt, evt)
      }
    }
    if (nodeData.listenerInfos == null) {
      nodeData.listenerInfos = []
    }
    nodeData.listenerInfos.push({
      trigger: triggerSpec.trigger,
      listener: eventListener,
      on: eltToListenOn,
    })
    eltToListenOn.addEventListener(triggerSpec.trigger, eventListener)
  })
}

function bodyContains(elt) {
  if (elt.getRootNode && elt.getRootNode() instanceof window.ShadowRoot) {
    return getDocument().body.contains(elt.getRootNode().host)
  } else {
    return getDocument().body.contains(elt)
  }
}

function issueAjaxRequest(verb, path, elt, event, etc, confirmed) {
  // console.log({ verb, path, elt, event, etc, confirmed })
  var resolve = null
  var reject = null
  etc = etc != null ? etc : {}

  var promise = new Promise(function (_resolve, _reject) {
    resolve = _resolve
    reject = _reject
  })

  var responseHandler = etc.handler || handleAjaxResponse
  var select = etc.select || null

  var target = etc.targetOverride || elt

  var eltData = getInternalData(elt)

  var confirmQuestion = getClosestAttributeValue(elt, 'hx-confirm')
  if (confirmed === undefined) {
    var issueRequest = function (skipConfirmation) {
      return issueAjaxRequest(verb, path, elt, event, etc, !!skipConfirmation)
    }
    var confirmDetails = {
      target: target,
      elt: elt,
      path: path,
      verb: verb,
      triggeringEvent: event,
      etc: etc,
      issueRequest: issueRequest,
      question: confirmQuestion,
    }
    if (triggerEvent(elt, 'htmx:confirm', confirmDetails) === false) {
      maybeCall(resolve)
      return promise
    }
  }

  var abortable = false

  var xhr = new XMLHttpRequest()
  eltData.xhr = xhr
  eltData.abortable = abortable
  var endRequestLock = function () {
    eltData.xhr = null
    eltData.abortable = false
    if (eltData.queuedRequests != null && eltData.queuedRequests.length > 0) {
      var queuedRequest = eltData.queuedRequests.shift()
      queuedRequest()
    }
  }

  var headers = getHeaders(elt, target)

  if (verb !== 'get' && !usesFormData(elt)) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  var results = getInputValues(elt, verb)
  var errors = results.errors
  var rawParameters = results.values
  // `hx-vars`, `hx-vals`
  // var expressionVars = getExpressionVars(elt)
  var expressionVars = {}
  var allParameters = mergeObjects(rawParameters, expressionVars)
  // `hx-params`
  // var filteredParameters = filterValues(allParameters, elt)
  var filteredParameters = allParameters
  // console.log({ results, filteredParameters })

  // var requestAttrValues = getValuesForElement(elt, 'hx-request')
  var requestAttrValues = {}

  var eltIsBoosted = getInternalData(elt).boosted

  var useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0

  var requestConfig = {
    boosted: eltIsBoosted,
    useUrlParams: useUrlParams,
    parameters: filteredParameters,
    unfilteredParameters: allParameters,
    headers: headers,
    target: target,
    verb: verb,
    errors: errors,
    withCredentials:
      etc.credentials ||
      requestAttrValues.credentials ||
      htmx.config.withCredentials,
    timeout: etc.timeout || requestAttrValues.timeout || htmx.config.timeout,
    path: path,
    triggeringEvent: event,
  }

  if (!triggerEvent(elt, 'htmx:configRequest', requestConfig)) {
    maybeCall(resolve)
    endRequestLock()
    return promise
  }

  path = requestConfig.path
  verb = requestConfig.verb
  headers = requestConfig.headers
  filteredParameters = requestConfig.parameters
  errors = requestConfig.errors
  useUrlParams = requestConfig.useUrlParams

  if (errors && errors.length > 0) {
    triggerEvent(elt, 'htmx:validation:halted', requestConfig)
    maybeCall(resolve)
    endRequestLock()
    return promise
  }

  var splitPath = path.split('#')
  var pathNoAnchor = splitPath[0]
  var anchor = splitPath[1]

  var finalPath = path

  if (useUrlParams) {
    finalPath = pathNoAnchor
    var values = Object.keys(filteredParameters).length !== 0
    if (values) {
      if (finalPath.indexOf('?') < 0) {
        finalPath += '?'
      } else {
        finalPath += '&'
      }
      finalPath += urlEncode(filteredParameters)
      if (anchor) {
        finalPath += '#' + anchor
      }
    }
  }

  xhr.open(verb.toUpperCase(), finalPath, true)
  xhr.overrideMimeType('text/html')
  xhr.withCredentials = requestConfig.withCredentials
  xhr.timeout = requestConfig.timeout

  if (requestAttrValues.noHeaders) {
  } else {
    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        var headerValue = headers[header]
        safelySetHeaderValue(xhr, header, headerValue)
      }
    }
  }

  var responseInfo = {
    xhr: xhr,
    target: target,
    requestConfig: requestConfig,
    etc: etc,
    boosted: eltIsBoosted,
    select: select,
    pathInfo: {
      requestPath: path,
      finalRequestPath: finalPath,
      anchor: anchor,
    },
  }

  xhr.onload = function () {
    try {
      var hierarchy = hierarchyForElt(elt)
      responseInfo.pathInfo.responsePath = getPathFromResponse(xhr)
      // console.log({ hierarchy, responseInfo })
      responseHandler(elt, responseInfo)
      triggerEvent(elt, 'htmx:afterRequest', responseInfo)
      triggerEvent(elt, 'htmx:afterOnLoad', responseInfo)
      if (!bodyContains(elt)) {
        var secondaryTriggerElt = null
        while (hierarchy.length > 0 && secondaryTriggerElt == null) {
          var parentEltInHierarchy = hierarchy.shift()
          if (bodyContains(parentEltInHierarchy)) {
            secondaryTriggerElt = parentEltInHierarchy
          }
        }
        if (secondaryTriggerElt) {
          triggerEvent(secondaryTriggerElt, 'htmx:afterRequest', responseInfo)
          triggerEvent(secondaryTriggerElt, 'htmx:afterOnLoad', responseInfo)
        }
      }
      maybeCall(resolve)
      endRequestLock()
    } catch (e) {
      console.error(
        elt,
        'htmx:onLoadError',
        mergeObjects({ error: e }, responseInfo),
      )
      throw e
    }
  }

  if (!triggerEvent(elt, 'htmx:beforeRequest', responseInfo)) {
    maybeCall(resolve)
    endRequestLock()
    return promise
  }

  forEach(['loadstart', 'loadend', 'progress', 'abort'], function (eventName) {
    forEach([xhr, xhr.upload], function (target) {
      target.addEventListener(eventName, function (event) {
        triggerEvent(elt, 'htmx:xhr:' + eventName, {
          lengthComputable: event.lengthComputable,
          loaded: event.loaded,
          total: event.total,
        })
      })
    })
  })

  triggerEvent(elt, 'htmx:beforeSend', responseInfo)

  var params = useUrlParams
    ? null
    : encodeParamsForBody(xhr, elt, filteredParameters)
  // console.log({ params })

  xhr.send(params)

  return promise
}

function handleAjaxResponse(elt, responseInfo) {
  var xhr = responseInfo.xhr
  var target = responseInfo.target
  var etc = responseInfo.etc
  var select = responseInfo.select

  if (!triggerEvent(elt, 'htmx:beforeOnLoad', responseInfo)) return

  if (hasHeader(xhr, /HX-Trigger:/i)) {
    handleTrigger(xhr, 'HX-Trigger', elt)
  }

  var shouldSwap = xhr.status >= 200 && xhr.status < 400 && xhr.status !== 204
  var serverResponse = xhr.response
  var isError = xhr.status >= 400
  var ignoreTitle = htmx.config.ignoreTitle
  var beforeSwapDetails = mergeObjects(
    {
      shouldSwap: shouldSwap,
      serverResponse: serverResponse,
      isError: isError,
      ignoreTitle: ignoreTitle,
    },
    responseInfo,
  )

  if (!triggerEvent(target, 'htmx:beforeSwap', beforeSwapDetails)) return

  target = beforeSwapDetails.target
  serverResponse = beforeSwapDetails.serverResponse
  isError = beforeSwapDetails.isError
  ignoreTitle = beforeSwapDetails.ignoreTitle

  responseInfo.target = target
  responseInfo.failed = isError
  responseInfo.successful = !isError

  if (beforeSwapDetails.shouldSwap) {
    var swapOverride = etc.swapOverride

    var swapSpec = getSwapSpecification(elt, swapOverride)
    // console.log(swapSpec)

    if (swapSpec.hasOwnProperty('ignoreTitle')) {
      ignoreTitle = swapSpec.ignoreTitle
    }

    target.classList.add(htmx.config.swappingClass)

    var settleResolve = null
    var settleReject = null

    var doSwap = function () {
      try {
        var activeElt = document.activeElement
        var selectionInfo = {}
        try {
          selectionInfo = {
            elt: activeElt,
            start: activeElt ? activeElt.selectionStart : null,
            end: activeElt ? activeElt.selectionEnd : null,
          }
        } catch (e) {
          // safari issue - https://github.com/microsoft/playwright/issues/5894
        }

        var selectOverride
        if (select) {
          selectOverride = select
        }

        var settleInfo = makeSettleInfo(target)
        selectAndSwap(
          swapSpec.swapStyle,
          target,
          elt,
          serverResponse,
          settleInfo,
          selectOverride,
        )

        target.classList.remove(htmx.config.swappingClass)
        forEach(settleInfo.elts, function (elt) {
          if (elt.classList) {
            elt.classList.add(htmx.config.settlingClass)
          }
          triggerEvent(elt, 'htmx:afterSwap', responseInfo)
        })

        var doSettle = function () {
          forEach(settleInfo.tasks, function (task) {
            task.call()
          })
          forEach(settleInfo.elts, function (elt) {
            if (elt.classList) {
              elt.classList.remove(htmx.config.settlingClass)
            }
            triggerEvent(elt, 'htmx:afterSettle', responseInfo)
          })

          if (responseInfo.pathInfo.anchor) {
            var anchorTarget = getDocument().getElementById(
              responseInfo.pathInfo.anchor,
            )
            if (anchorTarget) {
              anchorTarget.scrollIntoView({
                block: 'start',
                behavior: 'auto',
              })
            }
          }

          if (settleInfo.title && !ignoreTitle) {
            var titleElt = find('title')
            if (titleElt) {
              titleElt.innerHTML = settleInfo.title
            } else {
              window.document.title = settleInfo.title
            }
          }

          maybeCall(settleResolve)
        }

        if (swapSpec.settleDelay > 0) {
          setTimeout(doSettle, swapSpec.settleDelay)
        } else {
          doSettle()
        }
      } catch (e) {
        console.error(elt, 'htmx:swapError', responseInfo)
        maybeCall(settleReject)
        throw e
      }
    }

    var shouldTransition = htmx.config.globalViewTransitions
    if (swapSpec.hasOwnProperty('transition')) {
      shouldTransition = swapSpec.transition
    }

    if (
      shouldTransition &&
      triggerEvent(elt, 'htmx:beforeTransition', responseInfo) &&
      typeof Promise !== 'undefined' &&
      document.startViewTransition
    ) {
      var settlePromise = new Promise(function (_resolve, _reject) {
        settleResolve = _resolve
        settleReject = _reject
      })
      var innerDoSwap = doSwap
      doSwap = function () {
        document.startViewTransition(function () {
          innerDoSwap()
          return settlePromise
        })
      }
    }

    if (swapSpec.swapDelay > 0) {
      setTimeout(doSwap, swapSpec.swapDelay)
    } else {
      doSwap()
    }
  }
}

function getClosestAttributeValue(elt, attributeName) {
  var closestAttr = null
  getClosestMatch(elt, function (e) {
    return (closestAttr = getAttributeValueWithDisinheritance(
      elt,
      e,
      attributeName,
    ))
  })
  if (closestAttr !== 'unset') {
    return closestAttr
  }
}

function getClosestMatch(elt, condition) {
  while (elt && !condition(elt)) {
    elt = parentElt(elt)
  }

  return elt ? elt : null
}

function getAttributeValueWithDisinheritance(
  initialElement,
  ancestor,
  attributeName,
) {
  var attributeValue = getAttributeValue(ancestor, attributeName)
  var disinherit = getAttributeValue(ancestor, 'hx-disinherit')
  if (
    initialElement !== ancestor &&
    disinherit &&
    (disinherit === '*' || disinherit.split(' ').indexOf(attributeName) >= 0)
  ) {
    return 'unset'
  } else {
    return attributeValue
  }
}

function maybeCall(func) {
  if (func) {
    func()
  }
}

function getHeaders(elt, target, prompt) {
  var headers = {
    'HX-Request': 'true',
    'HX-Trigger': getRawAttribute(elt, 'id'),
    'HX-Trigger-Name': getRawAttribute(elt, 'name'),
    'HX-Target': getAttributeValue(target, 'id'),
    'HX-Current-URL': getDocument().location.href,
  }
  if (prompt !== undefined) {
    headers['HX-Prompt'] = prompt
  }
  if (getInternalData(elt).boosted) {
    headers['HX-Boosted'] = 'true'
  }
  return headers
}

function usesFormData(elt) {
  return (
    getClosestAttributeValue(elt, 'hx-encoding') === 'multipart/form-data' ||
    (matches(elt, 'form') &&
      getRawAttribute(elt, 'enctype') === 'multipart/form-data')
  )
}

function mergeObjects(obj1, obj2) {
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key]
    }
  }
  return obj1
}

function getInputValues(elt) {
  var values = {}
  var formValues = {}
  var errors = []
  var internalData = getInternalData(elt)

  if (
    internalData.lastButtonClicked ||
    elt.tagName === 'BUTTON' ||
    (elt.tagName === 'INPUT' && getRawAttribute(elt, 'type') === 'submit')
  ) {
    var button = internalData.lastButtonClicked || elt
    var name = getRawAttribute(button, 'name')
    addValueToValues(name, button.value, formValues)
  }

  values = mergeObjects(values, formValues)

  return { errors: errors, values: values }
}

function addValueToValues(name, value, values) {
  if (name != null && value != null) {
    var current = values[name]
    if (current === undefined) {
      values[name] = value
    } else if (Array.isArray(current)) {
      if (Array.isArray(value)) {
        values[name] = current.concat(value)
      } else {
        current.push(value)
      }
    } else {
      if (Array.isArray(value)) {
        values[name] = [current].concat(value)
      } else {
        values[name] = [current, value]
      }
    }
  }
}

function safelySetHeaderValue(xhr, header, headerValue) {
  if (headerValue !== null) {
    try {
      xhr.setRequestHeader(header, headerValue)
    } catch (e) {
      xhr.setRequestHeader(header, encodeURIComponent(headerValue))
      xhr.setRequestHeader(header + '-URI-AutoEncoded', 'true')
    }
  }
}

function hierarchyForElt(elt) {
  var arr = []
  while (elt) {
    arr.push(elt)
    elt = elt.parentElement
  }
  return arr
}

function getPathFromResponse(xhr) {
  if (xhr.responseURL && typeof URL !== 'undefined') {
    try {
      var url = new URL(xhr.responseURL)
      return url.pathname + url.search
    } catch (e) {
      console.error(getDocument().body, 'htmx:badResponseUrl', {
        url: xhr.responseURL,
      })
    }
  }
}

function encodeParamsForBody(xhr, elt, filteredParameters) {
  var encodedParameters = null
  if (encodedParameters != null) {
    return encodedParameters
  } else {
    if (usesFormData(elt)) {
      return makeFormData(filteredParameters)
    } else {
      return urlEncode(filteredParameters)
    }
  }
}

function makeFormData(values) {
  var formData = new FormData()
  for (var name in values) {
    if (values.hasOwnProperty(name)) {
      var value = values[name]
      if (Array.isArray(value)) {
        forEach(value, function (v) {
          formData.append(name, v)
        })
      } else {
        formData.append(name, value)
      }
    }
  }
  return formData
}

function urlEncode(values) {
  var returnStr = ''
  for (var name in values) {
    if (values.hasOwnProperty(name)) {
      var value = values[name]
      if (Array.isArray(value)) {
        forEach(value, function (v) {
          returnStr = appendParam(returnStr, name, v)
        })
      } else {
        returnStr = appendParam(returnStr, name, value)
      }
    }
  }
  return returnStr
}

function appendParam(returnStr, name, realValue) {
  if (returnStr !== '') {
    returnStr += '&'
  }
  if (String(realValue) === '[object Object]') {
    realValue = JSON.stringify(realValue)
  }
  var s = encodeURIComponent(realValue)
  returnStr += encodeURIComponent(name) + '=' + s
  return returnStr
}

function hasHeader(xhr, regexp) {
  return regexp.test(xhr.getAllResponseHeaders())
}

function handleTrigger(xhr, header, elt) {
  var triggerBody = xhr.getResponseHeader(header)
  if (triggerBody.indexOf('{') === 0) {
    var triggers = parseJSON(triggerBody)
    for (var eventName in triggers) {
      if (triggers.hasOwnProperty(eventName)) {
        var detail = triggers[eventName]
        if (!isRawObject(detail)) {
          detail = { value: detail }
        }
        triggerEvent(elt, eventName, detail)
      }
    }
  } else {
    var eventNames = triggerBody.split(',')
    for (var i = 0; i < eventNames.length; i++) {
      triggerEvent(elt, eventNames[i].trim(), [])
    }
  }
}

function isRawObject(o) {
  return isType(o, 'Object')
}

function splitOnWhitespace(trigger) {
  return trigger.trim().split(/\s+/)
}

function getSwapSpecification(elt, swapInfoOverride) {
  var swapInfo = swapInfoOverride
    ? swapInfoOverride
    : getClosestAttributeValue(elt, 'hx-swap')
  var swapSpec = {
    swapStyle: getInternalData(elt).boosted
      ? 'innerHTML'
      : htmx.config.defaultSwapStyle,
    swapDelay: htmx.config.defaultSwapDelay,
    settleDelay: htmx.config.defaultSettleDelay,
  }
  if (swapInfo) {
    var split = splitOnWhitespace(swapInfo)
    if (split.length > 0) {
      for (var i = 0; i < split.length; i++) {
        var value = split[i]
        if (i == 0) {
          swapSpec['swapStyle'] = value
        }
      }
    }
  }
  return swapSpec
}

function makeSettleInfo(target) {
  return { tasks: [], elts: [target] }
}

function selectAndSwap(swapStyle, target, elt, responseText, settleInfo) {
  // console.log({
  //   swapStyle,
  //   target,
  //   elt,
  //   responseText,
  //   settleInfo,
  // })
  var fragment = makeFragment(responseText)
  if (fragment) {
    return swap(swapStyle, elt, target, fragment, settleInfo)
  }
}

function makeFragment(response) {
  var startTag = getStartTag(response)
  var content = response
  if (startTag === 'head') {
    content = content.replace(HEAD_TAG_REGEX, '')
  }
  switch (startTag) {
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'colgroup':
    case 'caption':
      return parseHTML('<table>' + content + '</table>', 1)
    case 'col':
      return parseHTML('<table><colgroup>' + content + '</colgroup></table>', 2)
    case 'tr':
      return parseHTML('<table><tbody>' + content + '</tbody></table>', 2)
    case 'td':
    case 'th':
      return parseHTML(
        '<table><tbody><tr>' + content + '</tr></tbody></table>',
        3,
      )
    case 'script':
    case 'style':
      return parseHTML('<div>' + content + '</div>', 1)
    default:
      return parseHTML(content, 0)
  }
}

function getStartTag(str) {
  var tagMatcher = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i
  var match = tagMatcher.exec(str)
  if (match) {
    return match[1].toLowerCase()
  } else {
    return ''
  }
}

function parseHTML(resp, depth) {
  var parser = new DOMParser()
  var responseDoc = parser.parseFromString(resp, 'text/html')

  /** @type {Element} */
  var responseNode = responseDoc.body
  while (depth > 0) {
    depth--
    responseNode = responseNode.firstChild
  }
  if (responseNode == null) {
    responseNode = getDocument().createDocumentFragment()
  }
  return responseNode
}

function makeAjaxLoadTask(child) {
  return function () {
    removeClassFromElement(child, htmx.config.addedClass)
    processNode(child)
    triggerEvent(child, 'htmx:load')
  }
}

function removeClassFromElement(elt, clazz, delay) {
  elt = resolveTarget(elt)
  if (delay) {
    setTimeout(function () {
      removeClassFromElement(elt, clazz)
      elt = null
    }, delay)
  } else {
    if (elt.classList) {
      elt.classList.remove(clazz)
      if (elt.classList.length === 0) {
        elt.removeAttribute('class')
      }
    }
  }
}

function swap(swapStyle, elt, target, fragment, settleInfo) {
  // console.log({ swapStyle, elt, target, fragment, settleInfo })
  switch (swapStyle) {
    case 'none':
      return
    case 'outerHTML':
      swapOuterHTML(target, fragment, settleInfo)
      return
    case 'afterbegin':
      // swapAfterBegin(target, fragment, settleInfo)
      return
    case 'beforebegin':
      // swapBeforeBegin(target, fragment, settleInfo)
      return
    case 'beforeend':
      // swapBeforeEnd(target, fragment, settleInfo)
      return
    case 'afterend':
      // swapAfterEnd(target, fragment, settleInfo)
      return
    case 'delete':
      // swapDelete(target, fragment, settleInfo)
      return
    default:
      if (swapStyle === 'innerHTML') {
        swapInnerHTML(target, fragment, settleInfo)
      } else {
        swap(htmx.config.defaultSwapStyle, elt, target, fragment, settleInfo)
      }
  }
}

function swapInnerHTML(target, fragment, settleInfo) {
  var firstChild = target.firstChild
  insertNodesBefore(target, firstChild, fragment, settleInfo)
  if (firstChild) {
    while (firstChild.nextSibling) {
      cleanUpElement(firstChild.nextSibling)
      target.removeChild(firstChild.nextSibling)
    }
    cleanUpElement(firstChild)
    target.removeChild(firstChild)
  }
}

function swapOuterHTML(target, fragment, settleInfo) {
  if (target.tagName === 'BODY') {
    // return swapInnerHTML(target, fragment, settleInfo)
  } else {
    var newElt
    var eltBeforeNewContent = target.previousSibling
    insertNodesBefore(parentElt(target), target, fragment, settleInfo)
    if (eltBeforeNewContent == null) {
      newElt = parentElt(target).firstChild
    } else {
      newElt = eltBeforeNewContent.nextSibling
    }
    settleInfo.elts = settleInfo.elts.filter(function (e) {
      return e != target
    })
    while (newElt && newElt !== target) {
      if (newElt.nodeType === Node.ELEMENT_NODE) {
        settleInfo.elts.push(newElt)
      }
      newElt = newElt.nextElementSibling
    }
    cleanUpElement(target)
    parentElt(target).removeChild(target)
  }
}

function insertNodesBefore(parentNode, insertBefore, fragment, settleInfo) {
  // console.log({ parentNode, insertBefore, fragment, settleInfo })
  while (fragment.childNodes.length > 0) {
    var child = fragment.firstChild
    addClassToElement(child, htmx.config.addedClass)
    parentNode.insertBefore(child, insertBefore)
    if (
      child.nodeType !== Node.TEXT_NODE &&
      child.nodeType !== Node.COMMENT_NODE
    ) {
      settleInfo.tasks.push(makeAjaxLoadTask(child))
    }
  }
}

function addClassToElement(elt, clazz, delay) {
  elt = resolveTarget(elt)
  if (delay) {
    setTimeout(function () {
      addClassToElement(elt, clazz)
      elt = null
    }, delay)
  } else {
    elt.classList && elt.classList.add(clazz)
  }
}
