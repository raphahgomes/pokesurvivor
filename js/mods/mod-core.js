/**
 * ============================================================================
 * PokeMods - Core Modding Engine para PokeSurvivor
 * ============================================================================
 * Sistema modular para criação, injeção e controle de mods no PokeSurvivor.
 * Permite desbloquear todos os Pokémons, Shinies, customizar vida/HP,
 * dano, velocidade, economia, além de carregar mods criados pelo usuário.
 */
window.PokeMods = (() => {
  const STORAGE_KEY = 'pokesurvivor.mods.config';
  const customMods = new Map();
  const eventListeners = new Map();

  // Configurações padrão
  const defaults = {
    godMode: false,
    customHpEnabled: false,
    customMaxHp: 1000,
    hpRegen: 0,
    damageMul: 1,
    speedMul: 1,
    rapidFire: false,
    superMagnet: 1,
    critAlways: false,
    infiniteRerolls: false,
    freezeTimer: false,
    unlockAllPokemon: false,
    unlockAllShinies: false,
    oneHitKill: false
  };

  let settings = Object.assign({}, defaults);

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        settings = Object.assign({}, defaults, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('[PokeMods] Falha ao carregar configurações salvas:', e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[PokeMods] Falha ao salvar configurações:', e);
    }
  }

  function set(key, value) {
    settings[key] = value;
    saveSettings();
    emit('settingChanged', { key, value });
    applyLiveSettings();
  }

  function get(key) {
    return settings[key];
  }

  // Sistema de Eventos
  function on(event, callback) {
    if (!eventListeners.has(event)) eventListeners.set(event, []);
    eventListeners.get(event).push(callback);
  }

  function emit(event, data) {
    const list = eventListeners.get(event);
    if (list) {
      for (const cb of list) {
        try { cb(data); } catch (err) { console.error(`[PokeMods] Erro no evento '${event}':`, err); }
      }
    }
  }

  // Registro de Mods Customizados do Usuário
  function registerMod(modDef) {
    if (!modDef || !modDef.id) {
      console.error('[PokeMods] Mod inválido. É obrigatório fornecer um ID.');
      return false;
    }
    customMods.set(modDef.id, {
      id: modDef.id,
      name: modDef.name || modDef.id,
      description: modDef.description || '',
      author: modDef.author || 'Usuário',
      version: modDef.version || '1.0',
      enabled: modDef.enabled !== false,
      options: modDef.options || {},
      onInit: modDef.onInit || null,
      onUpdate: modDef.onUpdate || null,
      onGameStart: modDef.onGameStart || null,
      onPlayerHurt: modDef.onPlayerHurt || null
    });

    console.log(`[PokeMods] Mod registrado com sucesso: ${modDef.name || modDef.id}`);
    if (modDef.onInit) {
      try { modDef.onInit(window.PokeMods); } catch (e) { console.error(`[PokeMods] Erro no onInit do mod ${modDef.id}:`, e); }
    }
    emit('modRegistered', customMods.get(modDef.id));
    return true;
  }

  function getCustomMods() {
    return Array.from(customMods.values());
  }

  // =========================================================================
  // Funções de Desbloqueio e Trapaças da Conta
  // =========================================================================

  /**
   * Desbloqueia permanentemente todos os Pokémons no save atual.
   */
  function unlockAllPokemonPermanently() {
    if (!window.G || !G.DB || !G.DB.save || !G.DEX) {
      alert('Aguarde o carregamento do jogo para desbloquear.');
      return 0;
    }
    const save = G.DB.save;
    save.owned = save.owned || {};
    let added = 0;
    for (const mon of G.DEX) {
      if (!save.owned[mon.dex]) {
        save.owned[mon.dex] = { at: Date.now(), from: 'mod' };
        added++;
      }
    }
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    if (G.MenuUI && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    emit('collectionUpdated', { added, type: 'pokemon' });
    return added;
  }

  /**
   * Desbloqueia permanentemente todas as versões Shiny de todos os Pokémons.
   */
  function unlockAllShiniesPermanently() {
    if (!window.G || !G.DB || !G.DB.save || !G.DEX) {
      alert('Aguarde o carregamento do jogo para desbloquear.');
      return 0;
    }
    const save = G.DB.save;
    save.owned = save.owned || {};
    save.shiny = save.shiny || {};
    let added = 0;
    for (const mon of G.DEX) {
      // Garante que o Pokémon base existe
      if (!save.owned[mon.dex]) {
        save.owned[mon.dex] = { at: Date.now(), from: 'mod' };
      }
      if (G.Sprites && G.Sprites.hasShiny(mon.dex) && !save.shiny[mon.dex]) {
        save.shiny[mon.dex] = { at: Date.now(), from: 'mod' };
        added++;
      }
    }
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    if (G.MenuUI && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    emit('collectionUpdated', { added, type: 'shiny' });
    return added;
  }

  /**
   * Define qualquer Pokémon como parceiro ativo diretamente.
   */
  function setPartner(dex, shiny = false) {
    if (!window.G || !G.DB || !G.DB.save || !G.DEX_BY[dex]) return false;
    const save = G.DB.save;
    save.owned = save.owned || {};
    if (!save.owned[dex]) {
      save.owned[dex] = { at: Date.now(), from: 'mod' };
    }
    if (shiny) {
      save.shiny = save.shiny || {};
      save.shiny[dex] = { at: Date.now(), from: 'mod' };
    }
    save.partner = dex;
    save.partnerShiny = !!shiny;
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    if (G.MenuUI && G.UI.isOpen('scr-menu')) G.MenuUI.open();
    return true;
  }

  /**
   * Adiciona moedas e tickets do gacha na conta atual.
   */
  function addCurrencies(coins = 100000, t1 = 50, t10 = 20) {
    if (!window.G || !G.DB || !G.DB.save) return;
    const save = G.DB.save;
    save.coins = (save.coins || 0) + coins;
    save.tickets = save.tickets || { t1: 0, t10: 0 };
    save.tickets.t1 = (save.tickets.t1 || 0) + t1;
    save.tickets.t10 = (save.tickets.t10 || 0) + t10;
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    if (G.UI && G.UI.updateChrome) G.UI.updateChrome();
    emit('currenciesUpdated', { coins: save.coins, tickets: save.tickets });
  }

  /**
   * Desbloqueia 99 unidades de todas as MTs e itens da loja de Kecleon.
   */
  function unlockAllItemsAndTMs() {
    if (!window.G || !G.DB || !G.DB.save) return;
    const save = G.DB.save;
    save.bag = save.bag || {};
    save.tms = save.tms || {};
    if (G.Shop && G.Shop.ITEMS) {
      for (const id in G.Shop.ITEMS) save.bag[id] = 99;
    }
    if (G.Moves && G.Moves.BY_ID) {
      for (const id in G.Moves.BY_ID) save.tms[id] = 99;
    }
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    emit('inventoryUpdated');
  }

  /**
   * Eleva todas as melhorias do Pokémon atual para o nível máximo.
   */
  function maxCurrentPokemonUpgrades() {
    if (!window.G || !G.DB || !G.DB.save || !G.Upgrades || !G.Upgrades.ALL) return;
    const save = G.DB.save;
    const partner = save.partner;
    if (!partner) return;
    save.pupg = save.pupg || {};
    const upgs = save.pupg[partner] = save.pupg[partner] || {};
    for (const u of G.Upgrades.ALL) {
      upgs[u.id] = u.max;
    }
    if (G.DB.commit) G.DB.commit();
    if (G.DB.saveNow) G.DB.saveNow();
    emit('upgradesMaxed', { partner });
  }

  // =========================================================================
  // Funções em Tempo de Jogo (Durante a Run)
  // =========================================================================

  function getPlayer() {
    return window.G && G.Game ? G.Game.player : null;
  }

  function setPlayerHp(hpValue) {
    const pl = getPlayer();
    if (!pl) return;
    pl.maxHp = Math.max(1, hpValue);
    pl.hp = pl.maxHp;
    emit('playerHpModified', { hp: pl.hp, maxHp: pl.maxHp });
  }

  function healPlayerFull() {
    const pl = getPlayer();
    if (!pl) return;
    pl.hp = pl.maxHp;
    pl.dead = false;
    if (window.G && G.FX) {
      G.FX.ring(pl.x, pl.y, 8, 80, '#5fe08a', 0.5, 4);
      G.FX.dmgText(pl.x, pl.y - pl.bodyH - 10, 'HP CHEIO!', '#5fe08a', true);
    }
    if (window.G && G.Audio) G.Audio.sfx('heal');
  }

  function addLevels(amount = 1) {
    const pl = getPlayer();
    if (!pl) return;
    for (let i = 0; i < amount; i++) {
      pl.gainXp(pl.xpNext);
    }
    if (window.G && G.Game && G.Game.debugLevelUp && amount === 1) {
      // Pode abrir a tela de level up se desejado
    }
  }

  function killAllEnemies() {
    if (!window.G || !G.EnemyMgr) return 0;
    const enemies = G.EnemyMgr.all();
    let count = 0;
    const pl = getPlayer();
    for (const e of enemies) {
      if (!e.dead && !e.judge) {
        e.hurt(9999999, '#ff3048', 0, 0, 200, 'KO');
        count++;
      }
    }
    if (pl && window.G && G.FX) {
      G.FX.ring(pl.x, pl.y, 20, 600, '#ff3048', 0.6, 6);
    }
    if (window.G && G.Audio) G.Audio.sfx('break');
    return count;
  }

  function pullAllPickups() {
    if (window.G && G.Pickups && G.Pickups.pullAll) {
      G.Pickups.pullAll();
      const pl = getPlayer();
      if (pl && G.FX) {
        G.FX.ring(pl.x, pl.y, 12, 450, '#ff9ed8', 0.6, 4);
      }
    }
  }

  // =========================================================================
  // Injeção de Hooks no Engine do PokéSurvivor
  // =========================================================================

  function applyLiveSettings() {
    const pl = getPlayer();
    if (!pl) return;

    if (settings.godMode) {
      pl.hp = pl.maxHp;
      pl.dead = false;
    }

    if (settings.customHpEnabled && settings.customMaxHp) {
      if (pl.maxHp !== settings.customMaxHp) {
        pl.maxHp = settings.customMaxHp;
        pl.hp = Math.min(pl.hp, pl.maxHp);
      }
    }

    if (settings.superMagnet > 1) {
      pl.magnet = 78 * 10 * settings.superMagnet;
    }

    if (settings.critAlways) {
      pl.critChance = 1.0;
    }

    if (settings.infiniteRerolls) {
      pl.rerollBonus = 9999;
    }
  }

  function hookEngine() {
    if (!window.G) {
      setTimeout(hookEngine, 50);
      return;
    }

    // 1. Hook no Banco de Dados (G.DB) para override ao vivo de Pokémon e Shinies
    if (G.DB) {
      const origOwns = G.DB.owns;
      G.DB.owns = function(dex) {
        if (settings.unlockAllPokemon) return true;
        return origOwns.call(this, dex);
      };

      const origOwnsShiny = G.DB.ownsShiny;
      G.DB.ownsShiny = function(dex) {
        if (settings.unlockAllShinies) return true;
        return origOwnsShiny.call(this, dex);
      };
    }

    // 2. Hook no Player (G.Player)
    if (G.Player && G.Player.prototype) {
      // Hook no construtor de dano (hurt)
      const origHurt = G.Player.prototype.hurt;
      G.Player.prototype.hurt = function(amount, type = null, pure = false, cat = null) {
        // Modo Deus: bloqueia dano completamente
        if (settings.godMode) {
          if (this.dead) { this.dead = false; this.hp = this.maxHp; }
          return;
        }

        // Custom mod hook: onPlayerHurt
        for (const mod of customMods.values()) {
          if (mod.enabled && mod.onPlayerHurt) {
            const res = mod.onPlayerHurt(this, amount, type);
            if (res === false) return; // Mod cancelou o dano
            if (typeof res === 'number') amount = res;
          }
        }

        origHurt.call(this, amount, type, pure, cat);

        // Se tiver Custom Max HP ativado e estiver vivo, garante que não fique inconsistente
        if (settings.customHpEnabled && this.hp > settings.customMaxHp) {
          this.hp = settings.customMaxHp;
        }
      };

      // Hook no ciclo de update do player
      const origUpdate = G.Player.prototype.update;
      G.Player.prototype.update = function(dt) {
        origUpdate.call(this, dt);

        if (this.dead && settings.godMode) {
          this.dead = false;
          this.hp = this.maxHp;
        }

        // Regeneração de vida personalizada
        if (settings.hpRegen > 0 && !this.dead) {
          this.hp = Math.min(this.maxHp, this.hp + settings.hpRegen * dt);
        }

        // Ataque rápido / sem cooldown
        if (settings.rapidFire && this.slots) {
          this.cdMul = 0.05;
          for (const s of this.slots) {
            for (const m of s) {
              if (m.t > 0.05) m.t = 0.02;
            }
          }
        }

        // Super ímã contínuo
        if (settings.superMagnet > 1) {
          this.magnet = 78 * (settings.superMagnet * 5);
        }

        // Rerolls infinitos
        if (settings.infiniteRerolls) {
          this.rerollBonus = 9999;
        }

        // Executa updates de mods customizados
        for (const mod of customMods.values()) {
          if (mod.enabled && mod.onUpdate) {
            try { mod.onUpdate(this, dt); } catch (e) { console.error(`[PokeMods] Erro no onUpdate do mod ${mod.id}:`, e); }
          }
        }
      };

      // Hook de ataque (atkFor)
      const origAtkFor = G.Player.prototype.atkFor;
      G.Player.prototype.atkFor = function(m) {
        let val = origAtkFor.call(this, m);
        if (settings.oneHitKill) return 999999;
        if (settings.damageMul > 1) val *= settings.damageMul;
        return val;
      };

      // Hook de velocidade (spd)
      const origSpdDesc = Object.getOwnPropertyDescriptor(G.Player.prototype, 'spd');
      if (origSpdDesc && origSpdDesc.get) {
        Object.defineProperty(G.Player.prototype, 'spd', {
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

    // 3. Hook na inicialização da run (startRun)
    if (G.Game && G.Game.startRun) {
      const origStartRun = G.Game.startRun;
      G.Game.startRun = function(coop = null) {
        origStartRun.call(this, coop);
        const pl = G.Game.player;
        if (pl) {
          if (settings.customHpEnabled && settings.customMaxHp) {
            pl.maxHp = settings.customMaxHp;
            pl.hp = pl.maxHp;
          }
          if (settings.godMode) {
            pl.hp = pl.maxHp;
          }
          if (settings.critAlways) {
            pl.critChance = 1.0;
          }
          if (settings.infiniteRerolls) {
            pl.rerollBonus = 9999;
          }

          for (const mod of customMods.values()) {
            if (mod.enabled && mod.onGameStart) {
              try { mod.onGameStart(pl); } catch (e) { console.error(`[PokeMods] Erro no onGameStart do mod ${mod.id}:`, e); }
            }
          }
        }
      };
    }

    console.log('[PokeMods] Hooks injetados com sucesso no PokéSurvivor!');
  }

  // Inicialização do Core
  loadSettings();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookEngine);
  } else {
    hookEngine();
  }

  return {
    settings,
    set,
    get,
    saveSettings,
    loadSettings,
    on,
    emit,
    registerMod,
    getCustomMods,
    unlockAllPokemonPermanently,
    unlockAllShiniesPermanently,
    setPartner,
    addCurrencies,
    unlockAllItemsAndTMs,
    maxCurrentPokemonUpgrades,
    getPlayer,
    setPlayerHp,
    healPlayerFull,
    addLevels,
    killAllEnemies,
    pullAllPickups,
    applyLiveSettings
  };
})();
