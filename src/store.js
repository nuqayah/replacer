import { writable, get } from 'svelte/store';
import { openDB } from 'idb';
import {debounce} from './util/util.js';

export const session = writable({loaded: false, db: null});
export const state = writable({
    repls: [],
    functions: window.__HELPERS__,
});

async function init() {
    const db = await openDB('db', 1, {
        upgrade(db, old_version) {
            if (old_version === 0) {
                db.createObjectStore('main');
            }
        },
    });

    const db_state = await db.get('main', 'state');
    state.update(data => ({...data, ...db_state}));
    session.update(data => ({db, loaded: true}));
}
init();

state.subscribe(debounce(async data => {
    if (JSON.stringify(data) === '{}')
        return;
    const db = get(session).db;
    if (db)
        db.put('main', data, 'state');
}, 200));
