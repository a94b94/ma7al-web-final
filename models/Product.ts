import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String, // يربط المنتج بالقسم مثل "mobiles"
  isFeatured: Boolean,
  discount: Number, // اختياري إذا تدعم العروض
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
