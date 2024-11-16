import { ref, onMounted, onUnmounted, computed } from 'vue';

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
  const scrollProgress = ref(0);
  const accumulatedProgress = ref(0);

  const fullyVisible = computed(() => scrollProgress.value === 0);

  function checkMobile() {
    isMobile.value = window.innerWidth <= mobileBreakpoint;
  }

  function handleScroll() {
    if (!ticking.value && isMobile.value) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.value;

        // Accumulate progress based on scroll direction
        accumulatedProgress.value = Math.max(
          0,
          Math.min(1, accumulatedProgress.value + scrollDelta / threshold)
        );

        // Update scroll progress based on accumulated value
        scrollProgress.value = accumulatedProgress.value;

        isVisible.value =
          lastScrollY.value > currentScrollY || // Show when scrolling up
          currentScrollY < threshold || // Show when near top
          (showAtBottom &&
            currentScrollY + window.innerHeight >=
              document.documentElement.scrollHeight - 100);

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
    isMobile,
    scrollProgress,
    fullyVisible
  };
}
