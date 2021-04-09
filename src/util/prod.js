try {eval('({})?.key')} catch(e){alert('Update your browser')}

if (!location.host.includes(''))
    alert('ERROR');

// Check localStorage + indexedDB
try {
    localStorage.setItem('_TEST_KEY_', 1);
    localStorage.removeItem('_TEST_KEY_');
} catch (e) {
    delete window['localStorage'];
    localStorage = {setItem: () => {}, getItem: () => {}, removeItem: () => {}};
}
indexedDB.open('_TEST_DB_', 1).onerror = () => {
    alert('Please enable cookies so that data can be persisted in indexedDB');
};

// ServiceWorker
if ('serviceWorker' in navigator) {
    if (!navigator.serviceWorker.controller)
        navigator.serviceWorker.register('/sw.js');
    else {
        let refreshing;
        // Reload page if a new service worker took over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                location.reload();
                refreshing = true;
            }
        });
    }
}
