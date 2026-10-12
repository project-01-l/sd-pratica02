const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  completed: new Set(),
  points: 0,
  quizScore: 0,
  started: false,
  finished: false,
  startTime: null,
  elapsedSeconds: 0,
  timerInterval: null,
  timeBonus: 0,
  phishingChecked: false,
  passwordAnswered: false,
  mfaAnswered: false,
  quizIndex: 0,
  quizQuestionAnswered: false,
  quizAnswers: [],
  quizFinished: false
};

const missionIds = ["phishing", "pin", "storage", "quiz"];

const missionPoints = {
  phishing: 25,
  pin: 20,
  storage: 15
};

const quizQuestions = [
  {
    question: "O que caracteriza um crime cibernético?",
    instruction: "Escolha a alternativa mais precisa.",
    options: [
      "Qualquer atividade feita usando um computador.",
      "Uma conduta ilegal praticada com o uso de dispositivos ou sistemas digitais, ou contra eles.",
      "Somente um ataque feito por alguém que trabalha com tecnologia.",
      "Qualquer erro cometido ao usar a internet."
    ],
    correct: 1,
    explanation: "Crimes cibernéticos envolvem condutas ilegais que usam tecnologias digitais como meio ou como alvo."
  },
  {
    question: "Qual é uma diferença importante entre hacker e cracker?",
    instruction: "Considere o contexto e a autorização para agir.",
    options: [
      "Hacker é sempre criminoso; cracker é sempre profissional.",
      "Os dois termos significam exatamente a mesma coisa em todos os contextos.",
      "Hacker pode estudar e testar sistemas de forma autorizada; cracker costuma ser associado a ações de quebra ou invasão maliciosa.",
      "Cracker é o nome dado a qualquer pessoa que conserta computadores."
    ],
    correct: 2,
    explanation: "Os termos variam conforme o contexto, mas autorização, objetivo e conduta são fundamentais para avaliar uma atividade."
  },
  {
    question: "Você recebe uma mensagem dizendo que sua conta será bloqueada se não clicar em um link imediatamente. O que deve fazer?",
    instruction: "Escolha a atitude mais segura.",
    options: [
      "Clicar logo para evitar o bloqueio.",
      "Não clicar e verificar o aviso por um aplicativo ou site oficial, acessado por conta própria.",
      "Responder à mensagem pedindo mais informações pessoais.",
      "Encaminhar o link para amigos testarem."
    ],
    correct: 1,
    explanation: "A urgência pode ser usada para pressionar a vítima. Verifique o aviso por um canal oficial, sem usar o link recebido."
  },
  {
    question: "Qual prática ajuda a proteger melhor suas contas?",
    instruction: "Pense no que aconteceria se uma senha fosse descoberta.",
    options: [
      "Usar a mesma senha em todos os serviços.",
      "Criar senhas curtas com o nome de alguém da família.",
      "Anotar a senha em uma publicação privada nas redes sociais.",
      "Usar senhas longas e únicas e, se possível, um gerenciador de senhas."
    ],
    correct: 3,
    explanation: "Senhas únicas limitam o impacto de um vazamento. Um gerenciador pode ajudar a criar e guardar senhas fortes."
  },
  {
    question: "O que são cookies e cache no navegador?",
    instruction: "Escolha a descrição correta.",
    options: [
      "Cookies podem guardar dados de sessão ou preferências; o cache guarda cópias de recursos para acelerar carregamentos.",
      "São programas que necessariamente roubam senhas.",
      "São a mesma coisa e sempre precisam ser apagados diariamente.",
      "São arquivos que impedem qualquer rastreamento na internet."
    ],
    correct: 0,
    explanation: "Cookies e cache têm funções diferentes. Apagá-los pode encerrar sessões ou fazer páginas carregarem novamente, mas não resolve todos os problemas de segurança."
  },
  {
    question: "Um aplicativo de lanterna pede acesso aos seus contatos e à sua localização. Qual é a melhor atitude?",
    instruction: "Avalie se as permissões fazem sentido para a função do aplicativo.",
    options: [
      "Aceitar tudo para o aplicativo funcionar melhor.",
      "Negar permissões que não sejam necessárias e conferir as opções de privacidade.",
      "Dar as permissões e esquecer o assunto.",
      "Enviar seus contatos ao desenvolvedor para confirmar a conta."
    ],
    correct: 1,
    explanation: "As permissões devem ser compatíveis com a finalidade do aplicativo. Você pode revisar ou revogar acessos nas configurações."
  },
  {
    question: "O que faz um profissional de cibersegurança?",
    instruction: "Considere atividades de prevenção, análise e resposta.",
    options: [
      "Invade qualquer sistema que queira, sem precisar de autorização.",
      "Trabalha apenas consertando peças de computadores.",
      "Ajuda a identificar riscos, proteger sistemas, investigar incidentes e testar a segurança com autorização.",
      "Garante que nenhum sistema jamais será atacado."
    ],
    correct: 2,
    explanation: "A área inclui prevenção, testes autorizados, monitoramento e resposta a incidentes. Nenhum profissional pode garantir risco zero."
  },
  {
    question: "Qual é uma forma adequada de aprender testes de segurança?",
    instruction: "Escolha a alternativa que respeita limites legais e éticos.",
    options: [
      "Testar a rede da escola sem avisar ninguém.",
      "Tentar entrar na conta de outra pessoa para treinar.",
      "Executar ferramentas em qualquer site público.",
      "Usar laboratórios educativos e ambientes próprios ou autorizados."
    ],
    correct: 3,
    explanation: "Laboratórios próprios e plataformas de treino permitem aprender técnicas sem invadir sistemas ou prejudicar outras pessoas."
  },
  {
    question: "Você recebe um alerta de acesso desconhecido à sua conta. O que deve fazer primeiro?",
    instruction: "Não use links enviados por uma mensagem suspeita.",
    options: [
      "Ignorar o alerta se a conta ainda estiver funcionando.",
      "Enviar sua senha para o suporte confirmar a identidade.",
      "Acessar o serviço pelo aplicativo ou endereço oficial, verificar a atividade e proteger a conta.",
      "Publicar o alerta com seus dados para pedir ajuda."
    ],
    correct: 2,
    explanation: "Entre pelo canal oficial, verifique sessões e atividades, troque a senha se necessário e revise a verificação em duas etapas."
  },
  {
    question: "Na sua opinião, qual hábito de segurança digital é mais importante para jovens? Explique sua escolha.",
    instruction: "Escreva pelo menos 25 caracteres e 5 palavras. Dê um motivo ou exemplo.",
    open: true,
    explanation: "Uma boa resposta apresenta um hábito concreto e explica como ele ajuda a reduzir riscos."
  }
];

function showView(viewId) {
  const target = $("#" + viewId);

  if (!target) return;

  $$(".view").forEach((view) => view.classList.remove("active"));
  target.classList.add("active");

  $$(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.target === viewId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showFeedback(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = "feedback-box show " + type;
}

function clearFeedback(element) {
  if (!element) return;

  element.textContent = "";
  element.className = "feedback-box";
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return String(minutes).padStart(2, "0") + ":" +
    String(remainder).padStart(2, "0");
}

function startTimer() {
  if (state.started || state.finished) return;

  state.started = true;
  state.startTime = Date.now();

  const timerBox = $(".timer-box");
  if (timerBox) timerBox.classList.add("running");

  state.timerInterval = setInterval(() => {
    if (!state.startTime || state.finished) return;

    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);

    const display = $("#timer-display");
    if (display) display.textContent = formatTime(state.elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  const timerBox = $(".timer-box");
  if (timerBox) timerBox.classList.remove("running");
}

function updateDashboard() {
  const completedCount = state.completed.size;
  const percent = Math.round((completedCount / missionIds.length) * 100);

  $("#progress-percent").textContent = percent + "%";
  $("#progress-fill").style.width = percent + "%";
  $("#progress-caption").textContent =
    completedCount === 0
      ? "Nenhuma missão concluída."
      : completedCount === 1
        ? "1 de 4 missões concluída."
        : completedCount + " de 4 missões concluídas.";

  $("#header-points").textContent = state.points;

  const statusIds = {
    phishing: "status-phishing",
    pin: "status-pin",
    storage: "status-storage",
    quiz: "status-quiz"
  };

  Object.entries(statusIds).forEach(([mission, id]) => {
    const indicator = $("#" + id);
    if (!indicator) return;

    const done = state.completed.has(mission);
    indicator.classList.toggle("done", done);
    indicator.textContent = done ? "✓" : "";
  });

  $$(".mission-card").forEach((card) => {
    const target = card.dataset.target;
    const mission = {
      "mission-phishing": "phishing",
      "mission-password": "pin",
      "mission-mfa": "storage",
      "mission-quiz": "quiz"
    }[target];

    if (!mission) return;

    const label = card.querySelector(".card-link");
    if (label && state.completed.has(mission)) {
      label.innerHTML = "Missão concluída <b>✓</b>";
    } else if (label) {
      label.innerHTML = "Abrir missão <b>→</b>";
    }
  });
}

function awardMission(mission, points) {
  if (state.completed.has(mission)) return;

  state.completed.add(mission);
  state.points += points;

  updateDashboard();

  if (state.completed.size === missionIds.length) {
    finishLab();
  }
}

function finishLab() {
  if (state.finished) return;

  state.finished = true;

  if (state.startTime) {
    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  }

  stopTimer();

  if (state.elapsedSeconds <= 20 * 60) {
    state.timeBonus = 5;
  } else if (state.elapsedSeconds <= 30 * 60) {
    state.timeBonus = 3;
  } else if (state.elapsedSeconds <= 45 * 60) {
    state.timeBonus = 1;
  } else {
    state.timeBonus = 0;
  }

  state.points += state.timeBonus;
  updateDashboard();
  updateCompletionScreen();
  showView("completion");
}

function updateCompletionScreen() {
  $("#final-points").textContent = state.points;
  $("#final-missions").textContent = state.completed.size + " / 4";
  $("#final-time").textContent = formatTime(state.elapsedSeconds);
  $("#final-time-bonus").textContent = "+" + state.timeBonus + " pontos";
  $("#final-score-fill").style.width =
    Math.min(100, (state.points / 105) * 100) + "%";

  const message = $("#final-score-message");

  if (state.points >= 90) {
    message.textContent =
      "Você teve um ótimo resultado. Confira quais práticas consegue aplicar no dia a dia.";
  } else if (state.points >= 65) {
    message.textContent =
      "Você acertou boa parte das atividades. Revise os pontos em que teve dúvida.";
  } else {
    message.textContent =
      "O resultado mostra os conceitos que vale a pena revisar antes de aplicar essas práticas.";
  }
}

/* Navegação */

$$("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    if (!target) return;

    if (target !== "overview") startTimer();
    showView(target);
  });
});

$("#start-lab").addEventListener("click", () => {
  startTimer();
  showView("mission-phishing");
});

/* Missão 1: identificar sinais de phishing */

$("#check-phishing").addEventListener("click", () => {
  const selected = $$(".selectable-clue:checked").map(
    (input) => input.dataset.clue
  );

  const expected = ["pressure", "link", "generic"];
  const correct =
    selected.length === expected.length &&
    expected.every((clue) => selected.includes(clue));

  if (correct) {
    state.phishingChecked = true;

    showFeedback(
      $("#phishing-feedback"),
      "Correto. A urgência, o link que precisa ser verificado e a saudação genérica são sinais de alerta. A aparência de uma mensagem, por si só, não comprova sua autenticidade.",
      "success"
    );

    $("#complete-phishing").disabled = false;
    $("#check-phishing").disabled = true;
  } else {
    showFeedback(
      $("#phishing-feedback"),
      "Revise a seleção. Marque a pressão para agir, o endereço suspeito e a saudação genérica. A assinatura, sozinha, não prova que a mensagem seja verdadeira.",
      "error"
    );
  }
});

$("#complete-phishing").addEventListener("click", () => {
  if (!state.phishingChecked) return;

  awardMission("phishing", missionPoints.phishing);
  $("#complete-phishing").textContent = "Missão concluída";
  $("#complete-phishing").disabled = true;

  if (!state.finished) {
    showFeedback(
      $("#phishing-feedback"),
      "Missão concluída: você identificou os três sinais de alerta do exemplo.",
      "success"
    );
  }
});

/* Missão 2: estimativa matemática de combinações */

const passwordControls = [
  $("#password-length"),
  $("#set-lower"),
  $("#set-upper"),
  $("#set-digits"),
  $("#set-symbols")
];

function formatBigNumber(number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0
  }).format(number);
}

function updatePasswordSimulator() {
  const length = Number($("#password-length").value);
  const lower = $("#set-lower").checked;
  const upper = $("#set-upper").checked;
  const digits = $("#set-digits").checked;
  const symbols = $("#set-symbols").checked;

  let poolSize = 0;

  if (lower) poolSize += 26;
  if (upper) poolSize += 26;
  if (digits) poolSize += 10;
  if (symbols) poolSize += 32;

  $("#password-stat-length").textContent = length;
  $("#password-stat-length-copy").textContent =
    length + (length === 1 ? " caractere" : " caracteres");
  $("#password-pool-size").textContent = poolSize;

  if (poolSize === 0) {
    $("#password-combinations").textContent = "0";
    $("#password-entropy").textContent = "0 bits";
    $("#password-insight").textContent =
      "Selecione pelo menos um conjunto de caracteres para fazer a estimativa.";
    $("#password-explanation").textContent =
      "Sem caracteres disponíveis, não há combinações para calcular.";
    return;
  }

  const entropy = length * Math.log2(poolSize);
  const log10Combinations = length * Math.log10(poolSize);

  let combinationsText;

  if (log10Combinations < 15) {
    combinationsText = formatBigNumber(Math.round(Math.pow(poolSize, length)));
  } else {
    const exponent = Math.floor(log10Combinations);
    const leading = Math.pow(10, log10Combinations - exponent);
    combinationsText = leading.toFixed(2).replace(".", ",") + " × 10^" + exponent;
  }

  $("#password-combinations").textContent = combinationsText;
  $("#password-entropy").textContent =
    entropy.toLocaleString("pt-BR", {
      maximumFractionDigits: 1
    }) + " bits";

  if (length < 8) {
    $("#password-insight").textContent =
      "Senhas curtas tendem a ter menos combinações. Prefira uma senha longa e exclusiva.";
  } else if (length < 14) {
    $("#password-insight").textContent =
      "Aumentar o comprimento amplia o número de combinações possíveis. Evite padrões previsíveis.";
  } else {
    $("#password-insight").textContent =
      "O comprimento ajuda bastante, mas a senha também precisa ser imprevisível e não reutilizada.";
  }

  $("#password-explanation").textContent =
    "Estimativa teórica: " + poolSize + " caracteres possíveis em cada posição, durante " +
    length + " posição(ões). O cálculo não considera palavras comuns, padrões, vazamentos ou outros métodos de ataque.";
}

passwordControls.forEach((control) => {
  control.addEventListener("input", updatePasswordSimulator);
  control.addEventListener("change", updatePasswordSimulator);
});

updatePasswordSimulator();

$("#complete-pin").addEventListener("click", () => {
  if (state.passwordAnswered) return;

  const selected = $('input[name="password-answer"]:checked');

  if (!selected) {
    showFeedback(
      $("#pin-feedback"),
      "Selecione uma alternativa antes de conferir.",
      "info"
    );
    return;
  }

  if (selected.value === "b") {
    state.passwordAnswered = true;

    showFeedback(
      $("#pin-feedback"),
      "Correto. Senhas longas e únicas reduzem o risco de que o vazamento de uma conta afete outras. Um gerenciador pode ajudar a manter senhas diferentes.",
      "success"
    );

    awardMission("pin", missionPoints.pin);
    $("#complete-pin").textContent = "Resposta conferida";
    $("#complete-pin").disabled = true;
    $("#next-password").disabled = false;
  } else {
    showFeedback(
      $("#pin-feedback"),
      "Essa prática aumenta o risco para a conta. Escolha a alternativa que recomenda senhas longas e únicas.",
      "error"
    );
  }
});

$("#next-password").addEventListener("click", () => {
  startTimer();
  showView("mission-mfa");
});

/* Missão 3: verificação em duas etapas */

const mfaDescriptions = {
  none: {
    title: "A conta depende apenas da senha",
    text: "Se a senha for descoberta, reutilizada ou obtida em um vazamento, não haverá uma segunda etapa para dificultar o acesso."
  },
  sms: {
    title: "Código enviado por SMS",
    text: "É melhor do que não ter uma segunda etapa, mas pode estar sujeito a riscos como troca indevida de chip ou interceptação. Nunca compartilhe o código recebido."
  },
  app: {
    title: "Código gerado por aplicativo",
    text: "Um aplicativo autenticador gera códigos temporários e pode reduzir a dependência da rede telefônica. Proteja o dispositivo e guarde as opções de recuperação."
  },
  passkey: {
    title: "Chave de acesso",
    text: "Passkeys usam criptografia vinculada ao serviço e ao dispositivo ou a um sistema de sincronização. São resistentes a muitos golpes de phishing quando usadas corretamente."
  }
};

$$('input[name="mfa-method"]').forEach((input) => {
  input.addEventListener("change", () => {
    const description = mfaDescriptions[input.value];

    $("#mfa-detail-title").textContent = description.title;
    $("#mfa-detail-text").textContent = description.text;
  });
});

$("#check-mfa").addEventListener("click", () => {
  if (state.mfaAnswered) return;

  const method = $('input[name="mfa-method"]:checked');
  const answer = $('input[name="mfa-answer"]:checked');

  if (!method || !answer) {
    showFeedback(
      $("#mfa-feedback"),
      "Selecione um método para comparar e responda à pergunta antes de conferir.",
      "info"
    );
    return;
  }

  if (answer.value === "c") {
    state.mfaAnswered = true;

    showFeedback(
      $("#mfa-feedback"),
      "Correto. Ative uma opção de verificação adequada ao serviço e mantenha os meios de recuperação protegidos. Nunca compartilhe códigos de autenticação.",
      "success"
    );

    awardMission("storage", missionPoints.storage);
    $("#check-mfa").disabled = true;
    $("#complete-storage").disabled = false;
  } else {
    showFeedback(
      $("#mfa-feedback"),
      "Essa escolha deixa a conta mais exposta. Procure a opção que recomenda uma verificação adicional e meios de recuperação protegidos.",
      "error"
    );
  }
});

$("#complete-storage").addEventListener("click", () => {
  if (!state.mfaAnswered) return;

  $("#complete-storage").textContent = "Missão concluída";
  $("#complete-storage").disabled = true;

  showFeedback(
    $("#mfa-feedback"),
    "Missão concluída. Você comparou métodos de verificação e escolheu uma prática de proteção para a conta.",
    "success"
  );

  showView("mission-quiz");
});

/* Missão 4: questionário */

function renderQuizQuestion() {
  const question = quizQuestions[state.quizIndex];

  if (!question) return;

  state.quizQuestionAnswered = false;

  $("#quiz-question-meta").textContent =
    "QUESTÃO " + String(state.quizIndex + 1).padStart(2, "0");

  $("#quiz-counter").textContent =
    (state.quizIndex + 1) + " / " + quizQuestions.length;

  $("#quiz-question").textContent = question.question;
  $("#quiz-instruction").textContent = question.instruction;

  $("#quiz-progress-fill").style.width =
    ((state.quizIndex) / quizQuestions.length) * 100 + "%";

  $("#quiz-score-preview").textContent =
    "Pontuação: " + state.quizScore + " / 40";

  $("#quiz-feedback").className = "feedback-box";
  $("#quiz-feedback").textContent = "";

  $("#quiz-next").disabled = false;
  $("#quiz-next").textContent = question.open
    ? "Conferir resposta"
    : "Conferir resposta";

  const optionsContainer = $("#quiz-options");
  optionsContainer.innerHTML = "";

  if (question.open) {
    const textarea = document.createElement("textarea");
    textarea.className = "quiz-textarea";
    textarea.id = "quiz-open-answer";
    textarea.maxLength = 1000;
    textarea.placeholder =
      "Escreva seu hábito escolhido e explique por que ele é importante...";
    textarea.setAttribute("aria-label", "Resposta escrita");
    optionsContainer.appendChild(textarea);

    const note = document.createElement("p");
    note.className = "quiz-instruction";
    note.textContent =
      "Sua resposta será aceita pelo tamanho mínimo exigido. A atividade não avalia automaticamente o sentido do texto.";
    optionsContainer.appendChild(note);

    return;
  }

  question.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "quiz-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quiz-answer";
    radio.value = String(index);

    const letter = document.createElement("span");
    letter.className = "quiz-option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = option;

    label.append(radio, letter, text);

    radio.addEventListener("change", () => {
      $$(".quiz-option").forEach((item) => item.classList.remove("selected"));
      label.classList.add("selected");
    });

    optionsContainer.appendChild(label);
  });
}

function checkQuizAnswer() {
  if (state.quizQuestionAnswered) {
    state.quizIndex += 1;

    if (state.quizIndex >= quizQuestions.length) {
      showQuizResult();
    } else {
      renderQuizQuestion();
    }

    return;
  }

  const question = quizQuestions[state.quizIndex];

  if (question.open) {
    const response = $("#quiz-open-answer").value.trim();
    const words = response.split(/\s+/).filter(Boolean);

    if (response.length < 25 || words.length < 5) {
      showFeedback(
        $("#quiz-feedback"),
        "Sua resposta ainda está curta. Escreva pelo menos 25 caracteres e 5 palavras, explicando sua escolha.",
        "error"
      );
      return;
    }

    state.quizScore += 4;
    state.quizAnswers[state.quizIndex] = {
      correct: true,
      openResponse: response
    };

    showFeedback(
      $("#quiz-feedback"),
      "Resposta registrada. Ela atende ao tamanho mínimo definido para a atividade. A ferramenta não consegue avaliar automaticamente a qualidade ou a precisão da explicação.",
      "success"
    );
  } else {
    const selected = $('input[name="quiz-answer"]:checked');

    if (!selected) {
      showFeedback(
        $("#quiz-feedback"),
        "Selecione uma alternativa antes de continuar.",
        "info"
      );
      return;
    }

    const answerIndex = Number(selected.value);
    const correct = answerIndex === question.correct;

    state.quizAnswers[state.quizIndex] = {
      correct,
      answerIndex
    };

    if (correct) {
      state.quizScore += 4;

      showFeedback(
        $("#quiz-feedback"),
        "Resposta correta. " + question.explanation,
        "success"
      );
    } else {
      showFeedback(
        $("#quiz-feedback"),
        "Resposta incorreta. " + question.explanation,
        "error"
      );
    }

    $$(".quiz-option").forEach((option, index) => {
      const radio = option.querySelector("input");

      radio.disabled = true;

      if (index === question.correct) {
        option.classList.add("correct");
      } else if (radio.checked) {
        option.classList.add("incorrect");
      }
    });
  }

  state.quizQuestionAnswered = true;
  $("#quiz-next").textContent =
    state.quizIndex === quizQuestions.length - 1
      ? "Ver resultado do questionário"
      : "Próxima questão →";

  $("#quiz-score-preview").textContent =
    "Pontuação: " + state.quizScore + " / 40";

  $("#quiz-progress-fill").style.width =
    ((state.quizIndex + 1) / quizQuestions.length) * 100 + "%";
}

function showQuizResult() {
  state.quizFinished = true;

  $("#quiz-shell").classList.add("hidden");
  $("#quiz-result").classList.remove("hidden");
  $("#quiz-final-score").textContent = state.quizScore;

  if (state.quizScore >= 36) {
    $("#quiz-result-message").textContent =
      "Você acertou a maior parte das questões.";
  } else if (state.quizScore >= 24) {
    $("#quiz-result-message").textContent =
      "Você reconheceu vários conceitos. Confira as explicações das respostas.";
  } else {
    $("#quiz-result-message").textContent =
      "Revise as explicações e observe quais conceitos precisam de mais atenção.";
  }

  $("#quiz-score-preview").textContent =
    "Pontuação: " + state.quizScore + " / 40";
}

$("#quiz-next").addEventListener("click", checkQuizAnswer);

$("#complete-quiz").addEventListener("click", () => {
  if (!state.quizFinished) return;

  awardMission("quiz", state.quizScore);
  $("#complete-quiz").textContent = "Resultado registrado";
  $("#complete-quiz").disabled = true;
});

$("#next-quiz").addEventListener("click", () => {
  if (!state.quizFinished) return;

  if (!state.completed.has("quiz")) {
    awardMission("quiz", state.quizScore);
  }

  if (!state.finished) {
    finishLab();
  } else {
    updateCompletionScreen();
    showView("completion");
  }
});

/* Reiniciar atividade */

function resetLab() {
  stopTimer();

  state.completed = new Set();
  state.points = 0;
  state.quizScore = 0;
  state.started = false;
  state.finished = false;
  state.startTime = null;
  state.elapsedSeconds = 0;
  state.timeBonus = 0;
  state.phishingChecked = false;
  state.passwordAnswered = false;
  state.mfaAnswered = false;
  state.quizIndex = 0;
  state.quizQuestionAnswered = false;
  state.quizAnswers = [];
  state.quizFinished = false;

  $("#timer-display").textContent = "00:00";
  $("#header-points").textContent = "0";

  $$(".selectable-clue").forEach((input) => {
    input.checked = false;
  });

  $$('input[name="password-answer"]').forEach((input) => {
    input.checked = false;
  });

  $$('input[name="mfa-method"], input[name="mfa-answer"]').forEach((input) => {
    input.checked = false;
  });

  $("#mfa-detail-title").textContent = "Selecione um método";
  $("#mfa-detail-text").textContent =
    "A descrição aparecerá aqui para ajudar na comparação.";

  clearFeedback($("#phishing-feedback"));
  clearFeedback($("#pin-feedback"));
  clearFeedback($("#mfa-feedback"));
  clearFeedback($("#quiz-feedback"));

  $("#check-phishing").disabled = false;
  $("#complete-phishing").disabled = true;
  $("#complete-phishing").textContent = "Concluir missão";

  $("#complete-pin").disabled = false;
  $("#complete-pin").textContent = "Conferir resposta";
  $("#next-password").disabled = true;

  $("#check-mfa").disabled = false;
  $("#complete-storage").disabled = true;
  $("#complete-storage").textContent = "Concluir missão";

  $("#quiz-shell").classList.remove("hidden");
  $("#quiz-result").classList.add("hidden");
  $("#complete-quiz").disabled = false;
  $("#complete-quiz").textContent = "Registrar resultado";

  $("#password-length").value = 12;
  $("#set-lower").checked = true;
  $("#set-upper").checked = true;
  $("#set-digits").checked = true;
  $("#set-symbols").checked = false;

  updatePasswordSimulator();
  renderQuizQuestion();
  updateDashboard();
  showView("overview");
}

$("#restart-all").addEventListener("click", resetLab);

/* Estado inicial */

renderQuizQuestion();
updateDashboard();
