<template>
  <div
    class="relative flex justify-center min-h-[600px] pt-[94px] items-center border-b"
  >
    <div
      class="absolute blocks-x top-0 left-[50%] right-0 bottom-0 !bg-left-top border-l"
    />
    <UiContainer
      class="relative w-full !max-w-screen-lg flex items-center py-8"
    >
      <div class="max-w-[800px]">
        <h1 class="mb-4 font-display text-[60px] xs:text-[68px]">
          World Republic
        </h1>
        <UiButton
          :to="'https://world.org/mini-app?app_id=app_66c83ab8c851fb1e54b1b1b62c6ce39d'"
          target="_blank"
          rel="noopener noreferrer"
          class="primary"
        >
          Get started
        </UiButton>
      </div>
    </UiContainer>
  </div>
</template>
