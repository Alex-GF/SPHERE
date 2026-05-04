import mongoose, { Schema } from 'mongoose';

const groupMembershipSchema = new Schema(
  {
    _userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    role: { type: String, required: true, enum: ['admin', 'editor', 'viewer'] },
    joinedAt: { type: Date, required: true, default: Date.now },
  },
  {
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

groupMembershipSchema.index({ _userId: 1, _groupId: 1 }, { unique: true });
groupMembershipSchema.index({ _organizationId: 1 });

const groupMembershipModel = mongoose.model('GroupMembership', groupMembershipSchema, 'groupMemberships');

export default groupMembershipModel;
