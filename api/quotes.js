import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quote from '../models/Quotes.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
  console.log('Request Method:', req.method);

  const { method } = req;

  if (method === 'GET') {
    try {
      const quotes = await Quote.find();
      return res.status(200).json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return res.status(500).json({ message: 'Error fetching quotes' });
    }
  }

  if (method === 'POST') {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Quote content cannot be empty' });
    }

    try {
      const newQuote = new Quote({ content });
      await newQuote.save();
      return res.status(201).json(newQuote);
    } catch (error) {
      console.error('Error adding quote:', error);
      return res.status(500).json({ message: 'Error adding quote' });
    }
  }

  if (method === 'PATCH') {
    const { id } = req.query;
    try {
      const quote = await Quote.findById(id);
      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }
      quote.likes += 1;
      await quote.save();
      return res.status(200).json(quote);
    } catch (error) {
      console.error('Error liking quote:', error);
      return res.status(500).json({ message: 'Error liking quote' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
};
