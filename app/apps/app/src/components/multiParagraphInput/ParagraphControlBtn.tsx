import React from "react";
import { Tooltip } from "@material-tailwind/react";

import { classNames } from "@frontend/utils/classNames";

interface ParagraphControlBtnProps {
  className?: string;
  tip?: string;
  disabled?: boolean;
  Icon: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  onClick?: () => void;
  name?: string;
}

export function ParagraphControlBtn({
  className,
  tip = "",
  disabled = false,
  Icon,
  onClick,
  name,
}: ParagraphControlBtnProps) {
  return (
    <button
      className={classNames(
        "inline-block justify-center items-center border-none p-0 text-gray-500 h-4 w-4 hover:enabled:scale-125 focus:outline-none disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled}
      name={name}
      onClick={() => !disabled && onClick?.()}
    >
      {tip ? (
        <Tooltip placement="top" content={tip} className="z-50">
          <Icon className="h-full w-full text-gray-500" />
        </Tooltip>
      ) : (
        <Icon className="h-full w-full text-gray-500" />
      )}
    </button>
  );
}
