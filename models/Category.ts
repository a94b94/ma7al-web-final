import mongoose, { Schema, model, models, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  colorClass?: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  colorClass: String,
});

const Category: Model<ICategory> = models.Category || model<ICategory>("Category", CategorySchema);
export default Category;
