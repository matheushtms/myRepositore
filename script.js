/* ==========================================================================
   M_T_MALTA // CORE CONTROL UNIT (SCRIPT REVISED)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // -------------------------------------------------------------
  // 1. CONFIGURAÇÕES GERAIS E ESTADO
  // -------------------------------------------------------------
  const state = {
    audioEnabled: false,
    terminalHistory: [],
    pingInterval: null,
    matrixActive: false,
    typingActive: false,
    lang: "PT", // Idiomas: "PT" ou "EN"
    currProject: 0,
    projectInterval: null
  };

  // -------------------------------------------------------------
  // 2. SINTETIZADOR DE ÁUDIO TÁTICO (WEB AUDIO API)
  // -------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freqs, type = 'sine', duration = 0.1, gainSequence = [0.1, 0]) {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      
      if (Array.isArray(freqs)) {
        osc.frequency.setValueAtTime(freqs[0], now);
        if (freqs.length > 1) {
          osc.frequency.exponentialRampToValueAtTime(freqs[1], now + duration);
        }
      } else {
        osc.frequency.setValueAtTime(freqs, now);
      }

      gainNode.gain.setValueAtTime(gainSequence[0], now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(gainSequence[1], 0.0001), now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Falha ao inicializar áudio:", e);
    }
  }

  const sounds = {
    hover: () => playTone([800, 1200], 'sine', 0.05, [0.03, 0.001]),
    click: () => playTone([400, 900], 'triangle', 0.08, [0.06, 0.001]),
    typing: () => playTone([600, 750], 'square', 0.03, [0.02, 0.001]),
    granted: () => {
      playTone([400, 800], 'sine', 0.1, [0.08, 0.01]);
      setTimeout(() => playTone([800, 1600], 'sine', 0.15, [0.08, 0.01]), 80);
    },
    denied: () => {
      playTone([220, 110], 'sawtooth', 0.25, [0.1, 0.001]);
    },
    matrix: () => {
      playTone([80, 400], 'sawtooth', 0.4, [0.08, 0.001]);
    }
  };

  // Botão de Áudio
  const audioBtn = document.getElementById("audio-toggle");
  audioBtn.addEventListener("click", () => {
    state.audioEnabled = !state.audioEnabled;
    if (state.audioEnabled) {
      audioBtn.classList.add("value-active");
      audioBtn.querySelector(".audio-icon").textContent = "🔊";
      audioBtn.querySelector(".audio-text").textContent = "FX_ON";
      initAudio();
      sounds.granted();
    } else {
      audioBtn.classList.remove("value-active");
      audioBtn.querySelector(".audio-icon").textContent = "🔇";
      audioBtn.querySelector(".audio-text").textContent = "FX_OFF";
    }
  });

  // Associar áudio genérico
  function bindAudioEvents(elements) {
    elements.forEach(el => {
      el.addEventListener("mouseenter", () => sounds.hover());
      el.addEventListener("click", () => sounds.click());
    });
  }
  bindAudioEvents(document.querySelectorAll("a, button, .clickable, .btn-prompt"));

  // Simular Latência
  const pingVal = document.getElementById("ping-val");
  state.pingInterval = setInterval(() => {
    const deviation = Math.floor(Math.random() * 8) - 4;
    const currentPing = Math.max(5, 12 + deviation);
    if (pingVal) pingVal.textContent = `${currentPing}ms`;
  }, 3000);

  // -------------------------------------------------------------
  // 3. CANVAS INTERATIVO: MOTO VORTEX GRAVITACIONAL DE PARTÍCULAS
  // -------------------------------------------------------------
  const canvas = document.getElementById("neural-canvas");
  const ctx = canvas.getContext("2d");
  
  let particles = [];
  const maxParticles = 140;
  const mouse = { x: null, y: null, radius: 220, isDown: false };
  
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("mousedown", () => { mouse.isDown = true; });
  window.addEventListener("mouseup", () => { mouse.isDown = false; });

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class InteractiveParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * canvas.width : Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.8;
      
      // Cores em tons cibernéticos
      const colorRoll = Math.random();
      if (colorRoll > 0.85) {
        this.color = "rgba(255, 0, 127, 0.65)"; // Rosa Neon
      } else if (colorRoll > 0.6) {
        this.color = "rgba(245, 158, 11, 0.6)"; // Amber Neon
      } else {
        this.color = "rgba(0, 240, 255, 0.65)"; // Ciano Neon
      }

      // Física orbital base
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * 280 + 50;
      this.angularSpeed = (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
      
      // Velocidades lineares para repulsão
      this.vx = 0;
      this.vy = 0;
      this.friction = 0.95;
    }

    update() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Movimento orbital padrão em repouso
      this.angle += this.angularSpeed;
      let targetX = centerX + Math.cos(this.angle) * this.radius;
      let targetY = centerY + Math.sin(this.angle) * this.radius;

      // Interação ativa do mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          
          if (mouse.isDown) {
            // Explosão Repulsiva (Mousedown)
            this.vx -= (dx / dist) * force * 15;
            this.vy -= (dy / dist) * force * 15;
          } else {
            // Sucção e Vortex (Orbitando o mouse)
            // Força de atração radial
            this.vx += (dx / dist) * force * 0.45;
            this.vy += (dy / dist) * force * 0.45;
            
            // Força de órbita tangencial (Vortex rotativo)
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            this.vx += tangentX * force * 1.5;
            this.vy += tangentY * force * 1.5;
          }
        }
      }

      // Aplicar forças e atrito
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= this.friction;
      this.vy *= this.friction;

      // Retornar suavemente à órbita padrão de descanso se o mouse estiver longe
      const orbitStrength = 0.02;
      this.x += (targetX - this.x) * orbitStrength;
      this.y += (targetY - this.y) * orbitStrength;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Inicializar partículas
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new InteractiveParticle());
  }

  // Matrix Rain Rain variables
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*+=?@".split("");
  const fontSize = 14;
  let matrixColumns = [];

  function initMatrix() {
    matrixColumns = [];
    const columnsCount = Math.floor(canvas.width / fontSize);
    for (let i = 0; i < columnsCount; i++) {
      matrixColumns.push(1);
    }
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(3, 7, 18, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#0f0";
    ctx.font = fontSize + "px monospace";
    
    for (let i = 0; i < matrixColumns.length; i++) {
      const text = alphabet[Math.floor(Math.random() * alphabet.length)];
      const x = i * fontSize;
      const y = matrixColumns[i] * fontSize;
      
      ctx.fillText(text, x, y);
      
      if (y > canvas.height && Math.random() > 0.975) {
        matrixColumns[i] = 0;
      }
      matrixColumns[i]++;
    }
  }

  // Loop de renderização
  function animate() {
    if (state.matrixActive) {
      drawMatrix();
    } else {
      ctx.fillStyle = "rgba(3, 7, 18, 0.2)"; // Rastro suave de movimento
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Conexões estéticas
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < particles.length; j += 4) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 100) {
            const alpha = (100 - dist) / 100 * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  // -------------------------------------------------------------
  // 4. CONTROLADOR DE IDIOMAS (SISTEMA DE LOCALIZAÇÃO BILÍNGUE)
  // -------------------------------------------------------------
  const translations = {
    PT: {
      sys_status: "SYS_STATUS:",
      online_secure: "ONLINE_SECURE",
      audio_off: "FX_OFF",
      audio_on: "FX_ON",
      nav_hud: "INTERFACE_HUD_TÁTICA",
      nav_projects: "TELA_DE_PROJETOS",
      nav_contact: "CANAL_NEURAL_GMAIL",
      nav_terminal: "TERMINAL_DE_DADOS",
      nav_print: "EXPORTAR_PDF_TRADICIONAL",
      
      profile_title: "CIBER_IDENTIDADE",
      profile_role: "Estudante de Engenharia de Software",
      profile_period: "5º Período",
      profile_bio: "Estudante de Engenharia de Software (PUC Minas, 5º período) e sócio da Café Labs, focado em desenvolvimento full-stack e mobile, do modelo de dados ao deploy. Atua como responsável pela estrutura de TI e pelo suporte da escola Rede Decisão (BH) e entrega produtos reais — de um SaaS multi-tenant em piloto com cliente a apps Flutter e sistemas de gestão. Base prévia em marketing digital e comunicação para redes sociais.",
      
      ai_title: "NÚCLEO_INTELECTO_IA",
      ai_greeting: "Saudações, recrutador. Conectado com sucesso à rede neural de Matheus Malta. Selecione uma diretriz ou envie uma pergunta sobre suas qualificações para que eu processe uma resposta baseada em seus dados.",
      ai_prompt_why: "Por que contratar o Matheus?",
      ai_prompt_ai: "Qual é a base dele em IA?",
      ai_prompt_puc: "Fale sobre a PUC Minas.",
      ai_prompt_future: "Qual o foco de carreira dele?",
      chat_placeholder: "Digite uma pergunta customizada ou comando...",
      chat_send: "ENVIAR",
      
      skills_title: "MATRIZ_HABILIDADES_TÉCNICAS",
      skills_sub: "MÓDULOS DE HARDWARE INTERNOS",
      skills_cat_dev: "Linguagens & Frameworks",
      skills_cat_ai: "Inteligência Artificial & Dados",
      skills_cat_design: "Design & Ferramentas",
      skills_cat_lang: "Idiomas & Extras",
      skill_recommend: "Algoritmos de Recomendação",
      skill_logic: "Lógica de Programação",
      skill_marketing: "Marketing Digital / Identidade Visual",
      skill_scrum: "Metodologias Ágeis (Scrum)",
      skill_english_label: "Inglês",
      skill_english_level: "Básico",
      
      chronology_title: "CRONOLOGIA_E_HISTÓRICO",
      chronology_sub: "REGISTROS DE EXECUÇÃO DE SISTEMAS",
      timeline_job_0: "Suporte de TI",
      timeline_summary_0: "Responsável pela estrutura de TI da escola: infraestrutura de rede, equipamentos e sistemas, além do suporte técnico contínuo aos usuários.",
      timeline_job_1: "Estagiário de Marketing e Logística",
      timeline_summary_1: "Criação de estratégias digitais, gestão de presença online e controle logístico de comunicação com pacientes.",
      timeline_job_2: "Desenvolvedor de Sistemas (Oficina)",
      timeline_org_2: "Iniciativa Própria",
      timeline_summary_2: "Construção de Sistema de Gestão de peças utilizando Java, HTML5 e CSS3, otimizando fluxos organizacionais.",
      timeline_job_3: "Gestor de Comunicação Digital",
      timeline_summary_3: "Atuação ativa na equipe de redes sociais do curso de Engenharia de Software, focando na criação de conteúdo técnico e engajamento da comunidade acadêmica.",
      timeline_job_4: "Graduação em Engenharia de Software",
      timeline_summary_4: "Base sólida em engenharia, algoritmos, desenvolvimento de software tático e práticas de design de sistemas.",
      timeline_hint: "Clique para expandir arquivo dossiê",
      timeline_date_2: "Projeto Pessoal / Acadêmico",
      timeline_date_3: "Extensão Acadêmica",
      timeline_date_4: "Previsão: 1º semestre 2028",

      projects_panel_title: "VISUALIZADOR_DE_TELAS_PROJETOS",
      projects_panel_sub: "PROJEÇÕES GRÁFICAS DE SISTEMAS IMPLANTADOS",
      project_tag_active: "IMPLANTADO // v1.2.0",
      project_tag_complete: "CONCLUÍDO // MARKETING",
      project_tag_delivered: "ENTREGUE // ACADÊMICO",
      project_tag_wip: "EM DESENVOLVIMENTO",
      project_tag_complete_collab: "CONCLUÍDO // COLABORAÇÃO",
      project_no_preview: "PREVIEW INDISPONÍVEL",
      proj_title_1: "Sistema de Gestão de Peças de Oficina",
      proj_desc_1: "Uma ferramenta desktop de alta fidelidade voltada para o controle operacional de inventário e reposição de autopeças. Conta com um banco de dados estruturado em arquivos, algoritmos otimizados de busca rápida de itens, catalogação inteligente de materiais e uma interface tática integrada com estilos HTML5 e CSS3 locais para facilitar o fluxo de trabalho dos mecânicos na oficina.",
      proj_title_2: "Campanha & Identidade Digital - Clinica Odontológica",
      proj_desc_2: "Criação completa de branding corporativo e materiais de marketing para a Spagnol Odontologia. Focado em restabelecer a consistência e padronização visual da marca nas redes sociais, o projeto envolveu a estruturação de fluxos operacionais de comunicação, paletas cromáticas acolhedoras e modernos designs de cards promocionais que aumentaram em 45% a taxa de engajamento do público com a clínica.",
      proj_title_3: "Sistema de Moeda Estudantil",
      proj_desc_3: "Plataforma web gamificada para incentivo do mérito acadêmico: professores distribuem moeda virtual para alunos como reconhecimento por desempenho e participação, e os alunos trocam o saldo acumulado por vantagens oferecidas por empresas parceiras. Projeto da disciplina Laboratório de Projeto de Software.",
      proj_title_4: "Japan Motors — Gestão de Oficina Mecânica",
      proj_desc_4: "Sistema web para automatizar a gestão de uma oficina mecânica: cadastro e acompanhamento de veículos e clientes, controle de estoque de peças usadas e registro de termos de garantia. Projeto acadêmico em equipe, desenvolvido para a disciplina Projeto Padrão TI da PUC Minas.",
      proj_title_5: "Plantei",
      proj_desc_5: "Aplicação web educacional para turmas do maternal acompanharem o crescimento de plantas cultivadas na horta escolar, com animações, músicas e o personagem-guia Benny, o Minhoco. Projeto acadêmico em equipe, ainda em desenvolvimento, para a disciplina de Engenharia de Software da PUC Minas.",
      proj_title_6: "Plane Graph Analysis",
      proj_desc_6: "Análise da rede de colaboração do repositório open-source makeplane/plane a partir de issues, pull requests, comentários e reviews, usando grafos direcionados e ponderados implementados do zero — centralidades (PageRank, Betweenness, Closeness), detecção de comunidades e exportação para Gephi/Sigma.js. Projeto em equipe para a disciplina de Teoria de Grafos e Computabilidade; contribuição própria nas classes de grafo, análise e exportação.",
      proj_title_7: "Agenda Barbearia",
      proj_desc_7: "SaaS multi-tenant de agendamento pra barbearias e salões, hoje em piloto real com uma barbearia de 3 cadeiras. Painel administrativo pro dono do negócio e página pública de auto-agendamento pro cliente. Next.js + Supabase, com RLS multi-tenant e constraint no banco que impede agendamento duplicado mesmo sob concorrência, além de notificações via WhatsApp Business Cloud API.",
      proj_title_8: "Brechó Online",
      proj_desc_8: "E-commerce/catálogo de roupas usadas, desenvolvido para um cliente real, com a mesma stack do Agenda Barbearia (Next.js + Supabase).",
      timeline_job_cl: "Sócio e Desenvolvedor",
      timeline_summary_cl: "Sócio de empresa de software: desenvolvimento full-stack e mobile de produtos próprios e de clientes (Box+, Dindin, Laudo, Patotive, Agenda Barbearia).",
      print_exp_job_cl: "Sócio e Desenvolvedor — Café Labs",
      print_exp_date_cl: "Jul 2026 – Atual",
      print_exp_task_cl_1: "Sócio de empresa de software: desenvolvimento full-stack e mobile de produtos próprios e de clientes (Box+, Dindin, Laudo, Patotive, Agenda Barbearia).",
      project_tag_cafelabs: "CAFÉ LABS // PRODUTO",
      proj_title_9: "Box+ — Gestão de Oficina Mecânica",
      proj_desc_9: "Sistema de gestão para uma oficina mecânica real (Café Labs): agendamento, quadro de etapas do carro, histórico de serviços com peças usadas, estoque, manutenção preventiva, faturamento e portal do cliente com notificação quando o carro fica pronto. Monorepo com API Node/TypeScript (Fastify + PostgreSQL), painel web em Next.js e apps Flutter.",
      proj_title_10: "Café Labs Admin",
      proj_desc_10: "Hub de gestão interna da Café Labs: clientes e financeiro da empresa em um só sistema. SPA em React + Vite + TypeScript sobre Firebase (Auth com Google, Firestore e Security Rules), com PDF de leads e regras de acesso por usuário. Em produção, usado no dia a dia da empresa.",
      proj_title_11: "Dindin — Finanças por Envelopes",
      proj_desc_11: "App de finanças pessoais organizado em \"caixinhas\" (envelopes): a receita entra como saldo e é alocada em caixinhas de gasto (com limite mensal) ou de poupança (com meta), com transferência entre elas. Flutter multiplataforma (Web, Android e Windows) com Firebase, interface em português e inglês. Landing em dindin.cafelabs.net.",
      proj_title_12: "Laudo — App de Vistorias",
      proj_desc_12: "App Flutter (mobile + web) de vistorias de obra/imóvel para uma arquiteta: ela narra o que vê por item/ambiente e o app transcreve a voz 100% no dispositivo, anexa fotos e gera o laudo em PDF para o cliente. Funciona offline em campo e sincroniza quando a conexão volta.",
      proj_title_13: "Patotive",
      proj_desc_13: "Diretório e operação de grupos exclusivos de desconto no WhatsApp, organizados por categoria de produto (v1: esportes e livros). Next.js (web + PWA) com Firebase (Auth, Firestore, Hosting), no ar em patotive.vercel.app, com integração a marketplace de afiliados em andamento.",

      contact_panel_title: "DISPARADOR_DE_TRANSMISSÃO_GMAIL",
      contact_panel_sub: "LINK DIRETO DE COMUNICAÇÃO DE REDE",
      contact_welcome: "ESTABELECER CONEXÃO DIRECT",
      contact_intro: "Esta seção envia uma mensagem criptografada formatada em tempo real diretamente para o canal Gmail de Matheus. Preencha as chaves operacionais e envie a transmissão.",
      state_waiting: "AGUARDANDO INPUT",
      lbl_name: "NOME_RECRUTADOR:",
      ph_name: "Ex: Ana Silva (RH Tech)",
      lbl_email: "EMAIL_CONTATO:",
      ph_email: "Ex: recrutador@corporacao.com",
      lbl_message: "MENSAGEM_CRIPTOGRAFADA:",
      ph_message: "Descreva os termos da contratação, projeto ou convite...",
      btn_send_trans: "ENVIAR TRANSMISSÃO NEURAL",

      terminal_sub: "INTERFACES BASEADAS EM TEXTO",
      term_placeholder: "Digite um comando...",
      footer_link: "LINK_STATUS: PERSISTENT_STREAM",
      dossier_header: "ARQUIVO_DOSSIÊ",

      // Impressão
      print_role: "Estudante de Engenharia de Software (5º Período - PUC Minas)",
      print_sect_summary: "Resumo Profissional",
      print_summary: "Estudante de Engenharia de Software (PUC Minas, 5º período) e sócio da Café Labs, focado em desenvolvimento full-stack e mobile, do modelo de dados ao deploy. Atua como responsável pela estrutura de TI e pelo suporte da escola Rede Decisão (BH) e entrega produtos reais — de um SaaS multi-tenant em piloto com cliente a apps Flutter e sistemas de gestão. Base prévia em marketing digital e comunicação para redes sociais.",
      print_sect_skills: "Habilidades Técnicas",
      print_skill_ai: "Inteligência Artificial: Algoritmos de Recomendação, Lógica de Programação.",
      print_skill_design: "Design e Comunicação: Web Design, Marketing Digital, Identidade Visual.",
      print_skill_tools: "Ferramentas e Metodologias: Metodologias Ágeis (Scrum), Git/GitHub, Integração com APIs, Figma.",
      print_skill_lang: "Idiomas: Inglês (Básico).",
      print_sect_exp: "Experiência Profissional",
      print_exp_job_0: "Suporte de TI — Escola Rede Decisão",
      print_exp_date_0: "Mar 2026 – Atual",
      print_exp_task_0_1: "Responsável pela estrutura de TI da escola: infraestrutura de rede, equipamentos e sistemas, além do suporte técnico contínuo aos usuários.",
      print_exp_job_1: "Estagiário de Marketing e Logística — Spagnol Odontologia",
      print_exp_task_1_1: "Responsável pelo desenvolvimento e execução de estratégias de marketing para as redes sociais do consultório.",
      print_exp_task_1_2: "Gestão da logística interna relacionada à presença digital e comunicação com pacientes.",
      print_exp_job_2: "Desenvolvedor de Sistemas (Projeto Pessoal / Acadêmico)",
      print_exp_date_2: "Projeto Independente",
      print_exp_task_2_1: "Desenvolvimento de um Sistema de Gestão de peças de uma oficina utilizando Java, HTML e CSS, otimizando o controle e gestão do fluxo de serviços e materiais da oficina.",
      print_exp_task_2_2: "Criação de materiais de marketing e identidade visual para Clinica Odontológica, focando na padronização da comunicação digital da marca.",
      print_sect_puc: "Projetos Acadêmicos e Extensão",
      print_exp_job_3: "Gestão de Comunicação — PUC Minas",
      print_exp_date_3: "Projeto de Extensão",
      print_exp_task_3_1: "Atuação ativa na equipe de redes sociais do curso de Engenharia de Software, focando na criação de conteúdo técnico e engajamento da comunidade acadêmica.",
      print_sect_edu: "Formação Acadêmica",
      print_sect_cert: "Cursos e Certificados",
      cert_date_1: "Mai 2026",
      cert_title_1: "AWS Academy Graduate — Cloud Foundations",
      print_cert_1: "AWS Academy Graduate — Cloud Foundations — AWS Academy · Training Badge · mai/2026 · 20 h",
      cert_date_2: "Out 2025",
      cert_title_2: "Red Hat System Administration I (RH124)",
      print_cert_2: "Red Hat System Administration I (RH124) — Red Hat · Certificado de participação · out/2025 · 40 h",
      print_edu_title: "Graduação em Engenharia de Software — PUC Minas",
      print_edu_date: "Conclusão prevista: primeiro semestre de 2028",
      print_edu_high: "Ensino Médio Completo — Instituto Adventista Brasil Central",
      print_high_date: "Concluído em 2022"
    },
    EN: {
      sys_status: "SYS_STATUS:",
      online_secure: "ONLINE_SECURE",
      audio_off: "FX_OFF",
      audio_on: "FX_ON",
      nav_hud: "TACTICAL_HUD_INTERFACE",
      nav_projects: "PROJECTS_SCREEN",
      nav_contact: "NEURAL_GMAIL_CHANNEL",
      nav_terminal: "DATA_TERMINAL_CORE",
      nav_print: "EXPORT_TRADITIONAL_PDF",
      
      profile_title: "CYBER_IDENTITY",
      profile_role: "Software Engineering Student",
      profile_period: "5th Period",
      profile_bio: "Software Engineering student (PUC Minas, 5th semester) and partner at Café Labs, focused on full-stack and mobile development, from data model to deploy. He is responsible for the IT structure and support of the Rede Decisão school (Belo Horizonte) and ships real products — from a multi-tenant SaaS in pilot with a client to Flutter apps and management systems. With a prior background in digital marketing and social media communication.",
      
      ai_title: "AI_INTELLECT_CORE",
      ai_greeting: "Greetings, recruiter. Successfully established neural link with Matheus Malta. Select a protocol or type a custom query below to process data.",
      ai_prompt_why: "Why hire Matheus?",
      ai_prompt_ai: "What is his AI background?",
      ai_prompt_puc: "Talk about PUC Minas.",
      ai_prompt_future: "What is his career focus?",
      chat_placeholder: "Enter custom query or core terminal command...",
      chat_send: "SEND",
      
      skills_title: "TECHNICAL_SKILLS_MATRIX",
      skills_sub: "INTERNAL HARDWARE MODULES",
      skills_cat_dev: "Languages & Frameworks",
      skills_cat_ai: "Artificial Intelligence & Data",
      skills_cat_design: "Design & Toolsets",
      skills_cat_lang: "Languages & Extras",
      skill_recommend: "Recommendation Algorithms",
      skill_logic: "Programming Logic",
      skill_marketing: "Digital Marketing / Visual Identity",
      skill_scrum: "Agile Methodologies (Scrum)",
      skill_english_label: "English",
      skill_english_level: "Basic",
      
      chronology_title: "CHRONOLOGY_RUN_LOGS",
      chronology_sub: "SYSTEM EXECUTION REGISTERS",
      timeline_job_0: "IT Support",
      timeline_summary_0: "Responsible for the school's IT structure: network infrastructure, equipment and systems, plus ongoing technical support for users.",
      timeline_job_1: "Marketing and Logistics Intern",
      timeline_summary_1: "Development of digital marketing strategies, visual branding design, and internal client relations logistics.",
      timeline_job_2: "Systems Developer (Car Workshop)",
      timeline_org_2: "Self-Initiated Project",
      timeline_summary_2: "Development of a parts cataloging and inventory control software utilizing Java, HTML5, and CSS3.",
      timeline_job_3: "Digital Communication Coordinator",
      timeline_summary_3: "Active coordinator for the academic software engineering community, producing technical publications.",
      timeline_job_4: "B.S. in Software Engineering",
      timeline_summary_4: "Rigorous training in software architecture, computer logic, requirements engineering, and agile project cycles.",
      timeline_hint: "Click to expand secure dossier file",
      timeline_date_2: "Personal / Academic Project",
      timeline_date_3: "Academic Extension",
      timeline_date_4: "Expected: 1st half 2028",

      projects_panel_title: "PROJECTS_SCREEN_VIEWER",
      projects_panel_sub: "GRAPHICAL DISPLAY OF DEPLOYED SYSTEMS",
      project_tag_active: "DEPLOYED // v1.2.0",
      project_tag_complete: "COMPLETED // MARKETING",
      project_tag_delivered: "DELIVERED // ACADEMIC",
      project_tag_wip: "IN DEVELOPMENT",
      project_tag_complete_collab: "COMPLETED // COLLABORATION",
      project_no_preview: "PREVIEW UNAVAILABLE",
      proj_title_1: "Workshop Parts Inventory Software",
      proj_desc_1: "A high-fidelity desktop software engineered for inventory tracking and autopeats cataloging. Built with a structured file-based database, optimized binary search algorithms, item indexing, and a custom locally served HTML5 and CSS3 dashboard to streamline workflows for car technicians in workshop setups.",
      proj_title_2: "Odontology Clinic Digital Brand Identity",
      proj_desc_2: "Full strategic design and visual content packaging for Spagnol Odontology. Engineered to establish absolute visual consistency across digital media, the project introduced structured communication funnels, premium color schemes, and modern marketing assets that generated a 45% increase in user interaction.",
      proj_title_3: "Student Currency System",
      proj_desc_3: "A gamified web platform to encourage academic merit: teachers award virtual currency to students as recognition for performance and participation, and students redeem their accumulated balance for perks offered by partner companies. Built for the Software Project Lab course.",
      proj_title_4: "Japan Motors — Auto Repair Shop Management",
      proj_desc_4: "A web system to automate auto repair shop management: vehicle and customer registration and tracking, used-parts inventory control, and warranty term records. Team academic project built for PUC Minas' Standard IT Project course.",
      proj_title_5: "Plantei",
      proj_desc_5: "An educational web app for preschool classes to track the growth of plants in the school garden, with animations, music, and the guide character Benny the Worm. Team academic project, still in development, for PUC Minas' Software Engineering course.",
      proj_title_6: "Plane Graph Analysis",
      proj_desc_6: "Analysis of the collaboration network in the open-source makeplane/plane repository from issues, pull requests, comments, and reviews, using directed weighted graphs implemented from scratch — centrality metrics (PageRank, Betweenness, Closeness), community detection, and export to Gephi/Sigma.js. Team project for the Graph Theory and Computability course; own contribution covered the graph classes, analysis, and export.",
      proj_title_7: "Agenda Barbearia",
      proj_desc_7: "Multi-tenant booking SaaS for barbershops and salons, currently in real pilot with a 3-chair barbershop. Admin panel for the business owner and a public self-booking page for clients. Next.js + Supabase, with multi-tenant RLS and a database constraint that prevents double-booking even under concurrency, plus notifications via WhatsApp Business Cloud API.",
      proj_title_8: "Brechó Online",
      proj_desc_8: "Second-hand clothing e-commerce/catalog, built for a real client, with the same stack as Agenda Barbearia (Next.js + Supabase).",
      timeline_job_cl: "Partner and Developer",
      timeline_summary_cl: "Partner at a software company: full-stack and mobile development of in-house and client products (Box+, Dindin, Laudo, Patotive, Agenda Barbearia).",
      print_exp_job_cl: "Partner and Developer — Café Labs",
      print_exp_date_cl: "Jul 2026 – Present",
      print_exp_task_cl_1: "Partner at a software company: full-stack and mobile development of in-house and client products (Box+, Dindin, Laudo, Patotive, Agenda Barbearia).",
      project_tag_cafelabs: "CAFÉ LABS // PRODUCT",
      proj_title_9: "Box+ — Gestão de Oficina Mecânica",
      proj_desc_9: "Management system for a real auto repair shop (Café Labs): scheduling, car-stage board, service history with parts used, inventory, preventive maintenance, billing and a customer portal that notifies when the car is ready. Monorepo with a Node/TypeScript API (Fastify + PostgreSQL), a Next.js web dashboard and Flutter apps.",
      proj_title_10: "Café Labs Admin",
      proj_desc_10: "Café Labs' internal management hub: the company's clients and finances in a single system. React + Vite + TypeScript SPA on Firebase (Google Auth, Firestore and Security Rules), with lead PDF export and per-user access rules. In production, used day to day at the company.",
      proj_title_11: "Dindin — Finanças por Envelopes",
      proj_desc_11: "Personal finance app organized around \"envelopes\": income arrives as balance and is allocated to spending envelopes (with a monthly limit) or saving envelopes (with a goal), with transfers between them. Cross-platform Flutter (Web, Android and Windows) with Firebase, UI in Portuguese and English. Landing page at dindin.cafelabs.net.",
      proj_title_12: "Laudo — App de Vistorias",
      proj_desc_12: "Flutter app (mobile + web) for construction/property inspections for an architect: she narrates what she sees per item/room and the app transcribes speech 100% on-device, attaches photos and generates the PDF report for the client. Works offline in the field and syncs when the connection returns.",
      proj_title_13: "Patotive",
      proj_desc_13: "Directory and operation of exclusive discount groups on WhatsApp, organized by product category (v1: sports and books). Next.js (web + PWA) with Firebase (Auth, Firestore, Hosting), live at patotive.vercel.app, with an affiliate marketplace integration in progress.",

      contact_panel_title: "GMAIL_NEURAL_LINK_TRANSMITTER",
      contact_panel_sub: "DIRECT DIRECT_CONNECT COMMS TUNNEL",
      contact_welcome: "ESTABLISH DIRECT NEURAL CONNECTION",
      contact_intro: "This terminal formats and packages a secure transmission in real time directly to Matheus's personal Gmail mailbox. Fill out the operational parameters and fire.",
      state_waiting: "AWAITING INPUT",
      lbl_name: "SENDER_NAME:",
      ph_name: "E.g., Sarah Connor (HR Tech)",
      lbl_email: "SENDER_EMAIL:",
      ph_email: "E.g., recruiter@corporation.com",
      lbl_message: "ENCRYPTED_MESSAGE_STREAM:",
      ph_message: "Describe job details, contracts, or networking invites...",
      btn_send_trans: "DISPATCH NEURAL TRANSMISSION",

      terminal_sub: "TEXT-BASED SHELL ENVIRONMENTS",
      term_placeholder: "Enter terminal command...",
      footer_link: "LINK_STATUS: PERSISTENT_STREAM",
      dossier_header: "DOSSIER_FILE",

      // Impressão EN
      print_role: "Software Engineering Student (5th Period - PUC Minas)",
      print_sect_summary: "Professional Summary",
      print_summary: "Software Engineering student (PUC Minas, 5th semester) and partner at Café Labs, focused on full-stack and mobile development, from data model to deploy. He is responsible for the IT structure and support of the Rede Decisão school (Belo Horizonte) and ships real products — from a multi-tenant SaaS in pilot with a client to Flutter apps and management systems. With a prior background in digital marketing and social media communication.",
      print_sect_skills: "Technical Skills",
      print_skill_ai: "Artificial Intelligence: Recommendation Algorithms, Programming Logic.",
      print_skill_design: "Design & Communications: Web Design, Digital Marketing, Visual Identity.",
      print_skill_tools: "Tools & Methods: Agile Frameworks (Scrum), Git/GitHub, API Integration, Figma.",
      print_skill_lang: "Languages: English (Basic).",
      print_sect_exp: "Work Experience",
      print_exp_job_0: "IT Support — Rede Decisão School",
      print_exp_date_0: "Mar 2026 – Present",
      print_exp_task_0_1: "Responsible for the school's IT structure: network infrastructure, equipment and systems, plus ongoing technical support for users.",
      print_exp_job_1: "Marketing and Logistics Intern — Spagnol Odontology",
      print_exp_task_1_1: "Designed and executed creative marketing assets and visual campaigns for local clinic media pipelines.",
      print_exp_task_1_2: "Coordinated internal patient onboarding log streams and digital customer support funnels.",
      print_exp_job_2: "Systems Developer (Personal / Academic Project)",
      print_exp_date_2: "Independent Project",
      print_exp_task_2_1: "Architected a Java-based auto parts management and inventory cataloging system integrating HTML/CSS dashboards.",
      print_exp_task_2_2: "Developed visual assets, UI wireframes, and branding guidelines for independent odontology agencies.",
      print_sect_puc: "Academic Projects & Leadership",
      print_exp_job_3: "Digital Media Manager — PUC Minas",
      print_exp_date_3: "Extension Project",
      print_exp_task_3_1: "Produced high-quality educational publications on technical computer logic, promoting student community engagement.",
      print_sect_edu: "Academic Background",
      print_sect_cert: "Courses & Certificates",
      cert_date_1: "May 2026",
      cert_title_1: "AWS Academy Graduate — Cloud Foundations",
      print_cert_1: "AWS Academy Graduate — Cloud Foundations — AWS Academy · Training Badge · May 2026 · 20 h",
      cert_date_2: "Oct 2025",
      cert_title_2: "Red Hat System Administration I (RH124)",
      print_cert_2: "Red Hat System Administration I (RH124) — Red Hat · Certificate of attendance · Oct 2025 · 40 h",
      print_edu_title: "B.S. in Software Engineering — PUC Minas",
      print_edu_date: "Expected graduation: first semester of 2028",
      print_edu_high: "High School Diploma — Instituto Adventista Brasil Central",
      print_high_date: "Completed in 2022"
    }
  };

  // Mapeamento dinâmico de chaves de tradução
  function toggleLanguage() {
    state.lang = state.lang === "PT" ? "EN" : "PT";
    
    // Atualiza botão do indicador
    document.getElementById("lang-indicator").textContent = state.lang === "PT" ? "PT-BR" : "EN-US";
    
    // Efeito sonoro de rede tática
    sounds.granted();
    
    // Aplicar Glitch na mudança de idioma
    const overlay = document.querySelector(".crt-glitch-overlay");
    overlay.style.background = "rgba(0, 240, 255, 0.15)";
    setTimeout(() => {
      overlay.style.background = "rgba(0, 240, 255, 0.002)";
    }, 250);

    // Mapeamento recursivo de elementos que possuem "data-translate"
    document.querySelectorAll("[data-translate]").forEach(el => {
      const key = el.getAttribute("data-translate");
      if (translations[state.lang][key]) {
        el.innerHTML = translations[state.lang][key];
      }
    });

    // Mapeamento recursivo de placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(el => {
      const key = el.getAttribute("data-translate-placeholder");
      if (translations[state.lang][key]) {
        el.setAttribute("placeholder", translations[state.lang][key]);
      }
    });

    // Re-traduzir assistente de IA se estiver no início
    const history = document.getElementById("ai-chat-history");
    if (history.children.length === 1) {
      history.innerHTML = `
        <div class="chat-message bot">
          <span class="message-sender">[SYS_INTELECTO]:</span>
          <p class="message-text">${translations[state.lang].ai_greeting}</p>
        </div>
      `;
    }

    // Traduzir mensagem inicial do terminal
    const termInit = document.getElementById("terminal-init-msg");
    if (termInit) {
      if (state.lang === "PT") {
        termInit.innerHTML = `
          <span class="text-neon-cyan">Matheus Neural Core OS v4.0.28 (guest-session)</span><br>
          <span>Conectando ao núcleo de dados... Conectado!</span><br>
          <span>Digite <span class="text-neon-pink">help</span> para visualizar comandos disponíveis na inteligência do sistema.</span><br>
          <span>---------------------------------------------------------</span>
        `;
      } else {
        termInit.innerHTML = `
          <span class="text-neon-cyan">Matheus Neural Core OS v4.0.28 (guest-session)</span><br>
          <span>Connecting to data core... Connected!</span><br>
          <span>Type <span class="text-neon-pink">help</span> to view active command parameters in shell intellect.</span><br>
          <span>---------------------------------------------------------</span>
        `;
      }
    }
  }

  const langBtn = document.getElementById("lang-toggle");
  langBtn.addEventListener("click", toggleLanguage);

  // -------------------------------------------------------------
  // 5. BANCO DE DADOS DOS DOSSIÊS MODAIS (BILINGUE)
  // -------------------------------------------------------------
  const dossiers = {
    PT: {
      "exp-rede-decisao": {
        title: "REDE_DECISÃO // DOSSIÊ_SUPORTE_TI",
        role: "Suporte de TI",
        org: "Rede Decisão",
        period: "Março 2026 - Atual",
        status: "EM ANDAMENTO",
        desc: "Responsável por toda a estrutura de TI e pelo suporte da escola Rede Decisão, em Belo Horizonte.",
        tasks: [
          "Gestão e manutenção da infraestrutura de TI da escola: rede, equipamentos e sistemas.",
          "Suporte técnico contínuo aos usuários e sistemas internos."
        ]
      },
      "exp-cafelabs": {
        title: "CAFÉ_LABS // DOSSIÊ_SÓCIO",
        role: "Sócio e Desenvolvedor",
        org: "Café Labs",
        period: "Julho 2026 - Atual",
        status: "EM ANDAMENTO",
        desc: "Sócio da Café Labs, empresa de software que entrega produtos próprios e sistemas sob medida para clientes.",
        tasks: [
          "Desenvolvimento full-stack e mobile: Next.js, React, Node.js, Flutter e Firebase/Supabase.",
          "Entrega de produtos reais: Box+ (oficina mecânica), Dindin (finanças), Laudo (vistorias), Patotive e Agenda Barbearia (SaaS em piloto).",
          "Estruturação de projetos novos do zero — do brainstorm de produto ao deploy."
        ]
      },
      "exp-marketing": {
        title: "SPAGNOL ODONTOLOGIA // DOSSIÊ_ESTÁGIO",
        role: "Estagiário de Marketing e Logística",
        org: "Spagnol Odontologia",
        period: "Janeiro 2024 - Agosto 2024",
        status: "CONCLUÍDO (SUCESSO)",
        desc: "Execução estratégica de posicionamento digital e logística de fluxo de pacientes para clínica odontológica de médio porte.",
        tasks: [
          "Desenvolvimento e execução de estratégias de marketing digital focadas nas redes sociais da marca, padronizando a comunicação visual e aumentando o engajamento.",
          "Gestão operacional de logística interna e comunicação digital integrada com pacientes pré e pós-consulta.",
          "Otimização de processos de atendimento via canais integrados de redes sociais, gerando maior retenção de contatos."
        ]
      },
      "exp-oficina": {
        title: "OFICINA_CORE // SISTEMA_DE_GESTÃO",
        role: "Desenvolvedor de Sistemas",
        org: "Iniciativa Independente",
        period: "Projeto Pessoal / Acadêmico",
        status: "IMPLANTADO",
        desc: "Criação de aplicação desktop de gerenciamento e arquitetura web tática de controle patrimonial para oficina de reparos veiculares.",
        tasks: [
          "Projeto de arquitetura de banco de dados e controle interno em linguagem Java SE estruturada.",
          "Desenvolvimento de telas rápidas integrando fluxo com HTML5/CSS3 para interfaces locais responsivas.",
          "Redução de 30% no tempo de busca de autopeças e ferramentas via algoritmo de catalogação local de inventário."
        ]
      },
      "exp-puc": {
        title: "PUC_MINAS // GESTÃO_COMUNICAÇÃO",
        role: "Atuante e Gestor de Comunicação Digital",
        org: "Colegiado de Engenharia de Software (PUC Minas)",
        period: "Projeto de Extensão Acadêmica",
        status: "ATIVO",
        desc: "Atuação direta em equipe técnica multidisciplinar para aprimoramento da comunicação e engajamento da comunidade acadêmica no ecossistema de software.",
        tasks: [
          "Produção de conteúdo técnico e de divulgação acadêmica para os canais de redes sociais da universidade.",
          "Organização e apoio de logística para eventos técnicos virtuais e presenciais do corpo discente.",
          "Fortalecimento da marca do curso de Engenharia de Software atraindo novos discentes e promovendo discussões sobre tecnologias emergentes."
        ]
      },
      "edu-software": {
        title: "PUC_MINAS // ENGENHARIA_SOFTWARE",
        role: "Graduação de Alta Performance",
        org: "Pontifícia Universidade Católica de Minas Gerais (Belo Horizonte)",
        period: "Previsão de Formatura: 1º semestre de 2028 (5º período atual)",
        status: "PROGRESSÃO APROVADA",
        desc: "Bacharelado intensivo voltado para Engenharia de Requisitos, Arquitetura de Computadores, Estrutura de Dados, Programação Orientada a Objetos e Métodos Ágeis.",
        tasks: [
          "Sólida fundamentação técnica em lógica de programação, orientação a objetos avançada e estruturas de controle de sistemas.",
          "Integração contínua e desenvolvimento prático com metodologias ágeis (Scrum) e controle de versão tático (Git/GitHub).",
          "Estudos independentes aplicados em Algoritmos de Recomendação e interfaces inteligentes baseadas em dados."
        ]
      }
    },
    EN: {
      "exp-rede-decisao": {
        title: "REDE_DECISÃO // IT_SUPPORT_DOSSIER",
        role: "IT Support",
        org: "Rede Decisão",
        period: "March 2026 - Present",
        status: "IN PROGRESS",
        desc: "Responsible for the entire IT structure and support of the Rede Decisão school, in Belo Horizonte.",
        tasks: [
          "Management and maintenance of the school's IT infrastructure: network, equipment and systems.",
          "Ongoing technical support for internal users and systems."
        ]
      },
      "exp-cafelabs": {
        title: "CAFÉ_LABS // PARTNER_DOSSIER",
        role: "Partner and Developer",
        org: "Café Labs",
        period: "July 2026 - Present",
        status: "IN PROGRESS",
        desc: "Partner at Café Labs, a software company that ships in-house products and custom systems for clients.",
        tasks: [
          "Full-stack and mobile development: Next.js, React, Node.js, Flutter and Firebase/Supabase.",
          "Delivery of real products: Box+ (auto repair shop), Dindin (finance), Laudo (inspections), Patotive and Agenda Barbearia (SaaS in pilot).",
          "Setting up new projects from scratch — from product brainstorm to deploy."
        ]
      },
      "exp-marketing": {
        title: "SPAGNOL ODONTOLOGY // INTERNSHIP_DOSSIER",
        role: "Marketing and Logistics Intern",
        org: "Spagnol Odontology",
        period: "January 2024 - August 2024",
        status: "COMPLETED (SUCCESS)",
        desc: "Strategic deployment of brand identity, digital marketing schedules, and logistical support workflows for a mid-scale odontology center.",
        tasks: [
          "Curated creative promotional visual campaigns for clinic social networks, resulting in uniform aesthetic branding.",
          "Managed patient relations logs, resolving customer communication bottlenecks through CRM structures.",
          "Streamlined patient digital retention workflows, resulting in optimized schedules."
        ]
      },
      "exp-oficina": {
        title: "OFICINA_CORE // INVENTORY_SYSTEM",
        role: "Systems Developer",
        org: "Self-Initiated Project",
        period: "Personal / Academic Project",
        status: "DEPLOYED",
        desc: "Design and deployment of a modular desktop asset tracker and cataloging application for an automotive mechanical shop.",
        tasks: [
          "Architected internal binary search logic and databases using Java SE frameworks.",
          "Developed web-styled dashboards using HTML5 and CSS3 for local machine layouts.",
          "Reduced parts locator delay times by 30% using index-based item lookup."
        ]
      },
      "exp-puc": {
        title: "PUC_MINAS // COMMUNICATIONS_MANAGER",
        role: "Active Member & Media Coordinator",
        org: "Software Engineering Department (PUC Minas)",
        period: "Academic Extension Project",
        status: "ACTIVE",
        desc: "Active participation in academic departments to improve community synergy and coordinate student activities.",
        tasks: [
          "Published creative technical articles outlining programming structures on university channels.",
          "Coordinated logistics pipelines for online and onsite academic workshops and hackathons.",
          "Fostered community relations, attracting student applicants to technical engineering cohorts."
        ]
      },
      "edu-software": {
        title: "PUC_MINAS // SOFTWARE_ENGINEERING",
        role: "High-Performance Undergrad",
        org: "Pontifical Catholic University of Minas Gerais (Belo Horizonte)",
        period: "Graduation Expected: 1st half of 2028 (Currently in 5th Period)",
        status: "APPROVED PROGRESSION",
        desc: "Intensive B.S. degree focusing on Algorithms, Data Structures, OOP, Software Architectures, and Agile methodologies.",
        tasks: [
          "Strong theoretical base in computer logic, memory allocation structures, and advanced program architectures.",
          "Continuous projects applying Git/GitHub code repositories and Scrum sprints.",
          "Special study workflows exploring recommendation systems and data-rich intelligent web models."
        ]
      }
    }
  };

  const modal = document.getElementById("dossier-modal");
  const closeDossierBtn = document.getElementById("close-dossier");
  const dossierBody = document.getElementById("dossier-body");

  document.querySelectorAll(".timeline-item.clickable").forEach(item => {
    item.addEventListener("click", () => {
      const key = item.getAttribute("data-dossier");
      const data = dossiers[state.lang][key];
      if (!data) return;

      sounds.granted();
      
      dossierBody.innerHTML = `
        <div class="dossier-title-bar">
          <h2 style="font-size: 1.1rem; color: var(--neon-cyan);">${data.title}</h2>
        </div>
        <div class="dossier-meta-grid">
          <span class="dossier-meta-label">${state.lang === 'PT' ? 'ATRIBUIÇÃO' : 'ROLE'}:</span>
          <span class="dossier-meta-val">${data.role}</span>
          <span class="dossier-meta-label">${state.lang === 'PT' ? 'ORGANIZAÇÃO' : 'ORGANIZATION'}:</span>
          <span class="dossier-meta-val">${data.org}</span>
          <span class="dossier-meta-label">${state.lang === 'PT' ? 'REGISTRO' : 'PERIOD'}:</span>
          <span class="dossier-meta-val">${data.period}</span>
          <span class="dossier-meta-label">STATUS:</span>
          <span class="dossier-meta-val" style="color: var(--neon-cyan);">${data.status}</span>
        </div>
        <p class="dossier-desc-text">${data.desc}</p>
        <h4 class="dossier-tasks-title">${state.lang === 'PT' ? 'ATIVIDADES_CHAVE_REGISTRADAS' : 'KEY_ACTIVITIES_LOGGED'}:</h4>
        <ul class="dossier-task-list">
          ${data.tasks.map(t => `
            <li class="dossier-task-item">
              <span class="dossier-bullet">»</span>
              <span>${t}</span>
            </li>
          `).join('')}
        </ul>
      `;

      modal.classList.remove("hidden");
    });
  });

  closeDossierBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    sounds.click();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      sounds.click();
    }
  });

  // -------------------------------------------------------------
  // 6. CONTROLADOR DO SLIDESHOW DE TELAS DOS PROJETOS
  // -------------------------------------------------------------
  const projectSlides = document.querySelectorAll(".project-slide");
  const projectTextBlocks = document.querySelectorAll(".project-text-block");
  const btnPrev = document.getElementById("btn-prev-project");
  const btnNext = document.getElementById("btn-next-project");
  const currIndexText = document.getElementById("curr-proj-index");

  function showProject(index) {
    // Garantir índice circular
    if (index >= projectSlides.length) index = 0;
    if (index < 0) index = projectSlides.length - 1;
    
    state.currProject = index;

    // Resetar classes
    projectSlides.forEach(slide => slide.classList.remove("active"));
    projectTextBlocks.forEach(block => block.classList.remove("active"));

    // Ativar atuais
    projectSlides[index].classList.add("active");
    projectTextBlocks[index].classList.add("active");
    
    // Atualizar contador
    currIndexText.textContent = String(index + 1).padStart(2, "0");
    const totalEl = document.getElementById("total-proj");
    if (totalEl) totalEl.textContent = String(projectSlides.length).padStart(2, "0");
  }

  btnPrev.addEventListener("click", () => {
    sounds.click();
    showProject(state.currProject - 1);
    resetProjectAutoplay();
  });

  btnNext.addEventListener("click", () => {
    sounds.click();
    showProject(state.currProject + 1);
    resetProjectAutoplay();
  });

  function startProjectAutoplay() {
    state.projectInterval = setInterval(() => {
      showProject(state.currProject + 1);
    }, 15000); // Rotacionar telas automaticamente a cada 15 segundos
  }

  function resetProjectAutoplay() {
    clearInterval(state.projectInterval);
    startProjectAutoplay();
  }

  startProjectAutoplay();

  // -------------------------------------------------------------
  // 7. FORMULÁRIO DE TRANSMISSÃO NEURAL GMAIL
  // -------------------------------------------------------------
  const contactForm = document.getElementById("gmail-neural-form");
  const transStateText = document.getElementById("transmission-state");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sounds.granted();

    const name = document.getElementById("gmail-sender-name").value;
    const email = document.getElementById("gmail-sender-email").value;
    const message = document.getElementById("gmail-sender-message").value;

    // Alterar visual do status
    transStateText.textContent = state.lang === 'PT' ? "ENVIANDO TRANSMISSÃO..." : "DISPATCHING TRANSMISSION...";
    transStateText.className = "text-neon-pink animate-pulse";

    // Play tone repetido de envio
    let repeats = 0;
    let synthLoop = setInterval(() => {
      playTone([700 + repeats * 100, 1000 + repeats * 50], 'triangle', 0.05, [0.03, 0.001]);
      repeats++;
      if (repeats > 6) clearInterval(synthLoop);
    }, 80);

    setTimeout(() => {
      transStateText.textContent = state.lang === 'PT' ? "TRANSMISSÃO DISPARADA!" : "NEURAL STREAM SUCCESS!";
      transStateText.className = "text-neon-cyan";
      
      // Empacotar os dados em um mailto tático seguro para disparar Gmail/Mail client
      const subject = encodeURIComponent(state.lang === 'PT' ? `Contato Portfólio - ${name}` : `Portfolio Contact - ${name}`);
      const body = encodeURIComponent(
        state.lang === 'PT' 
          ? `Olá Matheus,\n\n${message}\n\n---\nRecrutador: ${name}\nEmail de Retorno: ${email}` 
          : `Hello Matheus,\n\n${message}\n\n---\nSender: ${name}\nReply-To: ${email}`
      );
      
      window.location.href = `mailto:matheushtms04@gmail.com?subject=${subject}&body=${body}`;
      
      // Resetar form
      contactForm.reset();
    }, 1500);
  });

  // -------------------------------------------------------------
  // 8. ASSISTENTE DE IA SIMULADO (MATHEUS-GPT CORE BILÍNGUE)
  // -------------------------------------------------------------
  const chatDisplay = document.getElementById("ai-chat-history");
  const chatInput = document.getElementById("chat-input");
  const chatSubmit = document.getElementById("chat-submit");

  const aiDatabase = {
    PT: {
      "why-hire": "Contratar o Matheus trará dinamismo e versatilidade técnica para a sua equipe. Ele é um estudante de Engenharia de Software da PUC Minas altamente focado no desenvolvimento Web. O diferencial do Matheus está na junção de uma base técnica consolidada (Java, Python, Javascript) com excelente capacidade de marketing digital e comunicação estratégica. Ele não é apenas alguém que programa, mas alguém que sabe criar soluções integradas e se comunicar fluentemente com equipes, clientes e públicos de redes sociais.",
      "ai-experience": "Matheus tem interesse genuíno e estuda algoritmos de Inteligência Artificial com ênfase em Lógica de Programação e Algoritmos de Recomendação. Ele busca aplicar essas lógicas para otimização de interfaces web inteligentes, fluxos inteligentes de atendimento e inteligência analítica de negócios.",
      "puc-project": "Na PUC Minas, o Matheus Malta é uma força ativa na extensão universitária do curso de Engenharia de Software. Ele atua na equipe de Gestão de Comunicação, produzindo conteúdo técnico de alta relevância sobre desenvolvimento, organizando logísticas de eventos acadêmicos e integrando a comunidade estudantil aos novos padrões da indústria tecnológica.",
      "future-goals": "O Matheus está projetando sua carreira para dominar a engenharia de sistemas em larga escala. Ele visa atuar fortemente na modelagem Fullstack com tecnologias ágeis, desenvolvendo tanto interfaces deslumbrantes com JavaScript no front-end quanto APIs robustas em Python ou Java no back-end, sempre priorizando qualidade de código e desempenho.",
      "hello": "Saudações, humano! Estou conectado à base de conhecimento do Matheus. Do que você precisa saber hoje? Tente perguntar sobre suas 'habilidades', 'projetos' ou digite um dos botões rápidos acima.",
      "help": "Você pode me perguntar sobre: 'habilidades', 'experiência', 'projetos', 'oficina', 'contato', 'redes sociais' ou clicar em um dos botões rápidos de diretrizes do sistema.",
      "default": "Diretriz recebida. Meus algoritmos indicam que Matheus Malta possui sólida capacitação técnica. Para detalhes exatos, tente digitar palavras-chave como 'habilidades', 'experiência', 'contatos' ou use os prompts rápidos de análise."
    },
    EN: {
      "why-hire": "Hiring Matheus will inject technical versatility and dynamic energy into your engineering cohorts. As a PUC Minas Software Engineering student, his strengths lie in merging a robust coding base (Java, Python, JS) with exceptional marketing skills and visual communication. He goes beyond simple coding; he constructs coherent interfaces and excels at technical interactions across cross-functional groups.",
      "ai-experience": "Matheus focuses his intelligence research on computer logic and Recommendation Algorithms. He plans to utilize these models to construct data-rich smart web structures, user behavior tracking, and optimized business intelligences.",
      "puc-project": "At PUC Minas, Matheus is an active lead in extension groups for Software Engineering. He serves on the Communications Management Board, drafting tech articles, managing academic event pipelines, and building channels connecting students with tech market trends.",
      "future-goals": "Matheus aims to design large-scale, high-performance web systems. He is preparing to lead agile Fullstack pipelines, serving sleek front-ends in JavaScript and deploying robust back-end microservices in Python or Java with strict requirements quality.",
      "hello": "Greetings, human! Connected to Matheus's cognitive base. What information streams do you require? Ask about 'skills', 'experience', or click the quick prompt nodes.",
      "help": "Operational queries: 'skills', 'experience', 'projects', 'contacts', 'links', or select the quick launch buttons above.",
      "default": "Command processed. Knowledge banks confirm high competency levels. Query terms like 'skills', 'projects', or 'experience' for custom data blocks."
    }
  };

  function parseCustomQuestion(text) {
    const q = text.toLowerCase();
    const db = aiDatabase[state.lang];
    
    if (q.includes("contratar") || q.includes("hire") || q.includes("why")) {
      return db["why-hire"];
    }
    if (q.includes("inteligência artificial") || q.includes("ia") || q.includes("ai") || q.includes("recomendacao")) {
      return db["ai-experience"];
    }
    if (q.includes("puc") || q.includes("faculdade") || q.includes("extension") || q.includes("extensao")) {
      return db["puc-project"];
    }
    if (q.includes("carreira") || q.includes("focus") || q.includes("foco") || q.includes("objetivo") || q.includes("future")) {
      return db["future-goals"];
    }
    if (q.includes("java") || q.includes("python") || q.includes("javascript") || q.includes("habilidade") || q.includes("skills") || q.includes("tecnologia")) {
      return state.lang === "PT" 
        ? "Matheus é proficiente em JavaScript, Python, Java, HTML5, CSS3, e modelagem no Figma. Ele domina lógica de programação avançada, metodologias ágeis (Scrum), versionamento com Git/GitHub e integração com APIs. Dê uma olhada no painel de 'Matriz de Habilidades' à direita para o mapa detalhado."
        : "Matheus is proficient in JavaScript, Python, Java, HTML5, CSS3, and Figma prototyping. He maintains programming logic excellence, Git/GitHub source loops, Scrum loops, and API integrations. Review the right 'Skills Matrix' for visual data.";
    }
    if (q.includes("oficina") || q.includes("workshop") || q.includes("sistema") || q.includes("gestao")) {
      return state.lang === "PT"
        ? "Ele desenvolveu de forma autônoma e acadêmica um Sistema de Gestão de peças e controle de inventário para oficina utilizando Java SE, HTML e CSS. Esse sistema ajudou a catalogar materiais e otimizar ordens de serviço."
        : "He engineered a standalone parts cataloging inventory software for a local car workshop utilizing Java SE, HTML5, and CSS3, streamlining logistical mechanic registers.";
    }
    if (q.includes("spagnol") || q.includes("odontologia") || q.includes("dental") || q.includes("marketing") || q.includes("estagio")) {
      return state.lang === "PT"
        ? "Matheus atuou como Estagiário de Marketing e Logística na Spagnol Odontologia (Jan a Ago 2024). Ele foi o cérebro das redes sociais da clínica, estruturando estratégias visuais padronizadas, gerenciando a comunicação e a logística interna de pacientes."
        : "Matheus served as a Marketing and Logistics Intern at Spagnol Odontology (Jan - Aug 2024). He designed clinic social campaigns, managed client communications, and resolved internal logistics.";
    }
    if (q.includes("contato") || q.includes("contact") || q.includes("telefone") || q.includes("email") || q.includes("gmail")) {
      return state.lang === "PT"
        ? "Você pode entrar em contato através da aba [ CANAL_NEURAL_GMAIL ] enviando uma mensagem direta! Alternativamente, use o e-mail: matheushtms04@gmail.com ou o telefone: (31) 97104-6149."
        : "Connect immediately via our [ NEURAL_GMAIL_CHANNEL ] tab for instant form dispatching! Or use email: matheushtms04@gmail.com or mobile: (31) 97104-6149.";
    }
    if (q.includes("ola") || q.includes("oi") || q.includes("hello") || q.includes("hi") || q.includes("salve")) {
      return db["hello"];
    }
    if (q.includes("ajuda") || q.includes("help")) {
      return db["help"];
    }
    
    return db["default"];
  }

  function handleSendMessage(promptKey = null, customText = null) {
    if (state.typingActive) return;
    
    let userText = "";
    let botResponse = "";

    if (promptKey) {
      userText = document.querySelector(`.btn-prompt[data-prompt="${promptKey}"]`).textContent;
      botResponse = aiDatabase[state.lang][promptKey] || aiDatabase[state.lang]["default"];
    } else if (customText) {
      userText = customText.trim();
      if (!userText) return;
      botResponse = parseCustomQuestion(userText);
    } else {
      userText = chatInput.value.trim();
      if (!userText) return;
      botResponse = parseCustomQuestion(userText);
      chatInput.value = "";
    }

    appendChatMessage("[RECRUTADOR_CONECTADO]", userText, "user");
    state.typingActive = true;
    
    const loadingMessage = appendChatMessage("[SYS_INTELECTO]", state.lang === 'PT' ? "Processando dados..." : "Processing telemetry...", "bot loading");
    
    let soundInterval = setInterval(() => {
      if (state.audioEnabled) sounds.typing();
    }, 100);

    setTimeout(() => {
      clearInterval(soundInterval);
      loadingMessage.remove();
      appendChatMessage("[SYS_INTELECTO]", botResponse, "bot");
      state.typingActive = false;
      sounds.granted();
    }, 1200);
  }

  function appendChatMessage(sender, text, typeClass) {
    const msg = document.createElement("div");
    msg.className = `chat-message ${typeClass}`;
    msg.innerHTML = `
      <span class="message-sender">${sender}:</span>
      <p class="message-text">${text}</p>
    `;
    chatDisplay.appendChild(msg);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    return msg;
  }

  chatSubmit.addEventListener("click", () => handleSendMessage());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
  
  document.querySelectorAll(".btn-prompt").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-prompt");
      handleSendMessage(key);
    });
  });

  // -------------------------------------------------------------
  // 9. CORE INTERPRETER TERMINAL (VISTA TERMINAL)
  // -------------------------------------------------------------
  const termHistory = document.getElementById("terminal-history");
  const termInput = document.getElementById("terminal-input");

  const termCommands = {
    PT: {
      help: () => `
Comandos disponíveis para controle do Terminal do Sistema:
  <span class="text-neon-pink">help</span>          - Exibe este painel de ajuda e instruções de rede
  <span class="text-neon-pink">skills</span>        - Imprime a matriz de módulos de habilidades do desenvolvedor
  <span class="text-neon-pink">experience</span>    - Lista todo o histórico cronológico de execução (Trabalho/Acadêmico)
  <span class="text-neon-pink">education</span>     - Imprime os dados de base acadêmica de formação
  <span class="text-neon-pink">contact</span>       - Exibe conexões e canais imediatos de comunicação com Matheus
  <span class="text-neon-pink">sysinfo</span>       - Retorna dados estruturais da máquina virtual atual
  <span class="text-neon-pink">clear</span>         - Limpa a tela do console de dados
  <span class="text-neon-pink">print</span>         - Ativa a renderização do currículo para impressão em PDF tradicional
  
Comandos secretos/hack:
  <span class="text-neon-pink">matrix</span>        - Ativa/desativa a tempestade de códigos digitais binários na HUD
  <span class="text-neon-pink">hack</span>          - Executa uma invasão criptográfica no banco de dados
`,
      skills: () => `
MATRIZ DE MÓDULOS DE HARDWARE TÉCNICOS:
  » <span class="text-neon-cyan">JavaScript / ES6 / Web Core</span>    [████████████████░░░░] 80% (Alta Performance)
  » <span class="text-neon-cyan">Python / Scripting / Data</span>      [███████████████░░░░░] 75% (Avançado)
  » <span class="text-neon-cyan">Java / POO / Desktop Engine</span>    [██████████████░░░░░░] 70% (Sólido)
  » <span class="text-neon-cyan">HTML5 / CSS3 / Vanilla Layout</span>  [██████████████████░░] 90% (Excelente)
  » <span class="text-neon-pink">Algoritmos de Recomendação</span>     [█████████████░░░░░░░] 65% (Em Evolução)
  » <span class="text-neon-pink">Lógica de Programação</span>          [█████████████████░░░] 85% (Forte)
  » <span class="text-neon-amber">Figma / UI-UX / Web Design</span>     [████████████████░░░░] 80% (Proficiente)
  » <span class="text-neon-amber">Marketing & Identidade Visual</span>  [█████████████████░░░] 85% (Proficiente)
  » <span class="text-neon-amber">Git / GitHub / Scrum (Ágil)</span>    [████████████████░░░░] 80% (Proficiente)
  » <span class="text-purple-500">Inglês</span>                         [███████░░░░░░░░░░░░░] 35% (Básico)
`,
      experience: () => `
CRONOLOGIA DE EXECUÇÃO DE SISTEMAS (HISTÓRICO):
--------------------------------------------------------------------------------
0. <span class="text-neon-cyan">Rede Decisão</span> | Suporte de TI (Mar 2026 - Atual)
   - Responsável por toda a estrutura de TI e suporte da rede.
--------------------------------------------------------------------------------
1. <span class="text-neon-cyan">Spagnol Odontologia</span> | Estagiário de Marketing e Logística (Jan 2024 - Ago 2024)
   - Execução de marketing estratégico, layout visual nas redes sociais.
   - Gestão operacional de logística de comunicação rápida pré/pós consulta.
--------------------------------------------------------------------------------
2. <span class="text-neon-amber">Desenvolvedor de Sistemas</span> | Projeto Pessoal & Acadêmico
   - Construção de Sistema de Gestão de peças em Java SE para oficina de reparos.
   - Design estrutural de campanhas digitais e marketing visual clínico.
--------------------------------------------------------------------------------
3. <span class="text-neon-pink">PUC Minas (Extensão)</span> | Integrante e Gestor de Comunicação Digital
   - Apoio técnico ativista para fortalecimento das redes de Engenharia de Software.
   - Criação de conteúdos educacionais técnicos sobre tecnologia e computação.
`,
      education: () => `
BASE ACADÊMICA ENTRADA / SAÍDA:
  » <span class="text-neon-cyan">Graduação em Engenharia de Software</span> (Previsão: 1º semestre de 2028)
    Pontifícia Universidade Católica de Minas Gerais (PUC Minas) - 5º Período Atual.
  » <span class="text-white">Ensino Médio Completo</span> (Conclusão: 2022)
    Instituto Adventista Brasil Central.
`,
      contact: () => `
CONEXÕES DE REDE DISPONÍVEIS:
  - <span class="text-neon-cyan">Email Direct:</span> matheushtms04@gmail.com
  - <span class="text-neon-cyan">Neural Cell/WhatsApp:</span> (31) 97104-6149
  - <span class="text-neon-cyan">LinkedIn Node:</span> https://www.linkedin.com/in/matheus-malta-a39b66255/
  - <span class="text-neon-cyan">GitHub Core Repository:</span> https://github.com/matheushtms/matheushtms
`,
      sysinfo: () => `
INFORMAÇÕES DO SISTEMA:
  - HostName: MATHEUS-MALTA-OS
  - Kernel: ANTIGRAVITY-CORE-v4.0.28-Windows
  - Latency Stream: ${pingVal ? pingVal.textContent : '12ms'} (Status: ONLINE_SECURE)
  - UI Mode: Sci-Fi Interactive Glass HUD System
  - Synthesizer FX: Web Audio API Oscillator Matrix
  - Sandbox: SECURE_ENVIRONMENT
`,
      hack: () => {
        sounds.granted();
        setTimeout(() => {
          sounds.denied();
          setTimeout(() => sounds.granted(), 150);
        }, 100);
        
        const overlay = document.querySelector(".crt-glitch-overlay");
        overlay.style.background = "rgba(0, 255, 0, 0.05)";
        
        setTimeout(() => {
          overlay.style.background = "rgba(0, 240, 255, 0.002)";
        }, 1000);

        return `
<span class="text-neon-pink" style="font-weight:bold; font-size:1.1rem;">[!!! AVISO !!!] PROTOCOLO DE CONEXÃO SECUNDÁRIA INICIADO</span>
<span class="text-neon-cyan">Infiltrando base criptográfica do Matheus...
Acessando diretórios protegidos... Acesso Concedido!
Chaves secretas encontradas:
- Matheus adora codificar ouvindo trilhas sonoras de Cyberpunk 2077 e Synthwave.
- O sistema de peças da oficina foi o primeiro grande código estruturado em Java.
- Ele possui excelente adaptabilidade logística e comunicação avançada.</span>
<span class="text-neon-pink">PROTOCOLO ENCERRADO COM SUCESSO. CONEXÃO SEGURA RESTABELECIDA.</span>
`;
      }
    },
    EN: {
      help: () => `
Available terminal command nodes:
  <span class="text-neon-pink">help</span>          - Display this instructions help desk panel
  <span class="text-neon-pink">skills</span>        - Print developer technical competencies modules matrix
  <span class="text-neon-pink">experience</span>    - Chronological loop log of work and academic runs
  <span class="text-neon-pink">education</span>     - Print core academic structures and certifications
  <span class="text-neon-pink">contact</span>       - Print immediate network connection protocols for Matheus
  <span class="text-neon-pink">sysinfo</span>       - Returns telemetry variables of current virtual machine
  <span class="text-neon-pink">clear</span>         - Wipes clean the shell interface logs
  <span class="text-neon-pink">print</span>         - Dispatches traditional paper layout compiler (Ctrl+P)
  
Hacker / Secret command cores:
  <span class="text-neon-pink">matrix</span>        - Toggle vertical falling digital green code matrix rain on HUD
  <span class="text-neon-pink">hack</span>          - Infiltrate protected local directories simulation
`,
      skills: () => `
HARDWARE SKILL MATRIX CHIPS:
  » <span class="text-neon-cyan">JavaScript / ES6 / Web Core</span>    [████████████████░░░░] 80% (High-Performance)
  » <span class="text-neon-cyan">Python / Scripting / Data</span>      [███████████████░░░░░] 75% (Advanced)
  » <span class="text-neon-cyan">Java / OOP / Desktop Engine</span>    [██████████████░░░░░░] 70% (Solid Base)
  » <span class="text-neon-cyan">HTML5 / CSS3 / Vanilla Layout</span>  [██████████████████░░] 90% (Excellent)
  » <span class="text-neon-pink">Recommendation Algorithms</span>     [█████████████░░░░░░░] 65% (In Development)
  » <span class="text-neon-pink">Programming Logic</span>              [█████████████████░░░] 85% (Strong)
  » <span class="text-neon-amber">Figma / UI-UX / Web Design</span>     [████████████████░░░░] 80% (Proficient)
  » <span class="text-neon-amber">Digital Marketing & Branding</span>   [█████████████████░░░] 85% (Proficient)
  » <span class="text-neon-amber">Git / GitHub / Scrum (Agile)</span>   [████████████████░░░░] 80% (Proficient)
  » <span class="text-purple-500">English</span>                        [███████░░░░░░░░░░░░░] 35% (Basic)
`,
      experience: () => `
CHRONOLOGICAL RUN MODULES (HISTORY):
--------------------------------------------------------------------------------
0. <span class="text-neon-cyan">Rede Decisão</span> | IT Support (Mar 2026 - Present)
   - Responsible for the entire IT structure and support of the network.
--------------------------------------------------------------------------------
1. <span class="text-neon-cyan">Spagnol Odontology</span> | Marketing & Logistics Intern (Jan 2024 - Aug 2024)
   - Created digital visual strategies, uniform network brand guidelines.
   - Administered customer operations, onboarding pipelines, support.
--------------------------------------------------------------------------------
2. <span class="text-neon-amber">Systems Developer</span> | Personal & Academic Standalone
   - Developed auto inventory parts controller in Java SE for workshops.
   - Outlined visual templates, design layouts, digital brand pipelines.
--------------------------------------------------------------------------------
3. <span class="text-neon-pink">PUC Minas (Extension)</span> | Digital Media Coordinator & Member
   - Designed technical content streams about coding, logic and frameworks.
   - Guided event logistics, student onboarding cohorts.
`,
      education: () => `
ACADEMIC CERTIFICATIONS:
  » <span class="text-neon-cyan">B.S. in Software Engineering</span> (Expected Graduation: 1st half of 2028)
    Pontifical Catholic University of Minas Gerais - Currently in 5th Period.
  » <span class="text-white">High School Degree</span> (Concluded: 2022)
    Adventist High School Center.
`,
      contact: () => `
STABLE PORT PROTOCOLS:
  - <span class="text-neon-cyan">Email Direct:</span> matheushtms04@gmail.com
  - <span class="text-neon-cyan">Neural Cell/WhatsApp:</span> (31) 97104-6149
  - <span class="text-neon-cyan">LinkedIn Node:</span> https://www.linkedin.com/in/matheus-malta-a39b66255/
  - <span class="text-neon-cyan">GitHub Core Repository:</span> https://github.com/matheushtms/matheushtms
`,
      sysinfo: () => `
CORE LOG TELEMETRY:
  - HostName: MATHEUS-MALTA-OS
  - Kernel: ANTIGRAVITY-CORE-v4.0.28-Windows
  - Latency Stream: ${pingVal ? pingVal.textContent : '12ms'} (Status: ONLINE_SECURE)
  - UI Mode: Sci-Fi Interactive Glass HUD System
  - Synthesizer FX: Web Audio API Oscillator Matrix
  - Sandbox: SECURE_ENVIRONMENT
`,
      hack: () => {
        sounds.granted();
        setTimeout(() => {
          sounds.denied();
          setTimeout(() => sounds.granted(), 150);
        }, 100);
        
        const overlay = document.querySelector(".crt-glitch-overlay");
        overlay.style.background = "rgba(0, 255, 0, 0.05)";
        
        setTimeout(() => {
          overlay.style.background = "rgba(0, 240, 255, 0.002)";
        }, 1000);

        return `
<span class="text-neon-pink" style="font-weight:bold; font-size:1.1rem;">[!!! WARNING !!!] OVERRIDE PROTOCOL INITIATED</span>
<span class="text-neon-cyan">Decrypting Matheus's data files...
Accessing secure folders... Access Granted!
Telemetry nodes extracted:
- Matheus likes to program listing to Cyberpunk 2077 OST and Synthwave stream blocks.
- The car workshop system was his first large, structured OOP program in Java.
- He demonstrates exceptional logistical adapters and cross-cohort communication skills.</span>
<span class="text-neon-pink">OVERRIDE TERMINATED. SECURE COMMS REESTABLISHED.</span>
`;
      }
    }
  };

  function handleTerminalCommand() {
    const rawInput = termInput.value;
    const cmd = rawInput.trim().toLowerCase();
    termInput.value = "";

    if (!rawInput.trim()) return;

    appendTerminalLine(`<span class="terminal-prompt-string">guest@matheus-network:~$</span> <span class="text-white">${rawInput}</span>`);

    if (cmd === "matrix") {
      state.matrixActive = !state.matrixActive;
      if (state.matrixActive) {
        initMatrix();
        sounds.matrix();
        appendTerminalLine(state.lang === 'PT' ? `Código Matrix: <span class="text-neon-cyan">ATIVADO</span>.` : `Matrix code rain: <span class="text-neon-cyan">ENABLED</span>.`);
      } else {
        appendTerminalLine(state.lang === 'PT' ? `Código Matrix: <span class="text-neon-pink">DESATIVADO</span>.` : `Matrix code rain: <span class="text-neon-pink">DISABLED</span>.`);
      }
      termHistory.scrollTop = termHistory.scrollHeight;
      return;
    }

    if (cmd === "clear") {
      termHistory.innerHTML = "";
      return;
    }

    if (cmd === "print") {
      setTimeout(() => window.print(), 500);
      appendTerminalLine(state.lang === 'PT' ? "Decodificando currículo tradicional para impressão..." : "Compiling traditional document for print streams...");
      termHistory.scrollTop = termHistory.scrollHeight;
      return;
    }

    const langCommands = termCommands[state.lang];
    if (langCommands[cmd]) {
      const output = langCommands[cmd]();
      if (output) {
        appendTerminalLine(output);
        sounds.granted();
      }
    } else {
      appendTerminalLine(
        state.lang === 'PT' 
          ? `Comando não reconhecido: <span class="text-neon-pink">${rawInput}</span>. Digite <span class="text-neon-cyan">help</span> para instruções.`
          : `Command unrecognised: <span class="text-neon-pink">${rawInput}</span>. Type <span class="text-neon-cyan">help</span> for specifications.`
      );
      sounds.denied();
    }
    
    termHistory.scrollTop = termHistory.scrollHeight;
  }

  function appendTerminalLine(htmlContent) {
    const line = document.createElement("div");
    line.className = "terminal-line-output font-mono";
    line.style.marginTop = "0.5rem";
    line.innerHTML = htmlContent;
    termHistory.appendChild(line);
  }

  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleTerminalCommand();
    }
  });

  document.querySelector(".terminal-panel").addEventListener("click", () => {
    termInput.focus();
  });

  // -------------------------------------------------------------
  // 10. TABS CONTROLLER (ABAS DE EXIBIÇÃO)
  // -------------------------------------------------------------
  const tabs = document.querySelectorAll(".nav-tab");
  const viewPanels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");
      if (!target) return; // Caso do botão de impressão

      tabs.forEach(t => t.classList.remove("active"));
      viewPanels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(target);
      if (targetPanel) {
        targetPanel.classList.add("active");
        
        if (target === "terminal-view") {
          setTimeout(() => document.getElementById("terminal-input").focus(), 100);
        }
      }
    });
  });

  document.getElementById("btn-print-resume").addEventListener("click", () => {
    window.print();
  });

});
