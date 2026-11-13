import { useState, useEffect } from "react"
import type React from "react"

const TOAST_LIMIT = 1

let count = 0
function generateId(): string {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
  duration?: number;
  variant?: 'default' | 'destructive';
  dismiss: () => void;
  [key: string]: unknown;
}

interface ToastState {
  toasts: ToastData[];
}

type Listener = (state: ToastState) => void;

const toastStore = {
  state: {
    toasts: [],
  } as ToastState,
  listeners: [] as Listener[],
  
  getState: (): ToastState => toastStore.state,
  
  setState: (nextState: ToastState | ((prev: ToastState) => ToastState)) => {
    if (typeof nextState === 'function') {
      toastStore.state = nextState(toastStore.state)
    } else {
      toastStore.state = { ...toastStore.state, ...nextState }
    }
    
    toastStore.listeners.forEach(listener => listener(toastStore.state))
  },
  
  subscribe: (listener: Listener) => {
    toastStore.listeners.push(listener)
    return () => {
      toastStore.listeners = toastStore.listeners.filter(l => l !== listener)
    }
  }
}

export const toast = (props: Omit<ToastData, 'id' | 'dismiss'> & Record<string, unknown>) => {
  const id = generateId()

  const update = (updateProps: Partial<ToastData>) =>
    toastStore.setState((state) => ({
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...updateProps } : t
      ),
    }))

  const dismiss = () => toastStore.setState((state) => ({
    ...state,
    toasts: state.toasts.filter((t) => t.id !== id),
  }))

  toastStore.setState((state) => ({
    ...state,
    toasts: [
      { ...props, id, dismiss } as ToastData,
      ...state.toasts,
    ].slice(0, TOAST_LIMIT),
  }))

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastStore.getState())
  
  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newState) => {
      setState(newState)
    })
    
    return unsubscribe
  }, [])
  
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    state.toasts.forEach((t) => {
      if (t.duration === Infinity) {
        return
      }

      const timeout = setTimeout(() => {
        t.dismiss()
      }, (t.duration as number) || 5000)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [state.toasts])

  return {
    toast,
    toasts: state.toasts,
  }
}
