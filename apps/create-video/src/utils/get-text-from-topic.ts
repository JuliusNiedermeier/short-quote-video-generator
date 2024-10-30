import OpenAI from 'openai';

export const getTextFromTopic = async (ai: OpenAI, topic: string) => {
  const command = `You generate 3 short and concise lessons about the topic "${topic}" (max 1-2 sentences each) and a short introduction (Start the introcution without putting "introduction" or any heading before it). The output should sound natural.`;
  // const command = `You generate 3 short and concise lessons about how to get rich (max 1-2 sentences each) and a short introduction (Start the introcution without putting "introduction" or any heading before it). The output should sound natural.`;

  const response = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 1,
    max_tokens: 256,
    messages: [{ role: 'system', content: command }],
  });

  return response.choices[0].message.content as string;
};
