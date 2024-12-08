import { useSelector } from "react-redux";
import { selectUser } from "@backoffice/redux/selectors/user";
import LinkButton from "@backoffice/components/LinkButton";
import PageContainer from "./PageContainer";

export default function FrontPage() {
  const user = useSelector(selectUser);

  return (
    <PageContainer className="p-4">
      <div className="flex flex-col">
        <h1 className="text-xl">Welcome to Pabolo backoffice</h1>
        <p>This application is only accessible by Pabolo team.</p>
      </div>

      {user.loggedIn ? (
        <div className="flex flex-row justify-start items-center gap-4 mt-4">
          <LinkButton to="/moderation" name="Moderation" />
          <LinkButton to="/users" name="Users" />
          <LinkButton to="/reports" name="Reports" />
        </div>
      ) : (
        <p className="text-lg">Please login to use this app.</p>
      )}
    </PageContainer>
  );
}
