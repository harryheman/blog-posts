import './style.css'
import { useSelect } from 'downshift'

const toSnakeCase = (str) =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .join('_')

export const Selector = ({
  items,
  initialSelectedItem,
  onSelectedItemChange
}) => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps
  } = useSelect({
    items,
    initialSelectedItem,
    onSelectedItemChange
  })

  return (
    <div className={`selector ${isOpen ? 'open' : ''}`}>
      <label {...getLabelProps()}>Component to render</label>
      <button {...getToggleButtonProps()}>{toSnakeCase(selectedItem)}</button>
      <ul {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <li
              className={highlightedIndex === index ? 'selected' : ''}
              item={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {toSnakeCase(item)}
            </li>
          ))}
      </ul>
    </div>
  )
}
