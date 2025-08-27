document.addEventListener("DOMContentLoaded", () => {
  const profileInfoInput = document.getElementById("profileInfo");
  const generateBtn = document.getElementById("generateBtn");
  const resultsDiv = document.getElementById("results");

  // Scrape LinkedIn profile info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: () => {
          const name = document.querySelector("h1")?.innerText || "";
          let role = document.querySelector(".text-body-medium")?.innerText || "";
          let company = document.querySelector(".pv-entity__secondary-title")?.innerText || "";

          // First listed experience
          let pastExperience =
            document.querySelector(".pvs-entity .t-14")?.innerText || "";

          // Only first word of name
          const firstName = name.trim().split(" ")[0];

          return { firstName, role, company, pastExperience };
        },
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          profileInfoInput.value = JSON.stringify(results[0].result);
        }
      }
    );
  });

  // Generate Icebreakers
  generateBtn.addEventListener("click", () => {
    resultsDiv.innerHTML = "";

    let profileData;
    try {
      profileData = JSON.parse(profileInfoInput.value);
    } catch {
      resultsDiv.innerHTML = "<p>Please open a LinkedIn profile first.</p>";
      return;
    }

    const { firstName, role, company, pastExperience } = profileData;

    if (!firstName) {
      resultsDiv.innerHTML = "<p>Could not detect profile details.</p>";
      return;
    }

    // Build smart context
    const roleCompany =
      role && company ? `${role} at ${company}` : role || company || "your field";

    // Templates (always using firstName only)
    const templates = [
      `Hello ${firstName}, I really admire your work in ${roleCompany}. Would love to connect!`,
      `Hi ${firstName}, your journey from ${pastExperience || "previous roles"} to ${company} stood out to me. Really inspiring!`,
      `Hey ${firstName}, I came across your profile and was impressed by your background in ${roleCompany}. Looking forward to connecting.`,
      `Hello ${firstName}, your experience in ${roleCompany} caught my attention. It’d be great to exchange ideas.`,
      `Hi ${firstName}, I enjoy following people in ${roleCompany} — thought it’d be nice to connect!`,
    ];

    // Shuffle and pick 3
    const shuffled = templates.sort(() => 0.5 - Math.random());
    const messages = shuffled.slice(0, 3);

    messages.forEach((msg) => {
      const card = document.createElement("div");
      card.className = "result-card fade-in";
      card.innerHTML = `
        <p>${msg}</p>
        <button class="copy-btn">Copy</button>
      `;
      card.querySelector(".copy-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(msg);
      });
      resultsDiv.appendChild(card);
    });
  });
});
