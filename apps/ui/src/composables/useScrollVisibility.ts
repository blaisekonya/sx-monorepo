import { ref, onMounted, onUnmounted } from 'vue';

export type ScrollVisibilityOptions = {
  threshold?: number;
  showAtBottom?: boolean;
  mobileBreakpoint?: number;
  sensitivity?: number;
};

export function useScrollVisibility(options: ScrollVisibilityOptions = {}) {
  const {
    threshold = 72,
    showAtBottom = false,
    mobileBreakpoint = 768,
    sensitivity = 5
  } = options;

  const isVisible = ref(true);
  const lastScrollY = ref(0);
  const lastScrollTime = ref(Date.now());
  const ticking = ref(false);
  const isMobile = ref(false);
  const isScrollingUp = ref(false);

  function checkMobile() {
    isMobile.value = window.innerWidth <= mobileBreakpoint;
  }

  function handleScroll() {
    if (!ticking.value && isMobile.value) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const scrollDelta = currentScrollY - lastScrollY.value;

        isScrollingUp.value = scrollDelta < 0;

        isVisible.value = isVisible.value
          ? true
          : isScrollingUp.value ||
            currentScrollY < threshold ||
            (showAtBottom &&
              currentScrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 100);

        if (!isScrollingUp.value && scrollDelta > sensitivity) {
          isVisible.value = false;
        }

        lastScrollY.value = currentScrollY;
        lastScrollTime.value = currentTime;
        ticking.value = false;
      });
      ticking.value = true;
    }
  }

  onMounted(() => {
    checkMobile();
    window.addEventListener('scroll', handleScroll, { passive: true });
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
