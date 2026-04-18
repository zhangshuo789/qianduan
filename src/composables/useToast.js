import { toastBus } from '@/utils/toast'

export function useToast() {
  return {
    success: toastBus.success.bind(toastBus),
    error: toastBus.error.bind(toastBus),
    warning: toastBus.warning.bind(toastBus),
    info: toastBus.info.bind(toastBus),
    addToast: toastBus.emit.bind(toastBus)
  }
}
