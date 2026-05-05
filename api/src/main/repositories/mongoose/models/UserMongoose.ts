import mongoose, { Document, Schema } from 'mongoose';
import { USER_ROLES, UserRole } from '../../../types/config/permissions';
import { processFileUris } from '../../../services/FileService';
import { generateUserTokenDTO, hashPassword } from '../../../utils/users/helpers';

const ApiKeySchema = new Schema(
  {
    key: { type: String, required: true }, // hash, nunca plaintext
    name: { type: String, required: true },

    scopes: [
      {
        organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },

        scope: {
          type: String,
          enum: ['ALL', 'MANAGEMENT', 'VIEW'],
          required: true
        }
      }
    ],

    expiresAt: { type: Date, default: null },
    revoked: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 5,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
      default: USER_ROLES[USER_ROLES.length - 1],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    avatar: {
      type: String,
    },
    token: {
      type: String,
    },
    tokenExpiration: {
      type: Date,
    },
    apiKeys: {
      type: [ApiKeySchema],
      select: false,
      default: [],
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, resultObject) {
        delete (resultObject as any)._id;
        delete (resultObject as any).__v;

        processFileUris(resultObject, ['avatar']);

        return resultObject;
      },
    },
  }
);

userSchema.pre('save', async function (callback) {
  const user = this;
  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  user.password = await hashPassword(user.password);

  if (!user.token) {
    const tokenDTO = generateUserTokenDTO();
    user.token = tokenDTO.token;
    user.tokenExpiration = tokenDTO.tokenExpiration;
  }

  if (!user.avatar) {
    user.avatar = 'avatars/default-avatar.png';
  }

  callback();
});

export interface UserDocument extends Document {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  token?: string;
  tokenExpiration?: Date;
  apiKeys: {
    key: string;
    name: string;
    scopes: {
      organizationId: string;
      scope: 'ALL' | 'MANAGEMENT' | 'VIEW';
    }[];
    expiresAt?: Date;
    revoked: boolean;
  }[];
}

userSchema.index({ _id: 1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ "apiKeys.key": 1 });

const userModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default userModel;
