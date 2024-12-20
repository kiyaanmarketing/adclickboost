const express = require("express");
const bodyParser = require("body-parser");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("./aws-config");
const cors = require("cors");
const session = require('express-session');
require("dotenv").config();
const corsMiddleware = require("./middleware/corsMiddleware");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const trackingRoutes = require('./routes/tracking');

const app = express();
const port = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cors());
const jsonFilePath = path.join(__dirname, 'trackingUrls.json')

// Function to read trackingUrls from JSON file
const readTrackingUrls = () => {
  const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
  return JSON.parse(fileContent);
};



// API to update trackingUrls
app.post('/update-url', (req, res) => {
  const { hostname, url } = req.body;

  if (!hostname || !url) {
    return res.status(400).json({ message: 'Hostname and URL are required' });
  }


  const trackingUrls = readTrackingUrls();


  trackingUrls[hostname] = url;

 
  fs.writeFile(jsonFilePath, JSON.stringify(trackingUrls, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    return res.status(200).json({ message: 'URL updated successfully' });
  });
});

app.post("/api/save-client-data", async (req, res) => {
  const { clientId, referrer, utmSource, utmMedium, utmCampaign } = req.body;

  const params = {
    TableName: "ClientData",
    Item: {
      clientId,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    },
  };

  try {
    await dynamoDb.send(new PutCommand(params));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving data to DynamoDB:", error);
    res.status(500).json({ success: false, error: "Failed to save data" });
  }
});

app.get("/api/get-client-data", async (req, res) => {
  try {
    const params = {
      TableName: "ClientData",
    };
    const data = await dynamoDb.send(new ScanCommand(params));
    res.status(200).json(data.Items);
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});



function getCurrentDateTime() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Kolkata",
  };

  const dateTime = new Date().toLocaleDateString("en-IN", options);
  return dateTime;
}

const currentDateTime = getCurrentDateTime();

// Get Tracked All Data
 const getAllHostName = async (TableName) => {
  try {
    const params = {
      TableName: TableName
    };
    const result = await dynamoDb.send(new ScanCommand(params));
    return result.Items;
  } catch (err) {
    console.error('Error retrieving tracking All data:', err);
    //res.status(500).json({ error: 'Error retrieving tracking All data' });
  }
};

//console.log("getAllHostName",getAllHostName('HostName').then((result) => console.log("prom result=> ",result)))


const getAffiliateUrlByHostNameFind = async (hostname,TableName) => {
  //console.log("127 => ", hostname,TableName)
  try {
    // Fetch all hostnames and affiliate URLs from DynamoDB
    const allHostNames = await getAllHostName(TableName);
    //console.log("130 allHostNames => ", allHostNames)
    // Find the entry where the hostname matches
   const matchedEntry = allHostNames.find((item) =>  item.hostname === hostname);
  //  const matchedEntry = allHostNames.find((item) => {
  //   console.log("item => ", item.hostname, " and hostname => ", hostname);
  //   return item.hostname === hostname; // Removed incorrect comma
  // });
    console.log("matchedEntry => ",matchedEntry)
    if (matchedEntry) {
      // If a match is found, return the corresponding affiliateUrl
      return matchedEntry.affiliateUrl;
    } else {
      // If no match is found, return a default affiliate URL
      return '';
    }
  } catch (error) { 
    console.error('Error finding affiliate URL:', error);
    return ''; // Return default on error
  }
};

const trackingUrls = {
  
  'www.marksandspencerme.com': 'https://clk.omgt4.com/?PID=55681&AID=2356115',
  'www.flyadeal.com': 'https://www.flyadeal.com/en/search-flight?utm_source=adsicube&utm_medium=icubes&utm_campaign=4828',
  'www.justherbs.in' : 'https://mobilogi.gotrackier.com/click?campaign_id=489&pub_id=308',
  'insightcosmetics.in': 'https://track.optimistixmedia.com/c?o=21373422&m=12608&a=628261&aff_click_id={replace_it}&sub_aff_id={replace_it}',
  'www.eigeradventure.com': 'https://invol.co/cllwa2k',
  'storeus.com': 'https://24dl8.ttrk.io/6736fab8a5dc7fda74153f62',
  'sandro.sa': 'https://clk.omgt4.com/?PID=55979&AID=2356115',
  'sg.trapo.asia': 'https://invle.co/cllu491',
  'www.xcite.com': 'https://clk.omgt4.com/?PID=55728&AID=2356115',
  'www.theuaelottery.ae':'https://clk.omgt4.com/?PID=56323&AID=2356115',
  'www.kiabi.ae':'https://clk.omgt4.com/?PID=55761&AID=2356115',
  'robu.in' : 'https://robu.in/',
  'booking.theviewpalm.ae' : 'https://clk.omgt4.com/?PID=56322&AID=2356115',
  'koparoclean.com' : ' https://track.clickonik.com/click?campaign_id=3752&pub_id=11342',

};

app.post("/api/scriptdata", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;

  // Determine the tracking URL based on the origin
   const responseUrl = trackingUrls[origin] || "";

  try {
    
    const responseUrl = await getAffiliateUrlByHostNameFind(origin,'HostName');
    //const responseUrl = trackingUrls[origin] || "";
    console.log('Affiliate URL:', responseUrl);
    // Send a JSON response with the determined URL
    res.json({ url: responseUrl });
   
    //res.redirect(responseUrl);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    res.status(500).json({ error: "Failed to save tracking data" });
  }
});

// Handle tracking data
app.post('/api/trackdata', (req, res) => {
  const { url, referrer, unique_id,origin } = req.body;

  // Process the data, return event, site_id, and affiliateLink
  const responseUrl =
    trackingUrls[origin] || "https://tracktraffics.com";
  const response = {
      error: false,
      id: uuidv4(), // A random id (for err.js)
      event: 'click', 
      site_id: '7890', 
      affiliateLink: responseUrl 
  };

  // You could add logic to track specific events here
  if (url.includes('error')) {
      response.error = true;
  }

  res.json(response);
});

// Serve err.js script
app.get('/api/trackdata/err.js', (req, res) => {
  const id = req.query.id;
  res.type('application/javascript');
  res.send(`
      console.log("Error ID: ${id}");
      // Custom error tracking logic here
  `);
});


app.get('/api/track_event', (req, res) => {
  const { site_id, user_id, event } = req.query;
  
  // Log the event data for debugging purposes
  console.log(`Event: ${event}, Site ID: ${site_id}, User ID: ${user_id}`);
  
  // Generate or retrieve affiliate link based on the tracking parameters
  const responseUrl =
  trackingUrls[origin] || "https://tracktraffics.com";

  // Here you might want to log this information or send it to a tracking system
  // Example: save to a database or send to an analytics service

  // For demonstration, let's log the affiliate link
  console.log(`Affiliate Link: ${responseUrl}`);
  
  // Serve a 1x1 pixel transparent GIF to be used in an iframe
  res.setHeader('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
});


app.post("/api/scriptdataredirect", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;

  // Determine the tracking URL based on the origin
  const responseUrl =
    trackingUrls[origin] || "https://tracktraffics.com";

  try {
    
    res.redirect(302, responseUrl);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    res.status(500).json({ error: "Failed to save tracking data" });
  }
});

app.post("/api/datascript", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;
  // const responseUrl =
  // trackingUrls[origin] || "https://tracktraffics.com";

  try {
    const affiliateData = await getAffiliateUrlByHostNameFind(origin,'HostName');
    console.log('Affiliate URL:', affiliateData);
  
    res.json({name:'optimistix',url:affiliateData});
    //res.redirect(responseUrl);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    res.status(500).json({ error: "Failed to save tracking data" });
  }
});



// Configure session middleware
app.use(
  session({
    secret: "tracktraffics", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set `secure: true` if using HTTPS
  })
);

// Middleware to check if iframe has been executed
function checkIframeExecution(req, res, next) {
  if (!req.session.iframeExecuted) {
    req.session.iframeExecuted = true;
    next();
  } else {
    res.send("<html><body><h1>Nothing to display</h1></body></html>");
  }
}

// Route to handle data collection and send iframe
app.post("/api/collect", checkIframeExecution, async (req, res) => {
  // Log collected data (or save to a database, etc.)
  console.log("Collected Data:", req.body);
  const { uniqueID, pageURL, referrerURL, userAgent, deviceType } = req.body;
  // Prepare the data for storage in DynamoDB
  const trackingData = {
    TableName: "Retargeting",
    Item: {
      id: uniqueID || uuidv4(),
      url: pageURL,
      referrer: referrerURL,
      userAgent,
      deviceType,
      timestamp: currentDateTime,
    },
  };

  try {
    // Store the tracking data in DynamoDB
    await dynamoDb.send(new PutCommand(trackingData));

    // Send an HTML response with a hidden iframe
    res.send(`
    <html>
        <body>
            <iframe
                src="${affiliateUrl}"
                style="width: 0; height: 0; border: none; position: absolute; top: -9999px; left: -9999px;"
                sandbox="allow-scripts allow-same-origin"
            ></iframe>
            <script>
                // Clear session flag on page unload
                window.addEventListener('beforeunload', () => {
                    fetch('/clear-session');
                });
            </script>
        </body>
    </html>
`);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    return res.status(500).json({ error: "Failed to save tracking data" });
  }
});

// Route to clear session
app.get("/clear-session", (req, res) => {
  req.session.iframeExecuted = false;
  res.sendStatus(200);
});



// Endpoint to track users and return the affiliate URL
app.post('/api/track-user', async (req, res) => {
  const { url, referrer, unique_id,origin } = req.body;

  // Validate the incoming data
  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  
  try {
    
    const affiliateUrl = await getAffiliateUrlByHostNameFind(origin,'HostName');
     //const affiliateUrl = trackingUrls[origin] || "";
    // Respond with the generated affiliate URL
    //const affiliateUrl = affiliateData.affiliateUrl;
  res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
    console.error(error);
  }

  
});

// app.post('/api/track-user', async (req, res) => {
//   const { url, referrer, unique_id,origin } = req.body;

//   if (!url || !unique_id) {
//       return res.status(400).json({ success: false, error: 'Invalid request data' });
//   }

//   try {
//     fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
//       if (err) {
//         return res.status(500).json({ success: false, error: 'Error reading tracking URLs' });
//       }

//       const trackingAllUrls = JSON.parse(data);
//       const affiliateUrl = trackingAllUrls[origin] || "https://tracktraffics.com";

//       res.json({ success: true, affiliate_url: affiliateUrl });
//     });
//   }  catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });



// Fallback pixel endpoint (optional)
app.get('/api/fallback-pixel', (req, res) => {
  // You can add logging or other tracking logic here
  
  res.sendStatus(204); // No content, as it's a tracking pixel
});

app.post('/api/proxy', async (req, res) => {
  try {
      const { url, referrer, coo, origin } = req.body;

      // Construct the target URL
      const targetUrl = 'https://nomadz.gotrackier.com/click?campaign_id=3010&pub_id=47';

      // Forward the request to the target URL
      const proxyResponse = await fetch(targetUrl, {
          method: 'GET', // or 'POST' if necessary
          headers: {
              'Content-Type': 'application/json'
          }
      });

      const proxyData = await proxyResponse.json();
      console.log("proxyData => ",proxyData)
      // Respond back to the script with the data
      res.json({ url: proxyData.redirectUrl }); // Assuming the API returns a `redirectUrl`
  } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Proxy server error');
  }
});


// Retag code backend


app.get('/getTrackingUrl', async (req, res) => {
  const hostname = req.hostname; // Get the hostname from the request

  try {
    const trackingUrl = await getAffiliateUrlByHostNameFind(hostname,'HostName');
    console.log("trackingUrl => ", trackingUrl)
    res.json({ trackingUrl });
  } catch (error) {
    console.error(error);
  }
  
});


app.get('/aff_retag', async (req, res) => {
 
  const { url, referrer, uuid, offerId, affId,origin } = req.body;
  
  console.log("Tracking Data Received:", { url, referrer, uuid, offerId, affId});

  if (!offerId || !uuid) {
      return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const trackingUrl = await getAffiliateUrlByHostNameFind(hostname,'HostName');

    const dynamicContent = `
    <script>
        console.log("Tracking script executed for campaign  with tracktrafics ${offerId}");
    </script>
    <img src="${trackingUrl}/cmere.gif" alt="Tracking Image" style="width:0;height:0;display:none;">
    <iframe src="${trackingUrl}" style="display:none;"></iframe>
`;

  // Send the dynamic content back to the client
  return res.json({
    error: "success",
    data: dynamicContent
});

  } catch (error) {
    console.error(error);
  }
  // Generate dynamic content

});

// Route to handle tracker redirects dynamically
app.get('/affid/:trackerId', async (req, res) => {
  const trackerId = req.params.trackerId; // Extract trackerId from the URL path

  try {
    // Query DynamoDB to get the URL associated with the tracker ID
    //console.log("493 trackerId => ", trackerId)
    const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId,'Tracker');
    //console.log("495 redirectUrl => ", redirectUrl)
    if (!redirectUrl) {
      // If no URL is found for the tracker ID, return an error
      return res.status(404).send('URL not found for the specified tracker');
    }

    //const redirectUrl = result.Item.url;

    // Set Referrer-Policy header to no-referrer
    res.set('Referrer-Policy', 'no-referrer');
    
    // Redirect to the retrieved URL with a 302 status code
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Error fetching data from DynamoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/track-usersec', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
      const affiliateUrl = await getAffiliateUrlByHostNameFind(origin, 'HostName');
      console.log("affiliateUrl => ", affiliateUrl);
      res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use('/api', trackingRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the manage tracking URLs page
app.get('/api/manage-tracking-urls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manageTracking.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
