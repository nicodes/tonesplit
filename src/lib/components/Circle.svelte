<script>
  export let radius = 22
  export let color = 'var(--white)'
</script>

<div
  class="circle"
  style="width: {radius * 2}px; height: {radius *
    2}px; background-color: {color}"
></div>

<style>
  .circle {
    border-radius: 50%;
  }
</style>
