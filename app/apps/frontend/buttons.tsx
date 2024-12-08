import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

interface ButtonsProps {
  as?: React.ElementType;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.SyntheticEvent) => void;
  [x: string]: any;
}

export function Btn({ as = "button", className, children, disabled, onClick, ...props }: ButtonsProps) {
  const Tag = as;
  const classes = classNames(
    "inline-flex items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 enabled:active:shadow-none",
    className,
    disabled && "opacity-50 cursor-not-allowed"
  );
  return (
    <Tag className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </Tag>
  );
}

// Signal colored button, like a CTA to signal the next step
export function PrimaryButton({ as, className, children, disabled, onClick, ...props }: ButtonsProps) {
  const classes = classNames(
    "bg-gradient-to-b from-violet-400 to-indigo-600 enabled:hover:from-violet-500 enabled:hover:to-indigo-700 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 enabled:active:to-violet-500 enabled:active:from-indigo-600",
    className
  );
  return (
    <Btn as={as} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </Btn>
  );
}

// Non-dominant colored button for an optional action
export function SecondaryButton({ as, className, children, disabled, onClick, ...props }: ButtonsProps) {
  const classes = classNames(
    "bg-gradient-to-b to-violet-50 from-white font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 enabled:hover:to-violet-100 enabled:hover:from-gray-100 enabled:active:from-gray-200 enabled:active:to-gray-50",
    className
  );
  return (
    <Btn as={as} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </Btn>
  );
}

// Red button, to cancel an operation
export function AbortButton({ as, className, children, disabled, onClick, ...props }: ButtonsProps) {
  const classes = classNames(
    "border border-red-300 bg-gradient-to-b to-red-50 from-white font-medium enabled:hover:to-red-100 enabled:hover:from-gray-100 text-red-700 focus:ring-red-500 enabled:active:to-red-50 enabled:active:from-red-100",
    className
  );
  return (
    <Btn as={as} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </Btn>
  );
}

// An action that might have irreversible consequences
export function WarningButton({ as, className, children, disabled, onClick, ...props }: ButtonsProps) {
  const classes = classNames(
    "border border-yellow-200 bg-gradient-to-b to-yellow-100 from-yellow-50 font-medium enabled:hover:to-yellow-200 enabled:hover:from-yellow-100 text-yellow-700 enabled:active:to-yellow-100 enabled:active:from-yellow-200",
    className
  );
  return (
    <Btn as={as} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </Btn>
  );
}
