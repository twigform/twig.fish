// todo: likes system, maybe post color customization?

const API_URL = "https://guestbook-worker.twigscoolemail.workers.dev/";

const form = document.getElementById("guestbookform");
const postsList = document.getElementById("posts");

let currentPage = 0;
const postsPerPage = 15;
let allPosts = []; 
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
    
    allPosts = posts; 
    currentPage = 0; 
    hasMorePosts = true;
    postsList.innerHTML = ""; 
    
    
    loadPostsChunk();
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsList.innerHTML = "<div>Error loading posts. You're either on a slow/buggy network or I messed something up badly...</div>";
  }
}

function setupInfiniteScroll() {
    let throttled = false;
    
    
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
        
        if (existingBtn) existingBtn.style.display = 'none';
    } else if (!existingBtn && loadingEl) {
        
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
                const svgIcon = createSVGIcon(color);
                return `
                    <div class="guestbook-post" style="border: 3px solid ${color}; --shadow-color: ${shadowColor}; position: relative;">
                        ${svgIcon}
                        <strong style="color: ${color};" class="author">${post.author}</strong> 
                        <span class="dnt" style="color: #666; font-size: 0.9em;"> - ${formatted}:</span>
                        <div style="margin-top: 5px;" class='message'>${post.message}</div>
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

function createSVGIcon(bgColor) {
    return `
        <svg class="profile-icon" viewBox="0 0 1080 1080.81" xmlns="http://www.w3.org/2000/svg" style="
            width: 40px; 
            height: 40px; 
            position: absolute; 
            top: 10px; 
            left: 10px;
            border-radius: 8px;
        ">
            <defs>
                <style>
                    .cls-1, .cls-2 { fill: #fff; }
                    .cls-2 { stroke-linecap: round; }
                    .cls-2, .cls-3, .cls-4 { stroke: #000; stroke-miterlimit: 10; }
                    .cls-2, .cls-4 { stroke-width: 40px; }
                    .cls-3 { stroke-width: 15px; }
                    .cls-4 { fill: none; }
                </style>
            </defs>
            <rect id="bg" fill="${bgColor}" width="1080" height="1080"/>
            <g transform="translate(0, 100)">
                <path class="cls-2" d="M174.59,1060.81h730.82c0-203.86-103.04-377.08-246.45-439.9,107.88-46.21,183.46-153.33,183.46-278.12,0-167.03-135.4-302.43-302.43-302.43S237.57,175.77,237.57,342.8c0,124.79,75.58,231.91,183.46,278.12-143.4,62.82-246.45,236.04-246.45,439.9Z"/>
                <rect class="cls-3" id="eyepfp" x="433.89" y="236.06" width="41.33" height="109.74" rx="19.25" ry="19.25"/>
                <rect class="cls-3" id="eyepfp" x="604.78" y="236.06" width="41.33" height="109.74" rx="19.25" ry="19.25"/>
                <path class="cls-4" id="mouthpfp" d="M433.89,448.11c0,108.02,212.21,108.02,212.21,0"/>
            </g>
        </svg>
    `;
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