const mongoose = require('mongoose');
const { normalizeRole, VALID_ROLES } = require('../utils/roleUtils');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: [...VALID_ROLES, 'admin'],
      default: 'employee',
      set: normalizeRole,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    joinDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    avatar: {
      type: String,
      default: '👤',
    },
    permissions: {
      type: [String],
      default: ['submit_expenses', 'view_own_expenses'],
    },
    approvalLimit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', function (next) {
  this.role = normalizeRole(this.role);
  next();
});

module.exports = mongoose.model('User', userSchema);
