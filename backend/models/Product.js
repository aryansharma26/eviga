import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [200, 'Name cannot exceed 200 characters'] },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: [true, 'Description is required'] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true, trim: true },
  images: [{ type: String }],
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  discountPrice: { type: Number, min: [0, 'Discount price cannot be negative'], default: 0 },
  stock: { type: Number, required: [true, 'Stock is required'], min: [0, 'Stock cannot be negative'], default: 0 },
  sku: { type: String, required: true, unique: true, trim: true },
  benefits: [{ type: String }],
  dosage: { type: String, trim: true },
  composition: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isPrescriptionRequired: { type: Boolean, default: false },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
