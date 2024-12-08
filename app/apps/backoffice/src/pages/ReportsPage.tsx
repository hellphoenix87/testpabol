import VideoReportsList from "@backoffice/components/reports/VideoReportsList";
import PageContainer from "./PageContainer";

export default function ReportsPage() {
  return (
    <PageContainer className="p-4">
      <div className="flex flex-col pb-5">
        <h1 className="font-bold text-center ">
          <span className="bg-indigo-900 rounded-xl p-3 text-indigo-100 mb-2">Reports</span>
        </h1>
      </div>
      <VideoReportsList />
    </PageContainer>
  );
}
