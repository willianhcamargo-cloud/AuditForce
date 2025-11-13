import React from 'react';

interface MarkdownViewerProps {
    content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    
    // Process **bold** text -> <strong>...</strong>
    const processLine = (line: string) => {
        return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];

    const flushList = (key: string | number) => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={key} className="list-disc pl-5 space-y-1 my-2">
                    {currentListItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: processLine(item) }} />
                    ))}
                </ul>
            );
            currentListItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('### ')) {
            flushList(`ul-${index}`);
            const content = line.substring(4);
            elements.push(<h3 key={index} className="text-xl font-bold my-4" dangerouslySetInnerHTML={{ __html: processLine(content) }} />);
        } else if (line.startsWith('## ')) {
            flushList(`ul-${index}`);
            const content = line.substring(3);
            elements.push(<h2 key={index} className="text-2xl font-bold my-4" dangerouslySetInnerHTML={{ __html: processLine(content) }} />);
        } else if (line.startsWith('# ')) {
            flushList(`ul-${index}`);
            const content = line.substring(2);
            elements.push(<h1 key={index} className="text-3xl font-bold my-4" dangerouslySetInnerHTML={{ __html: processLine(content) }} />);
        } else if (line.startsWith('* ')) {
            const content = line.substring(2);
            currentListItems.push(content);
        } else {
            flushList(`ul-${index}`);
            if (line.trim()) {
                elements.push(<p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: processLine(line) }} />);
            }
        }
    });

    flushList('ul-end'); // Flush any remaining list

    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
};
