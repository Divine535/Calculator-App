const showcase = document.getElementById('input');

function appendToDisplay(input) {
  // Prevent consecutive operators (basic UX improvement)
  const last = showcase.value.slice(-1);
  if (isOperator(last) && isOperator(input)) return;
  showcase.value += input;
}

function Delete() {
  showcase.value = showcase.value.slice(0, -1);
}

function clearDisplay() {
  showcase.value = '';
}

function isOperator(ch) {
  return ['+', '-', '*', '/'].includes(ch);
}

// Evaluate safely-ish (basic sanitization)
function Calculate() {
  try {
    const expr = showcase.value.trim();
    if (!expr) return;
    // Basic whitelist: digits, operators, decimal point, parentheses, spaces
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      showcase.value = 'Error';
      return;
    }
    // Evaluate
    // eslint-disable-next-line no-eval
    const result = eval(expr);
    showcase.value = (result === Infinity || result === -Infinity) ? 'Error' : String(result);
  } catch (e) {
    showcase.value = 'Error';
  }
}

/* ---------- Helper: split expression into left, operator, right ---------- 
   Returns { left, op, right, leftStr, rightStr, opIndex }
   left/right are numbers (or NaN), leftStr/rightStr are raw substrings.
*/
function splitLastTerm(expression) {
  if (!expression) return { leftStr: '', op: null, rightStr: '' };

  // Find last operator occurrence, ignoring a leading unary minus for the whole expression.
  // We scan from the end to find + - * / that separates the rightmost number.
  for (let i = expression.length - 1; i >= 0; i--) {
    const ch = expression[i];
    if (['+', '-', '*', '/'].includes(ch)) {
      // But make sure this '-' is not the unary minus of the right-hand number, e.g. "5 * -3"
      // If ch is '-' and the char after it is a digit or '.' and i === expression.length - (right length) then it's an operator.
      // Simple rule: treat any operator found as separator unless it's at position 0 (leading negative for whole expr).
      if (i === 0) continue; // leading minus belongs to left number
      const leftStr = expression.slice(0, i);
      const rightStr = expression.slice(i + 1);
      return {
        leftStr,
        op: ch,
        rightStr,
        opIndex: i
      };
    }
  }

  // No operator found
  return {
    leftStr: '',
    op: null,
    rightStr: expression,
    opIndex: -1
  };
}

/* ------------------ % behavior (classic calculator mode) ------------------
Rules implemented (classic):
- If there's no operator: "b%" -> b / 100
- If expression is "A op B%":
  - + or - : treat B% as (A * B / 100)
  - *       : treat B% as (B / 100)
  - /       : treat B% as (B / 100)
*/
function applyPercent() {
  const expr = showcase.value;
  if (!expr) return;

  const { leftStr, op, rightStr } = splitLastTerm(expr);

  // If there's no operator, just divide current entry by 100
  if (!op) {
    const num = parseFloat(rightStr);
    if (Number.isNaN(num)) return;
    showcase.value = String(num / 100);
    return;
  }

  // If operator exists but right is empty, do nothing
  if (!rightStr || rightStr.trim() === '') return;

  const A = parseFloat(leftStr);
  const B = parseFloat(rightStr);

  if (Number.isNaN(B)) return;

  let replacement;
  if (op === '+' || op === '-') {
    // A ± B% => A ± (A * B / 100)
    if (Number.isNaN(A)) return;
    replacement = (A * B) / 100;
  } else if (op === '*' || op === '/') {
    // A * B% => A * (B/100)
    // A / B% => A / (B/100) but classical calculators often treat as A / (B/100) which means right becomes B/100
    replacement = B / 100;
  } else {
    return;
  }

  // Build new expression: leftStr + op + replacement
  // If op was '/', we want to place the computed term as the right operand so that the next "=" or calculation uses it
  const leftPart = leftStr;
  showcase.value = `${leftPart}${op}${String(replacement)}`;
}

/* ------------------ +/- toggle ------------------
Toggles the sign of the current rightmost entry. If there's no operator, toggles whole value.
*/
function togglePlusMinus() {
  const expr = showcase.value;
  if (!expr) return;

  const { leftStr, op, rightStr, opIndex } = splitLastTerm(expr);

  if (!op) {
    // Toggle whole number
    if (rightStr.startsWith('-')) {
      showcase.value = rightStr.slice(1);
    } else {
      showcase.value = '-' + rightStr;
    }
    return;
  }

  // Toggle sign of rightStr
  if (!rightStr) return;

  // If rightStr already starts with '-', remove it; otherwise add '-'
  let newRight;
  if (rightStr.startsWith('-')) {
    newRight = rightStr.slice(1);
  } else {
    newRight = '-' + rightStr;
  }

  showcase.value = `${leftStr}${op}${newRight}`;
}

/* ------------------ reciprocal 1/x ------------------ */
function reciprocal() {
  const expr = showcase.value;
  if (!expr) return;

  const { leftStr, op, rightStr } = splitLastTerm(expr);

  // Target the rightmost entry
  const targetStr = op ? rightStr : (leftStr === '' ? rightStr : leftStr);
  const num = parseFloat(targetStr);
  if (Number.isNaN(num) || num === 0) {
    showcase.value = 'Error';
    return;
  }

  const recip = 1 / num;

  if (op) {
    showcase.value = `${leftStr}${op}${String(recip)}`;
  } else {
    showcase.value = String(recip);
  }
}

/* ------------------ square SQR(X) ------------------ */
function square() {
  const expr = showcase.value;
  if (!expr) return;

  const { leftStr, op, rightStr } = splitLastTerm(expr);

  const targetStr = op ? rightStr : (leftStr === '' ? rightStr : leftStr);
  const num = parseFloat(targetStr);
  if (Number.isNaN(num)) return;

  const sq = num * num;

  if (op) {
    showcase.value = `${leftStr}${op}${String(sq)}`;
  } else {
    showcase.value = String(sq);
  }
}
