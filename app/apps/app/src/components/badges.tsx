import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { genreList } from "@frontend/listData";
import { Tag } from "@frontend/Tag";
import { addFilterSelectedGenre, removeFilterSelectedGenre, resetStore } from "@app/redux/slices/utilsSlice";
import { classNames } from "@frontend/utils/classNames";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { selectUtils } from "@app/redux/selectors/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function Badges() {
  const [reachedEnd, setReachedEnd] = useState(false);
  const [reachedBeginning, setReachedBeginning] = useState(true);

  const { filter } = useSelector(selectUtils);
  const dispatch = useDispatch();

  const addSelectedGenre = genre => {
    dispatch(addFilterSelectedGenre(genre));
  };

  const removeSelectedGenre = () => {
    dispatch(removeFilterSelectedGenre());
  };

  const toggleSelectedGenre = genre => {
    if (filter.selectedGenre === genre) {
      removeSelectedGenre();
    } else {
      addSelectedGenre(genre);
    }
  };

  const handleSliderMove = swiper => {
    if (swiper.isBeginning) {
      setReachedBeginning(true);
    } else if (swiper.isEnd) {
      setReachedEnd(true);
    } else {
      setReachedBeginning(false);
      setReachedEnd(false);
    }
  };

  // Reset filters when unmounting the component
  useEffect(() => {
    return () => {
      dispatch(resetStore());
    };
  }, []);

  // Show all badges in a single row. If horizontal space is too small, hide the overflow, without a scrollbar.
  return (
    <div className="relative flex flex-row justify-center items-center overflow-x-clip overflow-y-visible">
      <div
        className={classNames(
          "w-16 hidden absolute left-0 z-10 transition-all ease-in-out duration-300 bg-gradient-to-r from-white from-10% via-white",
          !reachedBeginning && "md:inline-block"
        )}
      >
        <button
          id="swiper-button-prev"
          className="flex justify-center items-center w-8 h-8 hover:border rounded-full text-black-75 bg-white border-black-35 mr-auto"
        >
          <ChevronLeftIcon width="14" height="14" />
        </button>
      </div>
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={20}
        grabCursor={window.innerWidth < 1530}
        navigation={{
          prevEl: "#swiper-button-prev",
          nextEl: "#swiper-button-next",
        }}
        modules={[Navigation, A11y]}
        className="rounded-full overflow-y-visible"
        onSlideChange={handleSliderMove}
        onSliderMove={handleSliderMove}
        onTouchMove={handleSliderMove}
        onReachEnd={() => setReachedEnd(true)}
      >
        {genreList.map((name, index) => (
          <SwiperSlide key={index}>
            <div onClick={() => toggleSelectedGenre(index)}>
              <Tag selected={filter.selectedGenre === index} text={name} clickable={true} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className={classNames(
          "w-16 hidden absolute right-0 z-10 transition-all ease-in-out duration-300 bg-gradient-to-l from-white from-10% via-white",
          !reachedEnd && "md:inline-block"
        )}
      >
        <button
          id="swiper-button-next"
          className="flex justify-center items-center w-8 h-8 hover:border rounded-full text-black-75 bg-white border-black-35 ml-auto"
        >
          <ChevronRightIcon width="14" height="14" />
        </button>
      </div>
    </div>
  );
}
