import { useState, useEffect, useRef } from "react";
import {
  BookOpenIcon,
  UserIcon,
  CakeIcon,
  CameraIcon,
  TicketIcon,
  InformationCircleIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import PageContainer from "./pageContainer";
import { classNames } from "@frontend/utils/classNames";
import { getDownloadUrlForPublic } from "@app/util";
import { PrimaryButton } from "@frontend/buttons";
import { Disclosure } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const DEMO_VIDEO_PATH = "demo/demo-video.mp4";

const features = [
  {
    name: "Title and Plot.",
    description: "Our AI will assist you to find a catchy a plot based on your desired genre and attributes.",
    icon: BookOpenIcon,
  },
  {
    name: "Characters and Locations.",
    description: "Chose the looks and properties of your actors and locations.",
    icon: UserIcon,
  },
  {
    name: "Scenes.",
    description: "Plan every scene to guide the viewer through the story.",
    icon: CakeIcon,
  },
  {
    name: "Shots.",
    description: "You're now on set: Guide the cinematography and dialogs of your actors.",
    icon: CameraIcon,
  },
  {
    name: "Publish.",
    description: "Share your movie on our platform and get feedback from movie lovers around the world.",
    icon: TicketIcon,
  },
];

export function FeatureList() {
  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
          <div className="lg:row-start-2 lg:max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-transparent sm:text-4xl bg-clip-text bg-gradient-to-br from-cyan-50 to-gray-400">
              From vision to screen.
              <br />
              Step by step.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our creator makes you a movie director! Every creation step can be fully AI automated or you can manually
              edit it.
            </p>
          </div>
          <img
            src="creator_screenshot.jpg"
            alt="Product screenshot"
            className="relative -z-20 min-w-full max-w-md sm:max-w-xl rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4 lg:w-[50rem] lg:max-w-none"
            width={1245}
            height={1314}
          />
          <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10">
            <dl className="max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
              {features.map(feature => (
                <div key={feature.name} className="relative">
                  <dt className="ml-9 inline-block font-semibold text-white">
                    <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-500" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="inline"> {" " + feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div
          className="pointer-events-none absolute left-12 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:bottom-[-12rem] lg:top-auto lg:translate-y-0 lg:transform-gpu"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const tiers = [
  {
    name: "pabolo Viewer",
    id: "tier-hobby",
    href: "/account",
    priceMonthly: "Free",
    description: "Enjoy unlimited access to all our movies and interact with the community.",
    features: ["Access to all movies", "Comment and vote"],
    featured: false,
    cta: "Create Account",
  },
  {
    name: "pabolo Creator",
    id: "tier-creator",
    href: "https://paramax.us21.list-manage.com/subscribe?u=c637707d84fed4c9b34510110&id=5b4104edd5",
    priceMonthly: "Coming Soon",
    description: "Get first class access including frequent updates to our movie creation tool.",
    features: [
      "AI assisted story generation",
      "Cast virtual actors",
      "Scout locations for your sets",
      "Generate scenes and shots",
      "Share your movies on pabolo",
    ],
    featured: true,
    cta: "Join the waitlist",
  },
];

export function Pricing() {
  return (
    <div className="relative isolate bg-white px-6 pt-24 sm:pt-32 lg:px-8">
      <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
        <div
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Take the director&apos;s seat!
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
        Get access to our world-class movie making tools and start sharing your stories with the community!
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured ? "relative bg-gray-900 shadow-2xl" : "bg-white/60 sm:mx-8 lg:mx-0",
              tier.featured && tierIdx === 0
                ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
              "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
            )}
          >
            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? "text-indigo-400" : "text-indigo-600",
                "text-base font-semibold leading-7"
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? "text-white" : "text-gray-900",
                  "text-5xl font-bold tracking-tight"
                )}
              >
                {tier.priceMonthly}
              </span>
            </p>
            <p className={classNames(tier.featured ? "text-gray-300" : "text-gray-600", "mt-6 text-base leading-7")}>
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
              )}
            >
              {tier.features.map(feature => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className={classNames(tier.featured ? "text-indigo-400" : "text-indigo-600", "h-6 w-5 flex-none")}
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? "bg-gradient-to-b from-violet-400 to-indigo-600 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500"
                  : "bg-gradient-to-b to-violet-50 from-white text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600",
                "mt-8 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              {tier.cta}
            </a>
          </div>
        ))}

        <div className="mt-10 lg:col-span-2 lg:flex-row lg:items-center rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                The <span className="font-semibold">pabolo</span> Creator is an early product and will receive ongoing
                improvements for the movie quality and user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "What is pabolo?",
    answer:
      "pabolo is an advanced movie streaming platform of the next generation that showcases movies and series generated by artificial intelligence. The content of the movies is either automatically generated or collaboratively created with a human creator.",
  },
  {
    question: "How can I create my own movie?",
    answer:
      "You can easily subscribe to become a pabolo Creator and start creating! However, as we are currently expanding our capacity, we will only be accepting a limited number of creators. If you wish to be among the first creators, kindly subscribe to our waitlist, and we will notify you as soon as we open up the platform for more users.",
  },
  {
    question: "Are there any restrictions for the content I create?",
    answer:
      "Prior to releasing a movie on our platform, we thoroughly examine it for copyright, legal, and community guideline concerns. If you find any content that makes you uncomfortable or believe that your copyright has been infringed upon, kindly utilize the report feature. We aim for pabolo to be a hub of entertainment and value your assistance in achieving this objective.",
  },
  {
    question: "How can I share my feedback?",
    answer:
      "For licensing and partnership inquiries, kindly refer to our contact page. For any other feedback, please utilize our Discord server.",
  },
  {
    question: "What's the functionality of pabolo?",
    answer:
      "There are two main functionalities on pabolo: Watching movies and creating movies. You can watch all the movies created by our AI for free. Optionally, you can register and set up an account for free to start commenting and voting on movies. By subscribing to our pabolo Creator, you can also make your own movies with the help of our AI. The movies will initially consist of a slide show of film stills that the Creator can add music and sound to. pabolo will at a later stage enhance the functionality of the AI Tool so that the Creator will be able to produce moving images with the AI Tool.",
  },
  {
    question: "What are minimum requirements to use pabolo?",
    answer:
      "We recommend a minimum internet speed of 10 Mbps. While we try to support all common browsers, we recommend using Chrome or Firefox. In case you encounter a display error on a specific browser, please contact us by sending a screenshot along with information about the browser and screen resolution you are using.",
  },
  {
    question: "Do you offer an iOS, Android or TV set app?",
    answer:
      "Not yet! pabolo can still be used on mobile devices as we use a responsive design that adapts to your device. However, depending on your screen size, this may result in a limited experience using pabolo. We recommend using a web browser and a PC screen, especially if you are using our Creator feature. Tablets and smart mobile devices are sufficient for watching movies on pabolo.",
  },
];

export function Faqs() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:pt-20 lg:px-8 lg:pt-30">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map(faq => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function Feature() {
  const [demoVideoLink, setDemoVideoLink] = useState<string>("");
  const [logoHidden, setLogoHidden] = useState<boolean>(true);

  const demoVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const demoVideoUrl = getDownloadUrlForPublic(DEMO_VIDEO_PATH);
    setDemoVideoLink(demoVideoUrl);
  }, []);

  return (
    <PageContainer
      className="p-4"
      footer
      metaTags={{
        title: "Features",
        description:
          "Create your own movie with the Pabolo Creator. Learn about the different subscription to get started in the world of AI movies!",
      }}
    >
      <div className="relative isolate min-h-full bg-white py-12 px-6 sm:py-16 md:grid md:place-items-center lg:px-8">
        <div
          className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
          aria-hidden="true"
        >
          <div
            className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-max">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-800 to-gray-800">
              Create your own movie with the help of AI
            </h2>
            <p className="mt-12 text-lg leading-8 text-gray-600">
              With our tool, everyone can be a filmmaker. Go through the process of writing your script until final
              cinematography within minutes.
            </p>
            <div className="flex justify-center mt-12">
              <Link
                to="https://paramax.us21.list-manage.com/subscribe?u=c637707d84fed4c9b34510110&id=5b4104edd5"
                target="_blank"
              >
                <PrimaryButton>Join the Waitlist</PrimaryButton>
              </Link>
            </div>
            <div className="relative flex justify-center aspect-[16/9] mt-14 border-8 border-slate-800 rounded-md drop-shadow-xl">
              {!logoHidden && (
                <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-8">
                  <img className="pointer-events-none" src="/pabolo_logo_gradient.png" />
                  <PrimaryButton onClick={() => demoVideoRef.current?.play()}>Watch Demo</PrimaryButton>
                </div>
              )}
              {demoVideoLink && (
                <video
                  controls
                  width="100%"
                  ref={demoVideoRef}
                  src={demoVideoLink}
                  onPlay={() => setLogoHidden(true)}
                  onLoadedData={() => setLogoHidden(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <FeatureList />
      <Pricing />
      <Faqs />
    </PageContainer>
  );
}
