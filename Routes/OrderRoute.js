const { Router } = require("express");
const router = Router();
const { order } = require("../Controller/OrderController");

router.route("/").get(order);

module.exports = router;
