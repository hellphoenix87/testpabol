import { useState, useEffect } from "react";
import PageContainer from "./pageContainer";
import { Cog6ToothIcon, UserIcon } from "@heroicons/react/20/solid";
import { TabBar } from "../components/TabBar";
import { Profile } from "../components/account/Profile";
import { Settings } from "../components/account/Settings";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@app/redux/selectors/user";

const tabs = [
  { name: "Profile", href: "/account/profile", icon: UserIcon },
  { name: "Settings", href: "/account/settings", icon: Cog6ToothIcon },
];

export default function Account() {
  const [currentTab, setCurrentTab] = useState(0);

  const user = useSelector(selectUser);

  const { tabId } = useParams();

  useEffect(() => {
    if (!tabId) {
      setCurrentTab(0);
      return;
    }
    setCurrentTab(parseInt(tabId, 10));
  }, [tabId]);

  function DrawTab() {
    switch (currentTab) {
      case 0:
        return <Profile />;
      case 1:
        return <Settings />;
      default:
        return <Profile />;
    }
  }

  return (
    <PageContainer className="px-4 py-8" footer metaTags={{ norobots: true }}>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">My Account</h1>
        <Link to={`/channel/${user.uid}`}>
          <div className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Visit Public Profile
          </div>
        </Link>
      </div>
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} tabs={tabs} />
      {DrawTab()}
    </PageContainer>
  );
}
