export const versionHistory = [
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