<script setup lang="ts">
const FAQ = [
  {
    question: 'What is the World Republic?',
    answer: 'The World Republic is a crypto-powered global democracy laboratory experimenting with innovative governance solutions to address humanity\'s most pressing challenges, such as climate change, geopolitical instability, and technological risks.'
  },
  {
    question: 'What is the world drachma?',
    answer: 'The world drachma is the World Republic\'s official digital currency. Backed by global democratic principles, it aims to compete with major currencies, provide a trusted medium of exchange, and support transformative projects.'
  },
  {
    question: 'What types of experiments does the World Republic run?',
    answer: 'We support a wide range of projects focused on democratic global solutions, translating theoretical ideas into actionable projects and encouraging the development of new initiatives.'
  },
  {
    question: 'Who can participate in the World Republic?',
    answer: 'Participation in the World Republic is open to individuals, organizations, and governments that share our vision for more democratic and collaborative global governance.'
  },
  {
    question: 'How can I get involved?',
    answer: 'There are several ways to get involved with the World Republic. You can join our community, participate in governance experiments, and invest in our digital currency.'
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
