export function buildArticleHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

      body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 4px;
        color: #222;
        line-height: 1.6;
      }
      img, video {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
      h1, h2, h3 {
        color: #222;
      }
    </style>
  </head>
  <body>${bodyHtml}</body>
</html>`;
}
