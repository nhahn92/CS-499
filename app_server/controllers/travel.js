/**
 * Travel Controller
 * ------------------
 * Handles server‑side rendering (SSR) for the public-facing travel page.
 *
 * Responsibilities:
 *  - Fetch trip data from the API layer (app_api)
 *  - Validate the API response
 *  - Render the Handlebars "travel" view with:
 *      • Page title
 *      • Trip list
 *      • Status message (errors, empty list, etc.)
 *
 * Notes:
 *  - This controller is part of the legacy SSR portion of the Travlr app.
 *  - The Angular admin application doesn't use this controller.
 *  - SSR is retained only for the public-facing site.
 */

const tripsEndpoint = "http://localhost:3000/api/trips";

const options = {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

// Legacy file-based trip loading
// var fs = require('fs');
// var trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

const travel = async function (req, res, next) {
  try {
    // Fetch trip data from the API
    const apiResponse = await fetch(tripsEndpoint, options);
    const json = await apiResponse.json();

    let message = null;

    // Validate API response
    if (!(json instanceof Array)) {
      message = "API lookup error";
    } else if (!json.length) {
      message = "No trips exist in our database!";
    }

    // Render the Handlebars view
    res.render("travel", {
      title: "Travlr Getaways",
      trips: json instanceof Array ? json : [],
      message,
    });

  } catch (err) {
    // Handle unexpected errors
    res.status(500).send(err.message);
  }
};

module.exports = {
  travel,
};