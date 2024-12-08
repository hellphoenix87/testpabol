import { useEffect, useState } from "react";
import { Table } from "../Table";
import LoadingSpinner from "../LoadingSpinner";
import LinkButton from "../LinkButton";
import { callBackofficeMicroservice, backofficeFirebaseMethods } from "../../utils/callFirebaseMicroservice";
import { timeSince } from "@frontend/timeConverter";

export default function VideoReportsList(props) {
  const { videoId } = props;

  const [bodyList, setBodyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState<number>(1);

  const fetchVideoReports = async () => {
    setLoading(true);

    try {
      const result = await callBackofficeMicroservice(backofficeFirebaseMethods.GET_VIDEOS_REPORTS, { videoId });
      const bodyList = result.data.map(report => ({
        date: `Created ${timeSince(report.created_at._seconds)}`,
        title: report.video_title,
        author: report.author_name,
        description: report.description,
        visit: <LinkButton to={`/video/${report.video_id}`} name="View Video" />,
      }));
      setBodyList(bodyList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVideoReports();
  }, [reloadTrigger]);

  const renderReloadButton = () => (
    <button
      className="mb-2 mt-2 float-right inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => setReloadTrigger(reloadTrigger + 1)}
    >
      Reload
    </button>
  );

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : bodyList.length === 0 ? (
        <>
          {renderReloadButton()}
          <h1>No reports found</h1>
        </>
      ) : (
        <>
          {renderReloadButton()}
          <Table headList={["date", "title", "author", "description", !videoId ? "visit" : ""]} bodyList={bodyList} />
        </>
      )}
    </>
  );
}
