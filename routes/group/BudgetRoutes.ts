import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { BudgetModel } from "../../db/BudgetModel";
import GroupModel from "../../db/GroupModel";

const BudgetRouter = Router();

// Add budget
BudgetRouter.post(
  "/add",
  body(["startDate", "endDate", "active"], "This field is required")
    .exists()
    .notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { startDate, endDate, active } = req.body;

    BudgetModel.create({
      start_date: startDate,
      end_date: endDate,
      active,
    })
      .then((budget) => {
        return res.json({ message: "New budget created", budget });
      })
      .catch((err) => {
        return res.status(500).json(err.message);
      });
  }
);

// Get budget details
BudgetRouter.get(
  "/details",
  query(["groupId", "startDate"], "query needed").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { groupId, startDate } = req.query;

    GroupModel.findById(groupId)
      .populate({
        path: "budgets",
        match: { start_date: startDate },
        model: "budget",
      })
      .select("budgets")
      .exec((err, group) => {
        if (err) return res.status(500).json(err.message);

        return res.json(group.get("budgets"));
      });
  }
);

export default BudgetRouter;
