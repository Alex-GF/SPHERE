import mongoose, { Schema } from 'mongoose';

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    displayName: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    _organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    _parentGroupId: { type: Schema.Types.ObjectId, ref: 'Group', required: false, default: null },
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

groupSchema.index({ name: 1, _organizationId: 1 }, { unique: true });

const groupModel = mongoose.model('Group', groupSchema, 'groups');

export default groupModel;
