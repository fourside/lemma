import ReactMarkdown from "react-markdown";
import styles from "./markdown-viewer.module.css";

interface Props {
  content: string;
}

export function MarkdownViewer({ content }: Props) {
  return (
    <div className={styles.viewer}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
