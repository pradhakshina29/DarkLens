// Takes text like "Buy at ₹1,314" and returns the number 1314
function parsePrice(text) {
  const match = text.match(/₹\s*([\d,]+)/);

  if (!match) {
    return null; // no number found (e.g. just "₹" on its own)
  }

  const numberText = match[1].replace(/,/g, ""); // "1,314" → "1314"
  return parseFloat(numberText);                // "1314" → 1314
}




console.log("DarkLens is running on this page!");

setTimeout(() => {
  const allElements = document.querySelectorAll("*");

  for (const element of allElements) {
    const text = element.innerText;

    if (text && text.includes("₹")) {

      // Does any child of this element ALSO contain ₹?
      let childHasPrice = false;
      for (const child of element.children) {
        if (child.innerText && child.innerText.includes("₹")) {
          childHasPrice = true;
        }
      }

      // Only print if no child has the price, so this is the smallest box
      if (!childHasPrice) {
        const price = parsePrice(text);
        console.log("DarkLens found:", text, "→", price);
      }
    }
  }
}, 3000);