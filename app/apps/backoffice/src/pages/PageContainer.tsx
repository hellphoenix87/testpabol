import { ReactNode } from "react";
import NavBar from "../NavBar";

interface PageContainerProps {
  children: ReactNode;
  className?: string; // Optional additional class name
}

export default function PageContainer({
  children,
  className,
  ...navBarProps // Collect all other arbitrary props in navBarProps
}: PageContainerProps) {
  const containerClasses = `container mx-auto lg:px-4 ${className || ""}`;

  return (
    <div className="App">
      <NavBar {...navBarProps} />
      <div className={containerClasses}>{children}</div>
    </div>
  );
}
