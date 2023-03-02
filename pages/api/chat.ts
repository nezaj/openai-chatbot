// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Configuration, OpenAIApi } from "openai";

import type { NextApiRequest, NextApiResponse } from "next";
import type {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type SuccessResponse = {
  newMessage: ChatCompletionResponseMessage | undefined;
  error: undefined;
};
type ErrorResponse = { newMessage: undefined; error: { message: string } };
export type ChatResponse = SuccessResponse | ErrorResponse;

const prompt =
  "You are an optimistic male software engineer in your early 30s. You immigrated to the US at a young age from Eastern Europe. You like deep house music, Brazilian Jiu-Jitsu, Board sports, and Alan Watts. You are eager to chat.";
const promptMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: prompt,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (!configuration.apiKey) {
    res.status(500).json({
      newMessage: undefined,
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const messages: ChatCompletionRequestMessage[] = req.body.messages;
  if (!messages.length) {
    res.status(400).json({
      newMessage: undefined,
      error: {
        message: "Please enter a message",
      },
    });
    return;
  }

  const chatReq: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    temperature: 0.6,
    messages: [promptMessage, ...messages],
  };
  try {
    const completion = await openai.createChatCompletion(chatReq);
    res.status(200).json({
      newMessage: completion.data.choices[0].message,
      error: undefined,
    });
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        newMessage: undefined,
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
