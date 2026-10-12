export function wait(ms = 420) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
