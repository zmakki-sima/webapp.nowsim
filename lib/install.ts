export type InstallPlatformId = "ios" | "android";

export type InstallMethodId = "manual" | "qr";

export type InstallStep = {
  title: string;
  /** One line under the title. Keep it to a sentence. */
  note?: string;
  path?: string[];
  /**
   * Screenshots expected. Only used to size placeholders before they land.
   * Zero renders the step as text, with no placeholders.
   */
  shots: number;
};

export type InstallMethod = {
  id: InstallMethodId;
  label: string;
  steps: InstallStep[];
};

export type InstallGuide = {
  id: InstallPlatformId;
  label: string;
  devices: string;
  blurb: string;
  methods: InstallMethod[];
};

/** Phone mockups, portrait 780 x 1044. */
export const SHOT_WIDTH = 780;

export const SHOT_HEIGHT = 1044;

export const installPlatforms: InstallPlatformId[] = ["ios", "android"];

export const installSlugs: Record<InstallPlatformId, string> = {
  ios: "install-ios",
  android: "install-android",
};

export function installPlatformFromSlug(
  slug: string,
): InstallPlatformId | undefined {
  return installPlatforms.find((platform) => installSlugs[platform] === slug);
}

export function installHref(platform: InstallPlatformId): string {
  return `/help/${installSlugs[platform]}`;
}

/** /images/help/install-ios/manual, and so on. */
export function installShotDir(
  platform: InstallPlatformId,
  method: InstallMethodId,
): string {
  return `/images/help/${installSlugs[platform]}/${method}`;
}

/** Name a step expects on disk, whatever extension you save it with. */
export function installShotName(step: number, shot: number): string {
  return `step${step}-${shot}`;
}

/** Screenshots found on disk, per method, per step. */
export type InstallShots = Record<InstallMethodId, string[][]>;

const iosTail: InstallStep[] = [
  {
    title: "Select ‘Abroad’",
    note: "Use the eSIM while travelling outside your country.",
    shots: 1,
  },
  {
    title: "Select ‘Data Only’",
    note: "The plan carries internet only. Calls and SMS are not included.",
    shots: 1,
  },
  {
    title: "Turn On This Line",
    note: "After enabling, go back and reopen the screen to refresh the plan.",
    shots: 1,
  },
  {
    title: "Turn on Data Roaming",
    path: ["Settings", "Mobile Data", "nowsim"],
    note: "nowsim runs on partner networks, so the line stays offline without roaming.",
    shots: 1,
  },
];

const androidTail: InstallStep[] = [
  {
    title: "Download the plan",
    note: "Stay on Wi-Fi until the download finishes.",
    shots: 1,
  },
  {
    title: "Turn the nowsim SIM on",
    path: ["Settings", "Network & internet", "SIMs", "nowsim"],
    shots: 1,
  },
  {
    title: "Send mobile data over nowsim",
    note: "Pick nowsim as the SIM used for mobile data.",
    shots: 1,
  },
  {
    title: "Turn on Roaming",
    note: "nowsim runs on partner networks, so the SIM stays offline without roaming.",
    shots: 1,
  },
];

const guides: Record<InstallPlatformId, InstallGuide> = {
  ios: {
    id: "ios",
    label: "iOS 26",
    devices: "iPhone and iPad",
    blurb: "Follow these steps to install your eSIM.",
    methods: [
      {
        id: "manual",
        label: "Manual",
        steps: [
          {
            title:
              "Install the plan with the SM-DP+ address and activation code",
            path: ["Settings", "Mobile Data", "Add eSIM"],
            note: "Both are in your nowsim eSIM email. Leave the confirmation code empty.",
            shots: 5,
          },
          ...iosTail,
        ],
      },
      {
        id: "qr",
        label: "QR-code",
        steps: [
          {
            title: "Install the plan by scanning the QR code",
            path: ["Settings", "Mobile Data", "Add eSIM"],
            note: "Open the code from your nowsim eSIM email on another screen.",
            shots: 0,
          },
          ...iosTail,
        ],
      },
    ],
  },
  android: {
    id: "android",
    label: "Android",
    devices: "Pixel, Samsung, and most flagship Androids",
    blurb: "Follow these steps to install your eSIM.",
    methods: [
      {
        id: "manual",
        label: "Manual",
        steps: [
          {
            title: "Add the eSIM by entering the activation code",
            path: ["Settings", "Network & internet", "SIMs", "Add eSIM"],
            note: "Tap Need help?, then Enter it manually. The code is in your nowsim eSIM email.",
            shots: 4,
          },
          ...androidTail,
        ],
      },
      {
        id: "qr",
        label: "QR-code",
        steps: [
          {
            title: "Add the eSIM by scanning the QR code",
            path: ["Settings", "Network & internet", "SIMs", "Add eSIM"],
            note: "Open the code from your nowsim eSIM email on another screen.",
            shots: 0,
          },
          ...androidTail,
        ],
      },
    ],
  },
};

export function getInstallGuide(platform: InstallPlatformId): InstallGuide {
  return guides[platform];
}
