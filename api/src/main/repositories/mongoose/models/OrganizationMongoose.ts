import mongoose, { Schema } from 'mongoose';
import { LeanOrganization } from '../../../types/models/Organization';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: { type: String, required: false, default: null },
    avatar: { type: String, required: false, default: 'avatars/default-org.webp' },
    _parentId: { type: Schema.Types.ObjectId, ref: 'Organization', required: false, default: null },
    ancestors: {
      type: [Schema.Types.ObjectId],
      ref: 'Organization',
      default: [],
    },
    isPersonal: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    toObject: {
      getters: true,
      versionKey: false,
      transform: function (doc, resultObject) {
        delete (resultObject as any)._id;
        (resultObject as any).ancestors = resultObject.ancestors.map((id: mongoose.Types.ObjectId) => id.toString());
        
        return resultObject;
      },
    },
  }
);

/**
 * Critical indexes for efficient querying of organizational hierarchies and membership checks
 */
organizationSchema.index({ _parentId: 1 });
organizationSchema.index({ ancestors: 1 });

/**
 * Virtual: subOrganizations
 */
organizationSchema.virtual('subOrganizations', {
  ref: 'Organization',
  localField: '_id',
  foreignField: '_parentId',
});

const organizationModel = mongoose.model('Organization', organizationSchema, 'organizations');

export default organizationModel;
