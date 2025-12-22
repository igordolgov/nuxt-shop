import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: {
    port: 3000
  },
  vite: {
    server: {
      hmr: {
        port: 24679
      }
    },
    plugins: [tailwindcss()]
  },

    nitro: {
    routeRules: {
      '/admin/**': { middleware: ['admin-auth'] },
      '/manager/**': { middleware: ['manager-auth'] },
      '/user/**': { middleware: ['user-auth'] },
      '/auth/**': { redirect: false },

      '/api/**': { 
        cors: true,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      },
      '/api/products': {
        swr: false,
        cache: false
      }
    },
    
    // Оптимизации для продакшена
    minify: true,
    sourceMap: false,
  },
  
  // Оптимизации runtime
  runtimeConfig: {
    cacheDuration: 300,
    maxPageSize: 100,
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3001/api'
    }
  },

  srcDir: 'app/',
  
  modules: ['@nuxt/image', 'nuxt-swiper', '@nuxthub/core', '@pinia/nuxt'],

  components: [
    // UI компоненты (используются без префикса)
    { 
      path: '~/components/ui', 
      prefix: '',
      extensions: ['.vue'],
      pattern: '**/*.vue'
    },
    
    // Компоненты макета
    { 
      path: '~/components/layout', 
      prefix: 'Layout' 
    },
    
    // Компоненты продуктов
    { 
      path: '~/components/products', 
      prefix: 'Product' 
    },
    
    // Компоненты фильтров
    { 
      path: '~/components/filters', 
      prefix: 'Filter' 
    },
    
    // Компоненты корзины
    { 
      path: '~/components/cart', 
      prefix: 'Cart' 
    },
    
    // Админские компоненты
    { 
      path: '~/components/admin', 
      prefix: 'Admin' 
    },
    
    // Модальные окна
    { 
      path: '~/components/modals', 
      prefix: 'Modal' 
    },

    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  app: {
    head: {
      title: 'Интернет-магазин',
      meta: [
        { name: 'description', content: 'Лучший интернет-магазин' },
        { name: 'keywords', content: 'товары, покупки, магазин' }
      ],
      link: [{ rel: 'canonical', href: process.env.SITE_URL }],
      script: [
        {
          innerHTML: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            })();
          `,
          type: 'text/javascript',
          tagPosition: 'head'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css']
})