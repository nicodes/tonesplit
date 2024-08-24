<script lang="ts">
  export let value: string | number | undefined = undefined;
</script>

<select bind:value>
  <slot></slot>
</select>

<style lang="scss">
  select {
    height: 44px;
    background-color: transparent;
    color: white;
    border: 2px solid white;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 16px;
    appearance: none; /* Remove default arrow */
    -webkit-appearance: none; /* Remove default arrow in Safari */
    -moz-appearance: none; /* Remove default arrow in Firefox */
    cursor: pointer;
    outline: none;
    position: relative;
    padding-right: 30px; /* Add space for the triangle */
  }

  /* Create the white triangle */
  select::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid white;
    pointer-events: none;
  }

  select:hover {
    border-color: #ccc;
  }

  /* Red glow effect on focus */
  select:focus {
    border-color: red;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.8); /* Red glow effect */
  }
</style>
