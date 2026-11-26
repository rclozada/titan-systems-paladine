const modules = {
  "pilot-creator": {
      title: "Pilot Creator",
      description: "Pilot creation module selected. This is where we will build pilot attributes, roles, and derived statistics."
  },

  "mech-builder": {
      title: "Mech Builder",
      description: "Mech engineering module selected. This is where we will configure mech statistics, weapons, and systems."
  },

  "pilot-sheet": {
      title: "Pilot Sheet",
      description: "Personnel records selected. This is where your saved pilots and their character sheets will appear."
  },

  "mech-sheet": {
      title: "Mech Sheet",
      description: "Mech database selected. This is where your saved mechs and their interactive sheets will appear."
  }
};

const cards = document.querySelectorAll(".module-card");

cards.forEach(card => {
  card.addEventListener("click", () => {
      const page = card.dataset.page;
      const selectedModule = modules[page];

      document.getElementById("workspace-title").textContent =
          selectedModule.title;

      document.getElementById("workspace-description").textContent =
          selectedModule.description;

      document.getElementById("workspace").scrollIntoView({
          behavior: "smooth",
          block: "nearest"
      });
  });
});