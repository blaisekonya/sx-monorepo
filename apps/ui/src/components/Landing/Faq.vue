<script setup lang="ts">
const FAQ = [
  {
    question: 'What is the World Republic?',
    answer: 'The World Republic is a crypto-powered global democracy laboratory that experiments with innovative governance solutions to tackle pressing challenges like climate change, geopolitical instability, and technological risks.'
  },
  {
    question: 'What types of experiments does the World Republic run?',
    answer: 'We conduct experiments that bring theoretical governance ideas into practice, supporting both established proposals and new initiatives, as well as projects that develop innovative tools for democratic solutions.'
  },
  {
    question: 'What kind of support does the World Republic offer for projects?',
    answer: 'We provide access to funding, resources, and cutting-edge tools to help teams and individuals implement their governance proposals effectively.'
  },
  {
    question: 'What is the world drachma?',
    answer: 'The world drachma is the World Republic\'s digital currency, designed to support the democratization of global governance.'
  },
  {
    question: 'How can I get involved?',
    answer: 'Participate in our experiments, secure funding for your projects, and join our community to discuss and shape the future of global governance.'
  }
];

const currentQuestion = ref();

function toggleQuestion(id) {
  currentQuestion.value = currentQuestion.value === id ? '' : id;
}
</script>

<template>
  <div id="faq" class="pt-8 border-b">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[640px]">
        <h1 class="mb-4 font-display text-[36px] xs:text-[44px]">
          Frequently asked questions
        </h1>
      </div>
    </UiContainer>
    <div class="border-t">
      <UiContainer class="!max-w-screen-lg py-4">
        <div v-for="(question, i) in FAQ" :key="i" class="border-b last:border-b-0">
          <button type="button" class="flex items-center w-full text-left" @click="toggleQuestion(i)">
            <h3 class="py-3 flex-auto text-[20px]" v-text="question.question" />
            <IH-minus-sm v-if="currentQuestion === i" class="text-skin-text" />
            <IH-plus-sm v-else class="text-skin-text" />
          </button>
          <div v-if="currentQuestion === i" class="text-[18px] pb-4 -mt-1" v-html="question.answer" />
        </div>
      </UiContainer>
    </div>
  </div>
</template>
