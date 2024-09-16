const { Router } = require("express");
<<<<<<< HEAD

const router = Router();

=======
const router = Router();
>>>>>>> b01c87b09b56d198397fb3d785b1ce110513e468
const { getData } = require("../Controller/Controller");

router.route("/getdata").get(getData);

module.exports = router;
