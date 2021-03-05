import { model, Schema } from "mongoose";

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
});

const CategoryModel = model("category", CategorySchema, "categories");

export default CategoryModel;
