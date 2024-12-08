import { useParams } from "react-router-dom";

import VideoList from "../components/VideoList";

import PageContainer from "./pageContainer";
import VideoSortFilter from "../sortFilter";

export default function Search() {
  const { query } = useParams();

  return (
    <PageContainer className="p-4" searchInitialContent={query} metaTags={{ norobots: true }}>
      <div className="flex justify-between">
        <VideoSortFilter />
      </div>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center " aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <VideoList />
    </PageContainer>
  );
}
