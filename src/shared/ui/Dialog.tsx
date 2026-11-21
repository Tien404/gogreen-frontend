import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { Button } from "./Button";
type ModalProps = {
  title: string;
  description: string;
  trigger?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  drawer?: boolean;
};
export function Modal({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  drawer = false,
}: ModalProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <Dialog.Trigger ref={triggerRef} asChild>
          {trigger}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 right-0 bottom-0 left-0 bg-overlay/75 backdrop-blur-xs z-100 animate-fade-in" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(e) => {
            if (
              !trigger ||
              !triggerRef.current?.isConnected ||
              triggerRef.current.disabled
            ) {
              e.preventDefault();
              const target =
                !trigger && openerRef.current?.isConnected
                  ? openerRef.current
                  : document.getElementById("main-content");
              target?.focus({ preventScroll: true });
            }
          }}
          data-drawer={drawer}
          className={`fixed z-101 overflow-y-auto bg-panel p-5 shadow-floating animate-fade-in
            ${
              drawer
                ? "inset-y-4 right-4 w-[min(650px,calc(100%-30px))] rounded-sm max-[600px]:inset-2 max-[600px]:w-[calc(100%-20px)]"
                : "top-1/2 left-1/2 max-h-[90dvh] w-[min(580px,calc(100%-40px))] -translate-x-1/2 -translate-y-1/2 rounded-md max-[600px]:w-[calc(100%-24px)] max-[600px]:rounded-sm"
            }
            `}
        >
          <div
            data-slot="modal-head"
            className="flex items-start gap-4 mb-5 [&_h2]:text-md [&_p]:text-sm [&_p]:mt-2"
          >
            <div className="flex-1">
              <Dialog.Title className="leading-[1.4]">{title}</Dialog.Title>
              <Dialog.Description className="leading-[1.65]">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              data-slot="icon-button"
              className="inline-flex items-center justify-center w-9 h-9 bg-transparent border-0 border-solid rounded-xs text-content-muted hover:bg-surface-inset hover:text-accent shrink-0"
              aria-label="Close dialog"
            >
              <Icon name="close" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
