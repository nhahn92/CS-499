/**
 * Root Route Definitions
 * -----------------------
 * Defines the primary route for the server‑side rendered (SSR)
 * portion of the Travlr application.
 *
 * Responsibilities:
 *  - Map the root URL ("/") to the main controller
 *  - Render the homepage using Handlebars
 *
 * Notes:
 *  - This routing file is part of the legacy SSR public site.
 *  - The Angular admin application doesn't use this route.
 *  - SSR is retained only for the customer-facing portion of Travlr.
 */

var express = require('express');
var router = express.Router();
const ctrlMain = require('../controllers/main');

/**
 * GET /
 * -----
 * Render the homepage using the main controller.
 */
router.get('/', ctrlMain.index);

module.exports = router;