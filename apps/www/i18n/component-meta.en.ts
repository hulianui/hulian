export interface LocalizedComponentMeta {
  shortName: string;
  description: string;
  keywords: string[];
}

export interface LocalizedComponentCategoryMeta {
  label: string;
  groups: Record<string, { label: string }>;
}

export const componentCategoryMetaEn: Record<string, LocalizedComponentCategoryMeta> = {
  layout: {
    label: "Layout",
    groups: { container: { label: "Containers" }, arrange: { label: "Arrangement" } },
  },
  typography: { label: "Typography", groups: { text: { label: "Text" }, code: { label: "Code" } } },
  forms: {
    label: "Forms",
    groups: {
      button: { label: "Buttons" },
      basic: { label: "Basic Inputs" },
      advanced: { label: "Advanced Inputs" },
      datetime: { label: "Date and Time" },
      framework: { label: "Form Frameworks" },
    },
  },
  "data-display": {
    label: "Data Display",
    groups: {
      collection: { label: "Collections" },
      info: { label: "Information" },
      stat: { label: "Metrics" },
      placeholder: { label: "Placeholders" },
    },
  },
  navigation: {
    label: "Navigation",
    groups: {
      global: { label: "Global Navigation" },
      inpage: { label: "In-page Navigation" },
      action: { label: "Actions and Tools" },
    },
  },
  feedback: {
    label: "Feedback",
    groups: {
      overlay: { label: "Overlays" },
      message: { label: "Messages" },
      loading: { label: "Loading and Progress" },
      guide: { label: "Guidance" },
    },
  },
  ai: {
    label: "AI Agents",
    groups: {
      conversation: { label: "Conversation" },
      agent: { label: "Reasoning and Tools" },
      assist: { label: "Assistance" },
    },
  },
  decoration: {
    label: "Decoration",
    groups: { backdrop: { label: "Backgrounds" }, "overlay-fx": { label: "Overlay Effects" } },
  },
  mockups: {
    label: "Device Mockups",
    groups: { window: { label: "Windows" }, device: { label: "Devices" } },
  },
  mobile: {
    label: "Mobile",
    groups: {
      nav: { label: "Navigation" },
      overlay: { label: "Overlays" },
      input: { label: "Input" },
      gesture: { label: "Gestures" },
      layout: { label: "Layout" },
    },
  },
};

export const componentMetaEn: Record<string, LocalizedComponentMeta> = {
  layout: {
    shortName: "Layout",
    description: "Provides layout patterns for structured and responsive containers.",
    keywords: ["layout", "container"],
  },
  "admin-layout": {
    shortName: "AdminLayout",
    description: "Provides admin layout patterns for structured and responsive containers.",
    keywords: ["admin", "layout", "container"],
  },
  "route-tabs": {
    shortName: "RouteTabs",
    description: "Provides route tabs patterns for navigation within a page or workspace.",
    keywords: ["route", "tabs", "navigation", "inpage"],
  },
  "scroll-area": {
    shortName: "ScrollArea",
    description: "Provides scroll area patterns for structured and responsive containers.",
    keywords: ["scroll", "area", "layout", "container"],
  },
  viewport: {
    shortName: "Viewport",
    description: "Provides viewport patterns for structured and responsive containers.",
    keywords: ["viewport", "layout", "container"],
  },
  resizable: {
    shortName: "Resizable",
    description: "Provides resizable patterns for structured and responsive containers.",
    keywords: ["resizable", "layout", "container"],
  },
  "aspect-ratio": {
    shortName: "AspectRatio",
    description: "Provides aspect ratio patterns for structured and responsive containers.",
    keywords: ["aspect", "ratio", "layout", "container"],
  },
  "fit-screen": {
    shortName: "FitScreen",
    description: "Provides fit screen patterns for structured and responsive containers.",
    keywords: ["fit", "screen", "layout", "container"],
  },
  masonry: {
    shortName: "Masonry",
    description: "Provides masonry patterns for structured and responsive containers.",
    keywords: ["masonry", "layout", "container"],
  },
  stack: {
    shortName: "Stack",
    description: "Provides stack patterns for spacing and arranging page content.",
    keywords: ["stack", "layout", "arrange"],
  },
  container: {
    shortName: "Container",
    description: "Provides container patterns for structured and responsive containers.",
    keywords: ["container", "layout"],
  },
  grid: {
    shortName: "Grid",
    description: "Provides grid patterns for spacing and arranging page content.",
    keywords: ["grid", "layout", "arrange"],
  },
  spacer: {
    shortName: "Spacer",
    description: "Provides spacer patterns for spacing and arranging page content.",
    keywords: ["spacer", "layout", "arrange"],
  },
  divider: {
    shortName: "Divider",
    description: "Provides divider patterns for spacing and arranging page content.",
    keywords: ["divider", "layout", "arrange"],
  },
  separator: {
    shortName: "Separator",
    description: "Provides separator patterns for spacing and arranging page content.",
    keywords: ["separator", "layout", "arrange"],
  },
  text: {
    shortName: "Text",
    description: "Provides text patterns for rendering and animating text content.",
    keywords: ["text", "typography"],
  },
  heading: {
    shortName: "Heading",
    description: "Provides heading patterns for rendering and animating text content.",
    keywords: ["heading", "typography", "text"],
  },
  prose: {
    shortName: "Prose",
    description: "Provides prose patterns for rendering and animating text content.",
    keywords: ["prose", "typography", "text"],
  },
  markdown: {
    shortName: "Markdown",
    description: "Provides markdown patterns for rendering and animating text content.",
    keywords: ["markdown", "typography", "text"],
  },
  "question-card": {
    shortName: "QuestionCard",
    description:
      "Provides question card patterns for presenting structured collections and rich content.",
    keywords: ["question", "card", "data-display", "collection"],
  },
  "math-text": {
    shortName: "MathText",
    description: "Provides math text patterns for rendering and animating text content.",
    keywords: ["math", "text", "typography"],
  },
  "aurora-text": {
    shortName: "AuroraText",
    description: "Provides aurora text patterns for rendering and animating text content.",
    keywords: ["aurora", "text", "typography"],
  },
  "animated-shiny-text": {
    shortName: "AnimatedShinyText",
    description: "Provides animated shiny text patterns for rendering and animating text content.",
    keywords: ["animated", "shiny", "text", "typography"],
  },
  "animated-gradient-text": {
    shortName: "AnimatedGradientText",
    description:
      "Provides animated gradient text patterns for rendering and animating text content.",
    keywords: ["animated", "gradient", "text", "typography"],
  },
  "word-rotate": {
    shortName: "WordRotate",
    description: "Provides word rotate patterns for rendering and animating text content.",
    keywords: ["word", "rotate", "typography", "text"],
  },
  "typing-animation": {
    shortName: "TypingAnimation",
    description: "Provides typing animation patterns for rendering and animating text content.",
    keywords: ["typing", "animation", "typography", "text"],
  },
  "sparkles-text": {
    shortName: "SparklesText",
    description: "Provides sparkles text patterns for rendering and animating text content.",
    keywords: ["sparkles", "text", "typography"],
  },
  "split-text": {
    shortName: "SplitText",
    description: "Provides split text patterns for rendering and animating text content.",
    keywords: ["split", "text", "typography"],
  },
  "blur-text": {
    shortName: "BlurText",
    description: "Provides blur text patterns for rendering and animating text content.",
    keywords: ["blur", "text", "typography"],
  },
  "decrypted-text": {
    shortName: "DecryptedText",
    description: "Provides decrypted text patterns for rendering and animating text content.",
    keywords: ["decrypted", "text", "typography"],
  },
  "glitch-text": {
    shortName: "GlitchText",
    description: "Provides glitch text patterns for rendering and animating text content.",
    keywords: ["glitch", "text", "typography"],
  },
  "circular-text": {
    shortName: "CircularText",
    description: "Provides circular text patterns for rendering and animating text content.",
    keywords: ["circular", "text", "typography"],
  },
  "scroll-reveal": {
    shortName: "ScrollReveal",
    description: "Provides scroll reveal patterns for rendering and animating text content.",
    keywords: ["scroll", "reveal", "typography", "text"],
  },
  "true-focus": {
    shortName: "TrueFocus",
    description: "Provides true focus patterns for rendering and animating text content.",
    keywords: ["true", "focus", "typography", "text"],
  },
  code: {
    shortName: "Code",
    description: "Provides code patterns for displaying code and keyboard input.",
    keywords: ["code", "typography"],
  },
  "code-block": {
    shortName: "CodeBlock",
    description: "Provides code block patterns for displaying code and keyboard input.",
    keywords: ["code", "block", "typography"],
  },
  snippet: {
    shortName: "Snippet",
    description: "Provides snippet patterns for displaying code and keyboard input.",
    keywords: ["snippet", "typography", "code"],
  },
  "code-diff": {
    shortName: "CodeDiff",
    description: "Provides code diff patterns for displaying code and keyboard input.",
    keywords: ["code", "diff", "typography"],
  },
  kbd: {
    shortName: "Kbd",
    description: "Provides kbd patterns for displaying code and keyboard input.",
    keywords: ["kbd", "typography", "code"],
  },
  button: {
    shortName: "Button",
    description: "Provides button patterns for triggering user actions.",
    keywords: ["button", "forms"],
  },
  "shimmer-button": {
    shortName: "ShimmerButton",
    description: "Provides shimmer button patterns for triggering user actions.",
    keywords: ["shimmer", "button", "forms"],
  },
  "rainbow-button": {
    shortName: "RainbowButton",
    description: "Provides rainbow button patterns for triggering user actions.",
    keywords: ["rainbow", "button", "forms"],
  },
  "pulsating-button": {
    shortName: "PulsatingButton",
    description: "Provides pulsating button patterns for triggering user actions.",
    keywords: ["pulsating", "button", "forms"],
  },
  "ripple-button": {
    shortName: "RippleButton",
    description: "Provides ripple button patterns for triggering user actions.",
    keywords: ["ripple", "button", "forms"],
  },
  "button-group": {
    shortName: "ButtonGroup",
    description: "Provides button group patterns for triggering user actions.",
    keywords: ["button", "group", "forms"],
  },
  "social-button": {
    shortName: "SocialButton",
    description: "Provides social button patterns for triggering user actions.",
    keywords: ["social", "button", "forms"],
  },
  input: {
    shortName: "Input",
    description: "Provides input patterns for collecting common form values.",
    keywords: ["input", "forms", "basic"],
  },
  textarea: {
    shortName: "Textarea",
    description: "Provides textarea patterns for collecting common form values.",
    keywords: ["textarea", "forms", "basic"],
  },
  select: {
    shortName: "Select",
    description: "Provides select patterns for collecting common form values.",
    keywords: ["select", "forms", "basic"],
  },
  checkbox: {
    shortName: "Checkbox",
    description: "Provides checkbox patterns for collecting common form values.",
    keywords: ["checkbox", "forms", "basic"],
  },
  "checkbox-group": {
    shortName: "CheckboxGroup",
    description: "Provides checkbox group patterns for collecting common form values.",
    keywords: ["checkbox", "group", "forms", "basic"],
  },
  radio: {
    shortName: "Radio",
    description: "Provides radio patterns for collecting common form values.",
    keywords: ["radio", "forms", "basic"],
  },
  switch: {
    shortName: "Switch",
    description: "Provides switch patterns for collecting common form values.",
    keywords: ["switch", "forms", "basic"],
  },
  toggle: {
    shortName: "Toggle",
    description: "Provides toggle patterns for collecting common form values.",
    keywords: ["toggle", "forms", "basic"],
  },
  segmented: {
    shortName: "Segmented",
    description: "Provides segmented patterns for collecting common form values.",
    keywords: ["segmented", "forms", "basic"],
  },
  slider: {
    shortName: "Slider",
    description: "Provides slider patterns for collecting common form values.",
    keywords: ["slider", "forms", "basic"],
  },
  "number-field": {
    shortName: "NumberField",
    description: "Provides number field patterns for collecting common form values.",
    keywords: ["number", "field", "forms", "basic"],
  },
  "secret-field": {
    shortName: "SecretField",
    description: "Provides secret field patterns for collecting structured or specialized input.",
    keywords: ["secret", "field", "forms", "advanced"],
  },
  "password-generator": {
    shortName: "PasswordGenerator",
    description:
      "Provides password generator patterns for collecting structured or specialized input.",
    keywords: ["password", "generator", "forms", "advanced"],
  },
  combobox: {
    shortName: "Combobox",
    description: "Provides combobox patterns for collecting structured or specialized input.",
    keywords: ["combobox", "forms", "advanced"],
  },
  "remote-select": {
    shortName: "RemoteSelect",
    description: "Provides remote select patterns for collecting structured or specialized input.",
    keywords: ["remote", "select", "forms", "advanced"],
  },
  listbox: {
    shortName: "Listbox",
    description: "Provides listbox patterns for collecting structured or specialized input.",
    keywords: ["listbox", "forms", "advanced"],
  },
  mentions: {
    shortName: "Mentions",
    description: "Provides mentions patterns for collecting structured or specialized input.",
    keywords: ["mentions", "forms", "advanced"],
  },
  "input-otp": {
    shortName: "InputOTP",
    description: "Provides input otp patterns for collecting structured or specialized input.",
    keywords: ["input", "otp", "forms", "advanced"],
  },
  rating: {
    shortName: "Rating",
    description: "Provides rating patterns for collecting structured or specialized input.",
    keywords: ["rating", "forms", "advanced"],
  },
  upload: {
    shortName: "Upload",
    description: "Provides upload patterns for collecting structured or specialized input.",
    keywords: ["upload", "forms", "advanced"],
  },
  "image-cropper": {
    shortName: "ImageCropper",
    description: "Provides image cropper patterns for collecting structured or specialized input.",
    keywords: ["image", "cropper", "forms", "advanced"],
  },
  "scope-matrix": {
    shortName: "ScopeMatrix",
    description: "Provides scope matrix patterns for collecting structured or specialized input.",
    keywords: ["scope", "matrix", "forms", "advanced"],
  },
  transfer: {
    shortName: "Transfer",
    description: "Provides transfer patterns for collecting structured or specialized input.",
    keywords: ["transfer", "forms", "advanced"],
  },
  cascader: {
    shortName: "Cascader",
    description: "Provides cascader patterns for collecting structured or specialized input.",
    keywords: ["cascader", "forms", "advanced"],
  },
  "tree-select": {
    shortName: "TreeSelect",
    description: "Provides tree select patterns for collecting structured or specialized input.",
    keywords: ["tree", "select", "forms", "advanced"],
  },
  "region-cascader": {
    shortName: "RegionCascader",
    description:
      "Provides region cascader patterns for collecting structured or specialized input.",
    keywords: ["region", "cascader", "forms", "advanced"],
  },
  "country-select": {
    shortName: "CountrySelect",
    description: "Provides country select patterns for collecting structured or specialized input.",
    keywords: ["country", "select", "forms", "advanced"],
  },
  "markdown-editor": {
    shortName: "MarkdownEditor",
    description:
      "Provides markdown editor patterns for collecting structured or specialized input.",
    keywords: ["markdown", "editor", "forms", "advanced"],
  },
  colorpicker: {
    shortName: "ColorPicker",
    description: "Provides colorpicker patterns for collecting structured or specialized input.",
    keywords: ["colorpicker", "forms", "advanced"],
  },
  "color-field": {
    shortName: "ColorField",
    description: "Provides color field patterns for collecting structured or specialized input.",
    keywords: ["color", "field", "forms", "advanced"],
  },
  "color-swatch-picker": {
    shortName: "ColorSwatchPicker",
    description:
      "Provides color swatch picker patterns for collecting structured or specialized input.",
    keywords: ["color", "swatch", "picker", "forms", "advanced"],
  },
  choicebox: {
    shortName: "Choicebox",
    description: "Provides choicebox patterns for collecting structured or specialized input.",
    keywords: ["choicebox", "forms", "advanced"],
  },
  "emoji-picker": {
    shortName: "EmojiPicker",
    description: "Provides emoji picker patterns for collecting structured or specialized input.",
    keywords: ["emoji", "picker", "forms", "advanced"],
  },
  "voice-record": {
    shortName: "VoiceRecord",
    description: "Provides voice record patterns for collecting structured or specialized input.",
    keywords: ["voice", "record", "forms", "advanced"],
  },
  calendar: {
    shortName: "Calendar",
    description: "Provides calendar patterns for selecting dates and times.",
    keywords: ["calendar", "forms", "datetime"],
  },
  "date-picker": {
    shortName: "DatePicker",
    description: "Provides date picker patterns for selecting dates and times.",
    keywords: ["date", "picker", "forms", "datetime"],
  },
  "date-time-picker": {
    shortName: "DateTimePicker",
    description: "Provides date time picker patterns for selecting dates and times.",
    keywords: ["date", "time", "picker", "forms", "datetime"],
  },
  "date-range-picker": {
    shortName: "DateRangePicker",
    description: "Provides date range picker patterns for selecting dates and times.",
    keywords: ["date", "range", "picker", "forms", "datetime"],
  },
  "icon-picker": {
    shortName: "IconPicker",
    description: "Provides icon picker patterns for collecting structured or specialized input.",
    keywords: ["icon", "picker", "forms", "advanced"],
  },
  "time-picker": {
    shortName: "TimePicker",
    description: "Provides time picker patterns for selecting dates and times.",
    keywords: ["time", "picker", "forms", "datetime"],
  },
  "time-field": {
    shortName: "TimeField",
    description: "Provides time field patterns for selecting dates and times.",
    keywords: ["time", "field", "forms", "datetime"],
  },
  form: {
    shortName: "Form",
    description: "Provides form patterns for building validated forms and workflows.",
    keywords: ["form", "forms", "framework"],
  },
  "form-dialog": {
    shortName: "ModalForm / DrawerForm",
    description: "Provides form dialog patterns for building validated forms and workflows.",
    keywords: ["form", "dialog", "forms", "framework"],
  },
  "pro-form": {
    shortName: "ProForm",
    description: "Provides pro form patterns for building validated forms and workflows.",
    keywords: ["pro", "form", "forms", "framework"],
  },
  "steps-form": {
    shortName: "StepsForm",
    description: "Provides steps form patterns for building validated forms and workflows.",
    keywords: ["steps", "form", "forms", "framework"],
  },
  "login-form": {
    shortName: "LoginForm",
    description: "Provides login form patterns for building validated forms and workflows.",
    keywords: ["login", "form", "forms", "framework"],
  },
  "click-captcha": {
    shortName: "ClickCaptcha",
    description: "Provides click captcha patterns for building validated forms and workflows.",
    keywords: ["click", "captcha", "forms", "framework"],
  },
  field: {
    shortName: "Field",
    description: "Provides field patterns for building validated forms and workflows.",
    keywords: ["field", "forms", "framework"],
  },
  "search-form": {
    shortName: "SearchForm",
    description: "Provides search form patterns for building validated forms and workflows.",
    keywords: ["search", "form", "forms", "framework"],
  },
  table: {
    shortName: "Table",
    description: "Provides table patterns for presenting structured collections and rich content.",
    keywords: ["table", "data-display", "collection"],
  },
  "book-3d": {
    shortName: "Book3D",
    description:
      "Provides book 3d patterns for presenting structured collections and rich content.",
    keywords: ["book", "3d", "data-display", "collection"],
  },
  "pro-table": {
    shortName: "ProTable",
    description:
      "Provides pro table patterns for presenting structured collections and rich content.",
    keywords: ["pro", "table", "data-display", "collection"],
  },
  "pricing-table": {
    shortName: "PricingTable",
    description:
      "Provides pricing table patterns for presenting structured collections and rich content.",
    keywords: ["pricing", "table", "data-display", "collection"],
  },
  "json-viewer": {
    shortName: "JsonViewer",
    description:
      "Provides json viewer patterns for presenting structured collections and rich content.",
    keywords: ["json", "viewer", "data-display", "collection"],
  },
  "editable-table": {
    shortName: "EditableTable",
    description:
      "Provides editable table patterns for presenting structured collections and rich content.",
    keywords: ["editable", "table", "data-display", "collection"],
  },
  list: {
    shortName: "List",
    description: "Provides list patterns for presenting structured collections and rich content.",
    keywords: ["list", "data-display", "collection"],
  },
  descriptions: {
    shortName: "Descriptions",
    description:
      "Provides descriptions patterns for presenting structured collections and rich content.",
    keywords: ["descriptions", "data-display", "collection"],
  },
  tree: {
    shortName: "Tree",
    description: "Provides tree patterns for presenting structured collections and rich content.",
    keywords: ["tree", "data-display", "collection"],
  },
  card: {
    shortName: "Card",
    description: "Provides card patterns for presenting structured collections and rich content.",
    keywords: ["card", "data-display", "collection"],
  },
  carousel: {
    shortName: "Carousel",
    description:
      "Provides carousel patterns for presenting structured collections and rich content.",
    keywords: ["carousel", "data-display", "collection"],
  },
  video: {
    shortName: "Video",
    description: "Provides video patterns for presenting structured collections and rich content.",
    keywords: ["video", "data-display", "collection"],
  },
  "bento-grid": {
    shortName: "BentoGrid",
    description:
      "Provides bento grid patterns for presenting structured collections and rich content.",
    keywords: ["bento", "grid", "data-display", "collection"],
  },
  image: {
    shortName: "Image",
    description: "Provides image patterns for presenting structured collections and rich content.",
    keywords: ["image", "data-display", "collection"],
  },
  "magic-card": {
    shortName: "MagicCard",
    description:
      "Provides magic card patterns for presenting structured collections and rich content.",
    keywords: ["magic", "card", "data-display", "collection"],
  },
  "animated-list": {
    shortName: "AnimatedList",
    description:
      "Provides animated list patterns for presenting structured collections and rich content.",
    keywords: ["animated", "list", "data-display", "collection"],
  },
  marquee: {
    shortName: "Marquee",
    description:
      "Provides marquee patterns for presenting structured collections and rich content.",
    keywords: ["marquee", "data-display", "collection"],
  },
  sortable: {
    shortName: "Sortable",
    description:
      "Provides sortable patterns for presenting structured collections and rich content.",
    keywords: ["sortable", "data-display", "collection"],
  },
  kanban: {
    shortName: "Kanban",
    description: "Provides kanban patterns for presenting structured collections and rich content.",
    keywords: ["kanban", "data-display", "collection"],
  },
  flow: {
    shortName: "Flow",
    description: "Provides flow patterns for presenting structured collections and rich content.",
    keywords: ["flow", "data-display", "collection"],
  },
  sankey: {
    shortName: "Sankey",
    description: "Provides sankey patterns for presenting structured collections and rich content.",
    keywords: ["sankey", "data-display", "collection"],
  },
  sparkline: {
    shortName: "Sparkline",
    description: "Provides sparkline patterns for displaying compact status and identity details.",
    keywords: ["sparkline", "data-display", "info"],
  },
  funnel: {
    shortName: "Funnel",
    description: "Provides funnel patterns for presenting structured collections and rich content.",
    keywords: ["funnel", "data-display", "collection"],
  },
  "event-stream": {
    shortName: "EventStream",
    description:
      "Provides event stream patterns for presenting structured collections and rich content.",
    keywords: ["event", "stream", "data-display", "collection"],
  },
  "queue-lane": {
    shortName: "QueueLane",
    description:
      "Provides queue lane patterns for presenting structured collections and rich content.",
    keywords: ["queue", "lane", "data-display", "collection"],
  },
  "document-sheet": {
    shortName: "DocumentSheet",
    description:
      "Provides document sheet patterns for presenting structured collections and rich content.",
    keywords: ["document", "sheet", "data-display", "collection"],
  },
  gantt: {
    shortName: "Gantt",
    description: "Provides gantt patterns for presenting structured collections and rich content.",
    keywords: ["gantt", "data-display", "collection"],
  },
  scheduler: {
    shortName: "Scheduler",
    description:
      "Provides scheduler patterns for presenting structured collections and rich content.",
    keywords: ["scheduler", "data-display", "collection"],
  },
  "image-viewer": {
    shortName: "ImageViewer",
    description:
      "Provides image viewer patterns for displaying compact status and identity details.",
    keywords: ["image", "viewer", "data-display", "info"],
  },
  danmaku: {
    shortName: "Danmaku",
    description:
      "Provides danmaku patterns for presenting structured collections and rich content.",
    keywords: ["danmaku", "data-display", "collection"],
  },
  "live-chat": {
    shortName: "LiveChat",
    description:
      "Provides live chat patterns for presenting structured collections and rich content.",
    keywords: ["live", "chat", "data-display", "collection"],
  },
  "live-player": {
    shortName: "LivePlayer",
    description:
      "Provides live player patterns for presenting structured collections and rich content.",
    keywords: ["live", "player", "data-display", "collection"],
  },
  "live-product-card": {
    shortName: "LiveProductCard",
    description:
      "Provides live product card patterns for displaying compact status and identity details.",
    keywords: ["live", "product", "card", "data-display", "info"],
  },
  "log-viewer": {
    shortName: "LogViewer",
    description:
      "Provides log viewer patterns for presenting structured collections and rich content.",
    keywords: ["log", "viewer", "data-display", "collection"],
  },
  "file-tree": {
    shortName: "FileTree",
    description:
      "Provides file tree patterns for presenting structured collections and rich content.",
    keywords: ["file", "tree", "data-display", "collection"],
  },
  "diff-stat": {
    shortName: "DiffStat",
    description: "Provides diff stat patterns for displaying compact status and identity details.",
    keywords: ["diff", "stat", "data-display", "info"],
  },
  "score-ring": {
    shortName: "ScoreRing",
    description: "Provides score ring patterns for displaying compact status and identity details.",
    keywords: ["score", "ring", "data-display", "info"],
  },
  heatmap: {
    shortName: "Heatmap",
    description:
      "Provides heatmap patterns for presenting structured collections and rich content.",
    keywords: ["heatmap", "data-display", "collection"],
  },
  "code-review-thread": {
    shortName: "CodeReviewThread",
    description:
      "Provides code review thread patterns for presenting structured collections and rich content.",
    keywords: ["code", "review", "thread", "data-display", "collection"],
  },
  "virtual-list": {
    shortName: "VirtualList",
    description:
      "Provides virtual list patterns for presenting structured collections and rich content.",
    keywords: ["virtual", "list", "data-display", "collection"],
  },
  "infinite-scroll": {
    shortName: "InfiniteScroll",
    description:
      "Provides infinite scroll patterns for presenting structured collections and rich content.",
    keywords: ["infinite", "scroll", "data-display", "collection"],
  },
  badge: {
    shortName: "Badge",
    description: "Provides badge patterns for displaying compact status and identity details.",
    keywords: ["badge", "data-display", "info"],
  },
  dot: {
    shortName: "Dot",
    description: "Provides dot patterns for displaying compact status and identity details.",
    keywords: ["dot", "data-display", "info"],
  },
  "status-dot": {
    shortName: "StatusDot",
    description: "Provides status dot patterns for displaying compact status and identity details.",
    keywords: ["status", "dot", "data-display", "info"],
  },
  chip: {
    shortName: "Chip",
    description: "Provides chip patterns for displaying compact status and identity details.",
    keywords: ["chip", "data-display", "info"],
  },
  coupon: {
    shortName: "Coupon",
    description: "Provides coupon patterns for displaying compact status and identity details.",
    keywords: ["coupon", "data-display", "info"],
  },
  tag: {
    shortName: "Tag",
    description: "Provides tag patterns for displaying compact status and identity details.",
    keywords: ["tag", "data-display", "info"],
  },
  annotation: {
    shortName: "Annotation",
    description: "Provides annotation patterns for displaying compact status and identity details.",
    keywords: ["annotation", "data-display", "info"],
  },
  avatar: {
    shortName: "Avatar",
    description: "Provides avatar patterns for displaying compact status and identity details.",
    keywords: ["avatar", "data-display", "info"],
  },
  "avatar-circles": {
    shortName: "AvatarCircles",
    description:
      "Provides avatar circles patterns for displaying compact status and identity details.",
    keywords: ["avatar", "circles", "data-display", "info"],
  },
  user: {
    shortName: "User",
    description: "Provides user patterns for displaying compact status and identity details.",
    keywords: ["user", "data-display", "info"],
  },
  qrcode: {
    shortName: "QRCode",
    description: "Provides qrcode patterns for displaying compact status and identity details.",
    keywords: ["qrcode", "data-display", "info"],
  },
  comment: {
    shortName: "Comment",
    description: "Provides comment patterns for displaying compact status and identity details.",
    keywords: ["comment", "data-display", "info"],
  },
  "relative-time": {
    shortName: "RelativeTime",
    description:
      "Provides relative time patterns for displaying compact status and identity details.",
    keywords: ["relative", "time", "data-display", "info"],
  },
  "git-commit": {
    shortName: "GitCommit",
    description: "Provides git commit patterns for displaying compact status and identity details.",
    keywords: ["git", "commit", "data-display", "info"],
  },
  "deploy-status": {
    shortName: "DeployStatus",
    description:
      "Provides deploy status patterns for displaying compact status and identity details.",
    keywords: ["deploy", "status", "data-display", "info"],
  },
  "contribution-graph": {
    shortName: "ContributionGraph",
    description:
      "Provides contribution graph patterns for presenting structured collections and rich content.",
    keywords: ["contribution", "graph", "data-display", "collection"],
  },
  legend: {
    shortName: "Legend",
    description: "Provides legend patterns for visualizing metrics and trends.",
    keywords: ["legend", "data-display", "stat"],
  },
  "shield-badge": {
    shortName: "ShieldBadge",
    description:
      "Provides shield badge patterns for displaying compact status and identity details.",
    keywords: ["shield", "badge", "data-display", "info"],
  },
  "award-badge": {
    shortName: "AwardBadge",
    description:
      "Provides award badge patterns for displaying compact status and identity details.",
    keywords: ["award", "badge", "data-display", "info"],
  },
  "credit-card": {
    shortName: "CreditCard",
    description:
      "Provides credit card patterns for displaying compact status and identity details.",
    keywords: ["credit", "card", "data-display", "info"],
  },
  stat: {
    shortName: "Stat",
    description: "Provides stat patterns for visualizing metrics and trends.",
    keywords: ["stat", "data-display"],
  },
  statistic: {
    shortName: "Statistic",
    description: "Provides statistic patterns for visualizing metrics and trends.",
    keywords: ["statistic", "data-display", "stat"],
  },
  chart: {
    shortName: "Chart",
    description: "Provides chart patterns for visualizing metrics and trends.",
    keywords: ["chart", "data-display", "stat"],
  },
  meter: {
    shortName: "Meter",
    description: "Provides meter patterns for visualizing metrics and trends.",
    keywords: ["meter", "data-display", "stat"],
  },
  timeline: {
    shortName: "Timeline",
    description: "Provides timeline patterns for visualizing metrics and trends.",
    keywords: ["timeline", "data-display", "stat"],
  },
  "number-ticker": {
    shortName: "NumberTicker",
    description: "Provides number ticker patterns for visualizing metrics and trends.",
    keywords: ["number", "ticker", "data-display", "stat"],
  },
  "world-map": {
    shortName: "WorldMap",
    description: "Provides world map patterns for visualizing metrics and trends.",
    keywords: ["world", "map", "data-display", "stat"],
  },
  empty: {
    shortName: "Empty",
    description: "Provides empty patterns for empty, loading, and protected states.",
    keywords: ["empty", "data-display", "placeholder"],
  },
  skeleton: {
    shortName: "Skeleton",
    description: "Provides skeleton patterns for empty, loading, and protected states.",
    keywords: ["skeleton", "data-display", "placeholder"],
  },
  watermark: {
    shortName: "Watermark",
    description: "Provides watermark patterns for empty, loading, and protected states.",
    keywords: ["watermark", "data-display", "placeholder"],
  },
  navbar: {
    shortName: "Navbar",
    description: "Provides navbar patterns for global application navigation.",
    keywords: ["navbar", "navigation", "global"],
  },
  "beian-footer": {
    shortName: "BeianFooter",
    description: "Provides beian footer patterns for global application navigation.",
    keywords: ["beian", "footer", "navigation", "global"],
  },
  "app-launcher": {
    shortName: "AppLauncher",
    description: "Provides app launcher patterns for global application navigation.",
    keywords: ["app", "launcher", "navigation", "global"],
  },
  "nav-menu": {
    shortName: "NavMenu",
    description: "Provides nav menu patterns for global application navigation.",
    keywords: ["nav", "menu", "navigation", "global"],
  },
  "navigation-menu": {
    shortName: "NavigationMenu",
    description: "Provides navigation menu patterns for global application navigation.",
    keywords: ["navigation", "menu", "global"],
  },
  menu: {
    shortName: "Menu",
    description: "Provides menu patterns for global application navigation.",
    keywords: ["menu", "navigation", "global"],
  },
  menubar: {
    shortName: "Menubar",
    description: "Provides menubar patterns for global application navigation.",
    keywords: ["menubar", "navigation", "global"],
  },
  dock: {
    shortName: "Dock",
    description: "Provides dock patterns for global application navigation.",
    keywords: ["dock", "navigation", "global"],
  },
  tabs: {
    shortName: "Tabs",
    description: "Provides tabs patterns for navigation within a page or workspace.",
    keywords: ["tabs", "navigation", "inpage"],
  },
  breadcrumb: {
    shortName: "Breadcrumb",
    description: "Provides breadcrumb patterns for navigation within a page or workspace.",
    keywords: ["breadcrumb", "navigation", "inpage"],
  },
  pagination: {
    shortName: "Pagination",
    description: "Provides pagination patterns for navigation within a page or workspace.",
    keywords: ["pagination", "navigation", "inpage"],
  },
  anchor: {
    shortName: "Anchor",
    description: "Provides anchor patterns for navigation within a page or workspace.",
    keywords: ["anchor", "navigation", "inpage"],
  },
  affix: {
    shortName: "Affix",
    description: "Provides affix patterns for navigation within a page or workspace.",
    keywords: ["affix", "navigation", "inpage"],
  },
  "back-top": {
    shortName: "BackTop",
    description: "Provides back top patterns for navigation within a page or workspace.",
    keywords: ["back", "top", "navigation", "inpage"],
  },
  stepper: {
    shortName: "Stepper",
    description: "Provides stepper patterns for navigation within a page or workspace.",
    keywords: ["stepper", "navigation", "inpage"],
  },
  steps: {
    shortName: "Steps",
    description: "Provides steps patterns for navigation within a page or workspace.",
    keywords: ["steps", "navigation", "inpage"],
  },
  "page-header": {
    shortName: "PageHeader",
    description: "Provides page header patterns for navigation within a page or workspace.",
    keywords: ["page", "header", "navigation", "inpage"],
  },
  command: {
    shortName: "Command",
    description: "Provides command patterns for navigation actions and disclosure.",
    keywords: ["command", "navigation", "action"],
  },
  "context-menu": {
    shortName: "ContextMenu",
    description: "Provides context menu patterns for navigation actions and disclosure.",
    keywords: ["context", "menu", "navigation", "action"],
  },
  toolbar: {
    shortName: "Toolbar",
    description: "Provides toolbar patterns for navigation actions and disclosure.",
    keywords: ["toolbar", "navigation", "action"],
  },
  accordion: {
    shortName: "Accordion",
    description: "Provides accordion patterns for navigation actions and disclosure.",
    keywords: ["accordion", "navigation", "action"],
  },
  collapsible: {
    shortName: "Collapsible",
    description: "Provides collapsible patterns for navigation actions and disclosure.",
    keywords: ["collapsible", "navigation", "action"],
  },
  link: {
    shortName: "Link",
    description: "Provides link patterns for navigation actions and disclosure.",
    keywords: ["link", "navigation", "action"],
  },
  "animated-theme-toggler": {
    shortName: "AnimatedThemeToggler",
    description: "Provides animated theme toggler patterns for navigation actions and disclosure.",
    keywords: ["animated", "theme", "toggler", "navigation", "action"],
  },
  dialog: {
    shortName: "Dialog",
    description: "Provides dialog patterns for layered dialogs and contextual content.",
    keywords: ["dialog", "feedback", "overlay"],
  },
  modal: {
    shortName: "Modal",
    description: "Provides modal patterns for layered dialogs and contextual content.",
    keywords: ["modal", "feedback", "overlay"],
  },
  "alert-dialog": {
    shortName: "AlertDialog",
    description: "Provides alert dialog patterns for layered dialogs and contextual content.",
    keywords: ["alert", "dialog", "feedback", "overlay"],
  },
  drawer: {
    shortName: "Drawer",
    description: "Provides drawer patterns for layered dialogs and contextual content.",
    keywords: ["drawer", "feedback", "overlay"],
  },
  popover: {
    shortName: "Popover",
    description: "Provides popover patterns for layered dialogs and contextual content.",
    keywords: ["popover", "feedback", "overlay"],
  },
  tooltip: {
    shortName: "Tooltip",
    description: "Provides tooltip patterns for layered dialogs and contextual content.",
    keywords: ["tooltip", "feedback", "overlay"],
  },
  "hover-card": {
    shortName: "HoverCard",
    description: "Provides hover card patterns for layered dialogs and contextual content.",
    keywords: ["hover", "card", "feedback", "overlay"],
  },
  glimpse: {
    shortName: "Glimpse",
    description: "Provides glimpse patterns for layered dialogs and contextual content.",
    keywords: ["glimpse", "feedback", "overlay"],
  },
  "hero-video-dialog": {
    shortName: "HeroVideoDialog",
    description: "Provides hero video dialog patterns for layered dialogs and contextual content.",
    keywords: ["hero", "video", "dialog", "feedback", "overlay"],
  },
  alert: {
    shortName: "Alert",
    description: "Provides alert patterns for status messages and transient feedback.",
    keywords: ["alert", "feedback", "message"],
  },
  "intercept-card": {
    shortName: "InterceptCard",
    description: "Provides intercept card patterns for status messages and transient feedback.",
    keywords: ["intercept", "card", "feedback", "message"],
  },
  callout: {
    shortName: "Callout",
    description: "Provides callout patterns for status messages and transient feedback.",
    keywords: ["callout", "feedback", "message"],
  },
  banner: {
    shortName: "Banner",
    description: "Provides banner patterns for status messages and transient feedback.",
    keywords: ["banner", "feedback", "message"],
  },
  toast: {
    shortName: "Toast",
    description: "Provides toast patterns for status messages and transient feedback.",
    keywords: ["toast", "feedback", "message"],
  },
  notification: {
    shortName: "Notification",
    description: "Provides notification patterns for status messages and transient feedback.",
    keywords: ["notification", "feedback", "message"],
  },
  "service-message": {
    shortName: "ServiceMessage",
    description: "Provides service message patterns for status messages and transient feedback.",
    keywords: ["service", "message", "feedback"],
  },
  result: {
    shortName: "Result",
    description: "Provides result patterns for status messages and transient feedback.",
    keywords: ["result", "feedback", "message"],
  },
  "gift-feed": {
    shortName: "GiftFeed",
    description: "Provides gift feed patterns for status messages and transient feedback.",
    keywords: ["gift", "feed", "feedback", "message"],
  },
  "floating-reactions": {
    shortName: "FloatingReactions",
    description: "Provides floating reactions patterns for status messages and transient feedback.",
    keywords: ["floating", "reactions", "feedback", "message"],
  },
  popconfirm: {
    shortName: "Popconfirm",
    description: "Provides popconfirm patterns for status messages and transient feedback.",
    keywords: ["popconfirm", "feedback", "message"],
  },
  spin: {
    shortName: "Spin",
    description: "Provides spin patterns for loading and progress feedback.",
    keywords: ["spin", "feedback", "loading"],
  },
  spinner: {
    shortName: "Spinner",
    description: "Provides spinner patterns for loading and progress feedback.",
    keywords: ["spinner", "feedback", "loading"],
  },
  progress: {
    shortName: "Progress",
    description: "Provides progress patterns for loading and progress feedback.",
    keywords: ["progress", "feedback", "loading"],
  },
  tour: {
    shortName: "Tour",
    description: "Provides tour patterns for guided tasks.",
    keywords: ["tour", "feedback", "guide"],
  },
  conversation: {
    shortName: "Conversation",
    description: "Provides conversation patterns for AI conversations.",
    keywords: ["conversation", "ai"],
  },
  "chat-message": {
    shortName: "ChatMessage",
    description: "Provides chat message patterns for AI conversations.",
    keywords: ["chat", "message", "ai", "conversation"],
  },
  "prompt-input": {
    shortName: "PromptInput",
    description: "Provides prompt input patterns for AI conversations.",
    keywords: ["prompt", "input", "ai", "conversation"],
  },
  "typing-dots": {
    shortName: "TypingDots",
    description: "Provides typing dots patterns for AI conversations.",
    keywords: ["typing", "dots", "ai", "conversation"],
  },
  "thinking-block": {
    shortName: "ThinkingBlock",
    description: "Provides thinking block patterns for agent reasoning and tool activity.",
    keywords: ["thinking", "block", "ai", "agent"],
  },
  "tool-call": {
    shortName: "ToolCall",
    description: "Provides tool call patterns for agent reasoning and tool activity.",
    keywords: ["tool", "call", "ai", "agent"],
  },
  "agent-plan": {
    shortName: "AgentPlan",
    description: "Provides agent plan patterns for agent reasoning and tool activity.",
    keywords: ["agent", "plan", "ai"],
  },
  dossier: {
    shortName: "Dossier",
    description: "Provides dossier patterns for agent reasoning and tool activity.",
    keywords: ["dossier", "ai", "agent"],
  },
  artifact: {
    shortName: "Artifact",
    description: "Provides artifact patterns for agent reasoning and tool activity.",
    keywords: ["artifact", "ai", "agent"],
  },
  "confirm-card": {
    shortName: "ConfirmCard",
    description: "Provides confirm card patterns for agent reasoning and tool activity.",
    keywords: ["confirm", "card", "ai", "agent"],
  },
  "thread-list": {
    shortName: "ThreadList",
    description: "Provides thread list patterns for agent reasoning and tool activity.",
    keywords: ["thread", "list", "ai", "agent"],
  },
  "task-runner": {
    shortName: "TaskRunner",
    description: "Provides task runner patterns for agent reasoning and tool activity.",
    keywords: ["task", "runner", "ai", "agent"],
  },
  "streaming-text": {
    shortName: "StreamingText",
    description: "Provides streaming text patterns for AI response assistance.",
    keywords: ["streaming", "text", "ai", "assist"],
  },
  "prompt-suggestions": {
    shortName: "PromptSuggestions",
    description: "Provides prompt suggestions patterns for AI response assistance.",
    keywords: ["prompt", "suggestions", "ai", "assist"],
  },
  "message-actions": {
    shortName: "MessageActions",
    description: "Provides message actions patterns for AI response assistance.",
    keywords: ["message", "actions", "ai", "assist"],
  },
  citation: {
    shortName: "Citation",
    description: "Provides citation patterns for AI response assistance.",
    keywords: ["citation", "ai", "assist"],
  },
  "dot-pattern": {
    shortName: "DotPattern",
    description: "Provides dot pattern patterns for decorative backgrounds.",
    keywords: ["dot", "pattern", "decoration", "backdrop"],
  },
  "grid-pattern": {
    shortName: "GridPattern",
    description: "Provides grid pattern patterns for decorative backgrounds.",
    keywords: ["grid", "pattern", "decoration", "backdrop"],
  },
  "striped-pattern": {
    shortName: "StripedPattern",
    description: "Provides striped pattern patterns for decorative backgrounds.",
    keywords: ["striped", "pattern", "decoration", "backdrop"],
  },
  spotlight: {
    shortName: "Spotlight",
    description: "Provides spotlight patterns for decorative backgrounds.",
    keywords: ["spotlight", "decoration", "backdrop"],
  },
  "retro-grid": {
    shortName: "RetroGrid",
    description: "Provides retro grid patterns for decorative backgrounds.",
    keywords: ["retro", "grid", "decoration", "backdrop"],
  },
  ripple: {
    shortName: "Ripple",
    description: "Provides ripple patterns for decorative backgrounds.",
    keywords: ["ripple", "decoration", "backdrop"],
  },
  meteors: {
    shortName: "Meteors",
    description: "Provides meteors patterns for decorative backgrounds.",
    keywords: ["meteors", "decoration", "backdrop"],
  },
  aurora: {
    shortName: "Aurora",
    description: "Provides aurora patterns for decorative backgrounds.",
    keywords: ["aurora", "decoration", "backdrop"],
  },
  particles: {
    shortName: "Particles",
    description: "Provides particles patterns for decorative backgrounds.",
    keywords: ["particles", "decoration", "backdrop"],
  },
  "flickering-grid": {
    shortName: "FlickeringGrid",
    description: "Provides flickering grid patterns for decorative backgrounds.",
    keywords: ["flickering", "grid", "decoration", "backdrop"],
  },
  "wavy-background": {
    shortName: "WavyBackground",
    description: "Provides wavy background patterns for decorative backgrounds.",
    keywords: ["wavy", "background", "decoration", "backdrop"],
  },
  silk: {
    shortName: "Silk",
    description: "Provides silk patterns for decorative backgrounds.",
    keywords: ["silk", "decoration", "backdrop"],
  },
  iridescence: {
    shortName: "Iridescence",
    description: "Provides iridescence patterns for decorative backgrounds.",
    keywords: ["iridescence", "decoration", "backdrop"],
  },
  threads: {
    shortName: "Threads",
    description: "Provides threads patterns for decorative backgrounds.",
    keywords: ["threads", "decoration", "backdrop"],
  },
  orb: {
    shortName: "Orb",
    description: "Provides orb patterns for decorative backgrounds.",
    keywords: ["orb", "decoration", "backdrop"],
  },
  "liquid-chrome": {
    shortName: "LiquidChrome",
    description: "Provides liquid chrome patterns for decorative backgrounds.",
    keywords: ["liquid", "chrome", "decoration", "backdrop"],
  },
  "border-beam": {
    shortName: "BorderBeam",
    description: "Provides border beam patterns for interactive visual effects.",
    keywords: ["border", "beam", "decoration", "overlay-fx"],
  },
  "shine-border": {
    shortName: "ShineBorder",
    description: "Provides shine border patterns for interactive visual effects.",
    keywords: ["shine", "border", "decoration", "overlay-fx"],
  },
  "glare-hover": {
    shortName: "GlareHover",
    description: "Provides glare hover patterns for interactive visual effects.",
    keywords: ["glare", "hover", "decoration", "overlay-fx"],
  },
  lens: {
    shortName: "Lens",
    description: "Provides lens patterns for interactive visual effects.",
    keywords: ["lens", "decoration", "overlay-fx"],
  },
  "animated-beam": {
    shortName: "AnimatedBeam",
    description: "Provides animated beam patterns for interactive visual effects.",
    keywords: ["animated", "beam", "decoration", "overlay-fx"],
  },
  "orbiting-circles": {
    shortName: "OrbitingCircles",
    description: "Provides orbiting circles patterns for interactive visual effects.",
    keywords: ["orbiting", "circles", "decoration", "overlay-fx"],
  },
  "progressive-blur": {
    shortName: "ProgressiveBlur",
    description: "Provides progressive blur patterns for interactive visual effects.",
    keywords: ["progressive", "blur", "decoration", "overlay-fx"],
  },
  "card-spotlight": {
    shortName: "CardSpotlight",
    description: "Provides card spotlight patterns for interactive visual effects.",
    keywords: ["card", "spotlight", "decoration", "overlay-fx"],
  },
  safari: {
    shortName: "Safari",
    description: "Provides safari patterns for browser and terminal mockups.",
    keywords: ["safari", "mockups", "window"],
  },
  chrome: {
    shortName: "Chrome",
    description: "Provides chrome patterns for browser and terminal mockups.",
    keywords: ["chrome", "mockups", "window"],
  },
  terminal: {
    shortName: "Terminal",
    description: "Provides terminal patterns for browser and terminal mockups.",
    keywords: ["terminal", "mockups", "window"],
  },
  iphone: {
    shortName: "iPhone",
    description: "Provides iphone patterns for device mockups.",
    keywords: ["iphone", "mockups", "device"],
  },
  android: {
    shortName: "Android",
    description: "Provides android patterns for device mockups.",
    keywords: ["android", "mockups", "device"],
  },
  tablet: {
    shortName: "Tablet",
    description: "Provides tablet patterns for device mockups.",
    keywords: ["tablet", "mockups", "device"],
  },
  watch: {
    shortName: "Watch",
    description: "Provides watch patterns for device mockups.",
    keywords: ["watch", "mockups", "device"],
  },
  "tab-bar": {
    shortName: "TabBar",
    description: "Provides tab bar patterns for mobile navigation.",
    keywords: ["tab", "bar", "mobile", "nav"],
  },
  fab: {
    shortName: "Fab",
    description: "Provides fab patterns for mobile navigation.",
    keywords: ["fab", "mobile", "nav"],
  },
  "action-sheet": {
    shortName: "ActionSheet",
    description: "Provides action sheet patterns for layered dialogs and contextual content.",
    keywords: ["action", "sheet", "mobile", "overlay"],
  },
  picker: {
    shortName: "Picker",
    description: "Provides picker patterns for mobile input.",
    keywords: ["picker", "mobile", "input"],
  },
  "swipe-action": {
    shortName: "SwipeAction",
    description: "Provides swipe action patterns for touch gestures.",
    keywords: ["swipe", "action", "mobile", "gesture"],
  },
  "pull-to-refresh": {
    shortName: "PullToRefresh",
    description: "Provides pull to refresh patterns for touch gestures.",
    keywords: ["pull", "to", "refresh", "mobile", "gesture"],
  },
  "safe-area": {
    shortName: "SafeArea",
    description: "Provides safe area patterns for mobile-safe layouts.",
    keywords: ["safe", "area", "mobile", "layout"],
  },
  "ascii-text": {
    shortName: "ASCIIText",
    description: "Provides ascii text patterns for rendering and animating text content.",
    keywords: ["ascii", "text", "typography"],
  },
  "curved-loop": {
    shortName: "CurvedLoop",
    description: "Provides curved loop patterns for rendering and animating text content.",
    keywords: ["curved", "loop", "typography", "text"],
  },
  "falling-text": {
    shortName: "FallingText",
    description: "Provides falling text patterns for rendering and animating text content.",
    keywords: ["falling", "text", "typography"],
  },
  "fuzzy-text": {
    shortName: "FuzzyText",
    description: "Provides fuzzy text patterns for rendering and animating text content.",
    keywords: ["fuzzy", "text", "typography"],
  },
  "scrambled-text": {
    shortName: "ScrambledText",
    description: "Provides scrambled text patterns for rendering and animating text content.",
    keywords: ["scrambled", "text", "typography"],
  },
  reveal: {
    shortName: "Reveal",
    description: "Provides reveal patterns for interactive visual effects.",
    keywords: ["reveal", "decoration", "overlay-fx"],
  },
  "scroll-float": {
    shortName: "ScrollFloat",
    description: "Provides scroll float patterns for rendering and animating text content.",
    keywords: ["scroll", "float", "typography", "text"],
  },
  "scroll-velocity": {
    shortName: "ScrollVelocity",
    description: "Provides scroll velocity patterns for rendering and animating text content.",
    keywords: ["scroll", "velocity", "typography", "text"],
  },
  shuffle: {
    shortName: "Shuffle",
    description: "Provides shuffle patterns for rendering and animating text content.",
    keywords: ["shuffle", "typography", "text"],
  },
  "text-cursor": {
    shortName: "TextCursor",
    description: "Provides text cursor patterns for rendering and animating text content.",
    keywords: ["text", "cursor", "typography"],
  },
  "text-pressure": {
    shortName: "TextPressure",
    description: "Provides text pressure patterns for rendering and animating text content.",
    keywords: ["text", "pressure", "typography"],
  },
  "variable-proximity": {
    shortName: "VariableProximity",
    description: "Provides variable proximity patterns for rendering and animating text content.",
    keywords: ["variable", "proximity", "typography", "text"],
  },
  antigravity: {
    shortName: "Antigravity",
    description: "Provides antigravity patterns for interactive visual effects.",
    keywords: ["antigravity", "decoration", "overlay-fx"],
  },
  "blob-cursor": {
    shortName: "BlobCursor",
    description: "Provides blob cursor patterns for interactive visual effects.",
    keywords: ["blob", "cursor", "decoration", "overlay-fx"],
  },
  "click-spark": {
    shortName: "ClickSpark",
    description: "Provides click spark patterns for interactive visual effects.",
    keywords: ["click", "spark", "decoration", "overlay-fx"],
  },
  crosshair: {
    shortName: "Crosshair",
    description: "Provides crosshair patterns for interactive visual effects.",
    keywords: ["crosshair", "decoration", "overlay-fx"],
  },
  "electric-border": {
    shortName: "ElectricBorder",
    description: "Provides electric border patterns for interactive visual effects.",
    keywords: ["electric", "border", "decoration", "overlay-fx"],
  },
  "ghost-cursor": {
    shortName: "GhostCursor",
    description: "Provides ghost cursor patterns for interactive visual effects.",
    keywords: ["ghost", "cursor", "decoration", "overlay-fx"],
  },
  "gradual-blur": {
    shortName: "GradualBlur",
    description: "Provides gradual blur patterns for interactive visual effects.",
    keywords: ["gradual", "blur", "decoration", "overlay-fx"],
  },
  "image-trail": {
    shortName: "ImageTrail",
    description: "Provides image trail patterns for interactive visual effects.",
    keywords: ["image", "trail", "decoration", "overlay-fx"],
  },
  "laser-flow": {
    shortName: "LaserFlow",
    description: "Provides laser flow patterns for interactive visual effects.",
    keywords: ["laser", "flow", "decoration", "overlay-fx"],
  },
  "magic-rings": {
    shortName: "MagicRings",
    description: "Provides magic rings patterns for interactive visual effects.",
    keywords: ["magic", "rings", "decoration", "overlay-fx"],
  },
  magnet: {
    shortName: "Magnet",
    description: "Provides magnet patterns for interactive visual effects.",
    keywords: ["magnet", "decoration", "overlay-fx"],
  },
  "magnet-lines": {
    shortName: "MagnetLines",
    description: "Provides magnet lines patterns for interactive visual effects.",
    keywords: ["magnet", "lines", "decoration", "overlay-fx"],
  },
  "meta-balls": {
    shortName: "MetaBalls",
    description: "Provides meta balls patterns for interactive visual effects.",
    keywords: ["meta", "balls", "decoration", "overlay-fx"],
  },
  "metallic-paint": {
    shortName: "MetallicPaint",
    description: "Provides metallic paint patterns for interactive visual effects.",
    keywords: ["metallic", "paint", "decoration", "overlay-fx"],
  },
  "orbit-images": {
    shortName: "OrbitImages",
    description: "Provides orbit images patterns for interactive visual effects.",
    keywords: ["orbit", "images", "decoration", "overlay-fx"],
  },
  "pixel-trail": {
    shortName: "PixelTrail",
    description: "Provides pixel trail patterns for interactive visual effects.",
    keywords: ["pixel", "trail", "decoration", "overlay-fx"],
  },
  "pixel-transition": {
    shortName: "PixelTransition",
    description: "Provides pixel transition patterns for interactive visual effects.",
    keywords: ["pixel", "transition", "decoration", "overlay-fx"],
  },
  ribbons: {
    shortName: "Ribbons",
    description: "Provides ribbons patterns for interactive visual effects.",
    keywords: ["ribbons", "decoration", "overlay-fx"],
  },
  "shape-blur": {
    shortName: "ShapeBlur",
    description: "Provides shape blur patterns for interactive visual effects.",
    keywords: ["shape", "blur", "decoration", "overlay-fx"],
  },
  "splash-cursor": {
    shortName: "SplashCursor",
    description: "Provides splash cursor patterns for interactive visual effects.",
    keywords: ["splash", "cursor", "decoration", "overlay-fx"],
  },
  "star-border": {
    shortName: "StarBorder",
    description: "Provides star border patterns for interactive visual effects.",
    keywords: ["star", "border", "decoration", "overlay-fx"],
  },
  "sticker-peel": {
    shortName: "StickerPeel",
    description: "Provides sticker peel patterns for interactive visual effects.",
    keywords: ["sticker", "peel", "decoration", "overlay-fx"],
  },
  "target-cursor": {
    shortName: "TargetCursor",
    description: "Provides target cursor patterns for interactive visual effects.",
    keywords: ["target", "cursor", "decoration", "overlay-fx"],
  },
  cubes: {
    shortName: "Cubes",
    description: "Provides cubes patterns for interactive visual effects.",
    keywords: ["cubes", "decoration", "overlay-fx"],
  },
  "logo-loop": {
    shortName: "LogoLoop",
    description:
      "Provides logo loop patterns for presenting structured collections and rich content.",
    keywords: ["logo", "loop", "data-display", "collection"],
  },
  "bubble-menu": {
    shortName: "BubbleMenu",
    description: "Provides bubble menu patterns for global application navigation.",
    keywords: ["bubble", "menu", "navigation", "global"],
  },
  "card-nav": {
    shortName: "CardNav",
    description: "Provides card nav patterns for global application navigation.",
    keywords: ["card", "nav", "navigation", "global"],
  },
  "flowing-menu": {
    shortName: "FlowingMenu",
    description: "Provides flowing menu patterns for global application navigation.",
    keywords: ["flowing", "menu", "navigation", "global"],
  },
  "gooey-nav": {
    shortName: "GooeyNav",
    description: "Provides gooey nav patterns for global application navigation.",
    keywords: ["gooey", "nav", "navigation", "global"],
  },
  "pill-nav": {
    shortName: "PillNav",
    description: "Provides pill nav patterns for global application navigation.",
    keywords: ["pill", "nav", "navigation", "global"],
  },
  "staggered-menu": {
    shortName: "StaggeredMenu",
    description: "Provides staggered menu patterns for global application navigation.",
    keywords: ["staggered", "menu", "navigation", "global"],
  },
  "bounce-cards": {
    shortName: "BounceCards",
    description:
      "Provides bounce cards patterns for presenting structured collections and rich content.",
    keywords: ["bounce", "cards", "data-display", "collection"],
  },
  "card-swap": {
    shortName: "CardSwap",
    description:
      "Provides card swap patterns for presenting structured collections and rich content.",
    keywords: ["card", "swap", "data-display", "collection"],
  },
  "chroma-grid": {
    shortName: "ChromaGrid",
    description:
      "Provides chroma grid patterns for presenting structured collections and rich content.",
    keywords: ["chroma", "grid", "data-display", "collection"],
  },
  "circular-gallery": {
    shortName: "CircularGallery",
    description:
      "Provides circular gallery patterns for presenting structured collections and rich content.",
    keywords: ["circular", "gallery", "data-display", "collection"],
  },
  "dome-gallery": {
    shortName: "DomeGallery",
    description:
      "Provides dome gallery patterns for presenting structured collections and rich content.",
    keywords: ["dome", "gallery", "data-display", "collection"],
  },
  "flying-posters": {
    shortName: "FlyingPosters",
    description:
      "Provides flying posters patterns for presenting structured collections and rich content.",
    keywords: ["flying", "posters", "data-display", "collection"],
  },
  "infinite-menu": {
    shortName: "InfiniteMenu",
    description:
      "Provides infinite menu patterns for presenting structured collections and rich content.",
    keywords: ["infinite", "menu", "data-display", "collection"],
  },
  "magic-bento": {
    shortName: "MagicBento",
    description:
      "Provides magic bento patterns for presenting structured collections and rich content.",
    keywords: ["magic", "bento", "data-display", "collection"],
  },
  "scroll-stack": {
    shortName: "ScrollStack",
    description:
      "Provides scroll stack patterns for presenting structured collections and rich content.",
    keywords: ["scroll", "stack", "data-display", "collection"],
  },
  "profile-card": {
    shortName: "ProfileCard",
    description:
      "Provides profile card patterns for presenting structured collections and rich content.",
    keywords: ["profile", "card", "data-display", "collection"],
  },
  "tilted-card": {
    shortName: "TiltedCard",
    description:
      "Provides tilted card patterns for presenting structured collections and rich content.",
    keywords: ["tilted", "card", "data-display", "collection"],
  },
  "pixel-card": {
    shortName: "PixelCard",
    description:
      "Provides pixel card patterns for presenting structured collections and rich content.",
    keywords: ["pixel", "card", "data-display", "collection"],
  },
  "decay-card": {
    shortName: "DecayCard",
    description:
      "Provides decay card patterns for presenting structured collections and rich content.",
    keywords: ["decay", "card", "data-display", "collection"],
  },
  "reflective-card": {
    shortName: "ReflectiveCard",
    description:
      "Provides reflective card patterns for presenting structured collections and rich content.",
    keywords: ["reflective", "card", "data-display", "collection"],
  },
  folder: {
    shortName: "Folder",
    description: "Provides folder patterns for presenting structured collections and rich content.",
    keywords: ["folder", "data-display", "collection"],
  },
  "border-glow": {
    shortName: "BorderGlow",
    description: "Provides border glow patterns for interactive visual effects.",
    keywords: ["border", "glow", "decoration", "overlay-fx"],
  },
  "glass-icons": {
    shortName: "GlassIcons",
    description: "Provides glass icons patterns for interactive visual effects.",
    keywords: ["glass", "icons", "decoration", "overlay-fx"],
  },
  "glass-surface": {
    shortName: "GlassSurface",
    description: "Provides glass surface patterns for interactive visual effects.",
    keywords: ["glass", "surface", "decoration", "overlay-fx"],
  },
  lanyard: {
    shortName: "Lanyard",
    description: "Provides lanyard patterns for interactive visual effects.",
    keywords: ["lanyard", "decoration", "overlay-fx"],
  },
  "model-viewer": {
    shortName: "ModelViewer",
    description: "Provides model viewer patterns for interactive visual effects.",
    keywords: ["model", "viewer", "decoration", "overlay-fx"],
  },
  "fluid-glass": {
    shortName: "FluidGlass",
    description: "Provides fluid glass patterns for interactive visual effects.",
    keywords: ["fluid", "glass", "decoration", "overlay-fx"],
  },
  "elastic-slider": {
    shortName: "ElasticSlider",
    description: "Provides elastic slider patterns for collecting common form values.",
    keywords: ["elastic", "slider", "forms", "basic"],
  },
  balatro: {
    shortName: "Balatro",
    description: "Provides balatro patterns for decorative backgrounds.",
    keywords: ["balatro", "decoration", "backdrop"],
  },
  ballpit: {
    shortName: "Ballpit",
    description: "Provides ballpit patterns for decorative backgrounds.",
    keywords: ["ballpit", "decoration", "backdrop"],
  },
  beams: {
    shortName: "Beams",
    description: "Provides beams patterns for decorative backgrounds.",
    keywords: ["beams", "decoration", "backdrop"],
  },
  "color-bends": {
    shortName: "ColorBends",
    description: "Provides color bends patterns for decorative backgrounds.",
    keywords: ["color", "bends", "decoration", "backdrop"],
  },
  "dark-veil": {
    shortName: "DarkVeil",
    description: "Provides dark veil patterns for decorative backgrounds.",
    keywords: ["dark", "veil", "decoration", "backdrop"],
  },
  dither: {
    shortName: "Dither",
    description: "Provides dither patterns for decorative backgrounds.",
    keywords: ["dither", "decoration", "backdrop"],
  },
  "dot-field": {
    shortName: "DotField",
    description: "Provides dot field patterns for decorative backgrounds.",
    keywords: ["dot", "field", "decoration", "backdrop"],
  },
  "evil-eye": {
    shortName: "EvilEye",
    description: "Provides evil eye patterns for decorative backgrounds.",
    keywords: ["evil", "eye", "decoration", "backdrop"],
  },
  "faulty-terminal": {
    shortName: "FaultyTerminal",
    description: "Provides faulty terminal patterns for decorative backgrounds.",
    keywords: ["faulty", "terminal", "decoration", "backdrop"],
  },
  ferrofluid: {
    shortName: "Ferrofluid",
    description: "Provides ferrofluid patterns for decorative backgrounds.",
    keywords: ["ferrofluid", "decoration", "backdrop"],
  },
  "floating-lines": {
    shortName: "FloatingLines",
    description: "Provides floating lines patterns for decorative backgrounds.",
    keywords: ["floating", "lines", "decoration", "backdrop"],
  },
  galaxy: {
    shortName: "Galaxy",
    description: "Provides galaxy patterns for decorative backgrounds.",
    keywords: ["galaxy", "decoration", "backdrop"],
  },
  "gradient-blinds": {
    shortName: "GradientBlinds",
    description: "Provides gradient blinds patterns for decorative backgrounds.",
    keywords: ["gradient", "blinds", "decoration", "backdrop"],
  },
  grainient: {
    shortName: "Grainient",
    description: "Provides grainient patterns for decorative backgrounds.",
    keywords: ["grainient", "decoration", "backdrop"],
  },
  "grid-distortion": {
    shortName: "GridDistortion",
    description: "Provides grid distortion patterns for decorative backgrounds.",
    keywords: ["grid", "distortion", "decoration", "backdrop"],
  },
  "grid-motion": {
    shortName: "GridMotion",
    description: "Provides grid motion patterns for decorative backgrounds.",
    keywords: ["grid", "motion", "decoration", "backdrop"],
  },
  "grid-scan": {
    shortName: "GridScan",
    description: "Provides grid scan patterns for decorative backgrounds.",
    keywords: ["grid", "scan", "decoration", "backdrop"],
  },
  hyperspeed: {
    shortName: "Hyperspeed",
    description: "Provides hyperspeed patterns for decorative backgrounds.",
    keywords: ["hyperspeed", "decoration", "backdrop"],
  },
  "letter-glitch": {
    shortName: "LetterGlitch",
    description: "Provides letter glitch patterns for decorative backgrounds.",
    keywords: ["letter", "glitch", "decoration", "backdrop"],
  },
  lightfall: {
    shortName: "Lightfall",
    description: "Provides lightfall patterns for decorative backgrounds.",
    keywords: ["lightfall", "decoration", "backdrop"],
  },
  lightning: {
    shortName: "Lightning",
    description: "Provides lightning patterns for decorative backgrounds.",
    keywords: ["lightning", "decoration", "backdrop"],
  },
  "light-pillar": {
    shortName: "LightPillar",
    description: "Provides light pillar patterns for decorative backgrounds.",
    keywords: ["light", "pillar", "decoration", "backdrop"],
  },
  "light-rays": {
    shortName: "LightRays",
    description: "Provides light rays patterns for decorative backgrounds.",
    keywords: ["light", "rays", "decoration", "backdrop"],
  },
  "line-waves": {
    shortName: "LineWaves",
    description: "Provides line waves patterns for decorative backgrounds.",
    keywords: ["line", "waves", "decoration", "backdrop"],
  },
  "liquid-ether": {
    shortName: "LiquidEther",
    description: "Provides liquid ether patterns for decorative backgrounds.",
    keywords: ["liquid", "ether", "decoration", "backdrop"],
  },
  "pixel-blast": {
    shortName: "PixelBlast",
    description: "Provides pixel blast patterns for decorative backgrounds.",
    keywords: ["pixel", "blast", "decoration", "backdrop"],
  },
  "pixel-snow": {
    shortName: "PixelSnow",
    description: "Provides pixel snow patterns for decorative backgrounds.",
    keywords: ["pixel", "snow", "decoration", "backdrop"],
  },
  plasma: {
    shortName: "Plasma",
    description: "Provides plasma patterns for decorative backgrounds.",
    keywords: ["plasma", "decoration", "backdrop"],
  },
  "plasma-wave": {
    shortName: "PlasmaWave",
    description: "Provides plasma wave patterns for decorative backgrounds.",
    keywords: ["plasma", "wave", "decoration", "backdrop"],
  },
  prism: {
    shortName: "Prism",
    description: "Provides prism patterns for decorative backgrounds.",
    keywords: ["prism", "decoration", "backdrop"],
  },
  "prismatic-burst": {
    shortName: "PrismaticBurst",
    description: "Provides prismatic burst patterns for decorative backgrounds.",
    keywords: ["prismatic", "burst", "decoration", "backdrop"],
  },
  radar: {
    shortName: "Radar",
    description: "Provides radar patterns for decorative backgrounds.",
    keywords: ["radar", "decoration", "backdrop"],
  },
  "ripple-grid": {
    shortName: "RippleGrid",
    description: "Provides ripple grid patterns for decorative backgrounds.",
    keywords: ["ripple", "grid", "decoration", "backdrop"],
  },
  "shape-grid": {
    shortName: "ShapeGrid",
    description: "Provides shape grid patterns for decorative backgrounds.",
    keywords: ["shape", "grid", "decoration", "backdrop"],
  },
  "side-rays": {
    shortName: "SideRays",
    description: "Provides side rays patterns for decorative backgrounds.",
    keywords: ["side", "rays", "decoration", "backdrop"],
  },
  "soft-aurora": {
    shortName: "SoftAurora",
    description: "Provides soft aurora patterns for decorative backgrounds.",
    keywords: ["soft", "aurora", "decoration", "backdrop"],
  },
};
