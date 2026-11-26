
import './style.css'

const app = document.querySelector('#app')
const STORAGE_KEY = 'titan-pilots-v1'

let currentPage = 'dashboard'
let selectedPilotId = null

function loadPilots() {
  try {
    const savedPilots = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    return savedPilots.map(pilot => ({
      ...pilot,
      mechId: pilot.mechId ?? null
    }))
  } catch {
    return []
  }
}

let pilots = loadPilots()

// INDIVIDUAL MECH COMBAT STATES
const MECH_STATES_KEY = 'titan-mech-states-v1'
const LEGACY_ASHURA_KEY = 'titan-ashura-state-v1'

function loadMechStates() {
  let states = {}

  try {
    const saved = JSON.parse(localStorage.getItem(MECH_STATES_KEY))

    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      states = saved
    }
  } catch {
    states = {}
  }

  // Preserve Ashura's existing combat meter values.
  try {
    const oldAshuraState = JSON.parse(
      localStorage.getItem(LEGACY_ASHURA_KEY)
    )

    if (oldAshuraState && !states['ashura-a-z108']) {
      states['ashura-a-z108'] = oldAshuraState
    }
  } catch {
    // Start with default values if the old data cannot be read.
  }

  return states
}

let mechStates = loadMechStates()

function getMechState(mech) {
  if (!mechStates[mech.id]) {
    mechStates[mech.id] = {
      hullCriticals: 0,
      power: 0,
      heat: 0
    }
  }

  const state = mechStates[mech.id]

  state.hullCriticals = Math.max(
    0,
    Math.min(mech.hullCapacity, Number(state.hullCriticals) || 0)
  )

  state.power = Math.max(
    0,
    Math.min(mech.powerCapacity, Number(state.power) || 0)
  )

  state.heat = Math.max(
    0,
    Math.min(mech.heatCapacity, Number(state.heat) || 0)
  )

  return state
}

function saveMechStates() {
  localStorage.setItem(MECH_STATES_KEY, JSON.stringify(mechStates))
}

const modules = {
  dashboard: {
    title: 'Command Overview',
    category: 'COMMAND CENTER'
  },
  pilotCreator: {
    title: 'Pilot Creator',
    category: 'PERSONNEL MANAGEMENT'
  },
  pilotRecords: {
    title: 'Pilot Records',
    category: 'PERSONNEL DATABASE'
  },
  pilotSheet: {
    title: 'Pilot Sheet',
    category: 'PILOT RECORD'
  },
  mechBuilder: {
    title: 'Mech Builder',
    category: 'ENGINEERING DIVISION'
  },
  mechSheet: {
    title: 'Mech Database',
    category: 'MECH OPERATIONS'
  },
  mechLiveSheet: {
    title: 'Live Mech Sheet',
    category: 'MECH OPERATIONS'
  },
  mechCreator: {
    title: 'Mech Registration',
    category: 'ENGINEERING DIVISION'
  }
  }

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char])
}

function savePilots() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pilots))
}

function dashboardContent() {
  return `
    <div class="welcome-block">
      <div class="eyebrow">SYSTEM OVERVIEW / 001</div>
      <h1>Welcome, Commander.</h1>
      <p>Manage your pilots, configure your mechs, and prepare for deployment.</p>
    </div>

    <div class="section-header">
      <div>
        <div class="eyebrow">OPERATIONS</div>
        <h2>Command Modules</h2>
      </div>
      <span class="section-note">SELECT A MODULE</span>
    </div>

    <div class="module-grid">
      <button class="module-card" data-page="pilotCreator">
        <div class="module-top">
          <span class="module-index">01</span>
          <span class="module-symbol">♙</span>
        </div>
        <h3>Pilot Creator</h3>
        <p>Register pilots, allocate attributes, and select operational roles.</p>
        <span class="module-action">ACCESS MODULE →</span>
      </button>

      <button class="module-card" data-page="mechBuilder">
        <div class="module-top">
          <span class="module-index">02</span>
          <span class="module-symbol">⬡</span>
        </div>
        <h3>Mech Builder</h3>
        <p>Configure mech specifications, weapons, and components.</p>
        <span class="module-action">ACCESS MODULE →</span>
      </button>

      <button class="module-card" data-page="pilotRecords">
        <div class="module-top">
          <span class="module-index">03</span>
          <span class="module-symbol">▤</span>
        </div>
        <h3>Pilot Records</h3>
        <p>Browse your registered pilots and their information.</p>
        <span class="module-action">ACCESS MODULE →</span>
      </button>

      <button class="module-card" data-page="mechSheet">
        <div class="module-top">
          <span class="module-index">04</span>
          <span class="module-symbol">▦</span>
        </div>
        <h3>Mech Database</h3>
        <p>Inspect mech statistics, systems, and equipment.</p>
        <span class="module-action">ACCESS MODULE →</span>
      </button>
    </div>

    <div class="system-panel">
      <div class="system-panel-heading">
        <span class="status-indicator"></span>
        SYSTEM INFORMATION
      </div>
      <p>${pilots.length} pilot record(s) registered. All command modules standing by.</p>
    </div>
  `
}

function pilotCreatorContent() {
  return `
    <div class="welcome-block">
      <div class="eyebrow">PERSONNEL MANAGEMENT / 001</div>
      <h1>Pilot Registration</h1>
      <p>Enter identification, attributes, and operational role.</p>
    </div>

    <form id="pilot-form" class="editor-panel">

      <div class="form-section">
        <div class="form-section-title">
          <span>01</span> PILOT IDENTIFICATION
        </div>

        <div class="form-grid">
          <label class="field full-width">
            <span>PILOT NAME</span>
            <input name="name" placeholder="Enter pilot name..." required maxlength="60">
          </label>

          <label class="field">
            <span>CALLSIGN</span>
            <input name="callsign" placeholder="Enter callsign..." maxlength="40">
          </label>

          <label class="field">
            <span>BACKGROUND</span>
            <input name="background" placeholder="Enter background..." maxlength="80">
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">
          <span>02</span> PILOT ATTRIBUTES
        </div>

        <p class="form-description">
          Enter the pilot's current attribute values.
          Allocation rules will be added once finalized.
        </p>

        <div class="attribute-grid">
          <label class="attribute-card">
            <span class="attribute-name">DEX</span>
            <span class="attribute-full">DEXTERITY</span>
            <input name="dex" type="number" min="0" max="99" value="0" required>
          </label>

          <label class="attribute-card">
            <span class="attribute-name">FIN</span>
            <span class="attribute-full">FINESSE</span>
            <input name="fin" type="number" min="0" max="99" value="0" required>
          </label>

          <label class="attribute-card">
            <span class="attribute-name">INT</span>
            <span class="attribute-full">INTELLIGENCE</span>
            <input name="int" type="number" min="0" max="99" value="0" required>
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">
          <span>03</span> OPERATIONAL ROLE
        </div>

        <div class="role-grid">
          <label class="role-option">
            <input type="radio" name="role" value="Jockey" required>
            <span class="role-content">
              <strong>JOCKEY</strong>
              <small>DEXTERITY BASED</small>
              <span>Dexterity-focused pilot role.</span>
            </span>
          </label>

          <label class="role-option">
            <input type="radio" name="role" value="Rigger">
            <span class="role-content">
              <strong>RIGGER</strong>
              <small>FINESSE BASED</small>
              <span>Finesse-focused pilot role.</span>
            </span>
          </label>

          <label class="role-option">
            <input type="radio" name="role" value="Operator">
            <span class="role-content">
              <strong>OPERATOR</strong>
              <small>INTELLIGENCE BASED</small>
              <span>Intelligence-focused pilot role.</span>
            </span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="back-button" data-page="dashboard">
          CANCEL
        </button>
        <button type="submit" class="primary-button">
          REGISTER PILOT →
        </button>
      </div>

    </form>
  `
}

function pilotRecordsContent() {
  if (pilots.length === 0) {
    return `
      <div class="welcome-block">
        <div class="eyebrow">PERSONNEL DATABASE / 003</div>
        <h1>Pilot Records</h1>
        <p>No pilot records have been registered yet.</p>
      </div>

      <div class="placeholder-panel">
        <div class="placeholder-symbol">♙</div>
        <h2>Database Empty</h2>
        <p>Register your first pilot to populate the personnel database.</p>
        <button class="primary-button" data-page="pilotCreator">
          CREATE FIRST PILOT →
        </button>
      </div>
    `
  }

  return `
    <div class="welcome-block">
      <div class="eyebrow">PERSONNEL DATABASE / 003</div>
      <h1>Pilot Records</h1>
      <p>${pilots.length} registered pilot(s) in the database.</p>
    </div>

    <div class="section-header">
      <h2>Registered Personnel</h2>
      <button class="primary-button" data-page="pilotCreator">+ NEW PILOT</button>
    </div>

    <div class="record-list">
      ${pilots.map(pilot => `
        <button class="record-card" data-open-pilot="${escapeHTML(pilot.id)}">
          <div>
            <div class="eyebrow">${escapeHTML(pilot.role)} / PERSONNEL</div>
            <h3>${escapeHTML(pilot.name)}</h3>
            <p>${escapeHTML(pilot.callsign || 'NO CALLSIGN')}</p>
          </div>
          <div class="record-stats">
  <span>DEX ${pilot.dex}</span>
  <span>FIN ${pilot.fin}</span>
  <span>INT ${pilot.int}</span>
  <span>${pilot.mechId ? 'MECH REGISTERED' : 'UNASSIGNED'}</span>
</div>
          <span class="module-action">VIEW RECORD →</span>
        </button>
      `).join('')}
    </div>
  `
}

function pilotSheetContent() {
  const pilot = pilots.find(item => item.id === selectedPilotId)

  if (!pilot) {
    return `
      <div class="placeholder-panel">
        <div class="eyebrow">PERSONNEL RECORD</div>
        <h2>No Pilot Selected</h2>
        <p>Choose a pilot from the personnel database.</p>
        <button class="primary-button" data-page="pilotRecords">
          VIEW PILOT RECORDS →
        </button>
      </div>
    `
  }

  return `
    <div class="welcome-block">
      <div class="eyebrow">PERSONNEL FILE / ${escapeHTML(pilot.role.toUpperCase())}</div>
      <h1>${escapeHTML(pilot.name)}</h1>
      <p>CALLSIGN: ${escapeHTML(pilot.callsign || 'UNASSIGNED')}</p>
    </div>

    <div class="sheet-info">
  <div><span>ROLE</span><strong>${escapeHTML(pilot.role)}</strong></div>
  <div><span>BACKGROUND</span><strong>${escapeHTML(pilot.background || 'Not specified')}</strong></div>
</div>

<div class="sheet-info">
  <div>
    <span>MECH REGISTRATION</span>
    <strong>${pilot.mechId ? 'REGISTERED' : 'UNASSIGNED'}</strong>
  </div>
</div>

      <div class="form-section-title">ATTRIBUTE PROFILE</div>
      <div class="attribute-grid">
        <div class="attribute-card">
          <span class="attribute-name">DEX</span>
          <span class="attribute-full">DEXTERITY</span>
          <strong>${pilot.dex}</strong>
        </div>
        <div class="attribute-card">
          <span class="attribute-name">FIN</span>
          <span class="attribute-full">FINESSE</span>
          <strong>${pilot.fin}</strong>
        </div>
        <div class="attribute-card">
          <span class="attribute-name">INT</span>
          <span class="attribute-full">INTELLIGENCE</span>
          <strong>${pilot.int}</strong>
        </div>
      </div>

      <div class="sheet-info">
        <div><span>REGISTERED</span><strong>${escapeHTML(pilot.createdAt)}</strong></div>
      </div>

      <button class="back-button" data-page="pilotRecords">
        ← RETURN TO PERSONNEL DATABASE
      </button>
    </div>
  `
}

const ASHURA_MECH_ID = 'ashura-a-z108'

// MECH DATABASE
const MECHS_STORAGE_KEY = 'titan-mechs-v1'

const DEFAULT_ASHURA = {
  id: ASHURA_MECH_ID,
  name: 'Ashura',
  model: 'A-Z108',
  weightClass: 4,
  armor: 5,
  evasion: 7,
  mobility: 7,
  powerCapacity: 10,
  hullCapacity: 4,
  heatCapacity: 6
}

function saveMechs() {
  localStorage.setItem(MECHS_STORAGE_KEY, JSON.stringify(mechs))
}

function loadMechs() {
  try {
    const saved = JSON.parse(localStorage.getItem(MECHS_STORAGE_KEY))

    if (Array.isArray(saved)) {
      // Keep Ashura available for existing pilot assignments.
      if (!saved.some(mech => mech.id === ASHURA_MECH_ID)) {
        saved.unshift({ ...DEFAULT_ASHURA })
      }

      return saved
    }
  } catch {
    // Create the initial database if saved data cannot be read.
  }

  return [{ ...DEFAULT_ASHURA }]
}

let mechs = loadMechs()
let selectedMechId = ASHURA_MECH_ID

// Save the initial database or any restored Ashura entry.
saveMechs()

function roleAttribute(pilot) {
  if (pilot.role === 'Jockey') {
    return { name: 'DEX', value: pilot.dex }
  }

  if (pilot.role === 'Rigger') {
    return { name: 'FIN', value: pilot.fin }
  }

  if (pilot.role === 'Operator') {
    return { name: 'INT', value: pilot.int }
  }

  return { name: 'ATTRIBUTE', value: '—' }
}

function ashuraMeter(name, label, value, capacity) {
  const percentage = (value / capacity) * 100

  return `
    <div class="live-meter">
      <div class="live-meter-heading">
        <span>${label}</span>
        <strong>${value} / ${capacity}</strong>
      </div>

      <div class="live-meter-track">
        <div class="live-meter-fill ${name}-fill"
             style="width: ${percentage}%"></div>
      </div>

      <div class="live-meter-controls">
        <span>CAPACITY: ${capacity}</span>
        <div>
          <button type="button" data-ashura-meter="${name}" data-delta="-1">−</button>
          <button type="button" data-ashura-meter="${name}" data-delta="1">+</button>
        </div>
      </div>
    </div>
  `
}

function mechDatabaseContent() {
  return `
    <div class="welcome-block">
      <div class="eyebrow">MECH OPERATIONS / DATABASE</div>
      <h1>Mech Database</h1>
      <p>${mechs.length} registered mech(s) in the database.</p>
    </div>

    <div class="section-header">
      <h2>Registered Mechs</h2>
      <button class="primary-button" data-page="mechCreator">
        + REGISTER MECH
      </button>
    </div>

    <div class="record-list">
      ${mechs.map(mech => `
        <button class="record-card" data-open-mech="${escapeHTML(mech.id)}">
          <div>
            <div class="eyebrow">
              ${escapeHTML(mech.model)} / MECH RECORD
            </div>
            <h3>${escapeHTML(mech.name)}</h3>
            <p>WEIGHT CLASS ${escapeHTML(mech.weightClass)}</p>
          </div>

          <div class="record-stats">
            <span>ARMOR ${escapeHTML(mech.armor)}</span>
            <span>EVASION ${escapeHTML(mech.evasion)}</span>
            <span>POWER ${escapeHTML(mech.powerCapacity)}</span>
          </div>

          <span class="module-action">VIEW MECH SHEET →</span>
        </button>
      `).join('')}
    </div>
  `
}

function mechCreatorContent() {
  return `
    <div class="welcome-block">
      <div class="eyebrow">ENGINEERING DIVISION / REGISTRATION</div>
      <h1>Register New Mech</h1>
      <p>Create a new mech record for your database.</p>
    </div>

    <form id="mech-form" class="editor-panel">

      <div class="form-section">
        <div class="form-section-title">
          <span>01</span> MECH IDENTIFICATION
        </div>

        <div class="form-grid">
          <label class="field">
            <span>MECH NAME</span>
            <input name="name" placeholder="Enter mech name..." required maxlength="60">
          </label>

          <label class="field">
            <span>MODEL DESIGNATION</span>
            <input name="model" placeholder="e.g. A-Z108" required maxlength="30">
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">
          <span>02</span> MECH SPECIFICATIONS
        </div>

        <p class="form-description">
          Enter the specifications for this mech.
        </p>

        <div class="form-grid">
          <label class="field">
            <span>WEIGHT CLASS</span>
            <input name="weightClass" type="number" min="1" max="5" value="1" required>
          </label>

          <label class="field">
            <span>ARMOR</span>
            <input name="armor" type="number" min="0" value="0" required>
          </label>

          <label class="field">
            <span>EVASION</span>
            <input name="evasion" type="number" min="0" value="0" required>
          </label>

          <label class="field">
            <span>MOBILITY</span>
            <input name="mobility" type="number" min="0" value="0" required>
          </label>

          <label class="field">
            <span>POWER CAPACITY</span>
            <input name="powerCapacity" type="number" min="1" value="10" required>
          </label>

          <label class="field">
            <span>HULL CRITICAL CAPACITY</span>
            <input name="hullCapacity" type="number" min="1" value="4" required>
          </label>

          <label class="field">
            <span>HEAT CAPACITY</span>
            <input name="heatCapacity" type="number" min="1" value="6" required>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="back-button" data-page="mechSheet">
          CANCEL
        </button>
        <button type="submit" class="primary-button">
          REGISTER MECH →
        </button>
      </div>

    </form>
  `
}

function mechSheetContent() {
  const mech = mechs.find(item => item.id === selectedMechId)

  if (!mech) {
    return `
      <div class="placeholder-panel">
        <h2>Mech Not Found</h2>
        <p>This mech record could not be located.</p>
        <button class="back-button" data-page="mechSheet">
          ← RETURN TO MECH DATABASE
        </button>
      </div>
    `
  }
  const combatState = getMechState(mech)
  const assignedPilots = pilots.filter(
    pilot => pilot.mechId === mech.id
  )

  const availablePilots = pilots.filter(
    pilot => !pilot.mechId
  )

  return `
  <div class="welcome-block">
  <div class="eyebrow">
    MECH OPERATIONS / ${escapeHTML(mech.model)}
  </div>
  <h1>${escapeHTML(mech.name)}</h1>
  <p>Weight Class ${escapeHTML(mech.weightClass)}</p>
</div>
<div class="editor-panel mech-edit-panel">
  <div class="form-section-title">MECH IDENTIFICATION</div>

  <form id="edit-mech-form">
    <div class="form-grid">
      <label class="field full-width">
        <span>MECH NAME</span>
        <input
          type="text"
          name="name"
          value="${escapeHTML(mech.name)}"
          maxlength="60"
          required
        >
      </label>
    </div>

    <div class="form-actions">
      <button type="submit" class="primary-button">
        SAVE MECH NAME →
      </button>
    </div>
  </form>
</div>
    <div class="sheet-panel">

      <div class="form-section-title">MECH SPECIFICATIONS</div>

      <div class="mech-stat-grid">
  <div class="mech-stat">
    <strong>${mech.weightClass}</strong>
    <span>WEIGHT CLASS</span>
  </div>
  <div class="mech-stat">
    <strong>${mech.armor}</strong>
    <span>ARMOR</span>
  </div>
  <div class="mech-stat">
    <strong>${mech.evasion}</strong>
    <span>EVASION</span>
  </div>
  <div class="mech-stat">
    <strong>${mech.powerCapacity}</strong>
    <span>POWER CAPACITY</span>
  </div>
</div>

      <div class="form-section-title">LIVE COMBAT METERS</div>

      ${ashuraMeter('hullCriticals', 'HULL CRITICALS', combatState.hullCriticals, mech.hullCapacity)}
${ashuraMeter('power', 'REACTOR POWER', combatState.power, mech.powerCapacity)}
${ashuraMeter('heat', 'HEAT', combatState.heat, mech.heatCapacity)}

      <div class="form-section-title">REGISTERED CREW</div>

      <p class="form-description">
        Assigned pilots and their role-specific attributes.
      </p>

      <div class="crew-list">
        ${assignedPilots.length
          ? assignedPilots.map(pilot => {
              const attribute = roleAttribute(pilot)

              return `
                <div class="crew-card">
                  <div>
                    <strong>${escapeHTML(pilot.name)}</strong>
                    <span>${escapeHTML(pilot.role)}</span>
                  </div>
                  <div class="crew-attribute">
                    <strong>${attribute.name} ${attribute.value}</strong>
                    <button type="button"
                      class="back-button"
                      data-unassign-pilot="${escapeHTML(pilot.id)}">
                      UNASSIGN
                    </button>
                  </div>
                </div>
              `
            }).join('')
          : '<p class="form-description">No pilots currently assigned to ${escapeHTML(mech.name)}..</p>'
        }
      </div>

      <div class="form-section-title">AVAILABLE PILOTS</div>

      ${availablePilots.length
        ? availablePilots.map(pilot => `
            <div class="crew-card">
              <div>
                <strong>${escapeHTML(pilot.name)}</strong>
                <span>${escapeHTML(pilot.role)}</span>
              </div>
              <button type="button"
                class="primary-button"
                data-assign-pilot="${escapeHTML(pilot.id)}">
                ASSIGN TO ${escapeHTML(mech.name).toUpperCase()}
              </button>
            </div>
          `).join('')
        : '<p class="form-description">No unassigned pilots available.</p>'
      }

      <div class="form-section-title">WEAPON SYSTEMS</div>

      <div class="weapon-card">
        <div class="weapon-heading">
          <strong>CHAIN SWORD</strong>
          <span>LEFT ARM · MELEE</span>
        </div>
        <div class="weapon-stats">
          <span>4 DAMAGE</span>
          <span>1 POWER COST</span>
        </div>
      </div>

      <div class="weapon-card">
        <div class="weapon-heading">
          <strong>MANTIS BLADES</strong>
          <span>THIRD & FOURTH ARMS · MELEE</span>
        </div>
        <div class="weapon-stats">
          <span>DAMAGE: TBD</span>
          <span>1 POWER COST</span>
        </div>
      </div>

      <div class="weapon-card">
        <div class="weapon-heading">
          <strong>ARM CANNON</strong>
          <span>RIGHT ARM · MAIN WEAPON</span>
        </div>

        <div class="weapon-mode">
          <strong>CLUSTER INCENDIARIES</strong>
          <span>7 DAMAGE · 2 POWER COST</span>
          <small>Reload: 1 round</small>
        </div>

        <div class="weapon-mode">
          <strong>CRYOGENIC</strong>
          <span>3 DAMAGE · 3 POWER COST</span>
          <small>Freeze: reduces target Critical Threshold Value · Recharge: 3 rounds</small>
        </div>

        <div class="weapon-mode">
          <strong>FLAMETHROWER</strong>
          <span>5 DAMAGE · POWER COST: ACCUMULATED HEAT</span>
          <small>Bleed: damage over time equal to Rigger FIN · No recharge</small>
        </div>
      </div>

      <div class="weapon-card">
        <div class="weapon-heading">
          <strong>RAILGUN</strong>
          <span>WEAPON SYSTEM</span>
        </div>
        <div class="weapon-stats">
          <span>6 DAMAGE</span>
          <span>2 POWER COST</span>
        </div>
        <small>Usable for 3 rounds, then reload for 1 round.</small>
      </div>

    </div>
  `
}

function placeholderContent(page) {
  const module = modules[page]

  return `
    <div class="placeholder-panel">
      <div class="placeholder-symbol">⬡</div>
      <div class="eyebrow">${module.category}</div>
      <h2>${module.title}</h2>
      <p>This module is scheduled for a future development stage.</p>
      <div class="development-tag">INTERFACE UNDER DEVELOPMENT</div>
      <button class="back-button" data-page="dashboard">
        ← RETURN TO COMMAND CENTER
      </button>
    </div>
  `
}

function render() {
  const module = modules[currentPage]

  app.innerHTML = `
    <div class="app-shell">

      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">T</div>
          <div class="brand-text">
            <strong>TITAN SYSTEMS</strong>
            <span>MECH OPERATIONS DIVISION</span>
          </div>
        </div>

        <div class="sidebar-divider"></div>
        <div class="nav-label">MAIN OPERATIONS</div>

        <nav class="navigation">
          <button class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
            <span class="nav-icon">⌂</span><span>Command Center</span>
          </button>
          <button class="nav-item ${currentPage === 'pilotCreator' ? 'active' : ''}" data-page="pilotCreator">
            <span class="nav-icon">♙</span><span>Pilot Creator</span>
          </button>
          <button class="nav-item ${currentPage === 'mechBuilder' ? 'active' : ''}" data-page="mechBuilder">
            <span class="nav-icon">⬡</span><span>Mech Builder</span>
          </button>
        </nav>

        <div class="nav-label records-label">DATABASE</div>

        <nav class="navigation">
          <button class="nav-item ${currentPage === 'pilotRecords' || currentPage === 'pilotSheet' ? 'active' : ''}" data-page="pilotRecords">
            <span class="nav-icon">▤</span><span>Pilot Records</span>
          </button>
          <button class="nav-item ${currentPage === 'mechSheet' ? 'active' : ''}" data-page="mechSheet">
            <span class="nav-icon">▦</span><span>Mech Database</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <div class="sidebar-divider"></div>
          <span class="small-label">PLATFORM STATUS</span>
          <div class="platform-status">
            <span class="status-indicator"></span>
            All systems operational
          </div>
          <span class="version">TITAN OS / VERSION 0.2</span>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div class="breadcrumb">
            <span>OPERATIONS</span>
            <span class="breadcrumb-divider">/</span>
            <strong>${module.category}</strong>
          </div>
          <div class="topbar-status">
            <span class="status-indicator"></span>
            SYSTEM ONLINE
          </div>
        </header>

        <div class="page-content">
  ${currentPage === 'dashboard' ? dashboardContent()
    : currentPage === 'pilotCreator' ? pilotCreatorContent()
    : currentPage === 'pilotRecords' ? pilotRecordsContent()
    : currentPage === 'pilotSheet' ? pilotSheetContent()
    : currentPage === 'mechSheet' ? mechDatabaseContent()
    : currentPage === 'mechLiveSheet' ? mechSheetContent()
    : currentPage === 'mechCreator' ? mechCreatorContent()
    : placeholderContent(currentPage)}
</div>

        <footer class="footer">
          <span>TITAN SYSTEMS</span>
          <span>AUTHORIZED PERSONNEL ONLY</span>
        </footer>
      </main>
    </div>
  `

  app.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      currentPage = button.dataset.page
      render()
    })
  })

  app.querySelectorAll('[data-open-pilot]').forEach(button => {
    button.addEventListener('click', () => {
      selectedPilotId = button.dataset.openPilot
      currentPage = 'pilotSheet'
      render()
    })
  })
  // OPEN SELECTED MECH
app.querySelectorAll('[data-open-mech]').forEach(button => {
  button.addEventListener('click', () => {
    selectedMechId = button.dataset.openMech
    currentPage = 'mechLiveSheet'
    render()
  })
})

 // INDIVIDUAL MECH METER CONTROLS
app.querySelectorAll('[data-ashura-meter]').forEach(button => {
  button.addEventListener('click', () => {
    const mech = mechs.find(item => item.id === selectedMechId)

    if (!mech) return

    const meter = button.dataset.ashuraMeter
    const delta = Number(button.dataset.delta)
    const state = getMechState(mech)

    const limits = {
      hullCriticals: mech.hullCapacity,
      power: mech.powerCapacity,
      heat: mech.heatCapacity
    }

    state[meter] = Math.max(
      0,
      Math.min(limits[meter], state[meter] + delta)
    )

    saveMechStates()
    render()
  })
})

  // ASSIGN PILOT TO ASHURA
  app.querySelectorAll('[data-assign-pilot]').forEach(button => {
    button.addEventListener('click', () => {
      const pilot = pilots.find(
        item => item.id === button.dataset.assignPilot
      )

      if (pilot && !pilot.mechId) {
        pilot.mechId = selectedMechId
        savePilots()
        render()
      }
    })
  })

  // REMOVE PILOT FROM ASHURA
  app.querySelectorAll('[data-unassign-pilot]').forEach(button => {
    button.addEventListener('click', () => {
      const pilot = pilots.find(
        item => item.id === button.dataset.unassignPilot
      )

      if (pilot && pilot.mechId === selectedMechId) {
        pilot.mechId = null
        savePilots()
        render()
      }
    })
  })
// EDIT EXISTING MECH NAME
const editMechForm = app.querySelector('#edit-mech-form')

if (editMechForm) {
  editMechForm.addEventListener('submit', event => {
    event.preventDefault()

    const data = new FormData(editMechForm)
    const newName = data.get('name').trim()

    if (!newName) return

    const mech = mechs.find(
      item => item.id === selectedMechId
    )

    if (mech) {
      mech.name = newName
      saveMechs()
      render()
    }
  })
}
  // REGISTER NEW MECH
  const mechForm = app.querySelector('#mech-form')

  if (mechForm) {
    mechForm.addEventListener('submit', event => {
      event.preventDefault()

      const data = new FormData(mechForm)

      const mech = {
        id: 'mech-' + Date.now().toString(),
        name: data.get('name').trim(),
        model: data.get('model').trim(),
        weightClass: Number(data.get('weightClass')),
        armor: Number(data.get('armor')),
        evasion: Number(data.get('evasion')),
        mobility: Number(data.get('mobility')),
        powerCapacity: Number(data.get('powerCapacity')),
        hullCapacity: Number(data.get('hullCapacity')),
        heatCapacity: Number(data.get('heatCapacity'))
      }

      mechs.push(mech)
      saveMechs()

      selectedMechId = mech.id
      currentPage = 'mechSheet'
      render()
    })
  }

  const form = app.querySelector('#pilot-form')

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault()

      const data = new FormData(form)

      const pilot = {
        id: Date.now().toString(),
        name: data.get('name').trim(),
        callsign: data.get('callsign').trim(),
        background: data.get('background').trim(),
        dex: Number(data.get('dex')),
        fin: Number(data.get('fin')),
        int: Number(data.get('int')),
        role: data.get('role'),
        mechId: null,
        createdAt: new Date().toLocaleDateString()
      }

      pilots.push(pilot)
      savePilots()

      selectedPilotId = pilot.id
      currentPage = 'pilotSheet'
      render()
    })
  }
}

render()
