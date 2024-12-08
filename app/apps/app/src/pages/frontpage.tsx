import React from "react";
import useVideoNumFromWidth from "../hooks/useVideoNumFromWidth";
import VideoList from "../components/VideoList";
import Badges from "../components/badges";
import PageContainer from "./pageContainer";
import Cta from "../cta";
import VideoSortFilter from "../sortFilter";
import Breakpoints from "../constants/Breakpoints";
import { useSelector } from "react-redux";
import SortTypes from "@app/constants/SortTypes";

interface Breakpoint {
  width: number;
  videoNum: number;
}

const FrontPage: React.FC = () => {
  const { loggedIn, is_creator: isCreator } = useSelector(
    (store: { user: { loggedIn: boolean; is_creator: boolean } }) => store.user
  );

  const videosAboveBadge = useVideoNumFromWidth({
    defaultVideoNum: 10,
    breakpoints: [
      { width: Breakpoints.SM, videoNum: 1 },
      { width: Breakpoints.MD, videoNum: 2 },
      { width: Breakpoints.LG, videoNum: 4 },
      { width: Breakpoints.XL, videoNum: 6 },
      { width: Breakpoints.XXL, videoNum: 8 },
    ] as Breakpoint[],
  });

  const isUserCreator: boolean = loggedIn && isCreator;
  const buttonText: string = isUserCreator ? "Start creating" : "Join the waitlist";
  const buttonLink: string = isUserCreator
    ? "/creations"
    : "https://paramax.us21.list-manage.com/subscribe?u=c637707d84fed4c9b34510110&id=5b4104edd5";

  return (
    <PageContainer className="p-4">
      <div className="flex gap-4 items-center mb-3">
        <VideoSortFilter />
        <Badges />
      </div>
      <VideoList
        cta={{
          position: videosAboveBadge,
          element: <Cta buttontext={buttonText} buttonlink={buttonLink} />,
        }}
        defaultSortType={SortTypes.RELEVANCE}
      />
    </PageContainer>
  );
};

export default FrontPage;
