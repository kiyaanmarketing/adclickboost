(async () => {
    // Step 1: Fetch the dynamic tracking URL from the backend
    let dynamicUrl = '';

    try {
        const response = await fetch('https://www.tracktraffics.com/getTrackingUrl');
        const data = await response.json();
        dynamicUrl = data.trackingUrl; // Use the tracking URL received from the backend
    } catch (error) {
        console.error('Error fetching tracking URL:', error);
        return; // Exit if there was an error
    }

    // Step 2: Create a URL object from the dynamic tracking URL
    let trackingUrl = new URL(dynamicUrl);

    // Step 3: Extract offer_id and aff_id from the tracking URL
    let offerId = trackingUrl.searchParams.get("offer_id");
    let affId = trackingUrl.searchParams.get("aff_id");

    console.log(`Offer ID: ${offerId}, Affiliate ID: ${affId}`);

    // Step 4: Capture the current URL and referrer
    let currentUrl = window.location.href;
    let referrer = document.referrer;

    // Step 5: Set a unique guest fingerprint if not already set
    const cookieName = "__guest_fingerprint";
    const expirationDate = new Date(Date.now() + 2592e6).toUTCString();
    let guestFingerprint = getCookie(cookieName);
    
    if (!guestFingerprint) {
        guestFingerprint = generateUUID();
        document.cookie = `${cookieName}=${guestFingerprint}; expires=${expirationDate}; path=/`;
    }

    // Step 6: Send tracking data to the server
    let trackingData = {
        url: currentUrl,
        referrer: referrer,
        uuid: guestFingerprint,
        offerId: offerId,
        affId: affId,
        origin: window.location.hostname,
    };

    // Backend URL where you want to send the tracking data
    let backendUrl = "https://www.tracktraffics.com/aff_retag"; // Update this as necessary
    fetch(backendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(trackingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error === "success") {
            // Handle successful response
            console.log("Tracking data sent successfully", data);

            // Process any scripts returned in the data if necessary
            if (data.data) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = data.data;

                var scripts = tempDiv.querySelectorAll("script");
                if (scripts) {
                    for (const script of scripts) {
                        if (script.src) {
                            var newScript = document.createElement("script");
                            newScript.src = script.src;
                            script.id && (newScript.id = script.id);
                            script.async && (newScript.async = script.async);
                            script.defer && (newScript.defer = script.defer);
                            document.head.appendChild(newScript);
                        } else {
                            var inlineScript = document.createElement("script");
                            inlineScript.textContent = script.textContent;
                            script.type && (inlineScript.type = script.type);
                            document.head.appendChild(inlineScript);
                        }
                    }
                }
            }
        } else {
            console.error("Error in tracking response:", data);
        }
    })
    .catch(err => console.error("Fetch error:", err));
})();

// Helper functions
function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
