'use strict';

let CLEARED_LEVELS = [];
let forceUpdate;

$(function () {
  $.ajaxSetup({ 'async': false });

  const DIFFICULTY_COLORS = {
    "auto": "Orange",
    "easy": "DodgerBlue",
    "normal": "MediumSeaGreen",
    "hard": "Gold",
    "harder": "Red",
    "insane": "DeepPink",
  };

  const TIER_COLORS = {
    "1": "Cyan",
    "2": "Lime",
    "3": "Yellow",
    "4": "Orange",
    "5": "Red",
  };

  const TABLE_HEADERS = [
    "Clear?",
    "Name",
    "Creator(s)",
    "Level ID",
    "Skillsets/Info",
    "Description"
  ];

  const CONTENT_JSON = $.getJSON('./content/underrated.json').responseJSON;

  function generateContent() {
    generateDifficultyTab(CONTENT_JSON);
    generatePacksTab(CONTENT_JSON);
    // $('#difficulties').tabs();
    $('#tabs').tabs({
      activate: () =>
        updateAllCheckboxes()
    });
    haxx();
  }

  function generateDifficultyTab(json) {
    const ul = document.createElement('ul');
    ul.id = 'hack';

    const keys = Object.keys(json['levels']);
    for (const difficulty of keys) {
      const tag = 'tab-' + difficulty;
      const title = difficulty[0].toUpperCase() + difficulty.substring(1);

      // create tab
      const tabColor = DIFFICULTY_COLORS[difficulty];
      const tab = generateTab(title, tag, tabColor);
      ul.appendChild(tab);

      // create inner
      const data = json['levels'][difficulty];
      const div = document.createElement('div');
      div.id = tag;
      const inner = generateTabInner(data, difficulty);

      const foo = div.appendChild(inner);
      $(foo).tabs({ activate: () => updateAllCheckboxes() });

      $('#tabs').append(div);
    }

    $('#difficulties').append(ul);
  }

  function generatePacksTab(json) {
    const ul = document.getElementById('hack');

    const keys = Object.keys(json['packs']).reverse();
    for (const tier of keys) {
      const tag = 'tab-' + tier;
      const title = tier[0].toUpperCase() + tier.substring(1);

      // create tab
      const tab = generateTab(title, tag, '');
      tab.classList.add('hack2');
      ul.appendChild(tab);

      // create inner
      const data = json['packs'][tier];
      const div = document.createElement('div');
      div.id = tag;
      const inner = generateTabInner(data, tier);

      const foo = div.appendChild(inner);
      $(foo).tabs({ activate: () => updateAllCheckboxes() });

      $('#tabs').append(div);
    }

    $('#difficulties').append(ul);
  }

  function generateTab(title, tag, color) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + tag;
    a.innerText = title;
    a.style.color = color;

    li.appendChild(a);
    return li;
  }

  function generateTabInner(json, parent) {
    const div = document.createElement('div');

    const parentTag = 'tab-' + parent;
    const ul = document.createElement('ul');
    div.appendChild(ul);

    const keys = Object.keys(json);
    for (const key of keys) {
      const keyFmt = encodeURI(key).replaceAll('=', '');
      const tag = 'tab-' + parent + '-inner-' + keyFmt;
      // hack
      let title = '';
      if (!isNaN(parseInt(key, 10)))
        title = 'Tier ' + key;
      else
        title = key;

      // create tab
      const tabColor = TIER_COLORS[key];
      const tab = generateTab(title, tag, tabColor);
      ul.appendChild(tab);

      // create table
      const data = json[key];
      const divInner = document.createElement('div');
      divInner.id = tag;
      const table = generateTable(data, tag);

      divInner.appendChild(table);
      div.appendChild(divInner);
    }

    div.classList.add('inner');
    return div;
  }

  function generateTable(json) {
    const table = document.createElement('table');

    // create header
    const trHeader = document.createElement('tr');
    for (const key of TABLE_HEADERS) {
      if (key == "Description")
        continue;

      let th = document.createElement('th');
      th.innerText = key;
      trHeader.appendChild(th);
    }
    table.appendChild(trHeader);

    // generate content
    for (let level of json) {
      let tr = document.createElement('tr');

      if (typeof level == 'number') {
        level = getLevelByID(level);
      }

      const td = document.createElement('td');
      const checkbox = generateCheckbox(level['id']);
      td.appendChild(checkbox);
      tr.appendChild(td);

      for (const [key, value] of Object.entries(level)) {
        if (key == "description")
          continue;

        const td = document.createElement('td');
        td.innerText = value;
        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    return table;
  }

  function generateCheckbox(levelID) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    const unique = btoa(Math.random().toString());
    input.id = unique;
    input.name = unique;
    input.classList.add('checkbox');
    input.dataset.id = levelID.toString();

    // i do not know how to use jquery
    $(input).change(function () {
      updateCheckbox(this);
      updateRoles();
    });

    return input;
  }

  function haxx() {
    // i cant believe this fucking works
    const ul = document.createElement('ul');
    const elements = $('.hack2');
    for (const elem of elements) {
      elem.classList.remove('hack2');
      ul.append(elem);
    }
    $('#packs').append(ul);

    // nothing ever happened
    document.getElementById('hack').removeAttribute('id');
  }

  function getLevelByID(id) {
    const json = CONTENT_JSON;

    for (const difficulty of Object.values(json['levels'])) {
      for (const tier of Object.values(difficulty)) {
        for (const level of Object.values(tier)) {
          if (level.id == id) {
            return level;
          }
        }
      }
    }
  }

  function updateCheckbox(elem) {
    const levelID = elem.dataset.id;
    if (elem.checked) {
      if (!CLEARED_LEVELS.includes(levelID)) {
        CLEARED_LEVELS.push(levelID);
      }
    } else {
      if (CLEARED_LEVELS.includes(levelID)) {
        const index = CLEARED_LEVELS.indexOf(levelID);
        CLEARED_LEVELS.splice(index, 1);
      }
    }
  }

  function updateAllCheckboxes() {
    const checkboxes = $('.checkbox');
    for (const checkbox of checkboxes) {
      if (CLEARED_LEVELS.includes(checkbox.dataset.id)) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    }
  }

  function updateRoles() {
    const counts = [1, 5, 10, 25, 50, 100, 250];
    $('#roles').empty();
    // asdfasdf
    const legend = document.createElement('legend');
    legend.innerText = 'Roles';
    $('#roles').append(legend);

    for (const c of counts) {
      if (CLEARED_LEVELS.length >= c) {
        const p = document.createElement('p');
        let text = c.toString() + ' List Level';
        if (c > 1) {
          text += 's';
        }
        p.innerText = text;
        $('#roles').append(p);
      }
    }

    const clearedReal = CLEARED_LEVELS.map(v => parseInt(v));

    // check packs
    for (const tier of Object.values(CONTENT_JSON['packs'])) {
      for (const [key, pack] of Object.entries(tier)) {
        if (pack.every(v => clearedReal.includes(v))) {
          const p = document.createElement('p');
          p.innerText = key;
          $('#roles').append(p);
        }
      }
    }

    // check difficulties
    for (const [difficultyKey, difficulty] of Object.entries(CONTENT_JSON['levels'])) {
      for (const [tierKey, tier] of Object.entries(difficulty)) {
        const levelIDs = tier.map(v => v['id']);
        if (levelIDs.every(v => clearedReal.includes(v))) {
          const p = document.createElement('p');

          let plural = difficultyKey + 's';
          if (difficultyKey == 'easy') {
            plural = 'easies';
          }

          const text = 'All Tier ' + tierKey + ' ' + plural[0].toUpperCase() + plural.substring(1);
          p.innerText = text;
          $('#roles').append(p);
        }
      }
    }
  }

  generateContent();

  forceUpdate = () => {
    updateAllCheckboxes();
    updateRoles();
  }
});