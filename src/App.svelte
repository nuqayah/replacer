<main>
{#if $session.loaded}
  <Replacer/>
  <Modal/>
{/if}
</main>

<script>
import { session } from './store.js';
import Replacer from './Replacer.svelte';
import Modal from './Modal.svelte';

let loaded = false;
$: if (!loaded && $session.loaded) {
    loaded = true;
}
</script>
