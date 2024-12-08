export default function VideoInfoSkeleton() {
  return (
    <div className="px-4 pb-8 animate-pulse">
      <div className="mt-5 w-32 h-8 bg-gray-200 rounded-md aspect-video" />
      <div className="flex flex-row gap-4 justify-between">
        <div className="group block flex-shrink-0 mt-3">
          <div className="flex items-center">
            <div className="inline-block h-9 w-9 rounded-full bg-gray-200" />
            <div className="ml-3 flex flex-col gap-1">
              <div className="w-28 h-3 bg-gray-200" />
              <div className="w-28 h-3 bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="flex items-center mr-6">
          <div className="w-28 h-8 bg-gray-200 rounded-md" />
        </div>
      </div>
      <div className="mx-auto w-full mb-6 px-2 sm:px-4 lg:px-6 bg-slate-100 rounded mt-4 py-3 shadow-md">
        <div className="mb-3 w-full h-28" />
      </div>
    </div>
  );
}
