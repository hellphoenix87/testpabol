import { CloudArrowUpIcon, LockClosedIcon, UserIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import PageContainer from "./pageContainer";

const JoinWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.defer = true;
    script.type = "text/javascript";
    script.src =
      "https://join.com/api/widget/bundle/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXR0aW5ncyI6eyJzaG93Q2F0ZWdvcnlGaWx0ZXIiOnRydWUsInNob3dMb2NhdGlvbkZpbHRlciI6ZmFsc2UsInNob3dFbXBsb3ltZW50VHlwZUZpbHRlciI6dHJ1ZSwibGFuZ3VhZ2UiOiJlbiIsImpvYnNQZXJQYWdlIjoyNX0sImpvYnMiOnt9LCJkZXNpZ24iOnsic2hvd0xvZ28iOnRydWUsInNob3dMb2NhdGlvbiI6dHJ1ZSwic2hvd0VtcGxveW1lbnRUeXBlIjpmYWxzZSwic2hvd0NhdGVnb3J5Ijp0cnVlLCJjb2xvcnMiOnsid2lkZ2V0Ijp7ImJhY2tncm91bmQiOiIjRkZGRkZGIiwiZmlsdGVyQm9yZGVyIjoiI0Q0RDREOCIsInBhZ2luYXRpb24iOiIjMjU2M0VCIn0sImpvYkNhcmQiOnsic2hhZG93IjoiI0Q0RDREOCIsImJhY2tncm91bmQiOiIjRkZGRkZGIiwicHJpbWFyeVRleHQiOiIjM0YzRjQ2Iiwic2Vjb25kYXJ5VGV4dCI6IiM1MjUyNUIifX19LCJ2ZXJzaW9uIjoyLCJjb21wYW55UHVibGljSWQiOiJhN2M1MTVlMGQ3ZjhjM2ZiYmQ3MTk5M2RkNzM5MzE3YSIsImlhdCI6MTY4NjkwOTQxMCwianRpIjoiOWVmNmU4OWMtZjQxMi00ZDFlLWIyZmItNGJmMGY2YzljODQ1In0.FEdvXgPQX_oZwGfxWJyy7ytPQ8E45p-4JAd931yxg2U";
    document.getElementById("join-widget")?.appendChild(script);
  }, []);

  return <div id="join-widget"></div>;
};

function JobLogos() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg leading-8 text-gray-600">
          <span className="font-semibold">pabolo</span> team members formerly contributed to
        </h2>
        <div className="opacity-75 mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <img
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            src="logo_gl.jpg"
            alt="Google"
            width={158}
            height={48}
          />
          <img
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            src="logo_gf.jpg"
            alt="GameForge"
            width={158}
            height={48}
          />
          <img
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            src="logo_ens.jpg"
            alt="Enscape"
            width={158}
            height={48}
          />
          <img
            className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
            src="logo_mt.jpg"
            alt="Meta"
            width={158}
            height={48}
          />
          <img
            className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
            src="logo_ms.jpg"
            alt="Microsoft"
            width={158}
            height={48}
          />
        </div>
      </div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <PageContainer
      footer
      metaTags={{ title: "About Us", description: "Learn about the company behind Pabolo and potential job offers." }}
    >
      <div className="overflow-hidden relative bg-white mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
        <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
          <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
            <img
              className="sm:rounded-b-lg absolute inset-0 h-full w-full bg-gray-50 object-cover"
              src="./office.jpg"
              alt="Image of the Karlsruhe Office of Pabolo GmbH"
            />
          </div>
        </div>

        <div className="px-6 lg:contents">
          <div className="mx-auto max-w-2xl pb-10 pt-16 sm:pb-16 sm:pt-20 lg:ml-8 lg:mr-0 lg:w-full lg:max-w-lg lg:flex-none lg:pt-32 xl:w-1/2">
            <p className="text-base font-semibold leading-7 text-indigo-600">The team behind AI movie generation</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About pabolo</h1>
            <p className="mt-6 text-xl leading-8 text-gray-700">
              Welcome to the first AI movie streaming service! We&apos;re revolutionizing storytelling by making
              everyone a world class movie maker!
            </p>
            <div className="mt-10 max-w-xl text-base leading-7 text-gray-700 lg:max-w-none">
              <p>
                Founded in 2022, <span className="font-semibold">pabolo</span> is driven by a passionate team of AI
                scientists. Our mission is to democratize movie creation and deliver personalized entertainment
                experiences.
              </p>
              <ul role="list" className="mt-8 space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <CloudArrowUpIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">AI Movie Creator.</strong> Our platform offers a
                    powerful tool, crafting unique scripts, dialog and shots for captivating movies through artificial
                    intelligence. Our system generates movies autonomously but can also be instructed and supervised.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <LockClosedIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">Commitment to Quality and Compliance.</strong> We
                    prioritize high standards in quality, content, and ethics. Our team ensures exceptional quality,
                    legal compliance, and privacy protection for each AI movie with the highest standards.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <UserIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">Tell us what you think.</strong> We like to hear
                    your opinion on what to improve next. Please join our&nbsp;
                    <a
                      className="font-semibold text-indigo-600 cursor-pointer"
                      href="https://discord.gg/sjshgk5tT7"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Discord community
                    </a>
                    &nbsp;and tell us what you think!
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                At <span className="font-semibold">pabolo</span>, we are shaping the future of cinema, one AI-generated
                movie at a time. Explore, create, and experience a new era of storytelling.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
        <div key="asd" className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Join pabolo</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We&apos;re hiring! Let us know if you want to join a world class development team.&nbsp;
              <span className="font-semibold">pabolo</span> offers both remote and on-site positions in our office in
              Karlsruhe, Germany.
            </p>
          </div>
          <div className="flex-auto lg:col-span-7 xl:col-span-8">
            <div className="aspect-h-2 aspect-w-5 overflow-hidden rounded-lg bg-gray-100">
              <img src="karlsruhe.jpg" alt="aaasf" className="object-cover object-center" />
            </div>
          </div>
        </div>
      </div>
      <JobLogos />
      <JoinWidget />
    </PageContainer>
  );
}
