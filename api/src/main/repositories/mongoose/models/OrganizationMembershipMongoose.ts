import mongoose, { Schema } from 'mongoose';

const organizationMembershipSchema = new Schema(
  {
    _userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: { type: String, required: true, enum: ['owner', 'admin', 'member'] },
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

organizationMembershipSchema.index({ _userId: 1, _organizationId: 1 }, { unique: true });

const organizationMembershipModel = mongoose.model(
  'OrganizationMembership',
  organizationMembershipSchema,
  'organizationMemberships'
);

export default organizationMembershipModel;
