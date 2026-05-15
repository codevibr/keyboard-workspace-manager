export const CONFIG_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  debug: false,
  healPinnedOrderOnStartup: true,
  includeBookmarksInCommandPalette: false,
  themeMode: "light",
  launcherEntries: [
    {
      id: "launcher-linear",
      enabled: false,
      name: "Linear",
      alias: "",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      launchMode: "pinnedTab",
      pinned: false,
      pinnedIndex: null,
      windowPreference: "current",
      popup: null,
      tags: ["work"]
    },
    {
      id: "launcher-notion",
      enabled: false,
      name: "Notion",
      alias: "",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      launchMode: "pinnedTab",
      pinned: false,
      pinnedIndex: null,
      windowPreference: "current",
      popup: null,
      tags: ["notes"]
    },
    {
      id: "launcher-github",
      enabled: false,
      name: "GitHub",
      alias: "github",
      url: "https://github.com",
      match: {
        hosts: ["github.com"],
        pathPrefixes: ["/"]
      },
      launchMode: "pinnedTab",
      pinned: false,
      pinnedIndex: null,
      windowPreference: "current",
      popup: null,
      tags: ["code"]
    }
  ],
  services: {
    slot1: {
      id: "slot1",
      slot: 1,
      enabled: true,
      name: "Gmail",
      alias: "gmail",
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
      alias: "calendar",
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
      alias: "messages",
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
      alias: "chatgpt",
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
      alias: "",
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
      alias: "",
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
      alias: "",
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
      alias: "",
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
      alias: "",
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
    slot10: {
      id: "slot10",
      slot: 10,
      enabled: false,
      name: "Shortcut 10",
      alias: "",
      url: "",
      match: {
        hosts: [],
        pathPrefixes: ["/"]
      },
      pinnedIndex: 9,
      pinned: true,
      launchMode: "pinnedTab",
      windowPreference: "current",
      popup: null
    }
  },
  commandMap: {
    "focus-slot-01": "slot1",
    "focus-slot-02": "slot2",
    "focus-slot-03": "slot3",
    "focus-slot-04": "slot4",
    "focus-slot-05": "slot5",
    "focus-slot-06": "slot6",
    "focus-slot-07": "slot7",
    "focus-slot-08": "slot8",
    "focus-slot-09": "slot9",
    "focus-slot-10": "slot10"
  }
});

export const STORAGE_KEYS = Object.freeze({
  settings: "workspaceManagerSettings"
});
