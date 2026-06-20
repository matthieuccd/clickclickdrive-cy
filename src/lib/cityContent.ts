import type { CyprusCity } from "./types";

/**
 * CITY_INTROS - Part 1, short intro (~150 words).
 * Targets "driving schools [city]" / "best driving school [city]" keywords.
 * Appears above the school grid.
 */
export const CITY_INTROS: Record<CyprusCity, { el: string; en: string }> = {
  Nicosia: {
    en: "The capital of Cyprus has around 23 registered driving schools. This page lists them all with ratings, opening hours, and contact details so you can compare before you call.\n\nThe Road Transport Department headquarters is in Nicosia. That means the city handles more driving tests than anywhere else on the island. During busy periods the wait for a practical test date can run several weeks. Most schools book your test slot as part of the sign-up.\n\nNicosia spreads across several districts, from Strovolos in the west to Aglandjia in the east. Pick a school near your home or workplace. It cuts travel time and makes it easier to keep a regular lesson schedule.",
    el: "Η πρωτεύουσα της Κύπρου έχει περίπου 23 καταχωρισμένες σχολές οδηγών. Αυτή η σελίδα τις παραθέτει όλες με αξιολογήσεις, ωράρια και στοιχεία επικοινωνίας για να συγκρίνετε πριν τηλεφωνήσετε.\n\nΤα κεντρικά γραφεία του Τμήματος Οδικών Μεταφορών βρίσκονται στη Λευκωσία. Αυτό σημαίνει ότι η πόλη εξυπηρετεί περισσότερες εξετάσεις από οπουδήποτε αλλού στο νησί. Σε πολυσύχναστες περιόδους η αναμονή για ημερομηνία πρακτικής μπορεί να φτάσει αρκετές εβδομάδες. Οι περισσότερες σχολές κλείνουν την ημερομηνία εξέτασης ως μέρος της εγγραφής.\n\nΗ Λευκωσία απλώνεται σε πολλές περιοχές, από τον Στρόβολο στα δυτικά μέχρι την Αγλαντζιά στα ανατολικά. Επιλέξτε σχολή κοντά στο σπίτι ή τη δουλειά σας. Εξοικονομεί χρόνο και κάνει ευκολότερη τη διατήρηση τακτικού προγράμματος.",
  },
  Limassol: {
    en: "Limassol is the second biggest city in Cyprus and home to the island's main commercial port. This page lists all driving schools in the city with ratings, hours, and contact details.\n\nThe Road Transport Department district office in Limassol handles tests for the whole Limassol district. It is the second busiest test centre on the island. In tourist season, waiting times for the practical test can stretch. Every school here will help you plan around the schedule.\n\nLimassol runs along the coast from the old port in the west to the university campus in the east. If you live in the eastern suburbs, pick a school on that side. If you are based near the old port or in the hills, look at schools in those areas. A short commute to lessons matters over a course of weeks.",
    el: "Η Λεμεσός είναι η δεύτερη μεγαλύτερη πόλη της Κύπρου και έδρα του κύριου εμπορικού λιμανιού του νησιού. Αυτή η σελίδα παραθέτει όλες τις σχολές οδηγών με αξιολογήσεις, ωράρια και στοιχεία επικοινωνίας.\n\nΤο επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών στη Λεμεσό εξυπηρετεί εξετάσεις για ολόκληρη την επαρχία. Είναι το δεύτερο πιο πολυσύχναστο κέντρο εξετάσεων στο νησί. Σε τουριστική περίοδο οι αναμονές για πρακτική εξέταση μπορεί να παραταθούν. Κάθε σχολή εδώ θα σας βοηθήσει να οργανωθείτε.\n\nΗ Λεμεσός εκτείνεται κατά μήκος της ακτής από το παλιό λιμάνι στα δυτικά μέχρι την πανεπιστημιούπολη στα ανατολικά. Αν μένετε στα ανατολικά προάστια, επιλέξτε σχολή εκεί. Αν είστε κοντά στο παλιό λιμάνι ή στα λόφια, κοιτάξτε σχολές σε εκείνες τις περιοχές. Η μικρή απόσταση από τα μαθήματα κάνει διαφορά σε εβδομάδες μαθημάτων.",
  },
  Larnaca: {
    en: "Larnaca is Cyprus's third city and home to the island's international airport. This page lists all driving schools in Larnaca with ratings, opening hours, and phone numbers.\n\nThe Road Transport Department district office in Larnaca is smaller than those in Nicosia and Limassol. That usually means shorter waiting times for test dates. Many people who live in the Larnaca area sit their test locally for exactly this reason.\n\nThe city stretches from the salt lake in the west to the Dhekelia road in the east. If you live in the airport zone or near the Phinikoudes seafront, there are schools that cover both. Call two or three before you commit. Ask about lesson slots that fit around shift work or irregular hours, which are common in Larnaca because of the airport.",
    el: "Η Λάρνακα είναι η τρίτη πόλη της Κύπρου και έδρα του διεθνούς αεροδρομίου του νησιού. Αυτή η σελίδα παραθέτει όλες τις σχολές οδηγών στη Λάρνακα με αξιολογήσεις, ωράρια και τηλέφωνα.\n\nΤο επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών στη Λάρνακα είναι μικρότερο από εκείνα στη Λευκωσία και τη Λεμεσό. Αυτό συνήθως σημαίνει μικρότερες αναμονές για ημερομηνίες εξετάσεων. Πολλοί κάτοικοι της Λάρνακας εξετάζονται τοπικά ακριβώς γι' αυτό.\n\nΗ πόλη εκτείνεται από την αλυκή στα δυτικά μέχρι τον δρόμο της Δεκέλειας στα ανατολικά. Αν μένετε στη ζώνη του αεροδρομίου ή κοντά στις Φοινικούδες, υπάρχουν σχολές που καλύπτουν και τα δύο. Καλέστε δύο ή τρεις πριν αποφασίσετε. Ρωτήστε για ωράρια που ταιριάζουν σε βάρδιες ή ευέλικτο πρόγραμμα, κοινό στη Λάρνακα λόγω αεροδρομίου.",
  },
  Paphos: {
    en: "Paphos is the westernmost district city in Cyprus, with its own airport, a UNESCO archaeological site, and a wide spread of hill villages behind it. This page lists all four driving schools in Paphos.\n\nThe Road Transport Department district office in Paphos is the smallest test centre in the free area by volume. Waiting times for practical tests are usually short compared to the bigger cities.\n\nThe city runs from Kato Paphos on the coast up to Pano Paphos on the hills. Every road between them is on a slope. Hill starts and hill stops are a big part of learning to drive here. All four schools practise this with you. If you live in one of the hill villages like Peyia or Tala, ask whether the school will come to your area for lessons.",
    el: "Η Πάφος είναι η πιο δυτική επαρχιακή πόλη της Κύπρου, με δικό της αεροδρόμιο, χώρο UNESCO και πολλά ορεινά χωριά πίσω της. Αυτή η σελίδα παραθέτει και τις τέσσερις σχολές οδηγών στην Πάφο.\n\nΤο επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών στην Πάφο είναι το μικρότερο κέντρο εξετάσεων στην ελεύθερη Κύπρο σε όγκο. Οι αναμονές για πρακτική εξέταση είναι συνήθως σύντομες σε σχέση με τις μεγαλύτερες πόλεις.\n\nΗ πόλη εκτείνεται από την Κάτω Πάφο στην ακτή έως την Πάνω Πάφο στους λόφους. Κάθε δρόμος μεταξύ τους έχει κλίση. Οι εκκινήσεις και σταματήματα σε ανηφόρα είναι μεγάλο μέρος της εκμάθησης οδήγησης εδώ. Και οι τέσσερις σχολές εξασκούν αυτό μαζί σας. Αν μένετε σε ορεινό χωριό όπως η Πέγεια ή η Τάλα, ρωτήστε αν η σχολή έρχεται στην περιοχή σας.",
  },
  Paralimni: {
    en: "Paralimni is the main town in the free part of the Famagusta district. It sits near Ayia Napa and Protaras in an area that fills up in summer. This page lists both driving schools in Paralimni and the surrounding area.\n\nThe Famagusta district office of the Road Transport Department is located in Paralimni. It moved here after 1974 because Famagusta city is on the occupied side. It is the smallest test centre in the free area. Test dates are usually available quickly, but the schedule is more limited than in the bigger cities.\n\nWith only two schools, comparison is straightforward. Call both before you decide. Ask about lesson availability during summer when the area is busy, and ask whether they cover the Protaras and Ayia Napa roads as part of your training.",
    el: "Το Παραλίμνι είναι η κύρια πόλη στην ελεύθερη επαρχία Αμμοχώστου. Βρίσκεται κοντά στην Αγία Νάπα και το Πρωταρά, σε μια περιοχή που γεμίζει το καλοκαίρι. Αυτή η σελίδα παραθέτει και τις δύο σχολές οδηγών στο Παραλίμνι και την ευρύτερη περιοχή.\n\nΤο επαρχιακό γραφείο Αμμοχώστου του Τμήματος Οδικών Μεταφορών βρίσκεται στο Παραλίμνι. Μεταφέρθηκε εδώ μετά το 1974 γιατί η πόλη της Αμμοχώστου βρίσκεται στην κατεχόμενη πλευρά. Είναι το μικρότερο κέντρο εξετάσεων στην ελεύθερη Κύπρο. Οι ημερομηνίες εξετάσεων είναι συνήθως διαθέσιμες γρήγορα, αλλά το πρόγραμμα είναι πιο περιορισμένο από τις μεγαλύτερες πόλεις.\n\nΜε μόνο δύο σχολές, η σύγκριση είναι απλή. Καλέστε και τις δύο πριν αποφασίσετε. Ρωτήστε για διαθεσιμότητα μαθημάτων το καλοκαίρι όταν η περιοχή είναι γεμάτη, και αν καλύπτουν τους δρόμους Πρωταρά και Αγίας Νάπας στην εκπαίδευση.",
  },
};

/**
 * CITY_DEEP - Part 3, deep local content (~600 words).
 * Covers the RTD office, local driving conditions, prices, and a 10-question FAQ.
 * Appears below the school grid.
 * FK grade 8, no em-dashes, journalist voice.
 */
export const CITY_DEEP: Record<CyprusCity, { el: string; en: string }> = {
  Nicosia: {
    en: `### Getting your driving licence in Nicosia

The Road Transport Department (RTD) headquarters is at 13 Omirou Avenue, 1082 Nicosia. This is where you register for the theory test and where practical tests depart from. The RTD is open Monday to Friday, typically from 7:30 in the morning until 14:30. Check their website for updated times before you go in person.

**What new drivers should know about Nicosia roads**

Nicosia has one road feature that catches many new drivers off guard: the buffer zone. Ledra Street in the city centre leads to a crossing point into the Turkish-administered north. The streets near the crossing are narrow and get congested at peak times. Schools avoid this area during lessons, but you should know where it is.

Roundabouts are the main challenge in Nicosia. The one at Makedonitissa, where Makarios III Avenue meets Tseriou Street, has multiple exits and heavy traffic. Your school will take you there before your test. The wide avenues in Strovolos and Engomi, such as Archangelou and Dimokratias, are where most practical tests happen. Long straights, lane changes, and busy junctions.

The A1 motorway starts south of the city and links Nicosia to Limassol. Most schools include one or two motorway lessons before the test. Highway driving in Cyprus is different from urban driving. The speeds are higher, and lane discipline matters more.

**Driving school prices in Nicosia**

Practical lessons in Nicosia typically cost between €25 and €38 per hour. Theory preparation sessions run €15 to €25. A full course package, which covers theory lessons, all practical hours, and test preparation, usually costs between €450 and €700. Prices vary by school and by the number of hours you need. Ask for a written breakdown before you sign anything.

The RTD theory test fee is around €40. The practical test fee is around €80. These are government fees paid directly to the RTD, not to the school.

### Frequently asked questions about driving in Nicosia

**How much does a driving licence cost in Nicosia?**
Plan for roughly €500 to €750 in total. That includes lessons, test fees, and the licence itself. The exact figure depends on how many hours you need. Some people pass with the minimum; others need more.

**Where is the practical driving test held in Nicosia?**
Tests depart from the Road Transport Department on Omirou Avenue. The examiner will direct you through a set route in the surrounding districts. You will not know the exact route in advance.

**How many lessons do I need before the Cyprus driving test?**
The RTD requires a minimum number of logged hours before you can sit the practical test. Your school will track these. Most students need between 20 and 35 hours of practical time before they are ready.

**What is the Cyprus theory test?**
The theory test is computer-based. It covers road signs, traffic rules, and hazard awareness. You sit it at a licensed testing centre. Your school will give you a preparation booklet. Most people need two to four weeks of study.

**Can foreigners get a driving licence in Nicosia?**
Yes. EU and EEA citizens follow the same process as Cypriot citizens. Non-EU nationals may need to present a residence permit. The RTD will tell you exactly what documents you need when you register.

**How long does the full process take?**
From starting lessons to passing the practical test, most people take three to five months. This includes theory preparation, the theory test, practical hours, and waiting for a test date.

**Can I use my EU driving licence in Cyprus?**
If you are a visitor, yes. If you become a resident, you need to exchange it within a set time. UK licences are no longer automatically exchangeable since Brexit. Ask the RTD directly about your specific situation.

**What documents do I need for the driving test in Cyprus?**
You will need a valid identity document, proof of address, and any forms your school has completed on your behalf. The RTD will give you a checklist when you register.

**Are there English-speaking driving schools in Nicosia?**
Yes. Many schools in Nicosia offer lessons in English, especially those used to teaching expats and international students. Ask when you call.

**What is the minimum age for a driving licence in Cyprus?**
You must be 18 years old to sit the driving test in Cyprus for a standard car licence (Category B).`,

    el: `### Πώς βγάζετε δίπλωμα οδήγησης στη Λευκωσία

Τα κεντρικά γραφεία του Τμήματος Οδικών Μεταφορών (ΤΟΜ) βρίσκονται στην Οδό Ομήρου 13, 1082 Λευκωσία. Εκεί εγγράφεστε για τη θεωρητική εξέταση και από εκεί ξεκινούν οι πρακτικές εξετάσεις. Το ΤΟΜ είναι ανοιχτό Δευτέρα έως Παρασκευή, συνήθως από 7:30 έως 14:30. Ελέγξτε την ιστοσελίδα τους πριν πάτε αυτοπροσώπως.

**Τι πρέπει να ξέρουν οι νέοι οδηγοί για τους δρόμους της Λευκωσίας**

Η Λευκωσία έχει ένα χαρακτηριστικό που εκπλήσσει πολλούς νέους οδηγούς: η νεκρή ζώνη. Η οδός Λήδρας στο κέντρο της πόλης οδηγεί σε σημείο διέλευσης προς τα κατεχόμενα. Οι δρόμοι κοντά στο σημείο διέλευσης είναι στενοί και γεμάτοι κίνηση τις ώρες αιχμής. Οι σχολές αποφεύγουν αυτή την περιοχή κατά τα μαθήματα, αλλά πρέπει να ξέρετε πού βρίσκεται.

Οι κυκλικοί κόμβοι είναι η κύρια πρόκληση στη Λευκωσία. Ο κόμβος στη Μακεδονίτισσα, όπου η Λεωφόρος Μακαρίου ΙΙΙ συναντά την οδό Τσερίου, έχει πολλές εξόδους και πυκνή κίνηση. Η σχολή σας θα σας πάει εκεί πριν την εξέταση. Οι φαρδιές λεωφόροι στον Στρόβολο και στην Έγκωμη, όπως η Αρχαγγέλου και η Δημοκρατίας, είναι εκεί που γίνονται οι περισσότερες πρακτικές εξετάσεις.

Ο αυτοκινητόδρομος Α1 ξεκινάει νότια της πόλης και συνδέει τη Λευκωσία με τη Λεμεσό. Οι περισσότερες σχολές περιλαμβάνουν ένα ή δύο μαθήματα αυτοκινητόδρομου πριν την εξέταση.

**Τιμές σχολών οδηγών στη Λευκωσία**

Τα πρακτικά μαθήματα στη Λευκωσία κοστίζουν συνήθως μεταξύ €25 και €38 ανά ώρα. Τα μαθήματα θεωρίας κοστίζουν €15 έως €25. Ένα πλήρες πακέτο, που καλύπτει θεωρία, πρακτικές ώρες και προετοιμασία εξέτασης, κοστίζει συνήθως μεταξύ €450 και €700. Ζητήστε γραπτή ανάλυση τιμών πριν υπογράψετε οτιδήποτε.

Η εξέταση θεωρίας στο ΤΟΜ κοστίζει περίπου €40. Η πρακτική εξέταση κοστίζει περίπου €80. Αυτά είναι κυβερνητικά τέλη που πληρώνονται απευθείας στο ΤΟΜ.

### Συχνές ερωτήσεις για οδήγηση στη Λευκωσία

**Πόσο κοστίζει να βγάλετε δίπλωμα οδήγησης στη Λευκωσία;**
Υπολογίστε περίπου €500 έως €750 συνολικά. Αυτό περιλαμβάνει μαθήματα, τέλη εξετάσεων και την άδεια. Το ακριβές ποσό εξαρτάται από τις ώρες που χρειάζεστε.

**Πού γίνεται η πρακτική εξέταση στη Λευκωσία;**
Οι εξετάσεις ξεκινούν από το Τμήμα Οδικών Μεταφορών στην Οδό Ομήρου. Ο εξεταστής σας κατευθύνει σε μια διαδρομή στις γύρω περιοχές.

**Πόσα μαθήματα χρειάζεστε πριν την κυπριακή εξέταση οδήγησης;**
Το ΤΟΜ απαιτεί έναν ελάχιστο αριθμό ωρών πριν μπορέσετε να δώσετε πρακτική εξέταση. Η σχολή σας τα παρακολουθεί. Οι περισσότεροι μαθητές χρειάζονται 20 έως 35 ώρες πρακτικής.

**Τι είναι η κυπριακή θεωρητική εξέταση;**
Η θεωρητική εξέταση γίνεται στον υπολογιστή. Καλύπτει πινακίδες, κανόνες κυκλοφορίας και επικίνδυνες καταστάσεις. Η σχολή σας θα σας δώσει βιβλίο προετοιμασίας.

**Μπορούν αλλοδαποί να βγάλουν δίπλωμα στη Λευκωσία;**
Ναι. Πολίτες ΕΕ/ΕΟΧ ακολουθούν την ίδια διαδικασία. Υπήκοοι τρίτων χωρών μπορεί να χρειαστούν άδεια παραμονής. Το ΤΟΜ σας ενημερώνει για τα απαραίτητα έγγραφα.

**Πόσο καιρό παίρνει η όλη διαδικασία;**
Από την έναρξη μαθημάτων μέχρι να πάρετε δίπλωμα, οι περισσότεροι χρειάζονται τρεις έως πέντε μήνες.

**Μπορώ να χρησιμοποιήσω ευρωπαϊκό δίπλωμα στην Κύπρο;**
Αν είστε επισκέπτης, ναι. Αν γίνετε κάτοικος, πρέπει να το ανταλλάξετε εντός συγκεκριμένης προθεσμίας. Ρωτήστε το ΤΟΜ για τη συγκεκριμένη περίπτωσή σας.

**Τι έγγραφα χρειάζεστε για την εξέταση οδήγησης στην Κύπρο;**
Χρειάζεστε έγκυρο ταυτοποιητικό έγγραφο, απόδειξη διεύθυνσης και τα έντυπα που συμπλήρωσε η σχολή σας. Το ΤΟΜ σας δίνει λίστα κατά την εγγραφή.

**Υπάρχουν σχολές οδηγών στη Λευκωσία που κάνουν μαθήματα στα ελληνικά και αγγλικά;**
Ναι. Πολλές σχολές στη Λευκωσία προσφέρουν μαθήματα και στις δύο γλώσσες, ειδικά αυτές που εξυπηρετούν εκπατρισμένους και διεθνείς φοιτητές.

**Ποια είναι η ελάχιστη ηλικία για δίπλωμα οδήγησης στην Κύπρο;**
Πρέπει να έχετε συμπληρώσει 18 έτη για να δώσετε εξέταση οδήγησης στην Κύπρο για άδεια κατηγορίας Β (επιβατικό αυτοκίνητο).`,
  },

  Limassol: {
    en: `### Getting your driving licence in Limassol

The Road Transport Department district office for Limassol is in the Kapsalos area of the city. It handles theory and practical tests for the whole Limassol district. Opening times are Monday to Friday, usually 7:30 to 14:30. Confirm before you travel as hours can change seasonally.

**What new drivers should know about Limassol roads**

Limassol has one road that most new drivers underestimate: the coastal avenue running from the old port toward the Marina. This stretch of Makarios III Avenue gets very busy in the evening and during summer weekends. Pedestrian crossings are frequent and cars pull in and out of parking constantly. Schools take you there, but not in the first lessons.

The roundabout near the Limassol castle, where the old city roads converge, is a common test route feature. It has limited sight lines and tourists on foot. Lane discipline is tested hard here. Further east, the roads near the university campus are wider and faster. Expect your test route to include both types.

The A1 motorway runs north of the city. It connects Limassol to Nicosia and to Paphos. Most schools in Limassol include motorway practice before your test. The on-ramps near the Limassol North junction are fast and require confident merging.

**Driving school prices in Limassol**

Practical lessons in Limassol cost roughly €25 to €36 per hour. Theory lessons run €15 to €25. A full course from first lesson to test is typically €420 to €680. The variation depends on how many hours you need and which school you choose. Get a quote in writing before you begin.

Theory test fee: around €40. Practical test fee: around €80. Both are paid to the RTD directly.

### Frequently asked questions about driving in Limassol

**How much does a driving licence cost in Limassol?**
Budget between €480 and €730 in total for a complete course including tests and the licence document itself.

**Where is the driving test held in Limassol?**
Practical tests start from the Road Transport Department district office in the Kapsalos area. Routes cover the surrounding city roads, including the coastal avenue and the roundabout near the old port.

**How many lessons do I need in Limassol before the driving test?**
The RTD sets a minimum number of practical hours. Most students in Limassol need 20 to 35 hours before they are test-ready. Your school tracks and certifies these hours.

**What is the theory test like in Cyprus?**
It is a computer-based test at a licensed centre. It covers road signs, traffic rules, and hazard awareness. Most people need two to four weeks of preparation. Your school will give you study materials.

**Can I drive in Limassol on a foreign licence?**
Short-term visitors can use a valid foreign licence. Residents must exchange it for a Cypriot licence within the required period. Check with the RTD for the current rules based on your nationality.

**How long does the licence process take in Limassol?**
Three to five months is typical, from first lesson to passing the practical test. The wait for a test date is the main variable.

**Are there English-speaking driving schools in Limassol?**
Yes. Given that Limassol has a large international community, many schools here offer instruction in English. Ask directly when you call.

**What do I need to bring to the driving test in Cyprus?**
A valid identity document, any forms your school has prepared, and confirmation of your test booking. The RTD will give you a full checklist at registration.

**What is the speed limit inside Limassol?**
50 km/h on urban roads, 80 km/h on the main roads outside the city, and 100 km/h on the motorway. Cameras operate on several routes.

**Can foreigners register for a driving course in Limassol?**
Yes. You need a valid identity document and an address in Cyprus. EU and non-EU nationals both can register. Non-EU nationals may also need a valid residence permit.`,

    el: `### Πώς βγάζετε δίπλωμα οδήγησης στη Λεμεσό

Το επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών στη Λεμεσό βρίσκεται στην περιοχή Κάψαλος. Εξυπηρετεί θεωρητικές και πρακτικές εξετάσεις για ολόκληρη την επαρχία Λεμεσού. Οι ώρες είναι Δευτέρα έως Παρασκευή, συνήθως 7:30 έως 14:30. Επιβεβαιώστε πριν πάτε.

**Τι πρέπει να ξέρουν οι νέοι οδηγοί για τους δρόμους της Λεμεσού**

Η Λεμεσός έχει έναν δρόμο που υποτιμούν πολλοί νέοι οδηγοί: την παραλιακή λεωφόρο από το παλιό λιμάνι προς τη Μαρίνα. Αυτό το τμήμα της Λεωφόρου Μακαρίου ΙΙΙ είναι πολύ κατειλημμένο τα βράδια και τα καλοκαιρινά σαββατοκύριακα. Οι σχολές σας πηγαίνουν εκεί, αλλά όχι στα πρώτα μαθήματα.

Ο κυκλικός κόμβος κοντά στο Κάστρο της Λεμεσού, όπου συναντώνται οι δρόμοι της παλιάς πόλης, είναι κοινό σημείο εξέτασης. Έχει περιορισμένη ορατότητα και τουρίστες πεζούς. Η πειθαρχία λωρίδας ελέγχεται αυστηρά εδώ. Πιο ανατολικά, οι δρόμοι κοντά στην πανεπιστημιούπολη είναι πιο φαρδιοί και πιο γρήγοροι.

Ο αυτοκινητόδρομος Α1 περνάει βόρεια της πόλης. Συνδέει τη Λεμεσό με τη Λευκωσία και την Πάφο. Οι περισσότερες σχολές στη Λεμεσό περιλαμβάνουν εξάσκηση στον αυτοκινητόδρομο πριν την εξέταση.

**Τιμές σχολών οδηγών στη Λεμεσό**

Τα πρακτικά μαθήματα στη Λεμεσό κοστίζουν περίπου €25 έως €36 ανά ώρα. Τα μαθήματα θεωρίας €15 έως €25. Ένα πλήρες πακέτο κοστίζει συνήθως €420 έως €680. Ζητήστε γραπτή προσφορά πριν ξεκινήσετε.

### Συχνές ερωτήσεις για οδήγηση στη Λεμεσό

**Πόσο κοστίζει να βγάλετε δίπλωμα οδήγησης στη Λεμεσό;**
Υπολογίστε μεταξύ €480 και €730 συνολικά για ένα πλήρες πρόγραμμα, συμπεριλαμβανομένων εξετάσεων και αδείας.

**Πού γίνεται η εξέταση οδήγησης στη Λεμεσό;**
Οι πρακτικές εξετάσεις ξεκινούν από το επαρχιακό γραφείο του ΤΟΜ στην περιοχή Κάψαλος.

**Πόσα μαθήματα χρειάζεστε στη Λεμεσό πριν την εξέταση;**
Το ΤΟΜ ορίζει ελάχιστο αριθμό ωρών. Οι περισσότεροι μαθητές στη Λεμεσό χρειάζονται 20 έως 35 ώρες πρακτικής.

**Τι είναι η θεωρητική εξέταση στην Κύπρο;**
Είναι εξέταση σε υπολογιστή σε αδειοδοτημένο κέντρο. Καλύπτει πινακίδες, κανόνες κυκλοφορίας και επικίνδυνες καταστάσεις. Οι περισσότεροι χρειάζονται δύο έως τέσσερις εβδομάδες προετοιμασίας.

**Μπορώ να οδηγώ στη Λεμεσό με ξένο δίπλωμα;**
Βραχυπρόθεσμοι επισκέπτες μπορούν να χρησιμοποιούν έγκυρο ξένο δίπλωμα. Οι κάτοικοι πρέπει να το ανταλλάξουν εντός της προβλεπόμενης προθεσμίας.

**Πόσο καιρό διαρκεί η διαδικασία στη Λεμεσό;**
Τρεις έως πέντε μήνες είναι τυπικό, από το πρώτο μάθημα μέχρι να πάρετε δίπλωμα.

**Υπάρχουν αγγλόφωνες σχολές οδηγών στη Λεμεσό;**
Ναι. Λόγω της μεγάλης διεθνούς κοινότητας, πολλές σχολές προσφέρουν μαθήματα στα αγγλικά.

**Τι πρέπει να φέρετε στην εξέταση οδήγησης στην Κύπρο;**
Έγκυρο ταυτοποιητικό έγγραφο, τα έντυπα από τη σχολή και επιβεβαίωση κράτησης εξέτασης.

**Ποιο είναι το όριο ταχύτητας μέσα στη Λεμεσό;**
50 χλμ/ώρα στους αστικούς δρόμους, 80 χλμ/ώρα στους κύριους δρόμους εκτός πόλης και 100 χλμ/ώρα στον αυτοκινητόδρομο.

**Μπορούν αλλοδαποί να εγγραφούν σε σχολή οδηγών στη Λεμεσό;**
Ναι. Χρειάζεστε έγκυρο ταυτοποιητικό έγγραφο και διεύθυνση στην Κύπρο. Πολίτες ΕΕ και τρίτων χωρών μπορούν να εγγραφούν.`,
  },

  Larnaca: {
    en: `### Getting your driving licence in Larnaca

The Road Transport Department district office for Larnaca is in the central area of the city, close to the old port. It handles theory and practical tests for the Larnaca district. Office hours are Monday to Friday, typically 7:30 to 14:30.

**What new drivers should know about Larnaca roads**

Larnaca has one road situation that surprises many learners: the road to Dhekelia. This route passes through the British Sovereign Base Area (SBA). The driving rules do not change inside the base, but some signs are in English only, and the road markings differ slightly. If you plan to use this road regularly to get to work or travel east, ask your school to include it in your lessons.

The seafront road along Phinikoudes fills up in summer. Pedestrians step off pavements without looking, rental cars stop without signalling, and parking is tight. Schools avoid teaching there in peak season, but you will need to handle it on your own afterward.

The roundabout on the road toward the airport is a common practical test location. It requires clear lane selection before you enter. The roads near the Larnaca salt lake are quieter and often used for early lessons.

**Driving school prices in Larnaca**

Practical lessons in Larnaca typically cost €22 to €34 per hour. Theory sessions run €15 to €22. A full package from first lesson to passing the test usually costs €380 to €620. Larnaca schools are generally slightly cheaper than those in Nicosia and Limassol. Get a written quote before you start.

### Frequently asked questions about driving in Larnaca

**How much does a driving licence cost in Larnaca?**
Expect to pay between €420 and €680 in total, including lessons, test fees, and the licence document.

**Where is the driving test held in Larnaca?**
The practical test departs from the Road Transport Department district office near the port. Routes typically include the city centre, the coastal road, and the roundabout toward the airport.

**How many lessons do I need before the driving test in Larnaca?**
The RTD requires a minimum number of logged practical hours. Most students need 20 to 30 hours of practical time in Larnaca before they are ready.

**How long does the full process take from Larnaca?**
Around three to five months from starting lessons to passing the practical test. The shorter waiting times at the Larnaca RTD office often mean the process is faster here than in Nicosia or Limassol.

**Can I use a foreign driving licence in Larnaca?**
Visitors can use a valid foreign licence. Residents must exchange it within the time set by law. Ask the RTD about the rules for your specific nationality.

**What documents do I need to start lessons in Larnaca?**
A valid identity document and proof of address in Cyprus are the basics. Your school will tell you if anything else is needed.

**Are there driving schools in Larnaca that teach in English?**
Yes. Several schools in Larnaca offer lessons in English. The city has a large British and international community, so this is common.

**Does the Dhekelia road affect the driving test?**
The practical test does not currently route through the base area. But learning to drive there is useful if you live or work east of the city.

**What is the speed limit in Larnaca?**
50 km/h inside the city, 80 km/h on the roads outside the built-up area, and 100 km/h on the motorway sections. Cameras operate on several roads including the approach to the airport.

**Can a student in Cyprus on a study visa get a driving licence in Larnaca?**
It depends on the visa conditions and how long you plan to stay. Contact the RTD directly to confirm whether you are eligible to apply.`,

    el: `### Πώς βγάζετε δίπλωμα οδήγησης στη Λάρνακα

Το επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών στη Λάρνακα βρίσκεται στην κεντρική περιοχή της πόλης, κοντά στο παλιό λιμάνι. Εξυπηρετεί θεωρητικές και πρακτικές εξετάσεις για την επαρχία Λάρνακας. Ώρες γραφείου Δευτέρα έως Παρασκευή, 7:30 έως 14:30.

**Τι πρέπει να ξέρουν οι νέοι οδηγοί για τους δρόμους της Λάρνακας**

Η Λάρνακα έχει μια κατάσταση που εκπλήσσει πολλούς εκπαιδευόμενους: ο δρόμος προς τη Δεκέλεια. Αυτή η διαδρομή περνάει μέσα από τη Βρετανική Κυρίαρχη Βάση (SBA). Οι κανόνες οδήγησης δεν αλλάζουν μέσα στη βάση, αλλά ορισμένες πινακίδες είναι μόνο στα αγγλικά. Αν σκοπεύετε να χρησιμοποιείτε αυτόν τον δρόμο τακτικά, ζητήστε από τη σχολή να τον συμπεριλάβει στα μαθήματα.

Η παραλιακή οδός των Φοινικούδων γεμίζει το καλοκαίρι. Πεζοί βγαίνουν ξαφνικά στον δρόμο, ενοικιαζόμενα αυτοκίνητα σταματούν χωρίς σινιάλο και η στάθμευση είναι δύσκολη.

Ο κυκλικός κόμβος στον δρόμο προς το αεροδρόμιο είναι κοινό σημείο πρακτικής εξέτασης. Απαιτεί σαφή επιλογή λωρίδας πριν εισέλθετε.

**Τιμές σχολών οδηγών στη Λάρνακα**

Τα πρακτικά μαθήματα στη Λάρνακα κοστίζουν συνήθως €22 έως €34 ανά ώρα. Ένα πλήρες πακέτο κοστίζει συνήθως €380 έως €620. Οι σχολές στη Λάρνακα είναι γενικά λίγο πιο φθηνές από αυτές στη Λευκωσία και τη Λεμεσό.

### Συχνές ερωτήσεις για οδήγηση στη Λάρνακα

**Πόσο κοστίζει να βγάλετε δίπλωμα οδήγησης στη Λάρνακα;**
Υπολογίστε €420 έως €680 συνολικά, συμπεριλαμβανομένων μαθημάτων, τελών εξετάσεων και αδείας.

**Πού γίνεται η εξέταση οδήγησης στη Λάρνακα;**
Η πρακτική εξέταση ξεκινάει από το επαρχιακό γραφείο του ΤΟΜ κοντά στο λιμάνι.

**Πόσα μαθήματα χρειάζεστε πριν την εξέταση στη Λάρνακα;**
Οι περισσότεροι μαθητές στη Λάρνακα χρειάζονται 20 έως 30 ώρες πρακτικής πριν είναι έτοιμοι.

**Πόσο καιρό διαρκεί η όλη διαδικασία στη Λάρνακα;**
Περίπου τρεις έως πέντε μήνες. Οι μικρότερες αναμονές στο γραφείο ΤΟΜ Λάρνακας συχνά σημαίνουν ταχύτερη διαδικασία.

**Μπορώ να χρησιμοποιήσω ξένο δίπλωμα στη Λάρνακα;**
Οι επισκέπτες μπορούν. Οι κάτοικοι πρέπει να το ανταλλάξουν εντός της νόμιμης προθεσμίας.

**Τι έγγραφα χρειάζομαι για να αρχίσω μαθήματα στη Λάρνακα;**
Έγκυρο ταυτοποιητικό έγγραφο και απόδειξη διεύθυνσης στην Κύπρο. Η σχολή σας θα σας ενημερώσει αν χρειάζεται κάτι άλλο.

**Υπάρχουν αγγλόφωνες σχολές οδηγών στη Λάρνακα;**
Ναι. Πολλές σχολές προσφέρουν μαθήματα στα αγγλικά λόγω της μεγάλης βρετανικής κοινότητας.

**Επηρεάζει ο δρόμος Δεκέλειας την εξέταση;**
Η πρακτική εξέταση δεν περνάει από τη βάση. Αλλά αν οδηγείτε ανατολικά της πόλης, αξίζει να εξασκηθείτε εκεί.

**Ποιο είναι το όριο ταχύτητας στη Λάρνακα;**
50 χλμ/ώρα στην πόλη, 80 χλμ/ώρα έξω από κατοικημένη περιοχή και 100 χλμ/ώρα στα τμήματα αυτοκινητόδρομου.

**Μπορεί φοιτητής με θεώρηση να βγάλει δίπλωμα στη Λάρνακα;**
Εξαρτάται από τις συνθήκες της θεώρησης και τη διάρκεια παραμονής. Επικοινωνήστε απευθείας με το ΤΟΜ για επιβεβαίωση.`,
  },

  Paphos: {
    en: `### Getting your driving licence in Paphos

The Road Transport Department district office for Paphos is located in the Paphos town area, accessible from the main road between Kato and Pano Paphos. It handles tests for the whole Paphos district. Hours are Monday to Friday, typically 7:30 to 14:30.

**What new drivers should know about Paphos roads**

The main challenge in Paphos is gradient. The city climbs from sea level at Kato Paphos up to over 150 metres at Pano Paphos and higher. New drivers who trained on flat roads elsewhere find the hill starts hard. Stalling on an uphill junction is the most common cause of test failure in Paphos. All four schools practise this extensively.

The road between Kato Paphos and Pano Paphos, running through Agios Theodoros and Apostolou Pavlou Avenue, is the main artery. At rush hour it is slow and full of parked delivery vehicles. Patience and observation matter more than speed here.

The villages behind Paphos, including Peyia, Tala, and Chloraka, sit on the hills. Roads there are narrow, sometimes reduced to single track around bends. Good mirror use and slow approach to blind corners are essential. Ask your school to take you on at least one hillside village route.

The A6 motorway connects Paphos to Limassol and to the airport. Merging from the Paphos interchange requires confidence. Your school will include this in the pre-test lessons.

**Driving school prices in Paphos**

Practical lessons in Paphos typically cost €22 to €35 per hour. With only four schools, there is less price competition than in Nicosia or Limassol. A full course usually runs €380 to €600. Call all four schools and compare quotes before you commit.

### Frequently asked questions about driving in Paphos

**How much does a driving licence cost in Paphos?**
Budget between €420 and €650 in total, including lessons, RTD test fees, and the licence document.

**Where is the driving test held in Paphos?**
The practical test starts from the Road Transport Department district office in Paphos. Test routes typically include Apostolou Pavlou Avenue, the hill sections between Kato and Pano Paphos, and the approach to the roundabouts near the old town.

**How many lessons do I need in Paphos?**
The minimum is set by the RTD. Most students in Paphos need 20 to 30 hours of practical time. Students who have difficulty with hill starts may need more.

**Are there long waits for test dates in Paphos?**
No. Paphos is the smallest test centre in the free area by volume. Waiting times are usually short, often a few weeks. This is an advantage for those who want to complete the process quickly.

**Can I get lessons in English in Paphos?**
Yes. The international and British population of Paphos is large. Most schools offer instruction in English. Confirm when you call.

**What is the hardest part of the driving test in Paphos?**
Hill starts. The examiners in Paphos expect clean clutch control on uphill junctions. Practise this with your school until it is automatic.

**How long does the full process take in Paphos?**
Three to four months is common. The short test wait makes it faster than in Nicosia for many students.

**Do I need a Cyprus address to take lessons in Paphos?**
You need to show a local address when you register with the RTD. A rental address or utility bill in your name works.

**Can I take the theory test in English in Cyprus?**
Yes. The RTD provides the computer-based theory test in both Greek and English.

**What documents do I need for the RTD in Paphos?**
A valid passport or identity card, proof of address in Cyprus, and the forms your school provides. The RTD gives you a full list at registration.`,

    el: `### Πώς βγάζετε δίπλωμα οδήγησης στην Πάφο

Το επαρχιακό γραφείο του Τμήματος Οδικών Μεταφορών για την Πάφο βρίσκεται στην περιοχή της πόλης, προσβάσιμο από τον κύριο δρόμο μεταξύ Κάτω και Πάνω Πάφου. Εξυπηρετεί εξετάσεις για ολόκληρη την επαρχία Πάφου. Ώρες Δευτέρα έως Παρασκευή, 7:30 έως 14:30.

**Τι πρέπει να ξέρουν οι νέοι οδηγοί για τους δρόμους της Πάφου**

Η κύρια πρόκληση στην Πάφο είναι η κλίση. Η πόλη ανεβαίνει από την επιφάνεια της θάλασσας στην Κάτω Πάφο σε πάνω από 150 μέτρα στην Πάνω Πάφο. Νέοι οδηγοί που έχουν εκπαιδευτεί σε επίπεδους δρόμους αλλού βρίσκουν δύσκολες τις εκκινήσεις σε ανηφόρα. Η μπλόκα σε σταυροδρόμι ανηφόρας είναι η πιο συχνή αιτία αποτυχίας στην Πάφο. Και οι τέσσερις σχολές το εξασκούν εκτενώς.

Τα χωριά πίσω από την Πάφο, όπως η Πέγεια, η Τάλα και η Χλώρακα, βρίσκονται στους λόφους. Οι δρόμοι εκεί είναι στενοί, κάποιες φορές μονόδρομοι στις στροφές. Ζητήστε από τη σχολή να σας πάει σε τουλάχιστον μια διαδρομή ορεινού χωριού.

**Τιμές σχολών οδηγών στην Πάφο**

Τα πρακτικά μαθήματα στην Πάφο κοστίζουν συνήθως €22 έως €35 ανά ώρα. Με μόνο τέσσερις σχολές, υπάρχει λιγότερος ανταγωνισμός τιμών. Ένα πλήρες πακέτο κοστίζει συνήθως €380 έως €600. Καλέστε και τις τέσσερις και συγκρίνετε.

### Συχνές ερωτήσεις για οδήγηση στην Πάφο

**Πόσο κοστίζει να βγάλετε δίπλωμα οδήγησης στην Πάφο;**
Υπολογίστε €420 έως €650 συνολικά, συμπεριλαμβανομένων μαθημάτων, τελών ΤΟΜ και αδείας.

**Πού γίνεται η εξέταση οδήγησης στην Πάφο;**
Η πρακτική εξέταση ξεκινάει από το επαρχιακό γραφείο του ΤΟΜ στην Πάφο. Οι διαδρομές περιλαμβάνουν τη Λεωφόρο Αποστόλου Παύλου, τα τμήματα ανηφόρας και τους κυκλικούς κόμβους κοντά στην παλιά πόλη.

**Πόσα μαθήματα χρειάζεστε στην Πάφο;**
Οι περισσότεροι μαθητές χρειάζονται 20 έως 30 ώρες πρακτικής. Μαθητές που δυσκολεύονται με τις εκκινήσεις σε ανηφόρα μπορεί να χρειαστούν περισσότερες.

**Υπάρχουν μεγάλες αναμονές για εξέταση στην Πάφο;**
Όχι. Η Πάφος είναι το μικρότερο κέντρο εξετάσεων στην ελεύθερη Κύπρο. Οι αναμονές είναι συνήθως σύντομες, συχνά λίγες εβδομάδες.

**Μπορώ να πάρω μαθήματα στα αγγλικά στην Πάφο;**
Ναι. Ο μεγάλος διεθνής πληθυσμός της Πάφου σημαίνει ότι οι περισσότερες σχολές προσφέρουν μαθήματα στα αγγλικά.

**Ποιο είναι το πιο δύσκολο μέρος της εξέτασης στην Πάφο;**
Εκκινήσεις σε ανηφόρα. Εξασκήστε τα μέχρι να γίνουν αυτόματα.

**Πόσο καιρό διαρκεί η όλη διαδικασία στην Πάφο;**
Τρεις έως τέσσερις μήνες είναι κοινό. Η σύντομη αναμονή εξέτασης την κάνει πιο γρήγορη από τη Λευκωσία.

**Χρειάζομαι κυπριακή διεύθυνση για να ξεκινήσω μαθήματα στην Πάφο;**
Χρειάζεστε τοπική διεύθυνση κατά την εγγραφή στο ΤΟΜ. Ένα λογαριασμό κοινής ωφέλειας στο όνομά σας αρκεί.

**Μπορώ να δώσω τη θεωρητική εξέταση στα αγγλικά στην Κύπρο;**
Ναι. Το ΤΟΜ παρέχει την εξέταση και στα ελληνικά και στα αγγλικά.

**Τι έγγραφα χρειάζεστε για το ΤΟΜ Πάφου;**
Διαβατήριο ή ταυτότητα, απόδειξη διεύθυνσης στην Κύπρο και τα έντυπα από τη σχολή σας.`,
  },

  Paralimni: {
    en: `### Getting your driving licence in Paralimni

The Famagusta district office of the Road Transport Department is in Paralimni town. It serves the whole free Famagusta district. The office moved to Paralimni after 1974 because Famagusta city is on the occupied side of the island. Hours are Monday to Friday, typically 7:30 to 14:30.

**What new drivers should know about Paralimni roads**

Paralimni has a very clear two-season character. In winter, the roads are quiet. Traffic is low, pedestrians are few, and parking is not a problem. It is the best time to learn. In summer, the area transforms. The roads toward Ayia Napa and Protaras fill with rental cars, tourists on scooters, and coaches. Confidence in busy traffic is something you need to develop here, not avoid.

The roundabouts around Paralimni town and on the road into Protaras are important test locations. Multiple entry lanes and unclear road markings make them harder than they look. Your school will take you through them several times.

The road to Deryneia and the crossing point toward the occupied side ends at the buffer zone. The roads in that area are quiet but close to a restricted zone. Your school will keep away from the boundary itself but may use the roads nearby for practice.

**Driving school prices in Paralimni**

Practical lessons in Paralimni typically cost €22 to €33 per hour. A full course from first lesson to passing usually runs €360 to €580. With only two schools, there is limited price comparison, but both will give you a quote over the phone.

### Frequently asked questions about driving in Paralimni

**How much does a driving licence cost in Paralimni?**
Plan for approximately €400 to €620 in total, including lessons, test fees, and the licence document.

**Where is the driving test held in Paralimni?**
Practical tests depart from the Famagusta district Road Transport Department office in Paralimni town. Routes include the main Paralimni roads, the approach to Protaras, and town roundabouts.

**How many lessons do I need before the test in Paralimni?**
The RTD minimum applies here as everywhere. Most students in Paralimni need 20 to 30 hours of practical time.

**Are test date waits short in Paralimni?**
Yes, usually. Paralimni is the smallest test centre in the free area. Test dates often come up within a few weeks of being ready.

**Can I get driving lessons in English in Paralimni?**
Yes. Both schools serve a large number of English-speaking residents and tourists. Ask when you call.

**What is the hardest part of driving lessons in Paralimni?**
Summer traffic. The roads to Ayia Napa and Protaras have tourist congestion from June to September. Lessons during that period are more demanding than in winter.

**Do I need a local address to take the test in Paralimni?**
You need an address in Cyprus when you register with the RTD. A temporary address works as long as it is verifiable.

**How long does it take to get a licence in Paralimni?**
Two to four months for most students. The short test wait in Paralimni speeds up the process compared to Nicosia.

**Can I use my UK licence to drive in Paralimni?**
If you are a visitor, yes. If you are a resident, the rules changed after Brexit. Contact the RTD to confirm your eligibility to exchange or whether you need to go through the full process.

**Are the Ayia Napa roads included in practical lessons?**
Yes, both schools cover the Protaras and Ayia Napa roads as part of normal lesson routes. If you plan to drive in that area regularly, ask for extra practice there.`,

    el: `### Πώς βγάζετε δίπλωμα οδήγησης στο Παραλίμνι

Το επαρχιακό γραφείο Αμμοχώστου του Τμήματος Οδικών Μεταφορών βρίσκεται στην πόλη του Παραλιμνίου. Εξυπηρετεί ολόκληρη την ελεύθερη επαρχία Αμμοχώστου. Το γραφείο μεταφέρθηκε στο Παραλίμνι μετά το 1974 γιατί η πόλη της Αμμοχώστου βρίσκεται στην κατεχόμενη πλευρά. Ώρες Δευτέρα έως Παρασκευή, 7:30 έως 14:30.

**Τι πρέπει να ξέρουν οι νέοι οδηγοί για τους δρόμους του Παραλιμνίου**

Το Παραλίμνι έχει ένα πολύ ξεκάθαρο διχωμένο χαρακτήρα. Τον χειμώνα οι δρόμοι είναι ήρεμοι. Η κίνηση είναι μικρή, οι πεζοί λίγοι και η στάθμευση εύκολη. Είναι η καλύτερη εποχή για εκμάθηση. Το καλοκαίρι, η περιοχή αλλάζει. Οι δρόμοι προς Αγία Νάπα και Πρωταρά γεμίζουν με ενοικιαζόμενα αυτοκίνητα, τουρίστες σε σκούτερ και λεωφορεία.

Οι κυκλικοί κόμβοι γύρω από την πόλη του Παραλιμνίου και στον δρόμο προς το Πρωταρά είναι σημαντικά σημεία εξέτασης. Πολλαπλές λωρίδες εισόδου και ασαφή σηματοδότηση τους κάνουν δυσκολότερους από ό,τι φαίνονται.

**Τιμές σχολών οδηγών στο Παραλίμνι**

Τα πρακτικά μαθήματα στο Παραλίμνι κοστίζουν συνήθως €22 έως €33 ανά ώρα. Ένα πλήρες πακέτο κοστίζει συνήθως €360 έως €580. Με μόνο δύο σχολές, και οι δύο θα σας δώσουν προσφορά τηλεφωνικά.

### Συχνές ερωτήσεις για οδήγηση στο Παραλίμνι

**Πόσο κοστίζει να βγάλετε δίπλωμα στο Παραλίμνι;**
Υπολογίστε περίπου €400 έως €620 συνολικά, μαθήματα, τέλη και άδεια.

**Πού γίνεται η εξέταση στο Παραλίμνι;**
Οι πρακτικές εξετάσεις ξεκινούν από το γραφείο ΤΟΜ Αμμοχώστου στο Παραλίμνι. Οι διαδρομές καλύπτουν τους κύριους δρόμους και τους κυκλικούς κόμβους.

**Πόσα μαθήματα χρειάζεστε πριν την εξέταση στο Παραλίμνι;**
Οι περισσότεροι μαθητές χρειάζονται 20 έως 30 ώρες πρακτικής.

**Είναι σύντομες οι αναμονές για εξέταση στο Παραλίμνι;**
Ναι, συνήθως. Είναι το μικρότερο κέντρο εξετάσεων στην ελεύθερη Κύπρο. Οι ημερομηνίες διατίθενται συχνά εντός λίγων εβδομάδων.

**Μπορώ να πάρω μαθήματα στα αγγλικά στο Παραλίμνι;**
Ναι. Και οι δύο σχολές εξυπηρετούν μεγάλο αριθμό αγγλόφωνων κατοίκων. Ρωτήστε όταν καλέσετε.

**Ποιο είναι το πιο δύσκολο μέρος των μαθημάτων στο Παραλίμνι;**
Η καλοκαιρινή κυκλοφορία. Οι δρόμοι προς Αγία Νάπα και Πρωταρά έχουν τουριστική συμφόρηση από Ιούνιο έως Σεπτέμβριο.

**Χρειάζομαι τοπική διεύθυνση για να δώσω εξέταση στο Παραλίμνι;**
Χρειάζεστε διεύθυνση στην Κύπρο κατά την εγγραφή στο ΤΟΜ. Προσωρινή διεύθυνση είναι αποδεκτή αν είναι επαληθεύσιμη.

**Πόσο καιρό παίρνει να βγάλετε δίπλωμα στο Παραλίμνι;**
Δύο έως τέσσερις μήνες για τους περισσότερους. Η σύντομη αναμονή εξέτασης επιταχύνει τη διαδικασία.

**Μπορώ να χρησιμοποιήσω βρετανικό δίπλωμα για οδήγηση στο Παραλίμνι;**
Αν είστε επισκέπτης, ναι. Αν είστε κάτοικος, οι κανόνες άλλαξαν μετά το Brexit. Επικοινωνήστε με το ΤΟΜ για επιβεβαίωση.

**Καλύπτουν τα μαθήματα τους δρόμους της Αγίας Νάπας;**
Ναι, και οι δύο σχολές καλύπτουν τους δρόμους Πρωταρά και Αγίας Νάπας. Αν σκοπεύετε να οδηγείτε εκεί συχνά, ζητήστε επιπλέον εξάσκηση.`,
  },
};
