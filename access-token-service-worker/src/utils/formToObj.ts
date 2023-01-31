export default function formToObj<T>(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries()) as T
}
