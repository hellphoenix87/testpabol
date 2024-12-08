import PageContainer from "./pageContainer";
import { Link } from "react-router-dom";

export default function Legal() {
  return (
    <PageContainer
      className="p-4"
      footer
      metaTags={{
        title: "Legal",
      }}
    >
      <div className="min-h-full bg-white py-16 px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <div className="bg-white px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Legal</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Use the links below to access our legal documents. If you have any questions, please contact us at{" "}
                <a className="font-semibold" href="mailto:legal@pabolo.ai">
                  legal@pabolo.ai
                </a>
                .
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 mt-16 text-center">
            <Link to="/imprint">Imprint</Link>
            <Link to="/termsofuse">Terms of Use</Link>
            <Link to="/privacypolicy">Privacy Policy</Link>
            <a href="/legal/withdrawal.pdf" target="_blank">
              Withdrawal Form
            </a>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
