export const versionHistory = [
  {
    version: "1.3",
    date: "2026-04-14",
    changes: [
      "Public release prep: replaced default Create-React-App branding (page title, manifest, meta description, favicon).",
      "Added error handling for failed data loads — no more infinite \"Loading…\" state if a CSV is missing or malformed.",
      "Replaced blocking alert() on export failure with a non-blocking toast notification.",
      "Bundled the FOV simulator background image locally instead of hot-linking from Unsplash.",
      "Fixed Fujifilm X-H2S row in camera data (broken anamorphic status string).",
      "License updated for public availability."
    ]
  },
  {
    version: "1.2",
    date: "2025-12-24",
    changes: [
      "Added Camera and Lens details to Export Report header.",
      "Fixed Export Report comparison sensor visibility (animation issue).",
      "Updated Report footer to show dynamic URL.",
      "Refactored Header layout for Safari compatibility.",
      "Added more cinema cameras (Burano, URSA 12K, etc.) to database."
    ]
  },
  {
    version: "1.1",
    date: "2025-12-23",
    changes: [
      "Initial release of Vision Tool.",
      "Implemented Sensor Comparison and FOV Simulation.",
      "Added CSV data loader."
    ]
  }
];

export const currentVersion = versionHistory[0].version;