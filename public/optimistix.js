(function() {

    var scripts = document.getElementsByTagName('script');
    var currentScript = null;

    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('optimistix.js')) {
            currentScript = scripts[i];
            break;
        }
    }

    if (currentScript) {
        
        var scriptSrc = currentScript.src;
        var queryParams = new URLSearchParams(scriptSrc.split('?')[1]);
        var dynamicParam = queryParams.get('url') || 'default'; 

        var decodedParam = decodeURIComponent(dynamicParam);
   
        function callPixel(pUrl) {
            var i = document.createElement('iframe');
            i.src = pUrl;
            i.width = '1';
            i.height = '1';
            i.style.display = 'none';
            document.body.appendChild(i);
        }

        callPixel(decodedParam);
    } else {
        console.error("Script 'optimistix.js' not found.");
    }
})();
