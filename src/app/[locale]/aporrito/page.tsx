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
  const title = locale === "el" ? "Πολιτική απορρήτου" : "Privacy policy";
  const description =
    locale === "el"
      ? "Πώς διαχειριζόμαστε δεδομένα στο ClickClickDrive Κύπρος."
      : "How we handle data at ClickClickDrive Cyprus.";
  return {
    title,
    description,
    alternates: buildAlternates({ locale: locale as Locale, pathEl: "/aporrito", pathEn: "/en/privacy" }),
    openGraph: {
      title,
      description,
      url: siteUrl(locale === "el" ? "/aporrito" : "/en/privacy"),
      type: "article",
      locale: locale === "el" ? "el_CY" : "en_CY",
    },
  };
}

export default async function PrivacyPage({
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
          {locale === "el" ? "Πολιτική απορρήτου" : "Privacy policy"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {locale === "el" ? "Ενημερώθηκε" : "Last updated"}: 2026-06-08
        </p>
      </header>
      <div className="space-y-5 text-base leading-relaxed text-text-secondary">
        {locale === "el" ? <PrivacyEl /> : <PrivacyEn />}
      </div>
    </article>
  );
}

function PrivacyEl() {
  return (
    <>
      <Section title="Ποιοι είμαστε">
        <p>
          Το ClickClickDrive Κύπρος είναι μια πλατφόρμα που σας βοηθά να βρείτε
          σχολές οδηγών στην Κυπριακή Δημοκρατία. Λειτουργεί από την ίδια
          εταιρεία που τρέχει το{" "}
          <a
            className="text-brand hover:underline"
            href="https://www.clickclickdrive.de"
          >
            clickclickdrive.de
          </a>{" "}
          στη Γερμανία.
        </p>
      </Section>
      <Section title="Τι δεδομένα συλλέγουμε">
        <p>
          Δεν ζητάμε λογαριασμό. Δεν συλλέγουμε όνομα, email ή τηλέφωνο. Όταν
          επισκέπτεστε τον ιστότοπο, ο διακομιστής μας καταγράφει την IP σας,
          τον τύπο φυλλομετρητή και τη σελίδα που ζητήσατε. Αυτά κρατιούνται
          για 30 ημέρες για λόγους ασφάλειας και διαγράφονται μετά.
        </p>
      </Section>
      <Section title="Cookies">
        <p>
          Δεν χρησιμοποιούμε cookies παρακολούθησης. Δεν τρέχουμε διαφημίσεις
          τρίτων. Δεν έχουμε ανάλυση επισκεψιμότητας που να σας ταυτοποιεί.
        </p>
      </Section>
      <Section title="Δεδομένα από το Google Places">
        <p>
          Οι πληροφορίες για κάθε σχολή (όνομα, διεύθυνση, ωράριο, αξιολογήσεις,
          φωτογραφίες) προέρχονται από το Google Places API. Αυτά δεδομένα τα
          εμφανίζουμε όπως μας τα δίνει η Google. Αν είστε ιδιοκτήτης σχολής
          και θέλετε διόρθωση, στείλτε μας email στο{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
        </p>
      </Section>
      <Section title="Τα δικαιώματά σας (GDPR)">
        <p>
          Ως κάτοικος της ΕΕ, έχετε δικαίωμα πρόσβασης, διόρθωσης και διαγραφής
          των προσωπικών σας δεδομένων. Επειδή δεν συλλέγουμε προσωπικά
          στοιχεία, αυτό συνήθως δεν εφαρμόζεται. Αν πιστεύετε κάτι λείπει,
          γράψτε μας στο email πιο πάνω.
        </p>
      </Section>
      <Section title="Υπεύθυνος επεξεργασίας">
        <p>
          ClickClickDrive · Στοιχεία εταιρείας θα ενημερωθούν με την εγγραφή
          του υποκαταστήματος Κύπρου. Επικοινωνία:{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
        </p>
      </Section>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <Section title="Who we are">
        <p>
          ClickClickDrive Cyprus is a platform that helps you find driving
          schools in the Republic of Cyprus. It is run by the same company
          behind{" "}
          <a
            className="text-brand hover:underline"
            href="https://www.clickclickdrive.de"
          >
            clickclickdrive.de
          </a>{" "}
          in Germany.
        </p>
      </Section>
      <Section title="What data we collect">
        <p>
          We do not ask for an account. We do not collect your name, email, or
          phone. When you visit the site, our server logs your IP address, your
          browser type, and which page you requested. We keep those logs for
          30 days for security reasons, then delete them.
        </p>
      </Section>
      <Section title="Cookies">
        <p>
          We do not use tracking cookies. We do not run third-party ads. We do
          not run analytics that can identify you.
        </p>
      </Section>
      <Section title="Google Places data">
        <p>
          The information about each school (name, address, hours, ratings,
          photos) comes from the Google Places API. We show this data the way
          Google gives it to us. If you own a school and want a correction,
          email us at{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
        </p>
      </Section>
      <Section title="Your rights (GDPR)">
        <p>
          As an EU resident, you have the right to access, correct, and erase
          your personal data. Since we do not collect personal data, this
          rarely applies. If you think we are holding something we should not
          be, write to the email above.
        </p>
      </Section>
      <Section title="Data controller">
        <p>
          ClickClickDrive · Company details will be updated when the Cyprus
          branch is registered. Contact:{" "}
          <a
            className="text-brand hover:underline"
            href="mailto:info@clickclickdrive-cyprus.com"
          >
            info@clickclickdrive-cyprus.com
          </a>
          .
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
