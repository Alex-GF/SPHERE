import mongoose, { Schema } from 'mongoose';

const entityPermissionSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      set: (v: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(v),
      get: (v: mongoose.Types.ObjectId | null) => v?.toString(),
    },
    _organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      set: (v: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(v),
      get: (v: mongoose.Types.ObjectId | null) => v?.toString(),
    },
    entityType: {
      type: String,
      required: true,
      enum: ['pricing', 'collection'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      set: (v: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(v),
      get: (v: mongoose.Types.ObjectId | null) => v?.toString(),
    },
    permissions: {
      GET: { type: Boolean, required: true, default: true },
      PUT: { type: Boolean, required: true, default: false },
      DELETE: { type: Boolean, required: true, default: false },
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      set: (v: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(v),
      get: (v: mongoose.Types.ObjectId | null) => v?.toString(),
    },
  },
  {
    timestamps: true,
    getters: true,
    toObject: {
      virtuals: true,
      transform: function (doc, resultObject) {
        delete (resultObject as any)._id;
        delete (resultObject as any).__v;
        delete (resultObject as any)._userId;
        delete (resultObject as any)._organizationId;
        delete (resultObject as any).entityId;
        delete (resultObject as any).grantedBy;
        return resultObject;
      },
    },
  }
);

entityPermissionSchema.index(
  { _userId: 1, _organizationId: 1, entityType: 1, entityId: 1 },
  { unique: true }
);
entityPermissionSchema.index({ _organizationId: 1 });
entityPermissionSchema.index({ _userId: 1, entityType: 1 });

const entityPermissionModel = mongoose.model(
  'EntityPermission',
  entityPermissionSchema,
  'entityPermissions'
);

export default entityPermissionModel;
