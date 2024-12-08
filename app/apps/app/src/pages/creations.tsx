import PageContainer from "./pageContainer";
import CreationsList from "../components/creations/CreationsList";
import MyMovies from "../components/account/MyMovies";

export default function CreationsPage() {
  return (
    <PageContainer className="px-4 py-8" footer metaTags={{ norobots: true }}>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">My Creations</h1>
      </div>
      <div className="mt-6">
        <CreationsList />
      </div>

      <div className="flex justify-between mt-3">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">My Published Movies</h1>
      </div>
      <div className="mt-6 mb-28">
        <MyMovies />
      </div>
    </PageContainer>
  );
}
