import React, { useEffect, useMemo, useState } from "react";

const CLIENT_TYPES = [
  { key: "frio", label: "Cliente frío", desc: "Interés bajo o genérico. No dejó datos completos o no responde todavía." },
  { key: "calido", label: "Cliente tibio", desc: "Mostró interés claro. Dejó datos y responde en el día. Tiene dudas específicas." },
  { key: "caliente", label: "Cliente caliente", desc: "Intención inmediata. Pide costos/activación o comparte teléfono directo." },
] as const;

const MESSAGE_TYPES = [
  { key: "llamada", label: "Llamada" },
  { key: "whatsapp", label: "Continuar por WhatsApp" },
  { key: "videollamada", label: "Videollamada" },
] as const;

const WA_SUBTYPES = [
  { key: "inicio", label: "Inicio" },
  { key: "recordatorio", label: "Recordatorio" },
  { key: "propuesta", label: "Propuesta" },
  { key: "cierre", label: "Cierre" },
] as const;

const SOURCES = [
  { key: "google_ads", label: "Google Ads" },
  { key: "web", label: "Web" },
  { key: "meta", label: "Meta" },
] as const;

const CAPTURE_BY_SOURCE: Record<string, { key: string; label: string }[]> = {
  google_ads: [
    { key: "formulario", label: "Formulario" },
    { key: "llamada_directa", label: "Llamada directa" },
  ],
  web: [
    { key: "form_hero", label: "Formulario Hero" },
    { key: "form_body", label: "Formulario Body" },
    { key: "form_contacto", label: "Formulario Contacto" },
    { key: "wa_flotante", label: "WhatsApp Flotante" },
    { key: "wa_url_contacto", label: "WhatsApp URL Contacto" },
  ],
  meta: [
    { key: "dm", label: "Mensaje Directo" },
    { key: "form_ads", label: "Formulario Ads" },
    { key: "wa", label: "WhatsApp" },
  ],
};

const ROUTE_BY_SOURCE: Record<string, string[]> = {
  google_ads: ["whatsapp", "telefono"],
  web: ["whatsapp", "telefono", "videollamada"],
  meta: ["whatsapp", "telefono", "videollamada", "dm"],
};

const ROUTE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telefono: "Llamada",
  videollamada: "Videollamada",
  dm: "Mensaje directo",
};

const TEMPLATES: any = {
  whatsapp: {
    inicio: ({ nombre, agente, franja }: any) =>
      `Hola ${nombre || "{Nombre}"}, soy ${agente || "{Agente}"} de ZOCO. Recibí tu interés para cobrar con ZOCO. ¿En qué rubro trabajás y cuánto procesás por mes? Te paso costos finales y te activo en 72 h. ¿Seguimos por acá o preferís una llamada de 10 min hoy ${franja || "{franja}"}?`,
    recordatorio: ({ nombre, tarifa }: any) =>
      `${nombre || "{Nombre}"}, resumen: POS Only One, tarifa final ${tarifa || "{x%}"} y liquidación unificada. ¿Te reservo 10 min hoy {franja} para activarte?`,
    propuesta: ({ rubro, volumen, plan, tarifa }: any) =>
      `Basado en ${rubro || "{rubro}"} y ${volumen || "{volumen}"}, te conviene el plan ${plan || "{plan}"}. Tarifa final ${tarifa || "{x%}"}. Activación asistida y primer cobro hoy. ¿Lo vemos en 10 min?`,
    cierre: () =>
      `Perfecto. Para avanzar hoy necesito CUIT, DNI y dirección de entrega. Te asigno terminal y coordinamos activación.`,
  },
  llamada: {
    apertura: ({ agente }: any) => `Soy ${agente || "{Agente}"} de ZOCO. ¿Tenés 10 min para optimizar tus cobros?`,
    discovery: () => `Quiero entender tu operación: rubro, volumen, ticket promedio, medios actuales, necesidades de cuotas/QR/link.`,
    propuesta: ({ plan, tarifa }: any) => `Según lo que me contás, el plan ${plan || "{plan}"} te deja tarifa final ${tarifa || "{x%}"} con liquidación unificada y soporte ≤15 min.`,
    cierre: () => `Si te sirve, hoy iniciamos: CUIT, DNI y dirección. Activación 10–15 min y probamos el primer cobro.`,
  },
  videollamada: {
    agenda: () => `Agenda: objetivos → demo de panel → costos → activación/logística.`,
    cierre: ({ plan, tarifa }: any) => `Cerramos con plan ${plan || "{plan}"}, tarifa final ${tarifa || "{x%}"} y activación esta semana. Te envío checklist KYC y seguimiento por WhatsApp.`,
  },
};

const CLIENT_GUIDE: Record<string, any> = {
  frio: {
    caracteristicas: `Apenas mostró interés, puede estar comparando o curioseando. Sin urgencia ni decisión firme.`,
    objetivo: `Generar confianza inicial y despertar curiosidad sin presionar.`,
    detectas: [
      "Usa frases generales sin urgencia.",
      "Pregunta cosas básicas sin dar datos concretos.",
      "Parece más curioso que decidido.",
    ],
    mensajes: [
      "Hola, me gustaría saber qué hacen.",
      "¿Qué servicios ofrecen?",
      "Estoy viendo opciones, quiero info.",
    ],
    interpretacion: `El cliente no está seguro de necesitar ZOCO. Explora o compara.`,
    ejemplos: {
      whatsapp: `Hola, soy Marum de ZOCO. Nuestro modelo no tiene costos de servicio ni contrato y con documentación básica ya podés operar. ¿Preferís seguir por acá o lo vemos por llamada o videollamada?`,
      llamada: `Hola [Nombre], ¿cómo estás? Te hablo de ZOCO. En nuestro servicio no tenés costos fijos y tus ventas se acreditan en 24 h débito y 48 h crédito en una sola transferencia. ¿Cómo estás cobrando hoy en tu negocio?\n\n→ Abrir conversación para investigar situación actual.`,
      videollamada: `Introducción:\nHola [Nombre], soy Marum de ZOCO. Gracias por sumarte. Me gustaría conocerte un poco antes de mostrarte cómo trabajamos.\n\nInvestigación:\n¿Cómo están cobrando? ¿Usan algún procesador o todavía no implementaron?\n\nPresentación:\nCon lo que me contás, te muestro nuestro panel y la trazabilidad completa de cada operación.`,
    },
  },
  calido: {
    caracteristicas: `Interés real con preguntas específicas. Menciona negocio, condición fiscal o forma de cobro. Tiene dudas de costos o plazos.`,
    objetivo: `Resolver dudas, reforzar confianza y acercar al cierre.`,
    detectas: [
      "Pregunta cosas específicas.",
      "Menciona rubro/condición fiscal/forma de cobro.",
      "Dudas concretas sobre costos o plazos.",
    ],
    mensajes: [
      "Soy monotributista, ¿qué necesito para empezar?",
      "¿Cuánto descuentan por operación?",
      "¿En cuánto tiempo se acredita?",
      "Tengo un bar, quiero saber cómo funciona la tarjeta de crédito.",
    ],
    interpretacion: `Considera trabajar con ZOCO pero necesita resolver objeciones.`,
    ejemplos: {
      whatsapp: `Sobre costos: en ZOCO las retenciones se aplican solo sobre la comisión, no sobre el total de la venta. Además, nuestros costos de financiación son competitivos. ¿Querés que lo veamos por acá o por llamada/videollamada?`,
      llamada: `Vi que estabas evaluando costos. En ZOCO las retenciones van solo sobre la comisión, no sobre el total. Eso te deja más neto por operación. Si hoy vendés con débito, el miércoles lo tenés en cuenta en una sola transferencia. ¿Te envío documentación para avanzar?`,
      videollamada: `Intro:\nHola [Nombre], buenísimo hablar hoy. Primero confirmo qué buscás.\n\nInvestigación:\n¿Qué es más importante ahora: rapidez para cobrar, control simple o costo por operación?\n\nPresentación + Cierre:\nAcreditaciones 24/48 h en una transferencia y trazabilidad completa en el panel. Te envío ficha de ABM y documentación para completar y quedar listo.`,
    },
  },
  caliente: {
    caracteristicas: `Habla de empezar ya. Pide pasos concretos, documentación, tiempos de alta o cómo obtener terminal/panel.`,
    objetivo: `Cerrar rápido sin abrir dudas nuevas.`,
    detectas: ["Habla de avanzar ya.", "Pregunta documentación.", "Consulta cómo pedir POS o activar servicio."],
    mensajes: [
      "Quiero pedir el POS, ¿cómo hago?",
      "¿Qué documentación necesitan para darme de alta?",
      "Quiero empezar con ustedes, ¿cómo avanzo?",
    ],
    interpretacion: `Está convencido. Falta guiar el cierre con documentación y ficha de ABM.`,
    ejemplos: {
      whatsapp: `Excelente. Te envío documentación (AFIP, rentas y CBU verificado) + ficha de ABM para completar y quedar listo para operar. ¿Seguimos por acá o por llamada/videollamada para guiarte?`,
      llamada: `Genial que quieras avanzar. Ahora te envío documentación + ficha de ABM. Al completar, activamos y en 24/48 h podés acreditar tus primeras ventas.`,
      videollamada: `Intro:\nHola [Nombre], soy Marum de ZOCO. Te muestro rápido cómo vas a trabajar con nosotros.\n\nPresentación:\nPanel con ventas, fechas y medios, más trazabilidad completa.\n\nCierre:\nTe envío documentación + ficha de ABM y en 24/48 h ya estás acreditando.`,
    },
  },
};

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 border border-emerald-200">{children}</span>;
}

function Section({ title, children, right }: any) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-slate-900 text-base font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function InfoCard({ title, children }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs tracking-wide text-slate-500 font-semibold uppercase">{title}</div>
      <div className="mt-1 text-sm text-slate-800 whitespace-pre-line">{children}</div>
    </div>
  );
}

function Step({ title, children, action }: { title: string; children: any; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="font-semibold text-slate-800 text-sm">{title}</div>
        {action}
      </div>
      <div className="mt-2 text-sm text-slate-700 space-y-2">{children}</div>
    </div>
  );
}

export default function App() {
  const [source, setSource] = useState("google_ads");
  const [capture, setCapture] = useState<string>(CAPTURE_BY_SOURCE.google_ads[0].key);
  const [route, setRoute] = useState<string>(ROUTE_BY_SOURCE.google_ads[0]);
  const [clientType, setClientType] = useState("calido");
  const [messageType, setMessageType] = useState("whatsapp");
  const [waSubtype, setWaSubtype] = useState("inicio");

  const PERSON_TYPES = [
    { key: "fisica", label: "Persona Física" },
    { key: "juridica", label: "Persona Jurídica" },
  ] as const;
  const [personType, setPersonType] = useState("fisica");
  const [docsView, setDocsView] = useState<"lista" | "imagen">("lista");

  const DOCS: Record<string, string[]> = {
    fisica: [
      "DNI del titular",
      "Constancia de CBU a su nombre",
      "Constancia de rentas actualizada",
      "Constancia de AFIP actualizada",
      "Ficha de alta firmada",
    ],
    juridica: [
      "Estatuto social",
      "DNI del representante legal o apoderado",
      "Ficha completa y firmada por apoderado o representante",
      "Constancia de CBU a nombre de la razón social",
      "Constancia de AFIP actualizada",
      "Constancia de rentas actualizada",
    ],
  };

  const SALUDOS = {
    whatsapp: {
      inicial: [
        "Hola {Nombre}, soy {Agente} de ZOCO. Gracias por escribirnos.",
        "Hola {Nombre}. Habla {Agente} de ZOCO. Vi tu consulta y te ayudo ahora.",
        "Hola {Nombre}, ¿cómo estás? Te saluda {Agente} de ZOCO.",
      ],
      final: [
        "Quedo atento acá. Si preferís llamada de 10 min, te marco cuando te quede bien.",
        "Gracias por tu tiempo. Te dejo todo por escrito y coordinamos el alta.",
        "Cualquier duda me escribís y avanzamos hoy mismo.",
      ],
    },
    llamada: {
      inicial: [
        "Hola {Nombre}, soy {Agente} de ZOCO. ¿Tenés 2 minutos para optimizar tus cobros?",
        "{Nombre}, te hablo de ZOCO. Llamo por tu consulta para mejorar medios de pago.",
        "{Nombre}, ¿cómo va? {Agente} de ZOCO. Te llamo para ayudarte a empezar.",
      ],
      final: [
        "Te envío ahora la documentación por WhatsApp y quedo atento.",
        "Coordinemos la activación. Te mando el resumen y seguimos.",
        "Cierro con el checklist por WhatsApp y te acompaño en el alta.",
      ],
    },
    videollamada: {
      inicial: [
        "Hola {Nombre}, soy {Agente} de ZOCO. Vemos objetivos y te muestro el panel.",
        "Buen día {Nombre}. {Agente} de ZOCO. Hacemos demo corta y costos.",
        "{Nombre}, gracias por sumarte. Arrancamos con demo y después próximos pasos.",
      ],
      final: [
        "Te envío checklist y documentación. Activamos esta semana.",
        "Queda claro el panel y los costos. Te mando el alta para completar hoy.",
        "Te comparto grabación y seguimos con el envío de la terminal.",
      ],
    },
  } as const;

  const INVESTIGACION = [
    "¿Cuál es tu rubro y ticket promedio?",
    "¿Cuánto procesás por mes y con qué medios cobrás hoy?",
    "¿Necesitás cuotas, link de pago o QR? ¿Quién concilia?",
  ];

  const BENEFICIOS: [string, string][] = [
    ["Sin costos fijos ni contrato", "Pagás solo por operación"],
    ["Liquidación unificada", "Una transferencia con todo lo cobrado"],
    ["Acreditación 24h débito / 48h crédito", "Flujo de caja predecible"],
    ["POS Only One + QR + Link", "Más medios en un equipo"],
    ["Cuotas con principales tarjetas", "Mayor ticket promedio"],
    ["Panel con trazabilidad", "Visibilidad completa"],
    ["Soporte ≤15 min por WhatsApp", "Resolución rápida"],
  ];

  const BENEFICIOS_DOWNLOAD = "sandbox:/mnt/data/Beneficios_ZOCO.csv";
  const OBJECIONES_DOWNLOAD = "sandbox:/mnt/data/Manual_Objecciones_ZOCO.txt";

  const [nombre, setNombre] = useState("");
  const [agente, setAgente] = useState("");
  const [franja, setFranja] = useState("hoy 16:00–18:00");
  const [plan, setPlan] = useState("Only One");
  const [tarifa, setTarifa] = useState("x%");
  const [rubro, setRubro] = useState("");
  const [volumen, setVolumen] = useState("");
  const [telefono, setTelefono] = useState("");
  const [overrideScript, setOverrideScript] = useState<string>("");

  const [postNombre, setPostNombre] = useState("");
  const [postApellido, setPostApellido] = useState("");
  const [postCUIT, setPostCUIT] = useState("");
  const [postEmail, setPostEmail] = useState("");
  const [postTel, setPostTel] = useState("");
  const [postObs, setPostObs] = useState("");
  const [postRubro, setPostRubro] = useState("");
  const [postVol, setPostVol] = useState("");
  const [califica, setCalifica] = useState<null | boolean>(null);
  const [motivoNo, setMotivoNo] = useState("");
  const [remarketingFecha, setRemarketingFecha] = useState("");
  const [abmTo, setAbmTo] = useState("");
  const [acCc, setAcCc] = useState("");

  const csvHeaders = [
    "Fecha",
    "Nombre y apellido",
    "CUIT",
    "Email",
    "Teléfono",
    "Rubro",
    "Volumen estimado",
    "Origen",
    "Punto de captura",
    "Ruteo",
    "Tipo cliente",
    "Tipo de persona",
    "Califica",
    "Motivo no califica",
    "Próximo contacto",
    "Observaciones",
  ];

  const csvRow = useMemo(() => {
    const srcLabel = SOURCES.find((s) => s.key === source)?.label || "";
    const capLabel = (CAPTURE_BY_SOURCE[source] || []).find((c) => c.key === capture)?.label || "";
    const routeLabel = ROUTE_LABELS[route] || "";
    const clienteLabel = CLIENT_TYPES.find((c) => c.key === clientType)?.label || "";
    const personaLabel = PERSON_TYPES.find((p) => p.key === personType)?.label || "";
    return [
      new Date().toISOString().slice(0, 10),
      `${postNombre} ${postApellido}`.trim(),
      postCUIT,
      postEmail,
      postTel,
      postRubro,
      postVol,
      srcLabel,
      capLabel,
      routeLabel,
      clienteLabel,
      personaLabel,
      califica === null ? "" : califica ? "Sí" : "No",
      motivoNo,
      remarketingFecha,
      postObs,
    ];
  }, [postNombre, postApellido, postCUIT, postEmail, postTel, postRubro, postVol, source, capture, route, clientType, personType, califica, motivoNo, remarketingFecha, postObs]);

  const csvContent = useMemo(() => {
    const esc = (v: any) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
    return csvHeaders.join(",") + "\n" + csvRow.map(esc).join(",");
  }, [csvRow]);

  const [csvUrl, setCsvUrl] = useState("");
  useEffect(() => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setCsvUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [csvContent]);

  const emailSubject = useMemo(() => `Lead calificado – ${postNombre} ${postApellido} – ${personType === "fisica" ? "PF" : "PJ"}`, [postNombre, postApellido, personType]);

  const emailBody = useMemo(() => {
    const srcLabel = SOURCES.find((s) => s.key === source)?.label || "";
    const capLabel = (CAPTURE_BY_SOURCE[source] || []).find((c) => c.key === capture)?.label || "";
    const routeLabel = ROUTE_LABELS[route] || "";
    const clienteLabel = CLIENT_TYPES.find((c) => c.key === clientType)?.label || "";
    const personaLabel = PERSON_TYPES.find((p) => p.key === personType)?.label || "";
    return `* Recordatorio: revisar requisitos de ${personaLabel} antes de enviar.\n\nDatos del cliente\nNombre y apellido: ${postNombre} ${postApellido}\nCUIT: ${postCUIT}\nEmail: ${postEmail}\nTeléfono: ${postTel}\nRubro: ${postRubro}\nVolumen estimado: ${postVol}\nOrigen: ${srcLabel} / ${capLabel}\nRuteo: ${routeLabel}\nTipo de cliente: ${clienteLabel}\nTipo de persona: ${personaLabel}\nObservaciones: ${postObs}`;
  }, [postNombre, postApellido, postCUIT, postEmail, postTel, postRubro, postVol, source, capture, route, clientType, personType, postObs]);

  const mailtoLink = useMemo(() => {
    if (!abmTo) return "";
    const params = new URLSearchParams();
    if (acCc) params.set("cc", acCc);
    params.set("subject", emailSubject);
    params.set("body", emailBody);
    return `mailto:${encodeURIComponent(abmTo)}?${params.toString()}`;
  }, [abmTo, acCc, emailSubject, emailBody]);

  useEffect(() => {
    const caps = CAPTURE_BY_SOURCE[source] || [];
    if (!caps.find((c) => c.key === capture)) setCapture(caps[0]?.key || "");
    const routes = ROUTE_BY_SOURCE[source] || [];
    if (!routes.includes(route)) setRoute(routes[0] || "");
  }, [source]);

  const autoScript = useMemo(() => {
    if (messageType === "whatsapp") {
      return TEMPLATES.whatsapp[waSubtype as keyof typeof TEMPLATES.whatsapp]({ nombre, agente, franja, plan, tarifa, rubro, volumen });
    }
    if (messageType === "llamada") {
      return [TEMPLATES.llamada.apertura({ agente }), TEMPLATES.llamada.discovery({}), TEMPLATES.llamada.propuesta({ plan, tarifa }), TEMPLATES.llamada.cierre({})].join("\n\n");
    }
    return [TEMPLATES.videollamada.agenda({}), TEMPLATES.videollamada.cierre({ plan, tarifa })].join("\n\n");
  }, [messageType, waSubtype, nombre, agente, franja, plan, tarifa, rubro, volumen]);

  const script = overrideScript || autoScript;

  const waLink = useMemo(() => {
    const phone = (telefono || "").replace(/[^0-9]/g, "");
    if (!phone || messageType !== "whatsapp") return "";
    return `https://wa.me/${phone}?text=${encodeURIComponent(script)}`;
  }, [telefono, messageType, script]);

  const guide = CLIENT_GUIDE[clientType];

  const Summary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
      <div>
        <div className="font-medium">Resumen de flujo</div>
        <div className="mt-1 space-y-1">
          <div>Origen: <Badge>{SOURCES.find((s) => s.key === source)?.label}</Badge></div>
          <div>Punto de captura: <Badge>{(CAPTURE_BY_SOURCE[source] || []).find((c) => c.key === capture)?.label}</Badge></div>
          <div>Ruteo inicial: <Badge>{ROUTE_LABELS[route] || ""}</Badge></div>
          <div>Cliente: <Badge>{CLIENT_TYPES.find((c) => c.key === clientType)?.label}</Badge></div>
          <div>Tipo de mensaje: <Badge>{MESSAGE_TYPES.find((m) => m.key === messageType)?.label}</Badge></div>
          {messageType === "whatsapp" && (<div>Subtipo WhatsApp: <Badge>{WA_SUBTYPES.find((w) => w.key === waSubtype)?.label}</Badge></div>)}
        </div>
      </div>
      <div>
        <div className="font-medium">Recomendaciones</div>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Responder ≤ 15 min. Si no responde: T+1h recordatorio, T+24h caso de uso, T+3d llamada.</li>
          <li>Terminar cada contacto con próxima acción y fecha.</li>
          <li>Registrar todo en la planilla de Leads.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="w-full space-y-6">
        <header className="flex items-center justify-between flex-col gap-2 sm:flex-row">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ZOCO · Flow Interactivo de Captura → Contacto</h1>
          <Badge>Versión interactiva</Badge>
        </header>

        <Section title="1) Origen de tráfico">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-600">Origen</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                {SOURCES.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Punto de captura</label>
              <select value={capture} onChange={(e) => setCapture(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                {(CAPTURE_BY_SOURCE[source] || []).map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Ruteo inicial</label>
              <select value={route} onChange={(e) => setRoute(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                {(ROUTE_BY_SOURCE[source] || []).map((r) => (<option key={r} value={r}>{ROUTE_LABELS[r]}</option>))}
              </select>
            </div>
          </div>
        </Section>

        <Section title="2) Identificación del cliente" right={<Badge>Frío · Tibio · Caliente</Badge>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {CLIENT_TYPES.map((ct) => (
              <button key={ct.key} onClick={() => { setClientType(ct.key); setOverrideScript(""); }} className={`text-left rounded-2xl border p-4 hover:shadow-sm ${clientType === ct.key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <div className="font-medium">{ct.label}</div>
                <div className="text-sm text-slate-600 mt-1">{ct.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <InfoCard title="Características">{guide.caracteristicas}</InfoCard>
            <InfoCard title="Objetivo">{guide.objetivo}</InfoCard>
            <InfoCard title="Cómo lo detectás">{`• ${guide.detectas.join("\n• ")}`}</InfoCard>
            <InfoCard title="Mensajes típicos">{`“${guide.mensajes.join("”\n“")}”`}</InfoCard>
            <InfoCard title="Interpretación">{guide.interpretacion}</InfoCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {(["whatsapp", "llamada", "videollamada"] as const).map((k) => (
              <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-800 capitalize">Ejemplo práctico {k}</div>
                <textarea readOnly value={guide.ejemplos[k]} className="mt-2 w-full h-40 rounded-xl border-slate-300 text-sm p-3 whitespace-pre-wrap" />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(guide.ejemplos[k])} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm">Copiar</button>
                  <button onClick={() => { setMessageType(k as any); setOverrideScript(guide.ejemplos[k]); }} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-600 text-sm">Usar en generador</button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3) Tipo de mensaje">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MESSAGE_TYPES.map((mt) => (
              <button key={mt.key} onClick={() => { setMessageType(mt.key); setOverrideScript(""); }} className={`text-left rounded-2xl border p-4 hover:shadow-sm ${messageType === mt.key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <div className="font-medium">{mt.label}</div>
                <div className="text-sm text-slate-600 mt-1">{mt.key === "whatsapp" ? "Texto listo para enviar" : mt.key === "llamada" ? "Apertura + discovery + propuesta" : "Agenda de demo y cierre"}</div>
              </button>
            ))}
          </div>

          {messageType === "whatsapp" && (
            <div className="mt-4">
              <label className="text-sm text-slate-600">Subtipo de mensaje de WhatsApp</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {WA_SUBTYPES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setWaSubtype(s.key);
                      setOverrideScript("");
                    }}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      waSubtype === s.key
                        ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="3.1) Procedimiento por canal">
          <div className="mb-3 flex flex-wrap gap-3 items-center">
            <div className="text-sm">Tipo de persona:</div>
            {PERSON_TYPES.map((p) => (
              <button
                key={p.key}
                onClick={() => setPersonType(p.key)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  personType === p.key
                    ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="ml-auto text-xs text-slate-500">Descargas en el chat: Tabla de beneficios y Manual de objeciones.</div>
          </div>

          {messageType === "whatsapp" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Step title="Saludo inicial" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.whatsapp.inicial.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
              <Step title="Investigación">
                <ul className="list-disc list-inside">{INVESTIGACION.map((q, i) => (<li key={i}>{q}</li>))}</ul>
              </Step>
              <Step title="Muestra de beneficios" action={<a className="text-emerald-700 underline" href={BENEFICIOS_DOWNLOAD}>Descargar CSV</a>}>
                <table className="w-full text-sm"><tbody>{BENEFICIOS.map((b, i) => (<tr key={i}><td className="py-1 pr-3 font-medium">{b[0]}</td><td className="py-1 text-slate-600">{b[1]}</td></tr>))}</tbody></table>
              </Step>
              <Step title="Posibles objeciones" action={<a className="text-emerald-700 underline" href={OBJECIONES_DOWNLOAD}>Descargar manual</a>}>
                <div>Precio, tiempos, integración, contratos, seguridad, proveedor actual, tiempo, régimen, logística, documentación.</div>
              </Step>
              <Step title="Solicitud de documentación">
                <div className="flex items-center gap-3 text-sm">
                  <div>Vista:</div>
                  <button
                    onClick={() => setDocsView("lista")}
                    className={`px-2 py-1 rounded-md border ${
                      docsView === "lista"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setDocsView("imagen")}
                    className={`px-2 py-1 rounded-md border ${
                      docsView === "imagen"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    Imagen
                  </button>
                </div>
                {docsView === "lista" ? (<ul className="mt-2 list-disc list-inside">{DOCS[personType].map((d, i) => (<li key={i}>{d}</li>))}</ul>) : (<div className="mt-2 text-xs text-slate-500">Ver imagen en el chat adjunto para {personType === "fisica" ? "Persona Física" : "Persona Jurídica"}.</div>)}
              </Step>
              <Step title="Saludo final" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.whatsapp.final.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
            </div>
          )}

          {messageType === "llamada" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Step title="Speech inicial" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.llamada.inicial.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
              <Step title="Investigación">
                <ul className="list-disc list-inside">{INVESTIGACION.map((q, i) => (<li key={i}>{q}</li>))}</ul>
              </Step>
              <Step title="Muestra de beneficios" action={<a className="text-emerald-700 underline" href={BENEFICIOS_DOWNLOAD}>Descargar CSV</a>}>
                <table className="w-full text-sm"><tbody>{BENEFICIOS.map((b, i) => (<tr key={i}><td className="py-1 pr-3 font-medium">{b[0]}</td><td className="py-1 text-slate-600">{b[1]}</td></tr>))}</tbody></table>
              </Step>
              <Step title="Posibles objeciones" action={<a className="text-emerald-700 underline" href={OBJECIONES_DOWNLOAD}>Descargar manual</a>}>
                <div>Precio, tiempos, integración, contratos, seguridad, proveedor actual, tiempo, régimen, logística, documentación.</div>
              </Step>
              <Step title="Solicitud de documentación">
                {docsView === "lista" ? (<ul className="mt-2 list-disc list-inside">{DOCS[personType].map((d, i) => (<li key={i}>{d}</li>))}</ul>) : (<div className="mt-2 text-xs text-slate-500">Ver imagen en el chat adjunto para {personType === "fisica" ? "Persona Física" : "Persona Jurídica"}.</div>)}
              </Step>
              <Step title="Speech final" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.llamada.final.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
            </div>
          )}

          {messageType === "videollamada" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Step title="Speech inicial" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.videollamada.inicial.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
              <Step title="Investigación">
                <ul className="list-disc list-inside">{INVESTIGACION.map((q, i) => (<li key={i}>{q}</li>))}</ul>
              </Step>
              <Step title="DEMO · Muestra de beneficios">
                <ul className="list-disc list-inside">
                  <li>1) Panel Dashboard: ventas, estados, liquidaciones.</li>
                  <li>2) Simulador: ejemplo de comisión y plazos.</li>
                  <li>3) Ventas Unificadas: una transferencia con todo.</li>
                </ul>
              </Step>
              <Step title="Posibles objeciones" action={<a className="text-emerald-700 underline" href={OBJECIONES_DOWNLOAD}>Descargar manual</a>}>
                <div>Precio, tiempos, integración, contratos, seguridad, proveedor actual, tiempo, régimen, logística, documentación.</div>
              </Step>
              <Step title="Solicitud de documentación">
                {docsView === "lista" ? (<ul className="mt-2 list-disc list-inside">{DOCS[personType].map((d, i) => (<li key={i}>{d}</li>))}</ul>) : (<div className="mt-2 text-xs text-slate-500">Ver imagen en el chat adjunto para {personType === "fisica" ? "Persona Física" : "Persona Jurídica"}.</div>)}
              </Step>
              <Step title="Speech final" action={<Badge>3 variantes</Badge>}>
                <ul className="list-disc list-inside">{SALUDOS.videollamada.final.map((t, i) => (<li key={i}>{t}</li>))}</ul>
              </Step>
            </div>
          )}
        </Section>

        <Section title="3.2) Post contacto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Step title="Ficha de cliente potencial">
              <div className="grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Nombre" value={postNombre} onChange={(e) => setPostNombre(e.target.value)} className="rounded-xl border-slate-300" />
                  <input placeholder="Apellido" value={postApellido} onChange={(e) => setPostApellido(e.target.value)} className="rounded-xl border-slate-300" />
                </div>
                <input placeholder="CUIT" value={postCUIT} onChange={(e) => setPostCUIT(e.target.value)} className="rounded-xl border-slate-300" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Email" value={postEmail} onChange={(e) => setPostEmail(e.target.value)} className="rounded-xl border-slate-300" />
                  <input placeholder="Teléfono" value={postTel} onChange={(e) => setPostTel(e.target.value)} className="rounded-xl border-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Rubro" value={postRubro} onChange={(e) => setPostRubro(e.target.value)} className="rounded-xl border-slate-300" />
                  <input placeholder="Volumen estimado" value={postVol} onChange={(e) => setPostVol(e.target.value)} className="rounded-xl border-slate-300" />
                </div>
                <textarea placeholder="Observaciones" value={postObs} onChange={(e) => setPostObs(e.target.value)} className="rounded-xl border-slate-300 h-20" />
              </div>
            </Step>

            <Step title="Calificación y ruteo final">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">¿Califica?</span>
                <button onClick={() => setCalifica(true)} className={`px-3 py-1 rounded-full text-sm border ${califica === true ? "bg-emerald-50 text-emerald-700 border-emerald-600" : "bg-white text-slate-700 border-slate-300"}`}>Sí</button>
                <button onClick={() => setCalifica(false)} className={`px-3 py-1 rounded-full text-sm border ${califica === false ? "bg-rose-50 text-rose-700 border-rose-600" : "bg-white text-slate-700 border-slate-300"}`}>No</button>
              </div>

              {califica === false && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">Pasará a Clientes de Remarketing.</div>
                  <input placeholder="Motivo de no calificación" value={motivoNo} onChange={(e) => setMotivoNo(e.target.value)} className="rounded-xl border-slate-300 w-full" />
                  <div className="text-sm">Próximo contacto (fecha)</div>
                  <input type="date" value={remarketingFecha} onChange={(e) => setRemarketingFecha(e.target.value)} className="rounded-xl border-slate-300" />
                  <div className="text-xs text-slate-500">Descargá la ficha y enviá a la lista de Clientes de Remarketing.</div>
                </div>
              )}

              {califica === true && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">Enviar mail a <b>ABM</b> con copia a <b>Atención al Cliente</b>. <span className="text-amber-700">* Revisar requisitos de {personType === "fisica" ? "Persona Física" : "Persona Jurídica"} antes de enviar.</span></div>
                  <input placeholder="Email ABM" value={abmTo} onChange={(e) => setAbmTo(e.target.value)} className="rounded-xl border-slate-300 w-full" />
                  <input placeholder="CC Atención al Cliente" value={acCc} onChange={(e) => setAcCc(e.target.value)} className="rounded-xl border-slate-300 w-full" />
                  <div className="text-sm font-medium">Asunto</div>
                  <input readOnly value={emailSubject} className="rounded-xl border-slate-300 w-full" />
                  <div className="text-sm font-medium mt-2">Cuerpo del mail</div>
                  <textarea readOnly value={emailBody} className="rounded-xl border-slate-300 w-full h-28" />
                  <div className="flex items-center gap-2 mt-2">
                    {mailtoLink && (<a href={mailtoLink} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm">Preparar correo</a>)}
                    <a href={csvUrl} download={`ZOCO_lead_${postNombre || "cliente"}.csv`} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-600 text-sm">Descargar ficha CSV</a>
                  </div>
                </div>
              )}
            </Step>

            <Step title="Notas y exportación">
              <div className="text-sm text-slate-600">Registrar en planilla maestra. Si no califica, mover a <b>Clientes de Remarketing</b>. Si califica, enviar mail a <b>ABM</b> con <b>CC Atención al Cliente</b>.</div>
            </Step>
          </div>
        </Section>

        <Section title="4) Personaliza y copia">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-600">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="Nombre" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Agente</label>
              <input value={agente} onChange={(e) => setAgente(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="Tu nombre" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Franja horaria sugerida</label>
              <input value={franja} onChange={(e) => setFranja(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="hoy 16:00–18:00" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Plan</label>
              <input value={plan} onChange={(e) => setPlan(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Tarifa final</label>
              <input value={tarifa} onChange={(e) => setTarifa(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="ej: 4.99%" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Rubro</label>
              <input value={rubro} onChange={(e) => setRubro(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Volumen mensual</label>
              <input value={volumen} onChange={(e) => setVolumen(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="ARS" />
            </div>
            {messageType === "whatsapp" && (
              <div>
                <label className="text-sm text-slate-600">Teléfono (solo números con país)</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 w-full rounded-xl border-slate-300" placeholder="54911..." />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm text-slate-600">Guion sugerido</label>
            <textarea value={script} readOnly className="mt-1 w-full h-44 rounded-xl border-slate-300 font-mono text-sm p-3" />
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => navigator.clipboard.writeText(script)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Copiar guion</button>
              {waLink && (<a href={waLink} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-600 hover:bg-emerald-100">Abrir WhatsApp</a>)}
            </div>
          </div>
        </Section>

        <Section title="5) Resumen y buenas prácticas" right={<Badge>SLA ≤ 15 min</Badge>}>
          <Summary />
        </Section>

        <footer className="text-xs text-slate-500 pt-4">Basado en el diagrama y las plantillas provistas. Esta herramienta no guarda datos.</footer>
      </div>
    </div>
  );
}
