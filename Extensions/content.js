// Takes text like "Buy at ₹1,314" and returns the number 1314
function parsePrice(text) {
  const match = text.match(/₹\s*([\d,]+)/);

  if (!match) {
    return null; // no number found (e.g. just "₹" on its own)
  }

  const numberText = match[1].replace(/,/g, ""); // "1,314" → "1314"
  return parseFloat(numberText);                // "1314" → 1314
}

// Counts how many ₹ signs a piece of text has
function countRupees(text) {
  return text.split("₹").length - 1;
}

// Climb up from the price element until we reach a box that also has a label.
// Stop if the box gets too big, or if it holds MORE THAN ONE price
// (that means we reached a whole column or section, not a single row).
function findRowText(element, priceText) {
  let current = element;

  for (let level = 0; level < 4; level++) {
    const parent = current.parentElement;
    if (!parent) break;

    const parentText = parent.innerText.trim();

    if (parentText.length > 80) break;        // too big, stop climbing
    if (countRupees(parentText) > 1) break;   // several prices = a column, not a row

    if (parentText !== priceText.trim()) {
      return parentText;                      // found extra words, so this is the row
    }

    current = parent;                         // same text, so go up one more
  }

  return null; // couldn't find a row by climbing
}

// Plan B: if climbing fails, look LEFT of the price on the SAME LINE
// (like your eye does) and take the closest piece of text.
function findLabelOnSameLine(element) {
  const p = element.getBoundingClientRect();
  const middleY = (p.top + p.bottom) / 2;

  let bestText = "";
  let bestDistance = Infinity;

  for (const other of document.querySelectorAll("body *")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(other.tagName)) continue;
    const text = (other.innerText || "").trim();
    if (!text || text.includes("₹") || text.length > 50) continue;

    // only the innermost text box, not a box wrapping several labels
    const childHasText = [...other.children].some(c => (c.innerText || "").trim());
    if (childHasText) continue;

    const r = other.getBoundingClientRect();
    const sameLine = r.top <= middleY && r.bottom >= middleY;
    const onTheLeft = r.right <= p.left + 2;
    if (!sameLine || !onTheLeft) continue;

    const distance = p.left - r.right;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestText = text;
    }
  }

  return bestText;
}

// Words that usually mean "this is a fee or charge"
const FEE_WORDS = ["fee", "charge", "delivery", "handling", "packaging", "platform", "convenience", "tax", "gst"];

console.log("DarkLens is running on this page!");

setTimeout(() => {
  const allElements = document.querySelectorAll("*");

  for (const element of allElements) {
    // Skip code blocks: <script> and <style> can contain ₹ inside the page's data
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName)) continue;

    const text = element.innerText;

    if (text && text.includes("₹")) {

      // Does any child of this element ALSO contain ₹?
      let childHasPrice = false;
      for (const child of element.children) {
        if (child.innerText && child.innerText.includes("₹")) {
          childHasPrice = true;
        }
      }

      // Only handle the smallest box
      if (!childHasPrice) {
        const price = parsePrice(text);

        // Plan A: climb up to the row. Plan B: look left on the same line.
        let rowText = findRowText(element, text);
        if (!rowText) {
          rowText = findLabelOnSameLine(element) + " " + text.trim();
        }

        // Is this row a fee? Check if it contains any fee word
        const lowerRow = rowText.toLowerCase();
        const isFee = FEE_WORDS.some(word => lowerRow.includes(word));

        if (isFee) {
          console.log("DarkLens FEE:", rowText, "→", price);
        } else {
          console.log("DarkLens found:", rowText, "→", price);
        }
      }
    }
  }
}, 3000);