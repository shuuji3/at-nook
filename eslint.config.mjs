import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  { ignores: ["ref/**"] },
  {
    // vitest hoists vi.mock above imports, so the import order is intentional
    files: ["**/*.test.ts"],
    rules: { "import/first": "off" },
  },
  {
    // nuxt names components after their files; vue 3 allows fragment roots
    files: ["src/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
    },
  },
  {
    // the plain script block exports the tile's prop type before setup imports
    files: ["src/components/person-tile.vue"],
    rules: { "import/first": "off" },
  },
);
