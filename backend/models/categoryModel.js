const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  // icon: {
  //   type: String,
  //   required: true
  // },
  // color: {
  //   type: String,
  //   required: true
  // },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ tags: 1 });

// Add text search index
categorySchema.index({ 
  name: 'text',
  description: 'text',
  tags: 'text'
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
