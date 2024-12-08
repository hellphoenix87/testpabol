import PageContainer from "./pageContainer";
import { PrimaryButton } from "@frontend/buttons";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <PageContainer className="p-4" footer metaTags={{ title: "Contact" }}>
      <div className="overflow-hidden bg-white py-16 px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Us</h2>
            <p className="mt-4 text-lg leading-6 text-gray-500">
              Let us know if we can help you with anything! The easiest way is to join our Discord community:
            </p>
            <div className="flex gap-6 justify-center mt-6">
              <Link to="https://discord.gg/sjshgk5tT7" target="_blank">
                <PrimaryButton>Join our Discord</PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-16 divide-y divide-gray-100 lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Write an email</h2>
                  <p className="mt-4 leading-7 text-gray-600">
                    For specific topics, please write us a mail! We will reply within 2 days.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
                  <div className="rounded-2xl bg-gray-50 p-10">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Support</h3>
                    <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <div className="mb-5">Need help? Contact our support team for quick assistance.</div>
                        <dd>
                          <a className="font-semibold text-indigo-600" href="mailto:support@pabolo.ai">
                            support@pabolo.ai
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-10">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Press</h3>
                    <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <div className="mb-5">
                          Media requests? Contact our press team for interviews and press-related matters.
                        </div>
                        <dd>
                          <a className="font-semibold text-indigo-600" href="mailto:press@pabolo.ai">
                            press@pabolo.ai
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-10">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Partnerships</h3>
                    <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <div className="mb-5">
                          Want to collaborate or discuss business? Connect with our team for partnership opportunities.
                        </div>
                        <dd>
                          <a className="font-semibold text-indigo-600" href="mailto:business@pabolo.ai">
                            business@pabolo.ai
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-10">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Join the team!</h3>
                    <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <div className="mb-5">
                          Please check the jobs section on our
                          <a href="/about" className="font-semibold">
                            {" "}
                            About{" "}
                          </a>
                          page or write us directly here.
                        </div>
                        <dd>
                          <a className="font-semibold text-indigo-600" href="mailto:jobs@pabolo.ai">
                            jobs@pabolo.ai
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
