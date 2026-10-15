/**
 * Main Controller
 * ----------------
 * Handles server‑side rendering for the Travlr homepage.
 *
 * Responsibilities:
 *  - Render the Handlebars "index" view
 *  - Provide the page title to the template
 *
 * Notes:
 *  - This controller is part of the legacy server‑side rendered (SSR)
 *    portion of the Travlr application.
 *  - The Angular admin application doesn't use this controller.
 *  - SSR is retained for the public-facing site only.
 */

const index = (req, res) => {
  res.render('index', { title: "Travlr Getaways" });
};

module.exports = {
  index
};