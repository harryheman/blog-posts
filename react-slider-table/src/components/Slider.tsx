import { useEffect, useRef } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Items, TSwiper } from "../types";

type Props = {
  items: Items;
  setSlideWidth: React.Dispatch<React.SetStateAction<number>>;
  setScrollLeft: React.Dispatch<React.SetStateAction<number>>;
  offsetX: number;
};

const SLIDES_PER_VIEW = 3;

function Slider({ items, setSlideWidth, setScrollLeft, offsetX }: Props) {
  const swiperRef = useRef<TSwiper>();
  const slidesGrid = useRef<number[]>([]);

  const onImagesReady = () => {
    if (!swiperRef.current) return;

    const slideWidth = swiperRef.current.slides[0].swiperSlideSize;

    slidesGrid.current = swiperRef.current.slidesGrid;

    setSlideWidth(slideWidth);
  };

  const onSlideChange = () => {
    if (!swiperRef.current) return;

    const scrollLeft = Math.abs(swiperRef.current.translate);
    setScrollLeft(scrollLeft);
  };

  useEffect(() => {
    if (!swiperRef.current) return;

    let min = 0;
    let i = 0;

    for (const j in slidesGrid.current) {
      const dif = Math.abs(slidesGrid.current[j] - offsetX);

      if (dif === 0) {
        min = 0;
        i = 0;
        break;
      }

      if (dif !== 0 && (min === 0 || dif < min)) {
        min = dif;
        i = Number(j);
      }
    }

    if (items[i]) {
      swiperRef.current.slideTo(i);
    }
  }, [offsetX]);

  return (
    <Swiper
      onSwiper={(swiper) => {
        console.log(swiper);

        swiperRef.current = swiper as TSwiper;
      }}
      modules={[Navigation, Pagination]}
      navigation={SLIDES_PER_VIEW < items.length}
      onImagesReady={onImagesReady}
      onSlideChange={onSlideChange}
      pagination={
        SLIDES_PER_VIEW < items.length
          ? {
              clickable: true,
            }
          : undefined
      }
      slidesPerView={SLIDES_PER_VIEW}
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <img src={item.imageUrl} alt={item.title} />
          <div>
            <h2>{item.title}</h2>
            <p>{item.price} ₽</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Slider;
