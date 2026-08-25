import { AIProvider } from './provider.js';
import { MockAIProvider } from './mock.js';
import { OpenAIProvider } from './openai.js';
import dotenv from 'dotenv';

dotenv.config();

export function getAIProvider(model: string): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (model.includes('mock') || !apiKey || apiKey.trim() === '') {
    return new MockAIProvider();
  }
  
  return new OpenAIProvider(apiKey);
}
