<main>
{#if $session.loaded}
  <Replacer/>
  <Modal/>
  <Tooltip/>
{/if}
</main>

<script>
import { session } from './store.js';
import Replacer from './Replacer.svelte';
import Modal from 'components/src/Modal.svelte'
import Tooltip from 'components/src/Tooltip.svelte'

let loaded = false;
$: if (!loaded && $session.loaded) {
    loaded = true;
}
</script>
