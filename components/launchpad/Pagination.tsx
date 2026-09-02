"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { pageHref } from "@/lib/pagination";

function getPageItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("...");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < total - 1) items.push("...");
  items.push(total);

  return items;
}

const navClasses =
  "flex items-center gap-1 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold hover:text-goldLight";
const navDisabledClasses =
  "flex cursor-not-allowed items-center gap-1 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-wider2 text-bronze/40 opacity-30";

export default function Pagination({
  page,
  totalPages,
  basePath,
  search,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  search?: string;
}) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1, search)} prefetch={false} className={navClasses}>
          <ChevronLeftIcon className="h-3 w-3" />
          Previous
        </Link>
      ) : (
        <span className={navDisabledClasses}>
          <ChevronLeftIcon className="h-3 w-3" />
          Previous
        </span>
      )}

      {items.map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze"
          >
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(basePath, item, search)}
            prefetch={false}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-8 w-8 items-center justify-center border font-mono text-[10px] transition-colors ${
              item === page
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={pageHref(basePath, page + 1, search)} prefetch={false} className={navClasses}>
          Next
          <ChevronRightIcon className="h-3 w-3" />
        </Link>
      ) : (
        <span className={navDisabledClasses}>
          Next
          <ChevronRightIcon className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
