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
        <UiButton :to="{ name: 'my-explore' }" class="primary">
          Get started
        </UiButton>
      </div>
    </UiContainer>
  </div>
</template>
