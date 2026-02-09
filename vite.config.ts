import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    // Uncomment to analyze: mode === 'production' && visualizer({ filename: 'stats.html', open: true })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ✅ CRITICAL FIX: Combine React ecosystem to eliminate circular warnings
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          
          // 1. COMBINE React + ReactDOM (prevents circular dependency warnings)
          if (/node_modules[\/\\](react|react-dom|react-router-dom)[\/\\]/.test(id)) {
            return 'react-vendor';
          }
          
          // 2. Supabase client
          if (/node_modules[\/\\]@supabase[\/\\]/.test(id)) {
            return 'supabase-client';
          }
          
          // 3. Rich text editors
          if (/node_modules[\/\\](lexical|tiptap|draft-js|slate|prosemirror)[\/\\]/.test(id)) {
            return 'rich-editor';
          }
          
          // 4. UI libraries (Radix, Heroicons, etc)
          if (/node_modules[\/\\](@radix-ui|@heroicons|lucide-react|shadcn)[\/\\]/.test(id)) {
            return 'ui-components';
          }
          
          // 5. Charts
          if (/node_modules[\/\\](recharts|chart\.js|victory|apexcharts)[\/\\]/.test(id)) {
            return 'charts';
          }
          
          // 6. Utilities
          if (/node_modules[\/\\](date-fns|dayjs)[\/\\]/.test(id)) {
            return 'utils';
          }
          
          // 7. Catch remaining vendor deps (WILL NOT include above packages)
          return 'vendor';
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      format: { comments: false },
    },
    chunkSizeWarningLimit: 700,
    reportCompressedSize: true,
    cssCodeSplit: true,
    sourcemap: mode === 'development',
  },
  esbuild: {
    legalComments: 'none',
    pure: ['console.log', 'debugger'],
  },
  optimizeDeps: {
    // ✅ FIX "Could not auto-determine entry point" warning
    entries: ['./index.html'],
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
  },
}));