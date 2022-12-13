const router = require("express").Router();
const userOperation = require("../controller/userController")

router.post("/sign-up", userOperation.userSignup);
router.put("/update-profile/:userId",userOperation.updateProfile);
router.get("/view-user",userOperation.viewUser);
router.delete("/delete-user/:userId",userOperation.deleteUser)

module.exports = router;