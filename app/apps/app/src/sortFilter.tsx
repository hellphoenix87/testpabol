import { Fragment, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/20/solid";
import { classNames } from "@frontend/utils/classNames";
import SortTypes from "./constants/SortTypes";
import { useDispatch, useSelector } from "react-redux";
import { setSortType } from "./redux/slices/utilsSlice";
import { selectUtils } from "./redux/selectors/utils";

const sortOptions = [
  { name: "Relevance", sortType: SortTypes.RELEVANCE },
  { name: "Most Views", sortType: SortTypes.MOST_VIEWS },
  { name: "Best Ratings", sortType: SortTypes.BEST_RATINGS },
  { name: "Newest", sortType: SortTypes.NEWEST },
];

export default function VideoSortFilter() {
  const { filter } = useSelector(selectUtils);
  const dispatch = useDispatch();

  const selectSortType = (sortType: SortTypes): void => {
    dispatch(setSortType(sortType));
  };

  // Reset the sort type to default value when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(setSortType(SortTypes.RELEVANCE));
    };
  }, []);

  return (
    <Menu as="div" className="flex relative text-left h-full">
      <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
        <AdjustmentsHorizontalIcon
          className="h-5 w-5 mr-1 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
        Sort
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-6 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
          {sortOptions.map((option, index) => (
            <Menu.Item key={index}>
              {() => (
                <div
                  className={classNames(
                    filter.sortType === option.sortType ? "bg-gray-300" : "",
                    "block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 cursor-pointer"
                  )}
                  onClick={() => selectSortType(option.sortType)}
                >
                  {option.name}
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
