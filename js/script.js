const app = document.querySelector("#app");

const state = {
  logged: false,
  page: "dashboard",
  search: "",
  modal: null,
  editingItem: null,
  editingShelf: null,
  items: [
    { id: "ITM-001", name: "Coturno", type: "Vestuário", shelf: "A-01", qty: 43, condition: "Bom", status: "Disponível" },
    { id: "ITM-002", name: "Gandola", type: "Uniforme", shelf: "A-03", qty: 18, condition: "Bom", status: "Em cautela" },
    { id: "ITM-003", name: "Calça camuflada", type: "Uniforme", shelf: "A-02", qty: 24, condition: "Regular", status: "Disponível" },
    { id: "ITM-004", name: "Boné", type: "Acessório", shelf: "B-01", qty: 31, condition: "Bom", status: "Disponível" },
  ],
  shelves: [
    { id: "A-01", location: "Sala do almoxarifado", capacity: 60, used: 43 },
    { id: "A-02", location: "Sala do almoxarifado", capacity: 45, used: 24 },
    { id: "A-03", location: "Corredor interno", capacity: 35, used: 18 },
    { id: "B-01", location: "Armário lateral", capacity: 40, used: 31 },
  ],
  cautions: [
    { id: "CAU-0001", person: "Carlos Roberto Grande Venâncio", date: "25/05/2026", returnDate: "31/05/2026", items: "Coturno, Gandola", status: "Ativa" },
    { id: "CAU-0002", person: "Gabriel Vaz de Lima Correa", date: "24/05/2026", returnDate: "30/05/2026", items: "Calça camuflada", status: "Ativa" },
  ],
  movements: [
    { id: "MOV-001", item: "Coturno", code: "ITM-001", type: "Saída", responsible: "Subtenente Monteiro", date: "25/05/2026 09:20" },
    { id: "MOV-002", item: "Boné", code: "ITM-004", type: "Entrada", responsible: "Subtenente Falcão", date: "25/05/2026 10:15" },
  ],
};

const pages = [
  ["dashboard", "Painel"],
  ["items", "Itens"],
  ["shelves", "Prateleiras"],
  ["cautions", "Cautelas"],
  ["movements", "Entrada/Saída"],
];

function render() {
  app.innerHTML = state.logged ? layoutTemplate() : authTemplate("login");
  bindEvents();
}

function authTemplate(mode) {
  const isRegister = mode === "register";
  return `
    <section class="auth-page">
      <div class="auth-card">
        <div class="brand">
          <div class="brand-mark">TG<br>02-076</div>
          <h1>${isRegister ? "Cadastro de usuário" : "Sistema de Almoxarifado"}</h1>
          <p>Tiro de Guerra 02-076 - Itapetininga</p>
        </div>
        <form class="form-grid" data-form="${isRegister ? "register" : "login"}">
          ${isRegister ? field("Nome completo", "nome", "Subtenente Monteiro") : ""}
          ${field("E-mail", "email", "usuario@tg.local")}
          ${isRegister ? field("Telefone", "telefone", "(15) 99999-0000") : ""}
          ${field("Senha", "senha", "Digite sua senha", "password")}
          <div class="auth-actions">
            <button class="btn" type="submit">${isRegister ? "Cadastrar e continuar" : "Entrar"}</button>
            <button class="btn secondary" type="button" data-auth-toggle>
              ${isRegister ? "Voltar para login" : "Cadastrar novo usuário"}
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function layoutTemplate() {
  return `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand-mark">TG<br>02-076</div>
        <p class="sidebar-title">
          <strong>Almoxarifado T.G.</strong>
          <span>Controle de materiais e cautelas</span>
        </p>
        <nav class="nav">
          ${pages.map(([id, label]) => `<button class="${state.page === id ? "active" : ""}" data-page="${id}">${label}</button>`).join("")}
          <button data-logout>Sair</button>
        </nav>
      </aside>
      <main class="content">
        <header class="topbar">
          <div class="page-title">
            <h1>${pageTitle()}</h1>
            <p>${pageDescription()}</p>
          </div>
          <div class="user-chip">Usuário: Subtenente Monteiro</div>
        </header>
        ${pageTemplate()}
      </main>
    </div>
    ${state.modal ? modalTemplate() : ""}
  `;
}

function pageTitle() {
  return {
    dashboard: "Painel de controle",
    items: "Itens cadastrados",
    shelves: "Prateleiras",
    cautions: "Cautelas",
    movements: "Entrada e saída",
    document: "Documento de cautela",
  }[state.page];
}

function pageDescription() {
  return {
    dashboard: "Resumo das operações do almoxarifado.",
    items: "Cadastro, consulta, edição e exclusão de materiais.",
    shelves: "Organização dos itens por local de armazenamento.",
    cautions: "Registro de retirada de itens e emissão de cautela.",
    movements: "Demonstração de leitura de código para entrada ou saída.",
    document: "Prévia do PDF que seria gerado pelo sistema.",
  }[state.page];
}

function pageTemplate() {
  if (state.page === "dashboard") return dashboardTemplate();
  if (state.page === "items") return itemsTemplate();
  if (state.page === "shelves") return shelvesTemplate();
  if (state.page === "cautions") return cautionsTemplate();
  if (state.page === "movements") return movementsTemplate();
  if (state.page === "document") return documentTemplate();
  return dashboardTemplate();
}

function dashboardTemplate() {
  const total = state.items.reduce((sum, item) => sum + item.qty, 0);
  return `
    <section class="stats">
      ${stat("Itens em estoque", total)}
      ${stat("Itens cadastrados", state.items.length)}
      ${stat("Prateleiras", state.shelves.length)}
      ${stat("Cautelas ativas", state.cautions.length)}
    </section>
    <section class="grid-2">
      <div class="panel">
        <div class="panel-head">
          <h2>Últimas movimentações</h2>
          <button class="btn secondary" data-page="movements">Ver todas</button>
        </div>
        ${smallList(state.movements.map(m => `${m.type} - ${m.item} (${m.date})`))}
      </div>
      <div class="panel">
        <div class="panel-head">
          <h2>Ações rápidas</h2>
        </div>
        <div class="grid-2">
          <button class="btn" data-open="item">Cadastrar item</button>
          <button class="btn" data-open="shelf">Nova prateleira</button>
          <button class="btn warning" data-open="caution">Gerar cautela</button>
          <button class="btn secondary" data-page="items">Consultar itens</button>
        </div>
      </div>
    </section>
  `;
}

function itemsTemplate() {
  const items = state.items.filter(item => item.name.toLowerCase().includes(state.search.toLowerCase()) || item.id.toLowerCase().includes(state.search.toLowerCase()));
  return `
    <section class="table-panel">
      <div class="table-head">
        <h2>Inventário</h2>
        <div class="toolbar">
          <input class="search-input" data-search placeholder="Buscar por nome ou código" value="${state.search}">
          <button class="btn" data-open="item">Cadastrar item</button>
        </div>
      </div>
      <table>
        <thead><tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Prateleira</th><th>Qtd.</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.id}</td>
              <td>${item.name}</td>
              <td>${item.type}</td>
              <td>${item.shelf}</td>
              <td>${item.qty}</td>
              <td>${statusTag(item.status)}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Editar" data-edit-item="${item.id}">✎</button>
                <button class="icon-btn" title="Excluir" data-confirm="item:${item.id}">×</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function shelvesTemplate() {
  return `
    <div class="panel-head">
      <h2>Locais de armazenamento</h2>
      <button class="btn" data-open="shelf">Cadastrar prateleira</button>
    </div>
    <section class="shelf-grid">
      ${state.shelves.map(shelf => {
        const percent = Math.round((shelf.used / shelf.capacity) * 100);
        return `
          <article class="shelf-card">
            <h3>Prateleira ${shelf.id}</h3>
            <p>${shelf.location}</p>
            <div class="progress"><span style="width:${percent}%"></span></div>
            <p>${shelf.used} de ${shelf.capacity} posições ocupadas</p>
            <div class="row-actions">
              <button class="btn secondary" data-edit-shelf="${shelf.id}">Editar</button>
              <button class="btn danger" data-confirm="shelf:${shelf.id}">Excluir</button>
            </div>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function cautionsTemplate() {
  return `
    <section class="table-panel">
      <div class="table-head">
        <h2>Cautelas registradas</h2>
        <button class="btn warning" data-open="caution">Gerar cautela</button>
      </div>
      <table>
        <thead><tr><th>Número</th><th>Responsável</th><th>Retirada</th><th>Retorno</th><th>Itens</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          ${state.cautions.map(c => `
            <tr>
              <td>${c.id}</td>
              <td>${c.person}</td>
              <td>${c.date}</td>
              <td>${c.returnDate}</td>
              <td>${c.items}</td>
              <td>${statusTag(c.status)}</td>
              <td class="row-actions">
                <button class="icon-btn" title="PDF" data-document="${c.id}">PDF</button>
                <button class="icon-btn" title="Excluir" data-confirm="caution:${c.id}">×</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function movementsTemplate() {
  return `
    <section class="grid-2">
      <form class="panel form-grid" data-form="movement">
        <div class="panel-head"><h2>Leitura do código</h2></div>
        <div class="notice">No sistema real, essa etapa usaria leitura de código do item. Aqui o fluxo é simulado para apresentação.</div>
        ${field("Código do item", "code", "ITM-001")}
        ${selectField("Operação", "type", ["Saída", "Entrada"])}
        ${field("Responsável", "responsible", "Subtenente Monteiro")}
        <button class="btn" type="submit">Registrar movimentação</button>
      </form>
      <div class="panel">
        <div class="panel-head"><h2>Histórico</h2></div>
        ${smallList(state.movements.map(m => `${m.id} - ${m.type} de ${m.item} por ${m.responsible}`))}
      </div>
    </section>
  `;
}

function documentTemplate() {
  const caution = state.cautions[0];
  return `
    <div class="panel-head">
      <button class="btn secondary" data-page="cautions">Voltar</button>
      <button class="btn warning" data-modal-message="PDF gerado para demonstração. Em um sistema real, o arquivo seria baixado.">Gerar PDF</button>
    </div>
    <section class="document">
      <h2>TIRO DE GUERRA 02-076</h2>
      <h3>Tabela de Cautela de Material</h3>
      <p><strong>Número:</strong> ${caution.id}</p>
      <p><strong>Responsável:</strong> ${caution.person}</p>
      <p><strong>Data de retirada:</strong> ${caution.date} &nbsp; <strong>Retorno:</strong> ${caution.returnDate}</p>
      <table>
        <thead><tr><th>Código</th><th>Item</th><th>Quantidade</th><th>Condição</th></tr></thead>
        <tbody>
          <tr><td>ITM-001</td><td>Coturno</td><td>1</td><td>Bom</td></tr>
          <tr><td>ITM-002</td><td>Gandola</td><td>1</td><td>Bom</td></tr>
        </tbody>
      </table>
      <div class="signatures">
        <div class="line">Responsável pela retirada</div>
        <div class="line">Superior responsável</div>
      </div>
    </section>
  `;
}

function modalTemplate() {
  if (state.modal.type === "confirm") {
    return `
      <div class="modal-backdrop">
        <div class="modal">
          <h2>Atenção</h2>
          <p>${state.modal.message}</p>
          <div class="modal-actions">
            <button class="btn secondary" data-close-modal>Cancelar</button>
            <button class="btn danger" data-delete="${state.modal.target}">Confirmar</button>
          </div>
        </div>
      </div>
    `;
  }

  if (state.modal.type === "item") return formModal("Cadastro de item", itemFormTemplate(), "item");
  if (state.modal.type === "shelf") return formModal("Cadastro de prateleira", shelfFormTemplate(), "shelf");
  if (state.modal.type === "caution") return formModal("Gerar cautela", cautionFormTemplate(), "caution");

  return `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Informação</h2>
        <p>${state.modal.message}</p>
        <div class="modal-actions"><button class="btn" data-close-modal>Ok</button></div>
      </div>
    </div>
  `;
}

function formModal(title, body, formName) {
  return `
    <div class="modal-backdrop">
      <form class="modal form-grid" data-form="${formName}">
        <h2>${title}</h2>
        ${body}
        <div class="modal-actions">
          <button class="btn secondary" type="button" data-close-modal>Cancelar</button>
          <button class="btn" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  `;
}

function itemFormTemplate() {
  const item = state.editingItem || {};
  return `
    <div class="grid-2">
      ${field("Nome", "name", "Coturno", "text", item.name)}
      ${field("Tipo", "type", "Uniforme", "text", item.type)}
      ${field("Quantidade", "qty", "10", "number", item.qty)}
      ${field("Prateleira", "shelf", "A-01", "text", item.shelf)}
    </div>
    ${selectField("Condição", "condition", ["Bom", "Regular", "Ruim"], item.condition)}
    ${selectField("Situação", "status", ["Disponível", "Em cautela"], item.status)}
  `;
}

function shelfFormTemplate() {
  const shelf = state.editingShelf || {};
  return `
    ${field("Identificação", "id", "A-04", "text", shelf.id)}
    ${field("Localização", "location", "Sala do almoxarifado", "text", shelf.location)}
    <div class="grid-2">
      ${field("Capacidade", "capacity", "40", "number", shelf.capacity)}
      ${field("Ocupados", "used", "0", "number", shelf.used)}
    </div>
  `;
}

function cautionFormTemplate() {
  return `
    ${field("Responsável pela retirada", "person", "Nome completo")}
    <div class="grid-2">
      ${field("Data de retirada", "date", "25/05/2026")}
      ${field("Data de retorno", "returnDate", "31/05/2026")}
    </div>
    ${field("Itens retirados", "items", "Coturno, Gandola")}
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.page = btn.dataset.page;
      state.search = "";
      render();
    });
  });

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    state.logged = false;
    render();
  });

  document.querySelector("[data-auth-toggle]")?.addEventListener("click", () => {
    app.innerHTML = authTemplate(document.querySelector("[data-form='login']") ? "register" : "login");
    bindEvents();
  });

  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(form);
    });
  });

  document.querySelector("[data-search]")?.addEventListener("input", event => {
    state.search = event.target.value;
    render();
  });

  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.editingItem = null;
      state.editingShelf = null;
      state.modal = { type: btn.dataset.open };
      render();
    });
  });

  document.querySelectorAll("[data-edit-item]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.editingItem = state.items.find(item => item.id === btn.dataset.editItem);
      state.modal = { type: "item" };
      render();
    });
  });

  document.querySelectorAll("[data-edit-shelf]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.editingShelf = state.shelves.find(shelf => shelf.id === btn.dataset.editShelf);
      state.modal = { type: "shelf" };
      render();
    });
  });

  document.querySelectorAll("[data-confirm]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.modal = { type: "confirm", target: btn.dataset.confirm, message: "Tem certeza de que deseja excluir este registro?" };
      render();
    });
  });

  document.querySelectorAll("[data-document]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.page = "document";
      render();
    });
  });

  document.querySelector("[data-close-modal]")?.addEventListener("click", () => {
    closeModal();
  });

  document.querySelector("[data-delete]")?.addEventListener("click", event => {
    deleteRecord(event.target.dataset.delete);
  });

  document.querySelector("[data-modal-message]")?.addEventListener("click", event => {
    state.modal = { type: "message", message: event.target.dataset.modalMessage };
    render();
  });
}

function handleForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const formName = form.dataset.form;

  if (formName === "login" || formName === "register") {
    state.logged = true;
    state.page = "dashboard";
    render();
    return;
  }

  if (formName === "item") saveItem(data);
  if (formName === "shelf") saveShelf(data);
  if (formName === "caution") saveCaution(data);
  if (formName === "movement") saveMovement(data);

  closeModal(false);
  render();
}

function saveItem(data) {
  if (state.editingItem) {
    Object.assign(state.editingItem, data, { qty: Number(data.qty) || 0 });
    state.editingItem = null;
    return;
  }

  state.items.push({
    id: `ITM-${String(state.items.length + 1).padStart(3, "0")}`,
    name: data.name || "Novo item",
    type: data.type || "Material",
    shelf: data.shelf || "A-01",
    qty: Number(data.qty) || 0,
    condition: data.condition || "Bom",
    status: data.status || "Disponível",
  });
}

function saveShelf(data) {
  if (state.editingShelf) {
    Object.assign(state.editingShelf, data, { capacity: Number(data.capacity) || 0, used: Number(data.used) || 0 });
    state.editingShelf = null;
    return;
  }

  state.shelves.push({
    id: data.id || `A-0${state.shelves.length + 1}`,
    location: data.location || "Sala do almoxarifado",
    capacity: Number(data.capacity) || 0,
    used: Number(data.used) || 0,
  });
}

function saveCaution(data) {
  state.cautions.push({
    id: `CAU-${String(state.cautions.length + 1).padStart(4, "0")}`,
    person: data.person || "Responsável",
    date: data.date || "25/05/2026",
    returnDate: data.returnDate || "31/05/2026",
    items: data.items || "Item",
    status: "Ativa",
  });
  state.page = "cautions";
}

function saveMovement(data) {
  const item = state.items.find(record => record.id.toLowerCase() === String(data.code).toLowerCase());
  state.movements.unshift({
    id: `MOV-${String(state.movements.length + 1).padStart(3, "0")}`,
    item: item ? item.name : "Item não identificado",
    code: data.code || "SEM-COD",
    type: data.type || "Saída",
    responsible: data.responsible || "Responsável",
    date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
  });
}

function deleteRecord(target) {
  const [type, id] = target.split(":");
  if (type === "item") state.items = state.items.filter(item => item.id !== id);
  if (type === "shelf") state.shelves = state.shelves.filter(shelf => shelf.id !== id);
  if (type === "caution") state.cautions = state.cautions.filter(caution => caution.id !== id);
  closeModal(false);
  render();
}

function closeModal(shouldRender = true) {
  state.modal = null;
  state.editingItem = null;
  state.editingShelf = null;
  if (shouldRender) render();
}

function field(label, name, placeholder, type = "text", value = "") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${value ?? ""}">
    </div>
  `;
}

function selectField(label, name, options, value = "") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}">
        ${options.map(option => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </div>
  `;
}

function stat(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function smallList(items) {
  return `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function statusTag(status) {
  const className = status === "Disponível" || status === "Ativa" ? "ok" : status === "Em cautela" ? "warn" : "blue";
  return `<span class="tag ${className}">${status}</span>`;
}

render();
