import { useContext } from 'react';

import { PropsMessage } from '@/types/components/chat';

import { HomeContext } from '@/pages/home/home';

import { CodeBlock } from '@/components/Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';

import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface Props {
  currentChatMessageId: string;
  message: PropsMessage;
  parentId: string | null;
  currentSelectIndex: number;
  parentChildrenIds: string[];
}

const ResponseMessage = (props: Props) => {
  const {
    state: { messageIsStreaming },
  } = useContext(HomeContext);

  const { message, currentChatMessageId } = props;


  return (
    <div className="pr-0">
      <MemoizedReactMarkdown
        className="prose dark:prose-invert flex-1"
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeMathjax]}
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
            return <p className='md-p'>{children}</p>
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
        {`${message.content.text}${
          messageIsStreaming && message.id == currentChatMessageId ? '`▍`' : ''
        }`}
      </MemoizedReactMarkdown>
    </div>
  );
};

export default ResponseMessage;
