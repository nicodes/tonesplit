<script>
  import { pwaInfo } from 'virtual:pwa-info'
  import '@fontsource/righteous'

  import Header from '$lib/components/Header.svelte'
  import '../app.css'

  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

<div class="app">
  <Header />
  <slot />
</div>

<style>
</style>
