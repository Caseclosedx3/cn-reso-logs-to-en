<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import SettingsSwitch from "./settings-switch.svelte";
  import SettingsSelect from "./settings-select.svelte";
  import SettingsSlider from "./settings-slider.svelte";
  import { SETTINGS } from "$lib/settings-store";
  import { setEventUpdateRateMs } from "$lib/api";
  import ChevronDown from "virtual:icons/lucide/chevron-down";
  import {
    liveDpsPlayerColumns,
    liveDpsSkillColumns,
    liveHealPlayerColumns,
    liveHealSkillColumns,
    liveTankedPlayerColumns,
    liveTankedSkillColumns,
  } from "$lib/column-data";

  const SETTINGS_CATEGORY = "live";

  import { onMount } from "svelte";
  let _mounted = false;
  onMount(() => {
    _mounted = true;
  });

  $effect(() => {
    if (_mounted) {
      void setEventUpdateRateMs(SETTINGS.live.general.state.eventUpdateRateMs);
    }
  });

  let expandedSections = $state({
    general: false,
    dpsPlayers: false,
    dpsSkills: false,
    healPlayers: false,
    healSkills: false,
    tankedPlayers: false,
    tankedSkills: false,
  });

  function toggleSection(section: keyof typeof expandedSections) {
    expandedSections[section] = !expandedSections[section];
  }
</script>

<Tabs.Content value={SETTINGS_CATEGORY}>
  <div class="space-y-3">
    <!-- General Settings -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onclick={() => toggleSection("general")}
      >
        <h2 class="text-base font-semibold text-foreground">General Settings</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.general ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.general}
        <div class="px-4 pb-3 space-y-1">
          <SettingsSelect
            bind:selected={SETTINGS.live.general.state.showYourName}
            values={[
              { label: "Show Your Name", value: "Show Your Name" },
              { label: "Show Your Class", value: "Show Your Class" },
              { label: "Show Your Name - Class", value: "Show Your Name - Class" },
              { label: "Show Your Name - Spec", value: "Show Your Name - Spec" },
              { label: "Hide Your Name", value: "Hide Your Name" },
            ]}
            label="Display Your Name"
            description="&quot;Show Your Class&quot; replaces your name with your class; &quot;Name - Class/Spec&quot; shows both."
          />
          <SettingsSelect
            bind:selected={SETTINGS.live.general.state.showOthersName}
            values={[
              { label: "Show Others' Name", value: "Show Others' Name" },
              { label: "Show Others' Class", value: "Show Others' Class" },
              { label: "Show Others' Name - Class", value: "Show Others' Name - Class" },
              { label: "Show Others' Name - Spec", value: "Show Others' Name - Spec" },
              { label: "Hide Others' Name", value: "Hide Others' Name" },
            ]}
            label="Display Others' Name"
            description="&quot;Show Others' Class&quot; replaces their name with their class; &quot;Name - Class/Spec&quot; shows both."
          />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.showYourAbilityScore} label="Your Ability Score" description="Show your ability score" />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.showOthersAbilityScore} label="Others' Ability Score" description="Show others' ability score" />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.showYourSeasonStrength} label="Your Season Strength" description="Show your season strength" />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.showOthersSeasonStrength} label="Others' Season Strength" description="Show others' season strength" />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopDPSPlayer} label="Relative to Top DPS (Player)" description="Scale colour bars relative to the top DPS player instead of all players. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopDPSSkill} label="Relative to Top DPS (Skill)" description="Scale colour bars relative to the top DPS skill instead of all skills. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopHealPlayer} label="Relative to Top Heal (Player)" description="Scale colour bars relative to the top healer instead of all players. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopHealSkill} label="Relative to Top Heal (Skill)" description="Scale colour bars relative to the top heal skill instead of all skills. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopTankedPlayer} label="Relative to Top Tanked (Player)" description="Scale colour bars relative to the top tanked player instead of all players. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.relativeToTopTankedSkill} label="Relative to Top Tanked (Skill)" description="Scale colour bars relative to the top tanked skill instead of all skills. Useful for 20-player or world bosses." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.shortenTps} label="Shorten TPS Values" description="Display TPS as 5k, 50k, etc." />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.shortenAbilityScore} label="Shorten Ability Score" description="Display ability score in abbreviated form" />
          <SettingsSwitch bind:checked={SETTINGS.live.general.state.shortenDps} label="Shorten DPS Values" description="Display DPS as 5k, 50k, etc." />
          <SettingsSlider
            bind:value={SETTINGS.live.general.state.eventUpdateRateMs}
            label="Refresh Rate"
            description="Live stats refresh interval (50–2000 ms). Lower is smoother but uses more CPU."
            min={50}
            max={2000}
            step={50}
            unit="ms"
          />
        </div>
      {/if}
    </div>

    <!-- DPS - Player Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("dpsPlayers")}>
        <h2 class="text-base font-semibold text-foreground">DPS (Player) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.dpsPlayers ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.dpsPlayers}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.dpsPlayers.state.order as colKey, idx (colKey)}
            {@const col = liveDpsPlayerColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.dpsPlayers.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.dpsPlayers.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.dpsPlayers.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.dpsPlayers.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.dpsPlayers.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.dps.players.state[col.key as keyof typeof SETTINGS.live.dps.players.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- DPS - Skill Breakdown Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("dpsSkills")}>
        <h2 class="text-base font-semibold text-foreground">DPS (Skill Breakdown) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.dpsSkills ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.dpsSkills}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.dpsSkills.state.order as colKey, idx (colKey)}
            {@const col = liveDpsSkillColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.dpsSkills.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.dpsSkills.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.dpsSkills.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.dpsSkills.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.dpsSkills.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.dps.skillBreakdown.state[col.key as keyof typeof SETTINGS.live.dps.skillBreakdown.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- Heal - Player Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("healPlayers")}>
        <h2 class="text-base font-semibold text-foreground">Heal (Player) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.healPlayers ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.healPlayers}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.healPlayers.state.order as colKey, idx (colKey)}
            {@const col = liveHealPlayerColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.healPlayers.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.healPlayers.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.healPlayers.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.healPlayers.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.healPlayers.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.heal.players.state[col.key as keyof typeof SETTINGS.live.heal.players.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- Heal - Skill Breakdown Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("healSkills")}>
        <h2 class="text-base font-semibold text-foreground">Heal (Skill Breakdown) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.healSkills ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.healSkills}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.healSkills.state.order as colKey, idx (colKey)}
            {@const col = liveHealSkillColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.healSkills.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.healSkills.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.healSkills.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.healSkills.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.healSkills.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.heal.skillBreakdown.state[col.key as keyof typeof SETTINGS.live.heal.skillBreakdown.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- Tanked - Player Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("tankedPlayers")}>
        <h2 class="text-base font-semibold text-foreground">Tanked (Player) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.tankedPlayers ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.tankedPlayers}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.tankedPlayers.state.order as colKey, idx (colKey)}
            {@const col = liveTankedPlayerColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.tankedPlayers.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.tankedPlayers.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.tankedPlayers.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.tankedPlayers.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.tankedPlayers.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.tanked.players.state[col.key as keyof typeof SETTINGS.live.tanked.players.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- Tanked - Skill Breakdown Columns -->
    <div class="rounded-lg border bg-card/40 border-border/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" onclick={() => toggleSection("tankedSkills")}>
        <h2 class="text-base font-semibold text-foreground">Tanked (Skill Breakdown) Columns</h2>
        <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200 {expandedSections.tankedSkills ? 'rotate-180' : ''}" />
      </button>
      {#if expandedSections.tankedSkills}
        <div class="px-4 pb-3 space-y-1">
          <p class="text-xs text-muted-foreground mb-2">Use arrows to reorder; use the toggle to show/hide.</p>
          {#each SETTINGS.live.columnOrder.tankedSkills.state.order as colKey, idx (colKey)}
            {@const col = liveTankedSkillColumns.find((c) => c.key === colKey)}
            {#if col}
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-muted/20 border border-border/30">
                <div class="flex flex-col">
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === 0} onclick={() => { const arr = [...SETTINGS.live.columnOrder.tankedSkills.state.order]; const prev = arr[idx - 1]; const curr = arr[idx]; if (prev !== undefined && curr !== undefined) { arr.splice(idx - 1, 2, curr, prev); SETTINGS.live.columnOrder.tankedSkills.state.order = arr; } }}>▲</button>
                  <button type="button" class="text-xs px-1 hover:bg-muted/50 rounded disabled:opacity-30" disabled={idx === SETTINGS.live.columnOrder.tankedSkills.state.order.length - 1} onclick={() => { const arr = [...SETTINGS.live.columnOrder.tankedSkills.state.order]; const curr = arr[idx]; const next = arr[idx + 1]; if (curr !== undefined && next !== undefined) { arr.splice(idx, 2, next, curr); SETTINGS.live.columnOrder.tankedSkills.state.order = arr; } }}>▼</button>
                </div>
                <SettingsSwitch bind:checked={SETTINGS.live.tanked.skills.state[col.key as keyof typeof SETTINGS.live.tanked.skills.state]} label={col.label} description={col.description} />
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Tabs.Content>
