const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Content Optimizer - generates title, description, hashtags
app.post('/api/optimize', async (req, res) => {
  const { topic, platform, contentType } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `You are a social media expert. Generate optimized content for the following:
Platform: ${platform}
Content Type: ${contentType}
Topic: ${topic}

Respond ONLY in this JSON format with no markdown or extra text:
{
  "title": "compelling title here",
  "description": "engaging description here (2-3 sentences)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
      }]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Image Generator - generates social media assets
app.post('/api/generate-image', async (req, res) => {
  const { prompt, platform, assetType } = req.body;

  const sizeMap = {
    'YouTube Banner': '1792x1024',
    'YouTube Thumbnail': '1792x1024',
    'Profile Picture': '1024x1024',
    'Square Post': '1024x1024',
    'Story': '1024x1792',
    'Watermark': '1024x1024'
  };

  const size = sizeMap[assetType] || '1024x1024';

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a professional ${assetType} for ${platform}. ${prompt}. Make it visually stunning, modern, and eye-catching.`,
      n: 1,
      size: size,
      quality: 'standard'
    });

    res.json({ imageUrl: response.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.get('/', (req, res) => res.send('Inceptus Backend Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Inceptus backend running on port ${PORT}`));
