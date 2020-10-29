const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour Must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have equal and less then 40 characters'],
    minlength: [10, 'A tour name must have equal and greater then 10 characters']
  },
  duration: {
    type: Number,
    required: [true, 'A Tour Must Have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group Size']
  },
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is Either Easy Difficult or Medium'
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, '1 is minimum rating'],
    max: [5, '5 is maximum rating'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        //this only point current document on new document Creation
        return val < this.price
      },
      message: 'Discount price ({VALUE}) should be below regular price..'
    }
  },
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour Must Have a cover Image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

toursSchema.pre('save', function(next){
  this.slug = slugify(this.name, {lower: true});
  next();
});

const Tour = mongoose.model('Tour', toursSchema);
module.exports = Tour;