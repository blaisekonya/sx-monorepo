<script setup lang="ts">
const FAQ = [
  {
    question: 'What is the World Republic?',
    answer: 'The World Republic is an experiment in global democracy. It seeks to create a system of governance that encourages collective action to address global challenges through participatory decision-making and equitable representation.'
  },
  {
    question: 'Why is the World Republic needed?',
    answer: 'The World Republic addresses global challenges like climate change, nuclear threats, pandemics, and AI advancement that demand a unified approach to ensure effective solutions.'
  },
  {
    question: 'How does the World Republic ensure democratic participation?',
    answer: 'The World Republic facilitates democratic participation using proof-of-personhood systems, to ensure secure, anonymous, and verifiable engagement in global decision-making.'
  },
  {
    question: 'How is the World Republic funded?',
    answer: 'The World Republic is self-financed through its digital currency, which is designed to support the Republic’s activities within a decentralized and transparent economic framework.'
  },
  {
    question: 'Does the World Republic aim to replace existing governments?',
    answer: 'No, the World Republic does not seek to replace existing governments. Its goal is to complement and enhance global governance through democratic processes while respecting the sovereignty of individual nations.'
  },
  {
    question: 'Is establishing democratic global governance realistic?',
    answer: 'While there are significant challenges, there is <a href="https://academic.oup.com/isq/article/68/3/sqae105/7732859" target="_blank" rel="noopener">growing public support</a> and advancements in technology that make the establishment of a democratic global federation increasingly feasible.'
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
            <h3 class="py-3 flex-auto text-[21px]" v-text="question.question" />
            <IH-minus-sm v-if="currentQuestion === i" class="text-skin-text" />
            <IH-plus-sm v-else class="text-skin-text" />
          </button>
          <div v-if="currentQuestion === i" class="text-[18px] pb-4 -mt-1" v-html="question.answer" />
        </div>
      </UiContainer>
    </div>
  </div>
</template>
