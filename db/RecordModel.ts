import { model, Schema } from "mongoose";

const IncomeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  source_type: {
    type: String,
    required: true,
    enum: ["Personal Account", "Group Budget"],
  },
  source_id: { type: Schema.Types.ObjectId },
  category: { type: Schema.Types.ObjectId, ref: "category" },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const ExpenseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  source_type: {
    type: String,
    required: true,
    enum: ["Personal Account", "Group Budget"],
  },
  source_id: { type: Schema.Types.ObjectId },
  category: { type: Schema.Types.ObjectId, ref: "category" },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const IncomeModel = model("income", IncomeSchema, "incomes");
const ExpenseModel = model("expense", ExpenseSchema, "expenses");

export { IncomeModel, ExpenseModel };
