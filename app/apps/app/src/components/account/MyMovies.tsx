import SortTypes from "@app/constants/SortTypes";
import VideoList from "../VideoList";
import VideoSortFilter from "@app/sortFilter";

function EmptyMyMovies() {
  return (
    <div className="bg-white shadow sm:rounded-lg max-w-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mt-2 text-sm text-gray-500 text-center">
          <p>Click above &#8593; to shoot your first movie!</p>
        </div>
      </div>
    </div>
  );
}

export default function MyMovies() {
  return (
    <div className="flex flex-col gap-2">
      <VideoSortFilter />
      <VideoList EmptyListView={EmptyMyMovies} defaultSortType={SortTypes.NEWEST} showTag showOptions forUser />
    </div>
  );
}
