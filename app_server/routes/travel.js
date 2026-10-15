/**
 * Travel Route Definitions
 * -------------------------
 * Defines routing for the server‑side rendered (SSR) travel page.
 *
 * Responsibilities:
 *  - Map the "/travel" route to the Travel controller
 *  - Render the public-facing travel listing using Handlebars
 *
 * Notes:
 *  - This routing file is part of the legacy SSR portion of the Travlr app.
 *  - The Angular admin application doesn't use this route.
 *  - SSR is retained only for the customer-facing portion of Travlr.
 */

var express = require('express');
var router = express.Router();
var controller = require('../controllers/travel');

/**
 * GET /travel
 * ------------
 * Render the travel listing page using the Travel controller.
 */
router.get('/', controller.travel);

module.exports = router;