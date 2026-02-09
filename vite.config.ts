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
    splitVendorChunkPlugin(), // ✅ Auto-splits large vendor chunks
    // Uncomment below to analyze bundle composition after build
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
        // ✅ Strategic manual chunking for heavy dependencies
        manualChunks(id) {
          // Split React ecosystem (core libraries)
          if (id.includes('node_modules/react')) {
            return 'react-core';
          }
          
          // Split React DOM (separate from core)
          if (id.includes('node_modules/react-dom')) {
            return 'react-dom';
          }
          
          // Split Supabase client (critical for auth/data)
          if (id.includes('@supabase')) {
            return 'supabase-client';
          }
          
          // Split rich text editor libraries (likely heaviest component)
          if (id.includes('lexical') || 
              id.includes('draft-js') || 
              id.includes('tiptap') ||
              id.includes('prosemirror') ||
              id.includes('slate')) {
            return 'rich-editor';
          }
          
          // Split charting libraries if used
          if (id.includes('chart.js') || 
              id.includes('recharts') || 
              id.includes('victory') ||
              id.includes('apexcharts')) {
            return 'charts';
          }
          
          // Split utility libraries
          if (id.includes('lodash') || 
              id.includes('date-fns') || 
              id.includes('dayjs') ||
              id.includes('moment')) {
            return 'utils';
          }
          
          // Split UI component libraries
          if (id.includes('node_modules/@heroicons') ||
              id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/@headlessui')) {
            return 'ui-components';
          }
          
          // Group other vendor dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // ✅ Optimize chunk sizes and compression
    chunkSizeWarningLimit: 700, // Increased after strategic splitting
    reportCompressedSize: true,
    minify: 'esbuild', // Fastest minification
    target: 'esnext', // Modern browsers only
    cssCodeSplit: true, // Split CSS into separate chunks
    sourcemap: mode === 'development', // Only in dev
    // ✅ Optimize Terser for better compression
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
  },
  // ✅ ESBuild optimizations
  esbuild: {
    legalComments: 'none', // Remove legal comments for smaller bundles
    pure: ['console.log', 'debugger'], // Remove debug code
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
    ],
    exclude: [
      // Exclude heavy libraries that don't need pre-bundling
    ],
  },
}));