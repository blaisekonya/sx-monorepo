import { ref } from 'vue';

const toasts = ref<{ message: string; type: string }[]>([]);

export function useToast() {
  const addToast = (message: string, type: string = 'success') => {
    toasts.value.push({ message, type });
    setTimeout(() => {
      toasts.value.shift();
    }, 3000); // Toast duration
  };

  return {
    toasts,
    toast: addToast
  };
}
