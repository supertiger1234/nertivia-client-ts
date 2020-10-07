export function getAllCssVars() {
  const variables = [].slice
    .call(document.styleSheets)
    // filter external css files.
    .filter((styleSheet: any) => {
      try {
        styleSheet.cssRules;
        return true;
      } catch {
        return false;
      }
    })
    .map((styleSheet: any) => [].slice.call(styleSheet.cssRules))
    .flat()
    .filter((cssRule: any) => cssRule.selectorText === ":root")
    .map((cssRule: any) =>
      cssRule.cssText
        .split("{")[1]
        .split("}")[0]
        .trim()
        .split(";")
    )
    .flat()
    .filter(text => text !== "")
    .map(text => text.split(":"))
    .map(parts => ({ key: parts[0].trim(), value: parts[1].trim() }));
  return variables;
}

export function removeCustomCssVars() {
  localStorage.removeItem("varColors");
}
export function getCustomCssVars() {
  const varColors: { [key: string]: string } = JSON.parse(
    localStorage.getItem("varColors") || "{}"
  );
  return varColors;
}
export function changeCssVar(name: string, change: any, store = true) {
  if (store) {
    const varColors = JSON.parse(localStorage.getItem("varColors") || "{}");
    localStorage.setItem(
      "varColors",
      JSON.stringify({ ...varColors, ...{ [name]: change } })
    );
  }
  document.documentElement.style.setProperty(name, change);
}