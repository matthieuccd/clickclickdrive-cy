import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { buildAlternates, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "el" ? "Όροι χρήσης" : "Terms and conditions";
  const description =
    locale === "el"
      ? "Όροι χρήσης για το ClickClickDrive Κύπρος."
      : "Terms of use for ClickClickDrive Cyprus.";
  return {
    title,
    description,
    alternates: buildAlternates({ pathEl: "/oroi", pathEn: "/terms" }),
    openGraph: {
      title,
      description,
      url: siteUrl(locale === "el" ? "/oroi" : "/en/terms"),
      type: "article",
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {locale === "el" ? "Όροι χρήσης" : "Terms and conditions"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {locale === "el" ? "Ενημερώθηκε" : "Last updated"}: 2026-06-08
        </p>
      </header>
      <div className="space-y-5 text-base leading-relaxed text-text-secondary">
        {locale === "el" ? <TermsEl /> : <TermsEn />}
      </div>
    </article>
  );
}

function TermsEl() {
  return (
    <>
      <Section title="Τι είναι ο ιστότοπος">
        <p>
          Το ClickClickDrive Κύπρος είναι ένας κατάλογος σχολών οδηγών. Δεν
          είμαστε σχολή οδηγών. Δεν κάνουμε εμείς μαθήματα οδήγησης. Δεν
          εκδίδουμε δίπλωμα. Η αποστολή μας είναι να σας βοηθήσουμε να βρείτε
          μια σχολή που σας ταιριάζει.
        </p>
      </Section>
      <Section title="Ευθύνη για την ποιότητα">
        <p>
          Δεν είμαστε υπεύθυνοι για την ποιότητα των μαθημάτων, τη συμπεριφορά
          των εκπαιδευτών, ούτε για το αν θα περάσετε τις εξετάσεις. Αυτά είναι
          μεταξύ εσάς και της σχολής που θα επιλέξετε.
        </p>
      </Section>
      <Section title="Ακρίβεια των στοιχείων">
        <p>
          Οι πληροφορίες (όνομα, διεύθυνση, ωράριο, τηλέφωνο, αξιολογήσεις)
          έρχονται από δημόσιες πηγές, κυρίως το Google Places. Προσπαθούμε να
          τις κρατάμε ενημερωμένες, αλλά μπορεί να αλλάξουν χωρίς να το ξέρουμε.
          Πριν πάτε αυτοπροσώπως, καλό είναι να καλέσετε τη σχολή.
        </p>
      </Section>
      <Section title="Πνευματική ιδιοκτησία">
        <p>
          Το όνομα ClickClickDrive και το λογότυπο ανήκουν στην εταιρεία μας.
          Οι φωτογραφίες των σχολών προέρχονται από το Google Places και
          ανήκουν στους αρχικούς δημιουργούς τους. Αν είστε ιδιοκτήτης
          φωτογραφίας και θέλετε αφαίρεση, στείλτε μας email στο{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
        </p>
      </Section>
      <Section title="Δικαιοδοσία">
        <p>
          Εφαρμόζεται το κυπριακό δίκαιο. Τυχόν διαφορές θα επιλύονται στα
          δικαστήρια της Κυπριακής Δημοκρατίας.
        </p>
      </Section>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <Section title="What this site is">
        <p>
          ClickClickDrive Cyprus is a directory of driving schools. We are not
          a driving school. We do not teach driving lessons. We do not issue
          licences. Our job is to help you find a school that fits you.
        </p>
      </Section>
      <Section title="Liability for quality">
        <p>
          We are not responsible for the quality of lessons, the behaviour of
          instructors, or whether you pass your test. That is between you and
          the school you pick.
        </p>
      </Section>
      <Section title="Listing accuracy">
        <p>
          The listings (name, address, hours, phone, ratings) come from public
          sources, mostly Google Places. We try to keep them current, but they
          can change without us knowing. Before you turn up in person, please
          call the school first.
        </p>
      </Section>
      <Section title="Intellectual property">
        <p>
          The ClickClickDrive name and logo belong to our company. The school
          photos come from Google Places and belong to their original
          contributors. If you own a photo and want it removed, email us at{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
        </p>
      </Section>
      <Section title="Jurisdiction">
        <p>
          Cyprus law applies. Any disputes are resolved in the courts of the
          Republic of Cyprus.
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
