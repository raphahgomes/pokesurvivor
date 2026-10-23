/**
 * ============================================================================
 * PokéSurvivor Mod Menu & Ingame Engine (Chrome Extension & Online Injector)
 * ============================================================================
 * Injeta o Menu Completo de Mods diretamente no https://pokesurvivor.com/
 * Suporta:
 *  - ❤️ Modo Deus (Invencibilidade total)
 *  - ❤️ Vida Máxima Personalizada (Custom HP) e Regeneração
 *  - ⚔️ Multiplicador de Dano e One-Hit KO
 *  - ⚡ Ataque Rápido / Sem Cooldown
 *  - 🏃 Velocidade de Movimento e Super Ímã
 *  - 🌟 Desbloqueio de todos os 966 Pokémons e Shinies
 *  - 💰 Moedas e Tickets corrigidos com a Libreta (ledger) oficial
 */
(function() {
  'use strict';

  console.log('[PokeMods] Extensão ativada no PokéSurvivor!');

  // Estado dos Mods
  const settings = {
    godMode: false,
    customHpEnabled: false,
    customMaxHp: 10000,
    hpRegen: 0,
    damageMul: 1,
    oneHitKill: false,
    rapidFire: false,
    critAlways: false,
    speedMul: 1,
    superMagnet: 1
  };

  // Carrega configurações salvas do usuário
  try {
    const saved = localStorage.getItem('pokesurvivor.ext.mods');
    if (saved) Object.assign(settings, JSON.parse(saved));
  } catch (e) {}

  function saveSettings() {
    try {
      localStorage.setItem('pokesurvivor.ext.mods', JSON.stringify(settings));
    } catch (e) {}
  }

  // =========================================================================
  // 1. HOOKS DE VIDA E DANO (Intercepta o Player mesmo dentro do IIFE)
  // =========================================================================
  let activePlayer = null;
  let playerPrototypeHooked = false;

  function hookPlayerPrototype(proto) {
    if (playerPrototypeHooked || !proto) return;
    playerPrototypeHooked = true;
    console.log('[PokeMods] Hook no Player Prototype instalado com sucesso!');

    // Hook no Dano Recebido (HURT) -> Modo Deus e Vida Customizada
    const origHurt = proto.hurt;
    if (origHurt) {
      proto.hurt = function(amount, type, pure, cat) {
        if (settings.godMode) {
          this.dead = false;
          this.hp = this.maxHp;
          return; // Anula qualquer dano!
        }
        origHurt.call(this, amount, type, pure, cat);
        if (settings.godMode) {
          this.dead = false;
          this.hp = this.maxHp;
        }
      };
    }

    // Hook no Dano Causado (ATKFOR) -> Dano Multiplicado e One-Hit KO
    const origAtkFor = proto.atkFor;
    if (origAtkFor) {
      proto.atkFor = function(m) {
        let val = origAtkFor.call(this, m);
        if (settings.oneHitKill) return 999999;
        if (settings.damageMul > 1) val *= settings.damageMul;
        return val;
      };
    }

    // Hook no Update do Player (Regeneração, Sem Cooldown, Super Ímã)
    const origUpdate = proto.update;
    if (origUpdate) {
      proto.update = function(dt) {
        activePlayer = this;
        window.PokePlayer = this;

        if (settings.godMode) {
          this.dead = false;
          this.hp = this.maxHp;
        }

        if (settings.customHpEnabled && settings.customMaxHp) {
          if (this.maxHp !== settings.customMaxHp) {
            this.maxHp = settings.customMaxHp;
            this.hp = Math.min(this.hp, this.maxHp);
          }
        }

        if (settings.hpRegen > 0 && !this.dead) {
          this.hp = Math.min(this.maxHp, this.hp + settings.hpRegen * dt);
        }

        if (settings.rapidFire && this.slots) {
          this.cdMul = 0.05;
          for (const s of this.slots) {
            for (const m of s) {
              if (m.t > 0.05) m.t = 0.02;
            }
          }
        }

        if (settings.superMagnet > 1) {
          this.magnet = 78 * 10 * settings.superMagnet;
        }

        if (settings.critAlways) {
          this.critChance = 1.0;
        }

        origUpdate.call(this, dt);
      };
    }

    // Hook no Spd (Velocidade)
    const origSpdDesc = Object.getOwnPropertyDescriptor(proto, 'spd');
    if (origSpdDesc && origSpdDesc.get) {
      Object.defineProperty(proto, 'spd', {
        get: function() {
          let val = origSpdDesc.get.call(this);
          if (settings.speedMul && settings.speedMul !== 1) {
            val *= settings.speedMul;
          }
          return val;
        },
        configurable: true
      });
    }
  }

  // Intercepta a criação do Player através do lavaTick (propriedade única do Player)
  try {
    Object.defineProperty(Object.prototype, 'lavaTick', {
      set(v) {
        this._lavaTick = v;
        if (this.hp !== undefined && this.maxHp !== undefined) {
          activePlayer = this;
          window.PokePlayer = this;
          if (this.constructor && this.constructor.prototype) {
            hookPlayerPrototype(this.constructor.prototype);
          }
          if (settings.customHpEnabled && settings.customMaxHp) {
            this.maxHp = settings.customMaxHp;
            this.hp = this.maxHp;
          }
          if (settings.godMode) {
            this.hp = this.maxHp;
          }
        }
      },
      get() {
        return this._lavaTick;
      },
      configurable: true
    });
  } catch (e) {}

  // =========================================================================
  // 2. MOEDAS, TICKETS E POKÉMONS (COM A LIBRETA / LEDGER OFICIAL)
  // =========================================================================
  function getActiveSaves() {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ps.save.')) {
        try {
          const s = JSON.parse(localStorage.getItem(k));
          if (s) list.push({ key: k, save: s });
        } catch (e) {}
      }
    }
    return list;
  }

  function applyCurrenciesToSave(save, coinsToAdd, t1ToAdd, t10ToAdd) {
    save.coins = (save.coins || 0) + coinsToAdd;
    save.tickets = save.tickets || { t1: 0, t10: 0 };
    save.tickets.t1 = (save.tickets.t1 || 0) + t1ToAdd;
    save.tickets.t10 = (save.tickets.t10 || 0) + t10ToAdd;

    // ATUALIZAÇÃO DA LIBRETA (LEDGER): Isso impede o jogo de resetar suas moedas!
    save.led = save.led || {};
    save.led.base = save.led.base || {};
    save.led.base.c = [save.coins, 0];
    save.led.base.t1 = [save.tickets.t1, 0];
    save.led.base.t10 = [save.tickets.t10, 0];

    for (const dev in save.led) {
      if (dev !== 'base' && save.led[dev]) {
        if (save.led[dev].c) { save.led[dev].c[0] = Math.max(save.led[dev].c[0] || 0, save.coins); save.led[dev].c[1] = 0; }
        if (save.led[dev].t1) { save.led[dev].t1[0] = Math.max(save.led[dev].t1[0] || 0, save.tickets.t1); save.led[dev].t1[1] = 0; }
        if (save.led[dev].t10) { save.led[dev].t10[0] = Math.max(save.led[dev].t10[0] || 0, save.tickets.t10); save.led[dev].t10[1] = 0; }
      }
    }

    save.updated = Date.now();
  }

  function addCurrencies(coins = 500000, t1 = 200, t10 = 100) {
    const saves = getActiveSaves();
    for (const item of saves) {
      applyCurrenciesToSave(item.save, coins, t1, t10);
      localStorage.setItem(item.key, JSON.stringify(item.save));
    }

    // Se houver save em memória (G.DB.save)
    if (window.G && G.DB && G.DB.save) {
      applyCurrenciesToSave(G.DB.save, coins, t1, t10);
      if (G.DB.saveNow) G.DB.saveNow();
      if (G.DB.commit) G.DB.commit();
      if (G.UI && G.UI.chrome) G.UI.chrome(true);
    }

    // Atualiza imediatamente o DOM
    const coinsEl = document.getElementById('coins');
    if (coinsEl) {
      const current = parseInt(coinsEl.textContent.replace(/\D/g, ''), 10) || 0;
      coinsEl.textContent = (current + coins).toLocaleString('pt-BR');
    }
    const tPill = document.getElementById('tickets-pill');
    if (tPill && window.G && G.Icons) {
      tPill.innerHTML = `${G.Icons.html('ticket', 18)} 999 &nbsp;${G.Icons.html('ticket10', 18)} 999`;
    }

    showToast(`+${coins.toLocaleString('pt-BR')} Moedas e +${t1+t10} Tickets adicionados com sucesso!`, '💰');
  }

  function unlockAllPokemon() {
    const saves = getActiveSaves();
    for (const item of saves) {
      item.save.owned = item.save.owned || {};
      for (let dex = 1; dex <= 1025; dex++) {
        if (!item.save.owned[dex]) item.save.owned[dex] = { at: Date.now(), from: 'mod' };
      }
      item.save.updated = Date.now();
      localStorage.setItem(item.key, JSON.stringify(item.save));
    }
    if (window.G && G.DB && G.DB.save) {
      G.DB.save.owned = G.DB.save.owned || {};
      for (let dex = 1; dex <= 1025; dex++) {
        if (!G.DB.save.owned[dex]) G.DB.save.owned[dex] = { at: Date.now(), from: 'mod' };
      }
      if (G.DB.saveNow) G.DB.saveNow();
      if (G.DB.commit) G.DB.commit();
      if (G.MenuUI && G.UI && G.UI.isOpen && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    }
    showToast('🌟 Todos os 966 Pokémons foram desbloqueados!', '🌟');
  }

  function unlockAllShinies() {
    const saves = getActiveSaves();
    for (const item of saves) {
      item.save.owned = item.save.owned || {};
      item.save.shiny = item.save.shiny || {};
      for (let dex = 1; dex <= 1025; dex++) {
        item.save.owned[dex] = item.save.owned[dex] || { at: Date.now(), from: 'mod' };
        item.save.shiny[dex] = { at: Date.now(), from: 'mod' };
      }
      item.save.updated = Date.now();
      localStorage.setItem(item.key, JSON.stringify(item.save));
    }
    if (window.G && G.DB && G.DB.save) {
      G.DB.save.owned = G.DB.save.owned || {};
      G.DB.save.shiny = G.DB.save.shiny || {};
      for (let dex = 1; dex <= 1025; dex++) {
        G.DB.save.owned[dex] = G.DB.save.owned[dex] || { at: Date.now(), from: 'mod' };
        G.DB.save.shiny[dex] = { at: Date.now(), from: 'mod' };
      }
      if (G.DB.saveNow) G.DB.saveNow();
      if (G.DB.commit) G.DB.commit();
      if (G.MenuUI && G.UI && G.UI.isOpen && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    }
    showToast('✨ Todas as versões Shiny foram desbloqueadas!', '✨');
  }

  function unlockAllItems() {
    const saves = getActiveSaves();
    for (const item of saves) {
      item.save.bag = item.save.bag || {};
      item.save.tms = item.save.tms || {};
      for (const it of ['mint', 'cap', 'caph']) item.save.bag[it] = 99;
      item.save.updated = Date.now();
      localStorage.setItem(item.key, JSON.stringify(item.save));
    }
    if (window.G && G.DB && G.DB.save) {
      G.DB.save.bag = G.DB.save.bag || {};
      G.DB.save.tms = G.DB.save.tms || {};
      for (const it of ['mint', 'cap', 'caph']) G.DB.save.bag[it] = 99;
      if (G.DB.saveNow) G.DB.saveNow();
      if (G.DB.commit) G.DB.commit();
    }
    showToast('🎒 Itens e MTs adicionados à mochila!', '🎒');
  }

  // =========================================================================
  // 3. INTERFACE COMPLETA DO MOD MENU (ESTILO GLASSMORPHIC)
  // =========================================================================
  function injectStyles() {
    if (document.getElementById('pm-ext-styles')) return;
    const style = document.createElement('style');
    style.id = 'pm-ext-styles';
    style.textContent = `
      #pm-ext-floating-btn {
        position: fixed;
        top: 14px;
        right: 14px;
        z-index: 9999999;
        background: linear-gradient(135deg, #ffd000, #ff7a00);
        color: #121626;
        border: 2px solid #fff;
        border-radius: 20px;
        padding: 7px 15px;
        font-family: system-ui, sans-serif;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 18px rgba(255,140,0,0.5);
        user-select: none;
        transition: transform 0.2s;
      }
      #pm-ext-floating-btn:hover { transform: translateY(-2px) scale(1.04); }
      #pm-ext-floating-btn .pm-kbd {
        background: rgba(0,0,0,0.25);
        color: #fff;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        font-family: monospace;
      }
      #pm-ext-modal {
        position: fixed;
        inset: 0;
        background: rgba(10, 14, 28, 0.82);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 10000000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      #pm-ext-modal.open { opacity: 1; pointer-events: auto; }
      .pm-window {
        background: linear-gradient(180deg, #131a38 0%, #0d1226 100%);
        border: 2px solid #2d3b6e;
        border-radius: 16px;
        width: min(840px, 94vw);
        max-height: 88vh;
        box-shadow: 0 24px 60px rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #e2e8f8;
        font-family: system-ui, sans-serif;
      }
      .pm-hdr {
        padding: 14px 20px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .pm-hdr h2 { margin: 0; font-size: 19px; color: #fff; display: flex; align-items: center; gap: 8px; }
      .pm-tabs {
        display: flex;
        background: rgba(0,0,0,0.3);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 6px 16px 0;
        gap: 4px;
        overflow-x: auto;
      }
      .pm-tab-btn {
        background: transparent;
        border: none;
        color: #8b9ac4;
        font-size: 13px;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        transition: all 0.15s;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
      }
      .pm-tab-btn.active { color: #ffd000; background: rgba(255,208,0,0.08); border-bottom: 2px solid #ffd000; }
      .pm-body { padding: 20px; overflow-y: auto; flex: 1; }
      .pm-panel { display: none; }
      .pm-panel.active { display: block; }
      .pm-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 14px;
      }
      .pm-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .pm-label { font-size: 13px; font-weight: 700; color: #fff; }
      .pm-desc { font-size: 11px; color: #8b9ac4; margin-top: 2px; }
      .pm-btn {
        background: linear-gradient(135deg, #ffd000, #ff8c00);
        color: #121626;
        border: none;
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.15s;
      }
      .pm-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
      .pm-btn.green { background: linear-gradient(135deg, #00d26a, #00994c); color: #fff; }
      .pm-btn.red { background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; }
      .pm-switch { position: relative; width: 46px; height: 24px; }
      .pm-switch input { opacity: 0; width: 0; height: 0; }
      .pm-slider {
        position: absolute; cursor: pointer; inset: 0; background-color: #2b3554;
        transition: 0.25s; border-radius: 24px;
      }
      .pm-slider:before {
        position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
        background-color: white; transition: 0.25s; border-radius: 50%;
      }
      input:checked + .pm-slider { background-color: #00d26a; }
      input:checked + .pm-slider:before { transform: translateX(22px); }
      .pm-select {
        background: #080c18; border: 1px solid rgba(255,255,255,0.15); color: #ffd000;
        padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;
      }
      .pm-input {
        background: #080c18; border: 1px solid rgba(255,255,255,0.15); color: #ffd000;
        padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; width: 90px; text-align: right;
      }
      #pm-toast {
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(30px);
        background: rgba(14,20,42,0.96); border: 1px solid #ffd000; color: #fff;
        padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 700;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10000001; opacity: 0;
        transition: all 0.25s ease; pointer-events: none;
      }
      #pm-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    `;
    document.head.appendChild(style);
  }

  function showToast(msg, icon = '⚡') {
    let t = document.getElementById('pm-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pm-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${msg}</span>`;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function createUI() {
    injectStyles();

    // Botão Flutuante
    if (!document.getElementById('pm-ext-floating-btn')) {
      const btn = document.createElement('div');
      btn.id = 'pm-ext-floating-btn';
      btn.innerHTML = `<span>⚡ MODS</span> <span class="pm-kbd">F1</span>`;
      btn.onclick = toggleModal;
      document.body.appendChild(btn);
    }

    // Modal
    if (!document.getElementById('pm-ext-modal')) {
      const modal = document.createElement('div');
      modal.id = 'pm-ext-modal';
      modal.innerHTML = `
        <div class="pm-window">
          <div class="pm-hdr">
            <h2>⚡ PokéSurvivor Mod Menu</h2>
            <button style="background:transparent; border:none; color:#aaa; font-size:18px; cursor:pointer;" id="pm-btn-close">✕</button>
          </div>
          <div class="pm-tabs">
            <button class="pm-tab-btn active" data-tab="tab-life">❤️ Vida & Sobrevivência</button>
            <button class="pm-tab-btn" data-tab="tab-combat">⚔️ Combate & Dano</button>
            <button class="pm-tab-btn" data-tab="tab-pokes">🌟 Pokémons & Shinies</button>
            <button class="pm-tab-btn" data-tab="tab-money">💰 Moedas & Tickets</button>
          </div>
          <div class="pm-body">
            <!-- TAB 1: VIDA -->
            <div class="pm-panel active" id="tab-life">
              <div class="pm-card">
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🛡️ Modo Deus (Invulnerabilidade Total)</div>
                    <div class="pm-desc">Nunca perde vida, nunca morre e anula todo dano de inimigos e lava.</div>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="ext-godmode">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">❤️ Vida Máxima Personalizada</div>
                    <div class="pm-desc">Defina seu HP para o valor que quiser (ex: 10.000, 50.000, 100.000).</div>
                  </div>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <label class="pm-switch">
                      <input type="checkbox" id="ext-customhp-toggle">
                      <span class="pm-slider"></span>
                    </label>
                    <input type="number" id="ext-customhp-val" class="pm-input" value="10000" min="100" max="1000000">
                  </div>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">💖 Regeneração Rápida (HP por segundo)</div>
                    <div class="pm-desc">Cura sua vida continuamente enquanto você joga.</div>
                  </div>
                  <input type="number" id="ext-regen-val" class="pm-input" value="0" min="0" max="5000">
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🩹 Curar 100% Agora</div>
                    <div class="pm-desc">Restaura todo o seu HP instantaneamente durante a run.</div>
                  </div>
                  <button class="pm-btn green" id="ext-btn-heal">Curar Tudo</button>
                </div>
              </div>
            </div>

            <!-- TAB 2: COMBATE & DANO -->
            <div class="pm-panel" id="tab-combat">
              <div class="pm-card">
                <div class="pm-row">
                  <div>
                    <div class="pm-label">⚔️ Multiplicador de Dano</div>
                    <div class="pm-desc">Multiplica a força de todos os seus ataques físicos e especiais.</div>
                  </div>
                  <select id="ext-dmg-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="2">2x (Forte)</option>
                    <option value="5">5x (Devastador)</option>
                    <option value="10">10x (Insano)</option>
                    <option value="50">50x (Extremo)</option>
                  </select>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">💥 Eliminação com 1 Golpe (One-Hit KO)</div>
                    <div class="pm-desc">Qualquer ataque seu elimina instantaneamente o alvo com 999.999 de dano.</div>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="ext-onehit">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">⚡ Ataque Rápido / Sem Cooldown</div>
                    <div class="pm-desc">Disparo contínuo e ininterrupto estilo metralhadora.</div>
                  </div>
                  <label class="pm-switch">
                    <input type="checkbox" id="ext-rapidfire">
                    <span class="pm-slider"></span>
                  </label>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🏃 Velocidade de Movimento</div>
                    <div class="pm-desc">Corra muito mais rápido pelo mapa.</div>
                  </div>
                  <select id="ext-speed-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="1.5">1.5x (Rápido)</option>
                    <option value="2">2x (Muito Rápido)</option>
                    <option value="3">3x (Super Sonic)</option>
                  </select>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🧲 Super Ímã de Coleta</div>
                    <div class="pm-desc">Atrai XP, moedas e itens da tela toda ou de todo o mapa.</div>
                  </div>
                  <select id="ext-magnet-select" class="pm-select">
                    <option value="1">1x (Normal)</option>
                    <option value="5">5x (Amplo)</option>
                    <option value="20">20x (Tela Toda)</option>
                    <option value="100">100x (Mapa Inteiro)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 3: POKÉMONS & SHINIES -->
            <div class="pm-panel" id="tab-pokes">
              <div class="pm-card">
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🔓 Desbloquear Todos os 966 Pokémons</div>
                    <div class="pm-desc">Adiciona todos os Pokémons ao seu savegame imediatamente.</div>
                  </div>
                  <button class="pm-btn" id="ext-btn-unlock-pokes">Liberar 966 Pokémons</button>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">✨ Desbloquear Todas as Versões Shiny</div>
                    <div class="pm-desc">Libera todas as variantes Shiny disponíveis no jogo.</div>
                  </div>
                  <button class="pm-btn green" id="ext-btn-unlock-shinies">Liberar Todos Shinies</button>
                </div>
              </div>
            </div>

            <!-- TAB 4: MOEDAS & RECURSOS -->
            <div class="pm-panel" id="tab-money">
              <div class="pm-card">
                <div class="pm-row">
                  <div>
                    <div class="pm-label">💰 Adicionar +500.000 Moedas e +300 Tickets</div>
                    <div class="pm-desc">Atualiza tanto o saldo quanto a libreta (ledger) para o jogo não resetar.</div>
                  </div>
                  <button class="pm-btn" id="ext-btn-add-money">+500k Moedas & Tickets</button>
                </div>
                <div class="pm-row">
                  <div>
                    <div class="pm-label">🎒 Desbloquear Mochila (Ments, Cápsulas e MTs)</div>
                    <div class="pm-desc">Coloca 99 unidades de todos os itens e MTs na sua mochila.</div>
                  </div>
                  <button class="pm-btn green" id="ext-btn-unlock-bag">Encher Mochila</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Eventos dos botões
      document.getElementById('pm-btn-close').onclick = toggleModal;
      modal.onclick = (e) => { if (e.target === modal) toggleModal(); };

      // Tabs
      modal.querySelectorAll('.pm-tab-btn').forEach(btn => {
        btn.onclick = () => {
          modal.querySelectorAll('.pm-tab-btn').forEach(b => b.classList.remove('active'));
          modal.querySelectorAll('.pm-panel').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById(btn.dataset.tab).classList.add('active');
        };
      });

      // Controles de Vida
      const godEl = document.getElementById('ext-godmode');
      godEl.checked = !!settings.godMode;
      godEl.onchange = e => {
        settings.godMode = e.target.checked;
        saveSettings();
        if (activePlayer) { activePlayer.dead = false; activePlayer.hp = activePlayer.maxHp; }
        showToast(settings.godMode ? 'Modo Deus Ativado!' : 'Modo Deus Desativado.');
      };

      const hpToggle = document.getElementById('ext-customhp-toggle');
      const hpVal = document.getElementById('ext-customhp-val');
      hpToggle.checked = !!settings.customHpEnabled;
      hpVal.value = settings.customMaxHp || 10000;
      hpToggle.onchange = e => {
        settings.customHpEnabled = e.target.checked;
        settings.customMaxHp = parseInt(hpVal.value, 10) || 10000;
        saveSettings();
        if (activePlayer && settings.customHpEnabled) {
          activePlayer.maxHp = settings.customMaxHp;
          activePlayer.hp = activePlayer.maxHp;
        }
        showToast(settings.customHpEnabled ? `HP Máximo definido para ${settings.customMaxHp}!` : 'HP normal restaurado.');
      };
      hpVal.onchange = e => {
        settings.customMaxHp = parseInt(e.target.value, 10) || 10000;
        saveSettings();
        if (activePlayer && settings.customHpEnabled) {
          activePlayer.maxHp = settings.customMaxHp;
          activePlayer.hp = activePlayer.maxHp;
        }
      };

      const regenVal = document.getElementById('ext-regen-val');
      regenVal.value = settings.hpRegen || 0;
      regenVal.onchange = e => {
        settings.hpRegen = parseInt(e.target.value, 10) || 0;
        saveSettings();
        showToast(`Regeneração definida para +${settings.hpRegen} HP/s!`);
      };

      document.getElementById('ext-btn-heal').onclick = () => {
        if (activePlayer) {
          activePlayer.hp = activePlayer.maxHp;
          activePlayer.dead = false;
          showToast('Vida restaurada para 100%!', '💖');
        } else {
          showToast('Inicie uma partida para curar seu Pokémon.', '⚠️');
        }
      };

      // Controles de Dano
      const dmgSel = document.getElementById('ext-dmg-select');
      dmgSel.value = String(settings.damageMul || 1);
      dmgSel.onchange = e => {
        settings.damageMul = parseFloat(e.target.value) || 1;
        saveSettings();
        showToast(`Multiplicador de dano: ${settings.damageMul}x!`, '⚔️');
      };

      const oneHitEl = document.getElementById('ext-onehit');
      oneHitEl.checked = !!settings.oneHitKill;
      oneHitEl.onchange = e => {
        settings.oneHitKill = e.target.checked;
        saveSettings();
        showToast(settings.oneHitKill ? 'One-Hit KO Ativado!' : 'One-Hit KO Desativado.');
      };

      const rapidEl = document.getElementById('ext-rapidfire');
      rapidEl.checked = !!settings.rapidFire;
      rapidEl.onchange = e => {
        settings.rapidFire = e.target.checked;
        saveSettings();
        showToast(settings.rapidFire ? 'Ataque Rápido / Sem Cooldown Ativado!' : 'Ataque normal restaurado.');
      };

      const speedSel = document.getElementById('ext-speed-select');
      speedSel.value = String(settings.speedMul || 1);
      speedSel.onchange = e => {
        settings.speedMul = parseFloat(e.target.value) || 1;
        saveSettings();
        showToast(`Velocidade de movimento: ${settings.speedMul}x!`, '🏃');
      };

      const magSel = document.getElementById('ext-magnet-select');
      magSel.value = String(settings.superMagnet || 1);
      magSel.onchange = e => {
        settings.superMagnet = parseFloat(e.target.value) || 1;
        saveSettings();
        showToast(`Super Ímã: ${settings.superMagnet}x!`, '🧲');
      };

      // Moedas e Pokémons
      document.getElementById('ext-btn-unlock-pokes').onclick = unlockAllPokemon;
      document.getElementById('ext-btn-unlock-shinies').onclick = unlockAllShinies;
      document.getElementById('ext-btn-add-money').onclick = () => addCurrencies(500000, 200, 100);
      document.getElementById('ext-btn-unlock-bag').onclick = unlockAllItems;
    }
  }

  function toggleModal() {
    const modal = document.getElementById('pm-ext-modal');
    if (modal) modal.classList.toggle('open');
  }

  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'F1' || e.key === 'F2') {
      e.preventDefault();
      toggleModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    createUI();
  }
})();
