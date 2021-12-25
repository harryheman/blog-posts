# `React Clone` :metal:

Let's build React Clone.

Наша мини-версия `React` сможет выполнять следующий код:

```javascript
import '../style.scss'
import MyReact from './my-react'

const buttonStyles = {
 border: 'none',
 outline: 'none',
 padding: '0.3rem 0.5rem',
 marginLeft: '0.5rem',
 backgroundImage: 'linear-gradient(yellow, orange)',
 borderRadius: '2px',
 boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
 cursor: 'pointer'
}

/** @jsx MyReact.createElement */
function Counter() {
 const [value, setValue] = MyReact.useState(1)
 const [count, setCount] = MyReact.useState(1)

 return (
   <section>
     <h1 className='title'>Hello from MyReact!</h1>
     <div className='box'>
       <input
         style='width: 80px; padding: 0.15rem 0.5rem;'
         type='number'
         value={value}
         onInput={(e) => {
           setValue(Number(e.target.value))
         }}
       />
       <button
         style={buttonStyles}
         onClick={() => {
           setCount((count) => count + value)
         }}
       >
         Increment
       </button>
     </div>
     <h2 className='subtitle'>
       Count: <span className='count-value'>{count}</span>
     </h2>
     <ul className='list'>
       {['React', 'from', 'scratch'].map((item) => (
         <li>{item}</li>
       ))}
     </ul>
   </section>
 )
}

MyReact.render(<Counter />, document.getElementById('app'))
```

Как вы могли догадаться, наша версия будет называться `MyReact`.

Скриншот:

<img src="https://habrastorage.org/webt/ba/bq/ue/babque1vl1xr_ib8fsbn4275fzs.png" />
<br />

[Песочница](https://codesandbox.io/s/my-react-8qxbf)

При разработке мы будем придерживаться архитектуры [исходного кода `React`](https://github.com/facebook/react/tree/main/packages/react). Вместе с тем, следует отметить, что за последние 2 года исходный код `React` претерпел значительные изменения, поэтому некоторые вещи, которые мы будем рассматривать, помечены в нем как `legacy`. Несмотря на это, общие принципы и подходы остаются прежними.

Основным источником вдохновения для меня послужила [эта замечательная статья](https://pomb.us/build-your-own-react/).

В конце статьи я покажу вам, как запустить проект, в котором используются [`ES6-модули`](https://learn.javascript.ru/modules) и [`SASS`](https://learn.javascript.ru/modules) с помощью [`Snowpack`](https://www.snowpack.dev/).

## Введение

```javascript
const element = <h1 title="hello">Hello from MyReact!</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

Что здесь происходит?

На первой строке мы определяем `React-элемент`. На второй - получаем ссылку на `DOM-элемент`. На последней - рендерим `React-элемент` - помещаем его в `container`.

Заменим код на `React` обычным `JavaScript`.

```javascript
const element = <h1 title="hello">Hello from MyReact!</h1>
```

На первой строке у нас имеется элемент, определенный с помощью [`JSX`](https://ru.reactjs.org/docs/introducing-jsx.html).

`JSX` трансформируется в `JS` с помощью таких инструментов как [`Babel`](https://babeljs.io/). Трансформация, обычно, включает в себя следующее: замена кода внутри тегов на вызов функции `createElement`, которой в качестве аргументов передаются название тега (`type`), свойства (`props`) и дочерние элементы (`children`). Процесс трансформации `JSX` в `JS` называется транспиляцией (transilation).

```javascript
const element = React.createElement(
 "h1",
 { title: "hello" },
 "Hello from MyReact!"
)
```

Функция `React.createElement` создает объект на основе переданных ей аргументов. Не считая некоторой валидации, это все, что делает данная функция.

```javascript
const element = {
 type: "h1",
 props: {
   title: "hello",
   children: "Hello from MyReact!"
 }
}
```

Таким образом, элемент - это объект с 2 свойствами: `type` и `props`. На самом деле, [свойств больше](https://github.com/facebook/react/blob/main/packages/react/src/ReactElement.js#L147), но нас пока интересуют только эти.

`type` - это строка, определяющая тип DOM-элемента, который мы хотим создать. Это название тега, которое передается `document.createElement` для создания HTML-элемента. Это также может быть функция, о чем мы поговорим позже.

`props` - это объект, содержащий все ключи и значения атрибутов `JSX`. Он также содержит специальное свойство `children`.

В данном случае `children` - это строка, но, как правило, значением этого свойства является массив элементов. Вот почему элементы - это деревья (tree) с точки зрения структуры.

```javascript
ReactDOM.render(element, container)
```

`render` - это то "место", где `React` изменяет `DOM`.

```javascript
const node = document.createElement(element.type)
node["title"] = element.props.title
```

Сначала мы создаем узел (`node`) (во избежание путаницы я буду использовать слово "элемент" для обозначения элементов `React`, а слово "узел" - для обозначения элементов `DOM`) на основе типа (`type`) - в данном случае `h1`.

Затем мы присваиваем узлу все пропы (`props`). В данном случае у нас имеется только заголовок (`title`).

```javascript
const text = document.createTextNode("")
text["nodeValue"] = element.props.children
```

Далее мы создаем узлы для дочерних элементов. В данном случае у нас имеется только один такой элемент - строка. Поэтому мы создаем текстовый узел.

Использование `nodeValue` вместо `innerText` позволит нам одинаково обрабатывать все элементы. Обратите внимание, что мы устанавливаем `nodeValue` так, как если бы строка имела `props: { nodeValue: "Hello from MyReact!" }`.

```javascript
node.append(text)
container.append(node)
```

Наконец, мы добавляем `textNode` в `h1`, а `h1` в `container`.

```javascript
const element = {
 type: "h1",
 props: {
   title: "hello",
   children: "Hello from MyReact!"
 }
}

const container = document.getElementById("root")

const node = document.createElement(element.type)
node["title"] = element.props.title

const text = document.createTextNode("")
text["nodeValue"] = element.props.children

node.append(text)
container.append(node)
```

На выходе мы получили аналогичный код, но без `React`.

## Функция `createElement`

```javascript
const element = (
 <section id="welcome">
   <h1 title="hello" className="title">Hello from MyReact!</h1>
   <p style="color: green;"><span>React</span> from scratch</p>
 </section>
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

Приступим к реализации функции `createElement`.

Если мы трансформируем `JSX` в `JS`, то получим следующее:

```javascript
const element = React.createElement(
 "section",
 { id: "welcome" },
 React.createElement(
   "h1",
   { title: "hello", className: "title" },
   "Hello from MyReact!"
 ),
 React.createElement(
   "p",
   { style: "color: green;" },
   React.createElement(
     "span",
     null,
     "React"
   )
   " from scratch"
 )
)
```

Как мы выяснили, элемент - это объект с `type` и `props`. Следовательно, наша функция должна создавать такие объекты.

```javascript
function createElement(type, props, ...children) {
 return {
   type,
   props: {
     ...props,
     children,
   }
 }
}
```

Мы используем операторы `spread` для `props` и [`rest`](https://learn.javascript.ru/rest-parameters-spread-operator) для `children` (поэтому `children` всегда будет массивом).

`createElement("section")` вернет:

```javascript
{
 type: "section",
 props: {
   children: []
 }
}
```

`createElement("section", null, "hello")` вернет:

```javascript
{
 type: "section",
 props: {
   children: ["hello"]
 }
}
```

`createElement("section", { title: "hello" }, "hello", "world")` вернет:

```javascript
{
 type: "section",
 props: {
   title: "hello",
   children: [
     "hello",
     "world"
   ]
 }
}
```

```javascript
function createElement(type, props, ...children) {
 return {
   type,
   props: {
     ...props,
     // ! - здесь и далее так будут отмечены вносимые в код изменения
     children: children.map(child =>
       typeof child === "object"
         ? child
         : createTextElement(child)
     )
   }
 }
}

function createTextElement(nodeValue) {
 return {
   type: "TEXT_ELEMENT",
   props: {
     nodeValue,
     children: []
   }
 }
}
```

Массив `children` может содержать примитивные значения, такие как строки или числа. Поэтому для значений с типом, отличающимся от объекта, требуется специальная функция, создающая особый тип элемента: `TEXT_ELEMENT`.

`React` не оборачивает примитивы и не создает пустые массивы при отсутствии `children`. Мы жертвуем производительностью ради простоты кода.

```javascript
const MyReact = {
 createElement
}

const element = MyReact.createElement(
 "section",
 { id: "welcome" },
 MyReact.createElement(
   "h1",
   { title: "hello", className: "title" },
   "Hello from MyReact!"
 ),
 MyReact.createElement(
   "p",
   { style: "color: green;" },
   MyReact.createElement(
     "span",
     null,
     "React"
   )
   " from scratch"
 )
)
```

Заменяем `React` на `MyReact`.

Для того, чтобы иметь возможность использовать `JSX`, нам необходимо указать `Babel` передавать трансформированный `JSX` в нашу функцию `createElement`.

```javascript
/** @jsx MyReact.createElement */
const element = (
 <section id="welcome">
   <h1 title="hello" className="title">Hello from MyReact!</h1>
   <p style="color: green;"><span>React</span> from scratch</p>
 </section>
)
```

Комментарий `/** @jsx MyReact.createElement */` сообщает `Babel` о нашем желании использовать собственную версию `createElement` для создания элементов.

## Функция `render`

```javascript
ReactDOM.render(element, container)
```

Далее нам необходимо реализовать собственную версию функции [`ReactDOM.render`](https://github.com/facebook/react/blob/main/packages/react-dom/src/client/ReactDOMLegacy.js#L266).

Мы начнем с добавления узлов в `DOM`, а их обновление и удаление рассмотрим позже.

```javascript
function render(element, container) {
 const node = document.createElement(element.type)
​
 container.append(node)
}
```

Создаем новый узел на основе типа элемента и добавляем его в контейнер.

```javascript
function render(element, container) {
 const node = document.createElement(element.type)
​
 // !
 element.props.children.forEach(child =>
   render(child, node)
 )
​
 container.appendChild(node)
}
```

Затем мы делаем тоже самое для каждого потомка узла рекурсивно.

```javascript
function render(element, container) {
 // !
 const node =
   element.type == "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(element.type)
​
 element.props.children.forEach(child =>
   render(child, node)
 )
​
 container.appendChild(node)
}
```

Если типом элемента является `TEXT_ELEMENT`, вместо обычного узла создается текстовый.

```javascript
function render(element, container) {
 const node =
   element.type == "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(element.type)

 // !
 const isProperty = key => key !== "children"
 Object.keys(element.props)
   .filter(isProperty)
   .forEach(key => {
     node[key] = element.props[key]
   })
​
 element.props.children.forEach(child =>
   render(child, node)
 )
​
 container.appendChild(node)
}
```

И последнее, что нам нужно сделать, это присвоить узлу пропы элемента.

```javascript
function createElement(type, props, ...children) {
 return {
   type,
   props: {
     ...props,
     children: children.map(child =>
       typeof child === "object"
         ? child
         : createTextElement(child)
     )
   }
 }
}

function createTextElement(nodeValue) {
 return {
   type: "TEXT_ELEMENT",
   props: {
     nodeValue,
     children: [],
   }
 }
}

function render(element, container) {
 const node =
   element.type == "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(element.type)

 const isProperty = key => key !== "children"
 Object.keys(element.props)
   .filter(isProperty)
   .forEach(key => {
     node[key] = element.props[key]
   })
​
 element.props.children.forEach(child =>
   render(child, node)
 )
​
 container.appendChild(node)
}

const MyReact = {
 createElement,
 render
}

/** @jsx MyReact.createElement */
const element = (
 <section id="welcome">
   <h1 title="hello" className="title">Hello from MyReact!</h1>
   <p style="color: green;"><span>React</span> from scratch</p>
 </section>
)

const container = document.getElementById("root")
MyReact.render(element, container)
```

Самым простой способ запустить этот пример (и другие):

```html
<!-- index.html -->

<div id="root"></div>

<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
 // MyReact
</script>
```

## Конкурентный режим (Concurrent Mode)

Перед тем, как мы продолжим веселиться, придется сделать небольшой рефакторинг кода.

```javascript
element.props.children.forEach(child =>
 render(child, node)
)
```

В чем проблема этого рекурсивного вызова? (Представим, что вы проходите собеседование для устройства на работу в `Facebook` ;) )

```
   .  .
    \/
   (@@)
g/\_)(_/\e
g/\(=--=)/\e
   //\\
  _|  |_
```

Проблема в том, что после начала рендеринга, мы не остановимся, пока не отрендерим все дерево элементов целиком. Если такое дерево большое, его рендеринг может заблокировать основной поток выполнения программы (main thread) на значительное время. Если у браузера в это время появятся важные задачи, вроде обработки ввода пользователя (имеется ввиду введенных пользователем данных при заполнении полей формы, например) или плавное воспроизведение анимации, он не сможет этого сделать до завершения рендеринга.

```javascript
let nextUnitOfWork = null
​
function workLoop(deadline) {
 while (nextUnitOfWork && deadline.timeRemaining() > 0) {
   nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
 }

 requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
```

Поэтому нам необходимо разделить процесс рендеринга на части. После выполнения каждой части мы позволяет браузеру выполнять свои задачи (при наличии таковых).

Мы используем [`requestIdleCallback`](https://developer.mozilla.org/ru/docs/Web/API/Window/requestIdleCallback) для создания бесконечного цикла. `requestIdleCallback` похож на `setTimeout`, но вместо того, чтобы выполнять задачу через определенное время, браузер запускает функцию обратного вызова (в данном случае `workLoop`), когда основной поток свободен от выполнения других задач (период простоя или режим ожидания браузера - отсюда `idle`).

В `React` больше не используется `requestIdleCallback`. Теперь там применяется библиотека [`scheduler`](https://github.com/facebook/react/tree/main/packages/scheduler). По всей видимости, это объясняется тем, что `requestIdleCallback` является экспериментальной технологией и [поддерживается не всеми браузерами](https://caniuse.com/requestidlecallback). В частности, `Safari` поддерживает `requestIdleCallback` только в экспериментальном режиме.

Подстраховаться на случай отсутствия поддержки `requestIdleCallback` можно так:

```javascript
window.requestIdleCallback =
 window.requestIdleCallback ||
 function (handler) {
   const start = Date.now()

   return setTimeout(() => {
     handler({
       didTimeout: false,
       timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
     })
   }, 1)
 }
```

Подробнее о `requestIdleCallback` можно почитать [здесь](https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API) и [здесь](https://developers.google.com/web/updates/2015/08/using-requestidlecallback).

```javascript
function performUnitOfWork(nextUnitOfWork) {
 // TODO
}
```

Для того, чтобы начать использовать цикл, нам нужно определить первую единицу работы. Для этого нам потребуется еще одна функция - `performUnitOfWork`, которая не только выполняет текущую единицу работы, но и возвращает следующую.

## Волокно (Fiber)

Для организации правильного взаимодействия между единицами работы нам нужна подходящая структура данных. Одной из таких структур является `fiber tree` (условно можно перевести как "древесное волокно").

У нас имеется одно волокно для каждого элемента и каждое волокно представляет собой единицу работы.

Рассмотрим на примере.

<img src="https://habrastorage.org/webt/nz/c0/e2/nzc0e2rr7omhkxuadfm2i23almm.png" />
<br />
Предположим, что мы хотим отрендерить такое дерево элементов:

```javascript
MyReact.render(
 <section>
   <h1>
     <p></p>
     <a></a>
   </h1>
   <h2></h2>
 </section>,
 container
)
```

В методе `render` мы создаем корневое волокно (root fiber) и устанавливаем его в качестве `nextUnitOfWork`. Остальная работа выполняется в функции `performUnitOfWork`. Там происходит 3 вещи:

1. Добавление элемента в `DOM`
2. Создание волокон для потомков элемента
3. Выбор следующей единицы работы

<img src="https://habrastorage.org/webt/9i/n_/un/9in_unu7qyjhug2p8y81pjggram.png" />
<br />

Одной из задач этой структуры данных является упрощение определения следующей единицы работы. Вот почему каждое волокно имеет ссылки на первого потомка (`child`), [сиблинга](https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BD%D0%B3%D0%B8) (`sibling`) и предка (`parent`).

После обработки волокна, если у него есть `child`, он становится следующей единицей работы.

В нашем примере после того, как мы закончили с `section`, следующей единицей работы становится `h1`.

Если волокно не имеет `child`, следующей единицей работы становится `sibling`.

Например, волокно `p` не имеет `child`, поэтому следующей единицей работы становится `a`.

Наконец, если волокно не имеет ни `child`, ни `sibling`, следующей единицей работы становится `sibling` предка волокна (`parent`).

Если `parent` не имеет `sibling`, мы поднимаемся к следующему `parent` и так до тех пор, пока не достигнем корневого волокна. Если мы достигли такого волокна, значит, работа для данного цикла `render` закончена.

```javascript
function createNode(fiber) {
 const node =
   fiber.type == "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(fiber.type)
​
 const isProperty = key => key !== "children"
 Object.keys(fiber.props)
   .filter(isProperty)
   .forEach(key => {
     node[key] = fiber.props[key]
   })
​
 return node
}

function render(element, container) {
 // TODO
}
```

Вынесем код по созданию узлов из функции `render` в отдельную функцию, он пригодится нам позже.

```javascript
function render(element, container) {
 nextUnitOfWork = {
   node: container,
   props: {
     children: [element]
   }
 }
}
```

В функции `render` мы присваиваем `nextUnitOfWork` корневой узел `fiber tree`.

```javascript
nextUnitOfWork = performUnitOfWork(
 nextUnitOfWork
)
```

Когда браузер будет готов, он запустит "колбек" `workLoop` и начнется обработка корневого узла.

```javascript
function performUnitOfWork(fiber) {
 if (!fiber.node) {
   fiber.node = createNode(fiber)
 }
​
 if (fiber.parent) {
   fiber.parent.node.append(fiber.node)
 }
}
```

Сначала мы создаем новый узел и добавляем его в `DOM`.

Узлы содержатся в свойстве `fiber.node`.

```javascript
const elements = fiber.props.children
let index = 0
let prevSibling = null
​
while (index < elements.length) {
 const element = elements[index]
​
 const newFiber = {
   type: element.type,
   props: element.props,
   parent: fiber,
   node: null
 }
}
```

Затем для каждого потомка создается волокно.

```javascript
const elements = fiber.props.children
let index = 0
let prevSibling = null
​
while (index < elements.length) {
 const element = elements[index]
​
 const newFiber = {
   type: element.type,
   props: element.props,
   parent: fiber,
   node: null,
 }
​
 // !
 // первый потомок?
 if (index === 0) {
   // свойство предка
   fiber.child = newFiber
 } else {
   // свойство текущего волокна
   prevSibling.sibling = newFiber
 }
​
 prevSibling = newFiber
 index++
}
```

Новое волокно добавляется в `fiber tree` либо как `child`, если оно является первым потомком, либо как `sibling`.

```javascript
const elements = fiber.props.children
let index = 0
let prevSibling = null
​
while (index < elements.length) {
 const element = elements[index]
​
 const newFiber = {
   type: element.type,
   props: element.props,
   parent: fiber,
   node: null,
 }
​
 if (index === 0) {
   fiber.child = newFiber
 } else {
   prevSibling.sibling = newFiber
 }
​
 prevSibling = newFiber
 index++
}

// !
// есть потомок?
if (fiber.child) {
 return fiber.child
}

let nextFiber = fiber
while (nextFiber) {
 // есть сиблинг?
 if (nextFiber.sibling) {
   return nextFiber.sibling
 }

 // спросим у предка
 nextFiber = nextFiber.parent
}
```

Наконец, мы определяем и возвращаем следующую единицу работы. Сначала мы возвращаем потомка. Если потомок отсутствует, возвращается сиблинг. Если сиблинга нет, поднимаемся к предку и возвращаем его сиблинга и т.д.

```javascript
function performUnitOfWork(fiber) {
 if (!fiber.node) {
   fiber.node = createNode(fiber)
 }
​
 if (fiber.parent) {
   fiber.parent.node.append(fiber.node)
 }

 const elements = fiber.props.children
 let index = 0
 let prevSibling = null
 ​
 while (index < elements.length) {
   const element = elements[index]
 ​
   const newFiber = {
     type: element.type,
     props: element.props,
     parent: fiber,
     node: null,
   }
 ​
   if (index === 0) {
     fiber.child = newFiber
   } else {
     prevSibling.sibling = newFiber
   }
 ​
   prevSibling = newFiber
   index++
 }

 if (fiber.child) {
   return fiber.child
 }

 let nextFiber = fiber
 while (nextFiber) {
   if (nextFiber.sibling) {
     return nextFiber.sibling
   }

   nextFiber = nextFiber.parent
 }
}
```

Вот как выглядит наша функция `performUnitOfWork`.

## Этапы рендеринга и фиксации результатов (Commit)

```javascript
if (fiber.parent) {
 fiber.parent.node.append(fiber.node)
}
```

В чем проблема этого блока кода? (Второй вопрос из 100 ;) )

```
   o   o
    )-(
   (O O)
    \=/
   .-"-.
  //\ /\\
_// / \ \\_
=./ {,-.} \.=
   || ||
   || ||
 __|| ||__
`---" "---'
```

Проблема в том, что мы добавляем новый узел в `DOM` при обработке каждого элемента (волокна). Как мы помним, браузер может прерывать процесс рендеринга для выполнения своих задач. Это может случиться до того, как мы отрендерили все дерево. Результат - пользователь видит частичный `UI`. Это не есть хорошо.

Поэтому часть, мутирующую `DOM`, из функции `performUnitOfWork` мы удаляем.

```javascript
function render(element, container) {
 // !
 workingRoot = {
   node: container,
   props: {
     children: [element]
   }
 }

 // !
 nextUnitOfWork = workingRoot
}
​
let nextUnitOfWork = null
// !
let workingRoot = null
```

Вместо этого, мы следим за корнем `fiber tree`.

```javascript

function workLoop(deadline) {
 // ...
​
 if (!nextUnitOfWork && workingRoot) {
   requestAnimationFrame(commitRoot)
 }
​
 // ...
}
```

После выполнения всей работы (это определяется по отсутствию следующей единицы работы) мы фиксируем (commit) `fiber tree`, т.е. добавляем его в `DOM` (рендерим).

О том, почему мы используем здесь `requestAnimationFrame` описывается в материалах, посвященным `requestIdleCallback`, по приведенным выше ссылкам. [Отличное объяснение разницы между `rAF` и `rIC` на `Stack Overflow`](https://stackoverflow.com/questions/41740082/scroll-events-requestanimationframe-vs-requestidlecallback-vs-passive-event-lis).

```javascript
function commitRoot() {
 commitWork(workingRoot.child)
 workingRoot = null
}
​
function commitWork(fiber) {
 if (!fiber) {
   return
 }

 const parentNode = fiber.parent.node
 parentNode.append(fiber.node)

 commitWork(fiber.child)
 commitWork(fiber.sibling)
}
```

Мы делаем это в функции `commitRoot`. Здесь мы рекурсивно добавляем все узлы в `DOM`.

## Согласование (Reconcilation)

До сих пор мы только добавляли узлы в `DOM`. Но что насчет их обновления или удаления?

Этим мы сейчас и займемся. Нам необходимо сравнивать элементы, полученные функцией `render` с последним `fiber tree`, которое мы зафиксировали в `DOM`.

```javascript
function commitRoot() {
 commitWork(workingRoot.child)
 // !
 currentRoot = workingRoot
 workingRoot = null
}

function render(element, container) {
 workingRoot = {
   dom: container,
   props: {
     children: [element],
   },
   // !
   alternate: currentRoot,
 }
 nextUnitOfWork = workingRoot
}

let nextUnitOfWork = null
// !
let currentRoot = null
let workingRoot = null
```

Нам нужно сохранять ссылку на последнее `fiber tree` после фиксации результатов. Назовем ее `currentRoot`.

Мы также добавляем каждому волокну свойство `alternate`. Данное свойство - это ссылка на старое волокно, волокно, зафиксированное в `DOM` на предыдущей стадии рендеринга.

```javascript
function performUnitOfWork(fiber) {
 // ...
​
 const elements = fiber.props.children
 // !
 reconcileChildren(fiber, elements)
​
 if (fiber.child) {
   return fiber.child
 }
 // ...
}

function reconcileChildren(workingFiber, elements) {
 let index = 0
 let prevSibling = null
​
 while (index < elements.length) {
   const element = elements[index]
​
   const newFiber = {
     type: element.type,
     props: element.props,
     parent: workingFiber,
     node: null,
   }
​
   if (index === 0) {
     workingFiber.child = newFiber
   } else {
     prevSibling.sibling = newFiber
   }
​
   prevSibling = newFiber
   index++
 }
}
```

Извлекаем код для создания новых волокон из `performUnitOfWork` в новую функцию `reconcileChildren`.

Здесь мы будем сравнивать старые волокна с новыми элементами.

```javascript
function reconcileChildren(workingFiber, elements) {
 let index = 0
 let oldFiber =
   workingFiber.alternate && workingFiber.alternate.child
 let prevSibling = null
​
 while (
   index < elements.length ||
   oldFiber !== null
 ) {
   // TODO
 }
}
```

Мы одновременно перебираем потомков старого волокна (`workingFiber.alternate`) и массив новых элементов для сравнения.

Если мы опустим код для одновременной итерации по массиву и связному списку, то у нас останется 2 вещи: `oldFiber` и `element`. `element` - это то, что мы хотим отрендерить в `DOM`, а `oldFiber` - это то, что рендерилось в последний раз.

Нам необходимо их сравнить для определения изменений, которые нужно применить к `DOM`.

```javascript
const element = elements[index]
let newFiber = null

const sameType =
 oldFiber &&
 element &&
 element.type == oldFiber.type
​
if (sameType) {
 // TODO обновляем узел
}
if (element && !sameType) {
 // TODO добавляем узел
}
if (oldFiber && !sameType) {
 // TODO удаляем узел
}

if (oldFiber) {
 oldFiber = oldFiber.sibling
}
```

Для их сравнения мы используем тип:

- если старое волокно и новый элемент имеют одинаковый тип, мы сохраняет узел и только обновляем его новыми пропами
- если типы разные и имеется новый элемент, мы создаем новый узел
- если типы разные и имеется старое волонко, мы удаляем узел

Здесь `React` также использует ключи (keys) в целях лучшего согласования. Например, с помощью ключей определяется изменение порядка элементов в списке.

```javascript
if (sameType) {
 newFiber = {
   type: oldFiber.type,
   props: element.props,
   node: oldFiber.node,
   parent: workingFiber,
   alternate: oldFiber,
   action: "UPDATE",
 }
}
```

Когда старое волокно и новый элемент имеют одинаковый тип, мы создаем новое волокно, сохраняя узел из старого волокна и добавляя пропы из нового элемента.

Мы также добавляем в волокно новое свойство `action` (в `React` используется название `effectTag`). Это свойство будет использоваться на стадии фиксации.

```javascript
if (element && !sameType) {
 newFiber = {
   type: element.type,
   props: element.props,
   node: null,
   parent: workingFiber,
   alternate: null,
   action: "ADD",
 }
}
```

Индикатором необходимости создания нового узла является `action: "ADD"`.

```javascript
if (oldFiber && !sameType) {
 oldFiber.action = "REMOVE"
 nodesToRemove.push(oldFiber)
}
```

В случае, когда нужно удалить старый узел, нового волокна у нас нет, поэтому мы добавляем свойство `action` к старому волокну.

Но когда мы фиксируем `fiber tree` в `DOM`, мы делаем это с помощью (из) `workingRoot`, которое не имеет старых волокон.

```javascript
function render(element, container) {
 workingRoot = {
   dom: container,
   props: {
     children: [element],
   },
   alternate: currentRoot,
 }
 // !
 nodesToRemove = []
 nextUnitOfWork = workingRoot
}
​
let nextUnitOfWork = null
let currentRoot = null
let workingRoot = null
// !
let nodesToRemove = null
```

Поэтому нам нужен массив для узлов, подлежащих удалению.

```javascript
function commitRoot() {
 // !
 nodesToRemove.forEach(commitWork)
 commitWork(workingRoot.child)
 currentRoot = workingRoot
 workingRoot = null
}
```

Мы используем этот массив при фиксации результатов.

В функции `commitWork` заменяем `parentNode.append(fiber.node)` на следующее:

```javascript
switch (fiber.action) {
 case 'ADD':
   fiber.node && parentNode.append(fiber.node)
   break
 case 'REMOVE':
   fiber.node.remove()
   break
 case 'UPDATE':
   fiber.node && updateNode(fiber.node, fiber.alternate.props, fiber.props)
   break
 default:
   return
}
```

Если `fiber.action` имеет значение `ADD`, мы помещаем новый узел в родительский узел. Если `fiber.action` имеет значение `REMOVE`, мы удаляем узел. Если `fiber.action` имеет значение `UPDATE`, мы обновляем узел новыми пропами.

```javascript
function updateNode(node, prevProps, nextProps) {
 // TODO
}
```

Это происходит в функции `updateNode`.

```javascript
const isProperty = key => key !== "children"
const wasAdded = (prev, next) => key =>
 prev[key] !== next[key]
const wasRemoved = (prev, next) => key => !(key in next)

function updateNode(node, prevProps, nextProps) {
 // удаляем старые свойства
 Object.keys(prevProps)
   .filter(isProperty)
   .filter(wasRemoved(prevProps, nextProps))
   .forEach(key => {
     dom[key] = ""
   })
​
 // добавляем новые или изменившиеся свойства
 Object.keys(nextProps)
   .filter(isProperty)
   .filter(wasAdded(prevProps, nextProps))
   .forEach(key => {
     dom[key] = nextProps[key]
   })
}
```

Мы сравниваем пропы старого и нового волокон, удаляем отсутствующие пропы и добавляем новые или изменившиеся пропы.

```javascript
const isEvent = key => key.startsWith("on")
const isProperty = key =>
 key !== "children" && !isEvent(key)
```

Одним из особых пропов являются обработчики событий (event listeners). Поэтому, если название пропа начинается с `on`, такой проп следует обрабатывать отдельно.

```javascript
Object.keys(prevProps)
 .filter(isEvent)
 .filter(
   key =>
     !(key in nextProps) ||
     wasAdded(prevProps, nextProps)(key)
 )
 .forEach(key => {
   const eventType = key
     .toLowerCase()
     .substring(2) // onClick -> click

   node.removeEventListener(
     eventType,
     prevProps[key]
   )
 })
```

Если обработчик отсутствует или изменился, его нужно удалить.

```javascript
Object.keys(nextProps)
 .filter(isEvent)
 .filter(wasAdded(prevProps, nextProps))
 .forEach(key => {
   const eventType = key
     .toLowerCase()
     .substring(2)

   node.addEventListener(
     eventType,
     nextProps[key]
   )
 })
```

Затем мы добавляем новые обработчики.

## Функциональные компоненты (Functional Components)

```javascript
/** @jsx MyReact.createElement */
function App(props) {
 return (
   <section id="welcome">
     <h1 title="hello" className="title">Hello from {props.who}!</h1>
     <p style="color: green;"><span>React</span> from {props.what}</p>
   </section>
 )
}
const element = <App who="MyReact" what="scratch" />
const container = document.getElementById("root")
MyReact.render(element, container)
```

Добавим поддержку функциональных компонентов.

Если мы трансформируем строку `const element = <App who="MyReact" what="scratch" />` в `JS`, то получим следующее:

```javascript
const element = MyReact.createElement(App, {
 who: "MyReact",
 what: "scratch"
})
```

Функциональные компоненты отличаются от обычных элементов следующим:

- волокно функционального компонента не имеет узла
- дочерние элементы являются результатом вызова функции

```javascript
function performUnitOfWork(fiber) {
 // !
 const isFunctionComponent =
   fiber.type instanceof Function

 if (isFunctionComponent) {
   updateFunctionComponent(fiber)
 } else {
   updateHostComponent(fiber)
 }

 // ...
}
​
function updateFunctionComponent(fiber) {
 // TODO
}
​
function updateHostComponent(fiber) {
 if (!fiber.dom) {
   fiber.dom = createDom(fiber)
 }

 reconcileChildren(fiber, fiber.props.children)
}
```

Мы проверяем, является ли тип волокна функцией, и на основе этой проверки запускам соответствующую функцию.

В функции `updateHostComponent` мы делаем тоже самое, что и раньше.

```javascript
export function updateFunctionComponent(fiber) {
 const children = [fiber.type(fiber.props)]
 reconcileChildren(fiber, children)
}
```

А в `updateFunctionalComponent` мы запускаем переданную функцию для получения дочерних элементов.

В нашем случае `fiber.type` - это функция `App`, выполнение которой возвращает элемент `section` с потомками.

Логика согласования потомков остается прежней, нам не нужно ничего в ней изменять.

Однако, поскольку у нас появилось волокно без узлов, нам нужно поменять 2 вещи в функции `commitWork`.

```javascript
let parentFiber = fiber.parent
while (!parentFiber.node) {
 parentFiber = parentFiber.parent
}
const parentNode = parentFiber.node
```

Во-первых, для того, чтобы найти предка текущего узла мы поднимаемся вверх по `fiber tree` до тех пор, пока не обнаружим волокно с узлом.

```javascript
case 'REMOVE':
 return commitRemove(fiber)

function commitRemove(fiber) {
 if (fiber.node) {
   return fiber.node.remove()
 }
 commitRemove(fiber.child)
}
```

А при удалении узла мы двигаемся вниз, пока не найден потомка с узлом. Кроме того, поскольку удаление элемента делегируется `commitRemove`, мы не должны запускать `commitWork` для старых узлов.

## Хуки (Hooks)

Последнее, что нам осталось сделать, это добавить в функциональные компоненты состояние.

```javascript
/** @jsx MyReact.createElement */
function Counter() {
 const [state, setState] = MyReact.useState(1)

 return (
   <h1 onClick={() => setState(c => c + 1)}>
     Count: { state }
   </h1>
 )
}
const container = document.getElementById("root")
MyReact.render(<Counter />, container)
```

Здесь у нас имеется простой компонент счетчика. При клике по заголовку значение счетчика увеличивается на 1.

_Обратите внимание_, что мы используем `MyReact.useState` для получения и обновления значения счетчика.

```javascript
// Функция принимает начальное состояние
function useState(initialState) {
 // TODO
}
```

Мы вызываем функцию `Counter`, внутри которой вызывается функция `useState`.

```javascript
// !
let workingFiber = null
let hookIndex = null
​
function updateFunctionComponent(fiber) {
 // !
 workingFiber = fiber
 hookIndex = 0
 workingFiber.hooks = []
 // end !
 const children = [fiber.type(fiber.props)]
 reconcileChildren(fiber, children)
}
```

Нам необходимо инициализировать некоторые глобальные переменные для хранения информации о хуках.

Сначала мы определяем рабочее волокно (`workingFiber`).

Затем мы добавляем массив `hooks` в волокно для того, чтобы иметь возможность вызывать `useState` несколько раз в одном компоненте. Также мы фиксируем индекс текущего хука.

```javascript
function useState(initialState) {
 const oldHook =
   workingFiber.alternate &&
   workingFiber.alternate.hooks &&
   workingFiber.alternate.hooks[hookIndex]

 const hook = {
   state: oldHook ? oldHook.state : initialState,
 }
​
 workingFiber.hooks.push(hook)
 hookIndex++

 return [hook.state]
}
```

При вызове `useState` мы проверяем, имеется ли у нас старый хук. Для этого мы заглядываем в свойство `alternate` волокна, используя индекс хука.

Если старый хук есть, мы копируем его состояние в новый хук, иначе инициализируем состояние начальным значением (в данном случае примитивом).

Затем мы добавляем новый хук в волокно, увеличиваем значение индекса на 1 и возвращаем состояние.

```javascript
const hook = {
   state: oldHook ? oldHook.state : initialState,
   // !
   queue: [],
 }
​
// !
const setState = action => {
 hook.queue.push(action)

 workingRoot = {
   node: currentRoot.node,
   props: currentRoot.props,
   alternate: currentRoot,
 }

 nextUnitOfWork = workingRoot
 nodesToRemove = []
}
​
workingFiber.hooks.push(hook)
hookIndex++

// !
return [hook.state, setState]
```

`useState` также должна возвращать функцию для обновления состояния, поэтому мы определяем функцию `setState`, принимающую операцию (в `Counter` операция - это функция, которая увеличивает значение счетчика на 1).

Мы помещаем эту операцию в очередь (`queue`) хука.

Затем мы повторяем логику функции `render`: новый `workingRoot` становится следующей единицей работы, что приводит к запуску новой стадии рендеринга.

```javascript
const hook = {
 state: oldHook ? oldHook.state : initial,
 queue: [],
}
​
// !
const actions = oldHook ? oldHook.queue : []
actions.forEach(action => {
 hook.state = action(hook.state)
})
```

Операции выполняются при следующем рендеринге компонента. Мы получаем все операции из очереди старого хука и применяем их по одной к состоянию хука. После этого мы возвращаем обновленное состояние.

Пожалуй, на этом мы остановимся. Теперь вы знаете, с чего начать разработку собственной версии `React`.

Но прежде, чем мы закончим, внесем еще несколько мелких правок.

- `initialState` может быть функцией:

```javascript
// useState
const hook = {
 state: oldHook
   ? oldHook.state
   // !
   : initialState instanceof Function
   ? initialState()
   : initialState,
 queue: []
}
```

- `action` может быть примитивом:

```javascript
// useState
actions.forEach((action) => {
 // !
 hook.state = action instanceof Function ? action(hook.state) : action
})
```

- значением пропа `style` может быть объект:

```javascript
// updateNode
Object.keys(nextProps)
 .filter(isProperty)
 .filter(wasAdded(prevProps, nextProps))
 .forEach((key) => {
   // !
   if (key === 'style' && typeof nextProps[key] === 'object') {
     Object.assign(node.style, nextProps[key])
   } else {
     node[key] = nextProps[key]
   }
 })
```

- `children` может содержать массив:

```javascript
// createElement
children: children
 .flat()
 .map((child) =>
   typeof child === 'object' ? child : createTextElement(child)
 )
```

## Запуск проекта с помощью `Snowpack`

Весь код `MyReact` содержится в одном файле. Это не очень удобно. Но если попытаться разделить код на модули, то начнутся проблемы. Сначала мы получим ошибку, связанную с тем, что инструкция `import` может использоваться только в модулях. Затем исключения начнет выбрасывать `Babel`, потому что он не понимает синтаксис модулей - для этого ему требуется специальный плагин. Подключить плагин к `Babel` с помощью одного только `babel.config.json` не получится. Здесь нужна помощь сборщика (бандлера).

Когда речь заходит о сборщиках, я, обычно, использую [`Webpack`](https://webpack.js.org/). Но недавно на Хабре вышло 2 хорошие статьи, в которых создатель `snowpack` делится своим опытом разработки открытого проекта. Поэтому я решил использовать этот "сборщик для сборщиков".

Структура проекта:

<img src="https://habrastorage.org/webt/yf/n-/vu/yfn-vu2k1i_aepnbvr6yvhvtfqm.png" />
<br />
Инициализируем проект, находясь в корневой директории:

```bash
yarn init -yp
```

Устанавливаем `snowpack`, 2 плагина для него и еще один для `babel`:

```bash
yarn add -D snowpack @snowpack/plugin-babel @snowpack/plugin-sass @babel/preset-react
```

Настраиваем `snowpack` (`snowpack.config.json`):

```javascripton
{
 "plugins": [
   "@snowpack/plugin-babel",
   "@snowpack/plugin-sass"
 ]
}
```

Настраиваем `babel` (`babel.config.json`):

```javascripton
{
 "presets": [
   "@babel/preset-react"
 ]
}
```

Определяем команду для запуска `snowpack` в `package.json`:

```javascripton
"scripts": {
 "start": "snowpack dev"
}
```

Запускаем проект в режиме для разработки:

```bash
yarn start
```

Красота:

<img src="https://habrastorage.org/webt/gp/5l/id/gp5lidri_i8c94x05m2fsejuyqq.png" />
<br />

Полезные ссылки для тех, кому, как и мне, всегда мало:

- [`React`](https://github.com/facebook/react/tree/main/packages/react) - исходный код `React`
- [`JSX Runtime`](https://github.com/DAB0mB/jsx-runtime) - попытка реализовать парсинг `JSX` с помощью [`tagged template literals`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Template_literals)
- [`Fre`](https://github.com/yisar/fre) - более продвинутое согласование, в том числе, с использованием ключей
- [`@dbarone/didact`](https://github.com/davidbarone/didact) - реализация фрагментов и хуков `useEffect`, `useMemo` и `useCallback`

The End.
