# 🎮 Guia do PokéSurvivor: Mods e Execução

Você tem **duas formas** de usar os mods:

---

## 🌐 Opção 1: Usar Direto no Site Oficial (`https://pokesurvivor.com/`)

Se você quer entrar no site oficial e liberar tudo diretamente na sua conta, criamos duas opções prontas:

### Método A: Extensão para o Navegador (Chrome, Brave, Edge, Opera)
1. Abra o navegador e acesse a página de extensões: `chrome://extensions` (ou `edge://extensions`).
2. No canto superior direito, ative a chave **"Modo do desenvolvedor"**.
3. Clique no botão **"Carregar sem compactação"** (Load unpacked).
4. Selecione a pasta:
   ```
   C:\Users\raphr\.gemini\antigravity-ide\scratch\pokesurvivor\chrome-extension
   ```
5. Agora entre em **[https://pokesurvivor.com/](https://pokesurvivor.com/)**!
6. Uma barra dourada **`⚡ MODS`** aparecerá no topo direito da tela com botões para:
   - 🔓 **Todos Pokémons**: Libera os 966 Pokémons na sua conta.
   - ✨ **Todos Shinies**: Libera as versões Shiny de todos eles.
   - 💰 **+Moedas/Tickets**: Adiciona 500.000 moedas e centenas de tickets de Gacha.
   - 🎒 **Itens & MTs**: Enche sua mochila com Ments, Cápsulas e MTs.

---

### Método B: Script Tampermonkey / Violentmonkey
Se você já usa Tampermonkey:
1. Abra o Tampermonkey e crie um novo script.
2. Copie e cole o conteúdo do arquivo:
   `pokesurvivor-mods.user.js`
3. Salve. Ao acessar `https://pokesurvivor.com/`, os mods serão injetados automaticamente!

---

## 💻 Opção 2: Jogar a Cópia Offline Modificada (Sem precisar de internet)

Você já tem o jogo completo baixado no seu computador com **todos os 966 sprites, sons sintetizados e código fonte**.

Para jogar a versão offline modificada sem digitar comandos no terminal:

1. Vá até a pasta:
   ```
   C:\Users\raphr\.gemini\antigravity-ide\scratch\pokesurvivor
   ```
2. Dê **dois cliques** no arquivo:
   **`jogar_offline.bat`**
3. O jogo abrirá automaticamente no seu navegador padrão.
4. Clique no botão flutuante **`⚡ MODS`** no canto superior direito (ou pressione **`F1`** ou a tecla **`M`** no teclado).

---

## 🛠️ O que você pode fazer no Menu de Mods Completo (`F1`):

- **🌟 Pokémons & Shinies**:
  - Desbloquear todos os 966 Pokémons instantaneamente.
  - Desbloquear todas as variantes Shiny.
  - Escolher qualquer Pokémon como parceiro inicial pelo número da Pokédex.
- **❤️ Vida & Sobrevivência**:
  - **Modo Deus (Invulnerabilidade Total)**: nunca morre nem toma dano.
  - **Vida Máxima Personalizada**: regule a vida de 100 até 1.000.000 de HP.
  - **Regeneração por Segundo**: recupere até 500 HP/s continuamente.
  - **Curar 100% Agora**: botão para restaurar vida imediatamente.
- **⚔️ Combate & Poder**:
  - Multiplicador de dano (2x, 5x, 10x, 50x ou One-Hit KO).
  - Ataque Rápido / Sem Cooldown (estilo metralhadora).
  - Velocidade de movimento (1.5x, 2x, 3x).
  - Super Ímã de Coleta (atrai itens de toda a tela ou do mapa todo).
  - 100% de Acertos Críticos.
- **💎 Economia & Gacha**:
  - +100.000 Moedas e centenas de tickets de Gacha.
  - Todas as MTs e itens da loja de Kecleon.
  - Maximizar todas as melhorias do parceiro atual.
- **🎮 Partida & Ondas**:
  - Subir de nível instantaneamente (+1 ou +10 níveis).
  - Limpar todos os inimigos da tela (Nuke).
  - Puxar todos os drops do mapa.
  - Rerolls infinitos na escolha de poderes.

---

## 🧩 Como Criar Seus Próprios Mods em Código

Para criar mods adicionais, abra o arquivo:
**`mods/custom-mods.js`**

Nele você pode adicionar código como:

```javascript
PokeMods.registerMod({
  id: 'meu_mod',
  name: 'Super Velocidade',
  description: 'Corre 3x mais rápido',
  onGameStart: (player) => {
    player.baseSpd *= 3;
  },
  onUpdate: (player, dt) => {
    // Roda em cada frame da partida
  }
});
```
Os mods registrados em `mods/custom-mods.js` aparecem automaticamente na aba **"Mods Criados"** do menu `F1`!
