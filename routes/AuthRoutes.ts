import { Router } from "express";
import bcrypt from "bcrypt";
import UserModel from "../db/UserModel";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import GroupModel from "../db/GroupModel";

const AuthRouter = Router();

// Sign Up
AuthRouter.post(
  "/signup",
  body(
    ["name", "username", "email", "password", "groupSpecific"],
    "This field must not be empty"
  )
    .exists()
    .notEmpty(),
  body("email").isEmail().withMessage("Not an email"),
  (req, res) => {
    const { name, username, email, password, groupSpecific } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    UserModel.findOne({ username: username }, "username", null, (err, doc) => {
      if (doc !== null)
        return res.status(400).json({ message: "Username already exists" });

      UserModel.findOne({ email: email }, "email", null, (err, doc) => {
        if (doc !== null)
          return res.status(400).json({ message: "Email already exists" });

        bcrypt.hash(password, 10, (err, encrypted) => {
          if (err) return res.status(400).json(err.message);
          UserModel.create({
            name,
            username,
            email,
            password: encrypted,
            group_specific: groupSpecific,
          })
            .then((user) => {
              let encPassword = Buffer.from(password).toString("base64");
              if (groupSpecific === true)
                return res.json({
                  message: "New user created",
                  id: user.get("_id"),
                  password: encPassword,
                });
              return res.status(200).json({ message: "New user created" });
            })
            .catch((err) => {
              return res.status(500).json(err.message);
            });
        });
      });
    });
  }
);

// Login
AuthRouter.post(
  "/signin",
  body(["username", "password"], "This field cannot be empty")
    .exists()
    .notEmpty(),
  (req, res) => {
    const { username, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json(errors);

    UserModel.findOne(
      { username: username, deleted: false },
      "_id username email password group_specific",
      null,
      (err, user) => {
        if (user === null)
          return res.status(404).json({ message: "User not found" });

        if (err) return res.status(500).json(err.message);

        bcrypt.compare(password, user.get("password"), (err, same) => {
          if (!same)
            return res.status(400).json({ message: "Invalid password" });

          if (err) return res.json(err.message);

          const token = jwt.sign(
            {
              id: user.get("_id"),
              username: user.get("username"),
              email: user.get("email"),
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );

          GroupModel.findOne({ members: user.get("_id") })
            .select("_id")
            .exec((err, group) => {
              if (err) return res.status(500).json(err.message);

              GroupModel.findOne({
                admin: user.get("_id"),
              }).exec((err, adminGroup) => {
                if (err) return res.status(500).json(err.message);

                if (adminGroup === null || undefined) {
                  return res.json({
                    message: "Logged in",
                    token: token,
                  });
                }

                if (group === null || undefined) {
                  return res.json({
                    message: "Logged in",
                    token: token,
                    adminGroupId: adminGroup.get("_id"),
                  });
                }

                return res.json({
                  message: "Logged in",
                  token: token,
                  groupSpecific: true,
                  groupId: group.get("_id"),
                });
              });
            });
        });
      }
    );
  }
);

export default AuthRouter;
