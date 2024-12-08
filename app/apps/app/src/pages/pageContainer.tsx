import { ReactNode } from "react";
import NavBar from "@app/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";
import { classNames } from "@frontend/utils/classNames";

interface PageMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  norobots?: boolean;
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  searchInitialContent?: string;
  footer?: boolean;
  metaTags?: PageMetaTagsProps;
}

export default function PageContainer({
  children,
  className,
  footer,
  metaTags,
  ...navBarProps // Collect all other arbitrary props in navBarProps
}: PageContainerProps) {
  const metaTitle = metaTags?.title || "Pabolo - AI generated Movies";
  const metaDescription =
    metaTags?.description ||
    "Experience the future of filmmaking - Watch movies created entirely by AI and easily create your own AI-generated movies with our user-friendly platform. Start your cinematic journey today!";
  const metaImage = metaTags?.image || "https://www.pabolo.ai/pabolo_logo_gradient.png";
  const metaKeywords =
    metaTags?.keywords ||
    "AI movies, movie creation, artificial intelligence, filmmaking, AI-generated films, cinematic experience";

  return (
    <div className="App">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta name="author" content="Pabolo GmbH" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:site" content="@PaboloAi" />
        <meta name="twitter:creator" content="@PaboloAi" />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:domain" content="pabolo.ai" />
        <meta name="twitter:image" content={metaImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:determiner" content="the" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Pabolo" />
        <meta property="og:type" content="website" />

        {metaTags?.norobots && <meta name="robots" content="noindex" />}
      </Helmet>
      <NavBar {...navBarProps} />
      <div className={classNames("container mx-auto lg:px-4", className)}>{children}</div>
      {footer && <Footer />}
    </div>
  );
}
