import { model, Schema } from "mongoose";

const AccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Cash", "Saving Account"],
      required: true,
    },
    account_number: {
      type: String,
    },
    balance: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const AccountModel = model("account", AccountSchema, "accounts");

export default AccountModel;
