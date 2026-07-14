import type { SupportedLocale } from "./types";

const TRANSLATIONS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    "title": "Finanzamt letters reader",
    "subtitle": "Decode German tax office letters with AI-powered analysis",
    "description":
      "Upload PDFs or images from the German tax office and get a clear, actionable summary in plain English. With your consent, the data is sent to an AI model provider for analysis.",
    "freeLabel": "Free",
    "features.feature1": "AI-powered analysis",
    "features.feature2": "Plain English summary",
    "features.feature3": "Follow-up questions",
    "upload.title": "Upload your Finanzamt letter",
    "upload.subtitle": "Drag & drop your PDF or image letter file here, or click to select",
    "upload.fileReady": "File ready for analysis",
    "upload.selectFile": "Select File",
    "upload.dragDrop": "or drag and drop",
    "upload.documentPreview": "Document preview",
    "analysis.analyzing": "Analyzing...",
    "analysis.analyzeDocument": "Analyze with AI",
    "analysis.reset": "Reset",
    "analysis.analyzeNew": "Analyze new",
    "analysis.summary": "Summary",
    "analysis.keyPoints": "Key Points",
    "analysis.actionRequired": "Action Required",
    "analysis.followUp": "Ask Follow-up Questions",
    "analysis.followUpPlaceholder": "Ask about payment options, deadlines, next steps...",
    "analysis.ask": "Ask AI",
    "analysis.taxAssistant": "Assistant",
    "analysis.deadline": "Deadline",
    "consent.aiLabel":
      "I consent to Norman sending this document or extracted text, plus any follow-up questions I enter, to an AI model provider for analysis. I understand this may include personal or tax information from the document.",
    "consent.required": "Please consent before we send data to the AI model provider.",
    "urgency.high": "high priority",
    "urgency.medium": "medium priority",
    "urgency.low": "low priority",
    "faq.title": "Frequently Asked Questions",
    "faq.q1.question": "How does this tool work?",
    "faq.q1.answer":
      "AI-powered tool analyzes German tax office documents using advanced OCR and natural language processing. It identifies key information, deadlines, and required actions, then provides a clear summary in plain English.",
    "faq.q2.question": "Is my personal information secure?",
    "faq.q2.answer":
      "AI analysis only starts after you explicitly consent to sending document data to an AI model provider. Norman does not store uploaded documents on its servers. For PDFs where text can be extracted, common personal identifiers are redacted before sending the text. Image uploads may include visible personal or tax information and are sent as uploaded.",
    "faq.q3.question": "What types of documents can I upload?",
    "faq.q3.answer":
      "You can upload PDFs or images (JPG, PNG) up to 10MB. The tool works with scanned or digital German tax office letters, including tax assessments, payment notices, and official correspondence.",
    "faq.q4.question": "How accurate is the analysis?",
    "faq.q4.answer":
      "AI provides highly accurate summaries for most standard German tax documents. However, this tool is for informational purposes only. Always verify important details with the original document.",
    "faq.q5.question": "Is this tool really free?",
    "faq.q5.answer":
      "Yes, completely free with no hidden costs, registration requirements, or usage limits. This tool is part of Norman's commitment to making German tax compliance more accessible for everyone.",
    "privacy.title": "Before AI analysis",
    "privacy.point1": "We ask for your explicit consent before sending document data to an AI model provider",
    "privacy.point2": "For PDFs with extractable text, common personal identifiers are redacted before sending",
    "privacy.point3": "Image files may include visible personal or tax information and are sent as uploaded",
    "privacy.point4": "Norman does not store uploaded documents on its servers",
    "disclaimer.title": "Disclaimer:",
    "disclaimer.text":
      "This tool provides automated analysis for informational purposes only. While we strive for accuracy, AI-generated summaries may contain errors. Always verify important information with the original document. Norman Finance cannot be held liable for any decisions made based on this analysis.",
    "errors.invalidType": "Please upload a PDF, JPG, or PNG file.",
    "errors.fileSize": "File size must be less than 10MB.",
    "errors.analysisFailed": "Failed to analyze the document. Please try again.",
    "errors.followUpFailed": "Failed to get follow-up answer. Please try again.",
    "errors.pdfExtractFailed": "Failed to process PDF. Please convert it to an image (JPG/PNG) for analysis.",
    "errors.pdfEmpty":
      "Could not extract text from PDF. The PDF might be image-based or corrupted. Please convert it to an image (JPG/PNG) for analysis.",
    "cta.title": "Need more help with German taxes?",
    "cta.description":
      "Norman automates your bookkeeping, tax filings, and compliance, so you can focus on your business.",
    "cta.button": "Get started for free",
  },
  de: {
    "title": "Finanzamt-Brief-Leser",
    "subtitle": "Entschlüssle Finanzamtsbriefe mit KI-gestützter Analyse",
    "description":
      "Lade PDFs oder Bilder vom deutschen Finanzamt hoch und erhalte eine klare, verständliche Zusammenfassung. Mit deiner Einwilligung werden die Daten zur Analyse an einen Anbieter eines KI-Modells gesendet.",
    "freeLabel": "Kostenlos",
    "features.feature1": "KI-gestützte Analyse",
    "features.feature2": "Verständliche Zusammenfassung",
    "features.feature3": "Nachfragen möglich",
    "upload.title": "Lade deinen Finanzamt-Brief hoch",
    "upload.subtitle": "Ziehe deine PDF- oder Bilddatei hierhin oder klicke zum Auswählen",
    "upload.fileReady": "Datei bereit zur Analyse",
    "upload.selectFile": "Datei auswählen",
    "upload.dragDrop": "oder ziehen und ablegen",
    "upload.documentPreview": "Dokumentvorschau",
    "analysis.analyzing": "Analysiert...",
    "analysis.analyzeDocument": "Mit KI analysieren",
    "analysis.reset": "Zurücksetzen",
    "analysis.analyzeNew": "Neues analysieren",
    "analysis.summary": "Zusammenfassung",
    "analysis.keyPoints": "Wichtige Punkte",
    "analysis.actionRequired": "Erforderliche Maßnahmen",
    "analysis.followUp": "Nachfragen stellen",
    "analysis.followUpPlaceholder": "Fragen zu Zahlungsoptionen, Fristen, nächsten Schritten...",
    "analysis.ask": "KI fragen",
    "analysis.taxAssistant": "Assistent",
    "analysis.deadline": "Frist",
    "consent.aiLabel":
      "Ich willige ein, dass Norman dieses Dokument oder den extrahierten Text sowie meine Nachfragen an einen Anbieter eines KI-Modells zur Analyse sendet. Mir ist bewusst, dass dies persönliche oder steuerliche Informationen aus dem Dokument enthalten kann.",
    "consent.required": "Bitte willige ein, bevor wir Daten an den Anbieter des KI-Modells senden.",
    "urgency.high": "hohe Priorität",
    "urgency.medium": "mittlere Priorität",
    "urgency.low": "niedrige Priorität",
    "faq.title": "Häufig gestellte Fragen",
    "faq.q1.question": "Wie funktioniert dieses Tool?",
    "faq.q1.answer":
      "Unser KI-gestütztes Tool analysiert deutsche Finanzamtsdokumente mit fortschrittlicher OCR- und Sprachverarbeitungstechnologie. Es identifiziert wichtige Informationen, Fristen und erforderliche Maßnahmen und bietet dann eine klare, verständliche Zusammenfassung.",
    "faq.q2.question": "Sind meine persönlichen Daten sicher?",
    "faq.q2.answer":
      "Die KI-Analyse startet erst, nachdem du ausdrücklich eingewilligt hast, Dokumentdaten an einen Anbieter eines KI-Modells zu senden. Norman speichert hochgeladene Dokumente nicht auf seinen Servern. Bei PDFs, aus denen Text extrahiert werden kann, werden gängige persönliche Kennungen vor dem Senden des Textes redigiert. Bilddateien können sichtbare persönliche oder steuerliche Informationen enthalten und werden so gesendet, wie du sie hochgeladen hast.",
    "faq.q3.question": "Welche Arten von Dokumenten kann ich hochladen?",
    "faq.q3.answer":
      "Du kannst PDFs oder Bilder (JPG, PNG) bis zu 10MB hochladen. Das Tool funktioniert mit gescannten oder digitalen deutschen Finanzamtsbriefen, einschließlich Steuerbescheiden, Zahlungsaufforderungen und offizieller Korrespondenz.",
    "faq.q4.question": "Wie genau ist die Analyse?",
    "faq.q4.answer":
      "Unsere KI liefert hochgenaue Zusammenfassungen für die meisten standardmäßigen deutschen Steuerdokumente. Dieses Tool dient jedoch nur zu Informationszwecken. Überprüfe wichtige Details immer mit dem Originaldokument.",
    "faq.q5.question": "Ist dieses Tool wirklich kostenlos?",
    "faq.q5.answer":
      "Ja, völlig kostenlos ohne versteckte Kosten, Registrierungsanforderungen oder Nutzungslimits. Dieses Tool ist Teil von Norman's Engagement, die deutsche Steuer-Compliance für alle zugänglicher zu machen.",
    "privacy.title": "Vor der KI-Analyse",
    "privacy.point1": "Wir fragen nach deiner ausdrücklichen Einwilligung, bevor Dokumentdaten an einen Anbieter eines KI-Modells gesendet werden",
    "privacy.point2": "Bei PDFs mit extrahierbarem Text werden gängige persönliche Kennungen vor dem Senden redigiert",
    "privacy.point3": "Bilddateien können sichtbare persönliche oder steuerliche Informationen enthalten und werden so gesendet, wie sie hochgeladen wurden",
    "privacy.point4": "Norman speichert hochgeladene Dokumente nicht auf seinen Servern",
    "disclaimer.title": "Haftungsausschluss:",
    "disclaimer.text":
      "Dieses Tool bietet automatisierte Analysen nur zu Informationszwecken. Obwohl wir uns um Genauigkeit bemühen, können KI-generierte Zusammenfassungen Fehler enthalten. Überprüfe wichtige Informationen immer mit dem Originaldokument. Norman Finance kann nicht für Entscheidungen haftbar gemacht werden, die auf dieser Analyse basieren.",
    "errors.invalidType": "Bitte lade eine PDF-, JPG- oder PNG-Datei hoch.",
    "errors.fileSize": "Die Dateigröße muss weniger als 10MB betragen.",
    "errors.analysisFailed": "Fehler beim Analysieren des Dokuments. Bitte versuche es erneut.",
    "errors.followUpFailed": "Fehler beim Beantworten der Nachfrage. Bitte versuche es erneut.",
    "errors.pdfExtractFailed":
      "Fehler beim Verarbeiten der PDF. Bitte konvertiere sie zur Analyse in ein Bild (JPG/PNG).",
    "errors.pdfEmpty":
      "Konnte keinen Text aus der PDF extrahieren. Die PDF ist möglicherweise bildbasiert oder beschädigt. Bitte konvertiere sie zur Analyse in ein Bild (JPG/PNG).",
    "cta.title": "Brauchst du mehr Hilfe bei deutschen Steuern?",
    "cta.description":
      "Norman automatisiert deine Buchhaltung, Steuererklärungen und Compliance, damit du dich auf dein Geschäft konzentrieren kannst.",
    "cta.button": "Kostenlos starten",
  },
  ru: {
    "title": "Помощник по письмам из Finanzamt",
    "subtitle": "Разбираем письма немецкого налогового управления с помощью ИИ",
    "description":
      "Загрузите PDF или изображение письма из Finanzamt и получите понятное резюме с рекомендуемыми действиями. С вашего согласия данные отправляются поставщику модели ИИ для анализа.",
    "freeLabel": "Бесплатно",
    "features.feature1": "Анализ на базе ИИ",
    "features.feature2": "Понятное резюме",
    "features.feature3": "Уточняющие вопросы",
    "upload.title": "Загрузите письмо из Finanzamt",
    "upload.subtitle": "Перетащите PDF или изображение сюда или нажмите, чтобы выбрать файл",
    "upload.fileReady": "Файл готов к анализу",
    "upload.selectFile": "Выбрать файл",
    "upload.dragDrop": "или перетащите сюда",
    "upload.documentPreview": "Предпросмотр документа",
    "analysis.analyzing": "Анализирую...",
    "analysis.analyzeDocument": "Анализировать с ИИ",
    "analysis.reset": "Сбросить",
    "analysis.analyzeNew": "Новый анализ",
    "analysis.summary": "Резюме",
    "analysis.keyPoints": "Ключевые моменты",
    "analysis.actionRequired": "Необходимые действия",
    "analysis.followUp": "Задать уточняющий вопрос",
    "analysis.followUpPlaceholder": "Спросите про варианты оплаты, сроки, следующие шаги...",
    "analysis.ask": "Спросить ИИ",
    "analysis.taxAssistant": "Ассистент",
    "analysis.deadline": "Срок",
    "consent.aiLabel":
      "Я соглашаюсь, что Norman отправит этот документ или извлеченный текст, а также мои уточняющие вопросы поставщику модели ИИ для анализа. Я понимаю, что это может включать личную или налоговую информацию из документа.",
    "consent.required": "Пожалуйста, дайте согласие перед отправкой данных поставщику модели ИИ.",
    "urgency.high": "высокий приоритет",
    "urgency.medium": "средний приоритет",
    "urgency.low": "низкий приоритет",
    "faq.title": "Часто задаваемые вопросы",
    "faq.q1.question": "Как работает этот инструмент?",
    "faq.q1.answer":
      "Инструмент на базе ИИ анализирует документы немецкого налогового управления с помощью продвинутого OCR и обработки естественного языка. Он определяет ключевую информацию, сроки и требуемые действия, а затем предоставляет понятное резюме.",
    "faq.q2.question": "Моя личная информация в безопасности?",
    "faq.q2.answer":
      "Анализ ИИ запускается только после вашего явного согласия на отправку данных документа поставщику модели ИИ. Norman не хранит загруженные документы на своих серверах. Для PDF, из которых можно извлечь текст, распространенные личные идентификаторы редактируются перед отправкой текста. Изображения могут содержать видимую личную или налоговую информацию и отправляются в том виде, в котором были загружены.",
    "faq.q3.question": "Какие типы документов можно загружать?",
    "faq.q3.answer":
      "Вы можете загружать PDF или изображения (JPG, PNG) размером до 10 МБ. Инструмент работает со сканированными и цифровыми письмами Finanzamt, включая налоговые решения, платёжные уведомления и официальную переписку.",
    "faq.q4.question": "Насколько точен анализ?",
    "faq.q4.answer":
      "ИИ даёт точные резюме для большинства стандартных немецких налоговых документов. Однако инструмент предназначен только для информационных целей. Всегда проверяйте важные детали в оригинале документа.",
    "faq.q5.question": "Этот инструмент действительно бесплатный?",
    "faq.q5.answer":
      "Да, полностью бесплатно: без скрытых затрат, регистрации и лимитов. Этот инструмент — часть миссии Norman делать соответствие немецкому налоговому законодательству доступнее для всех.",
    "privacy.title": "Перед анализом ИИ",
    "privacy.point1": "Мы запрашиваем явное согласие перед отправкой данных документа поставщику модели ИИ",
    "privacy.point2": "Для PDF с извлекаемым текстом распространенные личные идентификаторы редактируются перед отправкой",
    "privacy.point3": "Изображения могут содержать видимую личную или налоговую информацию и отправляются как загружены",
    "privacy.point4": "Norman не хранит загруженные документы на своих серверах",
    "disclaimer.title": "Отказ от ответственности:",
    "disclaimer.text":
      "Этот инструмент предоставляет автоматический анализ только в информационных целях. Хотя мы стремимся к точности, резюме, сгенерированные ИИ, могут содержать ошибки. Всегда проверяйте важную информацию в оригинале документа. Norman Finance не несёт ответственности за решения, принятые на основе этого анализа.",
    "errors.invalidType": "Пожалуйста, загрузите PDF, JPG или PNG файл.",
    "errors.fileSize": "Размер файла должен быть меньше 10 МБ.",
    "errors.analysisFailed": "Не удалось проанализировать документ. Пожалуйста, попробуйте ещё раз.",
    "errors.followUpFailed": "Не удалось получить ответ на уточняющий вопрос. Попробуйте ещё раз.",
    "errors.pdfExtractFailed":
      "Не удалось обработать PDF. Пожалуйста, конвертируйте его в изображение (JPG/PNG) для анализа.",
    "errors.pdfEmpty":
      "Не удалось извлечь текст из PDF. Возможно, PDF состоит из изображений или повреждён. Пожалуйста, конвертируйте его в изображение (JPG/PNG) для анализа.",
    "cta.title": "Нужна помощь с немецкими налогами?",
    "cta.description":
      "Norman автоматизирует бухгалтерию, налоговые декларации и compliance, чтобы вы могли сосредоточиться на бизнесе.",
    "cta.button": "Начать бесплатно",
  },
};

export function t(locale: SupportedLocale, key: string): string {
  return TRANSLATIONS[locale][key] ?? TRANSLATIONS.en[key] ?? key;
}
