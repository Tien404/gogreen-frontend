import { Icon } from "../components/Icon";

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      data-visible={!!message}
      className="fixed bottom-[24px] left-[calc(50%+125px)] -translate-x-1/2 bg-brand-strong text-on-dark rounded-xs shadow-floating hidden items-center gap-3 z-200 max-w-[calc(100%-40px)] text-sm data-[visible=true]:flex data-[visible=true]:animate-fade-in max-[1200px]:left-[calc(50%+110px)] max-[900px]:left-1/2 max-[600px]:w-[calc(100%-30px)] max-[600px]:bottom-4 max-[600px]:max-w-125 max-[600px]:text-xs py-3 px-4"
      role="status"
      aria-live="polite"
    >
      {message && (
        <>
          <Icon name="help" />
          <span>{message}</span>
          <button
            data-slot="icon-button"
            className="inline-flex items-center justify-center w-[24px] h-[24px] bg-transparent border-0 border-solid rounded-xs text-on-dark hover:bg-surface-inset hover:text-accent"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={16} />
          </button>
        </>
      )}
    </div>
  );
}
