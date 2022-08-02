<main>
{#if $session.loaded}
  <Replacer/>
  <Modal/>
  <Tooltip/>
  <NotificationDisplay/>
{/if}
</main>

<script>
import { session } from './store.js';
import Replacer from './Replacer.svelte';
import Modal from 'components/src/Modal.svelte'
import Tooltip from 'components/src/Tooltip.svelte'
import {NotificationDisplay} from 'notifier'

let loaded = false;
$: if (!loaded && $session.loaded) {
    loaded = true;
}
</script>
