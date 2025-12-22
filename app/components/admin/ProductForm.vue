<!-- app\components\admin\ProductForm.vue -->
<template>
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">
        {{ editingProduct ? 'Редактировать товар' : 'Добавить новый товар' }}
      </h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Название -->
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">Название товара</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input input-bordered"
              placeholder="Введите название товара"
            />
          </div>

          <!-- Описание -->
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">Описание</span>
            </label>
            <textarea
              v-model="form.description"
              class="textarea textarea-bordered h-24"
              placeholder="Введите описание товара"
              required
            ></textarea>
          </div>

          <!-- Цена -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Цена (₽)</span>
            </label>
            <input
              v-model="form.price"
              type="number"
              required
              min="0"
              class="input input-bordered"
              placeholder="0"
            />
          </div>

          <!-- Количество на складе -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Количество на складе</span>
            </label>
            <input
              v-model="form.stockQuantity"
              type="number"
              required
              min="0"
              class="input input-bordered"
              placeholder="0"
            />
          </div>

          <!-- Категории -->
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">Категории (через запятую)</span>
            </label>
            <input
              v-model="form.categoriesString"
              type="text"
              class="input input-bordered"
              placeholder="Электроника, Смартфоны, Техника"
            />
          </div>

          <!-- URL изображения -->
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">URL изображения</span>
            </label>
            <input
              v-model="form.image"
              type="url"
              class="input input-bordered"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- В наличии -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">В наличии</span>
              <input
                v-model="form.inStock"
                type="checkbox"
                class="checkbox"
              />
            </label>
          </div>
        </div>

        <!-- Предпросмотр изображения -->
        <div v-if="form.image" class="mt-4">
          <label class="label">
            <span class="label-text">Предпросмотр изображения</span>
          </label>
          <div class="w-32 h-32 border rounded-lg overflow-hidden">
            <img
              :src="form.image"
              alt="Preview"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Сообщения об ошибках -->
        <div v-if="error" class="alert alert-error mt-4">
          <span>{{ error }}</span>
        </div>

        <!-- Кнопки -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ editingProduct ? 'Обновить' : 'Добавить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

const { addProduct, updateProduct } = useAppState()

const form = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  categoriesString: '',
  image: '',
  inStock: true
})

const loading = ref(false)
const error = ref('')

const editingProduct = computed(() => props.product)

// Заполняем форму при редактировании
watch(editingProduct, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      stockQuantity: newProduct.stockQuantity || 0,
      categoriesString: Array.isArray(newProduct.categories) ? newProduct.categories.join(', ') : '',
      image: newProduct.image || '',
      inStock: newProduct.inStock !== undefined ? newProduct.inStock : true
    }
  }
}, { immediate: true })

const handleImageError = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=400&fit=crop'
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.description) {
    error.value = 'Заполните обязательные поля'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const productData = {
      ...form.value,
      categories: form.value.categoriesString
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0)
    }

    let result
    if (editingProduct.value) {
      result = updateProduct(editingProduct.value.id, productData)
    } else {
      result = addProduct(productData)
    }

    if (result) {
      emit('save', result)
      emit('close')
    }
  } catch (err) {
    error.value = 'Произошла ошибка при сохранении товара'
    console.error('Ошибка сохранения товара:', err)
  } finally {
    loading.value = false
  }
}
</script>