import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Breadcrumb = { label: string; href?: string };

type Props = {
  backHref: string;
  backLabel: string;
  breadcrumbs: Breadcrumb[];
};

export function FindByRecordNav({ backHref, backLabel, breadcrumbs }: Props) {
  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 h-10 flex items-center">
        <Link
          href={backHref}
          className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors md:hidden"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>{backLabel}</span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground"
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="select-none">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
