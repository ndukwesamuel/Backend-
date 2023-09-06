const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const { createGroup, getAllGroups, joinGroup } = require("../Controller/Group");

router
  .route("/")
  .post(verifyToken, createGroup)
  .get(verifyTokenAndAdmin, getAllGroups);
router.route("/:groupId/join").post(verifyToken, joinGroup);
//   .get(verifyTokenAndAdmin, getAllGroups);

module.exports = router;
