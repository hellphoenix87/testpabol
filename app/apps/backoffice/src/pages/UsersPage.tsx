import { useState } from "react";
import UsersList from "@backoffice/components/users/UsersList";
import UsersFilters from "@backoffice/components/users/UsersFilters";
import PageContainer from "./PageContainer";

export default function UsersPage() {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [filters, setFilters] = useState({
    email: "",
    displayName: "",
  });

  const triggerReload = () => {
    setReloadTrigger(reloadTrigger + 1);
  };

  return (
    <PageContainer className="p-4">
      <div className="flex flex-col">
        <h1>Users List</h1>
      </div>

      <div className="flex flex-row space-x-4 m-6">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={triggerReload}
        >
          Reload Users
        </button>
      </div>

      <UsersFilters filters={filters} setFilters={setFilters} applyFilters={triggerReload} />
      <UsersList reloadTrigger={reloadTrigger} filters={filters} />
    </PageContainer>
  );
}
