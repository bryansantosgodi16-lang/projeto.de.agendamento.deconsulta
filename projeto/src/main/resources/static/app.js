const API = window.VIDASAUDE_API_URL || "/api";
const CONVENIOS = ["Santa Saúde", "Unimed", "Particular"];
const state = {
  view: "agenda",
  date: localToday(),
  patients: [],
  appointments: [],
  schedule: { horarioInicio: "09:00", horarioFim: "18:00", intervaloMinutos: 15 },
  report: { pacientesCadastrados: 0, consultasRealizadas: 0, retornos: 0, cancelamentos: 0 },
  user: null,
  authMode: "login",
  search: "",
  error: "",
  modal: null,
};

const main = document.querySelector("#main");
const dialog = document.querySelector("#modal");
const toast = document.querySelector("#toast");
const labels = { agenda: "Painel principal", pacientes: "Pacientes", relatorios: "Relatórios", canceladas: "Consultas canceladas", configuracoes: "Configurações" };

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function hhmm(value = "") { return String(value).slice(0, 5); }
function prettyDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
function shortDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
function statusLabel(value) {
  return ({ agendado: "Agendado", "em atendimento": "Em atendimento", "concluído": "Concluído", cancelado: "Cancelado" })[value] || value;
}
function statusClass(value) {
  return ({ agendado: "agendado", "em atendimento": "em-atendimento", "concluído": "concluido", cancelado: "cancelado" })[value] || "";
}
function isWeekend(date) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0 || day === 6;
}
function getSlots() {
  const start = hhmm(state.schedule.horarioInicio || "09:00").split(":").map(Number);
  const end = hhmm(state.schedule.horarioFim || "18:00").split(":").map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const interval = Number(state.schedule.intervaloMinutos) || 15;
  const slots = [];
  for (let minute = startMinutes; minute < endMinutes; minute += interval) {
    slots.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);
  }
  return slots;
}
function patient(id) { return state.patients.find((item) => item.id === id); }

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Inicie o backend Spring Boot em http://localhost:8080.");
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.mensagem || body?.message || (response.status === 401 ? "E-mail ou senha incorretos." : "Não foi possível concluir a operação."));
    error.status = response.status;
    throw error;
  }
  return body;
}

async function refresh() {
  try {
    const [patients, appointments, schedule, report] = await Promise.all([
      request("/pacientes"), request("/agendamentos"), request("/configuracoes/agenda"), request("/relatorios"),
    ]);
    state.patients = patients;
    state.appointments = appointments;
    state.schedule = schedule;
    state.report = report;
    state.error = "";
    document.querySelector("#sidebar-hours").textContent = `${hhmm(schedule.horarioInicio)} às ${hhmm(schedule.horarioFim)}`;
  } catch (error) {
    if (error.status === 401) {
      state.user = null;
      renderLogin();
      return;
    }
    state.error = error.message;
  }
  render();
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastMessage.timer);
  toastMessage.timer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

function errorBanner() {
  return state.error ? `<div class="error-banner" role="alert"><span>${escapeHtml(state.error)}</span><button class="button secondary small" data-action="retry">Tentar novamente</button></div>` : "";
}

function heading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function stat(label, value, note, symbol) {
  return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon" aria-hidden="true">${symbol}</span></div><div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div></article>`;
}

function badge(status) { return `<span class="badge ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span>`; }

function render() {
  document.body.classList.remove("auth-view");
  document.querySelector("#topbar-label").textContent = labels[state.view];
  document.querySelector(".user-label strong").textContent = state.user?.nome || "Equipe clínica";
  document.querySelector(".user-label small").textContent = state.user?.email || "Minha conta";
  document.querySelector(".user-avatar").textContent = (state.user?.nome || "VS").slice(0, 2).toUpperCase();
  document.querySelectorAll(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  const view = ({ agenda: renderAgenda, pacientes: renderPatients, relatorios: renderReports, canceladas: renderCancelled, configuracoes: renderSettings })[state.view];
  main.innerHTML = `${errorBanner()}${view()}`;
}

function renderLogin(message = "") {
  document.body.classList.add("auth-view");
  const registering = state.authMode === "register";
  main.innerHTML = `<section class="auth-card"><div class="auth-brand"><span class="brand-mark">✚</span><span><strong>VidaSaúde</strong><small>Clínica Médica</small></span></div><p class="auth-eyebrow">GESTÃO DO CONSULTÓRIO</p><h1>${registering ? "Crie sua conta" : "Acesse sua clínica"}</h1><p class="auth-description">${registering ? "Cadastre-se para organizar sua agenda e seus pacientes." : "Entre para consultar a agenda e gerenciar seus pacientes."}</p><form id="auth-form" class="modal-body">${registering ? `<label class="form-field">Nome completo<input class="field" name="nome" required maxlength="100" autocomplete="name" /></label>` : ""}<label class="form-field">E-mail<input class="field" type="email" name="email" required maxlength="255" autocomplete="email" /></label><label class="form-field">Senha<input class="field" type="password" name="senha" required minlength="${registering ? 8 : 1}" maxlength="72" autocomplete="${registering ? "new-password" : "current-password"}" />${registering ? `<small class="field-hint">Use pelo menos 8 caracteres.</small>` : ""}</label>${message ? `<div class="modal-error" role="alert">${escapeHtml(message)}</div>` : ""}<button class="button auth-submit" type="submit">${registering ? "Criar conta" : "Entrar"}</button></form><p class="auth-toggle">${registering ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <button data-action="auth-toggle">${registering ? "Entrar" : "Criar conta"}</button></p></section>`;
}

function renderAgenda() {
  const day = state.appointments.filter((item) => item.data === state.date);
  const active = day.filter((item) => item.status !== "cancelado");
  const slots = getSlots();
  const closed = isWeekend(state.date);
  const next = state.appointments.filter((item) => item.status !== "cancelado" && item.data >= localToday())
    .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))[0];
  const newPatients = active.filter((item) => item.tipo === "consulta").length;
  const returns = active.filter((item) => item.tipo === "retorno").length;
  const occupancy = closed || !slots.length ? 0 : Math.round(active.length / slots.length * 100);
  const slotsMarkup = closed
    ? `<div class="empty-state">O consultório não atende aos fins de semana. Escolha um dia útil.</div>`
    : `<div class="slot-list">${slots.map((time) => {
      const appointment = active.find((item) => hhmm(item.hora) === time);
      const person = appointment && patient(appointment.pacienteId);
      const slotClass = appointment?.status === "concluído" ? "done" : appointment ? "booked" : "";
      return `<div class="slot ${slotClass}"><strong class="slot-time">${time}</strong>${appointment ? badge(appointment.status) : ""}<div class="slot-person">${appointment ? `<strong>${escapeHtml(person?.nomeCompleto || appointment.pacienteNome || "Paciente")}</strong><small>${escapeHtml(appointment.tipo)}${person?.telefone ? ` · ${escapeHtml(person.telefone)}` : ""}</small>` : `<small class="muted-text">Horário disponível</small>`}</div><button class="button ${appointment ? "secondary" : "secondary"} small slot-action" data-action="${appointment ? "appointment-detail" : "book"}" ${appointment ? `data-id="${appointment.id}"` : `data-time="${time}"`}>${appointment ? "Detalhes" : "+ Agendar"}</button></div>`;
    }).join("")}</div>`;
  return `${heading(`Olá, equipe!`, "Aqui está o resumo da agenda da clínica.", `<button class="button" data-action="book">＋ Novo agendamento</button>`)}
    <section class="stats-grid" aria-label="Resumo da agenda">
      ${stat("Consultas do dia", active.length, `${day.filter((a) => a.status === "concluído").length} concluídas`, "▦")}
      ${stat("Consultas normais", newPatients, "na data selecionada", "♙")}
      ${stat("Retornos", returns, "na data selecionada", "↻")}
      ${stat("Cancelamentos", day.filter((a) => a.status === "cancelado").length, "na data selecionada", "⊗")}
      ${stat("Próximo horário", next ? hhmm(next.hora) : "—", next ? shortDate(next.data) : "Nenhum agendamento", "◷")}
      ${stat("Ocupação", `${occupancy}%`, `${active.length}/${closed ? 0 : slots.length} horários`, "◔")}
    </section>
    <div class="agenda-grid"><section class="panel"><div class="panel-heading"><h2>▦ &nbsp;Agenda de consultas</h2><div class="date-controls"><button class="icon-button" data-action="day-step" data-step="-1" aria-label="Dia anterior">‹</button><input class="field compact" id="agenda-date" type="date" value="${state.date}" aria-label="Selecionar data" /><button class="icon-button" data-action="day-step" data-step="1" aria-label="Próximo dia">›</button><button class="button link today-button" data-action="today">Hoje</button></div></div><div class="day-caption"><span>${escapeHtml(prettyDate(state.date))}</span><span>${closed ? "Consultório fechado" : `${slots.length} horários`}</span></div>${slotsMarkup}</section>
    <aside class="side-stack"><section class="panel side-panel"><h2>Pacientes do dia <span class="muted-text">(${active.length})</span></h2><div class="patient-day">${active.length ? active.slice().sort((a,b) => a.hora.localeCompare(b.hora)).map((appointment) => `<button class="patient-day-item" data-action="appointment-detail" data-id="${appointment.id}"><span class="patient-initial">${escapeHtml((appointment.pacienteNome || patient(appointment.pacienteId)?.nomeCompleto || "P").slice(0, 1).toUpperCase())}</span><span class="patient-day-name"><strong>${escapeHtml(appointment.pacienteNome || patient(appointment.pacienteId)?.nomeCompleto || "Paciente")}</strong><small>${escapeHtml(appointment.tipo)}</small></span><span class="patient-day-time">${hhmm(appointment.hora)}</span></button>`).join("") : `<p class="empty-state">Nenhuma consulta nesta data.</p>`}</div></section><button class="button" data-action="book">＋ &nbsp; Novo agendamento</button></aside></div>`;
}

function renderPatients() {
  const term = state.search.trim().toLocaleLowerCase("pt-BR");
  const filtered = state.patients.filter((item) => `${item.nomeCompleto} ${item.telefone} ${item.convenio}`.toLocaleLowerCase("pt-BR").includes(term));
  return `${heading("Pacientes", `${state.patients.length} pacientes cadastrados`, `<button class="button" data-action="new-patient">＋ Novo paciente</button>`)}
    <section class="panel patient-list"><div class="list-toolbar"><input class="field" id="patient-search" type="search" value="${escapeHtml(state.search)}" placeholder="Buscar por nome, telefone ou convênio" aria-label="Buscar pacientes" /></div>
    ${filtered.length ? filtered.map((item) => {
      const completed = state.appointments.filter((a) => a.pacienteId === item.id && a.status === "concluído").length;
      return `<div class="patient-row"><span class="patient-initial">${escapeHtml((item.nomeCompleto || "P").slice(0, 1).toUpperCase())}</span><div class="patient-row-info"><strong>${escapeHtml(item.nomeCompleto)}</strong><small>${escapeHtml(item.telefone)} · ${escapeHtml(item.convenio || "Sem convênio")}</small></div><span class="patient-count">${completed} consultas realizadas</span><button class="button secondary small" data-action="patient-detail" data-id="${item.id}">Ver ficha</button></div>`;
    }).join("") : `<div class="empty-state">Nenhum paciente encontrado.</div>`}</section>`;
}

function renderCancelled() {
  const items = state.appointments.filter((item) => item.status === "cancelado").sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`));
  return `${heading("Consultas canceladas", "Histórico de cancelamentos e possibilidade de remarcar.")}
    <section class="panel cancel-list">${items.length ? items.map((item) => `<div class="cancel-row"><span class="stat-icon">⊗</span><div class="cancel-info"><strong>${escapeHtml(item.pacienteNome || patient(item.pacienteId)?.nomeCompleto || "Paciente")}</strong><small>${shortDate(item.data)} às ${hhmm(item.hora)} · ${escapeHtml(item.tipo)}</small>${item.motivoCancelamento ? `<div class="cancel-reason">Motivo: ${escapeHtml(item.motivoCancelamento)}</div>` : ""}</div>${badge("cancelado")}<button class="button secondary small" data-action="reschedule" data-id="${item.id}">↻ Remarcar</button></div>`).join("") : `<div class="empty-state">Nenhuma consulta cancelada.</div>`}</section>`;
}

function renderReports() {
  const recent = state.appointments.slice().sort((a,b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`)).slice(0, 10);
  return `${heading("Relatórios", "Visão geral dos atendimentos e da clínica.")}
    <section class="report-grid">${[
      ["Pacientes cadastrados", state.report.pacientesCadastrados, "♙"],
      ["Consultas realizadas", state.report.consultasRealizadas, "✓"],
      ["Retornos", state.report.retornos, "↻"],
      ["Cancelamentos", state.report.cancelamentos, "⊗"],
    ].map(([label, value, icon]) => `<article class="panel report-card"><span class="stat-icon">${icon}</span><div class="stat-value">${value}</div><p>${label}</p></article>`).join("")}</section>
    <section class="panel"><div class="panel-heading"><h2>Atendimentos recentes</h2></div>${recent.length ? recent.map((item) => `<div class="recent-row"><span>${escapeHtml(item.pacienteNome || patient(item.pacienteId)?.nomeCompleto || "Paciente")}</span><span class="muted">${shortDate(item.data)} · ${hhmm(item.hora)}</span>${badge(item.status)}</div>`).join("") : `<div class="empty-state">Ainda não há consultas registradas.</div>`}</section>`;
}

function renderSettings() {
  return `${heading("Configurações", "Personalize os horários de funcionamento do consultório.")}
    <form id="settings-form" class="panel settings-panel"><h2>◷ &nbsp;Horários de funcionamento</h2><p>Atendimento de segunda a sexta-feira. Os horários já agendados não serão alterados.</p><div class="form-grid">
      <label class="form-field">Início<input class="field" type="time" name="horarioInicio" required value="${hhmm(state.schedule.horarioInicio)}" /></label>
      <label class="form-field">Fim<input class="field" type="time" name="horarioFim" required value="${hhmm(state.schedule.horarioFim)}" /></label>
      <label class="form-field full">Intervalo entre consultas<select class="field" name="intervaloMinutos"><option value="15" ${Number(state.schedule.intervaloMinutos) === 15 ? "selected" : ""}>15 minutos</option><option value="30" ${Number(state.schedule.intervaloMinutos) === 30 ? "selected" : ""}>30 minutos</option><option value="60" ${Number(state.schedule.intervaloMinutos) === 60 ? "selected" : ""}>60 minutos</option></select></label>
    </div><div class="form-actions"><button class="button" type="submit">Salvar horários</button></div></form>`;
}

function showModal(content, modalState) {
  state.modal = modalState;
  dialog.innerHTML = content;
  if (!dialog.open) dialog.showModal();
}

function closeModal() {
  if (dialog.open) dialog.close();
  state.modal = null;
}

function modalShell(title, subtitle, body) {
  return `<div class="modal-content"><header class="modal-header"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></header>${body}</div>`;
}

function openBooking(date = state.date, time = "", patientId = "") {
  if (date < localToday()) date = localToday();
  if (isWeekend(date)) {
    const nextBusinessDay = new Date(`${date}T12:00:00`);
    while (nextBusinessDay.getDay() === 0 || nextBusinessDay.getDay() === 6) nextBusinessDay.setDate(nextBusinessDay.getDate() + 1);
    date = `${nextBusinessDay.getFullYear()}-${String(nextBusinessDay.getMonth() + 1).padStart(2, "0")}-${String(nextBusinessDay.getDate()).padStart(2, "0")}`;
    time = "";
  }
  const chosenPatient = patientId || "";
  const occupied = state.appointments.filter((item) => item.data === date && item.status !== "cancelado").map((item) => hhmm(item.hora));
  const options = getSlots().filter((slot) => !occupied.includes(slot) || slot === time);
  showModal(modalShell("Novo agendamento", "Selecione o paciente, a data e um horário disponível.", `<form id="booking-form" class="modal-body">
    <label class="form-field">Paciente<select class="field" name="pacienteId" required><option value="">Selecione um paciente</option>${state.patients.map((item) => `<option value="${item.id}" ${String(item.id) === String(chosenPatient) ? "selected" : ""}>${escapeHtml(item.nomeCompleto)} · ${escapeHtml(item.telefone)}</option>`).join("")}</select></label>
    ${!state.patients.length ? `<p class="muted-text">Cadastre um paciente antes de agendar.</p>` : ""}
    <div class="form-grid"><label class="form-field">Data<input class="field" type="date" name="data" min="${localToday()}" value="${date}" required /></label><label class="form-field">Horário<select class="field" name="hora" required ${isWeekend(date) ? "disabled" : ""}><option value="">Selecione</option>${options.map((slot) => `<option value="${slot}" ${slot === time ? "selected" : ""}>${slot}</option>`).join("")}</select></label></div>
    <button class="button link" type="button" data-action="new-patient-from-booking">＋ Cadastrar novo paciente</button><div id="modal-error"></div><div class="form-actions"><button class="button secondary" type="button" data-action="close-modal">Cancelar</button><button class="button" type="submit" ${!state.patients.length ? "disabled" : ""}>Agendar consulta</button></div>
  </form>`), { type: "booking", date, time, patientId: chosenPatient });
}

function openPatientForm(item = null, afterBooking = false) {
  const current = item || {};
  showModal(modalShell(item ? "Editar paciente" : "Cadastrar paciente", "Dados cadastrais e informações de contato.", `<form id="patient-form" class="modal-body">
    <label class="form-field">Nome completo *<input class="field" name="nomeCompleto" required maxlength="120" value="${escapeHtml(current.nomeCompleto || "")}" /></label>
    <div class="form-grid"><label class="form-field">Telefone *<input class="field" name="telefone" required maxlength="30" value="${escapeHtml(current.telefone || "")}" /></label><label class="form-field">Convênio *<select class="field" name="convenio" required><option value="">Selecione</option>${CONVENIOS.map((value) => `<option value="${escapeHtml(value)}" ${current.convenio === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
    <label class="form-field">Nascimento<input class="field" name="dataNascimento" type="date" value="${escapeHtml(current.dataNascimento || "")}" /></label><label class="form-field">E-mail<input class="field" name="email" type="email" maxlength="255" value="${escapeHtml(current.email || "")}" /></label>
    <label class="form-field full">Observações<textarea class="field" name="observacao" rows="3" maxlength="2000">${escapeHtml(current.observacao || "")}</textarea></label></div><div id="modal-error"></div><div class="form-actions"><button class="button secondary" type="button" data-action="close-modal">Cancelar</button><button class="button" type="submit">${item ? "Salvar alterações" : "Cadastrar paciente"}</button></div>
  </form>`), { type: "patient-form", id: item?.id || null, afterBooking, booking: state.modal?.type === "booking" ? state.modal : null });
}

async function openPatientDetail(id) {
  const current = patient(Number(id)) || patient(id);
  if (!current) return toastMessage("Paciente não encontrado.");
  showModal(modalShell(escapeHtml(current.nomeCompleto), "Ficha cadastral e histórico de consultas.", `<div class="modal-body"><div class="detail-grid"><div><span>Telefone</span><strong>${escapeHtml(current.telefone)}</strong></div><div><span>Convênio</span><strong>${escapeHtml(current.convenio || "—")}</strong></div><div><span>Nascimento</span><strong>${current.dataNascimento ? shortDate(current.dataNascimento) : "—"}</strong></div><div><span>E-mail</span><strong>${escapeHtml(current.email || "—")}</strong></div>${current.observacao ? `<div style="grid-column:1/-1"><span>Observações</span><strong>${escapeHtml(current.observacao)}</strong></div>` : ""}</div><div><h3 class="section-title">Histórico de consultas</h3><div class="history-list" id="patient-history"><div class="empty-state">Carregando histórico…</div></div></div><div class="form-actions"><button class="button secondary" data-action="edit-patient" data-id="${current.id}">Editar ficha</button><button class="button" data-action="close-modal">Fechar</button></div></div>`), { type: "patient-detail", id: current.id });
  try {
    const history = await request(`/pacientes/${current.id}/agendamentos`);
    if (state.modal?.type !== "patient-detail" || String(state.modal.id) !== String(current.id)) return;
    const target = document.querySelector("#patient-history");
    if (target) target.innerHTML = history.length ? history.map((item) => `<div class="history-row"><span>${shortDate(item.data)} às ${hhmm(item.hora)} · ${escapeHtml(item.tipo)}</span>${badge(item.status)}</div>`).join("") : `<div class="empty-state">Nenhuma consulta registrada.</div>`;
  } catch (error) {
    const target = document.querySelector("#patient-history");
    if (target) target.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

function openAppointmentDetail(id) {
  const item = state.appointments.find((appointment) => String(appointment.id) === String(id));
  if (!item) return;
  const p = patient(item.pacienteId);
  const actions = item.status === "cancelado" ? `<button class="button" data-action="reschedule" data-id="${item.id}">↻ Remarcar</button>` : `<button class="button secondary" data-action="set-status" data-status="em atendimento" data-id="${item.id}">Iniciar atendimento</button><button class="button secondary" data-action="set-status" data-status="concluído" data-id="${item.id}">Marcar concluída</button><button class="button danger" data-action="cancel-appointment" data-id="${item.id}">Cancelar consulta</button>`;
  showModal(modalShell("Detalhes da consulta", "Dados do agendamento selecionado.", `<div class="modal-body"><div class="detail-grid"><div><span>Paciente</span><strong>${escapeHtml(item.pacienteNome || p?.nomeCompleto || "Paciente")}</strong></div><div><span>Telefone</span><strong>${escapeHtml(p?.telefone || "—")}</strong></div><div><span>Data e horário</span><strong>${shortDate(item.data)} às ${hhmm(item.hora)}</strong></div><div><span>Tipo / status</span><strong>${escapeHtml(item.tipo)} · ${escapeHtml(statusLabel(item.status))}</strong></div>${item.motivoCancelamento ? `<div style="grid-column:1/-1"><span>Motivo do cancelamento</span><strong>${escapeHtml(item.motivoCancelamento)}</strong></div>` : ""}</div><div class="status-actions">${actions}</div><div class="form-actions"><button class="button secondary" data-action="close-modal">Fechar</button>${p ? `<button class="button link" data-action="patient-detail" data-id="${p.id}">Ver ficha do paciente</button>` : ""}</div></div>`), { type: "appointment-detail", id: item.id });
}

function showModalError(message) {
  const element = document.querySelector("#modal-error");
  if (element) element.innerHTML = `<div class="modal-error" role="alert">${escapeHtml(message)}</div>`;
  else toastMessage(message);
}

async function changeStatus(id, status, reason = null) {
  await request(`/agendamentos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, motivoCancelamento: reason }) });
  closeModal();
  await refresh();
  toastMessage(status === "cancelado" ? "Consulta cancelada e horário liberado." : "Status da consulta atualizado.");
}

function openCancelForm(id) {
  showModal(modalShell("Cancelar consulta?", "O cancelamento ficará no histórico e liberará o horário.", `<form id="cancel-form" class="modal-body"><input type="hidden" name="id" value="${id}" /><label class="form-field">Motivo (opcional)<textarea name="motivo" class="field" rows="3" maxlength="500" placeholder="Informe o motivo do cancelamento"></textarea></label><div id="modal-error"></div><div class="form-actions"><button type="button" class="button secondary" data-action="close-modal">Voltar</button><button type="submit" class="button danger">Confirmar cancelamento</button></div></form>`), { type: "cancel", id });
}

document.addEventListener("click", async (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) {
    state.view = nav.dataset.view;
    if (state.view !== "pacientes") state.search = "";
    document.querySelector("#sidebar").classList.remove("open");
    render();
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const { action: name, id } = action.dataset;
  try {
    if (name === "retry") await refresh();
    if (name === "auth-toggle") { state.authMode = state.authMode === "login" ? "register" : "login"; renderLogin(); }
    if (name === "logout") {
      await request("/auth/logout", { method: "POST" });
      state.user = null;
      renderLogin("Você saiu da sua conta.");
    }
    if (name === "close-modal") closeModal();
    if (name === "book") openBooking(action.dataset.time ? state.date : state.date, action.dataset.time || "");
    if (name === "new-patient") openPatientForm();
    if (name === "new-patient-from-booking") openPatientForm(null, true);
    if (name === "patient-detail") await openPatientDetail(id);
    if (name === "edit-patient") {
      const p = patient(Number(id)) || patient(id);
      if (p) openPatientForm(p);
    }
    if (name === "appointment-detail") openAppointmentDetail(id);
    if (name === "day-step") {
      const date = new Date(`${state.date}T12:00:00`);
      date.setDate(date.getDate() + Number(action.dataset.step));
      state.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      render();
    }
    if (name === "today") { state.date = localToday(); render(); }
    if (name === "set-status") await changeStatus(id, action.dataset.status);
    if (name === "cancel-appointment") openCancelForm(id);
    if (name === "reschedule") {
      const item = state.appointments.find((appointment) => String(appointment.id) === String(id));
      closeModal();
      if (item) openBooking(localToday(), "", item.pacienteId);
    }
  } catch (error) { toastMessage(error.message); }
});

document.querySelector("#menu-toggle").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));
document.querySelector("#global-search").addEventListener("input", (event) => {
  state.search = event.target.value;
  if (state.search) state.view = "pacientes";
  render();
  const localSearch = document.querySelector("#patient-search");
  if (localSearch) { localSearch.focus(); localSearch.setSelectionRange(state.search.length, state.search.length); }
});
main.addEventListener("input", (event) => {
  if (event.target.id !== "patient-search") return;
  state.search = event.target.value;
  const cursor = event.target.selectionStart;
  render();
  const input = document.querySelector("#patient-search");
  if (input) { input.focus(); input.setSelectionRange(cursor, cursor); }
});
main.addEventListener("change", (event) => {
  if (event.target.id === "agenda-date" && event.target.value) { state.date = event.target.value; render(); }
});
main.addEventListener("submit", async (event) => {
  if (event.target.id !== "auth-form") return;
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(event.target));
  const registering = state.authMode === "register";
  try {
    state.user = await request(registering ? "/auth/register" : "/auth/login", {
      method: "POST",
      body: JSON.stringify(registering ? { nome: fields.nome.trim(), email: fields.email.trim(), senha: fields.senha } : { email: fields.email.trim(), senha: fields.senha }),
    });
    await refresh();
  } catch (error) { renderLogin(error.message); }
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeModal();
});
dialog.addEventListener("change", (event) => {
  if (state.modal?.type !== "booking") return;
  if (event.target.name === "pacienteId") state.modal.patientId = event.target.value;
  if (event.target.name === "data") {
    state.modal.date = event.target.value;
    openBooking(event.target.value, "", state.modal.patientId);
  }
});
dialog.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));
  try {
    if (form.id === "patient-form") {
      const current = state.modal;
      const payload = {
        nomeCompleto: values.nomeCompleto.trim(), telefone: values.telefone.trim(), convenio: values.convenio,
        dataNascimento: values.dataNascimento || null, email: values.email.trim() || null, observacao: values.observacao.trim() || null,
      };
      const saved = await request(current.id ? `/pacientes/${current.id}` : "/pacientes", {
        method: current.id ? "PUT" : "POST", body: JSON.stringify(payload),
      });
      const booking = current.booking;
      const shouldBook = current.afterBooking;
      closeModal();
      await refresh();
      if (shouldBook && booking) openBooking(booking.date, booking.time, saved.id);
      else toastMessage(current.id ? "Cadastro atualizado." : "Paciente cadastrado.");
    } else if (form.id === "booking-form") {
      await request("/agendamentos", { method: "POST", body: JSON.stringify({ pacienteId: Number(values.pacienteId), data: values.data, hora: values.hora }) });
      state.date = values.data;
      state.view = "agenda";
      closeModal();
      await refresh();
      toastMessage("Agendamento criado com sucesso.");
    } else if (form.id === "cancel-form") {
      await changeStatus(values.id, "cancelado", values.motivo.trim() || null);
    } else if (form.id === "settings-form") {
      const payload = { horarioInicio: values.horarioInicio, horarioFim: values.horarioFim, intervaloMinutos: Number(values.intervaloMinutos) };
      await request("/configuracoes/agenda", { method: "PUT", body: JSON.stringify(payload) });
      await refresh();
      toastMessage("Horários de funcionamento salvos.");
    }
  } catch (error) { showModalError(error.message); }
});

async function boot() {
  try {
    state.user = await request("/auth/me");
    await refresh();
  } catch (error) {
    if (error.status === 401) renderLogin();
    else { state.error = error.message; renderLogin(error.message); }
  }
}

boot();
