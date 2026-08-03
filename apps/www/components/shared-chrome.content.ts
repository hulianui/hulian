import { t, type Dictionary } from "intlayer";
import { sharedChromeContent } from "./shared-chrome.data";

export { sharedChromeContent } from "./shared-chrome.data";

const dictionary: Dictionary = {
  key: "shared-chrome",
  content: t(sharedChromeContent),
};

export default dictionary;
