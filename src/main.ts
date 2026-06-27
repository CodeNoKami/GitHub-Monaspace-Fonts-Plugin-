import { PLUGIN_ID } from "./configs/constants";
import { FONT_CONFIGS } from "./fonts";
import "./style.css";

// Global variable ကြေညာခြင်း
declare var editorManager: any;

// SVG Icons Constants
const ICONS = {
  android: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge-icon"><path d="M12 2a10 10 0 0 1 10 10v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4A10 10 0 0 1 12 2z"/><path d="M6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M18 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M8 18v2"/><path d="M16 18v2"/></svg>`,
  editor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge-icon"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge-icon"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
};

class MonaspaceFonts {
  private settings: any;

  async init() {
    const fonts = acode.require("fonts");
    this.settings = acode.require("settings");

    this.injectAllFontsToHead();

    for (const { name, url, weight, style } of FONT_CONFIGS) {
      fonts.add(
        name,
        `@font-face {\n  font-family: '${name}';\n  src: url('${url}') format('opentype');\n  font-weight: ${weight};\n  font-style: ${style};\n  font-display: block;\n}`,
      );
    }

    if (this.settings) {
      const currentSettings = this.settings.value || {};

      // App စပွင့်ချင်းမှာ "15px" ကဲ့သို့သော String ကို အခြေခံပြီး Render လုပ်ခိုင်းခြင်း
      if (currentSettings.fontSize) {
        this.applyFontSizeCSS(currentSettings.fontSize);
      }

      if (currentSettings.appFont)
        this.applyInstantCSS("app", currentSettings.appFont);
      if (currentSettings.editorFont)
        this.applyInstantCSS("editor", currentSettings.editorFont);
      if (currentSettings.terminalSettings?.fontFamily) {
        this.applyInstantCSS(
          "terminal",
          currentSettings.terminalSettings.fontFamily,
        );
      }

      this.settings.on("update:fontSize", (value: any) => {
        this.applyFontSizeCSS(value);
      });

      this.settings.on("update:appFont", (value: any) => {
        const fontName =
          typeof value === "object" && value !== null
            ? value.name || value.fontFamily
            : value;
        this.applyInstantCSS("app", fontName);
      });

      this.settings.on("update:editorFont", (value: any) => {
        const fontName =
          typeof value === "object" && value !== null
            ? value.name || value.fontFamily
            : value;
        this.applyInstantCSS("editor", fontName);
      });

      this.settings.on("update:terminalSettings", (value: any) => {
        if (value?.fontFamily) {
          const fontName =
            typeof value.fontFamily === "object" && value.fontFamily !== null
              ? value.fontFamily.name || value.fontFamily.fontFamily
              : value.fontFamily;
          this.applyInstantCSS("terminal", fontName);
        }
      });
    }

    const sidebarApps = acode.require("sidebarApps");
    if (sidebarApps) {
      sidebarApps.add(
        "github",
        PLUGIN_ID,
        "GitHub Fonts",
        ($container: HTMLElement) => {
          this.initSidebarUI($container);
        },
      );
    }
  }

  private initSidebarUI($container: HTMLElement) {
    $container.innerHTML = "";
    $container.className = "github-fonts-container";

    // --- Font Size Slider Section ---
    const $sliderContainer = document.createElement("div");
    $sliderContainer.className = "font-size-slider-container";

    const $sliderHeader = document.createElement("div");
    $sliderHeader.className = "slider-header";

    const $sliderTitle = document.createElement("span");
    $sliderTitle.className = "slider-title";
    $sliderTitle.innerText = "Editor Font Size";

    const currentSettings = this.settings ? this.settings.value : {};

    // "15px" ထဲကနေ '15' ဆိုတဲ့ Number သီးသန့်ကို Slider မှာ ပြသနိုင်ဖို့ ခွဲထုတ်ယူခြင်း
    let currentSize = 14;
    if (currentSettings.fontSize) {
      const parsed = parseInt(currentSettings.fontSize, 10);
      if (!isNaN(parsed)) currentSize = parsed;
    }

    const $sliderValue = document.createElement("span");
    $sliderValue.className = "slider-value";
    $sliderValue.innerText = `${currentSize}px`;

    $sliderHeader.appendChild($sliderTitle);
    $sliderHeader.appendChild($sliderValue);

    const $rangeInput = document.createElement("input");
    $rangeInput.type = "range";
    $rangeInput.className = "font-size-range-input";
    $rangeInput.min = "12";
    $rangeInput.max = "24";
    $rangeInput.step = "1";
    $rangeInput.value = currentSize.toString();

    $rangeInput.oninput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      $sliderValue.innerText = `${val}px`;

      // Editor ထဲကို Real-time CSS သက်ရောက်စေခြင်း
      this.applyFontSizeCSS(`${val}px`);

      // [CRITICAL FIXED] settings.json ထဲကို "15px" ဆိုပြီး String သီးသန့်အဖြစ် ပြောင်းလဲသိမ်းဆည်းခြင်း
      if (this.settings) {
        this.settings.update({ fontSize: `${val}px` });
      }
    };

    $sliderContainer.appendChild($sliderHeader);
    $sliderContainer.appendChild($rangeInput);
    $container.appendChild($sliderContainer);

    // --- Divider Line ---
    const $divider = document.createElement("div");
    $divider.className = "sidebar-divider";
    $container.appendChild($divider);

    // --- Font List Title ---
    const $title = document.createElement("h3");
    $title.className = "github-fonts-title";
    $title.innerText = "Available Fonts";
    $container.appendChild($title);

    const $scroll_box = document.createElement("div");
    $scroll_box.classList.add("github-fonts-scroll", "scroll");

    const $list = document.createElement("ul");
    $list.className = "github-fonts-list";

    const getFontStringName = (fontVal: any) => {
      if (typeof fontVal === "object" && fontVal !== null)
        return fontVal.name || fontVal.fontFamily;
      return fontVal;
    };

    const currentAppFont = getFontStringName(currentSettings.appFont);
    const currentEditorFont = getFontStringName(currentSettings.editorFont);
    const currentTerminalFont = getFontStringName(
      currentSettings.terminalSettings?.fontFamily,
    );

    FONT_CONFIGS.forEach((font) => {
      const $item = document.createElement("li");
      $item.className = "github-fonts-item-card";

      const isActive =
        currentAppFont === font.name ||
        currentEditorFont === font.name ||
        currentTerminalFont === font.name;
      if (isActive) {
        $item.classList.add("item-active-state");
      }

      const $text = document.createElement("span");
      $text.className = "font-name-text-preview";
      $text.style.cssText = `
        font-size: 1rem; 
        color: var(--text-color, #e6edf3); 
        user-select: none;
        font-family: '${font.name}', monospace !important; 
        font-weight: ${font.weight} !important;
      `;

      $text.innerText = font.name;
      $item.appendChild($text);

      const $badgeContainer = document.createElement("div");
      $badgeContainer.className = "modern-badge-container";

      if (currentAppFont === font.name) {
        const $badge = document.createElement("span");
        $badge.className = "font-badge-icon-style app-badge";
        $badge.innerHTML = ICONS.android;
        $badgeContainer.appendChild($badge);
      }
      if (currentEditorFont === font.name) {
        const $badge = document.createElement("span");
        $badge.className = "font-badge-icon-style editor-badge";
        $badge.innerHTML = ICONS.editor;
        $badgeContainer.appendChild($badge);
      }
      if (currentTerminalFont === font.name) {
        const $badge = document.createElement("span");
        $badge.className = "font-badge-icon-style terminal-badge";
        $badge.innerHTML = ICONS.terminal;
        $badgeContainer.appendChild($badge);
      }
      $item.appendChild($badgeContainer);

      $item.onclick = async () => {
        const select = acode.require("select");
        if (select) {
          const items = [
            { value: "app", text: "Apply to App" },
            { value: "editor", text: "Apply to Editor" },
            { value: "terminal", text: "Apply to Terminal" },
            { value: "all", text: "Apply to All" },
          ];

          const options = { hideOnSelect: true, default: "all" };
          const value = await select(`Apply "${font.name}"`, items, options);

          if (value) {
            this.handleFontApplyFromSidebar(value, font.name, $container);
          }
        }
      };

      $list.appendChild($item);
    });

    $scroll_box.appendChild($list);
    $container.appendChild($scroll_box);
  }

  // "15px" ပုံစံ String ကော၊ Number ကော နှစ်မျိုးလုံး လက်ခံနိုင်အောင် ညှိနှိုင်းပေးထားသော Function
  private applyFontSizeCSS(size: any) {
    if (!size) return;

    // CSS Inline Style ပေးဖို့အတွက် "15px" ဟူသော format သေချာစေရန် ပြုလုပ်ခြင်း
    const stringSize =
      typeof size === "string" && size.endsWith("px") ? size : `${size}px`;

    // ၁။ Editor Main Container ထဲသို့ Size inline ထည့်ခြင်း
    if (typeof editorManager !== "undefined" && editorManager.container) {
      editorManager.container.style.setProperty(
        "font-size",
        stringSize,
        "important",
      );
    }

    // ၂။ Code Nodes အားလုံးဆီသို့ Force CSS Apply လုပ်ခြင်း
    const cmElements = document.querySelectorAll(
      ".cm-content, .cm-editor, .cm-scroller, .cm-line",
    );
    cmElements.forEach(($el: any) => {
      if ($el instanceof HTMLElement) {
        $el.style.setProperty("font-size", stringSize, "important");
      }
    });
  }

  private applyInstantCSS(type: string, fontName: string) {
    if (!fontName || typeof fontName !== "string") return;

    if (type === "app" || type === "all") {
      const overrideId = "acode-app-font-override";
      let $overrideStyle = document.getElementById(
        overrideId,
      ) as HTMLStyleElement;

      if (!$overrideStyle) {
        $overrideStyle = document.createElement("style");
        $overrideStyle.id = overrideId;
        document.head.appendChild($overrideStyle);
      }

      $overrideStyle.innerHTML = `
        :root, body, #root, html, * {
          --app-font: '${fontName}', sans-serif !important;
          font-family: '${fontName}', sans-serif !important;
        }
        .page, .main, .sidebar, .context-menu, .main-menu, .dialog, button, input, select, textarea, span, div, p, h1, h2, h3, h4, h5, h6, .tile {
          font-family: '${fontName}', sans-serif !important;
        }
        .font-name-text-preview {
          font-family: inherit !important;
        }
      `;
    }

    if (type === "editor" || type === "all") {
      if (typeof editorManager !== "undefined" && editorManager.container) {
        editorManager.container.style.setProperty(
          "font-family",
          `'${fontName}', monospace`,
          "important",
        );
      }
      const cmElements = document.querySelectorAll(
        ".cm-content, .cm-editor, .cm-scroller, .cm-gutter, .cm-line",
      );
      cmElements.forEach(($el: any) => {
        $el.style.setProperty(
          "font-family",
          `'${fontName}', monospace`,
          "important",
        );
      });
    }

    if (type === "terminal" || type === "all") {
      const terminalElements = document.querySelectorAll(
        ".xterm-container, .terminal, .xterm-rows",
      );
      terminalElements.forEach(($el: any) => {
        $el.style.setProperty(
          "font-family",
          `'${fontName}', monospace`,
          "important",
        );
      });
    }
  }

  private handleFontApplyFromSidebar(
    value: string,
    fontName: string,
    $container: HTMLElement,
  ) {
    if (!this.settings) return;

    if (value === "app" || value === "all") {
      this.settings.update({ appFont: fontName });
    }
    if (value === "editor" || value === "all") {
      this.settings.update({ editorFont: fontName });
    }
    if (value === "terminal" || value === "all") {
      const tSettings = this.settings.value.terminalSettings || {};
      this.settings.update({
        ...this.settings.value,
        terminalSettings: { ...tSettings, fontFamily: fontName },
      });
    }

    this.initSidebarUI($container);
  }

  private injectAllFontsToHead() {
    const styleId = "github-monaspace-fonts-style";
    let $style = document.getElementById(styleId) as HTMLStyleElement;

    if (!$style) {
      $style = document.createElement("style");
      $style.id = styleId;

      let cssContent = "";
      for (const { name, url, weight, style } of FONT_CONFIGS) {
        cssContent += `@font-face {
          font-family: '${name}';
          src: url('${url}') format('opentype');
          font-weight: ${weight};
          font-style: ${style};
          font-display: block;
        }\n`;
      }

      $style.innerHTML = cssContent;
      document.head.appendChild($style);
    }
  }

  async destroy() {
    const fonts = acode.require("fonts");
    for (const { name } of FONT_CONFIGS) {
      fonts.remove(name);
    }

    const $style = document.getElementById("github-monaspace-fonts-style");
    if ($style) $style.remove();

    const $overrideStyle = document.getElementById("acode-app-font-override");
    if ($overrideStyle) $overrideStyle.remove();

    const sidebarApps = acode.require("sidebarApps");
    if (sidebarApps) {
      sidebarApps.remove(PLUGIN_ID);
    }
  }
}

if (window.acode) {
  const myPlugin = new MonaspaceFonts();

  acode.setPluginInit(PLUGIN_ID, async (baseUrl: string) => {
    if (!baseUrl.endsWith("/")) {
      baseUrl += "/";
    }
    await myPlugin.init();
  });

  acode.setPluginUnmount(PLUGIN_ID, () => {
    myPlugin.destroy();
  });
}
