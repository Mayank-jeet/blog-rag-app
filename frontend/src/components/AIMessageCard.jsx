import ReactMarkdown from "react-markdown";

function AIMessageCard({ content }) {
  return (
    <div className="message ai-message">
      <ReactMarkdown
        urlTransform={(url) => url}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default AIMessageCard;