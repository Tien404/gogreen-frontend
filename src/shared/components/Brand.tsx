import { config } from "@/config/app";

export function Brand() {
  return (
    <div
      data-slot="brand"
      className="flex items-center gap-2 text-md tracking-[-0.8px] font-bold whitespace-nowrap max-[1200px]:text-md"
    >
      <span
        className="w-9 h-9 rounded-xs bg-brand shrink-0 block mask-[url('/brand/gogreen-symbol.svg')] mask-contain mask-center mask-no-repeat max-[900px]:w-8 max-[900px]:h-8"
        aria-hidden="true"
      />
      <span>{config.brand}</span>
    </div>
  );
}
