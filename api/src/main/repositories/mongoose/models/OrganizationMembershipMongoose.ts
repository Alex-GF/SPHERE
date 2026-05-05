import mongoose, { Schema } from 'mongoose';

const organizationMembershipSchema = new Schema(
  {
    _userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    _roleWeight: { type: Number, required: true }, // For efficient role comparison (OWNER=3, ADMIN=2, MEMBER=1)
    role: { type: String, required: true, enum: ['OWNER', 'ADMIN', 'MEMBER'] },
    joinedAt: { type: Date, required: true, default: Date.now },
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

organizationMembershipSchema.pre('save', function (next) {
  // Set role weight based on role
  switch (this.role) {
    case 'OWNER':
      this._roleWeight = 3;
      break;
    case 'ADMIN':
      this._roleWeight = 2;
      break;
    case 'MEMBER':
      this._roleWeight = 1;
      break;
    default:
      this._roleWeight = 0; // Should never happen due to enum validation
  }
  next();
});

organizationMembershipSchema.index({ _userId: 1, _organizationId: 1 }, { unique: true });
organizationMembershipSchema.index({ _organizationId: 1 });
organizationMembershipSchema.index({ _userId: 1 });

const organizationMembershipModel = mongoose.model(
  'OrganizationMembership',
  organizationMembershipSchema,
  'organizationMemberships'
);

export default organizationMembershipModel;
