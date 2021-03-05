import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import AccountModel from "../../db/AccountModel";
import GroupModel from "../../db/GroupModel";

const AccountRouter = Router();

// Add group account
AccountRouter.post(
  "/add",
  body(["name", "type", "balance", "currency"], "This field cannot be empty")
    .exists()
    .notEmpty(),
  query("groupId").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { name, type, account_number, balance, currency } = req.body;
    const { groupId } = req.query;

    AccountModel.create({
      name,
      type,
      account_number,
      balance,
      currency,
    })
      .then((account) => {
        GroupModel.findOneAndUpdate(
          { _id: groupId },
          { $push: { accounts: account.get("_id") } },
          null,
          (err, result) => {
            if (result === null)
              return res.status(400).json({ message: "Something is wrong" });

            if (err) return res.status(500).json(err.message);

            return res.json({ message: "Account added successfuly" });
          }
        );
      })
      .catch((err) => {
        return res.status(500).json(err.message);
      });
  }
);

// Get accounts list
AccountRouter.get(
  "/list",
  query("groupId", "groupId query must be included").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { groupId } = req.query;

    GroupModel.find({ _id: groupId, deleted: false })
      .select("accounts")
      .populate("accounts", "name balance currency", "account", {
        deleted: false,
      })
      .exec((err, account) => {
        if (account.length === 0)
          return res.status(404).json({ message: "No Account found" });

        if (err) return res.status(500).json(err.message);

        return res.json(account);
      });
  }
);

// Get account details
AccountRouter.get(
  "/details",
  query("accountId", "Query accountId must exist").exists(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { accountId } = req.query;

    AccountModel.findById(accountId)
      .select("name type account_number balance currency")
      .exec((err, account) => {
        if (account === null)
          return res.status(404).json({ message: "Account not found" });

        if (err) return res.status(500).json(err.message);

        return res.json(account);
      });
  }
);

// Update account
AccountRouter.put(
  "/update",
  body(["name", "type", "account_number", "balance", "currency"])
    .exists()
    .notEmpty()
    .withMessage("This field must not be empty"),
  query("accountId", "accountId query must exist").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { name, type, account_number, balance, currency } = req.body;
    const { accountId } = req.query;

    AccountModel.findOneAndUpdate(
      { _id: accountId },
      { name, type, account_number, balance, currency }
    ).exec((err, account) => {
      if (err) return res.status(500).json(err.message);

      return res.json({ message: "Updated successfuly" });
    });
  }
);

// Delete account
AccountRouter.delete(
  "/delete",
  query("accountId", "accountId query must exist").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { accountId } = req.query;

    AccountModel.findOneAndUpdate({ _id: accountId }, { deleted: true }).exec(
      (err, deleted) => {
        if (err) return res.status(500).json(err.message);

        return res.json({ message: "Delete success" });
      }
    );
  }
);

export default AccountRouter;
