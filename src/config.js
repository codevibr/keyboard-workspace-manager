export const CONFIG_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  debug: false,
  healPinnedOrderOnStartup: true,
  services: {
    gmail: {
      id: "gmail",
      name: "Gmail",
      url: "https://mail.google.com",
      match: {
        hosts: ["mail.google.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 0,
      pinned: true,
      windowPreference: "current"
    },
    calendar: {
      id: "calendar",
      name: "Google Calendar",
      url: "https://calendar.google.com",
      match: {
        hosts: ["calendar.google.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 1,
      pinned: true,
      windowPreference: "current"
    },
    messages: {
      id: "messages",
      name: "Google Messages",
      url: "https://messages.google.com/web/conversations",
      match: {
        hosts: ["messages.google.com"],
        pathPrefixes: ["/web"]
      },
      pinnedIndex: 2,
      pinned: true,
      windowPreference: "current"
    },
    chatgpt: {
      id: "chatgpt",
      name: "ChatGPT",
      url: "https://chatgpt.com",
      match: {
        hosts: ["chatgpt.com", "www.chatgpt.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 3,
      pinned: true,
      windowPreference: "current"
    },
    notify: {
      id: "notify",
      name: "Notify",
      url: "https://example.com/notify",
      match: {
        hosts: ["example.com"],
        pathPrefixes: ["/notify"]
      },
      pinnedIndex: 4,
      pinned: true,
      windowPreference: "current"
    },
    chatgptPanel: {
      id: "chatgptPanel",
      name: "ChatGPT Floating Panel",
      url: "https://chatgpt.com",
      match: {
        hosts: ["chatgpt.com", "www.chatgpt.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: null,
      pinned: false,
      windowPreference: "popup",
      popup: {
        width: 520,
        height: 860,
        left: 1940,
        top: 80
      }
    }
  },
  commandMap: {
    "focus-gmail": "gmail",
    "focus-calendar": "calendar",
    "focus-messages": "messages",
    "focus-chatgpt": "chatgpt",
    "focus-notify": "notify",
    "open-chatgpt-panel": "chatgptPanel"
  }
});

export const STORAGE_KEYS = Object.freeze({
  settings: "workspaceManagerSettings"
});
