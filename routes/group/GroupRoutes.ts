import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import GroupModel from "../../db/GroupModel";
import verifyToken from "../../middlewares/verifyToken";
import MemberRouter from "./MemberRoutes";

const GroupRouter = Router();

GroupRouter.use(verifyToken);
GroupRouter.use("/member", MemberRouter);

// Add grpup
GroupRouter.post(
  "/add",
  body("name", "This field cannot be empty").exists().notEmpty(),
  query("admin", "admin query needed").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { name } = req.body;
    const { admin } = req.query;

    GroupModel.create({ name, admin })
      .then((group) => {
        return res.json({
          message: "New group added",
          groupId: group.get("_id"),
          adminId: group.get("admin"),
        });
      })
      .catch((err) => {
        return res.status(500).json(err.message);
      });
  }
);

// Get list of groups
GroupRouter.get(
  "/list",
  query("adminId", "adminId query must be included").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { adminId } = req.query;

    GroupModel.find({ admin: adminId, deleted: false })
      .select("_id name")
      .populate("admin", "name")
      .exec((err, group) => {
        if (group.length === 0)
          return res.status(404).json({ message: "No group found" });

        if (err) return res.status(500).json(err.message);

        return res.json(group);
      });
  }
);

export default GroupRouter;
