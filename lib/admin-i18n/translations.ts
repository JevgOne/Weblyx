// Admin Panel Translations - CZ/EN/RU

export type AdminLocale = 'cs' | 'en' | 'ru';

export const adminTranslations = {
  cs: {
    // Common
    common: {
      open: 'Otevřít',
      close: 'Zavřít',
      save: 'Uložit',
      cancel: 'Zrušit',
      delete: 'Smazat',
      edit: 'Upravit',
      add: 'Přidat',
      search: 'Hledat',
      loading: 'Načítání...',
      error: 'Chyba',
      success: 'Úspěch',
      confirm: 'Potvrdit',
      back: 'Zpět',
      next: 'Další',
      previous: 'Předchozí',
      yes: 'Ano',
      no: 'Ne',
      all: 'Vše',
      none: 'Žádný',
      download: 'Stáhnout',
      upload: 'Nahrát',
      copy: 'Kopírovat',
      copied: 'Zkopírováno!',
      new: 'Nový',
      view: 'Zobrazit',
      actions: 'Akce',
      status: 'Status',
      date: 'Datum',
      name: 'Název',
      email: 'Email',
      phone: 'Telefon',
      total: 'Celkem',
      settings: 'Nastavení',
    },

    // Header
    header: {
      title: 'Weblyx Admin',
      dashboard: 'Dashboard',
      administrator: 'Administrátor',
      logout: 'Odhlásit',
      language: 'Jazyk',
    },

    // Dashboard
    dashboard: {
      welcome: 'Vítejte zpět! 👋',
      overview: 'Přehled vašeho administračního panelu',
      quickAccess: 'Rychlý přístup',

      // Stats
      activeProjects: 'Aktivní projekty',
      totalProjects: 'Celkem projektů',
      leads: 'Poptávky (Leads)',
      totalLeads: 'Celkem poptávek',
      portfolioProjects: 'Portfolio projekty',
      publishedOnWeb: 'Publikované na webu',

      // Quick access cards
      leadsTitle: 'Poptávky',
      leadsDesc: 'Správa leadů',
      projectsTitle: 'Projekty',
      projectsDesc: 'Správa projektů',
      portfolioTitle: 'Portfolio',
      portfolioDesc: 'Správa portfolia',
      mediaTitle: 'Média 📸',
      mediaDesc: 'Knihovna obrázků',
      contentTitle: 'Content (CMS)',
      contentDesc: 'Úprava obsahu webu',
      statsTitle: 'Statistiky',
      statsDesc: 'Analytics & reporty',
      blogTitle: 'Blog',
      blogDesc: 'Správa článků',
      reviewsTitle: 'Recenze',
      reviewsDesc: 'Zákaznické hodnocení',
      promoCodesTitle: 'Promo kódy',
      promoCodesDesc: 'Správa slev a akcí',
      paymentsTitle: 'Platby 💳',
      paymentsDesc: 'GoPay platební brána',
      invoicesTitle: 'Faktury 📄',
      invoicesDesc: 'České daňové doklady',
      webAnalyzerTitle: 'Web Analyzer',
      webAnalyzerDesc: 'Analýza konkurenčních webů',
      analyze: 'Analyzovat',
      leadGenTitle: 'Lead Generation 🤖',
      leadGenDesc: 'AI scraping & email generování',
      erowebTitle: 'EroWeb Analýza 🔥',
      erowebDesc: 'Analýza pro adult industry',
      settingsTitle: 'Nastavení ⚙️',
      settingsDesc: 'Změna hesla a účet',
      usersTitle: 'Správa uživatelů 👥',
      usersDesc: 'Správa admin účtů',
    },

    // EroWeb Analysis
    eroweb: {
      title: 'EroWeb Analýza',
      subtitle: 'Analyzujte weby konkurence a získejte nové klienty',
      newAnalysis: '+ Nová analýza',

      // Form
      urlLabel: 'URL webu',
      urlPlaceholder: 'https://example.com',
      businessTypeLabel: 'Typ podnikání',
      businessTypes: {
        massage: 'Erotické masáže',
        privat: 'Privát / Klub',
        escort: 'Escort',
      },
      analyzeButton: 'Analyzovat web',
      analyzing: 'Analyzuji...',

      // Progress steps
      steps: {
        fetch: 'Načítám web',
        speed: 'Testuji rychlost',
        seo: 'Analyzuji SEO',
        geo: 'Kontroluji GEO/AIEO',
        design: 'Hodnotím design',
        report: 'Generuji report',
      },

      // Report
      report: 'Report',
      emailTab: 'Email',
      categoryScores: 'Hodnocení po kategoriích',
      categories: {
        speed: 'Rychlost',
        mobile: 'Mobilní verze',
        security: 'Zabezpečení',
        seo: 'SEO',
        geo: 'GEO/AIEO',
        design: 'Design',
      },
      findings: 'Zjištěné problémy',
      recommendation: 'Doporučení',
      pricing: 'Ceník',
      pricingIndividual: 'Ceník je individuální podle rozsahu prací a vašich specifických požadavků.',
      pricingRange: 'Orientační cenový rozsah:',
      pricingNote: 'Rádi vám připravíme nabídku přesně na míru vašim potřebám a rozpočtu.',
      downloadPdf: 'Stáhnout PDF',
      sendEmail: 'Odeslat email',

      // Contact status
      contactStatus: {
        not_contacted: 'Nekontaktováno',
        contacted: 'Kontaktováno',
        agreed: 'Dohodnuto',
        no_response: 'Bez odpovědi',
      },

      // Email/WhatsApp
      emailTemplate: 'Návrh emailu',
      whatsappTemplate: 'Návrh WhatsApp zprávy',
      subject: 'Předmět:',
      body: 'Tělo emailu:',
      copyTip: 'Zkopírujte zprávu a odešlete ji přímo přes WhatsApp Web nebo mobilní aplikaci.',

      // History
      history: 'Historie analýz',
      noAnalyses: 'Zatím žádné analýzy',
      deleteConfirm: 'Opravdu chcete smazat tuto analýzu?',

      // Errors
      analysisFailed: 'Analýza selhala',
      timeout: 'Analýza trvala příliš dlouho (60s timeout)',
      tryAgain: 'Zkuste to prosím znovu',
    },

    // Leads
    leads: {
      title: 'Poptávky',
      newLead: 'Nová poptávka',
      noLeads: 'Zatím žádné poptávky',
      status: {
        new: 'Nový',
        contacted: 'Kontaktováno',
        inProgress: 'Probíhá',
        completed: 'Dokončeno',
        rejected: 'Odmítnuto',
      },
    },

    // Projects
    projects: {
      title: 'Projekty',
      newProject: 'Nový projekt',
      noProjects: 'Zatím žádné projekty',
      client: 'Klient',
      deadline: 'Termín',
      budget: 'Rozpočet',
    },

    // Portfolio
    portfolio: {
      title: 'Portfolio',
      addProject: 'Přidat projekt',
      projectName: 'Název projektu',
      projectUrl: 'URL projektu',
      description: 'Popis',
      technologies: 'Technologie',
      image: 'Obrázek',
    },

    // Blog
    blog: {
      title: 'Blog',
      newArticle: 'Nový článek',
      articleTitle: 'Název článku',
      content: 'Obsah',
      published: 'Publikováno',
      draft: 'Koncept',
    },

    // Invoices
    invoices: {
      title: 'Faktury',
      newInvoice: 'Nová faktura',
      invoiceNumber: 'Číslo faktury',
      client: 'Klient',
      amount: 'Částka',
      dueDate: 'Splatnost',
      paid: 'Zaplaceno',
      unpaid: 'Nezaplaceno',
    },

    // Settings
    settingsPage: {
      title: 'Nastavení',
      accountSettings: 'Nastavení účtu',
      changePassword: 'Změnit heslo',
      currentPassword: 'Současné heslo',
      newPassword: 'Nové heslo',
      confirmPassword: 'Potvrdit heslo',
      languageSettings: 'Nastavení jazyka',
      selectLanguage: 'Vyberte jazyk',
    },
  },

  en: {
    // Common
    common: {
      open: 'Open',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      download: 'Download',
      upload: 'Upload',
      copy: 'Copy',
      copied: 'Copied!',
      new: 'New',
      view: 'View',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      total: 'Total',
      settings: 'Settings',
    },

    // Header
    header: {
      title: 'Weblyx Admin',
      dashboard: 'Dashboard',
      administrator: 'Administrator',
      logout: 'Log out',
      language: 'Language',
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome back! 👋',
      overview: 'Your admin panel at a glance',
      quickAccess: 'Quick Access',

      // Stats
      activeProjects: 'Active Projects',
      totalProjects: 'Total projects',
      leads: 'Leads',
      totalLeads: 'Total leads',
      portfolioProjects: 'Portfolio Projects',
      publishedOnWeb: 'Published online',

      // Quick access cards
      leadsTitle: 'Leads',
      leadsDesc: 'Manage leads',
      projectsTitle: 'Projects',
      projectsDesc: 'Manage projects',
      portfolioTitle: 'Portfolio',
      portfolioDesc: 'Manage portfolio',
      mediaTitle: 'Media 📸',
      mediaDesc: 'Image library',
      contentTitle: 'Content (CMS)',
      contentDesc: 'Edit website content',
      statsTitle: 'Statistics',
      statsDesc: 'Analytics & reports',
      blogTitle: 'Blog',
      blogDesc: 'Manage articles',
      reviewsTitle: 'Reviews',
      reviewsDesc: 'Customer feedback',
      promoCodesTitle: 'Promo Codes',
      promoCodesDesc: 'Discounts & promotions',
      paymentsTitle: 'Payments 💳',
      paymentsDesc: 'GoPay payment gateway',
      invoicesTitle: 'Invoices 📄',
      invoicesDesc: 'Tax documents',
      webAnalyzerTitle: 'Web Analyzer',
      webAnalyzerDesc: 'Analyze competitor websites',
      analyze: 'Analyze',
      leadGenTitle: 'Lead Generation 🤖',
      leadGenDesc: 'AI scraping & email generation',
      erowebTitle: 'EroWeb Analysis 🔥',
      erowebDesc: 'Adult industry analysis',
      settingsTitle: 'Settings ⚙️',
      settingsDesc: 'Password & account settings',
      usersTitle: 'User Management 👥',
      usersDesc: 'Manage admin accounts',
    },

    // EroWeb Analysis
    eroweb: {
      title: 'EroWeb Analysis',
      subtitle: 'Analyze competitor websites and win new clients',
      newAnalysis: '+ New Analysis',

      // Form
      urlLabel: 'Website URL',
      urlPlaceholder: 'https://example.com',
      businessTypeLabel: 'Business Type',
      businessTypes: {
        massage: 'Erotic Massage',
        privat: 'Private / Club',
        escort: 'Escort',
      },
      analyzeButton: 'Analyze Website',
      analyzing: 'Analyzing...',

      // Progress steps
      steps: {
        fetch: 'Loading website',
        speed: 'Testing speed',
        seo: 'Analyzing SEO',
        geo: 'Checking GEO/AIEO',
        design: 'Evaluating design',
        report: 'Generating report',
      },

      // Report
      report: 'Report',
      emailTab: 'Email',
      categoryScores: 'Scores by Category',
      categories: {
        speed: 'Speed',
        mobile: 'Mobile',
        security: 'Security',
        seo: 'SEO',
        geo: 'GEO/AIEO',
        design: 'Design',
      },
      findings: 'Issues Found',
      recommendation: 'Recommendations',
      pricing: 'Pricing',
      pricingIndividual: 'Pricing is tailored to the scope of work and your specific requirements.',
      pricingRange: 'Estimated price range:',
      pricingNote: 'We would be happy to prepare a custom quote tailored to your needs and budget.',
      downloadPdf: 'Download PDF',
      sendEmail: 'Send Email',

      // Contact status
      contactStatus: {
        not_contacted: 'Not Contacted',
        contacted: 'Contacted',
        agreed: 'Agreed',
        no_response: 'No Response',
      },

      // Email/WhatsApp
      emailTemplate: 'Email Draft',
      whatsappTemplate: 'WhatsApp Message Draft',
      subject: 'Subject:',
      body: 'Message:',
      copyTip: 'Copy the message and send it directly via WhatsApp Web or the mobile app.',

      // History
      history: 'Analysis History',
      noAnalyses: 'No analyses yet',
      deleteConfirm: 'Are you sure you want to delete this analysis?',

      // Errors
      analysisFailed: 'Analysis failed',
      timeout: 'Analysis timed out (60s limit)',
      tryAgain: 'Please try again',
    },

    // Leads
    leads: {
      title: 'Leads',
      newLead: 'New Lead',
      noLeads: 'No leads yet',
      status: {
        new: 'New',
        contacted: 'Contacted',
        inProgress: 'In Progress',
        completed: 'Completed',
        rejected: 'Rejected',
      },
    },

    // Projects
    projects: {
      title: 'Projects',
      newProject: 'New Project',
      noProjects: 'No projects yet',
      client: 'Client',
      deadline: 'Deadline',
      budget: 'Budget',
    },

    // Portfolio
    portfolio: {
      title: 'Portfolio',
      addProject: 'Add Project',
      projectName: 'Project Name',
      projectUrl: 'Project URL',
      description: 'Description',
      technologies: 'Technologies',
      image: 'Image',
    },

    // Blog
    blog: {
      title: 'Blog',
      newArticle: 'New Article',
      articleTitle: 'Article Title',
      content: 'Content',
      published: 'Published',
      draft: 'Draft',
    },

    // Invoices
    invoices: {
      title: 'Invoices',
      newInvoice: 'New Invoice',
      invoiceNumber: 'Invoice Number',
      client: 'Client',
      amount: 'Amount',
      dueDate: 'Due Date',
      paid: 'Paid',
      unpaid: 'Unpaid',
    },

    // Settings
    settingsPage: {
      title: 'Settings',
      accountSettings: 'Account Settings',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      languageSettings: 'Language Settings',
      selectLanguage: 'Select Language',
    },
  },

  ru: {
    // Common
    common: {
      open: 'Открыть',
      close: 'Закрыть',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      search: 'Поиск',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
      confirm: 'Подтвердить',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущее',
      yes: 'Да',
      no: 'Нет',
      all: 'Все',
      none: 'Ничего',
      download: 'Скачать',
      upload: 'Загрузить',
      copy: 'Копировать',
      copied: 'Скопировано!',
      new: 'Новый',
      view: 'Просмотр',
      actions: 'Действия',
      status: 'Статус',
      date: 'Дата',
      name: 'Название',
      email: 'Email',
      phone: 'Телефон',
      total: 'Итого',
      settings: 'Настройки',
    },

    // Header
    header: {
      title: 'Weblyx Admin',
      dashboard: 'Панель управления',
      administrator: 'Администратор',
      logout: 'Выйти',
      language: 'Язык',
    },

    // Dashboard
    dashboard: {
      welcome: 'С возвращением! 👋',
      overview: 'Обзор вашей панели управления',
      quickAccess: 'Быстрый доступ',

      // Stats
      activeProjects: 'Активные проекты',
      totalProjects: 'Всего проектов',
      leads: 'Заявки (Leads)',
      totalLeads: 'Всего заявок',
      portfolioProjects: 'Проекты портфолио',
      publishedOnWeb: 'Опубликовано на сайте',

      // Quick access cards
      leadsTitle: 'Заявки',
      leadsDesc: 'Управление заявками',
      projectsTitle: 'Проекты',
      projectsDesc: 'Управление проектами',
      portfolioTitle: 'Портфолио',
      portfolioDesc: 'Управление портфолио',
      mediaTitle: 'Медиа 📸',
      mediaDesc: 'Библиотека изображений',
      contentTitle: 'Контент (CMS)',
      contentDesc: 'Редактирование контента',
      statsTitle: 'Статистика',
      statsDesc: 'Аналитика и отчеты',
      blogTitle: 'Блог',
      blogDesc: 'Управление статьями',
      reviewsTitle: 'Отзывы',
      reviewsDesc: 'Отзывы клиентов',
      promoCodesTitle: 'Промо-коды',
      promoCodesDesc: 'Скидки и акции',
      paymentsTitle: 'Платежи 💳',
      paymentsDesc: 'Платежный шлюз GoPay',
      invoicesTitle: 'Счета 📄',
      invoicesDesc: 'Налоговые документы',
      webAnalyzerTitle: 'Web Анализатор',
      webAnalyzerDesc: 'Анализ сайтов конкурентов',
      analyze: 'Анализировать',
      leadGenTitle: 'Lead Generation 🤖',
      leadGenDesc: 'AI парсинг и генерация email',
      erowebTitle: 'EroWeb Анализ 🔥',
      erowebDesc: 'Анализ для adult индустрии',
      settingsTitle: 'Настройки ⚙️',
      settingsDesc: 'Пароль и аккаунт',
      usersTitle: 'Управление пользователями 👥',
      usersDesc: 'Управление админ аккаунтами',
    },

    // EroWeb Analysis
    eroweb: {
      title: 'EroWeb Анализ',
      subtitle: 'Анализируйте сайты конкурентов и привлекайте новых клиентов',
      newAnalysis: '+ Новый анализ',

      // Form
      urlLabel: 'URL сайта',
      urlPlaceholder: 'https://example.com',
      businessTypeLabel: 'Тип бизнеса',
      businessTypes: {
        massage: 'Эротический массаж',
        privat: 'Приват / Клуб',
        escort: 'Эскорт',
      },
      analyzeButton: 'Анализировать сайт',
      analyzing: 'Анализирую...',

      // Progress steps
      steps: {
        fetch: 'Загрузка сайта',
        speed: 'Тест скорости',
        seo: 'Анализ SEO',
        geo: 'Проверка GEO/AIEO',
        design: 'Оценка дизайна',
        report: 'Генерация отчета',
      },

      // Report
      report: 'Отчет',
      emailTab: 'Email',
      categoryScores: 'Оценки по категориям',
      categories: {
        speed: 'Скорость',
        mobile: 'Мобильная версия',
        security: 'Безопасность',
        seo: 'SEO',
        geo: 'GEO/AIEO',
        design: 'Дизайн',
      },
      findings: 'Обнаруженные проблемы',
      recommendation: 'Рекомендация',
      pricing: 'Стоимость',
      pricingIndividual: 'Стоимость рассчитывается индивидуально в зависимости от объема работ и ваших требований.',
      pricingRange: 'Ориентировочный диапазон цен:',
      pricingNote: 'Мы с удовольствием подготовим персональное предложение с учетом ваших потребностей и бюджета.',
      downloadPdf: 'Скачать PDF',
      sendEmail: 'Отправить email',

      // Contact status
      contactStatus: {
        not_contacted: 'Не связывались',
        contacted: 'Связались',
        agreed: 'Договорились',
        no_response: 'Нет ответа',
      },

      // Email/WhatsApp
      emailTemplate: 'Шаблон email',
      whatsappTemplate: 'Шаблон WhatsApp',
      subject: 'Тема:',
      body: 'Текст письма:',
      copyTip: 'Скопируйте сообщение и отправьте его напрямую через WhatsApp Web или мобильное приложение.',

      // History
      history: 'История анализов',
      noAnalyses: 'Пока нет анализов',
      deleteConfirm: 'Вы уверены, что хотите удалить этот анализ?',

      // Errors
      analysisFailed: 'Ошибка анализа',
      timeout: 'Превышено время ожидания (60 сек.)',
      tryAgain: 'Попробуйте еще раз',
    },

    // Leads
    leads: {
      title: 'Заявки',
      newLead: 'Новая заявка',
      noLeads: 'Пока нет заявок',
      status: {
        new: 'Новый',
        contacted: 'Связались',
        inProgress: 'В работе',
        completed: 'Завершено',
        rejected: 'Отклонено',
      },
    },

    // Projects
    projects: {
      title: 'Проекты',
      newProject: 'Новый проект',
      noProjects: 'Пока нет проектов',
      client: 'Клиент',
      deadline: 'Дедлайн',
      budget: 'Бюджет',
    },

    // Portfolio
    portfolio: {
      title: 'Портфолио',
      addProject: 'Добавить проект',
      projectName: 'Название проекта',
      projectUrl: 'URL проекта',
      description: 'Описание',
      technologies: 'Технологии',
      image: 'Изображение',
    },

    // Blog
    blog: {
      title: 'Блог',
      newArticle: 'Новая статья',
      articleTitle: 'Название статьи',
      content: 'Содержание',
      published: 'Опубликовано',
      draft: 'Черновик',
    },

    // Invoices
    invoices: {
      title: 'Счета',
      newInvoice: 'Новый счет',
      invoiceNumber: 'Номер счета',
      client: 'Клиент',
      amount: 'Сумма',
      dueDate: 'Срок оплаты',
      paid: 'Оплачено',
      unpaid: 'Не оплачено',
    },

    // Settings
    settingsPage: {
      title: 'Настройки',
      accountSettings: 'Настройки аккаунта',
      changePassword: 'Изменить пароль',
      currentPassword: 'Текущий пароль',
      newPassword: 'Новый пароль',
      confirmPassword: 'Подтвердить пароль',
      languageSettings: 'Настройки языка',
      selectLanguage: 'Выберите язык',
    },
  },
} as const;

export type AdminTranslations = typeof adminTranslations.cs;
