export default {
    init(TAG='G-3P4NWXWWVZ') {
        var imported = document.createElement('script');
        imported.src = `https://www.googletagmanager.com/gtag/js?id=${TAG}`;
        document.head.appendChild(imported);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', TAG);
    }
};