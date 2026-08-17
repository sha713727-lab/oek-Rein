export const BAG_EVENT = "zermae:bag";
export const TOAST_EVENT = "zermae:toast";

export type ToastTone = "ok" | "error";

export type ToastDetail = {
  message: string;
  tone?: ToastTone;
};

export function notifyBagOpened(): void {
  window.dispatchEvent(new Event(BAG_EVENT));
}

export function notifyToast(message: string, tone: ToastTone = "ok"): void {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }));
}
