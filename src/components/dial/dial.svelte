<script>
    import {onMount} from "svelte";

    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let label = '';

    let knob;
    let startX, startY, startValue;

    function handleMouseDown(event) {
        event.preventDefault();
        startX = event.clientX;
        startY = event.clientY;
        startValue = value;
    }

    function handleMouseMove(event) {
        if (startX !== undefined && startY !== undefined) {
            let deltaX = event.clientX - startX;
            let deltaY = event.clientY - startY;
            let delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (deltaY > 0) {
                delta = -delta;
            }

            value = Math.max(min, Math.min(max, startValue + delta));
        }
    }

    function handleMouseUp() {
        startX = undefined;
        startY = undefined;
    }

    onMount(() => {
        knob.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    });
</script>

<style>
    .knob {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
    }

    .knob::before {
        content: '';
        position: absolute;
        width: 6px;
        height: 50%;
        background: #333;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: bottom;
        transition: transform 0.1s;
    }
</style>

<label>
    <span>{label}</span>
    <div class="knob" bind:this={knob} style="transform: rotate({(value - min) / (max - min) * 270 - 135}deg);" />

</label>
