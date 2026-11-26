import { Icon } from "@/shared/components/Icon";
import { Badge, Link } from "@/shared/ui";

export function StudentRecordLink({
  to,
  title,
  location,
  detail,
  status,
}: {
  to: string;
  title: string;
  location: string;
  detail: string;
  status: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-16 items-center gap-3 rounded-xl bg-surface-muted min-[850px]:bg-panel p-4 transition-colors hover:bg-green-muted/60 hover:text-primary"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-base text-content">{title}</strong>
            <Badge>{status.replaceAll("-", " ")}</Badge>
          </span>
          <span className="mt-1.5 block text-sm font-medium text-content">
            {location}
          </span>
          <span className="mt-0.5 block text-sm text-content-muted">
            {detail}
          </span>
        </span>
        <Icon name="chevron" size={18} />
      </Link>
    </li>
  );
}
