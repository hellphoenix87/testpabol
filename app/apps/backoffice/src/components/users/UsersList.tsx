import { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { Table } from "../Table";
import LinkButton from "../LinkButton";
import { callBackofficeMicroservice, backofficeFirebaseMethods } from "../../utils/callFirebaseMicroservice";
import { timeSince } from "@frontend/timeConverter";
import { Filters } from "@backoffice/interfaces/Filters";

interface UsersListProps {
  filters: Filters;
  reloadTrigger: number;
}

export default function UsersList({ reloadTrigger, filters }: UsersListProps) {
  const [bodyList, setBodyList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const result = await callBackofficeMicroservice(backofficeFirebaseMethods.GET_USERS, { ...filters });
      const bodyList = result.data.map(user => ({
        joined: `Joined ${timeSince(user?.created_at?._seconds)}`,
        name: user.display_name,
        email: user.email,
        uid: user.uid,
        visit: <LinkButton to={`/user/${user.uid}`} name="View User" />,
      }));

      setBodyList(bodyList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [reloadTrigger]);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : bodyList.length === 0 ? (
        <h1>No users found</h1>
      ) : (
        <Table headList={["joined", "name", "email", "uid", "visit"]} bodyList={bodyList} />
      )}
    </>
  );
}
