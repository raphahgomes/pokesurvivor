/**
 * ============================================================================
 * mods/custom-mods.js — Seus Mods Customizados para o PokéSurvivor!
 * ============================================================================
 * Aqui é onde VOCÊ cria e programa seus próprios mods para testar no jogo!
 *
 * Como funciona:
 * Você usa a função `PokeMods.registerMod(...)` para registrar seu mod.
 * Ele aparecerá automaticamente no Menu de Mods (F1) na aba "Mods Criados".
 *
 * Hooks disponíveis nos mods:
 *   - onInit(PokeMods): Chamado assim que o jogo carrega
 *   - onGameStart(player): Chamado quando uma nova partida (run) inicia
 *   - onUpdate(player, dt): Chamado em CADA frame durante a partida (dt = delta de tempo)
 *   - onPlayerHurt(player, amount, type): Chamado quando o jogador é atingido (retorne false para anular dano)
 *
 * Abaixo já deixamos alguns mods de exemplo prontos e funcionais para você testar ou modificar!
 */

// ============================================================================
// EXEMPLO 1: Mod "Vampirismo Pokémon" (Drenar vida ao acertar inimigos)
// ============================================================================
PokeMods.registerMod({
  id: 'mod_vampirismo',
  name: 'Vampirismo Pokémon',
  author: 'Você',
  version: '1.0',
  description: 'Cura automaticamente 5% da vida máxima sempre que você derrotar inimigos!',
  onInit: () => {
    console.log('[Mod] Vampirismo Pokémon inicializado!');
  },
  onUpdate: (player, dt) => {
    // Guarda a quantidade de abates anterior
    if (player._lastKills == null) player._lastKills = player.kills;
    if (player.kills > player._lastKills) {
      const diff = player.kills - player._lastKills;
      player._lastKills = player.kills;

      // Cura o jogador
      const healAmt = player.maxHp * 0.05 * diff;
      player.hp = Math.min(player.maxHp, player.hp + healAmt);

      if (window.G && G.FX) {
        G.FX.dmgText(player.x, player.y - player.bodyH - 10, '+' + Math.round(healAmt) + ' HP (Vampirismo)', '#5fe08a');
      }
    }
  }
});

// ============================================================================
// EXEMPLO 2: Mod "Aura Elemental de Fogo" (Dano em área ao redor do Pokémon)
// ============================================================================
PokeMods.registerMod({
  id: 'mod_aura_fogo',
  name: 'Aura Elemental Flamejante',
  author: 'Você',
  version: '1.0',
  description: 'Queima e repele inimigos que chegarem muito perto do seu Pokémon.',
  onUpdate: (player, dt) => {
    if (!window.G || !G.EnemyMgr || player.dead) return;

    player._auraTick = (player._auraTick || 0) + dt;
    if (player._auraTick >= 0.5) {
      player._auraTick = 0;

      // Encontra inimigos a menos de 90 pixels de distância
      const nearby = G.EnemyMgr.queryCircle(player.x, player.y, 90);
      for (const enemy of nearby) {
        if (!enemy.dead && !enemy.judge) {
          enemy.hurt(25 + player.level * 5, '#ff6a00', enemy.x - player.x, enemy.y - player.y, 100);
          if (G.FX) G.FX.burst(enemy.x, enemy.y - 10, '#ff9a00', 4, 80);
        }
      }

      // Efeito visual sutil ao redor dos pés do jogador
      if (nearby.length > 0 && G.FX) {
        G.FX.ring(player.x, player.y, 4, 90, '#ff7a00', 0.25, 2);
      }
    }
  }
});

// ============================================================================
// EXEMPLO 3: Mod "Escudo de Sobrevivência" (Anula o primeiro dano recebido)
// ============================================================================
PokeMods.registerMod({
  id: 'mod_escudo_divino',
  name: 'Escudo Protetor',
  author: 'Você',
  version: '1.0',
  description: 'Um escudo que absorve 1 golpe a cada 15 segundos.',
  onGameStart: (player) => {
    player._shieldReady = true;
    player._shieldTimer = 0;
  },
  onUpdate: (player, dt) => {
    if (!player._shieldReady) {
      player._shieldTimer = (player._shieldTimer || 0) + dt;
      if (player._shieldTimer >= 15) {
        player._shieldReady = true;
        player._shieldTimer = 0;
        if (window.G && G.FX) {
          G.FX.dmgText(player.x, player.y - player.bodyH - 8, '🛡️ Escudo Recarregado!', '#7fe0ff');
          G.FX.ring(player.x, player.y, 6, 60, '#7fe0ff', 0.4, 3);
        }
      }
    }
  },
  onPlayerHurt: (player, amount, type) => {
    if (player._shieldReady) {
      player._shieldReady = false;
      player._shieldTimer = 0;
      if (window.G && G.FX) {
        G.FX.dmgText(player.x, player.y - player.bodyH - 8, '🛡️ DANO BLOQUEADO!', '#7fe0ff', true);
        G.FX.burst(player.x, player.y - player.bodyH * 0.5, '#7fe0ff', 12, 120);
      }
      return false; // Cancela o dano completamente!
    }
    return amount;
  }
});

// ============================================================================
// ESPAÇO PARA O SEU PRÓPRIO MOD:
// Descomente e personalize como quiser!
// ============================================================================
/*
PokeMods.registerMod({
  id: 'meu_mod_personalizado',
  name: 'Meu Mod Incrível',
  author: 'Seu Nome',
  version: '1.0',
  description: 'Descreva aqui o que seu mod faz.',
  onGameStart: (player) => {
    // Código executado ao iniciar a run
  },
  onUpdate: (player, dt) => {
    // Código executado a cada frame
  }
});
*/
