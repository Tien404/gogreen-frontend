import { useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./primitives/dialog";

type ModalProps = {
  title: string;
  description: string;
  trigger?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  drawer?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
};

export function Modal({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  drawer = false,
  onCloseAutoFocus,
}: ModalProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger ref={triggerRef} asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent
        data-drawer={drawer}
        className={
          drawer
            ? "inset-y-4 right-4 left-auto top-4 w-[calc(100%-2rem)] max-w-xl translate-x-0 translate-y-0 max-h-[calc(100dvh-2rem)]"
            : undefined
        }
        onOpenAutoFocus={() => {
          openerRef.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          if (
            !trigger ||
            !triggerRef.current?.isConnected ||
            triggerRef.current.disabled
          ) {
            event.preventDefault();
            const target =
              !trigger && openerRef.current?.isConnected
                ? openerRef.current
                : document.getElementById("main-content");
            target?.focus({ preventScroll: true });
          }
        }}
      >
        <DialogHeader className="mb-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
type ConfirmProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  label?: string;
  danger?: boolean;
  trigger: ReactNode;
};
export function Confirm({
  title,
  description,
  onConfirm,
  label = "Confirm",
  danger = false,
  trigger,
}: ConfirmProps) {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex gap-3 justify-end mt-5 flex-wrap max-[600px]:*:data-[slot~=button]:flex-1">
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Keep current state
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {label}
        </Button>
      </div>
    </Modal>
  );
}
