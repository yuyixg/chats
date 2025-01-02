import { preprocessLaTeX } from '@/utils/chats';

import { ChatSpanStatus, Content } from '@/types/chat';

import { CodeBlock } from '@/components/Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';

import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export interface ResponseMessage {
  id: string;
  content: Content;
  status: ChatSpanStatus;
}

interface Props {
  message: ResponseMessage;
}

const ResponseMessage = (props: Props) => {
  const { message } = props;
  const { status: chatStatus } = message;

  return (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex as any]}
      components={{
        code({ node, className, inline, children, ...props }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="animate-pulse cursor-default mt-1">▍</span>
              );
            }

            children[0] = (children[0] as string).replace('`▍`', '▍');
          }

          const match = /language-(\w+)/.exec(className || '');

          return !inline ? (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="md-p">{children}</p>;
        },
        table({ children }) {
          return (
            <table className="border-collapse border border-black px-3 py-1 dark:border-white">
              {children}
            </table>
          );
        },
        th({ children }) {
          return (
            <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="break-words border border-black px-3 py-1 dark:border-white">
              {children}
            </td>
          );
        },
      }}
    >
      {`${preprocessLaTeX(message.content.text!)}${
        chatStatus === ChatSpanStatus.Chatting ? '`▍`' : ''
      }`}
    </MemoizedReactMarkdown>
  );
};

export default ResponseMessage;
