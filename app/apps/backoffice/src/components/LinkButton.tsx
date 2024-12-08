import { Link } from "react-router-dom";

interface LinkButtonProps {
  to: string;
  name: string;
}

export default function LinkButton({ to, name }: LinkButtonProps) {
  return (
    <Link to={to}>
      <button
        type="button"
        className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm
        font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500
        focus:ring-offset-2`}
      >
        {name}
      </button>
    </Link>
  );
}
