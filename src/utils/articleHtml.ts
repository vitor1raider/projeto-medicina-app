export function buildArticleHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, sans-serif;
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
</html>`
}
