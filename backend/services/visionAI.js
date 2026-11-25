const fs = require('fs');

async function analyzeVisualDiff({ refPath, actPath, diffPath, diffPercent }) {
  if (!process.env.VISION_API_KEY) {
    return heuristic({ diffPercent });
  }

  try {
    const refB64 = fs.readFileSync(refPath).toString('base64');
    const actB64 = fs.readFileSync(actPath).toString('base64');
    const diffB64 = fs.readFileSync(diffPath).toString('base64');

    const response = await fetch(process.env.VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VISION_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a visual regression analysis assistant. Analyze the baseline, actual, and diff images. Return JSON: { "issues": [{ "title", "category", "severity", "description", "suggestion" }] }. Categories: Layout, Alignment, Spacing, Typography, Image, Color, Responsive, Visibility. Severity: Critical, High, Medium, Low.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Compare these screenshots and list visual UI bugs as JSON.' },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${refB64}` } },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${actB64}` } },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${diffB64}` } }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"issues":[]}';
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.issues) ? parsed.issues : [];
  } catch (err) {
    console.error('AI analysis failed:', err.message);
    return heuristic({ diffPercent });
  }
}

function heuristic({ diffPercent }) {
  if (diffPercent < 0.5) return [];

  const severity =
    diffPercent > 15 ? 'Critical' : diffPercent > 5 ? 'High' : 'Medium';

  return [
    {
      title: 'Unexpected visual change',
      category: 'Layout',
      severity,
      description: `About ${diffPercent.toFixed(2)}% of pixels differ from the baseline.`,
      suggestion:
        'Review recent CSS/layout changes, compare with the baseline, and verify spacing, alignment and typography.'
    }
  ];
}

module.exports = { analyzeVisualDiff };