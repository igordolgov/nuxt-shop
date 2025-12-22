<!-- app\components\admin\AdminProductItem.vue -->
<template lang="pug">
.bg-base-200.rounded-lg.shadow.p-4
  .grid.grid-cols-1.gap-4.bg-base-200(
    class="md:grid-cols-2"
  )
    //- Левая колонка - основные данные
    .space-y-4.bg-base-200
      div
        label.block.text-sm.font-medium.mb-1 Название
        input.w-full.p-2.border.rounded(
          v-model="localProduct.name"
          class="focus:border-blue-500"
        )

      div
        label.block.text-sm.font-medium.mb-1 Описание
        textarea.w-full.p-2.border.rounded(
          v-model="localProduct.description"
          rows="3"
          class="focus:border-blue-500"
        )

      div
        label.block.text-sm.font-medium.mb-1 Цена
        input.w-full.p-2.border.rounded(
          v-model.number="localProduct.price"
          type="number"
          class="focus:border-blue-500"
        )

    //- Правая колонка - дополнительные данные
    .space-y-4.bg-base-200
      div
        label.block.text-sm.font-medium.mb-1 Категории
        input.w-full.p-2.border.rounded(
          v-model="categoryInput"
          placeholder="Введите категории через запятую"
          class="focus:border-blue-500"
          @blur="updateCategories"
        )
        .text-xs.text-gray-500.mt-1 Категории: {{ localProduct.categories?.join(', ') }}

      div
        label.flex.items-center
          input.mr-2(
            type="checkbox"
            v-model="localProduct.inStock"
          )
          span В наличии

      //- Кнопки действий
      .flex.space-x-2
        button.bg-blue-500.text-white.px-3.py-1.text-sm.rounded(
          class="hover:bg-blue-600"
          @click="saveChanges"
        ) Сохранить
        button.bg-red-500.text-white.px-3.py-1.text-sm.rounded(
          class="hover:bg-red-600"
          @click="deleteProduct"
        ) Удалить
</template>

<script setup>
// Пропсы компонента
const props = defineProps({
  product: Object
})

// Локальная копия для редактирования
const localProduct = ref({ ...props.product })
const categoryInput = ref(props.product.categories?.join(', ') || '')

// Используем глобальное состояние для уведомлений
const { addNotification } = useAppState()

// Обновление категорий из input
const updateCategories = () => {
  if (categoryInput.value.trim()) {
    localProduct.value.categories = categoryInput.value
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0)
  }
}

// Сохранение изменений
const saveChanges = () => {
  console.log('💾 Сохранение изменений товара:', localProduct.value)
  addNotification('Изменения сохранены!', 'success')
}

// Удаление товара
const deleteProduct = () => {
  if (confirm('Удалить этот товар?')) {
    console.log('🗑️ Удаление товара:', props.product.id)
    addNotification('Товар удален!', 'success')
  }
}
</script>