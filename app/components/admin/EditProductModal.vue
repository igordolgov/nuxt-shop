<!-- app\components\admin\EditProductModal.vue -->
<template lang="pug">
.modal(v-if="isOpen" class="modal-open")
  .modal-box.max-w-2xl.relative
    //- Кнопка закрытия
    button.btn.btn-xs.btn-circle.btn-error.absolute.right-2.top-2(
      @click="handleCancel"
      :disabled="isSubmitting"
    ) ✕

    h3.text-xl.font-bold.mb-2 Редактировать товар
    form(@submit.prevent="handleSubmit" v-if="form")
      //- Основная информация - все в одну строку
      .grid.grid-cols-6.gap-3.mb-2
        //- Название товара
        .form-control.col-span-2
          label.label
            span.label-text Название товара *
          input.input.input-bordered.w-full(
            type="text"
            v-model="form.name"
            required
            placeholder="Введите название"
            :disabled="isSubmitting"
          )

        //- Категории
        .form-control.col-span-1
          label.label
            span.label-text Категории
          input.input.input-bordered.w-full(
            type="text"
            v-model="form.categoriesInput"
            placeholder="Электроника, Техника"
            :disabled="isSubmitting"
          )

        //- Цена
        .form-control
          label.label
            span.label-text Цена *
          input.input.input-bordered.w-full(
            type="number"
            v-model.number="form.price"
            required
            placeholder="0"
            min="0"
            step="0.01"
            :disabled="isSubmitting"
          )

        //- Количество на складе
        .form-control
          label.label
            span.label-text Количество
          input.input.input-bordered.w-full(
            type="number"
            v-model.number="form.stockQuantity"
            min="0"
            placeholder="0"
            :disabled="isSubmitting"
          )

        //- Статус наличия
        .form-control.flex.items-center.mt-2
          label.cursor-pointer.label
            input.checkbox.checkbox-primary.rounded-sm(
              type="checkbox"
              v-model="form.inStock"
              :disabled="isSubmitting"
            )
            span.label-text.text-xs В наличии

      //- Описание товара
      .form-control.mb-2
        label.label
          span.label-text Описание
        textarea.textarea.textarea-bordered.w-full(
          v-model="form.description"
          placeholder="Введите описание"
          rows="3"
          :disabled="isSubmitting"
        )

      //- Основное изображение
      .grid.grid-cols-4.gap-4.mb-6
        .form-control.col-span-3
          label.label
            span.label-text Основное изображение
          .flex.flex-col.gap-3
            //- URL ввод
            input.input.input-bordered.w-full(
              type="text"
              v-model="form.image"
              placeholder="https://example.com/image.jpg или загрузите файл"
              :disabled="isSubmitting"
            )
            //- Загрузка с компьютера
            .flex.gap-2.items-center
              input.file-input.file-input-bordered.file-input-sm.flex-1(
                type="file"
                ref="mainImageInput"
                accept="image/*"
                @change="handleMainImageUpload"
                :disabled="isSubmitting"
              )
              button.btn.btn-ghost.btn-sm(
                type="button"
                @click="clearMainImage"
                v-if="form.image"
                :disabled="isSubmitting"
              ) ✕

        //- Превью основного изображения
        .form-control.col-span-1.flex.items-end
          .w-full
            .text-xs.text-gray-500.mb-1 Превью:
            .w-full.h-24.border.rounded-lg.overflow-hidden.flex.items-center.justify-center.bg-gray-50
              template(v-if="form.image && isValidImage(form.image)")
                img(
                  :src="form.image" 
                  alt="Preview" 
                  class="w-full.h-full.object-cover"
                  @error="handleImageError"
                )
              template(v-else)
                .text-xs.text-gray-400 Нет изображения

      //- Галерея изображений
      .form-control.mb-0
        label.label
          span.label-text Галерея изображений (для карусели)
          span.label-text-alt (максимум {{ MAX_GALLERY_IMAGES }} изображений)
        .flex.flex-col.gap-3
          //- Загрузка нескольких изображений
          .flex.gap-2.items-center
            input.file-input.file-input-bordered.file-input-sm.flex-1(
              type="file"
              ref="galleryInput"
              accept="image/*"
              multiple
              @change="handleGalleryUpload"
              :disabled="isSubmitting"
            )
            button.btn.btn-outline.btn-sm(
              type="button"
              @click="triggerGalleryUpload"
              :disabled="isSubmitting"
            ) Добавить
          
          //- Счетчик изображений
          .text-xs.text-gray-500.mt-1(
            :class="{ 'text-error': form.gallery.length > MAX_GALLERY_IMAGES }"
          ) 
            | Изображений в галерее: {{ form.gallery.length }}/{{ MAX_GALLERY_IMAGES }}
            span.text-error(v-if="form.gallery.length > MAX_GALLERY_IMAGES")  - Превышено максимальное количество!
          
          //- Список загруженных изображений галереи
          .grid.grid-cols-6.gap-2.mt-2(v-if="form.gallery.length > 0")
            .relative(
              v-for="(image, index) in form.gallery"
              :key="index"
            )
              .w-full.h-20.border.rounded-lg.overflow-hidden
                img(
                  :src="image" 
                  :alt="`Gallery image ${index + 1}`" 
                  class="w-full.h-full.object-cover"
                  @error="handleGalleryImageError(index)"
                )
              button.btn.btn-xs.btn-circle.btn-error.absolute.-top-2.-right-2(
                @click="removeGalleryImage(index)"
                :disabled="isSubmitting"
              ) ✕

      //- Прогресс-бар
      .mt-4(v-if="uploadProgress > 0 && uploadProgress < 100")
        .w-full.bg-gray-200.rounded-full.h-2
          .bg-primary.h-2.rounded-full.transition-all.duration-300(:style="{ width: uploadProgress + '%' }")

      //- Сообщение об ошибке
      .alert.alert-error.mt-4(v-if="formError")
        .text-sm {{ formError }}

      //- Кнопки действий
      .modal-action.mt-6
        button.btn.btn-ghost(
          type="button" 
          @click="handleCancel"
          :disabled="isSubmitting"
        ) Отмена
        button.btn.btn-primary(
          type="submit" 
          :disabled="isSubmitting || !isFormValid || hasTooManyGalleryImages"
        ) 
          span.loading.loading-spinner.loading-sm.mr-2(v-if="isSubmitting")
          span(v-if="uploadProgress > 0 && uploadProgress < 100") Сохранение... {{ uploadProgress }}%
          span(v-else-if="isSubmitting") Сохранение...
          span(v-else) Сохранить
</template>

<script setup>
const { updateProduct } = useAppState()
const notify = useNotifyQueue()

const props = defineProps({
  isOpen: Boolean,
  product: Object,
  allCategories: Array
})

const emit = defineEmits(['update:isOpen', 'productUpdated'])

// Константы
const MAX_GALLERY_IMAGES = 5

const isSubmitting = ref(false)
const uploadProgress = ref(0)
const mainImageInput = ref(null)
const galleryInput = ref(null)
const form = ref(null)
const formError = ref('')

// Проверка валидности формы
const isFormValid = computed(() => {
  if (!form.value) return false
  
  const hasName = form.value.name && form.value.name.trim().length > 0
  const hasValidPrice = form.value.price !== null && form.value.price !== undefined && form.value.price >= 0
  
  return hasName && hasValidPrice
})

// Проверка на превышение лимита галереи
const hasTooManyGalleryImages = computed(() => {
  return form.value && form.value.gallery.length > MAX_GALLERY_IMAGES
})

// Проверка валидности изображения
const isValidImage = (imageUrl) => {
  if (!imageUrl) return false
  // Разрешаем data URLs, http URLs и относительные пути
  return imageUrl.startsWith('data:') || 
        imageUrl.startsWith('http') || 
        imageUrl.startsWith('/') ||
        imageUrl.startsWith('./')
}

// Обработка ошибки загрузки изображения
const handleImageError = (event) => {
  console.warn('Ошибка загрузки основного изображения:', form.value.image)
  formError.value = 'Не удалось загрузить основное изображение'
  notify.error('Не удалось загрузить основное изображение')
  // Очищаем невалидное изображение
  form.value.image = ''
}

// Обработка ошибки загрузки изображения галереи
const handleGalleryImageError = (index) => {
  console.warn('Ошибка загрузки изображения галереи:', form.value.gallery[index])
  formError.value = `Не удалось загрузить изображение ${index + 1} в галерее`
  notify.error(`Не удалось загрузить изображение ${index + 1} в галерее`)
  // Удаляем невалидное изображение
  form.value.gallery.splice(index, 1)
}

// Обработка загрузки основного изображения
const handleMainImageUpload = (event) => {
  const file = event.target.files[0]
  if (file && form.value) {
    // Показываем прогресс
    uploadProgress.value = 10
    
    const reader = new FileReader()
    reader.onloadstart = () => {
      uploadProgress.value = 20
    }
    reader.onload = (e) => {
      // Вместо сохранения base64, сохраняем только информацию о файле
      form.value.image = file.name // или URL если загружаете на сервер
      formError.value = '' // Очищаем ошибки
      uploadProgress.value = 0 // Сбрасываем прогресс после загрузки
      notify.success('Основное изображение загружено')
    }
    reader.onerror = () => {
      uploadProgress.value = 0
      formError.value = 'Ошибка загрузки изображения'
      notify.error('Ошибка загрузки изображения')
      console.error('Ошибка загрузки изображения')
    }
    reader.readAsDataURL(file) // Читаем только для превью
  }
}

// Обработка загрузки изображений галереи с ограничениями
const handleGalleryUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0 || !form.value) return
  
  // Ограничение количества изображений
  const currentCount = form.value.gallery.length
  const availableSlots = MAX_GALLERY_IMAGES - currentCount
  
  if (availableSlots <= 0) {
    formError.value = `Максимум ${MAX_GALLERY_IMAGES} изображений в галерее`
    notify.error(`Максимум ${MAX_GALLERY_IMAGES} изображений в галерее`)
    return
  }
  
  const filesToProcess = files.slice(0, availableSlots)
  
  // Ограничение размера файла (2MB)
  const maxSize = 2 * 1024 * 1024
  const validFiles = filesToProcess.filter(file => {
    if (file.size > maxSize) {
      notify.error(`Файл ${file.name} слишком большой (макс. 2MB)`)
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) return
  
  let loadedCount = 0
  const totalFiles = validFiles.length
  
  validFiles.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadstart = () => {
        uploadProgress.value = 30
      }
      reader.onload = (e) => {
        // Сжимаем изображение перед сохранением
        compressImage(e.target.result, 0.7).then(compressedImage => {
          form.value.gallery.push(compressedImage)
          loadedCount++
          
          // Обновляем прогресс
          uploadProgress.value = 30 + Math.floor((loadedCount / totalFiles) * 50)
          
          if (loadedCount === totalFiles) {
            uploadProgress.value = 0
            notify.success(`Загружено ${totalFiles} изображений в галерею`)
          }
        })
      }
      reader.onerror = () => {
        formError.value = 'Ошибка загрузки изображения галереи'
        notify.error('Ошибка загрузки изображения галереи')
      }
      reader.readAsDataURL(file)
    }
  })
  
  if (galleryInput.value) {
    galleryInput.value.value = ''
  }
}

// Функция сжатия изображения
const compressImage = (base64, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Уменьшаем размер
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(base64) // В случае ошибки возвращаем оригинал
  })
}

// Функция отмены
const handleCancel = () => {
  if (!isSubmitting.value) {
    formError.value = ''
    emit('update:isOpen', false)
  }
}

const handleSubmit = async () => {
  if (!form.value || !isFormValid.value) return
  
  // Проверка на превышение лимита галереи
  if (hasTooManyGalleryImages.value) {
    formError.value = `В галерее слишком много изображений (${form.value.gallery.length}/${MAX_GALLERY_IMAGES}). Пожалуйста, удалите лишние изображения перед сохранением.`
    notify.error(`Удалите лишние изображения из галереи (максимум ${MAX_GALLERY_IMAGES})`)
    return
  }
  
  isSubmitting.value = true
  uploadProgress.value = 10
  formError.value = ''
  
  try {
    const categories = form.value.categoriesInput
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0)

    const updatedProduct = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || '',
      price: Number(form.value.price),
      categories: categories,
      image: form.value.image || '',
      gallery: form.value.gallery || [],
      inStock: Boolean(form.value.inStock),
      stockQuantity: Number(form.value.stockQuantity) || 0
    }

    // Валидация данных
    if (updatedProduct.name.length === 0) {
      throw new Error('Название товара обязательно')
    }

    if (updatedProduct.price < 0) {
      throw new Error('Цена не может быть отрицательной')
    }

    if (updatedProduct.stockQuantity < 0) {
      throw new Error('Количество не может быть отрицательным')
    }

    console.log('📤 Обновление данных...')
    uploadProgress.value = 60

    // Обновляем товар и не зависим от возвращаемого значения
    await updateProduct(props.product.id, updatedProduct)
    
    uploadProgress.value = 90
    console.log('✅ Товар обновлен')

    // Показываем успешное уведомление
    notify.success('Товар успешно обновлен')
    
    // Эмитим событие с обновленными данными
    emit('productUpdated', {
      id: props.product.id,
      ...updatedProduct
    })
    
    uploadProgress.value = 100
    
    // Закрываем модальное окно после успешного обновления
    setTimeout(() => {
      isSubmitting.value = false
      uploadProgress.value = 0
      emit('update:isOpen', false)
    }, 500)
    
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error)
    formError.value = error.message || 'Произошла ошибка при обновлении товара'
    uploadProgress.value = 0
    
    // Показываем ошибку через систему уведомлений
    notify.error(error.message || 'Произошла ошибка при обновлении товара')
    isSubmitting.value = false
  }
}

// Очистка основного изображения
const clearMainImage = () => {
  if (form.value) {
    form.value.image = ''
  }
  if (mainImageInput.value) {
    mainImageInput.value.value = ''
  }
  formError.value = ''
  notify.info('Основное изображение удалено')
}

// Триггер для загрузки галереи
const triggerGalleryUpload = () => {
  galleryInput.value?.click()
}

// Удаление изображения из галереи
const removeGalleryImage = (index) => {
  if (form.value) {
    form.value.gallery.splice(index, 1)
  }
  formError.value = ''
  notify.info('Изображение удалено из галереи')
}

// Инициализация формы
const initializeForm = () => {
  if (props.product) {
    form.value = {
      name: props.product.name || '',
      description: props.product.description || '',
      price: props.product.price || 0,
      categoriesInput: Array.isArray(props.product.categories) ? props.product.categories.join(', ') : '',
      image: props.product.image || '',
      gallery: Array.isArray(props.product.gallery) ? [...props.product.gallery] : [],
      inStock: props.product.inStock !== undefined ? props.product.inStock : true,
      stockQuantity: props.product.stockQuantity || 0
    }
  }
}

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    initializeForm()
  }
}, { immediate: true })

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    // Сбрасываем состояние при закрытии
    form.value = null
    formError.value = ''
    uploadProgress.value = 0
    isSubmitting.value = false
    
    // Очищаем inputs файлов
    if (mainImageInput.value) {
      mainImageInput.value.value = ''
    }
    if (galleryInput.value) {
      galleryInput.value.value = ''
    }
  } else {
    // Инициализируем форму при открытии
    initializeForm()
  }
})
</script>