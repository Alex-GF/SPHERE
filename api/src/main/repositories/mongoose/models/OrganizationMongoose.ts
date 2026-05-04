import mongoose, { Schema } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: { type: String, required: false, default: null },
    avatar: { type: String, required: false, default: "avatars/default-org.webp" },
    isPersonal: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, resultObject) {
        delete (resultObject as any)._id;
        delete (resultObject as any).__v;
        return resultObject;
      },
    },
  }
);

const organizationModel = mongoose.model('Organization', organizationSchema, 'organizations');

export default organizationModel;
