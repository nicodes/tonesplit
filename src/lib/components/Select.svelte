<script lang="ts">
  export let value: string | number | undefined = undefined;
</script>

<select bind:value>
  <slot></slot>
</select>

<style lang="scss">
  select {
    min-width: 135px;
    min-height: 44px;

    padding: 8px 12px;

    background-color: transparent;
    color: white;

    border: 2px solid white;
    border-radius: 4px;

    cursor: pointer;
    outline: none; /* Remove blue border */

    // appearance: none; /* Remove default arrow */
    // -webkit-appearance: none; /* Remove default arrow in Safari */
    // -moz-appearance: none; /* Remove default arrow in Firefox */

    &:focus {
      border-color: red;
      box-shadow: 0 0 8px rgba(255, 0, 0, 0.8); /* Red glow effect */
    }
  }
</style>
