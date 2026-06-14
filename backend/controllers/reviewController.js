import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const existingReview = await Review.findOne({ user: req.user._id, product });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    const review = await Review.create({
      user: req.user._id,
      product,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
    const reviews = await Review.find({ product, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });
    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, comment },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });
    res.json({ success: true, message: 'Review updated', review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    review.isApproved = !review.isApproved;
    await review.save();
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });
    res.json({ success: true, message: 'Review approval toggled', review });
  } catch (error) {
    next(error);
  }
};
