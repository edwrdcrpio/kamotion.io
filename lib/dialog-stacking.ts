// Radix's DismissableLayer dispatches a "focusOutside" event whenever
// focus moves outside its content. Browsers move focus to <body> when
// a focused element becomes disabled — exactly what happens during an
// async save (the submit button toggles `disabled={mutation.isPending}`
// for the duration of the request). With stacked dialogs, that single
// focus shift fires focusOutside on every layer in the stack and
// cascade-closes all of them.
//
// We never want a focus shift to close a modal — only an explicit
// outside click or Escape — so this handler suppresses the focus path
// while leaving pointer-down-outside intact.
export function preventFocusOutsideClose(event: {
  type?: string;
  preventDefault: () => void;
}) {
  if (event.type === "dismissableLayer.focusOutside") {
    event.preventDefault();
  }
}
