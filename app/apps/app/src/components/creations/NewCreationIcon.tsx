import { VideoCameraIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

export default function NewCreationIcon() {
  return (
    <li>
      <div className="relative group rounded-lg overflow-hidden border-2 border-dashed border-slate-300">
        <Link to="/create/new" id="new-creation" className="relative">
          <div className="aspect-w-12 aspect-h-7 bg-gradient-to-b from-slate-300 to-slate-50 group-hover:from-slate-400 group-hover:to-slate-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <div className="inline-flex flex-col justify-center items-center gap-1 rounded-md bg-opacity-70">
              <VideoCameraIcon className="w-10 h-10 text-slate-400 group-hover:text-slate-500" />
              <div className="font-bold bg-gradient-to-t from-slate-400 to-slate-600 bg-clip-text text-transparent group-hover:from-slate-500 group-hover:to-slate-700">
                New Creation
              </div>
            </div>
          </div>
        </Link>
      </div>
    </li>
  );
}
