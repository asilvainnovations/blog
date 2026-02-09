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
    // Uncomment to analyze bundle:
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
        // ✅ FIXED: Prevent circular dependencies
        manualChunks(id, { getModuleInfo }) {
          // Skip if not a node_modules import
          if (!id.includes('node_modules')) {
            return;
          }

          // Split React ecosystem
          if (id.includes('node_modules/react-dom')) {
            return 'react-dom';
          }
          if (id.includes('node_modules/react')) {
            return 'react-core';
          }
          
          // Split Supabase
          if (id.includes('@supabase')) {
            return 'supabase-client';
          }
          
          // Split rich text editors
          if (id.includes('lexical') || 
              id.includes('draft-js') || 
              id.includes('tiptap') ||
              id.includes('prosemirror') ||
              id.includes('slate')) {
            return 'rich-editor';
          }
          
          // Split charts
          if (id.includes('chart.js') || 
              id.includes('recharts') || 
              id.includes('victory') ||
              id.includes('apexcharts')) {
            return 'charts';
          }
          
          // Split utilities
          if (id.includes('lodash') || 
              id.includes('date-fns') || 
              id.includes('dayjs')) {
            return 'utils';
          }
          
          // Split UI components (icons, headlessui, etc)
          if (id.includes('@heroicons') ||
              id.includes('@radix-ui') ||
              id.includes('@headlessui') ||
              id.includes('lucide-react') ||
              id.includes('shadcn')) {
            return 'ui-components';
          }
          
          // ✅ CRITICAL FIX: Don't create circular deps
          // Group remaining vendor deps into 'vendor' chunk
          // This prevents: vendor -> react-core -> vendor circular reference
          return 'vendor';
        },
      },
    },
    // ✅ CRITICAL FIX: Enable Terser minification
    minify: 'terser', // ← REQUIRED to use terserOptions below
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
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'clsx',
      'tailwind-merge',
      'lucide-react',
    ],
    exclude: [],
  },
}));