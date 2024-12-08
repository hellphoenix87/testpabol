import { Filters } from "@backoffice/interfaces/Filters";
import { AbortButton, PrimaryButton } from "@frontend/buttons";

interface UsersFiltersProps {
  filters: Filters;
  setFilters: any;
  applyFilters: () => void;
}

export default function UsersFilters({ filters, setFilters, applyFilters }: UsersFiltersProps) {
  const handleFilterChange = (e: any) => {
    setFilters(currentFilters => ({
      ...currentFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearFilters = () => setFilters({ email: "", displayName: "" });

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="mb-4 w-full">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="text"
          placeholder="Email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
        />
      </div>
      <div className="mb-4 w-full">
        <label className="block text-gray-700 text-sm font-bold mb-2">Display Name</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="display_name"
          type="text"
          placeholder="Display Name"
          name="displayName"
          value={filters.displayName}
          onChange={handleFilterChange}
        />
      </div>
      <div>
        <PrimaryButton className="w-32" onClick={applyFilters}>
          Apply Filters
        </PrimaryButton>
        <AbortButton className="w-32 ml-4" onClick={handleClearFilters}>
          Clear Filters
        </AbortButton>
      </div>
    </div>
  );
}
