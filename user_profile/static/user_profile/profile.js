document.addEventListener("DOMContentLoaded", function () {
  // Toggle Team Forms (if present on page)
  const createTeamBtn = document.getElementById("create-team-btn");
  const joinTeamBtn = document.getElementById("join-team-btn");
  const createTeamForm = document.getElementById("create-team-form");
  const joinTeamForm = document.getElementById("join-team-form");

  if (createTeamBtn && joinTeamBtn && createTeamForm && joinTeamForm) {
    createTeamBtn.addEventListener("click", () => {
      createTeamForm.classList.remove("hidden");
      joinTeamForm.classList.add("hidden");
    });

    joinTeamBtn.addEventListener("click", () => {
      joinTeamForm.classList.remove("hidden");
      createTeamForm.classList.add("hidden");
    });
  }

  // Contact Number Validation: Only positive integers allowed
  const contactInput = document.getElementById("contact") || document.querySelector('input[name="contact"]');
  if (contactInput) {
    contactInput.addEventListener("keypress", function (e) {
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    contactInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }

  // Photo Upload & Preview Modal (Base64 Stream preview)
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photo-preview");
  const photoInfoBtn = document.getElementById("photo-info-btn");
  const photoModal = document.getElementById("photoModal");
  const closePhotoModal = document.getElementById("closePhotoModal");

  if (photoInput && photoPreview && photoInfoBtn) {
    photoInput.addEventListener("change", function () {
      const file = this.files && this.files[0];
      if (file) {
        const fileName = file.name.toLowerCase();
        const validExtensions = [".jpg", ".jpeg"];
        const isValid = validExtensions.some(ext => fileName.endsWith(ext)) || file.type === "image/jpeg";

        if (!isValid) {
          alert("Only JPG and JPEG image files are allowed.");
          this.value = "";
          photoPreview.src = "";
          photoInfoBtn.style.display = "none";
          return;
        }

        // Convert and stream file as Base64 Data URL
        const reader = new FileReader();
        reader.onload = function (e) {
          photoPreview.src = e.target.result;
          photoInfoBtn.style.display = "inline-flex";
        };
        reader.onerror = function () {
          photoPreview.src = "";
          photoInfoBtn.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        if (!photoPreview.getAttribute("src")) {
          photoInfoBtn.style.display = "none";
        }
      }
    });

    if (photoModal && closePhotoModal) {
      if (photoModal.parentElement !== document.body) {
        document.body.appendChild(photoModal);
      }

      function showModal() {
        const currentSrc = photoPreview.getAttribute("src") || photoPreview.src;
        if (currentSrc && (currentSrc.startsWith("data:image") || currentSrc.length > 0)) {
          photoModal.style.display = "flex";
          document.body.style.overflow = "hidden";
        }
      }

      function hideModal() {
        photoModal.style.display = "none";
        document.body.style.overflow = "";
      }

      photoInfoBtn.addEventListener("click", showModal);
      closePhotoModal.addEventListener("click", hideModal);

      photoModal.addEventListener("click", function (e) {
        if (e.target === photoModal) {
          hideModal();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && photoModal.style.display === "flex") {
          hideModal();
        }
      });
    }
  }
});
