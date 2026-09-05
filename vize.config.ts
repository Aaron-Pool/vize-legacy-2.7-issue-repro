import { defineConfig } from 'vize';

export default defineConfig({
  compiler: {
    compatibility: {
      vueVersion: '2.7',
    },
  },
  typeChecker: {
    enabled: true,
    legacyVue2: true,
    strict: true,
  },
});
