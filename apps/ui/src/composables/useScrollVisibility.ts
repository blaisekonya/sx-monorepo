import { ref, onMounted, onUnmounted } from 'vue';

export type ScrollVisibilityOptions = {
  threshold?: number;
  showAtBottom?: boolean;
  mobileBreakpoint?: number;
};

export function useScrollVisibility(options: ScrollVisibilityOptions = {}) {
  const {
    threshold = 72,
    showAtBottom = false,
    mobileBreakpoint = 768
  } = options;

  const isVisible = ref(true);
  const lastScrollY = ref(0);
  const ticking = ref(false);
  const isMobile = ref(false);

  function checkMobile() {
    isMobile.value = window.innerWidth <= mobileBreakpoint;
  }

  function handleScroll() {
    if (!ticking.value && isMobile.value) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        isVisible.value =
          lastScrollY.value > currentScrollY || // Show when scrolling up
          currentScrollY < threshold || // Show when near top
          (showAtBottom &&
            currentScrollY + window.innerHeight >=
              document.documentElement.scrollHeight - 100); // Optionally show when near bottom
        lastScrollY.value = currentScrollY;
        ticking.value = false;
      });
      ticking.value = true;
    }
  }

  onMounted(() => {
    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', checkMobile);
  });

  return {
    isVisible,
    isMobile
  };
}
