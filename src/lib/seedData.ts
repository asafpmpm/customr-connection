import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(userId: string) {
  // Check if user already has data
  const { count } = await supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (count && count > 0) return;

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
  const birthDate = (month: number, day: number) => `1985-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const todayMD = today.getMonth() + 1;
  const todayD = today.getDate();

  const customers = [
    { first_name: "דני", last_name: "כהן", role: "מנכ\"ל", organization: "טכנולוגיות חדשניות", email: "dani@tech.co.il", phone: "050-1234567", birth_date: birthDate(todayMD, todayD), religion_affiliation: "יהודי", notes: "לקוח VIP", is_active: true, user_id: userId },
    { first_name: "מיכל", last_name: "לוי", role: "מנהלת שיווק", organization: "מדיה פלוס", email: "michal@media.co.il", phone: "052-2345678", birth_date: birthDate(todayMD, todayD + 1 > 28 ? 1 : todayD + 1), religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "אחמד", last_name: "חסן", role: "מהנדס תוכנה", organization: "סטארט-אפ AI", email: "ahmed@ai.co.il", phone: "054-3456789", birth_date: "1990-03-15", religion_affiliation: "מוסלמי", notes: "מתעניין בשיתוף פעולה", is_active: true, user_id: userId },
    { first_name: "נועה", last_name: "ברק", role: "גזברית", organization: "עיריית תל אביב", email: "noa@tlv.gov.il", phone: "053-4567890", birth_date: "1988-07-22", religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "יוסף", last_name: "מועלם", role: "מנהל מחלקה", organization: "בנק הפועלים", email: "yosef@bank.co.il", phone: "050-5678901", birth_date: "1975-11-08", religion_affiliation: "דרוזי", notes: "קשר ותיק", is_active: true, user_id: userId },
    { first_name: "רחל", last_name: "אברהם", role: "רכזת", organization: "קרן קיימת", email: "rachel@kkl.co.il", phone: "052-6789012", birth_date: "1992-01-30", religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "ג'ורג'", last_name: "חבש", role: "עו\"ד", organization: "משרד עורכי דין", email: "george@law.co.il", phone: "054-7890123", birth_date: "1980-05-12", religion_affiliation: "נוצרי", notes: "", is_active: true, user_id: userId },
    { first_name: "שרה", last_name: "גולדשטיין", role: "מנהלת HR", organization: "אינטל ישראל", email: "sara@intel.co.il", phone: "050-8901234", birth_date: "1987-09-03", religion_affiliation: "יהודי", notes: "להתעדכן על גיוסים", is_active: true, user_id: userId },
    { first_name: "עומר", last_name: "רביע", role: "מנהל פרויקטים", organization: "חברת בנייה", email: "omer@build.co.il", phone: "053-9012345", birth_date: "1983-12-17", religion_affiliation: "מוסלמי", notes: "", is_active: true, user_id: userId },
    { first_name: "תמר", last_name: "שפירא", role: "סמנכ\"לית כספים", organization: "פארמה ישראל", email: "tamar@pharma.co.il", phone: "052-0123456", birth_date: "1979-04-25", religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "עלי", last_name: "סעיד", role: "רופא", organization: "בית חולים רמב\"ם", email: "ali@rambam.co.il", phone: "054-1112233", birth_date: "1976-08-19", religion_affiliation: "דרוזי", notes: "", is_active: true, user_id: userId },
    { first_name: "הדר", last_name: "פרידמן", role: "מעצבת UX", organization: "סטודיו דיזיין", email: "hadar@design.co.il", phone: "050-2223344", birth_date: "1995-02-14", religion_affiliation: "יהודי", notes: "יצירתית מאוד", is_active: true, user_id: userId },
    { first_name: "סאמר", last_name: "נאסר", role: "מנהל חשבונות", organization: "רואי חשבון", email: "samer@cpa.co.il", phone: "053-3334455", birth_date: "1981-06-07", religion_affiliation: "נוצרי", notes: "", is_active: true, user_id: userId },
    { first_name: "אילנה", last_name: "וולף", role: "מנהלת תפעול", organization: "לוגיסטיקה+", email: "ilana@logistics.co.il", phone: "052-4445566", birth_date: "1986-10-28", religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "חאלד", last_name: "עבאס", role: "מהנדס אזרחי", organization: "תכנון ובנייה", email: "khaled@plan.co.il", phone: "054-5556677", birth_date: "1978-03-01", religion_affiliation: "מוסלמי", notes: "", is_active: true, user_id: userId },
    { first_name: "יעל", last_name: "רוזן", role: "יועצת ארגונית", organization: "ייעוץ עסקי", email: "yael@consult.co.il", phone: "050-6667788", birth_date: birthDate(todayMD, todayD + 2 > 28 ? 2 : todayD + 2), religion_affiliation: "יהודי", notes: "לקוחה חדשה", is_active: true, user_id: userId },
    { first_name: "מרים", last_name: "חדאד", role: "מורה", organization: "בית ספר יסודי", email: "mariam@school.co.il", phone: "053-7778899", birth_date: "1991-11-15", religion_affiliation: "נוצרי", notes: "", is_active: true, user_id: userId },
    { first_name: "אורן", last_name: "דוד", role: "מנהל IT", organization: "הייטק סולושנס", email: "oren@hitech.co.il", phone: "052-8889900", birth_date: "1984-07-09", religion_affiliation: "יהודי", notes: "", is_active: true, user_id: userId },
    { first_name: "פאטמה", last_name: "אבו חמד", role: "אחות", organization: "קופת חולים", email: "fatma@health.co.il", phone: "054-9990011", birth_date: "1993-05-20", religion_affiliation: "מוסלמי", notes: "", is_active: true, user_id: userId },
    { first_name: "עידו", last_name: "קרן", role: "סמנכ\"ל פיתוח", organization: "פינטק ישראל", email: "ido@fintech.co.il", phone: "050-0001122", birth_date: "1982-09-11", religion_affiliation: "יהודי", notes: "שותף אסטרטגי", is_active: true, user_id: userId },
    { first_name: "לינא", last_name: "בכר", role: "מנהלת רכש", organization: "תעשייה כללית", email: "lina@industry.co.il", phone: "053-1112200", birth_date: "1989-01-05", religion_affiliation: "דרוזי", notes: "", is_active: false, user_id: userId },
  ];

  const { data: insertedCustomers } = await supabase.from("customers").insert(customers).select("id, first_name");

  // Holidays
  const holidays = [
    { holiday_name: "ראש השנה", religion_affiliation: "יהודי", holiday_date: fmt(addDays(today, 14)), description: "שנה טובה", is_active: true, user_id: userId },
    { holiday_name: "חג הפסח", religion_affiliation: "יהודי", holiday_date: fmt(addDays(today, 45)), description: "חג האביב", is_active: true, user_id: userId },
    { holiday_name: "עיד אל-פיטר", religion_affiliation: "מוסלמי", holiday_date: fmt(addDays(today, 21)), description: "סיום הרמדאן", is_active: true, user_id: userId },
    { holiday_name: "חג המולד", religion_affiliation: "נוצרי", holiday_date: fmt(addDays(today, 60)), description: "חג המולד", is_active: true, user_id: userId },
    { holiday_name: "חג הנבי שועייב", religion_affiliation: "דרוזי", holiday_date: fmt(addDays(today, 30)), description: "חג מרכזי דרוזי", is_active: true, user_id: userId },
  ];
  await supabase.from("holidays").insert(holidays);

  // Templates
  const templates = [
    { template_name: "ברכת יום הולדת - מייל", category: "birthday", channel: "email", subject_template: "יום הולדת שמח {first_name}! 🎂", body_template: "שלום {first_name},\n\nמאחלים לך יום הולדת שמח ומלא בשמחה!\nשתהיה שנה מופלאה, מלאה בהצלחות, בריאות ואושר.\n\nבברכה חמה,\nCustomer Connection", is_default: true, user_id: userId },
    { template_name: "ברכת יום הולדת - WhatsApp", category: "birthday", channel: "whatsapp", subject_template: null, body_template: "שלום {first_name}! 🎂🎉\nיום הולדת שמח!\nמאחלים לך שנה נפלאה מלאה בהצלחות ושמחה.\nבברכה חמה ❤️", is_default: true, user_id: userId },
    { template_name: "ברכת חג - מייל", category: "holiday", channel: "email", subject_template: "חג {holiday_name} שמח! 🕯️", body_template: "שלום {first_name},\n\nלרגל {holiday_name}, אנו שולחים לך ברכות חמות.\nשיהיה חג שמח ומשמעותי לך ולמשפחתך.\n\nבברכה,\nCustomer Connection", is_default: true, user_id: userId },
    { template_name: "ברכת חג - WhatsApp", category: "holiday", channel: "whatsapp", subject_template: null, body_template: "שלום {first_name}! 🕯️\nחג {holiday_name} שמח!\nמאחלים לך ולמשפחתך חג נעים ומלא שמחה. 🙏", is_default: true, user_id: userId },
    { template_name: "עדכון מקצועי", category: "professional", channel: "email", subject_template: "עדכון חשוב עבורך, {first_name}", body_template: "שלום {first_name},\n\nרצינו לעדכן אותך בנוגע להתפתחויות אחרונות שעשויות לעניין אותך בתפקידך כ{role} ב{organization}.\n\nנשמח לקבוע שיחה קצרה לדון בפרטים.\n\nבברכה,\nCustomer Connection", is_default: true, user_id: userId },
    { template_name: "הצעת שיתוף פעולה", category: "professional", channel: "whatsapp", subject_template: null, body_template: "שלום {first_name}! 👋\nרציתי לשוחח על הזדמנות שיתוף פעולה שעשויה לעניין אותך ואת {organization}.\nאשמח לתאם שיחה קצרה. מתי נוח לך?", is_default: false, user_id: userId },
    { template_name: "קמפיין שיווקי - מייל", category: "marketing", channel: "email", subject_template: "הצעה מיוחדת עבורך, {first_name}!", body_template: "שלום {first_name},\n\nיש לנו הצעה מיוחדת שחשבנו שתתאים לך:\n\n[תוכן ההצעה]\n\nלפרטים נוספים, אל תהססו ליצור קשר.\n\nבברכה,\nCustomer Connection", is_default: true, user_id: userId },
    { template_name: "הזמנה לאירוע", category: "marketing", channel: "whatsapp", subject_template: null, body_template: "שלום {first_name}! 🎉\nאנחנו שמחים להזמין אותך לאירוע מיוחד!\n\n📅 [תאריך]\n📍 [מיקום]\n\nנשמח לראותך שם! 😊", is_default: false, user_id: userId },
  ];
  await supabase.from("message_templates").insert(templates);

  // Campaigns
  const campaigns = [
    { campaign_name: "ברכות ראש השנה", campaign_type: "professional", subject_template: "שנה טובה ומתוקה!", body_template: "שלום {first_name},\n\nלרגל השנה החדשה, אנו מאחלים לך שנה מלאה בהצלחות, בריאות ושגשוג.\n\nבברכה חמה,\nCustomer Connection", target_filters: { religion_affiliation: "יהודי" }, status: "ready", user_id: userId },
    { campaign_name: "קמפיין שיווקי Q1", campaign_type: "marketing", subject_template: "הזדמנות מיוחדת עבורך!", body_template: "שלום {first_name},\n\nרצינו לספר לך על שירות חדש שהשקנו ועשוי להתאים ל{organization}.\n\nנשמח לתאם הדגמה.\n\nבברכה,\nCustomer Connection", target_filters: { role: "מנכ\"ל" }, status: "draft", user_id: userId },
    { campaign_name: "עדכון מקצועי למהנדסים", campaign_type: "professional", subject_template: "עדכון טכנולוגי חשוב", body_template: "שלום {first_name},\n\nכ{role} ב{organization}, חשבנו שיעניין אותך לשמוע על טרנדים חדשים בתחום.\n\nמצ\"ב קישור למאמר.\n\nבברכה,\nCustomer Connection", target_filters: { role: "מהנדס" }, status: "sent_simulated", user_id: userId },
  ];
  await supabase.from("campaigns").insert(campaigns);

  // Personal events
  if (insertedCustomers && insertedCustomers.length > 3) {
    const events = [
      { customer_id: insertedCustomers[0].id, event_type: "personal", event_title: "פגישת סיכום רבעון", event_date: fmt(addDays(today, 3)), status: "open", user_id: userId },
      { customer_id: insertedCustomers[2].id, event_type: "personal", event_title: "שיחת היכרות ראשונית", event_date: fmt(addDays(today, 1)), status: "open", user_id: userId },
      { customer_id: insertedCustomers[5].id, event_type: "personal", event_title: "מעקב אחרי הצעת מחיר", event_date: fmt(today), status: "open", user_id: userId },
      { customer_id: insertedCustomers[9].id, event_type: "personal", event_title: "חידוש הסכם שנתי", event_date: fmt(addDays(today, 7)), status: "open", user_id: userId },
    ];
    await supabase.from("relationship_events").insert(events);
  }
}
