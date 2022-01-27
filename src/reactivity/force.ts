let _isForceTrigger = false

export function isForceTrigger() {
  return _isForceTrigger
}

export function setForceTrigger(v: boolean) {
  _isForceTrigger = v
}
