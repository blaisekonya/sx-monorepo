<template>
  <div class="py-9 flex items-center justify-center relative">
    <div
      class="absolute blocks-x top-0 right-[50%] left-0 bottom-0 !bg-right-top -z-10"
    />
    <UiContainer class="!max-w-screen-lg">
      <div class="text-center max-w-[800px] mx-auto">
        <div class="eyebrow mb-3">Join the World Republic</div>
        <h1 class="mb-4 font-display text-[36px] xs:text-[44px]">
          Shape the future of global governance
        </h1>
        <UiButton
          :to="'https://app.worldrepublic.org'"
          target="_blank"
          rel="noopener noreferrer"
          class="primary"
        >
          Launch app
        </UiButton>
      </div>
    </UiContainer>
  </div>
</template>
