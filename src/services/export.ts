import TurndownService from 'turndown';
import { db } from '@/lib/db';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Helper to trigger file download
function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert HTML to Plain Text by stripping tags
function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export const exportService = {
  /**
   * Export a document as Plain Text
   */
  exportToTxt: (title: string, htmlContent: string) => {
    const textContent = stripHtml(htmlContent);
    downloadFile(textContent, `${title || 'Untitled'}.txt`, 'text/plain;charset=utf-8');
  },

  /**
   * Export a document as Markdown
   */
  exportToMarkdown: (title: string, htmlContent: string) => {
    const markdownContent = turndownService.turndown(htmlContent);
    downloadFile(markdownContent, `${title || 'Untitled'}.md`, 'text/markdown;charset=utf-8');
  },

  /**
   * Export a document as HTML
   */
  exportToHtml: (title: string, htmlContent: string) => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || 'Untitled'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #333; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled'}</h1>
  ${htmlContent}
</body>
</html>`;
    downloadFile(fullHtml, `${title || 'Untitled'}.html`, 'text/html;charset=utf-8');
  },

  /**
   * Backup the entire workspace (all documents, folders, tags) as a JSON file
   */
  exportWorkspaceBackup: async () => {
    const documents = await db.documents.toArray();
    const folders = await db.folders.toArray();
    const tags = await db.tags.toArray();
    const document_tags = await db.document_tags.toArray();

    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        documents,
        folders,
        tags,
        document_tags
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    downloadFile(jsonString, `MyWritingPad_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8');
  }
};
