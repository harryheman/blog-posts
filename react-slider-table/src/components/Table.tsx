import React, { useCallback, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import { Items } from "../types";

type Props = {
  items: Items;
  slideWidth: number;
  scrollLeft: number;
  setOffsetX: React.Dispatch<React.SetStateAction<number>>;
};

const FEATURE_NAMES = [
  "Title",
  "Title2",
  "Title3",
  "Title4",
  "Title5",
  "Title6",
];

const ON_SCROLL_DELAY = 250;

function Table({ items, slideWidth, scrollLeft, setOffsetX }: Props) {
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    if (!tableWrapperRef.current) return;

    tableWrapperRef.current.scrollLeft = scrollLeft;
  }, [scrollLeft]);

  const onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    if (!tableRef.current) return;

    const { x } = tableRef.current.getBoundingClientRect();
    setOffsetX(Math.abs(x));
  }, []);

  const debouncedOnScroll = useDebounce(onScroll, ON_SCROLL_DELAY);

  return (
    <>
      <div
        className="table-wrapper"
        onScroll={debouncedOnScroll}
        ref={tableWrapperRef}
      >
        <table ref={tableRef}>
          <tbody>
            {items.map((item, i) => (
              <React.Fragment key={item.id}>
                <tr className="feature-name-row">
                  <td colSpan={items.length}>
                    <span className="feature-name">{FEATURE_NAMES[i]}</span>
                  </td>
                </tr>
                <tr className="feature-value-row">
                  {items.map((_, j) => {
                    const key = "" + i + j;
                    return <td key={key}>{items[j].features[i].value}</td>;
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .feature-name {
          left: ${scrollLeft}px;
        }
        .feature-value-row {
          display: grid;
          grid-template-columns: repeat(${items.length}, ${slideWidth}px);
        }
      `}</style>
    </>
  );
}

export default Table;
