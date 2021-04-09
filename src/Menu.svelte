<button type=button title={btn_label} on:click={toggle_menu} on:blur={btn_blur} {hidden}>
  {#if btn_icon}
    <icon id={btn_icon}>
  {/if}
  {#if btn_title}
    {@html btn_title}
  {/if}
</button>

<ul class=dropdown-menu hidden={menu_hidden} bind:this={menu} aria-label={menu_label}>
  <slot></slot>
</ul>

<script>
import positioner from 'positioner';
import { onMount, tick } from 'svelte';

export let btn_icon = '';
export let btn_title = '';
export let btn_label = '';
export let menu_label = '';

async function toggle_menu(e) {
    if (window._useragent.safari)
        e.currentTarget.focus();
    menu_hidden = !menu_hidden;

    if (menu_hidden)
        e.target.blur();
    else {
        await tick();
        positioner(menu, e.target.getBoundingClientRect(), 'bottom');
    }
}
function btn_blur(e) {
    setTimeout(() => {
        if (!e.target.focused)
            menu_hidden = true;
    }, 200);
}

let menu;
let menu_hidden = true;
export let hidden = false;
</script>

<style>
.dropdown-btn {
  display: flex;
  align-items: center;
  padding: 0 0.5rem 0 0.2rem;
}
.dropdown-btn .icon-chevron-bottom {
  width: 17px;
}
.dropdown-menu {
  position: absolute;
  z-index: 10;
  background: #fff;
  border-radius: 0.3rem;
  font-size: 0.85rem;
  box-shadow: 0 0 5px #aaa;
  transition: top 0.1s;
  max-width: 250px;
  min-width: 5rem;
}

.dropdown-menu > :global(li:not(last-of-type)) {
  border-bottom: 1px solid #eee;
}
.dropdown-menu > :global(li) > :global(button) {
  width: 100%;
  /*display: flex;*/
  /*justify-content: space-between;*/
  padding: 0.25rem 0.3rem;
  border-radius: 0;
  /*text-align: right;*/
}
.dropdown-menu :global(button:hover) {
  background: #eee;
}
button {
  padding: 0 0.4rem;
}
button .icon {
  color: #777;
  height: 20px;
  vertical-align: middle;
}
button:focus .icon {
  color: #888;
}

.dropdown-menu :global(button .checkmark) {
  min-width: 30px;
  float: left;
}
.dropdown-menu :global(button.selected .checkmark::after) {
  content: '';
  display: inline-block;
  width: 2px;
  height: 12px;
  border: solid #000;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  padding: 2px;
  margin: 0 0.8rem -2px 0.2rem;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
