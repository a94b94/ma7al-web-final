// models/Settings.ts
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  heroImages: {
    phone: String,
    appliance: String,
  },
});

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
