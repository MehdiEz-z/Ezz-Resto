import { loadAll } from './data.js';
import { render } from './render.js';
import { setupEvents } from './events.js';

let loaded = false;

export async function activate() {
  setupEvents();
  if (!loaded) {
    await loadAll();
    loaded = true;
  }
  render();
}

export function resetModule() {
  loaded = false;
}
