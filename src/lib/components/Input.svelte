<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let label: string = ''
  export let type: string | undefined = undefined
  export let min: number | undefined = undefined
  export let max: number | undefined = undefined
  export let step: number | undefined = undefined
  export let value: string | number | undefined = undefined

  // Needed for 2-way binding with variable type prop
  const dispatch = createEventDispatcher()
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    value = target.value
    dispatch('input', { value })
  }
</script>

<label class="input">
  <span>{label}</span>
  <input {type} {min} {max} {value} {step} on:input={handleInput} />
</label>

<style lang="scss">
  .input :first-child {
    display: none;
  }
</style>
