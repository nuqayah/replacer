window.BASE_TITLE = document.title;

// User agent
{
    const UA = navigator.userAgent;
    const doc_classes = document.documentElement.classList;
    window._useragent = {
        ios: /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        safari: /^((?!chrome|android).)*safari/i.test(UA),
    };
    if (window._useragent.safari)
        doc_classes.add('safari');

    if (window._useragent.ios)
        doc_classes.add('ios');

    if (UA.includes('Firefox'))
        doc_classes.add('firefox');

    if (/Windows NT|Intel Mac OS X/.test(UA))
        doc_classes.add('non-mobile');
    else if (/Android.*Chrome\//.test(UA))
        doc_classes.add('chrome-android');
}

function check_tab(e) {
    if (e.key === 'Tab') {
        document.documentElement.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', check_tab);
    }
}
window.addEventListener('keydown', check_tab);

/* On mobile: 100vh != 100% */
{
    const div = document.createElement('div');
    div.style = 'position: absolute; height: 100vh';
    document.body.appendChild(div);
    window._VH_OFFSET = div.clientHeight - window.innerHeight;
    div.remove();
}
