<!-- app\pages\settings.vue -->
<template>
  <div class="settings-page min-h-screen bg-base-100 pt-16">
    <div class="container mx-auto p-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="card-title text-2xl">Настройки</h1>
          <div class="alert alert-info mt-4">
            <span>Страница настроек в разработке</span>
          </div>
          <button class="btn btn-primary mt-4" @click="$router.back()">
            Назад
          </button>
        </div>
      </div>
    </div>
  </div>
</template>