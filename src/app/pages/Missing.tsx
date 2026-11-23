import { useApp } from "@/app/providers/AppContext";
import { Empty, Link } from "@/shared/ui";

export function Missing() {
  const { s } = useApp();

  return (
    <Empty
      headingLevel={1}
      title="We couldn’t find that record"
      text="This record does not exist or may have been removed."
      action={
        <Link
          data-slot="button"
          className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-lg text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-primary [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
          to={s.role ? `/${s.role}` : "/"}
        >
          Back to overview
        </Link>
      }
    />
  );
}
