import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(), // ✅ Auto-splits common vendor chunks
    // Uncomment to analyze bundle after build:
    // mode === 'production' && visualizer({ 
    //   filename: 'stats.html', 
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true 
    // }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ✅ CIRCULAR DEPENDENCY FIX: Order matters! Most specific FIRST
        manualChunks(id) {
          // Skip non-node_modules imports
          if (!id.includes('node_modules')) return;
          
          // 1. React DOM (MUST come before react-core)
          if (id.includes('node_modules/react-dom')) return 'react-dom';
          
          // 2. React Core (MUST come before generic checks)
          if (id.includes('node_modules/react')) return 'react-core';
          
          // 3. Supabase client
          if (id.includes('@supabase')) return 'supabase-client';
          
          // 4. Rich text editors (add your actual editor)
          if (/(lexical|tiptap|draft-js|slate|prosemirror)/.test(id)) return 'rich-editor';
          
          // 5. UI component libraries
          if (/@(heroicons|radix-ui|headlessui|lucide-react|shadcn)/.test(id)) return 'ui-components';
          
          // 6. Charts
          if (/(recharts|chart\.js|victory|apexcharts)/.test(id)) return 'charts';
          
          // 7. Utilities
          if (/(lodash|date-fns|dayjs)/.test(id)) return 'utils';
          
          // 8. Catch remaining vendor deps (WILL NOT include React/Supabase/UI)
          // Prevents: vendor -> react-core -> vendor circular reference
          return 'vendor';
        },
      },
    },
    // ✅ MINIFICATION: Use Terser (installed via npm install -D terser)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log in prod
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments from minified code
      },
    },
    // ✅ Chunk size limit (after optimization)
    chunkSizeWarningLimit: 700,
    reportCompressedSize: true,
    cssCodeSplit: true,
    sourcemap: mode === 'development',
  },
  // ✅ ESBuild optimizations
  esbuild: {
    legalComments: 'none',
    pure: ['console.log', 'debugger'],
  },
  // ✅ Optimize dependencies for faster dev server
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'date-fns',
    ],
    exclude: [],
  },
}));