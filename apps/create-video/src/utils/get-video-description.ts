import OpenAI from 'openai';

export const getVideoDescription = async (ai: OpenAI, transcript: string) => {
  const command = `Based on a transcript of a youtube shorts video you create a catchy title, a really short video description and 10 - 20 tags to boost views on YouTube.`;

  const response = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 1,
    max_tokens: 256,
    messages: [
      { role: 'system', content: command },
      { role: 'user', content: transcript },
    ],
  });

  return response.choices[0].message.content as string;
};
