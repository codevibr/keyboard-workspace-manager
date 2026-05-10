export const CONFIG_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  debug: false,
  healPinnedOrderOnStartup: true,
  services: {
    slot1: {
      id: "slot1",
      slot: 1,
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
    slot2: {
      id: "slot2",
      slot: 2,
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
    slot3: {
      id: "slot3",
      slot: 3,
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
    slot4: {
      id: "slot4",
      slot: 4,
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
    slot5: {
      id: "slot5",
      slot: 5,
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
    slot6: {
      id: "slot6",
      slot: 6,
      name: "Shortcut 6",
      url: "https://example.com/shortcut-6",
      match: {
        hosts: ["example.com"],
        pathPrefixes: ["/shortcut-6"]
      },
      pinnedIndex: 5,
      pinned: true,
      windowPreference: "current"
    },
    slot7: {
      id: "slot7",
      slot: 7,
      name: "Shortcut 7",
      url: "https://example.com/shortcut-7",
      match: {
        hosts: ["example.com"],
        pathPrefixes: ["/shortcut-7"]
      },
      pinnedIndex: 6,
      pinned: true,
      windowPreference: "current"
    },
    slot8: {
      id: "slot8",
      slot: 8,
      name: "Shortcut 8",
      url: "https://example.com/shortcut-8",
      match: {
        hosts: ["example.com"],
        pathPrefixes: ["/shortcut-8"]
      },
      pinnedIndex: 7,
      pinned: true,
      windowPreference: "current"
    },
    slot9: {
      id: "slot9",
      slot: 9,
      name: "Shortcut 9",
      url: "https://example.com/shortcut-9",
      match: {
        hosts: ["example.com"],
        pathPrefixes: ["/shortcut-9"]
      },
      pinnedIndex: 8,
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
    "focus-slot-1": "slot1",
    "focus-slot-2": "slot2",
    "focus-slot-3": "slot3",
    "focus-slot-4": "slot4",
    "focus-slot-5": "slot5",
    "focus-slot-6": "slot6",
    "focus-slot-7": "slot7",
    "focus-slot-8": "slot8",
    "focus-slot-9": "slot9",
    "open-chatgpt-panel": "chatgptPanel"
  }
});

export const STORAGE_KEYS = Object.freeze({
  settings: "workspaceManagerSettings"
});
