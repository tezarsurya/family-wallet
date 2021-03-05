import express from "express";
import verifyToken from "../middlewares/verifyToken";
import AccountRouter from "./account/AccountRoutes";
import AuthRouter from "./AuthRoutes";
import GroupRouter from "./group/GroupRoutes";

const router = express.Router();

router.use("/api/auth", AuthRouter);
router.use("/api/group", GroupRouter);
router.use("/api/account", AccountRouter);

router.get("/", verifyToken, (req, res) => {
  res.send("Hello World");
});

export default router;
