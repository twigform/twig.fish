const API_URL = "https://guestbook-worker.twigscoolemail.workers.dev/";

const form = document.getElementById("guestbookform");
const postsList = document.getElementById("posts");

async function fetchPosts() {
  try {
    const res = await fetch(API_URL);
    const posts = await res.json();

    const colors = ['#7446de', '#ff464c', '#23c600', '#ff8600'];

    function darkenHexColor(hex, percent) {
        let num = parseInt(hex.replace("#", ""), 16);
        let r = Math.max(0, Math.min(255, (num >> 16) & 0xFF));
        let g = Math.max(0, Math.min(255, (num >> 8) & 0xFF));
        let b = Math.max(0, Math.min(255, num & 0xFF));

        r = Math.floor(r * (1 - percent));
        g = Math.floor(g * (1 - percent));
        b = Math.floor(b * (1 - percent));

        return `rgb(${r}, ${g}, ${b})`;
    }

    function processMessageImages(message) {
        return message.replace(/<img([^>]*?)>/gi, (match, attributes) => {
            if (attributes.includes('class=')) {
                return match.replace(/class=["']([^"']*?)["']/i, 'class="$1 guestbookImg"');
            } else {
                return `<img${attributes} class="guestbookImg">`;
            }
        });
    }
    
    postsList.innerHTML = posts
      .map((post, index) => {
        const date = new Date(post.created_at + (post.created_at.includes('Z') ? '' : 'Z'));
        const formatted = date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const color = colors[index % colors.length];
        const shadowColor = darkenHexColor(color, 0.3);
        const processedMessage = processMessageImages(post.message);
        return `
          <div class="guestbook-post" style="border: 3px solid ${color}; --shadow-color: ${shadowColor};">
            <strong style="color: ${color};">${post.author}</strong> 
            <span class="dnt" style="color: #666; font-size: 0.9em;"> - ${formatted}:</span>
            <div style="margin-top: 5px;">${processedMessage}</div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsList.innerHTML = "<div>Error loading posts. Please try again later.</div>";
  }
}

async function submitPost(author, message) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, message })
    });
    
    form.reset();
    fetchPosts();
  } catch (error) {
    console.error("Error submitting post:", error);
    alert("Error submitting post. Please try again. Or don't, it's probably an issue on my end, to be honest...");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  fetchPosts();
  
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const author = document.getElementById("author").value;
      const message = document.getElementById("message").value;
      
      await submitPost(author, message);
    });
  }
});