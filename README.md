# Vize Vue 2.7 virtual TypeScript incompatibility

This is a minimal reproduction of a component-constructor mismatch in Vize 0.391.0 when checking a Vue 2.7 project. The Vize configuration enables both advertised Vue 2 compatibility settings:

```ts
compiler: {
  compatibility: {
    vueVersion: '2.7',
  },
},
typeChecker: {
  legacyVue2: true,
},
```

## Reproduce

```sh
pnpm install
pnpm check:vue-tsc
pnpm check:vize
```

`check:vue-tsc` succeeds. `check:vize` reports `TS2769` for the ordinary Vue 2 render function in `src/main.ts`:

```text
Argument of type '__VizeComponentConstructor & __VizeVueComponentOptions'
is not assignable to parameter of type ... Component ...

Type '__VizeComponentConstructor & __VizeVueComponentOptions' is missing
the following properties from type 'VueConstructor<...>': extend, nextTick,
set, delete, and 10 more.
```

## Compatibility mismatch

Vue 2.7's `CreateElement` accepts a component whose constructor side is a `VueConstructor`. In addition to being constructable, that type exposes Vue's static APIs, including `extend`, `nextTick`, `set`, and `delete`.

Vize generates this default-export shape for the component:

```ts
type __VizeComponentConstructor =
  new (...args: any[]) => __VizeComponentInstance;

declare const __vize_component__:
  __VizeComponentConstructor & __VizeVueComponentOptions;

export default __vize_component__;
```

The generated instance contains Vue 2 instance members, so `legacyVue2` is taking effect. The generated constructor does not contain the static side of Vue 2's `VueConstructor`, however. Passing that generated type to Vue 2's `h()` therefore fails even though the source component is valid and `vue-tsc` accepts it.

The complete generated output is checked in as [`src/ReproComponent.vue.virtual.ts`](src/ReproComponent.vue.virtual.ts). It can be regenerated with:

```sh
pnpm exec vize check --tsconfig tsconfig.json \
  --save-virtual-ts-for src/ReproComponent.vue
```

The `tsconfig.json` uses an explicit file list so the diagnostic snapshot is not itself included in either type-check.

## Versions

- Vue 2.7.16
- Vize 0.391.0
- Vite 3.2.11
- vue-tsc 2.2.8
- TypeScript 5.4.5
