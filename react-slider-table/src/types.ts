import type Swiper from "swiper";

export type Feature = {
  id: number;
  value: string;
};

export type Item = {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  features: Feature[];
};

export type Items = Item[];

export type TSwiper = Swiper & {
  slides: {
    swiperSlideSize: number;
  }[];
  slidesGrid: number[];
};
