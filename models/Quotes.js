import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;