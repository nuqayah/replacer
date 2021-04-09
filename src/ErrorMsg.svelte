<div id=tip role=tooltip class="tooltip tooltip-{direction}" use:bind={msg}>
  <div class=tip-arrow></div>
  <div class=tooltip-inner>{@html msg}</div>
</div>

<script context=module>
import ErrorMsg from './ErrorMsg.svelte';

export function show_error_msg(el, msg) {
    let component;
    return {
        update(msg) {
            if (!msg) {
                component?.$destroy();
                component = null;
                return;
            }

            if (!component)
                component = new ErrorMsg({target: el.parentElement, props: {attach_to: el}});
            component.$set({msg});
        },
        destroy() {
            component?.$destroy();
            component = null; // Precautionary
        },
    };
}
</script>

<script>
import positioner from 'positioner';
function bind(el) {
    return {
        update(msg) {
            if (msg)
                positioner(el, attach_to.getBoundingClientRect(), 'top');
        },
    };
}

export let direction = 'top';
export let msg = '';
export let attach_to;
</script>

<style>
.tooltip {
  position: absolute;
  z-index: 2;
  word-wrap: break-word;
  margin: 0;
  padding-bottom: 5px;
  transition: opacity .2s;
}
.tooltip .tip-arrow {
  position: absolute;
}
.tooltip .tip-arrow::before {
  position: absolute;
  content: '';
  border-color: transparent;
  border-style: solid;
}
.tooltip-inner {
  max-width: 200px;
  padding: .25rem .5rem;
  background-color: #000;
  box-shadow: 0 0 15px #c6c6c6;
  border-radius: .25rem;
  max-height: 200px;
  overflow: auto;
  font-size: 0.9rem;
  line-height: 1.6;
  color: white;
}

/* Placement */
/* Top & Bottom */
.tooltip-top, .tooltip-bottom {
  padding: 0.4rem 0;
}
.tooltip-top .tip-arrow, .tooltip-bottom .tip-arrow {
  width: 0.8rem;
  height: 0.4rem;
}
.tooltip-top .tip-arrow {
  bottom: 0;
}
.tooltip-top .tip-arrow::before {
  top: 0;
  border-width: 0.4rem 0.4rem 0;
  border-top-color: #fff8e6;
}
.tooltip-bottom .tip-arrow {
  top: 0;
}
.tooltip-bottom .tip-arrow::before {
  bottom: 0;
  border-width: 0 0.4rem 0.4rem;
  border-bottom-color: #000;
}
/* Right & left */
.tooltip-right, .tooltip-left {
  padding: 0 0.4rem;
}
.tooltip-right .tip-arrow, .tooltip-left .tip-arrow {
  width: 0.4rem;
  height: 0.8rem;
}
.tooltip-right .tip-arrow {
  left: 0;
}
.tooltip-right .tip-arrow::before {
  right: 0;
  border-width: 0.4rem 0.4rem 0.4rem 0;
  border-right-color: #dbdbdb;
}
.tooltip-left .tip-arrow {
  right: 0;
}
.tooltip-left .tip-arrow::before {
  left: 0;
  border-width: 0.4rem 0 0.4rem 0.4rem;
  border-left-color: #dbdbdb;
}
.tooltip-inner {
  color: black;
  background: #fff8e6;
  white-space: pre-wrap;
  font-family: monospace;
  width: 100%;
  box-shadow: 0 0 4px #727272;
}
</style>
