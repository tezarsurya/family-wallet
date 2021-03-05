import { Router } from "express";
import { query, validationResult } from "express-validator";
import GroupModel from "../../db/GroupModel";
import { createTransport } from "nodemailer";
import UserModel from "../../db/UserModel";

const MemberRouter = Router();

// Add member
MemberRouter.get(
  "/add",
  query(["groupId", "userId", "password"], "queries needed")
    .exists()
    .notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { groupId, userId, password } = req.query;
    const decPassword = Buffer.from(password, "base64").toString("ascii");

    GroupModel.findOneAndUpdate(
      { _id: groupId },
      { $push: { members: userId } }
    )
      .populate("admin", "username name email")
      .exec((err, group) => {
        if (err) return res.status(500).json(err.message);

        UserModel.findById(userId).exec((err, user) => {
          if (err) return res.status(500).json(err.message);

          const transport = createTransport({
            service: "gmail",
            auth: {
              user: process.env.SMTP_USERNAME,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          const mailOptions = {
            from: `Family Wallet <${process.env.SMTP_USERNAME}>`,
            to: `${user.get("email")}`,
            subject: "You have been added to a group",
            html: `
                  <h2>${
                    group.get("admin").username
                  } added you to their group</h2>
                  <h3>Use the information below to sign in</h3>
                  <div>
                    <table>
                      <tr>
                        <td>Username:</td>
                        <td>${user.get("username")}</td>
                      </tr>
                      <tr>
                        <td>Password:</td>
                        <td>${decPassword}</td>
                      </tr>
                    </table>
                  </div>
                `,
          };

          transport.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json(err.message);

            return res.json({ message: "Email sent to new member" });
          });
        });
      });
  }
);

// Get member list
MemberRouter.get(
  "/list",
  query("groupId", "groupId query needed").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { groupId } = req.query;

    GroupModel.findById(groupId)
      .populate("members")
      .exec((err, group) => {
        if (err) return res.status(500).json(err.message);

        return res.json(group.get("members"));
      });
  }
);

// Remove member
MemberRouter.delete(
  "/delete",
  query(["userId", "groupId"], "userId query needed").exists().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    const { userId, groupId } = req.query;

    GroupModel.findOneAndUpdate(
      { _id: groupId },
      { $pull: { members: userId } }
    ).exec((err, member) => {
      if (err) return res.status(500).json(err.message);

      UserModel.findOneAndUpdate(
        { _id: userId },
        { group_specific: false }
      ).exec((err, user) => {
        if (err) return res.status(500).json(err.message);

        return res.json({
          message: "Member removed",
        });
      });
    });
  }
);

export default MemberRouter;
