/**
 * ============================================================================
 * PokeMods - Menu UI & Interactive Overlay
 * ============================================================================
 * Cria a interface do usuário do menu de mods, botão flutuante e atalhos de teclado.
 */
window.PokeModUI = (() => {
  let isOpen = false;
  let activeTab = 'tab-pokemon';

  function init() {
    createLauncherButton();
    createModal();
    setupKeyboardShortcuts();
    setupEventListeners();
  }

  function showToast(message, icon = '⚡') {
    let toast = document.getElementById('pokemods-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pokemods-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function toggle() {
    isOpen = !isOpen;
    const modal = document.getElementById('pokemods-modal');
    if (modal) {
      modal.classList.toggle('open', isOpen);
      if (isOpen) syncInputsWithSettings();
    }
  }

  function close() {
    isOpen = false;
    const modal = document.getElementById('pokemods-modal');
    if (modal) modal.classList.remove('open');
  }

  function open() {
    isOpen = true;
    const modal = document.getElementById('pokemods-modal');
    if (modal) {
      modal.classList.add('open');
      syncInputsWithSettings();
    }
  }

  function createLauncherButton() {
    if (document.getElementById('pokemods-launcher')) return;
    const btn = document.createElement('div');
    btn.id = 'pokemods-launcher';
    btn.title = 'Abrir Menu de Mods (F1 ou M)';
    btn.innerHTML = `
      <span class="pm-icon">⚡</span>
      <span>MODS</span>
      <span class="pm-kbd">F1</span>
    `;
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignora digitação em campos de texto
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') close();
        return;
      }
      if (e.key === 'F1' || e.key === 'F2') {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Atalho rápido 'M' fora de menus de escrita
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    });
  }

  function createModal() {
    if (document.getElementById('pokemods-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'pokemods-modal';
    modal.innerHTML = `
      <div class="pokemods-window">
        <!-- Header -->
        <div class="pm-header">
          <div class="pm-title-group">
            <div class="pm-logo-badge">⚡</div>
            <div>
              <h2>PokéSurvivor Modding Engine</h2>
              <div class="pm-header-subtitle">Criado para testes, modificações e diversão offline · Pressione F1 a qualquer momento</div>
            </div>
          </div>
          <button class="pm-close-btn" id="pm-close-btn" title="Fechar">✕</button>
        </div>

        <!-- Tab Buttons -->
        <div class="pm-tabs-bar">
          <button class="pm-tab-btn active" data-tab="tab-pokemon">🌟 Pokémon & Shinies</button>
          <button class="pm-tab-btn" data-tab="tab-hp">❤️ Vida & Sobrevivência</button>
          <button class="pm-tab-btn" data-tab="tab-combat">⚔️ Combate & Poder</button>
          <button class="pm-tab-btn" data-tab="tab-economy">💎 Recursos & Loja</button>
          <button class="pm-tab-btn" data-tab="tab-run">🎮 Partida & Ondas</button>
          <button class="pm-tab-btn" data-tab="tab-custom">🧩 Mods Criados</button>
        </div>

        <!-- Tab Contents -->
        <div class="pm-content-area">
          <!-- TAB 1: POKÉMON & SHINIES -->
          <div class="pm-tab-panel active" id="tab-pokemon">
            <div class="pm-grid">
              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Coleção de Pokémons</span>
                  <span class="pm-card-badge">966 Total</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Liberar Todos os Pokémons (Ao Vivo)</span>
                    <span class="pm-control-desc">Torna todos os 966 Pokémons disponíveis na Pokédex e seleção.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-all-pokemon">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Salvar Permanentemente no Save</span>
                    <span class="pm-control-desc">Adiciona todos os 966 Pokémons diretamente no savegame atual.</span>
                  </div>
                  <button class="pm-btn pm-btn-primary" id="btn-save-all-pokemon">🔓 Desbloquear Todos</button>
                </div>
              </div>

              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Coleção Shiny</span>
                  <span class="pm-card-badge">✨ Raras</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Liberar Todos os Shinies (Ao Vivo)</span>
                    <span class="pm-control-desc">Habilita a versão Shiny de qualquer Pokémon imediatamente.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-all-shinies">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Salvar Shinies no Save</span>
                    <span class="pm-control-desc">Adiciona todas as versões Shiny ao save local permanentemente.</span>
                  </div>
                  <button class="pm-btn pm-btn-primary" id="btn-save-all-shinies">✨ Liberar Todos Shinies</button>
                </div>
              </div>

              <div class="pm-card" style="grid-column: 1 / -1;">
                <div class="pm-card-header">
                  <span class="pm-card-title">Escolher Parceiro Imediato</span>
                  <span class="pm-card-badge">Qualquer Gen</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                  <span style="font-size:13px; color:#8b9ac4;">Selecione qualquer Pokémon pelo Número na Pokédex:</span>
                  <input type="number" id="pm-quick-dex-input" min="1" max="1025" value="25" class="pm-number-input" style="width:80px;">
                  <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                    <input type="checkbox" id="pm-quick-shiny-check"> Versão Shiny
                  </label>
                  <button class="pm-btn pm-btn-success" id="btn-quick-set-partner">Definir como Parceiro</button>
                  <span id="pm-quick-partner-name" style="font-size:12px; color:#ffd000; font-weight:700;">(Pikachu)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: HP & SOBREVIVÊNCIA -->
          <div class="pm-tab-panel" id="tab-hp">
            <div class="pm-grid">
              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Modo Deus (Invencibilidade)</span>
                  <span class="pm-card-badge">Imortal</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Invulnerabilidade Total</span>
                    <span class="pm-control-desc">Nunca perde vida nem morre por ataques, lava ou armadilhas.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-godmode">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Curar 100% Agora</span>
                    <span class="pm-control-desc">Restaura todo o HP do jogador imediatamente.</span>
                  </div>
                  <button class="pm-btn pm-btn-success" id="btn-heal-full">💖 Curar Tudo</button>
                </div>
              </div>

              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Vida Máxima Personalizada</span>
                  <span class="pm-card-badge">Custom HP</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Ativar HP Personalizado</span>
                    <span class="pm-control-desc">Substitui o HP padrão pelo valor que você escolher.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-custom-hp">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Quantidade de HP:</span>
                    <span class="pm-control-desc">Escolha de 100 até 1.000.000 de vida</span>
                  </div>
                  <div class="pm-range-group">
                    <input type="range" id="mod-hp-range" min="100" max="100000" step="100" value="1000" class="pm-range-slider">
                    <input type="number" id="mod-hp-number" min="10" max="1000000" value="1000" class="pm-number-input">
                  </div>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Regeneração Contínua (HP/s):</span>
                    <span class="pm-control-desc">Vida recuperada a cada segundo.</span>
                  </div>
                  <div class="pm-range-group">
                    <input type="range" id="mod-regen-range" min="0" max="500" step="5" value="0" class="pm-range-slider">
                    <input type="number" id="mod-regen-number" min="0" max="5000" value="0" class="pm-number-input">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: COMBATE & PODER -->
          <div class="pm-tab-panel" id="tab-combat">
            <div class="pm-grid">
              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Dano e Ataque</span>
                  <span class="pm-card-badge">Poder</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Multiplicador de Dano</span>
                    <span class="pm-control-desc">Multiplica todo dano causado aos inimigos.</span>
                  </div>
                  <select id="mod-damage-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="2">2x (Forte)</option>
                    <option value="5">5x (Devastador)</option>
                    <option value="10">10x (Insano)</option>
                    <option value="50">50x (Extremo)</option>
                  </select>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Eliminação com 1 Golpe (One-Hit KO)</span>
                    <span class="pm-control-desc">Qualquer dano causa 999.999 instantâneo.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-onehit">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Ataque Rápido / Sem Cooldown</span>
                    <span class="pm-control-desc">Disparo contínuo estilo metralhadora.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-rapidfire">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">100% Acerto Crítico</span>
                    <span class="pm-control-desc">Todos os ataques causam dano crítico laranja.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-crit">
                    <span class="pm-slider"></span>
                  </label>
                </div>
              </div>

              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Mobilidade e Alcance</span>
                  <span class="pm-card-badge">Agilidade</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Velocidade de Movimento</span>
                    <span class="pm-control-desc">Acelera o caminhar do seu Pokémon.</span>
                  </div>
                  <select id="mod-speed-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="1.5">1.5x (Rápido)</option>
                    <option value="2">2x (Muito Rápido)</option>
                    <option value="3">3x (Super Sonic)</option>
                  </select>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Super Ímã de Coleta</span>
                    <span class="pm-control-desc">Alcance de atração de XP, moedas e itens.</span>
                  </div>
                  <select id="mod-magnet-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="3">3x (Amplo)</option>
                    <option value="10">10x (Tela Toda)</option>
                    <option value="40">40x (Mapa Inteiro)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: RECURSOS & ECONOMIA -->
          <div class="pm-tab-panel" id="tab-economy">
            <div class="pm-grid">
              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Moedas e Tickets de Gacha</span>
                  <span class="pm-card-badge">Economia</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Adicionar +100.000 Moedas</span>
                    <span class="pm-control-desc">Gaste à vontade na loja e melhorias.</span>
                  </div>
                  <button class="pm-btn pm-btn-primary" id="btn-add-coins">💰 +100k Moedas</button>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Adicionar Tickets do Gacha</span>
                    <span class="pm-control-desc">Receba +50 tickets simples e +20 tickets ×10.</span>
                  </div>
                  <button class="pm-btn pm-btn-primary" id="btn-add-tickets">🎟️ +Tickets Gacha</button>
                </div>
              </div>

              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Mochila, MTs e Melhorias</span>
                  <span class="pm-card-badge">Upgrades</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Desbloquear Todas MTs & Itens</span>
                    <span class="pm-control-desc">Adiciona 99 unidades de cada item da loja de Kecleon.</span>
                  </div>
                  <button class="pm-btn pm-btn-success" id="btn-unlock-bag">🎒 Desbloquear Tudo</button>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Maximizar Melhorias do Parceiro</span>
                    <span class="pm-control-desc">Coloca todos os perks no nível máximo (5/5).</span>
                  </div>
                  <button class="pm-btn pm-btn-success" id="btn-max-upgrades">⭐ Max Upgrades</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: PARTIDA & ONDAS -->
          <div class="pm-tab-panel" id="tab-run">
            <div class="pm-grid">
              <div class="pm-card">
                <div class="pm-card-header">
                  <span class="pm-card-title">Ações em Tempo Real</span>
                  <span class="pm-card-badge">Ao Vivo</span>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Subir de Nível Instantaneamente</span>
                    <span class="pm-control-desc">Ganha XP suficiente para o próximo nível.</span>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="pm-btn pm-btn-primary" id="btn-add-level-1">+1 Nível</button>
                    <button class="pm-btn pm-btn-primary" id="btn-add-level-10">+10 Níveis</button>
                  </div>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Eliminar Todos os Inimigos</span>
                    <span class="pm-control-desc">Derruba instantaneamente todos os Pokémon na tela.</span>
                  </div>
                  <button class="pm-btn pm-btn-danger" id="btn-nuke-enemies">💥 Limpar Tela (Nuke)</button>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Puxar Todos os Drops do Mapa</span>
                    <span class="pm-control-desc">Atrai imediatamente todas as orbes, itens e moedas.</span>
                  </div>
                  <button class="pm-btn pm-btn-success" id="btn-pull-all-drops">🧲 Puxar Todos Drops</button>
                </div>
                <div class="pm-control-row">
                  <div class="pm-control-info">
                    <span class="pm-control-label">Rerolls Infinitos de Habilidades</span>
                    <span class="pm-control-desc">Troque as opções de cartas quantas vezes quiser.</span>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="mod-toggle-rerolls">
                    <span class="pm-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 6: MODS CUSTOMIZADOS (USER MODS) -->
          <div class="pm-tab-panel" id="tab-custom">
            <div class="pm-card" style="margin-bottom:16px;">
              <div class="pm-card-header">
                <span class="pm-card-title">Mods Customizados do Usuário</span>
                <span class="pm-card-badge" id="pm-custom-mods-count">0 Ativos</span>
              </div>
              <p style="font-size:13px; color:#a4b3d8; margin:0 0 12px;">
                Você pode criar seus próprios scripts facilmente no arquivo <code>mods/custom-mods.js</code>!
              </p>
              <div id="pm-custom-mods-list">
                <p style="color:#8b9ac4; font-size:12px;">Nenhum mod externo carregado.</p>
              </div>
            </div>

            <div class="pm-card">
              <div class="pm-card-header">
                <span class="pm-card-title">Como criar o seu próprio mod</span>
                <span class="pm-card-badge">Guia Rápido</span>
              </div>
              <p style="font-size:12px; color:#8b9ac4; margin:0 0 8px;">
                Abra o arquivo <b><code>mods/custom-mods.js</code></b> e adicione seu código com a API simples:
              </p>
              <div class="pm-code-box">
PokeMods.registerMod({
  id: 'meu_mod_super_velocidade',
  name: 'Super Corrida',
  description: 'Faz seu Pokémon correr 4x mais rápido!',
  onGameStart: (player) => {
    player.baseSpd *= 2;
  },
  onUpdate: (player, dt) => {
    // Código executado a cada frame durante a run!
  }
});
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Fechar ao clicar fora da janela
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.getElementById('pm-close-btn').addEventListener('click', close);

    // Troca de abas
    modal.querySelectorAll('.pm-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.pm-tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.pm-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
        if (target === 'tab-custom') renderCustomModsList();
      });
    });
  }

  function setupEventListeners() {
    const $ = id => document.getElementById(id);

    // Desbloqueio Pokémon
    $('mod-toggle-all-pokemon').addEventListener('change', e => {
      PokeMods.set('unlockAllPokemon', e.target.checked);
      showToast(e.target.checked ? 'Todos os Pokémons Liberados (Ao Vivo)!' : 'Modo normal restaurado.');
      if (window.G && G.MenuUI && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    });

    $('btn-save-all-pokemon').addEventListener('click', () => {
      const n = PokeMods.unlockAllPokemonPermanently();
      showToast(`${n} Pokémons adicionados ao Save permanentemente!`, '🌟');
    });

    // Desbloqueio Shinies
    $('mod-toggle-all-shinies').addEventListener('change', e => {
      PokeMods.set('unlockAllShinies', e.target.checked);
      showToast(e.target.checked ? 'Todos os Shinies Liberados (Ao Vivo)!' : 'Shinies normais restaurados.');
      if (window.G && G.MenuUI && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    });

    $('btn-save-all-shinies').addEventListener('click', () => {
      const n = PokeMods.unlockAllShiniesPermanently();
      showToast(`${n} Shinies adicionados ao Save permanentemente!`, '✨');
    });

    // Parceiro Imediato
    const quickInput = $('pm-quick-dex-input');
    const quickLabel = $('pm-quick-partner-name');
    quickInput.addEventListener('input', () => {
      const d = parseInt(quickInput.value, 10);
      if (window.G && G.DEX_BY && G.DEX_BY[d]) {
        quickLabel.textContent = `(${G.DEX_BY[d].name})`;
      } else {
        quickLabel.textContent = `(Desconhecido)`;
      }
    });

    $('btn-quick-set-partner').addEventListener('click', () => {
      const dex = parseInt(quickInput.value, 10);
      const shiny = $('pm-quick-shiny-check').checked;
      if (PokeMods.setPartner(dex, shiny)) {
        const mon = G.DEX_BY[dex];
        showToast(`Parceiro definido: ${mon ? mon.name : dex} ${shiny ? '✨ (Shiny)' : ''}!`, '👑');
      } else {
        showToast('Não foi possível definir o parceiro.', '⚠️');
      }
    });

    // Modo Deus
    $('mod-toggle-godmode').addEventListener('change', e => {
      PokeMods.set('godMode', e.target.checked);
      showToast(e.target.checked ? 'Modo Deus Ativado (Invencível)!' : 'Modo Deus Desativado.');
    });

    $('btn-heal-full').addEventListener('click', () => {
      PokeMods.healPlayerFull();
      showToast('Vida restaurada para 100%!', '💖');
    });

    // Custom HP
    $('mod-toggle-custom-hp').addEventListener('change', e => {
      PokeMods.set('customHpEnabled', e.target.checked);
      if (e.target.checked) {
        const val = parseInt($('mod-hp-number').value, 10) || 1000;
        PokeMods.setPlayerHp(val);
        showToast(`Vida máxima definida para ${val}!`, '❤️');
      } else {
        showToast('Vida máxima padrão restaurada.');
      }
    });

    const hpRange = $('mod-hp-range');
    const hpNum = $('mod-hp-number');
    hpRange.addEventListener('input', () => {
      hpNum.value = hpRange.value;
      PokeMods.set('customMaxHp', parseInt(hpRange.value, 10));
      if (PokeMods.get('customHpEnabled')) PokeMods.setPlayerHp(parseInt(hpRange.value, 10));
    });
    hpNum.addEventListener('change', () => {
      hpRange.value = hpNum.value;
      PokeMods.set('customMaxHp', parseInt(hpNum.value, 10));
      if (PokeMods.get('customHpEnabled')) PokeMods.setPlayerHp(parseInt(hpNum.value, 10));
    });

    // Regeneração
    const regRange = $('mod-regen-range');
    const regNum = $('mod-regen-number');
    regRange.addEventListener('input', () => {
      regNum.value = regRange.value;
      PokeMods.set('hpRegen', parseInt(regRange.value, 10));
    });
    regNum.addEventListener('change', () => {
      regRange.value = regNum.value;
      PokeMods.set('hpRegen', parseInt(regNum.value, 10));
    });

    // Dano
    $('mod-damage-select').addEventListener('change', e => {
      const mul = parseFloat(e.target.value);
      PokeMods.set('damageMul', mul);
      showToast(`Multiplicador de dano: ${mul}x!`, '⚔️');
    });

    $('mod-toggle-onehit').addEventListener('change', e => {
      PokeMods.set('oneHitKill', e.target.checked);
      showToast(e.target.checked ? 'One-Hit KO Ativado!' : 'One-Hit KO Desativado.');
    });

    $('mod-toggle-rapidfire').addEventListener('change', e => {
      PokeMods.set('rapidFire', e.target.checked);
      showToast(e.target.checked ? 'Ataque Rápido / Sem Cooldown Ativado!' : 'Ataque normal restaurado.');
    });

    $('mod-toggle-crit').addEventListener('change', e => {
      PokeMods.set('critAlways', e.target.checked);
      showToast(e.target.checked ? '100% Acerto Crítico Ativado!' : 'Crítico normal restaurado.');
    });

    // Velocidade & Ímã
    $('mod-speed-select').addEventListener('change', e => {
      const mul = parseFloat(e.target.value);
      PokeMods.set('speedMul', mul);
      showToast(`Velocidade de movimento: ${mul}x!`, '🏃');
    });

    $('mod-magnet-select').addEventListener('change', e => {
      const mul = parseFloat(e.target.value);
      PokeMods.set('superMagnet', mul);
      showToast(`Alcance do ímã: ${mul}x!`, '🧲');
    });

    // Economia
    $('btn-add-coins').addEventListener('click', () => {
      PokeMods.addCurrencies(100000, 0, 0);
      showToast('+100.000 Moedas adicionadas!', '💰');
    });

    $('btn-add-tickets').addEventListener('click', () => {
      PokeMods.addCurrencies(0, 50, 20);
      showToast('+50 Tickets e +20 Tickets ×10 adicionados!', '🎟️');
    });

    $('btn-unlock-bag').addEventListener('click', () => {
      PokeMods.unlockAllItemsAndTMs();
      showToast('Todas as MTs e itens adicionados à mochila!', '🎒');
    });

    $('btn-max-upgrades').addEventListener('click', () => {
      PokeMods.maxCurrentPokemonUpgrades();
      showToast('Todas as melhorias do parceiro maximizadas!', '⭐');
    });

    // Partida
    $('btn-add-level-1').addEventListener('click', () => {
      PokeMods.addLevels(1);
      showToast('+1 Nível concedido!', '🆙');
    });

    $('btn-add-level-10').addEventListener('click', () => {
      PokeMods.addLevels(10);
      showToast('+10 Níveis concedidos!', '🆙');
    });

    $('btn-nuke-enemies').addEventListener('click', () => {
      const count = PokeMods.killAllEnemies();
      showToast(`${count} Inimigos eliminados!`, '💥');
    });

    $('btn-pull-all-drops').addEventListener('click', () => {
      PokeMods.pullAllPickups();
      showToast('Todos os drops puxados para o jogador!', '🧲');
    });

    $('mod-toggle-rerolls').addEventListener('change', e => {
      PokeMods.set('infiniteRerolls', e.target.checked);
      showToast(e.target.checked ? 'Rerolls Infinitos de Habilidade Ativados!' : 'Rerolls normais restaurados.');
    });
  }

  function syncInputsWithSettings() {
    const $ = id => document.getElementById(id);
    const s = PokeMods.settings;

    if ($('mod-toggle-all-pokemon')) $('mod-toggle-all-pokemon').checked = !!s.unlockAllPokemon;
    if ($('mod-toggle-all-shinies')) $('mod-toggle-all-shinies').checked = !!s.unlockAllShinies;
    if ($('mod-toggle-godmode')) $('mod-toggle-godmode').checked = !!s.godMode;
    if ($('mod-toggle-custom-hp')) $('mod-toggle-custom-hp').checked = !!s.customHpEnabled;
    if ($('mod-hp-range')) $('mod-hp-range').value = s.customMaxHp || 1000;
    if ($('mod-hp-number')) $('mod-hp-number').value = s.customMaxHp || 1000;
    if ($('mod-regen-range')) $('mod-regen-range').value = s.hpRegen || 0;
    if ($('mod-regen-number')) $('mod-regen-number').value = s.hpRegen || 0;
    if ($('mod-damage-select')) $('mod-damage-select').value = String(s.damageMul || 1);
    if ($('mod-toggle-onehit')) $('mod-toggle-onehit').checked = !!s.oneHitKill;
    if ($('mod-toggle-rapidfire')) $('mod-toggle-rapidfire').checked = !!s.rapidFire;
    if ($('mod-toggle-crit')) $('mod-toggle-crit').checked = !!s.critAlways;
    if ($('mod-speed-select')) $('mod-speed-select').value = String(s.speedMul || 1);
    if ($('mod-magnet-select')) $('mod-magnet-select').value = String(s.superMagnet || 1);
    if ($('mod-toggle-rerolls')) $('mod-toggle-rerolls').checked = !!s.infiniteRerolls;

    renderCustomModsList();
  }

  function renderCustomModsList() {
    const container = document.getElementById('pm-custom-mods-list');
    const badge = document.getElementById('pm-custom-mods-count');
    if (!container) return;

    const mods = PokeMods.getCustomMods();
    if (badge) badge.textContent = `${mods.length} Carregado${mods.length === 1 ? '' : 's'}`;

    if (!mods.length) {
      container.innerHTML = '<p style="color:#8b9ac4; font-size:12px;">Nenhum mod adicional carregado ainda. Adicione novos mods em <code>mods/custom-mods.js</code>.</p>';
      return;
    }

    container.innerHTML = mods.map(m => `
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b style="color:#ffd000; font-size:13px;">${m.name}</b> <small style="color:#8b9ac4;">v${m.version} por ${m.author}</small>
          <div style="font-size:11px; color:#c0cce8; margin-top:2px;">${m.description}</div>
        </div>
        <span style="background:rgba(0,210,106,0.15); color:#00d26a; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">Ativo</span>
      </div>
    `).join('');
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    open,
    close,
    toggle,
    showToast
  };
})();
