const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('No files provided');
  process.exit(0);
}

const singleLineCodeRE = /^\s*\/\/\s*(?:const|let|var|function|class|if\s*\(|for\s*\(|while\s*\(|return\b|console\.log\s*\(|import\b|export\b|require\s*\(|=>|===|!==|==|new\b|try\b|catch\b|switch\b|case\b).*/;
const codeInsideRE = /(const|let|var|function|class|if\s*\(|for\s*\(|while\s*\(|return\b|console\.log\s*\(|import\b|export\b|require\s*\(|=>|===|!==|==|new\b|try\b|catch\b|switch\b|case\b)/;

for (const f of files) {
  try {
    let s = fs.readFileSync(f, 'utf8');
    const orig = s;

    // Remove single-line comments that look like code
    s = s.split('\n').filter(line => !singleLineCodeRE.test(line)).join('\n');

    // Remove non-JSDoc block comments that look like code
    s = s.replace(/\/\*([\s\S]*?)\*\//g, (match) => {
      if (match.startsWith('/**')) return match; // preserve JSDoc/TSDoc
      if (codeInsideRE.test(match)) return '';
      return match;
    });

    if (s !== orig) {
      fs.writeFileSync(f, s, 'utf8');
      console.log('Modified', f);
    }
  } catch (err) {
    console.error('Error processing', f, err.message);
  }
}
