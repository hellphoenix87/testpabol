import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

export function AlertBanner() {
  return (
    <div className="rounded-md bg-yellow-50 p-4 mt-5">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Important notice</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              - Your movie will be reviewed to comply with our terms of use and published exclusively on our platform
              within 24 hours.
            </p>
            <p>- You cannot edit your movie once it is generated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
