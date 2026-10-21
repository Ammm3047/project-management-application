import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 40 },
});

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
  },
  { _id: false }
);

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [memberSchema], default: [] },
    // Columns are embedded (own _id) so cards reference a column by id.
    // Array order == display order. Enables custom columns later with no migration.
    columns: { type: [columnSchema], default: [] },
  },
  { timestamps: true }
);

boardSchema.index({ 'members.user': 1 });

// Seed default columns + guarantee owner is a member
boardSchema.pre('validate', function (next) {
  if (this.isNew) {
    if (this.columns.length === 0) {
      this.columns = DEFAULT_COLUMNS.map((title) => ({ title }));
    }
    const ownerInMembers = this.members.some((m) => m.user.equals(this.owner));
    if (!ownerInMembers) this.members.push({ user: this.owner, role: 'owner' });
  }
  next();
});

boardSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

export default mongoose.model('Board', boardSchema);
