// ==UserScript==
// @name         PokéSurvivor Mod Menu & Unlocker
// @namespace    https://github.com/JPTER78/pokesurvivor
// @version      1.0
// @description  Menu de mods completo para o PokeSurvivor oficial: libera todos os Pokémons, Shinies, vida customizada, moedas e cheats!
// @author       Antigravity
// @match        https://pokesurvivor.com/*
// @match        http://localhost:*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  console.log('[PokeMods] Inicializando Mod Injector para PokeSurvivor...');

  // =========================================================================
  // 1. Modificador e Desbloqueador de Save no localStorage
  // =========================================================================
  function getActiveSaveKey() {
    return localStorage.getItem('ps.session') || Object.keys(localStorage).find(k => k.startsWith('ps.save.'));
  }

  function modifySave(fn) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ps.save.')) {
        try {
          const save = JSON.parse(localStorage.getItem(key));
          if (save) {
            fn(save);
            localStorage.setItem(key, JSON.stringify(save));
            console.log(`[PokeMods] Save '${key}' atualizado com sucesso!`);
          }
        } catch (e) {
          console.error('[PokeMods] Erro ao modificar save:', e);
        }
      }
    }
  }

  window.PokeModsOnline = {
    // Desbloqueia todos os 966 Pokémons
    unlockAllPokemon: function() {
      modifySave(save => {
        save.owned = save.owned || {};
        for (let dex = 1; dex <= 1025; dex++) {
          if (!save.owned[dex]) {
            save.owned[dex] = { at: Date.now(), from: 'mod' };
          }
        }
      });
      alert('🌟 Todos os Pokémons foram desbloqueados! Recarregue a página para ver a Pokédex cheia.');
    },

    // Desbloqueia todas as versões Shinies
    unlockAllShinies: function() {
      modifySave(save => {
        save.owned = save.owned || {};
        save.shiny = save.shiny || {};
        for (let dex = 1; dex <= 1025; dex++) {
          save.owned[dex] = save.owned[dex] || { at: Date.now(), from: 'mod' };
          save.shiny[dex] = { at: Date.now(), from: 'mod' };
        }
      });
      alert('✨ Todas as versões Shiny foram desbloqueadas! Recarregue a página para conferir.');
    },

    // Moedas e Tickets infinitos
    addCurrencies: function(coins = 500000, t1 = 200, t10 = 100) {
      modifySave(save => {
        save.coins = (save.coins || 0) + coins;
        save.tickets = save.tickets || { t1: 0, t10: 0 };
        save.tickets.t1 = (save.tickets.t1 || 0) + t1;
        save.tickets.t10 = (save.tickets.t10 || 0) + t10;
      });
      alert('💰 +500.000 Moedas e centenas de Tickets de Gacha adicionados!');
    },

    // Desbloquear todas as MTs e itens
    unlockAllItems: function() {
      modifySave(save => {
        save.bag = save.bag || {};
        save.tms = save.tms || {};
        for (const item of ['mint', 'cap', 'caph']) save.bag[item] = 99;
      });
      alert('🎒 Mochila cheia de Ments, Cápsulas e itens especiais!');
    }
  };

  // =========================================================================
  // 2. Injetor de Botão Flutuante e Overlay na página do pokesurvivor.com
  // =========================================================================
  function injectUI() {
    if (document.getElementById('pm-online-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'pm-online-bar';
    bar.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999999;
      display: flex;
      gap: 8px;
      font-family: sans-serif;
      user-select: none;
    `;

    bar.innerHTML = `
      <div id="pm-quick-menu" style="background:rgba(15,20,40,0.92); border:2px solid #ffd000; border-radius:12px; padding:6px 12px; display:flex; align-items:center; gap:8px; box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-weight:bold; color:#ffd000; font-size:13px;">⚡ PokeMods</span>
        <button id="pm-btn-all-pokes" style="background:#ff9a00; color:#000; border:none; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">🔓 Todos Pokémons</button>
        <button id="pm-btn-all-shinies" style="background:#00d26a; color:#000; border:none; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">✨ Todos Shinies</button>
        <button id="pm-btn-money" style="background:#00b4d8; color:#000; border:none; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">💰 +Moedas/Tickets</button>
      </div>
    `;

    document.body.appendChild(bar);

    document.getElementById('pm-btn-all-pokes').onclick = () => window.PokeModsOnline.unlockAllPokemon();
    document.getElementById('pm-btn-all-shinies').onclick = () => window.PokeModsOnline.unlockAllShinies();
    document.getElementById('pm-btn-money').onclick = () => window.PokeModsOnline.addCurrencies();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
