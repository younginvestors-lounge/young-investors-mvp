import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface BrutalistButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  critical?: boolean;
  icon?: ReactNode;
}

export function BrutalistButton({
  active = false,
  critical = false,
  icon,
  children,
  className,
  ...props
}: BrutalistButtonProps) {
  return (
    <button
      className={clsx(
        "brutalist-button",
        active && "brutalist-button-active",
        critical && "brutalist-button-critical",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="button-copy">{children}</span>
    </button>
  );
}
