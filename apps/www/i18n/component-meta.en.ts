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
    description:
      "Composes full-page header, sider, content, and footer regions with a collapsible sider.",
    keywords: ["layout", "container"],
  },
  "admin-layout": {
    shortName: "AdminLayout",
    description:
      "Provides an admin shell with navigation, header actions, managed route tabs, and scrollable content.",
    keywords: ["admin", "layout", "container"],
  },
  "route-tabs": {
    shortName: "RouteTabs",
    description:
      "Renders controlled workspace tabs with pinning, reordering, overflow, refresh, and contextual close actions.",
    keywords: ["route", "tabs", "navigation", "inpage"],
  },
  "scroll-area": {
    shortName: "ScrollArea",
    description: "Adds slim custom scrollbars for vertical, horizontal, or two-axis overflow.",
    keywords: ["scroll", "area", "layout", "container"],
  },
  viewport: {
    shortName: "Viewport",
    description: "Creates a container-query viewport with web, tablet, and phone width presets.",
    keywords: ["viewport", "layout", "container"],
  },
  resizable: {
    shortName: "Resizable",
    description:
      "Builds keyboard-accessible horizontal or vertical split panes with size constraints.",
    keywords: ["resizable", "layout", "container"],
  },
  "aspect-ratio": {
    shortName: "AspectRatio",
    description: "Keeps media or content inside a fixed width-to-height ratio.",
    keywords: ["aspect", "ratio", "layout", "container"],
  },
  "fit-screen": {
    shortName: "FitScreen",
    description: "Scales a fixed design canvas to fit, cover, or stretch within its container.",
    keywords: ["fit", "screen", "layout", "container"],
  },
  masonry: {
    shortName: "Masonry",
    description:
      "Distributes items deterministically across responsive columns without hydration-order changes.",
    keywords: ["masonry", "layout", "container"],
  },
  stack: {
    shortName: "Stack",
    description:
      "Arranges type-safe polymorphic flex content with gap, alignment, wrapping, and responsive direction through 2xl.",
    keywords: ["stack", "flex", "responsive", "polymorphic", "layout", "arrange"],
  },
  container: {
    shortName: "Container",
    description:
      "Constrains type-safe polymorphic content through 3xl widths with independent centering and horizontal padding controls.",
    keywords: ["container", "width", "centered", "padded", "polymorphic", "layout"],
  },
  grid: {
    shortName: "Grid",
    description:
      "Defines type-safe polymorphic grid columns through the 2xl breakpoint with gaps and child row or column spans.",
    keywords: ["grid", "responsive", "polymorphic", "columns", "layout", "arrange"],
  },
  spacer: {
    shortName: "Spacer",
    description:
      "Inserts token-scaled horizontal or vertical layout space without semantic content.",
    keywords: ["spacer", "layout", "arrange"],
  },
  divider: {
    shortName: "Divider",
    description:
      "Separates content with optional text, alignment, dashed styling, or vertical orientation.",
    keywords: ["divider", "layout", "arrange"],
  },
  separator: {
    shortName: "Separator",
    description: "Renders an accessible horizontal or vertical separator with correct geometry.",
    keywords: ["separator", "layout", "arrange"],
  },
  text: {
    shortName: "Text",
    description:
      "Applies semantic size, tone, weight, truncation, and polymorphic element choices to text.",
    keywords: ["text", "typography"],
  },
  heading: {
    shortName: "Heading",
    description:
      "Renders semantic heading levels with independently configurable visual size and weight.",
    keywords: ["heading", "typography", "text"],
  },
  prose: {
    shortName: "Prose",
    description: "Styles rich-text descendants with consistent semantic typography tokens.",
    keywords: ["prose", "typography", "text"],
  },
  markdown: {
    shortName: "Markdown",
    description:
      "Renders read-only Markdown blocks, inline formatting, links, quotes, lists, and fenced code.",
    keywords: ["markdown", "typography", "text"],
  },
  "question-card": {
    shortName: "QuestionCard",
    description:
      "Displays textbook questions with type, stem, options, subquestions, media, source, and review status.",
    keywords: ["question", "card", "data-display", "collection"],
  },
  "math-text": {
    shortName: "MathText",
    description:
      "Parses a LaTeX subset into searchable inline fractions, roots, scripts, and answer blanks.",
    keywords: ["math", "text", "typography"],
  },
  "aurora-text": {
    shortName: "AuroraText",
    description: "Animates a multicolor aurora gradient across inline text.",
    keywords: ["aurora", "text", "typography"],
  },
  "animated-shiny-text": {
    shortName: "AnimatedShinyText",
    description: "Sweeps a restrained highlight across inline text.",
    keywords: ["animated", "shiny", "text", "typography"],
  },
  "animated-gradient-text": {
    shortName: "AnimatedGradientText",
    description: "Moves a configurable gradient through text for animated emphasis.",
    keywords: ["animated", "gradient", "text", "typography"],
  },
  "word-rotate": {
    shortName: "WordRotate",
    description: "Cycles through words with enter and exit transitions.",
    keywords: ["word", "rotate", "typography", "text"],
  },
  "typing-animation": {
    shortName: "TypingAnimation",
    description:
      "Reveals text character by character with configurable timing and cursor behavior.",
    keywords: ["typing", "animation", "typography", "text"],
  },
  "sparkles-text": {
    shortName: "SparklesText",
    description: "Surrounds text with animated sparkles generated on the client.",
    keywords: ["sparkles", "text", "typography"],
  },
  "split-text": {
    shortName: "SplitText",
    description: "Splits text into animatable characters or words for staggered reveal effects.",
    keywords: ["split", "text", "typography"],
  },
  "blur-text": {
    shortName: "BlurText",
    description: "Reveals text through staged blur, opacity, and position transitions.",
    keywords: ["blur", "text", "typography"],
  },
  "decrypted-text": {
    shortName: "DecryptedText",
    description: "Scrambles and progressively resolves characters into the supplied text.",
    keywords: ["decrypted", "text", "typography"],
  },
  "glitch-text": {
    shortName: "GlitchText",
    description: "Adds layered chromatic offsets and jitter to create a controlled glitch effect.",
    keywords: ["glitch", "text", "typography"],
  },
  "circular-text": {
    shortName: "CircularText",
    description:
      "Places characters evenly around a rotating circular path with hover speed modes, inherited color, and a static reduced-motion state.",
    keywords: ["circular", "text", "rotation", "hover", "typography", "animated"],
  },
  "scroll-reveal": {
    shortName: "ScrollReveal",
    description:
      "Reveals words progressively as their text block enters and moves through the viewport.",
    keywords: ["scroll", "reveal", "typography", "text"],
  },
  "true-focus": {
    shortName: "TrueFocus",
    description: "Moves an animated focus frame and blur treatment between words.",
    keywords: ["true", "focus", "typography", "text"],
  },
  code: {
    shortName: "Code",
    description: "Styles short inline code fragments with a token-aware monospace surface.",
    keywords: ["code", "typography"],
  },
  "code-block": {
    shortName: "CodeBlock",
    description: "Displays multiline code with an optional language label and copy action.",
    keywords: ["code", "block", "typography"],
  },
  snippet: {
    shortName: "Snippet",
    description: "Presents a compact command or code snippet with one-click copying.",
    keywords: ["snippet", "typography", "code"],
  },
  "code-diff": {
    shortName: "CodeDiff",
    description:
      "Shows line-oriented additions and removals in unified or split views with line numbers and a summary.",
    keywords: ["code", "diff", "typography"],
  },
  kbd: {
    shortName: "Kbd",
    description: "Displays keyboard keys or shortcuts with inline keycap styling.",
    keywords: ["kbd", "typography", "code"],
  },
  button: {
    shortName: "Button",
    description: "Triggers actions through solid, soft, outline, ghost, or danger variants.",
    keywords: ["button", "forms"],
  },
  "shimmer-button": {
    shortName: "ShimmerButton",
    description: "Adds a moving shimmer treatment to a call-to-action button.",
    keywords: ["shimmer", "button", "forms"],
  },
  "rainbow-button": {
    shortName: "RainbowButton",
    description: "Animates a multicolor border around a prominent action button.",
    keywords: ["rainbow", "button", "forms"],
  },
  "pulsating-button": {
    shortName: "PulsatingButton",
    description: "Emphasizes an action with a configurable pulse ring around the button.",
    keywords: ["pulsating", "button", "forms"],
  },
  "ripple-button": {
    shortName: "RippleButton",
    description: "Emits pointer-positioned ripples when the button is activated.",
    keywords: ["ripple", "button", "forms"],
  },
  "button-group": {
    shortName: "ButtonGroup",
    description: "Joins related buttons into a segmented horizontal or vertical control.",
    keywords: ["button", "group", "forms"],
  },
  "social-button": {
    shortName: "SocialButton",
    description: "Provides branded sign-in buttons with service icons and loading states.",
    keywords: ["social", "button", "forms"],
  },
  input: {
    shortName: "Input",
    description: "Collects single-line text with prefixes, suffixes, and an invalid state.",
    keywords: ["input", "forms", "basic"],
  },
  textarea: {
    shortName: "Textarea",
    description: "Collects multiline text in an auto-sizing field.",
    keywords: ["textarea", "forms", "basic"],
  },
  select: {
    shortName: "Select",
    description: "Chooses one or multiple values from an anchored option popup.",
    keywords: ["select", "forms", "basic"],
  },
  checkbox: {
    shortName: "Checkbox",
    description: "Toggles an independent boolean value with an indeterminate state.",
    keywords: ["checkbox", "forms", "basic"],
  },
  "checkbox-group": {
    shortName: "CheckboxGroup",
    description: "Coordinates an array of values across a group of checkboxes.",
    keywords: ["checkbox", "group", "forms", "basic"],
  },
  radio: {
    shortName: "Radio",
    description: "Selects one mutually exclusive value from an accessible radio group.",
    keywords: ["radio", "forms", "basic"],
  },
  switch: {
    shortName: "Switch",
    description: "Toggles a binary setting with a compact track-and-thumb control.",
    keywords: ["switch", "forms", "basic"],
  },
  toggle: {
    shortName: "Toggle",
    description:
      "Switches a single action or formatting option between pressed and unpressed states.",
    keywords: ["toggle", "forms", "basic"],
  },
  segmented: {
    shortName: "Segmented",
    description: "Selects one option from a compact segmented control with a moving indicator.",
    keywords: ["segmented", "forms", "basic"],
  },
  slider: {
    shortName: "Slider",
    description: "Selects a numeric value or range along a keyboard-accessible track.",
    keywords: ["slider", "forms", "basic"],
  },
  "number-field": {
    shortName: "NumberField",
    description: "Edits numeric values with bounds, step buttons, and keyboard stepping.",
    keywords: ["number", "field", "forms", "basic"],
  },
  "secret-field": {
    shortName: "SecretField",
    description: "Masks sensitive values while supporting reveal and copy actions.",
    keywords: ["secret", "field", "forms", "advanced"],
  },
  "password-generator": {
    shortName: "PasswordGenerator",
    description: "Generates configurable passwords with strength feedback and copy support.",
    keywords: ["password", "generator", "forms", "advanced"],
  },
  combobox: {
    shortName: "Combobox",
    description: "Filters selectable options through either a trigger popup or an inline input.",
    keywords: ["combobox", "forms", "advanced"],
  },
  "remote-select": {
    shortName: "RemoteSelect",
    description:
      "Loads debounced remote options with request cancellation, pagination, initial-value resolution, and multiple selection.",
    keywords: ["remote", "select", "forms", "advanced"],
  },
  listbox: {
    shortName: "Listbox",
    description: "Presents a keyboard-navigable single or multiple selection list.",
    keywords: ["listbox", "forms", "advanced"],
  },
  mentions: {
    shortName: "Mentions",
    description: "Suggests and inserts mention tokens while the user types structured text.",
    keywords: ["mentions", "forms", "advanced"],
  },
  "input-otp": {
    shortName: "InputOTP",
    description:
      "Collects one-time codes across fixed-length slots with auto-advance, backspace, and full-code paste.",
    keywords: ["input", "otp", "forms", "advanced"],
  },
  rating: {
    shortName: "Rating",
    description:
      "Captures a controlled rating with radio semantics, custom icons, and hover preview.",
    keywords: ["rating", "forms", "advanced"],
  },
  upload: {
    shortName: "Upload",
    description:
      "Selects files through click or drag-and-drop with validation and progress states.",
    keywords: ["upload", "forms", "advanced"],
  },
  "image-cropper": {
    shortName: "ImageCropper",
    description:
      "Lets users pan, pinch, zoom, and crop an image to a fixed ratio before Blob export.",
    keywords: ["image", "cropper", "forms", "advanced"],
  },
  "region-select": {
    shortName: "RegionSelect",
    description:
      "Selects normalized original-image pixel boxes with aspect constraints, deterministic rounding, overlays, and explicit load failures.",
    keywords: ["region", "select", "image", "coordinates", "annotation", "forms", "advanced"],
  },
  "scope-matrix": {
    shortName: "ScopeMatrix",
    description:
      "Edits allow and deny scope lists with suggestions, an effective-scope summary, and read-only or controlled modes.",
    keywords: ["scope", "matrix", "forms", "advanced"],
  },
  transfer: {
    shortName: "Transfer",
    description: "Moves selected records between available and chosen lists with search support.",
    keywords: ["transfer", "forms", "advanced"],
  },
  cascader: {
    shortName: "Cascader",
    description: "Selects a value through linked hierarchical option columns.",
    keywords: ["cascader", "forms", "advanced"],
  },
  "tree-select": {
    shortName: "TreeSelect",
    description: "Selects one or more values from a searchable hierarchical tree.",
    keywords: ["tree", "select", "forms", "advanced"],
  },
  "region-cascader": {
    shortName: "RegionCascader",
    description: "Selects province, city, and district values through linked regional levels.",
    keywords: ["region", "cascader", "forms", "advanced"],
  },
  "country-select": {
    shortName: "CountrySelect",
    description: "Searches and selects countries with codes, flags, and optional calling prefixes.",
    keywords: ["country", "select", "forms", "advanced"],
  },
  "markdown-editor": {
    shortName: "MarkdownEditor",
    description: "Edits Markdown through a WYSIWYG TipTap surface with Markdown input and output.",
    keywords: ["markdown", "editor", "forms", "advanced"],
  },
  colorpicker: {
    shortName: "ColorPicker",
    description: "Selects colors through saturation and hue controls with HEX, RGB, or HSL output.",
    keywords: ["colorpicker", "forms", "advanced"],
  },
  "color-field": {
    shortName: "ColorField",
    description:
      "Edits a hexadecimal color through a swatch, system picker, text input, and shorthand expansion.",
    keywords: ["color", "field", "forms", "advanced"],
  },
  "color-swatch-picker": {
    shortName: "ColorSwatchPicker",
    description: "Chooses a color from a labeled, keyboard-accessible swatch collection.",
    keywords: ["color", "swatch", "picker", "forms", "advanced"],
  },
  choicebox: {
    shortName: "Choicebox",
    description:
      "Selects one rich option from cards containing titles, descriptions, and supporting content.",
    keywords: ["choicebox", "forms", "advanced"],
  },
  "emoji-picker": {
    shortName: "EmojiPicker",
    description: "Searches and selects emoji by category, including a recent-use section.",
    keywords: ["emoji", "picker", "forms", "advanced"],
  },
  "voice-record": {
    shortName: "VoiceRecord",
    description:
      "Presents hold-to-talk or tap-to-toggle recording controls with waveform and processing states.",
    keywords: ["voice", "record", "forms", "advanced"],
  },
  calendar: {
    shortName: "Calendar",
    description:
      "Displays a navigable day, month, or year calendar with limits and disabled-date rules.",
    keywords: ["calendar", "forms", "datetime"],
  },
  "date-picker": {
    shortName: "DatePicker",
    description: "Selects a date from an input-triggered calendar popup.",
    keywords: ["date", "picker", "forms", "datetime"],
  },
  "date-time-picker": {
    shortName: "DateTimePicker",
    description: "Combines calendar and time controls for a single date-time value.",
    keywords: ["date", "time", "picker", "forms", "datetime"],
  },
  "date-range-picker": {
    shortName: "DateRangePicker",
    description: "Selects a start and end date from a dual-month range calendar.",
    keywords: ["date", "range", "picker", "forms", "datetime"],
  },
  "icon-picker": {
    shortName: "IconPicker",
    description: "Searches and selects an icon from a categorized visual grid.",
    keywords: ["icon", "picker", "forms", "advanced"],
  },
  "time-picker": {
    shortName: "TimePicker",
    description: "Selects a time from hour and minute option controls.",
    keywords: ["time", "picker", "forms", "datetime"],
  },
  "time-field": {
    shortName: "TimeField",
    description: "Edits hour, minute, and optional second segments directly from the keyboard.",
    keywords: ["time", "field", "forms", "datetime"],
  },
  form: {
    shortName: "Form",
    description: "Coordinates named fields with structured submission and field errors.",
    keywords: ["form", "forms", "framework"],
  },
  "form-dialog": {
    shortName: "ModalForm / DrawerForm",
    description:
      "Runs validated forms inside modal or drawer containers with submit lifecycle handling.",
    keywords: ["form", "dialog", "forms", "framework"],
  },
  "pro-form": {
    shortName: "ProForm",
    description:
      "Coordinates form state with submit-reset footers, async loading, and custom footer content.",
    keywords: ["pro", "form", "forms", "framework"],
  },
  "steps-form": {
    shortName: "StepsForm",
    description: "Splits a validated workflow across ordered steps with controlled navigation.",
    keywords: ["steps", "form", "forms", "framework"],
  },
  "login-form": {
    shortName: "LoginForm",
    description:
      "Provides a managed credential form with validation, controlled values, field appearance slots, remember copy, and an optional card surface.",
    keywords: [
      "login",
      "form",
      "authentication",
      "fields",
      "surface",
      "remember",
      "forms",
      "framework",
    ],
  },
  "auth-panel": {
    shortName: "AuthPanel",
    description:
      "Builds the branded half of a split authentication page with token-based gradients, highlights, content, and a footer.",
    keywords: ["authentication", "panel", "login", "signup", "gradient", "forms", "framework"],
  },
  "click-captcha": {
    shortName: "ClickCaptcha",
    description:
      "Collects an ordered set of relative image coordinates with undo, refresh, and keyboard crosshair controls.",
    keywords: ["click", "captcha", "forms", "framework"],
  },
  field: {
    shortName: "Field",
    description: "Composes labels, controls, help text, validation messages, and required state.",
    keywords: ["field", "forms", "framework"],
  },
  "search-form": {
    shortName: "SearchForm",
    description: "Builds collapsible query filters with reset and submit actions for data lists.",
    keywords: ["search", "form", "forms", "framework"],
  },
  table: {
    shortName: "Table",
    description:
      "Renders sortable semantic tables with clickable rows, column headers, and empty states.",
    keywords: ["table", "data-display", "collection"],
  },
  "book-3d": {
    shortName: "Book3D",
    description: "Displays a book cover with perspective depth and interactive 3D tilt.",
    keywords: ["book", "3d", "data-display", "collection"],
  },
  "pro-table": {
    shortName: "ProTable",
    description:
      "Combines business-table columns, querying, sorting, selection, pagination, and toolbar actions.",
    keywords: ["pro", "table", "data-display", "collection"],
  },
  "pricing-table": {
    shortName: "PricingTable",
    description:
      "Compares priced items in transposed feature rows with highlights, badges, and sticky headers.",
    keywords: ["pricing", "table", "data-display", "collection"],
  },
  "json-viewer": {
    shortName: "JsonViewer",
    description:
      "Inspects collapsible JSON values with syntax coloring, copying, and depth controls.",
    keywords: ["json", "viewer", "data-display", "collection"],
  },
  "editable-table": {
    shortName: "EditableTable",
    description: "Edits validated row and cell values directly within a data table.",
    keywords: ["editable", "table", "data-display", "collection"],
  },
  list: {
    shortName: "List",
    description:
      "Presents accessible named lists with structured items, metadata, actions, grid mode, empty states, and pagination or load-more controls.",
    keywords: [
      "list",
      "accessible",
      "aria",
      "pagination",
      "load more",
      "data-display",
      "collection",
    ],
  },
  descriptions: {
    shortName: "Descriptions",
    description:
      "Displays labeled record fields in horizontal or vertical, bordered or unbordered layouts.",
    keywords: ["descriptions", "data-display", "collection"],
  },
  tree: {
    shortName: "Tree",
    description: "Renders expandable hierarchical nodes with selection and keyboard navigation.",
    keywords: ["tree", "data-display", "collection"],
  },
  card: {
    shortName: "Card",
    description: "Groups related content into header, body, and footer regions.",
    keywords: ["card", "data-display", "collection"],
  },
  carousel: {
    shortName: "Carousel",
    description:
      "Navigates scroll-snap slides with arrows, dots, autoplay, looping, dragging, and keyboard controls.",
    keywords: ["carousel", "data-display", "collection"],
  },
  video: {
    shortName: "Video",
    description:
      "Plays file or HLS video with custom controls, chapters, resume, picture-in-picture, and fullscreen.",
    keywords: ["video", "data-display", "collection"],
  },
  "bento-grid": {
    shortName: "BentoGrid",
    description:
      "Arranges feature cards across configurable row and column spans with a hover action.",
    keywords: ["bento", "grid", "data-display", "collection"],
  },
  image: {
    shortName: "Image",
    description: "Loads images with fade-in, fallback, radius, and optional hover zoom.",
    keywords: ["image", "data-display", "collection"],
  },
  "magic-card": {
    shortName: "MagicCard",
    description: "Adds a pointer-following gradient highlight to a content card.",
    keywords: ["magic", "card", "data-display", "collection"],
  },
  "animated-list": {
    shortName: "AnimatedList",
    description: "Reveals child items sequentially with fade-and-rise motion on viewport entry.",
    keywords: ["animated", "list", "data-display", "collection"],
  },
  marquee: {
    shortName: "Marquee",
    description:
      "Scrolls repeated content continuously in a configurable direction with pause controls.",
    keywords: ["marquee", "data-display", "collection"],
  },
  sortable: {
    shortName: "Sortable",
    description: "Reorders items through pointer and keyboard drag interactions.",
    keywords: ["sortable", "data-display", "collection"],
  },
  kanban: {
    shortName: "Kanban",
    description:
      "Organizes draggable cards across status columns with controlled movement callbacks.",
    keywords: ["kanban", "data-display", "collection"],
  },
  flow: {
    shortName: "Flow",
    description:
      "Edits controlled node-and-edge canvases with node dragging, edge connection, panning, zooming, and fit view.",
    keywords: ["flow", "data-display", "collection"],
  },
  sankey: {
    shortName: "Sankey",
    description: "Visualizes weighted flow between stages with proportional nodes and links.",
    keywords: ["sankey", "data-display", "collection"],
  },
  sparkline: {
    shortName: "Sparkline",
    description: "Shows a compact trend line for a small numeric series without full chart chrome.",
    keywords: ["sparkline", "data-display", "info"],
  },
  funnel: {
    shortName: "Funnel",
    description: "Visualizes stage-by-stage quantities as a proportional conversion funnel.",
    keywords: ["funnel", "data-display", "collection"],
  },
  "event-stream": {
    shortName: "EventStream",
    description: "Displays a live chronological stream of typed operational events.",
    keywords: ["event", "stream", "data-display", "collection"],
  },
  "queue-lane": {
    shortName: "QueueLane",
    description:
      "Shows prioritized queue items in read-only lanes with depth, average-wait, and throughput metrics.",
    keywords: ["queue", "lane", "data-display", "collection"],
  },
  "document-sheet": {
    shortName: "DocumentSheet",
    description:
      "Frames business documents on an A4-style sheet with header, section, footer, and print controls.",
    keywords: ["document", "sheet", "data-display", "collection"],
  },
  gantt: {
    shortName: "Gantt",
    description:
      "Plots grouped tasks and progress on scrollable day, week, or month timelines with a today marker.",
    keywords: ["gantt", "data-display", "collection"],
  },
  scheduler: {
    shortName: "Scheduler",
    description:
      "Manages events across month, week, day, and resource views with drag-based editing.",
    keywords: ["scheduler", "data-display", "collection"],
  },
  "image-viewer": {
    shortName: "ImageViewer",
    description:
      "Opens images in a full-screen viewer with anchored zoom, panning, navigation, and thumbnails.",
    keywords: ["image", "viewer", "data-display", "info"],
  },
  danmaku: {
    shortName: "Danmaku",
    description: "Overlays lane-allocated scrolling, top, or bottom audience comments on media.",
    keywords: ["danmaku", "data-display", "collection"],
  },
  "live-chat": {
    shortName: "LiveChat",
    description:
      "Displays live message types, sender levels, pinned items, auto-scroll, and new-message recovery.",
    keywords: ["live", "chat", "data-display", "collection"],
  },
  "live-player": {
    shortName: "LivePlayer",
    description: "Presents a live video surface with status, viewer count, controls, and overlays.",
    keywords: ["live", "player", "data-display", "collection"],
  },
  "live-product-card": {
    shortName: "LiveProductCard",
    description:
      "Shows live-commerce products with pricing, stock, sales, active state, and purchase action.",
    keywords: ["live", "product", "card", "data-display", "info"],
  },
  "log-viewer": {
    shortName: "LogViewer",
    description: "Displays leveled log lines with timestamps, sources, wrapping, and auto-scroll.",
    keywords: ["log", "viewer", "data-display", "collection"],
  },
  "file-tree": {
    shortName: "FileTree",
    description:
      "Browses expandable files and folders with selection and version-control status badges.",
    keywords: ["file", "tree", "data-display", "collection"],
  },
  "diff-stat": {
    shortName: "DiffStat",
    description:
      "Summarizes added and removed lines with proportional bars and file-status badges.",
    keywords: ["diff", "stat", "data-display", "info"],
  },
  "score-ring": {
    shortName: "ScoreRing",
    description: "Displays a numeric score and grade inside a color-coded radial gauge.",
    keywords: ["score", "ring", "data-display", "info"],
  },
  heatmap: {
    shortName: "Heatmap",
    description:
      "Maps matrix values to color intensity with labels, legends, empty states, and drill-down.",
    keywords: ["heatmap", "data-display", "collection"],
  },
  "code-review-thread": {
    shortName: "CodeReviewThread",
    description:
      "Presents review comments, replies, severity, suggested diffs, and resolution or false-positive actions.",
    keywords: ["code", "review", "thread", "data-display", "collection"],
  },
  "virtual-list": {
    shortName: "VirtualList",
    description: "Renders only visible rows from large lists while preserving scroll position.",
    keywords: ["virtual", "list", "data-display", "collection"],
  },
  "infinite-scroll": {
    shortName: "InfiniteScroll",
    description:
      "Loads additional content near the viewport boundary with pending and terminal states.",
    keywords: ["infinite", "scroll", "data-display", "collection"],
  },
  badge: {
    shortName: "Badge",
    description: "Overlays a count, capped count, custom value, or dot on wrapped content.",
    keywords: ["badge", "data-display", "info"],
  },
  dot: {
    shortName: "Dot",
    description:
      "Renders a semantic or arbitrary-color status indicator with optional pulse and accessible labeling.",
    keywords: ["dot", "status", "color", "legend", "pulse", "data-display", "info"],
  },
  "status-dot": {
    shortName: "StatusDot",
    description: "Pairs a status label with a colored dot and optional animated activity state.",
    keywords: ["status", "dot", "data-display", "info"],
  },
  chip: {
    shortName: "Chip",
    description:
      "Shows a compact token with semantic styling, an optional dot, and removal action.",
    keywords: ["chip", "data-display", "info"],
  },
  coupon: {
    shortName: "Coupon",
    description: "Displays discount value, conditions, validity, and claim or used state.",
    keywords: ["coupon", "data-display", "info"],
  },
  tag: {
    shortName: "Tag",
    description: "Labels content with semantic color, optional icon, and close action.",
    keywords: ["tag", "data-display", "info"],
  },
  annotation: {
    shortName: "Annotation",
    description:
      "Adds a handwritten-style highlight, arrow, or note around inline content in eight positions.",
    keywords: ["annotation", "data-display", "info"],
  },
  avatar: {
    shortName: "Avatar",
    description: "Displays a user image with fallback content.",
    keywords: ["avatar", "data-display", "info"],
  },
  "avatar-circles": {
    shortName: "AvatarCircles",
    description: "Stacks overlapping avatars with an optional overflow count.",
    keywords: ["avatar", "circles", "data-display", "info"],
  },
  user: {
    shortName: "User",
    description:
      "Combines an avatar, display name, and supporting description into a compact user row.",
    keywords: ["user", "data-display", "info"],
  },
  qrcode: {
    shortName: "QRCode",
    description:
      "Generates theme-aware QR SVGs with version and correction boosting, excavated or watermark logos, plus SVG and high-DPI PNG export helpers.",
    keywords: [
      "qrcode",
      "qr",
      "svg",
      "png",
      "export",
      "logo",
      "correction",
      "data-display",
      "info",
    ],
  },
  comment: {
    shortName: "Comment",
    description:
      "Displays nested comments with reply indentation, optional connectors, and action slots.",
    keywords: ["comment", "data-display", "info"],
  },
  "relative-time": {
    shortName: "RelativeTime",
    description: "Formats timestamps as continuously updated human-readable relative time.",
    keywords: ["relative", "time", "data-display", "info"],
  },
  "git-commit": {
    shortName: "GitCommit",
    description:
      "Shows a branch, short hash, commit message, and author in inline or stacked form.",
    keywords: ["git", "commit", "data-display", "info"],
  },
  "deploy-status": {
    shortName: "DeployStatus",
    description:
      "Communicates queued, building, live, failed, canceled, or skipped deployment states.",
    keywords: ["deploy", "status", "data-display", "info"],
  },
  "contribution-graph": {
    shortName: "ContributionGraph",
    description: "Plots dated activity counts in a calendar heatmap with intensity legend.",
    keywords: ["contribution", "graph", "data-display", "collection"],
  },
  legend: {
    shortName: "Legend",
    description: "Explains chart series or status colors with compact labeled markers.",
    keywords: ["legend", "data-display", "stat"],
  },
  "shield-badge": {
    shortName: "ShieldBadge",
    description: "Renders repository-style metric badges with label and value segments.",
    keywords: ["shield", "badge", "data-display", "info"],
  },
  "award-badge": {
    shortName: "AwardBadge",
    description:
      "Displays a laurel emblem beside a prefixed award title in outline, solid, or soft styles.",
    keywords: ["award", "badge", "data-display", "info"],
  },
  "credit-card": {
    shortName: "CreditCard",
    description:
      "Displays a formatted or masked card number with detected brand and front or back card faces.",
    keywords: ["credit", "card", "data-display", "info"],
  },
  stat: {
    shortName: "Stat",
    description: "Presents a key metric with label, change, trend, and supporting context.",
    keywords: ["stat", "data-display"],
  },
  statistic: {
    shortName: "Statistic",
    description:
      "Formats numeric values with precision, separators, prefixes, suffixes, optional animation, or a countdown.",
    keywords: ["statistic", "data-display", "stat"],
  },
  chart: {
    shortName: "Chart",
    description:
      "Wraps responsive Recharts area, bar, line, pie, radar, and radial charts with theme tokens, axis sizing, and series legends.",
    keywords: ["chart", "area", "bar", "line", "pie", "radar", "legend", "data-display", "stat"],
  },
  meter: {
    shortName: "Meter",
    description: "Displays a value within a known range using a semantic gauge bar.",
    keywords: ["meter", "data-display", "stat"],
  },
  timeline: {
    shortName: "Timeline",
    description:
      "Orders events along a timeline with colored or custom markers, alternate placement, and a pending state.",
    keywords: ["timeline", "data-display", "stat"],
  },
  "number-ticker": {
    shortName: "NumberTicker",
    description: "Animates a numeric value toward its target when it enters the viewport.",
    keywords: ["number", "ticker", "data-display", "stat"],
  },
  "world-map": {
    shortName: "WorldMap",
    description: "Plots geographic points and animated routes on an interactive world map.",
    keywords: ["world", "map", "data-display", "stat"],
  },
  empty: {
    shortName: "Empty",
    description: "Explains an empty result with an icon, title, description, and optional action.",
    keywords: ["empty", "data-display", "placeholder"],
  },
  skeleton: {
    shortName: "Skeleton",
    description: "Reserves content geometry with an animated loading placeholder.",
    keywords: ["skeleton", "data-display", "placeholder"],
  },
  watermark: {
    shortName: "Watermark",
    description: "Tiles a high-DPI canvas watermark and restores it after DOM tampering.",
    keywords: ["watermark", "data-display", "placeholder"],
  },
  navbar: {
    shortName: "Navbar",
    description:
      "Builds a responsive top navigation bar with brand, links, actions, and mobile menu.",
    keywords: ["navbar", "navigation", "global"],
  },
  "beian-footer": {
    shortName: "BeianFooter",
    description:
      "Renders Chinese filing and public-security registration links in a compliant footer.",
    keywords: ["beian", "footer", "navigation", "global"],
  },
  "app-launcher": {
    shortName: "AppLauncher",
    description: "Opens a searchable grid of application shortcuts from global navigation.",
    keywords: ["app", "launcher", "navigation", "global"],
  },
  brand: {
    shortName: "Brand",
    description:
      "Combines a square brand mark, name, and optional description with collapsed and router-link modes.",
    keywords: ["brand", "logo", "identity", "navigation", "global"],
  },
  "nav-menu": {
    shortName: "NavMenu",
    description:
      "Renders controlled multilevel navigation in tree or semantic list-and-link mode with inline and collapsed presentation.",
    keywords: [
      "nav",
      "menu",
      "tree",
      "list",
      "link",
      "semantics",
      "accessibility",
      "navigation",
      "global",
    ],
  },
  "navigation-menu": {
    shortName: "NavigationMenu",
    description:
      "Provides triggers, links, and rich navigation panels through a shared animated viewport.",
    keywords: ["navigation", "menu", "global"],
  },
  menu: {
    shortName: "Menu",
    description: "Presents action items, groups, separators, and a danger treatment in a dropdown.",
    keywords: ["menu", "navigation", "global"],
  },
  menubar: {
    shortName: "Menubar",
    description:
      "Organizes persistent application menus into a keyboard-accessible horizontal bar.",
    keywords: ["menubar", "navigation", "global"],
  },
  dock: {
    shortName: "Dock",
    description: "Displays magnifying icon shortcuts along an animated application dock.",
    keywords: ["dock", "navigation", "global"],
  },
  tabs: {
    shortName: "Tabs",
    description: "Switches between labeled content panels with underline or solid indicators.",
    keywords: ["tabs", "navigation", "inpage"],
  },
  breadcrumb: {
    shortName: "Breadcrumb",
    description: "Shows a static page hierarchy with a semantic current-page marker.",
    keywords: ["breadcrumb", "navigation", "inpage"],
  },
  pagination: {
    shortName: "Pagination",
    description: "Navigates controlled paged data with page ranges and ellipses.",
    keywords: ["pagination", "navigation", "inpage"],
  },
  anchor: {
    shortName: "Anchor",
    description: "Tracks and navigates headings within long-form page content.",
    keywords: ["anchor", "navigation", "inpage"],
  },
  affix: {
    shortName: "Affix",
    description: "Pins content after a scroll threshold while preserving its layout position.",
    keywords: ["affix", "navigation", "inpage"],
  },
  "back-top": {
    shortName: "BackTop",
    description:
      "Reveals a control that smoothly returns a configured scroll container to the top.",
    keywords: ["back", "top", "navigation", "inpage"],
  },
  stepper: {
    shortName: "Stepper",
    description:
      "Displays connected process steps with completed checks and an accessible current-step marker.",
    keywords: ["stepper", "navigation", "inpage"],
  },
  steps: {
    shortName: "Steps",
    description: "Communicates progress and status across an ordered multi-step process.",
    keywords: ["steps", "navigation", "inpage"],
  },
  "page-header": {
    shortName: "PageHeader",
    description: "Combines back navigation, breadcrumbs, title, tags, actions, and footer tabs.",
    keywords: ["page", "header", "navigation", "inpage"],
  },
  command: {
    shortName: "Command",
    description: "Searches and executes grouped commands through a keyboard-first palette.",
    keywords: ["command", "navigation", "action"],
  },
  "context-menu": {
    shortName: "ContextMenu",
    description: "Opens contextual action items at the pointer with a danger treatment.",
    keywords: ["context", "menu", "navigation", "action"],
  },
  toolbar: {
    shortName: "Toolbar",
    description: "Groups related action controls with roving keyboard focus.",
    keywords: ["toolbar", "navigation", "action"],
  },
  accordion: {
    shortName: "Accordion",
    description: "Expands one or multiple stacked content sections with height transitions.",
    keywords: ["accordion", "navigation", "action"],
  },
  collapsible: {
    shortName: "Collapsible",
    description: "Toggles visibility of a single content region with a height transition.",
    keywords: ["collapsible", "navigation", "action"],
  },
  link: {
    shortName: "Link",
    description: "Renders styled navigation with tone, underline, and external-link behavior.",
    keywords: ["link", "navigation", "action"],
  },
  "animated-theme-toggler": {
    shortName: "AnimatedThemeToggler",
    description: "Switches color themes through an animated icon transition.",
    keywords: ["animated", "theme", "toggler", "navigation", "action"],
  },
  dialog: {
    shortName: "Dialog",
    description: "Presents modal content in a portal with focus trapping.",
    keywords: ["dialog", "feedback", "overlay"],
  },
  modal: {
    shortName: "Modal",
    description:
      "Opens imperative confirm, information, success, warning, or error dialogs through a shared API.",
    keywords: ["modal", "feedback", "overlay"],
  },
  "alert-dialog": {
    shortName: "AlertDialog",
    description: "Requests confirmation for consequential actions in a blocking accessible dialog.",
    keywords: ["alert", "dialog", "feedback", "overlay"],
  },
  drawer: {
    shortName: "Drawer",
    description:
      "Slides contextual or task content from any screen edge with modal focus management and a localized optional close button.",
    keywords: ["drawer", "close", "modal", "feedback", "overlay"],
  },
  popover: {
    shortName: "Popover",
    description: "Anchors interactive contextual content to a trigger without leaving the page.",
    keywords: ["popover", "feedback", "overlay"],
  },
  tooltip: {
    shortName: "Tooltip",
    description: "Shows brief guidance in an arrowed positioned layer on hover.",
    keywords: ["tooltip", "feedback", "overlay"],
  },
  "hover-card": {
    shortName: "HoverCard",
    description: "Shows rich content after pointer hover and closes it after a leave delay.",
    keywords: ["hover", "card", "feedback", "overlay"],
  },
  glimpse: {
    shortName: "Glimpse",
    description: "Displays a compact delayed preview of referenced content near its trigger.",
    keywords: ["glimpse", "feedback", "overlay"],
  },
  "hero-video-dialog": {
    shortName: "HeroVideoDialog",
    description: "Opens a video from a thumbnail and play button in a modal player.",
    keywords: ["hero", "video", "dialog", "feedback", "overlay"],
  },
  alert: {
    shortName: "Alert",
    description: "Communicates persistent informational, success, warning, or danger messages.",
    keywords: ["alert", "feedback", "message"],
  },
  "intercept-card": {
    shortName: "InterceptCard",
    description: "Interrupts a flow with a contextual decision card and explicit actions.",
    keywords: ["intercept", "card", "feedback", "message"],
  },
  callout: {
    shortName: "Callout",
    description: "Highlights supporting guidance or warnings within document content.",
    keywords: ["callout", "feedback", "message"],
  },
  banner: {
    shortName: "Banner",
    description: "Displays a full-width announcement with tone, action, and dismissal support.",
    keywords: ["banner", "feedback", "message"],
  },
  toast: {
    shortName: "Toast",
    description: "Queues brief transient feedback that can close automatically or manually.",
    keywords: ["toast", "feedback", "message"],
  },
  notification: {
    shortName: "Notification",
    description:
      "Stacks positioned notification cards with icons, content, actions, and an imperative API.",
    keywords: ["notification", "feedback", "message"],
  },
  "service-message": {
    shortName: "ServiceMessage",
    description:
      "Displays a service-notification card with source header, structured fields or custom content, and footer actions.",
    keywords: ["service", "message", "feedback"],
  },
  result: {
    shortName: "Result",
    description:
      "Presents success, error, information, warning, permission, or server outcomes with detail and action slots.",
    keywords: ["result", "feedback", "message"],
  },
  "gift-feed": {
    shortName: "GiftFeed",
    description: "Streams live gift events with sender, item, quantity, and combo emphasis.",
    keywords: ["gift", "feed", "feedback", "message"],
  },
  "floating-reactions": {
    shortName: "FloatingReactions",
    description: "Animates lightweight audience reactions upward over live content.",
    keywords: ["floating", "reactions", "feedback", "message"],
  },
  popconfirm: {
    shortName: "Popconfirm",
    description: "Confirms a nearby action in a compact anchored popup.",
    keywords: ["popconfirm", "feedback", "message"],
  },
  spin: {
    shortName: "Spin",
    description: "Overlays a loading indicator on existing content while preserving its layout.",
    keywords: ["spin", "feedback", "loading"],
  },
  spinner: {
    shortName: "Spinner",
    description: "Renders a standalone CSS loading ring with status semantics.",
    keywords: ["spinner", "feedback", "loading"],
  },
  progress: {
    shortName: "Progress",
    description: "Displays determinate or indeterminate progress in linear or circular form.",
    keywords: ["progress", "feedback", "loading"],
  },
  tour: {
    shortName: "Tour",
    description:
      "Guides users through anchored steps with a cutout highlight, positioned card, navigation, and progress.",
    keywords: ["tour", "feedback", "guide"],
  },
  conversation: {
    shortName: "Conversation",
    description:
      "Stacks chat messages in a scrollable timeline that follows new messages and streamed growth.",
    keywords: ["conversation", "ai"],
  },
  "chat-message": {
    shortName: "ChatMessage",
    description: "Displays one chat turn with role, content, status, and supporting actions.",
    keywords: ["chat", "message", "ai", "conversation"],
  },
  "prompt-input": {
    shortName: "PromptInput",
    description:
      "Composes auto-growing prompts with submit, stop, keyboard, IME, and custom action controls.",
    keywords: ["prompt", "input", "ai", "conversation"],
  },
  "typing-dots": {
    shortName: "TypingDots",
    description: "Signals that a conversational participant is composing a response.",
    keywords: ["typing", "dots", "ai", "conversation"],
  },
  "thinking-block": {
    shortName: "ThinkingBlock",
    description: "Reveals or collapses an agent reasoning trace with active and completed states.",
    keywords: ["thinking", "block", "ai", "agent"],
  },
  "tool-call": {
    shortName: "ToolCall",
    description: "Shows an agent tool invocation, arguments, progress, result, and failure state.",
    keywords: ["tool", "call", "ai", "agent"],
  },
  "agent-plan": {
    shortName: "AgentPlan",
    description:
      "Displays an ordered agent plan with pending, active, completed, and failed steps.",
    keywords: ["agent", "plan", "ai"],
  },
  dossier: {
    shortName: "Dossier",
    description:
      "Tracks agent collection domains with empty, active, archived, optional, and summary states.",
    keywords: ["dossier", "ai", "agent"],
  },
  artifact: {
    shortName: "Artifact",
    description:
      "Presents generated content with a title, version chip, action slot, and controlled or uncontrolled expansion.",
    keywords: ["artifact", "ai", "agent"],
  },
  "confirm-card": {
    shortName: "ConfirmCard",
    description: "Requests explicit user approval for an agent-proposed operation.",
    keywords: ["confirm", "card", "ai", "agent"],
  },
  "thread-list": {
    shortName: "ThreadList",
    description:
      "Lists conversation threads with active state, metadata, deletion, a header action, and an empty state.",
    keywords: ["thread", "list", "ai", "agent"],
  },
  "task-runner": {
    shortName: "TaskRunner",
    description:
      "Summarizes agent task status, plan steps, completion progress, tags, and elapsed time.",
    keywords: ["task", "runner", "ai", "agent"],
  },
  "streaming-text": {
    shortName: "StreamingText",
    description: "Renders parent-accumulated text with a blinking trailing cursor while streaming.",
    keywords: ["streaming", "text", "ai", "assist"],
  },
  "prompt-suggestions": {
    shortName: "PromptSuggestions",
    description: "Offers clickable starter prompts or follow-up suggestions.",
    keywords: ["prompt", "suggestions", "ai", "assist"],
  },
  "message-actions": {
    shortName: "MessageActions",
    description: "Groups copy, retry, rate, and related controls for a chat message.",
    keywords: ["message", "actions", "ai", "assist"],
  },
  citation: {
    shortName: "Citation",
    description: "Renders an inline numbered source link with a title and source label.",
    keywords: ["citation", "ai", "assist"],
  },
  "dot-pattern": {
    shortName: "DotPattern",
    description: "Draws a token-colored repeating dot background with an SVG pattern.",
    keywords: ["dot", "pattern", "decoration", "backdrop"],
  },
  "grid-pattern": {
    shortName: "GridPattern",
    description: "Draws a scalable line grid for decorative section backgrounds.",
    keywords: ["grid", "pattern", "decoration", "backdrop"],
  },
  "striped-pattern": {
    shortName: "StripedPattern",
    description: "Creates diagonal stripes as a lightweight CSS decorative surface.",
    keywords: ["striped", "pattern", "decoration", "backdrop"],
  },
  spotlight: {
    shortName: "Spotlight",
    description: "Adds a theme-aware radial glow behind foreground content.",
    keywords: ["spotlight", "decoration", "backdrop"],
  },
  "retro-grid": {
    shortName: "RetroGrid",
    description: "Animates a perspective grid toward the viewer for a retro backdrop.",
    keywords: ["retro", "grid", "decoration", "backdrop"],
  },
  ripple: {
    shortName: "Ripple",
    description: "Emits concentric decorative rings from a configurable origin.",
    keywords: ["ripple", "decoration", "backdrop"],
  },
  meteors: {
    shortName: "Meteors",
    description: "Animates diagonal meteor streaks behind content.",
    keywords: ["meteors", "decoration", "backdrop"],
  },
  aurora: {
    shortName: "Aurora",
    description: "Renders softly moving layered aurora gradients as a background.",
    keywords: ["aurora", "decoration", "backdrop"],
  },
  particles: {
    shortName: "Particles",
    description:
      "Animates a canvas particle field with pointer repulsion and theme-aware foreground color.",
    keywords: ["particles", "decoration", "backdrop"],
  },
  "flickering-grid": {
    shortName: "FlickeringGrid",
    description: "Animates random grid-cell opacity to create a flickering technical backdrop.",
    keywords: ["flickering", "grid", "decoration", "backdrop"],
  },
  "wavy-background": {
    shortName: "WavyBackground",
    description: "Renders layered multicolor waves with a canvas value-noise field.",
    keywords: ["wavy", "background", "decoration", "backdrop"],
  },
  silk: {
    shortName: "Silk",
    description: "Produces a flowing fabric-like WebGL surface with theme-aware color.",
    keywords: ["silk", "decoration", "backdrop"],
  },
  iridescence: {
    shortName: "Iridescence",
    description: "Produces a shifting pearlescent WebGL color field with pointer response.",
    keywords: ["iridescence", "decoration", "backdrop"],
  },
  threads: {
    shortName: "Threads",
    description:
      "Renders flowing luminous WebGL threads with configurable amplitude and interaction.",
    keywords: ["threads", "decoration", "backdrop"],
  },
  orb: {
    shortName: "Orb",
    description: "Displays an animated shader orb with hover intensity and theme-aware color.",
    keywords: ["orb", "decoration", "backdrop"],
  },
  "liquid-chrome": {
    shortName: "LiquidChrome",
    description: "Creates a reflective liquid-metal shader background with pointer distortion.",
    keywords: ["liquid", "chrome", "decoration", "backdrop"],
  },
  "border-beam": {
    shortName: "BorderBeam",
    description: "Moves a luminous beam along the border of a positioned element.",
    keywords: ["border", "beam", "decoration", "overlay-fx"],
  },
  "shine-border": {
    shortName: "ShineBorder",
    description: "Animates a gradient sheen around an element border.",
    keywords: ["shine", "border", "decoration", "overlay-fx"],
  },
  "glare-hover": {
    shortName: "GlareHover",
    description: "Sweeps a diagonal glare across content when the pointer hovers.",
    keywords: ["glare", "hover", "decoration", "overlay-fx"],
  },
  lens: {
    shortName: "Lens",
    description: "Magnifies arbitrary content beneath a movable circular lens.",
    keywords: ["lens", "decoration", "overlay-fx"],
  },
  "animated-beam": {
    shortName: "AnimatedBeam",
    description: "Draws animated directional beams between referenced elements.",
    keywords: ["animated", "beam", "decoration", "overlay-fx"],
  },
  "orbiting-circles": {
    shortName: "OrbitingCircles",
    description: "Moves child items around one or more circular paths.",
    keywords: ["orbiting", "circles", "decoration", "overlay-fx"],
  },
  "progressive-blur": {
    shortName: "ProgressiveBlur",
    description: "Applies a directional multi-step blur gradient at a content edge.",
    keywords: ["progressive", "blur", "decoration", "overlay-fx"],
  },
  "card-spotlight": {
    shortName: "CardSpotlight",
    description: "Tracks the pointer with a radial spotlight inside a card surface.",
    keywords: ["card", "spotlight", "decoration", "overlay-fx"],
  },
  safari: {
    shortName: "Safari",
    description: "Frames screenshots in a Safari-style browser window with an address bar.",
    keywords: ["safari", "mockups", "window"],
  },
  chrome: {
    shortName: "Chrome",
    description: "Frames content in a Chrome-style browser window with tabs and address bar.",
    keywords: ["chrome", "mockups", "window"],
  },
  terminal: {
    shortName: "Terminal",
    description: "Displays terminal commands and output in a styled window shell.",
    keywords: ["terminal", "mockups", "window"],
  },
  iphone: {
    shortName: "iPhone",
    description: "Frames content inside an iPhone-style shell with a Dynamic Island.",
    keywords: ["iphone", "mockups", "device"],
  },
  android: {
    shortName: "Android",
    description: "Frames content inside an Android phone device mockup.",
    keywords: ["android", "mockups", "device"],
  },
  tablet: {
    shortName: "Tablet",
    description: "Frames content inside a tablet device mockup.",
    keywords: ["tablet", "mockups", "device"],
  },
  watch: {
    shortName: "Watch",
    description: "Frames compact content inside a smartwatch device mockup.",
    keywords: ["watch", "mockups", "device"],
  },
  "tab-bar": {
    shortName: "TabBar",
    description: "Provides safe-area-aware bottom navigation for mobile application sections.",
    keywords: ["tab", "bar", "mobile", "nav"],
  },
  fab: {
    shortName: "Fab",
    description: "Places a prominent floating mobile action button above page content.",
    keywords: ["fab", "mobile", "nav"],
  },
  "action-sheet": {
    shortName: "ActionSheet",
    description: "Presents touch-friendly actions in a modal sheet from the bottom edge.",
    keywords: ["action", "sheet", "mobile", "overlay"],
  },
  picker: {
    shortName: "Picker",
    description: "Selects values through one or more scroll-snap wheel columns.",
    keywords: ["picker", "mobile", "input"],
  },
  "swipe-action": {
    shortName: "SwipeAction",
    description: "Reveals contextual row actions through horizontal touch gestures.",
    keywords: ["swipe", "action", "mobile", "gesture"],
  },
  "pull-to-refresh": {
    shortName: "PullToRefresh",
    description:
      "Tracks a resisted downward pull, arms at a threshold, and holds until refresh completes.",
    keywords: ["pull", "to", "refresh", "mobile", "gesture"],
  },
  "safe-area": {
    shortName: "SafeArea",
    description: "Applies device inset padding to keep mobile content outside obstructed regions.",
    keywords: ["safe", "area", "mobile", "layout"],
  },
  "ascii-text": {
    shortName: "ASCIIText",
    description: "Renders supplied text as an animated ASCII glyph field.",
    keywords: ["ascii", "text", "typography"],
  },
  "curved-loop": {
    shortName: "CurvedLoop",
    description: "Repeats text along a draggable curved path in a continuous loop.",
    keywords: ["curved", "loop", "typography", "text"],
  },
  "falling-text": {
    shortName: "FallingText",
    description: "Turns words into gravity-driven interactive falling bodies.",
    keywords: ["falling", "text", "typography"],
  },
  "fuzzy-text": {
    shortName: "FuzzyText",
    description: "Adds animated displacement noise to text while keeping its silhouette readable.",
    keywords: ["fuzzy", "text", "typography"],
  },
  "scrambled-text": {
    shortName: "ScrambledText",
    description: "Temporarily scrambles characters before resolving the original text.",
    keywords: ["scrambled", "text", "typography"],
  },
  reveal: {
    shortName: "Reveal",
    description:
      "Reveals arbitrary content with configurable direction, delay, and viewport trigger.",
    keywords: ["reveal", "decoration", "overlay-fx"],
  },
  "scroll-float": {
    shortName: "ScrollFloat",
    description: "Floats split text into place in response to scroll progress.",
    keywords: ["scroll", "float", "typography", "text"],
  },
  "scroll-velocity": {
    shortName: "ScrollVelocity",
    description: "Moves repeated text horizontally according to scroll speed and direction.",
    keywords: ["scroll", "velocity", "typography", "text"],
  },
  shuffle: {
    shortName: "Shuffle",
    description: "Scrambles characters and then locks the original text into place in sequence.",
    keywords: ["shuffle", "typography", "text"],
  },
  "text-cursor": {
    shortName: "TextCursor",
    description: "Drops a fading trail of text glyphs along pointer movement inside a container.",
    keywords: ["text", "cursor", "typography"],
  },
  "text-pressure": {
    shortName: "TextPressure",
    description: "Varies glyph weight, width, slant, and opacity according to pointer proximity.",
    keywords: ["text", "pressure", "typography"],
  },
  "variable-proximity": {
    shortName: "VariableProximity",
    description: "Adjusts variable-font axes as the pointer approaches each character.",
    keywords: ["variable", "proximity", "typography", "text"],
  },
  antigravity: {
    shortName: "Antigravity",
    description:
      "Pulls drifting particles into pointer-centered orbits before easing them back into place.",
    keywords: ["antigravity", "decoration", "overlay-fx"],
  },
  "blob-cursor": {
    shortName: "BlobCursor",
    description: "Trails a soft animated blob behind pointer movement.",
    keywords: ["blob", "cursor", "decoration", "overlay-fx"],
  },
  "click-spark": {
    shortName: "ClickSpark",
    description: "Emits short radial spark lines from pointer clicks.",
    keywords: ["click", "spark", "decoration", "overlay-fx"],
  },
  crosshair: {
    shortName: "Crosshair",
    description: "Tracks the pointer with configurable horizontal and vertical guide lines.",
    keywords: ["crosshair", "decoration", "overlay-fx"],
  },
  "electric-border": {
    shortName: "ElectricBorder",
    description: "Animates noisy electric light around an element boundary.",
    keywords: ["electric", "border", "decoration", "overlay-fx"],
  },
  "ghost-cursor": {
    shortName: "GhostCursor",
    description: "Shows delayed translucent cursor echoes that follow pointer movement.",
    keywords: ["ghost", "cursor", "decoration", "overlay-fx"],
  },
  "gradual-blur": {
    shortName: "GradualBlur",
    description: "Builds a layered directional blur that increases gradually across content.",
    keywords: ["gradual", "blur", "decoration", "overlay-fx"],
  },
  "image-trail": {
    shortName: "ImageTrail",
    description: "Spawns a fading sequence of images along fast pointer movement.",
    keywords: ["image", "trail", "decoration", "overlay-fx"],
  },
  "laser-flow": {
    shortName: "LaserFlow",
    description:
      "Pours volumetric laser beams through procedural fog with flow detail and pointer steering.",
    keywords: ["laser", "flow", "decoration", "overlay-fx"],
  },
  "magic-rings": {
    shortName: "MagicRings",
    description: "Draws layered reactive rings that follow and frame the pointer.",
    keywords: ["magic", "rings", "decoration", "overlay-fx"],
  },
  magnet: {
    shortName: "Magnet",
    description: "Pulls child content toward the pointer within a configurable attraction radius.",
    keywords: ["magnet", "decoration", "overlay-fx"],
  },
  "magnet-lines": {
    shortName: "MagnetLines",
    description: "Rotates a field of line segments toward the pointer.",
    keywords: ["magnet", "lines", "decoration", "overlay-fx"],
  },
  "meta-balls": {
    shortName: "MetaBalls",
    description: "Blends moving metaballs into a fluid interactive shader surface.",
    keywords: ["meta", "balls", "decoration", "overlay-fx"],
  },
  "metallic-paint": {
    shortName: "MetallicPaint",
    description:
      "Renders liquid metallic paint with noise distortion, color dispersion, and striped reflections.",
    keywords: ["metallic", "paint", "decoration", "overlay-fx"],
  },
  "orbit-images": {
    shortName: "OrbitImages",
    description:
      "Moves child items along preset or custom CSS offset paths with spacing and tilt controls.",
    keywords: ["orbit", "images", "decoration", "overlay-fx"],
  },
  tilt: {
    shortName: "Tilt",
    description:
      "Wraps arbitrary content in pointer, gyroscope, or manually driven 3D tilt with optional geometric glare.",
    keywords: ["tilt", "parallax", "glare", "gyroscope", "decoration", "overlay", "animated"],
  },
  "pixel-trail": {
    shortName: "PixelTrail",
    description: "Leaves a fading pixel-grid trail behind pointer movement.",
    keywords: ["pixel", "trail", "decoration", "overlay-fx"],
  },
  "pixel-transition": {
    shortName: "PixelTransition",
    description: "Transitions between two content states through a randomized pixel curtain.",
    keywords: ["pixel", "transition", "decoration", "overlay-fx"],
  },
  ribbons: {
    shortName: "Ribbons",
    description: "Renders flowing pointer-responsive ribbon trails in WebGL.",
    keywords: ["ribbons", "decoration", "overlay-fx"],
  },
  "shape-blur": {
    shortName: "ShapeBlur",
    description: "Moves a softly blurred geometric highlight with damped pointer interaction.",
    keywords: ["shape", "blur", "decoration", "overlay-fx"],
  },
  "splash-cursor": {
    shortName: "SplashCursor",
    description: "Emits colorful splashes and fading trails from pointer movement and clicks.",
    keywords: ["splash", "cursor", "decoration", "overlay-fx"],
  },
  "star-border": {
    shortName: "StarBorder",
    description: "Animates star-like highlights around a content border.",
    keywords: ["star", "border", "decoration", "overlay-fx"],
  },
  "sticker-peel": {
    shortName: "StickerPeel",
    description:
      "Lets users drag or hover a sticker corner to reveal a peel, shadow, and pointer-following highlight.",
    keywords: ["sticker", "peel", "decoration", "overlay-fx"],
  },
  "target-cursor": {
    shortName: "TargetCursor",
    description: "Snaps an animated targeting reticle to marked interactive elements.",
    keywords: ["target", "cursor", "decoration", "overlay-fx"],
  },
  cubes: {
    shortName: "Cubes",
    description: "Renders an interactive field of perspective cubes with animated depth.",
    keywords: ["cubes", "decoration", "overlay-fx"],
  },
  "logo-loop": {
    shortName: "LogoLoop",
    description: "Scrolls a seamless loop of logos with configurable direction and hover pause.",
    keywords: ["logo", "loop", "data-display", "collection"],
  },
  "bubble-menu": {
    shortName: "BubbleMenu",
    description:
      "Opens a full-screen arrangement of staggered pill-shaped navigation links from a bubble header.",
    keywords: ["bubble", "menu", "navigation", "global"],
  },
  "card-nav": {
    shortName: "CardNav",
    description:
      "Expands a pill-shaped header to reveal staggered navigation cards from a hamburger control.",
    keywords: ["card", "nav", "navigation", "global"],
  },
  "flowing-menu": {
    shortName: "FlowingMenu",
    description: "Pairs navigation rows with looping text or image marquees on pointer entry.",
    keywords: ["flowing", "menu", "navigation", "global"],
  },
  "gooey-nav": {
    shortName: "GooeyNav",
    description: "Moves a liquid-like selection indicator between navigation items.",
    keywords: ["gooey", "nav", "navigation", "global"],
  },
  "pill-nav": {
    shortName: "PillNav",
    description:
      "Renders pill-shaped navigation with hover fill, inverted labels, and an active dot.",
    keywords: ["pill", "nav", "navigation", "global"],
  },
  "staggered-menu": {
    shortName: "StaggeredMenu",
    description:
      "Opens a token-themed layered side panel with staggered links, numbering, social actions, and reduced-motion behavior.",
    keywords: ["staggered", "menu", "layered", "animated", "navigation", "global"],
  },
  "bounce-cards": {
    shortName: "BounceCards",
    description: "Fans image cards into place with springy hover and entrance motion.",
    keywords: ["bounce", "cards", "data-display", "collection"],
  },
  "card-swap": {
    shortName: "CardSwap",
    description: "Cycles stacked cards through animated front-to-back swaps.",
    keywords: ["card", "swap", "data-display", "collection"],
  },
  "chroma-grid": {
    shortName: "ChromaGrid",
    description:
      "Displays a dimmed card grid that reveals full color inside a pointer-following spotlight.",
    keywords: ["chroma", "grid", "data-display", "collection"],
  },
  "circular-gallery": {
    shortName: "CircularGallery",
    description: "Browses image cards around a draggable circular track.",
    keywords: ["circular", "gallery", "data-display", "collection"],
  },
  "dome-gallery": {
    shortName: "DomeGallery",
    description:
      "Arranges images across a draggable CSS 3D dome with inertial rotation, click-to-zoom viewing, and reduced-motion behavior.",
    keywords: ["dome", "gallery", "3d", "drag", "inertia", "zoom", "data-display", "collection"],
  },
  "flying-posters": {
    shortName: "FlyingPosters",
    description: "Moves poster images through a perspective field controlled by dragging.",
    keywords: ["flying", "posters", "data-display", "collection"],
  },
  "infinite-menu": {
    shortName: "InfiniteMenu",
    description: "Navigates an endless spherical menu of image-linked items.",
    keywords: ["infinite", "menu", "data-display", "collection"],
  },
  "magic-bento": {
    shortName: "MagicBento",
    description:
      "Builds a bento card grid with a pointer spotlight, glowing borders, and optional tilt.",
    keywords: ["magic", "bento", "data-display", "collection"],
  },
  "scroll-stack": {
    shortName: "ScrollStack",
    description: "Stacks content cards progressively as the page scrolls.",
    keywords: ["scroll", "stack", "data-display", "collection"],
  },
  "profile-card": {
    shortName: "ProfileCard",
    description:
      "Presents a holographic identity card with pointer tilt, glare, and an initials fallback.",
    keywords: ["profile", "card", "data-display", "collection"],
  },
  "tilted-card": {
    shortName: "TiltedCard",
    description: "Tilts an image card toward the pointer with optional caption and scale.",
    keywords: ["tilted", "card", "data-display", "collection"],
  },
  "pixel-card": {
    shortName: "PixelCard",
    description: "Reveals card content through animated pixel particles.",
    keywords: ["pixel", "card", "data-display", "collection"],
  },
  "decay-card": {
    shortName: "DecayCard",
    description: "Distorts and dissolves an image card according to pointer velocity.",
    keywords: ["decay", "card", "data-display", "collection"],
  },
  "reflective-card": {
    shortName: "ReflectiveCard",
    description: "Displays slotted content on a metallic card with animated diagonal reflection.",
    keywords: ["reflective", "card", "data-display", "collection"],
  },
  folder: {
    shortName: "Folder",
    description: "Opens a layered 3D folder and fans out its paper contents.",
    keywords: ["folder", "data-display", "collection"],
  },
  "border-glow": {
    shortName: "BorderGlow",
    description: "Lights a card border and outer glow according to pointer proximity.",
    keywords: ["border", "glow", "decoration", "overlay-fx"],
  },
  "glass-icons": {
    shortName: "GlassIcons",
    description: "Presents icon actions on layered glass tiles with 3D hover movement.",
    keywords: ["glass", "icons", "decoration", "overlay-fx"],
  },
  "glass-surface": {
    shortName: "GlassSurface",
    description:
      "Creates a refractive glass surface with chromatic edge dispersion and fallback blur.",
    keywords: ["glass", "surface", "decoration", "overlay-fx"],
  },
  lanyard: {
    shortName: "Lanyard",
    description: "Simulates a draggable hanging badge with a bending cord and spring return.",
    keywords: ["lanyard", "decoration", "overlay-fx"],
  },
  "model-viewer": {
    shortName: "ModelViewer",
    description:
      "Displays a CSS 3D model stage with drag rotation, inertia, parallax, and auto-rotate.",
    keywords: ["model", "viewer", "decoration", "overlay-fx"],
  },
  "fluid-glass": {
    shortName: "FluidGlass",
    description: "Moves a refractive circular glass lens across a procedural fluid background.",
    keywords: ["fluid", "glass", "decoration", "overlay-fx"],
  },
  "elastic-slider": {
    shortName: "ElasticSlider",
    description: "Adds elastic track deformation and spring feedback to a numeric slider.",
    keywords: ["elastic", "slider", "forms", "basic"],
  },
  balatro: {
    shortName: "Balatro",
    description: "Renders a pixelated swirling multicolor oil-paint shader background.",
    keywords: ["balatro", "decoration", "backdrop"],
  },
  ballpit: {
    shortName: "Ballpit",
    description:
      "Simulates gravity, collisions, wall bounce, and pointer repulsion for colorful balls.",
    keywords: ["ballpit", "decoration", "backdrop"],
  },
  beams: {
    shortName: "Beams",
    description: "Renders flowing volumetric light columns with noise, shading, and film grain.",
    keywords: ["beams", "decoration", "backdrop"],
  },
  "color-bends": {
    shortName: "ColorBends",
    description: "Generates pointer-reactive organic color bands from a folded noise field.",
    keywords: ["color", "bends", "decoration", "backdrop"],
  },
  "dark-veil": {
    shortName: "DarkVeil",
    description:
      "Creates a dark flowing neural-field backdrop with scanlines, grain, and distortion.",
    keywords: ["dark", "veil", "decoration", "backdrop"],
  },
  dither: {
    shortName: "Dither",
    description: "Applies ordered dithering and palette quantization to animated noise waves.",
    keywords: ["dither", "decoration", "backdrop"],
  },
  "dot-field": {
    shortName: "DotField",
    description: "Pushes and illuminates a canvas dot field around pointer movement.",
    keywords: ["dot", "field", "decoration", "backdrop"],
  },
  "evil-eye": {
    shortName: "EvilEye",
    description: "Renders a fiery procedural eye whose pupil follows the pointer.",
    keywords: ["evil", "eye", "decoration", "backdrop"],
  },
  "faulty-terminal": {
    shortName: "FaultyTerminal",
    description:
      "Creates a distorted CRT character-rain background with tearing, scanlines, and ripple interaction.",
    keywords: ["faulty", "terminal", "decoration", "backdrop"],
  },
  ferrofluid: {
    shortName: "Ferrofluid",
    description:
      "Simulates pointer-responsive metallic ferrofluid ridges with flowing rim highlights.",
    keywords: ["ferrofluid", "decoration", "backdrop"],
  },
  "floating-lines": {
    shortName: "FloatingLines",
    description:
      "Animates layered sinusoidal line bundles with color interpolation and pointer bending.",
    keywords: ["floating", "lines", "decoration", "backdrop"],
  },
  galaxy: {
    shortName: "Galaxy",
    description:
      "Builds a multilayer parallax star field with twinkle, rotation, and pointer repulsion.",
    keywords: ["galaxy", "decoration", "backdrop"],
  },
  "gradient-blinds": {
    shortName: "GradientBlinds",
    description:
      "Combines multicolor gradients, vertical blind shading, grain, and a pointer spotlight.",
    keywords: ["gradient", "blinds", "decoration", "backdrop"],
  },
  grainient: {
    shortName: "Grainient",
    description: "Blends three warped color fields with animated film grain and contrast controls.",
    keywords: ["grainient", "decoration", "backdrop"],
  },
  "grid-distortion": {
    shortName: "GridDistortion",
    description:
      "Distorts an image grid through a pointer-driven displacement field with elastic relaxation.",
    keywords: ["grid", "distortion", "decoration", "backdrop"],
  },
  "grid-motion": {
    shortName: "GridMotion",
    description:
      "Moves alternating rows of a tilted grid in opposite pointer-responsive directions.",
    keywords: ["grid", "motion", "decoration", "backdrop"],
  },
  "grid-scan": {
    shortName: "GridScan",
    description: "Projects an infinite perspective grid with a traveling luminous scan pulse.",
    keywords: ["grid", "scan", "decoration", "backdrop"],
  },
  hyperspeed: {
    shortName: "Hyperspeed",
    description: "Creates a warp-speed tunnel of luminous streaks rushing from a vanishing point.",
    keywords: ["hyperspeed", "decoration", "backdrop"],
  },
  "letter-glitch": {
    shortName: "LetterGlitch",
    description:
      "Animates a terminal-style character matrix with randomized glyph and color glitches.",
    keywords: ["letter", "glitch", "decoration", "backdrop"],
  },
  lightfall: {
    shortName: "Lightfall",
    description: "Cycles colored light shafts through a falling tunnel with glow and pointer pull.",
    keywords: ["lightfall", "decoration", "backdrop"],
  },
  lightning: {
    shortName: "Lightning",
    description: "Generates flickering noise-driven electric arcs with inverse-distance glow.",
    keywords: ["lightning", "decoration", "backdrop"],
  },
  "light-pillar": {
    shortName: "LightPillar",
    description: "Raymarches a vertical volumetric light column with noise and two-color shading.",
    keywords: ["light", "pillar", "decoration", "backdrop"],
  },
  "light-rays": {
    shortName: "LightRays",
    description:
      "Projects pulsing volumetric rays from a configurable origin with pointer steering.",
    keywords: ["light", "rays", "decoration", "backdrop"],
  },
  "line-waves": {
    shortName: "LineWaves",
    description: "Renders interactive multicolor wave lines from layered sine and noise fields.",
    keywords: ["line", "waves", "decoration", "backdrop"],
  },
  "liquid-ether": {
    shortName: "LiquidEther",
    description: "Produces a pointer-stirred liquid color field with metaball-like motion.",
    keywords: ["liquid", "ether", "decoration", "backdrop"],
  },
  "pixel-blast": {
    shortName: "PixelBlast",
    description: "Quantizes animated noise into configurable pixel shapes with ordered dithering.",
    keywords: ["pixel", "blast", "decoration", "backdrop"],
  },
  "pixel-snow": {
    shortName: "PixelSnow",
    description:
      "Raymarches a depth-faded pixel snow field with square, dot, or snowflake particles.",
    keywords: ["pixel", "snow", "decoration", "backdrop"],
  },
  plasma: {
    shortName: "Plasma",
    description:
      "Raymarches a flowing plasma field with pointer disturbance and direction controls.",
    keywords: ["plasma", "decoration", "backdrop"],
  },
  "plasma-wave": {
    shortName: "PlasmaWave",
    description: "Animates two intertwined raymarched plasma ribbons with blended theme colors.",
    keywords: ["plasma", "wave", "decoration", "backdrop"],
  },
  prism: {
    shortName: "Prism",
    description: "Raymarches a refractive octahedral prism that casts volumetric rainbow light.",
    keywords: ["prism", "decoration", "backdrop"],
  },
  "prismatic-burst": {
    shortName: "PrismaticBurst",
    description: "Emits configurable curved spectral rays from an interactive central burst.",
    keywords: ["prismatic", "burst", "decoration", "backdrop"],
  },
  radar: {
    shortName: "Radar",
    description:
      "Combines rings, spokes, a rotating sweep, and pointer parallax into a radar display.",
    keywords: ["radar", "decoration", "backdrop"],
  },
  "ripple-grid": {
    shortName: "RippleGrid",
    description: "Displaces a glowing grid with concentric waves and local pointer ripples.",
    keywords: ["ripple", "grid", "decoration", "backdrop"],
  },
  "shape-grid": {
    shortName: "ShapeGrid",
    description:
      "Scrolls configurable geometric shapes endlessly with hover fills and fading trails.",
    keywords: ["shape", "grid", "decoration", "backdrop"],
  },
  "side-rays": {
    shortName: "SideRays",
    description: "Fans two animated light beams from a screen corner with adjustable blending.",
    keywords: ["side", "rays", "decoration", "backdrop"],
  },
  "soft-aurora": {
    shortName: "SoftAurora",
    description:
      "Layers two noise-driven gradients into a soft pointer-responsive aurora backdrop.",
    keywords: ["soft", "aurora", "decoration", "backdrop"],
  },
};
