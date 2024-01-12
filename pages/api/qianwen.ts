import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenError, QianWenStream } from '@/utils/server/qianwen';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, temperature } =
      (await req.json()) as ChatBody;

    let messagesToSend: QianWenMessage[] = [];

    messagesToSend = messages.map((message) => {
      const messageContent = message.content;
      let content = [] as QianWenContent[];
      if (messageContent?.image) {
        messageContent.image.forEach((url) => {
          content.push({
            image: url,
          });
        });
      }
      if (messageContent?.text) {
        content.push({ text: messageContent.text });
      }

      return { role: message.role, content };
    });

    console.log('Send messages \n', messagesToSend);

    const stream = await QianWenStream(
      model,
      prompt,
      temperature,
      messagesToSend
    );

    return new Response(stream);
  } catch (error: any) {
    if (error instanceof QianWenError) {
      console.log(error);
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      console.log(error);
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
