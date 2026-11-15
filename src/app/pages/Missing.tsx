import { useApp } from "@/app/providers/AppContext";
import { Empty, Link } from "@/shared/ui";

export function Missing() {
  const { s } = useApp();

  return (
    <Empty
      title="We couldn’t find that record"
      text="This record may have been cleared by a reset, or belongs to another workspace."
      action={
        <Link
          data-slot="button"
          className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-xs text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-accent [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
          to={s.role ? `/${s.role}` : "/"}
        >
          Back to overview
        </Link>
      }
    />
  );
}
