const API_URL = "https://guestbook-worker.twigscoolemail.workers.dev/";

const form = document.getElementById("guestbookform");
const postsList = document.getElementById("posts");

let currentPage = 0;
const postsPerPage = 15;
let allPosts = []; // Store all posts
let isLoading = false;
let hasMorePosts = true;

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

async function fetchPosts() {
  try {
    const res = await fetch(API_URL);
    const posts = await res.json();
    
    allPosts = posts; // Store all posts
    currentPage = 0; // Reset pagination
    hasMorePosts = true;
    postsList.innerHTML = ""; // Clear existing posts
    
    // Load first chunk
    loadPostsChunk();
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsList.innerHTML = "<div>Error loading posts. Please try again later.</div>";
  }
}

function setupInfiniteScroll() {
    let throttled = false;
    
    // The guestbook container has overflow: auto, so we need to listen to its scroll
    const guestbookContainer = document.querySelector('.guestbook');
    
    if (guestbookContainer) {
        guestbookContainer.addEventListener('scroll', function() {
            if (throttled) return;
            
            throttled = true;
            setTimeout(() => { throttled = false; }, 100);
            
            const scrollTop = guestbookContainer.scrollTop;
            const scrollHeight = guestbookContainer.scrollHeight;
            const clientHeight = guestbookContainer.clientHeight;
            
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
            
            // Trigger when 80% scrolled within the guestbook container
            if (scrollPercentage > 0.8) {
                loadPostsChunk();
            }
        });
    }
}

function createLoadMoreButton() {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.textContent = 'Load More Posts';
    loadMoreBtn.style.cssText = `
        font-family: 'Nintendo', sans-serif;
        border-radius: 9pt;
        padding: 10pt 20pt;
        margin: 15pt auto;
        background-color: #f5f5f5;
        border: 2pt solid lightgray;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
        display: block;
    `;
    
    loadMoreBtn.addEventListener('mouseenter', function() {
        this.style.border = '2.5pt solid #7446de';
        this.style.boxShadow = '0px 3px 0px #3a236f';
        this.style.transform = 'scale(1.05)';
    });
    
    loadMoreBtn.addEventListener('mouseleave', function() {
        this.style.border = '2pt solid lightgray';
        this.style.boxShadow = 'none';
        this.style.transform = 'scale(1)';
    });
    
    loadMoreBtn.addEventListener('click', function() {
        loadPostsChunk();
    });
    
    return loadMoreBtn;
}

function updateLoadMoreButton() {
    const existingBtn = document.getElementById('loadMoreBtn');
    const loadingEl = document.getElementById('loading');
    const endEl = document.getElementById('end-message');
    
    if (!hasMorePosts) {
        // Hide the button when no more posts
        if (existingBtn) existingBtn.style.display = 'none';
    } else if (!existingBtn && loadingEl) {
        // Create and insert the button before the loading indicator
        const loadMoreBtn = createLoadMoreButton();
        loadingEl.parentNode.insertBefore(loadMoreBtn, loadingEl);
    }
}

function loadPostsChunk() {
    if (isLoading || !hasMorePosts) {
        return;
    }
    
    isLoading = true;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
    }
    
    // Hide load more button while loading
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    
    const startIndex = currentPage * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsChunk = allPosts.slice(startIndex, endIndex);
    
    setTimeout(() => {
        if (postsChunk.length === 0) {
            hasMorePosts = false;
            if (loadingEl) loadingEl.style.display = 'none';
            const endEl = document.getElementById('end-message');
            if (endEl) {
                endEl.style.display = 'block';
            }
            isLoading = false;
            updateLoadMoreButton();
            return;
        }
        
        const postsHTML = postsChunk
            .map((post, index) => {
                const globalIndex = startIndex + index;
                const date = new Date(post.created_at + (post.created_at.includes('Z') ? '' : 'Z'));
                const formatted = date.toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const color = colors[globalIndex % colors.length];
                const shadowColor = darkenHexColor(color, 0.3);
                return `
                    <div class="guestbook-post" style="border: 3px solid ${color}; --shadow-color: ${shadowColor};">
                        <strong style="color: ${color};">${post.author}</strong> 
                        <span class="dnt" style="color: #666; font-size: 0.9em;"> - ${formatted}:</span>
                        <div style="margin-top: 5px;">${post.message}</div>
                    </div>
                `;
            })
            .join("");
        
        postsList.insertAdjacentHTML('beforeend', postsHTML);
        
        currentPage++;
        isLoading = false;
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (endIndex >= allPosts.length) {
            hasMorePosts = false;
            const endEl = document.getElementById('end-message');
            if (endEl) endEl.style.display = 'block';
        }
        
        updateLoadMoreButton();
    }, 100);
}

async function submitPost(author, message) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, message })
    });
    
    form.reset();
    fetchPosts(); // This will reload all posts and reset pagination
  } catch (error) {
    console.error("Error submitting post:", error);
    alert("Error submitting post. Please try again. Or don't, it's probably an issue on my end, to be honest...");
  }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchPosts();
    setupInfiniteScroll();
    
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const author = document.getElementById("author").value;
      const message = document.getElementById("message").value;
      
      await submitPost(author, message);
    });
  }
});