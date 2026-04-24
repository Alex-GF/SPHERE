import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '../../../types/config/permissions';
import { processFileUris } from '../../../services/FileService';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 5,
    required: true,
    select: false
  },
  role: {
    type: String,
    required: true,
    enum: USER_ROLES,
    default: USER_ROLES[USER_ROLES.length - 1]
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
  },
  avatar: {
    type: String
  },
  address: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  token: {
    type: String,
  },
  tokenExpiration: {
    type: Date,
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, resultObject, options) {
      delete resultObject._id;
      delete resultObject.__v;
      delete resultObject.password;
      
      processFileUris(resultObject, ['avatar']);
      
      return resultObject;
    }
  }
});

userSchema.pre('save', function (callback) {
  const user = this;
  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
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
  phone?: string;
  address?: string;
  postalCode?: string;
  token?: string;
  tokenExpiration?: Date;
}

const userModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default userModel;
