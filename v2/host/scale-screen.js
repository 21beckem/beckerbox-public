function setPageScale(scaleFactor) {
    const body = document.body.style;

    // Apply to different browsers for compatibility
    body.transform = `scale(${scaleFactor})`;       // General
    
    // Adjust transform origin to the top-left to avoid layout shifts from the center
    body.transformOrigin = 'top left';

    // Adjust width to still fill viewport
    body.width = `${(window.innerWidth*(1/scaleFactor*0.99))}px`;
}
function isWindowScrollbarVisible() {
    return document.querySelector('main').getBoundingClientRect().height*1 > window.innerHeight;
}

async function scrollToTop() {
    window.scrollTo(0, 0);
    
    let aLotAtFirst = setInterval(() => { window.scrollTo(0, 0); }, 10);
    await new Promise(r => setTimeout(r, 1000));
    clearInterval(aLotAtFirst);

    let aBitLater = setInterval(() => { window.scrollTo(0, 0); }, 100);
    await new Promise(r => setTimeout(r, 3000));
    clearInterval(aBitLater);

    let reguarly = setInterval(() => { window.scrollTo(0, 0); }, 1000);
}


export default function scaleScreenToFit() {
    document.addEventListener('DOMContentLoaded', async (event) => {
        // always set scroll to top of page
        scrollToTop();

        let scale = 1.0;
        while (isWindowScrollbarVisible()) {
            scale = scale * 0.99;
            setPageScale(scale);
            await new Promise(r => setTimeout(r, 50));
        }
    });
}