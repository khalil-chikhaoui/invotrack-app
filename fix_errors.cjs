const fs = require('fs');
const path = require('path');

const files = [
  "src/components/auth/AcceptInvitationForm.tsx",
  "src/components/auth/SignUpForm.tsx",
  "src/components/auth/NewPasswordForm.tsx",
  "src/components/auth/VerifyEmailForm.tsx",
  "src/components/auth/ResetPasswordForm.tsx"
];

// Matches {error && ( <div ...>{error}</div> )}
const errorRegexAuth = /\{error\s*&&\s*\(\s*<div[^>]*>\s*\{error\}\s*<\/div>\s*\)\}/g;
// AcceptInvitationForm has one without the parens maybe? Let's also check for that
const errorRegexNoParens = /\{error\s*&&\s*<div[^>]*>\s*\{error\}\s*<\/div>\s*\}/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(errorRegexAuth, '{error && (\n                <Alert variant="error" message={error} />\n              )}');
  content = content.replace(errorRegexNoParens, '{error && <Alert variant="error" message={error} />}');

  if (content !== original && !content.includes('import Alert')) {
    const importStatement = `import Alert from "@/components/ui/alert/Alert";\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    } else {
      content = importStatement + content;
    }
  }

  fs.writeFileSync(file, content);
});
console.log("Done");
