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
        console.log("DarkLens found:", text);
      }
    }
  }
}, 3000);