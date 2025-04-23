import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // مثل: mobiles
  image: { type: String }, // رابط صورة أو أيقونة
  colorClass: { type: String }, // مثال: bg-yellow-400
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
