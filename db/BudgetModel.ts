import { model, Schema } from "mongoose";

const BudgetSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  amount: {
    type: Number,
    default: 0,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  items: [{ type: Schema.Types.ObjectId, ref: "budget_item" }],
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const BudgetItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: { type: Schema.Types.ObjectId, ref: "category" },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  owners: [{ type: Schema.Types.ObjectId, ref: "user" }],
  deleted: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const BudgetModel = model("budget", BudgetSchema, "budgets");
const BudgetItemModel = model("budget_item", BudgetItemSchema, "budget_items");

export { BudgetModel, BudgetItemModel };
