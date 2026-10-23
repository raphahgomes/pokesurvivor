/**
 * PokéSurvivor Mod Menu - Content Script para Google Chrome
 */
(function() {
  function modifySave(fn) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ps.save.')) {
        try {
          const save = JSON.parse(localStorage.getItem(key));
          if (save) {
            fn(save);
            localStorage.setItem(key, JSON.stringify(save));
          }
        } catch (e) {
          console.error('[PokeMods Extension] Erro:', e);
        }
      }
    }
  }

  function injectBar() {
    if (document.getElementById('pm-ext-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'pm-ext-bar';
    bar.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 99999999;
      display: flex;
      gap: 8px;
      font-family: 'Segoe UI', sans-serif;
      user-select: none;
    `;

    bar.innerHTML = `
      <div style="background:rgba(12, 16, 34, 0.95); border:2px solid #ffd000; border-radius:14px; padding:6px 14px; display:flex; align-items:center; gap:8px; box-shadow:0 4px 20px rgba(0,0,0,0.6);">
        <span style="font-weight:800; color:#ffd000; font-size:13px; display:flex; align-items:center; gap:4px;">⚡ MODS:</span>
        <button id="pm-ext-pokes" style="background:#ff9a00; color:#121626; border:none; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">🔓 Todos Pokémons</button>
        <button id="pm-ext-shinies" style="background:#00d26a; color:#121626; border:none; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">✨ Todos Shinies</button>
        <button id="pm-ext-money" style="background:#00b4d8; color:#121626; border:none; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">💰 +Moedas/Tickets</button>
        <button id="pm-ext-bag" style="background:#c47bff; color:#121626; border:none; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">🎒 Itens & MTs</button>
      </div>
    `;

    document.body.appendChild(bar);

    document.getElementById('pm-ext-pokes').onclick = () => {
      modifySave(save => {
        save.owned = save.owned || {};
        for (let dex = 1; dex <= 1025; dex++) {
          if (!save.owned[dex]) save.owned[dex] = { at: Date.now(), from: 'mod' };
        }
      });
      alert('🌟 Todos os Pokémons foram liberados! Recarregue a página (F5) para ver na sua Pokédex.');
    };

    document.getElementById('pm-ext-shinies').onclick = () => {
      modifySave(save => {
        save.owned = save.owned || {};
        save.shiny = save.shiny || {};
        for (let dex = 1; dex <= 1025; dex++) {
          save.owned[dex] = save.owned[dex] || { at: Date.now(), from: 'mod' };
          save.shiny[dex] = { at: Date.now(), from: 'mod' };
        }
      });
      alert('✨ Todas as versões Shiny foram liberadas! Recarregue a página (F5).');
    };

    document.getElementById('pm-ext-money').onclick = () => {
      modifySave(save => {
        save.coins = (save.coins || 0) + 500000;
        save.tickets = save.tickets || { t1: 0, t10: 0 };
        save.tickets.t1 = (save.tickets.t1 || 0) + 200;
        save.tickets.t10 = (save.tickets.t10 || 0) + 100;
      });
      alert('💰 +500.000 Moedas e +300 Tickets adicionados! Recarregue para atualizar.');
    };

    document.getElementById('pm-ext-bag').onclick = () => {
      modifySave(save => {
        save.bag = save.bag || {};
        save.tms = save.tms || {};
        for (const item of ['mint', 'cap', 'caph']) save.bag[item] = 99;
      });
      alert('🎒 Itens especiais e MTs adicionados à mochila! Recarregue para ver.');
    };
  }

  setTimeout(injectBar, 1500);
})();
