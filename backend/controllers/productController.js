import slugify from 'slugify';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, brand, minPrice, maxPrice, sort, status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    } else if (status !== 'all') {
      query.$or = [{ status: 'active' }, { status: { $exists: false } }];
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      const catDoc = await Category.findById(category);
      if (catDoc && !catDoc.parent) {
        // Parent category — include all subcategory products
        const subcats = await Category.find({ parent: category }).select('_id');
        const catIds = [category, ...subcats.map((c) => c._id.toString())];
        query.category = { $in: catIds };
      } else {
        query.category = category;
      }
    }
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, product, reviews });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, slug: slugify(req.body.name, { lower: true }) };
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'eviga/products' });
        return result.secure_url;
      });
      productData.images = await Promise.all(uploadPromises);
    }
    const product = await Product.create(productData);
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.body.name) {
      productData.slug = slugify(req.body.name, { lower: true });
    }
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'eviga/products' });
        return result.secure_url;
      });
      productData.images = await Promise.all(uploadPromises);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await Review.deleteMany({ product: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      featured: true,
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', {
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    });
    res.json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};
