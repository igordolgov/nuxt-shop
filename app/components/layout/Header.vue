<!-- components/layout/Header.vue -->
<template lang="pug">
header.navbar.min-h-13.pt-2.bg-base-100.sticky.top-0.z-50(
  class="border-b border-secondary/60"
  :class="headerClasses"
)
  //- Начало: логотип и бургер-меню на мобильных
  .navbar-start.flex-0
    .flex.items-center
      //- Бургер меню для мобильных
      ClientOnly
        .dropdown.dropdown-end.relative(class="lg:hidden mr-2")
          label.btn.btn-ghost.btn-circle.p-0(
            tabindex="0" 
            :class="burgerButtonClasses"
          )
            svg.w-5.h-5(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="grey")
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16")
          ul.dropdown-content.menu.p-2.shadow.bg-base-100.rounded-box.w-64.z-50(
            class="mt-3 -left-4"
            tabindex="0"
          )
            li
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200(
                :class="isActiveRoute('/') ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/"
                @click="closeMobileMenu"
              ) Главная
            li
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200(
                :class="isActiveRoute('/news') ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/news"
                @click="closeMobileMenu"
              ) Новости
            li
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200(
                :class="isActiveRoute('/about') ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/about"
                @click="closeMobileMenu"
              ) О нас
            li
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200(
                :class="isActiveRoute('/contacts') ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/contacts"
                @click="closeMobileMenu"
              ) Контакты
            li
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200.flex.items-center.justify-between(
                :class="isActiveRoute('/favorites') ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/favorites"
                @click="closeMobileMenu"
              )
                span Избранное
                span.badge.badge-xs.badge-primary.ml-2(v-if="favoritesCount > 0") {{ favoritesCount }}
            li(v-if="isAdmin")
              .divider.my-1
              NuxtLink.px-4.py-2.rounded-lg.font-medium.transition-all.duration-200(
                :class="isAdminRouteActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
                to="/admin"
                @click="closeMobileMenu"
              ) Админка

      //- Логотип
      NuxtLink.flex.items-center.gap-2(to="/" class="lg:mr-6")
        .bg-primary.rounded-xl.flex.items-center.justify-center.shadow-lg(
          :class="logoContainerClasses"
        )
          span.text-white.font-bold(:class="logoTextClasses") М
        span.text-sky-700.font-bold(v-show="!isHomePageVertical") Магазин

  //- Центр: поиск на мобильных, меню на десктопе
  .navbar-center.flex-1.min-w-0
    //- Мобильные: поиск
    .search-and-filters-container.flex.items-center.gap-3.w-full.ml-3(class="lg:hidden")
      //- Компонент поиска
      .search-container.flex-1.min-w-0.max-w-auto
        SmartSearchInput(
          v-show="isHomePage"
          :products="allProducts"
          :isActive="isHomePage"
          :searchQuery="currentSearchQuery || ''"
          :isSearching="localIsSearching"
          :showSuggestions="localShowSuggestions"
          :suggestions="localSearchSuggestions"
          :hasSuggestions="localHasSearchSuggestions"
          :activeSuggestionIndex="localActiveSuggestionIndex"
          v-model:searchQuery="currentSearchQuery"
          @search="handleSearch"
          @selectProduct="handleProductSelect"
          @update:searchQuery="handleSearchQueryUpdate"
          @suggestionSelected="handleSuggestionSelected"
          @performSearch="handlePerformSearch"
          @resetSearch="handleResetSearch"
          @update:activeSuggestionIndex="handleUpdateActiveSuggestionIndex"
          @update:showSuggestions="handleUpdateShowSuggestions"
        )
      
      //- КНОПКА МОБИЛЬНЫХ ФИЛЬТРОВ
      ClientOnly
        button.filters-button.mobile-only(
          v-if="isHomePage"
          @click="toggleFilters"
          type="button"
          :class="{ 'active': showFilters }"
          class="sm:ml-2"
        )
          .filters-icon
            svg.w-5.h-5(
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            )
              path(
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              )
            .filters-badge(
              v-if="activeFiltersCount > 0"
            ) {{ activeFiltersCount }}
      
      //- МОБИЛЬНЫЕ ФИЛЬТРЫ
      ClientOnly
        MobileFiltersPanel(
          v-if="showFilters && showMobileFilters"
          :searchQuery="localSearchQuery"
          :categories="safeCategories"
          :filters="safeFilters"
          :sort="safeSort"
          :priceRange="safePriceRange"
          @update:filters="$emit('filters-update', $event)"
          @update:sort="$emit('sort-update', $event)"
          @update:searchQuery="$emit('search-query-update', $event)"
          @reset-filters="handleResetFiltersInHeader"
          @close="closeMobileFilters"
        )

    //- Десктоп: меню навигации
    nav.hidden(class="lg:block")
      ul.flex.items-center.gap-1
        li
          NuxtLink.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200(
            class="hover:bg-primary/30"
            :class="isActiveRoute('/') ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'"
            to="/"
          ) Главная
        li
          NuxtLink.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200(
            class="hover:bg-primary/30"
            :class="isActiveRoute('/news') ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'"
            to="/news"
          ) Новости
        li
          NuxtLink.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200(
            class="hover:bg-primary/30"
            :class="isActiveRoute('/about') ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'"
            to="/about"
          ) О нас
        li
          NuxtLink.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200(
            class="hover:bg-primary/30"
            :class="isActiveRoute('/contacts') ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'"
            to="/contacts"
          ) Контакты
        
        //- Пункт "Избранное" с бейджем
        li.relative
          NuxtLink.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200.flex.items-center.gap-2(
            class="hover:bg-primary/30"
            :class="isActiveRoute('/favorites') ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'"
            to="/favorites"
          )
            span Избранное
            span.badge.badge-xs.badge-primary.absolute.top-0.right-0.p-0.min-w-4.h-4.flex.items-center.justify-center.rounded-sm(
              v-if="favoritesCount > 0"
            ) {{ favoritesCount }}

        //- Админка (только для админов на десктопе)
        li.relative(v-if="isAdmin" class="hidden md:block")
          button.px-4.py-2.rounded-lg.font-medium.text-sm.transition-all.duration-200.flex.items-center.gap-1(
            class="hover:bg-primary/30 cursor-pointer"
            :class="{ 'bg-primary text-primary-content shadow-md': isAdminRouteActive || isAdminMenuOpen, 'text-base-content': !isAdminRouteActive && !isAdminMenuOpen }"
            @click="toggleAdminMenu"
            @keydown.enter="toggleAdminMenu"
            @keydown.space="toggleAdminMenu"
            @keydown.escape="closeAdminMenu"
            tabindex="0"
          )
            span Админка
            svg.w-4.h-4(
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            )
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7")
          
          //- Выпадающее меню админки
          .absolute.top-full.left-0.mt-2.bg-base-100.rounded-box.shadow-lg.border.border-base-300.z-50(
            v-show="isAdminMenuOpen"
            class="min-w-48"
          )
            .flex.flex-col.p-2.gap-1
              NuxtLink.flex.items-center.gap-3.p-2.rounded-lg.transition-colors(
                to="/admin"
                @click="closeAdminMenu"
                :class="isExactActiveRoute('/admin') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
              )
                .w-5.h-5.flex.items-center.justify-center 📊
                span.text-sm Дашборд
              
              NuxtLink.flex.items-center.gap-3.p-2.rounded-lg.transition-colors(
                to="/admin/products"
                @click="closeAdminMenu"
                :class="isExactActiveRoute('/admin/products') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
              )
                .w-5.h-5.flex.items-center.justify-center 📦
                span.text-sm Товары
              
              NuxtLink.flex.items-center.gap-3.p-2.rounded-lg.transition-colors(
                to="/admin/users"
                @click="closeAdminMenu"
                :class="isExactActiveRoute('/admin/users') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
              )
                .w-5.h-5.flex.items-center.justify-center 👥
                span.text-sm Пользователи

  //- Конец: элементы управления
  .navbar-end.flex-shrink-0
    .flex.items-center(class="lg:gap-3")
      //- Поиск на десктопе
      .search-desktop.hidden(v-if="isHomePage" class="lg:block lg:flex-1 lg:max-w-md")
        SmartSearchInput(
          :products="allProducts"
          :isActive="true"
          :searchQuery="currentSearchQuery || ''"
          :isSearching="localIsSearching"
          :showSuggestions="localShowSuggestions"
          :suggestions="localSearchSuggestions"
          :hasSuggestions="localHasSearchSuggestions"
          :activeSuggestionIndex="localActiveSuggestionIndex"
          v-model:searchQuery="currentSearchQuery"
          @search="handleSearch"
          @selectProduct="handleProductSelect"
          @update:searchQuery="handleSearchQueryUpdate"
          @suggestionSelected="handleSuggestionSelected"
          @performSearch="handlePerformSearch"
          @resetSearch="handleResetSearch"
          @update:activeSuggestionIndex="handleUpdateActiveSuggestionIndex"
          @update:showSuggestions="handleUpdateShowSuggestions"
        )
      
      //- Корзина на десктопе
      .indicator.ml-2(class="hidden lg:block")
        NuxtLink.btn.btn-ghost.btn-circle(
          to="/cart"
          class="hover:bg-primary/30"
          :class="cartButtonClasses"
        )
          svg.h-5.w-5(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-base-content/70")
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z")
        span.badge.badge-xs.badge-error.absolute.top-2.right-1.indicator-item.rounded-xl.w-2(
          v-if="cartItemsCount > 0"
        ) {{ cartItemsCount }}

      //- Переключатель тем 
      ClientOnly
        button.btn.btn-ghost.btn-circle.mr-2.text-base-200.bg-secondary(
          :class="themeButtonClasses"
          @click="toggleTheme" 
          :title="currentTheme === 'corporate' ? 'Включить тёмную тему' : 'Включить светлую тему'"
        )
          svg(
            v-if="currentTheme === 'corporate'" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            :class="themeIconClasses"
          )
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z")
          svg(
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            :class="themeIconClasses"
          )
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646A9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z")

      //- Меню пользователя
      .relative(v-if="isAuthenticated").ml-0.flex-shrink-0
        button.flex.items-center.gap-2.cursor-pointer(
          class="hover:bg-base-300 rounded-lg transition-colors text-base-content"
          :class="userButtonClasses"
          @click="toggleUserMenu"
          @keydown.enter="toggleUserMenu"
          @keydown.space="toggleUserMenu"
          @keydown.escape="closeUserMenu"
          tabindex="0"
        )
          .avatar
            .rounded-full.bg-primary.flex.items-center.justify-center.text-white.font-bold(
              :class="avatarClasses"
            )
              span {{ userInitials }}
          span.font-medium.text-sm(class="hidden sm:block") {{ userName }}
          svg.w-4.h-4(
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            :class="{ 'transform rotate-180': isUserMenuOpen }"
          )
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7")

        //- Кастомное выпадающее меню пользователя
        .absolute.top-full.right-0.bg-base-100.rounded-box.shadow-lg.border.border-base-300.z-50(
          v-show="isUserMenuOpen"
          class="min-w-auto"
        )
          .flex.flex-col.p-2
            //- Информация о пользователе
            .px-3.py-0.border-b.border-base-300.mb-0
              .text-xs.text-base-content.opacity-70 {{ userEmail }}
              .badge.badge-sm.mt-1(
                :class="userRole === 'admin' ? 'badge-primary' : userRole === 'manager' ? 'badge-secondary' : 'badge-accent'"
              ) 
                | {{ userRole === 'admin' ? 'Администратор' : userRole === 'manager' ? 'Менеджер' : 'Пользователь' }}
            
            //- Пункты меню
            button.flex.items-center.gap-3.p-2.rounded-lg.transition-colors.w-full.text-left.cursor-pointer(
              @click="navigateToPath('/user')"
              :class="isExactActiveRoute('/user') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
            )
              .w-5.h-5.flex.items-center.justify-center
                svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")
              span.text-sm Личный кабинет

            //- Управление пользователями только для админов
            button.flex.items-center.gap-3.p-2.rounded-lg.transition-colors.w-full.text-left.cursor-pointer(
              v-if="isAdmin"
              @click="navigateToPath('/admin/users')"
              :class="isExactActiveRoute('/admin/users') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
            )
              .w-5.h-5.flex.items-center.justify-center
                svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z")
              span.text-sm Управление пользователями

            button.flex.items-center.gap-3.p-2.rounded-lg.transition-colors.w-full.text-left.cursor-pointer(
              @click="navigateToPath('/settings')"
              :class="isExactActiveRoute('/settings') ? 'bg-primary text-primary-content' : 'hover:bg-base-300 text-base-content'"
            )
              .w-5.h-5.flex.items-center.justify-center
                svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z")
              span.text-sm Настройки

            button.flex.items-center.gap-3.p-2.rounded-lg.transition-colors.w-full.text-left.cursor-pointer(
              @click="handleLogout"
              class="text-red-500 hover:bg-error/30"
            )
              .w-5.h-5.flex.items-center.justify-center
                svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1")
              span.text-sm Выйти

      //- Кнопка входа (только для неавторизованных)
      NuxtLink.btn.btn-primary.max-h-9.ml-3.rounded-lg.flex-shrink-0(
        v-else
        to="/auth/login"
        class="transition-all duration-200 hover:shadow-md hover:scale-105"
        :class="loginButtonClasses"
      )
        svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
          path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1")
        span.hidden(class="sm:inline") Войти
</template>

<style scoped>
/* Плавные переходы для меню */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Стили для кнопки фильтров */
.filters-button.mobile-only {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: hsl(var(--p));
  color: hsl(var(--pc));
  border-radius: var(--rounded-btn, 0.5rem);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: none;
  flex-shrink: 0;
}

.filters-button.mobile-only:hover {
  background: hsl(var(--pf));
  transform: translateY(-1px);
}

.filters-button.mobile-only.active {
  background: hsl(var(--a));
}

.filters-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.filters-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: oklch(55% 0.2 40);
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid hsl(var(--b1));
}

.filters-text {
  font-size: 13px;
}

/* Скрываем на десктопе */
@media (min-width: 1025px) {
  .filters-button.mobile-only {
    display: none;
  }
}

/* Адаптация для маленьких экранов */
@media (max-width: 480px) {
  .filters-button {
    padding: 6px 8px;
  }
  
  .filters-text {
    display: none;
  }
  
  .filters-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .filters-badge {
    top: -4px;
    right: -6px;
    width: 12px;
    height: 12px;
    font-size: 8px;
  }
}

/* Стили для контейнера поиска и фильтров */
.search-and-filters-container {
  min-width: 0;
}

.search-container {
  min-width: 0;
  flex: 1;
}

/* Десктопное меню */
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav ul li a,
nav ul li button {
  text-decoration: none;
  white-space: nowrap;
}

/* Стили для поиска на десктопе */
.search-desktop {
  min-width: 300px;
  max-width: 500px;
  flex: 1;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .search-and-filters-container {
    gap: 8px;
  }
  
  .search-container {
    min-width: 150px;
  }
}

@media (max-width: 640px) {
  .search-and-filters-container {
    flex-direction: row;
    gap: 2px;
  }
  
  .search-container {
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .search-container {
    min-width: 124px;
    margin-right: 4px;
  }
  
  .navbar-start .text-lg {
    display: none;
  }
}

/* Десктопные стили */
@media (min-width: 1024px) {
  .navbar-center nav {
    display: block;
  }
  
  .search-and-filters-container {
    display: none;
  }
  
  .navbar-start .dropdown {
    display: none;
  }
}

/* Исправление позиции бургер-меню */
.dropdown.dropdown-end .dropdown-content {
  position: absolute;
  left: 0;
  right: auto;
  min-width: 240px;
}

@media (max-width: 768px) {
  .dropdown.dropdown-end .dropdown-content {
    left: -12px;
  }
}

/* Стили для бейджа избранного */
.favorites-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: oklch(var(--p));
  color: oklch(var(--pc));
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid oklch(var(--b1));
}
</style>

<script setup>
// Props
const props = defineProps({
  displayedProductsCount: {
    type: Number,
    default: 0
  },
  totalProductsCount: {
    type: Number,
    default: 0
  },
  activeFiltersCount: {
    type: Number,
    default: 0
  },
  // Новые props для поиска и фильтров
  searchQuery: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  showSuggestions: {
    type: Boolean,
    default: false
  },
  searchSuggestions: {
    type: Array,
    default: () => []
  },
  hasSearchSuggestions: {
    type: Boolean,
    default: false
  },
  activeSuggestionIndex: {
    type: Number,
    default: -1
  },
  showFilters: {
    type: Boolean,
    default: false
  }
})

import { watch, computed, onMounted, onUnmounted, ref } from 'vue'
import SmartSearchInput from '~/components/products/SmartSearchInput.vue'
import MobileFiltersPanel from '~/components/layout/MobileFiltersPanel.vue'
import { useMobileDetection } from '@/composables/useMobileDetection'
// Используем useFavorites для получения количества избранных товаров
import { useFavorites } from '~/composables/useFavorites'
const { favoritesCount } = useFavorites()

// Импортируем useCart
import { useCart } from '~/composables/useCart'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')

// Используем useAppState() вместо useAuth()
const appState = useAppState()
const { user, isAuthenticated, isAdmin, logout } = appState

const { $notify } = useNuxtApp()
const router = useRouter()

// импорт useMobileDetection
const { isMobile } = useMobileDetection()

// Используем useCart для получения количества товаров
// Получаем totalItems как computed свойство из useCart
const { totalItems } = useCart()
const cartItemsCount = computed(() => totalItems.value)

// Текущая тема - используем ref
const currentTheme = ref('corporate')

// Состояние для меню
const isAdminMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// Emits для поиска и фильтров
const emit = defineEmits([
  'update:searchQuery',
  'suggestionSelected',
  'performSearch',
  'resetSearch',
  'toggleFilters',
  'search',
  'clear-search',
  'update:activeSuggestionIndex',
  'update:showSuggestions',
  'filters-update',
  'sort-update',
  'search-query-update',
  'reset-filters'
])

// Функция для обработки сброса фильтров в Header
const handleResetFiltersInHeader = () => {
  // Закрываем панель
  showMobileFilters.value = false
  // Эмитим событие наверх
  emit('reset-filters')
}

// Функция для закрытия мобильных фильтров
const closeMobileFilters = () => {
  showMobileFilters.value = false
  // Эмитим событие закрытия фильтров
  emit('toggleFilters', false)
}

// Локальное состояние для поиска
const currentSearchQuery = ref(props.searchQuery || '')
const localIsSearching = ref(props.isSearching)
const localShowSuggestions = ref(props.showSuggestions)
const localSearchSuggestions = ref(props.searchSuggestions)
const localHasSearchSuggestions = ref(props.hasSearchSuggestions)
const localActiveSuggestionIndex = ref(props.activeSuggestionIndex)

// Все продукты для поиска
const allProducts = computed(() => {
  return appState.products?.value || []
})

// Debounce для поиска
let debounceTimer = null

// Используем ClientOnly для клиентских состояний
const showMobileFilters = ref(false)
const showMobileFiltersButton = ref(false)

// Инициализация клиентских состояний
onMounted(() => {
  showMobileFilters.value = false
  showMobileFiltersButton.value = isMobile.value
})

// ============================================
// ВЫЧИСЛЯЕМЫЕ КЛАССЫ ДЛЯ РАЗНЫХ УСТРОЙСТВ
// ============================================

// Классы для хедера
const headerClasses = computed(() => {
  return [
    'px-0 sm:px-0 lg:px-6',
    'h-10 md:h-11 lg:h-12',
    'pt-0.5 md:pt-1 lg:pt-1.5',
  ]
})

// Классы для бургер-кнопки
const burgerButtonClasses = computed(() => {
  return [
    'h-8 w-8 md:h-9 md:w-9', // Уменьшено на мобильных
    'hover:bg-base-300'
  ]
})

// Классы для контейнера логотипа
const logoContainerClasses = computed(() => {
  return [
    'w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9' // Уменьшено на мобильных
  ]
})

// Классы для текста логотипа
const logoTextClasses = computed(() => {
  return [
    'text-xs md:text-sm lg:text-lg' // Уменьшено на мобильных
  ]
})

// Классы для кнопки темы
const themeButtonClasses = computed(() => {
  return [
    'hover:bg-neutral-400',
    'w-7 h-7 md:w-8 md:h-8', // Уменьшено на мобильных
    'transition-transform duration-200 hover:scale-110',
    'ml-2 md:ml-3'
  ]
})

// Классы для иконки темы
const themeIconClasses = computed(() => {
  return [
    'h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5' // Уменьшено на мобильных
  ]
})

// Классы для аватара пользователя
const avatarClasses = computed(() => {
  return [
    'w-7 h-7 md:w-7 md:h-7 lg:w-8 lg:h-8' // Уменьшено на мобильных
  ]
})

// Классы для кнопки пользователя
const userButtonClasses = computed(() => {
  return [
    'py-1.5 md:py-2 lg:py-2', // Уменьшены отступы на мобильных
    'px-2 md:px-2 lg:px-3'
  ]
})

// Классы для кнопки корзины (десктоп)
const cartButtonClasses = computed(() => {
  return [
    'w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9' // Для десктопной версии
  ]
})

// Классы для кнопки входа
const loginButtonClasses = computed(() => {
  return [
    'h-8 md:h-9 lg:h-10', // Уменьшена высота на мобильных
    'px-2 md:px-3 lg:px-4',
    'text-xs md:text-sm'
  ]
})

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ДЛЯ РЕАКТИВНОСТИ
// ============================================

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const userName = computed(() => {
  return user.value?.name || 'Пользователь'
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userRole = computed(() => {
  return user.value?.role || 'user'
})

// Добавьте computed свойства для фильтров
const safeCategories = computed(() => [])
const safeFilters = computed(() => ({}))
const safeSort = computed(() => ({}))
const safePriceRange = computed(() => ({}))

// Добавляем вычисляемое свойство isHomePageVertical
const isHomePageVertical = computed(() => {
  return isHomePage.value && isMobile.value
})

// Проверка активных админских маршрутов
const isAdminRouteActive = computed(() => {
  return route.path.startsWith('/admin')
})

// Функция переключения темы
const toggleTheme = () => {
  if (process.client) {
    currentTheme.value = currentTheme.value === 'corporate' ? 'business' : 'corporate'
    document.documentElement.setAttribute('data-theme', currentTheme.value)
    localStorage.setItem('theme', currentTheme.value)
  }
}

// Переключение меню админки
const toggleAdminMenu = () => {
  isAdminMenuOpen.value = !isAdminMenuOpen.value
  // Закрываем другое меню при открытии этого
  if (isAdminMenuOpen.value) {
    isUserMenuOpen.value = false
  }
}

// Закрытие меню админки
const closeAdminMenu = () => {
  isAdminMenuOpen.value = false
}

// Переключение меню пользователя
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  // Закрываем другое меню при открытии этого
  if (isUserMenuOpen.value) {
    isAdminMenuOpen.value = false
  }
}

// Закрытие меню пользователя
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// Закрытие мобильного меню
const closeMobileMenu = () => {
  // Для DaisyUI dropdown нужно снять фокус
  if (process.client) {
    const dropdown = document.querySelector('.dropdown input[type="checkbox"]')
    if (dropdown) {
      dropdown.checked = false
    }
  }
}

// Проверка активного маршрута (для основного меню)
const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Проверка точного активного маршрута (для выпадающих меню)
const isExactActiveRoute = (path) => {
  return route.path === path
}

// Функция навигации
const navigateToPath = async (path) => {
  closeAdminMenu()
  closeUserMenu()
  closeMobileMenu()
  await navigateTo(path)
}

// Обработчики поиска с debounce
const handleSearchQueryUpdate = (value) => {
  currentSearchQuery.value = value
  
  // Очищаем предыдущий таймер
  if (debounceTimer) clearTimeout(debounceTimer)
  
  // Устанавливаем новый таймер с задержкой
  debounceTimer = setTimeout(() => {
    emit('update:searchQuery', value)
    emit('search', value)
  }, 300) // 300ms debounce
  
  // Показываем подсказки при вводе
  if (value && value.length >= 2 && !localShowSuggestions.value) {
    localShowSuggestions.value = true
    emit('update:showSuggestions', true)
  }
}

const handleSearch = (query) => {
  console.log('🔍 Поиск:', query)
  emit('search', query)
}

const handleSuggestionSelected = (suggestion) => {
  console.log('🎯 Выбрана подсказка:', suggestion.name)
  emit('suggestionSelected', suggestion)
}

const handlePerformSearch = () => {
  console.log('🔍 Выполнение поиска')
  emit('performSearch')
}

const handleResetSearch = () => {
  console.log('🧹 Сброс поиска')
  currentSearchQuery.value = ''
  localShowSuggestions.value = false
  localActiveSuggestionIndex.value = -1
  emit('resetSearch')
  emit('clear-search')
  emit('update:showSuggestions', false)
}

const handleProductSelect = (product) => {
  console.log('🎯 Выбран товар:', product.name)
  emit('suggestionSelected', product)
}

const toggleFilters = () => {
  showMobileFilters.value = !showMobileFilters.value
  emit('toggleFilters', showMobileFilters.value)
}

const handleUpdateActiveSuggestionIndex = (index) => {
  localActiveSuggestionIndex.value = index
  emit('update:activeSuggestionIndex', index)
}

const handleUpdateShowSuggestions = (value) => {
  localShowSuggestions.value = value
  emit('update:showSuggestions', value)
}

// Обработчики для фильтров
const handleFiltersUpdate = (filters) => {
  // Здесь должна быть логика обновления фильтров
}

const handleSortUpdate = (sort) => {
  // Здесь должна быть логика обновления сортировки
}

const handleResetFiltersOnly = () => {
  // Сбрасываем только фильтры, НЕ трогаем сортировку
  filters.value = {}
  
  // Перезагружаем товары
  loadProducts()
  
  // Прокручиваем к началу
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const handleClosePanel = () => {
  isFiltersOpen.value = false
}

const handleCloseAndScroll = () => {
  isFiltersOpen = false;
  
  // Прокрутка к началу списка товаров
  const productList = document.querySelector('.products-list'); // селектор вашего контейнера товаров
  if (productList) {
    productList.scrollTop = 0;
  }
  
  // Или для window, если список товаров скроллит весь документ
  // window.scrollTo({ top: 0, behavior: 'smooth' });
}

const resetAllFilters = () => {
  // Ваша логика сброса фильтров
  filters.value = {};
  sort.value = {};
  searchQuery.value = '';
}

// Выход из системы
const handleLogout = async () => {
  try {
    closeAdminMenu()
    closeUserMenu()
    closeMobileMenu()
    
    const result = await appState.logout()
    
    if (result.success) {
      $notify.success('Вы успешно вышли из системы', 'До свидания!')
      await navigateTo('/')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Ошибка выхода:', error)
    $notify.error('Ошибка при выходе из системы', 'Ошибка')
  }
}

// Закрываем меню при клике вне их
const closeMenusOnClickOutside = (event) => {
  if (!process.client) return
  
  const adminMenuElement = event.target.closest('li.relative')
  const userMenuElement = event.target.closest('.relative')
  const mobileMenuElement = event.target.closest('.dropdown.dropdown-end')
  
  if (!adminMenuElement && isAdminMenuOpen.value) {
    closeAdminMenu()
  }
  
  if (!userMenuElement && isUserMenuOpen.value) {
    closeUserMenu()
  }
  
  // Для мобильного меню DaisyUI сам управляет закрытием
}

// Загрузка темы из localStorage при монтировании
onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      currentTheme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme', currentTheme.value)
    }
    
    // Добавляем обработчик клика вне меню
    document.addEventListener('click', closeMenusOnClickOutside)
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (process.client) {
    document.removeEventListener('click', closeMenusOnClickOutside)
  }
})

// Закрываем меню при изменении маршрута
watch(() => route.path, () => {
  closeAdminMenu()
  closeUserMenu()
  closeMobileMenu()
})
</script>