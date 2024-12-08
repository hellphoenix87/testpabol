import React, { useState } from "react";
import { classNames } from "@frontend/utils/classNames";
import { Link } from "react-router-dom";

interface CtaSkeletonProps {
  title: React.ReactNode;
  description: React.ReactNode;
  btnText: React.ReactNode;
  linkText: React.ReactNode;
}

function CtaSkeleton({ title, description, btnText, linkText }: CtaSkeletonProps) {
  return (
    <div className="absolute t-0 l-0 z-10 w-full h-full mt-8">
      <div className="animate-pulse bg-gray-200 isolate overflow-hidden px-6 pt-16 shadow-2xl sm:rounded-2xl sm:px-16 md:pt-20 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-24 lg:text-left">
          <div className="bg-gray-300 text-3xl font-bold tracking-tight text-transparent rounded-md sm:text-4xl">
            {title}
          </div>
          <div className="bg-gray-300 mt-6 text-lg leading-8 rounded-md text-transparent">{description}</div>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <div className="bg-gray-300 inline-block rounded-md px-3.5 py-1.5 text-base font-semibold leading-7 text-transparent shadow-sm">
              {btnText}
            </div>
            <div className="bg-gray-300 inline-block rounded-md py-1.5 text-base font-semibold leading-7 text-transparent shadow-sm">
              {linkText}
            </div>
          </div>
        </div>
        <div className="relative mt-16 h-80 lg:mt-8"></div>
      </div>
    </div>
  );
}

interface CtaProps {
  buttontext: React.ReactNode;
  buttonlink: string;
}

function Cta({ buttontext, buttonlink }: CtaProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const description = "Our generator guides you from the plot, to the screenplay until the final movie.";
  const title = (
    <>
      Create your AI movie.
      <br />
      With a few clicks.
    </>
  );
  const linkText = (
    <>
      Learn more <span aria-hidden="true">→</span>
    </>
  );

  const handleImgLoad = () => {
    setImgLoaded(true);
  };

  return (
    <div className="relative bg-white">
      {!imgLoaded && <CtaSkeleton title={title} description={description} btnText={buttontext} linkText={linkText} />}

      <div
        className={classNames(
          "transition-opacity easy-in-out duration-300 mx-auto py-8",
          imgLoaded ? "opacity-1" : "opacity-0"
        )}
      >
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-2xl sm:px-16 md:pt-20 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:translate-y-0 lg:-translate-x-1/2"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fillOpacity="0.7" fill="#4f46e5" />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-24 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-transparent sm:text-4xl bg-clip-text bg-gradient-to-br from-cyan-50 to-gray-400">
              {title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">{description}</p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link
                to={buttonlink}
                className="rounded-md bg-white px-3.5 py-1.5 text-base font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {buttontext}
              </Link>
              <Link to="/feature" className="text-base font-semibold leading-7 text-white">
                {linkText}
              </Link>
            </div>
          </div>
          <div className="relative mt-16 h-60 lg:mt-8">
            <img
              className="absolute top-0 left-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              src="/creator_banner.jpg"
              alt="Pabolo Movie Posters"
              width={1824}
              height={1080}
              onLoad={handleImgLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cta;
