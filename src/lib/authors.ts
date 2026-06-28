import type { Locale } from "./types";

export interface Author {
  slug: string;
  name: string;
  title_en: string;
  title_el: string;
  linkedIn: string;
  photo: string;
  bio_en: string;
  bio_el: string;
}

export const AUTHORS: Record<string, Author> = {
  matthieu: {
    slug: "matthieu",
    name: "Matthieu Tissot",
    title_en: "Co-Founder, ClickClickDrive",
    title_el: "Συνιδρυτής, ClickClickDrive",
    linkedIn: "https://www.linkedin.com/in/matthieutissot/",
    photo: "/authors/matthieu.jpg",
    bio_en:
      "Matthieu is Co-Founder and CMO of ClickClickDrive, a marketplace that makes finding the right driving school effortless for learners across Europe. He built the platform from zero to over 2.5 million monthly organic visitors, reaching 30% B2C market share in Germany and growing partnerships with brands including Volkswagen, Allianz, Shell, and Lieferando. A French native who experienced firsthand how frustrating it is to find a driving school as an expat, he channelled that frustration into a product that removes the friction for every new driver. Matthieu has led marketing through two acquisitions and a fundraising journey from pre-seed to Series A, and built marketing operations using AI, Make.com, and n8n. Before ClickClickDrive, he was Managing Director for Southeast Asia at Leverate Media in Jakarta, and prior to that led international TV marketing at Delivery Hero across 25 countries. He holds an MBA and speaks French, English, and German fluently.",
    bio_el:
      "Ο Matthieu είναι Συνιδρυτής και CMO του ClickClickDrive, μιας πλατφόρμας που κάνει εύκολη και γρήγορη την εύρεση σχολής οδήγησης για μαθητές σε όλη την Ευρώπη. Ανέπτυξε την πλατφόρμα από το μηδέν σε πάνω από 2,5 εκατομμύρια μηνιαίους επισκέπτες, κατακτώντας 30% μερίδιο αγοράς B2C στη Γερμανία με συνεργασίες με εταιρείες όπως η Volkswagen, η Allianz, η Shell και η Lieferando. Γάλλος στην καταγωγή, βίωσε ο ίδιος πόσο δύσκολο είναι να βρεις σχολή οδήγησης ως εκπατριστής, και μετέτρεψε αυτή την εμπειρία σε ένα προϊόν που απλοποιεί τη διαδικασία για κάθε νέο οδηγό. Ο Matthieu οδήγησε το μάρκετινγκ μέσα από δύο εξαγορές και μια χρηματοδότηση από pre-seed έως Series A, ενώ ανέπτυξε αυτοματισμούς μάρκετινγκ με AI, Make.com και n8n. Πριν από το ClickClickDrive, ήταν Διευθύνων Σύμβουλος για τη Νοτιοανατολική Ασία στη Leverate Media στην Τζακάρτα, και πριν από αυτό ηγήθηκε του διεθνούς TV marketing στη Delivery Hero σε 25 χώρες. Κατέχει MBA και μιλά άπταιστα γαλλικά, αγγλικά και γερμανικά.",
  },
};

export function getAuthorBySlug(slug: string): Author | null {
  return AUTHORS[slug] ?? null;
}

export function authorPageHref(slug: string, locale: Locale): string {
  return locale === "el" ? `/arthrografoi/${slug}` : `/en/authors/${slug}`;
}
