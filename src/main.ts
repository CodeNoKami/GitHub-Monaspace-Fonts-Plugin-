import { PLUGIN_ID } from "./configs/constants";
import { FONT_CONFIGS } from "./fonts";
import "./style.css";

class MonaspaceFonts {
  async init(baseUrl: string) {
    const fonts = acode.require("fonts");

    // ၁။ Register All Fonts
    for (const { name, url, weight, style } of FONT_CONFIGS) {
      const absoluteUrl = `${baseUrl}${url}`;
      fonts.add(
        name,
        `@font-face {\n  font-family: '${name}';\n  src: url('${absoluteUrl}') format('opentype');\n  font-weight: ${weight};\n  font-style: ${style};\n}`,
      );
    }

    // ၂။ Add to SideBar App
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

  // Sidebar ပွင့်လာမှ UI တည်ဆောက်ပေးမည့် လုပ်ဆောင်ချက်
  private initSidebarUI($container: HTMLElement) {
    $container.innerHTML = ""; // လက်ရှိ container ကို ရှင်းလင်းပေးခြင်း

    // CSS Class သုံးပြီး Container ကို design ပြောင်းခြင်း
    $container.className = "github-fonts-container";

    const $title = document.createElement("h3");
    $title.className = "github-fonts-title";
    $title.innerText = "Available Fonts";
    $container.appendChild($title);

    const $scroll_box = document.createElement("div");
    $scroll_box.classList.add("github-fonts-scroll");
    $scroll_box.classList.add("scroll");

    const $list = document.createElement("ul");
    $list.className = "github-fonts-list";

    FONT_CONFIGS.forEach((font) => {
      const $item = document.createElement("li");
      $item.className = "github-fonts-item";

      // Font Preview ပြသဖို့အတွက် fontFamily တစ်ခုပဲ JS ကနေ ထိန်းချုပ်ပါမယ်
      $item.style.fontFamily = `'${font.name}', monospace`;
      $item.innerText = font.name;

      $item.onclick = () => {
        window.acode.alert(
          font.name,
          `Weight: ${font.weight}<br>Style: ${font.style}`,
          () => {
            console.log("Hello World");
          },
        );
      };

      $list.appendChild($item);
    });

    $scroll_box.appendChild($list);

    $container.appendChild($scroll_box);
  }

  async destroy() {
    const fonts = acode.require("fonts");
    for (const { name } of FONT_CONFIGS) {
      fonts.remove(name);
    }

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
    await myPlugin.init(baseUrl);
  });

  acode.setPluginUnmount(PLUGIN_ID, () => {
    myPlugin.destroy();
  });
}
