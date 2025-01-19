import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
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
  password: {
    type: String,
    minlength: 5,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  address: {
    type: String,
    required: false
  },
  postalCode: {
    type: String,
    required: false
  },
  userType: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  }
}, {
  methods: {
    async verifyPassword (password) {
      return await bcrypt.compare(password, this.password)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, resultObject, options) {
      delete resultObject._id
      delete resultObject.__v
      delete resultObject.password
      return resultObject
    }
  }
})

userSchema.pre('save', function (callback) {
  const user = this
  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback()

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return callback(err)
      user.password = hash
      callback()
    })
  })
})

const userModel = mongoose.model('User', userSchema, 'users')

export default userModel
