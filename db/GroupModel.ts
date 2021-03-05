import { model, Schema } from "mongoose";

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    admin: { type: Schema.Types.ObjectId, ref: "user" },
    members: [{ type: Schema.Types.ObjectId, ref: "user" }],
    accounts: [{ type: Schema.Types.ObjectId, ref: "account" }],
    budgets: [{ type: Schema.Types.ObjectId, ref: "budget" }],
    incomes: [{ type: Schema.Types.ObjectId, ref: "income" }],
    expenses: [{ type: Schema.Types.ObjectId, ref: "expense" }],
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const GroupModel = model("group", GroupSchema, "groups");

export default GroupModel;
