import { HTMLAttributes } from "react";
import clsx from "clsx";

interface BrutalistCardProps extends HTMLAttributes<HTMLElement> {
  critical?: boolean;
  compact?: boolean;
  as?: "article" | "section" | "div";
}

export function BrutalistCard({
  critical = false,
  compact = false,
  as: Tag = "article",
  className,
  children,
  ...props
}: BrutalistCardProps) {
  return (
    <Tag
      className={clsx(
        "brutalist-card",
        critical && "brutalist-card-critical",
        compact && "brutalist-card-compact",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
