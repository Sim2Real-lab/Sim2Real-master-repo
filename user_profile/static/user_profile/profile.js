document.addEventListener("DOMContentLoaded", function () {
  // Autocomplete with suggestions (Year Field)
  const yearInput = document.getElementById("year");
  const suggestions = document.getElementById("year-suggestions");

  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "PhD"];

  function showSuggestions(value) {
    if (!suggestions) return;
    suggestions.innerHTML = "";

    const inputValue = (value || "").trim().toLowerCase();
    const filtered = yearOptions.filter(option =>
      option.toLowerCase().includes(inputValue)
    );

    if (filtered.length === 0) {
      return;
    }

    filtered.forEach(option => {
      const li = document.createElement("li");
      li.textContent = option;
      li.classList.add("suggestion-item");

      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        yearInput.value = option;
        suggestions.innerHTML = "";
        yearInput.setAttribute("data-valid", "true");
      });

      suggestions.appendChild(li);
    });
  }

  if (yearInput && suggestions) {
    yearInput.addEventListener("focus", function () {
      showSuggestions(this.value);
    });

    yearInput.addEventListener("input", function () {
      showSuggestions(this.value);
      this.setAttribute("data-valid", "false");
    });

    yearInput.addEventListener("blur", function () {
      const isValid = yearOptions.some(
        opt => opt.toLowerCase() === this.value.trim().toLowerCase()
      );
      if (!isValid && this.value.trim() !== "") {
        // Keep entered value or validate
        this.setAttribute("data-valid", "false");
      } else {
        this.setAttribute("data-valid", "true");
      }
      setTimeout(() => {
        suggestions.innerHTML = "";
      }, 150);
    });

    document.addEventListener("click", function (e) {
      if (!yearInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.innerHTML = "";
      }
    });
  }
});
