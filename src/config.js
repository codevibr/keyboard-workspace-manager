export const CONFIG_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  debug: false,
  healPinnedOrderOnStartup: true,
  services: {
    slot1: {
      id: "slot1",
      slot: 1,
      enabled: true,
      name: "Gmail",
      url: "https://mail.google.com",
      match: {
        hosts: ["mail.google.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 0,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot2: {
      id: "slot2",
      slot: 2,
      enabled: true,
      name: "Google Calendar",
      url: "https://calendar.google.com",
      match: {
        hosts: ["calendar.google.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 1,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot3: {
      id: "slot3",
      slot: 3,
      enabled: true,
      name: "Google Messages",
      url: "https://messages.google.com/web/conversations",
      match: {
        hosts: ["messages.google.com"],
        pathPrefixes: ["/web"]
      },
      pinnedIndex: 2,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot4: {
      id: "slot4",
      slot: 4,
      enabled: true,
      name: "ChatGPT",
      url: "https://chatgpt.com",
      match: {
        hosts: ["chatgpt.com", "www.chatgpt.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 3,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: {
        width: 520,
        height: 860,
        left: 1940,
        top: 80
      }
    },
    slot5: {
      id: "slot5",
      slot: 5,
      enabled: false,
      name: "Notify",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 4,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot6: {
      id: "slot6",
      slot: 6,
      enabled: false,
      name: "Shortcut 6",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 5,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot7: {
      id: "slot7",
      slot: 7,
      enabled: false,
      name: "Shortcut 7",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 6,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot8: {
      id: "slot8",
      slot: 8,
      enabled: false,
      name: "Shortcut 8",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 7,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    slot9: {
      id: "slot9",
      slot: 9,
      enabled: false,
      name: "Shortcut 9",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 8,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    },
    chatgptPanel: {
      id: "chatgptPanel",
      enabled: true,
      name: "Floating Window",
      url: "https://chatgpt.com",
      match: {
        hosts: ["chatgpt.com", "www.chatgpt.com"],
        pathPrefixes: ["/"]
      },
      pinnedIndex: null,
      pinned: false,
      launchMode: "popupWindow",
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
    "open-floating-window": "chatgptPanel"
  }
});

export const STORAGE_KEYS = Object.freeze({
  settings: "workspaceManagerSettings"
});
