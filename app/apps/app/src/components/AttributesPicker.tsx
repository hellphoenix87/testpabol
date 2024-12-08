export function AttributesPicker({ tagList, tagListUnset, onAddAttribute, onRemoveAttribute }) {
  return (
    <div className="divide-y-2 divide-gray-200 overflow-hidden rounded-lg bg-slate-50 shadow-inner mt-1">
      <div className="px-2 py-3 sm:px-4">
        {tagListUnset.length === 0 ? (
          <p className="text-sm text-gray-500">All attributes are selected.</p>
        ) : (
          tagListUnset.map((attribute, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-white hover:bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1 mb-1 shadow hover:cursor-pointer"
              onClick={() => onAddAttribute(attribute)}
            >
              {attribute}
            </span>
          ))
        )}
      </div>

      <div className="px-2 py-3 sm:p-4">
        {tagList.length === 0 ? (
          <p className="text-sm text-gray-500">Click to select attributes.</p>
        ) : (
          tagList.map((attribute, index) => (
            <span
              className="inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2 pr-0.5 text-xs font-medium text-indigo-700 mr-1 mb-1 shadow"
              key={index}
            >
              {attribute}

              <button
                type="button"
                className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none "
              >
                <span className="sr-only">Remove {attribute} option</span>
                <svg
                  className="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                  onClick={() => onRemoveAttribute(attribute)}
                >
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
