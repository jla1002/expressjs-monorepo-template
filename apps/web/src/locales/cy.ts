
// Use the definition of the English translations to ensure the Welsh has the same structure
type Translations = typeof import("./en.js").content;

export const content: Translations = {
  "welcome": "Croeso i Wasanaeth Monorepo Express",
  "serviceName": "Gwasanaeth Monorepo Express",
  "phase": "beta",
  "govUk": "GOV.UK",
  "back": "Yn ôl",
  "navigation": {
    "home": "Hafan",
    "about": "Amdanom",
    "contact": "Cysylltu â ni"
  },
  "footer": {
    "cookies": "Cwcis",
    "privacyPolicy": "Polisi preifatrwydd",
    "accessibility": "Datganiad hygyrchedd",
    "termsAndConditions": "Telerau ac amodau",
    "contactUs": "Cysylltu â ni"
  },
  "language": {
    "switch": "English",
    "current": "Cymraeg",
    "ariaLabel": "Newid iaith i Saesneg"
  },
  "feedback": {
    "part1": "Mae hwn yn wasanaeth newydd – ",
    "part2": "rhowch adborth",
    "part3": " i'n helpu i'w wella.",
    "ariaLabel": "Rhoi adborth am y dudalen hon",
    "link": "/feedback?page="
  }
}
