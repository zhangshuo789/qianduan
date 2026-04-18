import { ref } from 'vue'

class ToastEventBus {
  constructor() {
    this.listeners = []
  }

  on(callback) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(message, type = 'info', duration = 4000) {
    this.listeners.forEach(callback => callback(message, type, duration))
  }

  success(message, duration) {
    this.emit(message, 'success', duration)
  }

  error(message, duration) {
    this.emit(message, 'error', duration)
  }

  warning(message, duration) {
    this.emit(message, 'warning', duration)
  }

  info(message, duration) {
    this.emit(message, 'info', duration)
  }
}

export const toastBus = new ToastEventBus()

export function toast(message, type = 'info', duration = 4000) {
  toastBus.emit(message, type, duration)
}

toast.success = (msg, duration) => toastBus.success(msg, duration)
toast.error = (msg, duration) => toastBus.error(msg, duration)
toast.warning = (msg, duration) => toastBus.warning(msg, duration)
toast.info = (msg, duration) => toastBus.info(msg, duration)
