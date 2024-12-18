import PageContainer from "./PageContainer";

export default function NotFound() {
  return (
    <PageContainer className="p-4">
      <div className="min-h-full py-16 px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <main className="sm:flex">
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</h1>
                <p className="mt-1 text-base text-gray-500">Please check the URL in the address bar and try again.</p>
                <p className="mt-1 text-base text-gray-500">Or login to the site.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
