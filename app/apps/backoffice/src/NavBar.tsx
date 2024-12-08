import LoginModal from "./pages/LoginModal";
import useLoginDialog from "./hooks/useLoginDialog";
import { Link } from "react-router-dom";
import { logOut } from "./firebase/auth";
import { useSelector } from "react-redux";
import LinkButton from "./components/LinkButton";
import { selectUser } from "./redux/selectors/user";

export default function NavBar() {
  const { handleLoginOpen } = useLoginDialog();

  const user = useSelector(selectUser);

  return (
    <>
      <LoginModal />
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex px-2 lg:px-0">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/">
                <img className="block h-8 w-auto lg:hidden" src="/logo_icon.png" alt="Pabolo" />
                <img className="hidden h-8 w-auto lg:block" src="/logo_horiz_bw.jpg" alt="Pabolo" />
              </Link>
            </div>
          </div>
          <div className="ml-4 flex items-center">
            <div className="flex flex-row justify-center items-center gap-5">
              {user.loggedIn && (
                <>
                  <LinkButton to="/moderation" name="Moderation" />
                  <LinkButton to="/users" name="Users" />
                  <LinkButton to="/reports" name="Reports" />
                </>
              )}

              {!user.loggedIn ? (
                <button
                  type="button"
                  className="inline-flex m-4 ml-16 items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => {
                    handleLoginOpen(true);
                  }}
                >
                  Login
                </button>
              ) : (
                <div className="flex flex-row items-center justify-center">
                  <p className="ml-16">{user.email?.split("@")[0]}</p>
                  <button
                    type="button"
                    className="inline-flex m-4  items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      void logOut();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
