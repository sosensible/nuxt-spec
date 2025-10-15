<template>
  <div class="min-h-screen bg-white">
    <!-- Page Header -->
    <header class="bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          About Our Platform
        </h1>
        <p class="text-xl text-gray-600">
          Learn more about what makes us different and how we can help you achieve your goals.
        </p>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Mission Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">
          Our Mission
        </h2>
        <div class="prose prose-lg max-w-none">
          <p class="text-lg text-gray-600 mb-4">
            We believe in building something amazing together. Our platform is designed to empower
            individuals and teams to create, collaborate, and achieve more than they ever thought possible.
          </p>
          <p class="text-lg text-gray-600">
            Since our founding, we've been committed to providing tools that are not just powerful,
            but also intuitive and accessible to everyone, regardless of their technical background.
          </p>
        </div>
      </section>

      <!-- Values Section -->
      <section class="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">
          Our Core Values
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="value in values" :key="value.id" class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">{{ value.emoji }}</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              {{ value.title }}
            </h3>
            <p class="text-gray-600">
              {{ value.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">
          By the Numbers
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.id"
            class="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div class="text-4xl font-bold text-blue-600 mb-2">
              {{ stat.number }}
            </div>
            <div class="text-gray-600 font-medium">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation -->
      <section class="text-center">
        <NuxtLink to="/"
          class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Back to Home
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// Phase 1.3: Simplified info page without composables/stores

const values = [
  {
    id: 'innovation',
    emoji: '💡',
    title: 'Innovation',
    description: 'We constantly push boundaries and explore new possibilities to deliver cutting-edge solutions.'
  },
  {
    id: 'reliability',
    emoji: '🛡️',
    title: 'Reliability',
    description: 'Our platform is built on a foundation of trust, ensuring consistent performance you can depend on.'
  },
  {
    id: 'collaboration',
    emoji: '🤝',
    title: 'Collaboration',
    description: 'We believe in the power of working together to achieve extraordinary results.'
  },
  {
    id: 'simplicity',
    emoji: '✨',
    title: 'Simplicity',
    description: 'Complex problems deserve elegant solutions that are easy to understand and use.'
  }
]

const stats = [
  {
    id: 'users',
    number: '10,000+',
    label: 'Active Users'
  },
  {
    id: 'projects',
    number: '50,000+',
    label: 'Projects Created'
  },
  {
    id: 'uptime',
    number: '99.9%',
    label: 'Uptime'
  },
  {
    id: 'support',
    number: '24/7',
    label: 'Support Available'
  }
]

// SEO
useHead({
  title: 'About Our Platform - Our Site',
  meta: [
    {
      name: 'description',
      content: 'Learn more about our platform, our mission, values, and what makes us different.'
    }
  ]
})
</script>
