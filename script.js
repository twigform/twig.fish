$(document).ready(function () {
    var windowWidth = $(window).width();
    var animating = 0;
    
    if (windowWidth <= 768) {
    $("#speechBubble").css({
        'opacity': 0,
        'bottom': '170pt',
    });
    } else {
    $("#speechBubble").css({
        'opacity': 0,
        'bottom': '180pt',
    });
}
    const miiCnr = document.getElementById('miiCnr');
    console.log(miiCnr);
    const messages = ["i would like 10 apples...", "hi! my name is twig!", "give me commit rights on your repo", "amen amen amen amen amen", "tell your friends! tell your coworkers!", "i love you", "if you are able and willing to give me 10000 dollars please hit me up", "i will never be productive", "whatever. Go my twigling", "man this pickel good", "it's my birthday!", "i am a cat sometimes", "i quite like pallas cats", "good morning usa", "breathe please", "i'm sleepy", "bro. memory. freaking. unlocked.", "u are a genius!", "you are the youngest person ever", "that bird that i hate", "shrimp on sale at this hour?", "i'm a big fan", "you are now in the mix with twerknation28", "shut up bro", "STOP CLICKING ME!", "...what?", "toby fox if you are reading this please contact me i am a big fan", "MANTITTIES IN YOUR FACE", "ƌᨓ ꔠƌφφɣ. ƌᨓ ⟟η ⍭ꭱơ⊔βℓ⋲. ηơ, ⍵ƌ⟟⍭. ƌᨓ ꔠƌφφɣ.", "do you ever feel like a hamster in venuzuela?", "✌︎👎︎👎︎☼︎☜︎💧︎💧︎ 💣︎☜︎", "everyone SHUT UP. i have something to say...", "dragdropclickchop", "when i'm washing dishes but i have an active imagination", "erm", "bruh.flp", "jpegs are kinda nostalgic for me", "ERRATAS", "the reizoko technique", "chiyojump", "STOP IT!", "what a nintendrone lol screw this guy", "more statistics please", "abstract... i like it...", "the const holding all of these is getting really long", "jeans remover", "i spent 2 hours on this bart simpson for nothing. no views i bet", "you just won the golden ticket! the prize is nothing do not contact me", "i am happy because everyone loves me", "dear god...", "big tanuki balls", "it's just a pigeon...", "weiner", "I love nitrous oxide!", "i love mario // jumping up and down clapping //", "...during no poop july?", "Oscilloscope meat gradient", "it's one in the morning...", ":chiyojump:", "Hello, I am looking for Twigchan...", "goodnight bro"];
    let lastMessageIndex = -1;

    $(window).resize(function() {
        windowWidth = $(window).width();
    });

    function getRandomMessageIndex() {
        if (messages.length <= 1) return 0;
        let idx;
        do {
            idx = Math.floor(Math.random() * messages.length);
        } while (idx === lastMessageIndex);
        lastMessageIndex = idx;
        return idx;
    }

    function waitForButt(selector) {
        return new Promise((resolve) => {
            $(selector).one('click', function () {
                resolve();
            });
        });
    }

    $(miiCnr).on('click', function () {
        if (animating === 1) {
            console.log("already animating");
            return;
        }

        $("#speechText").text("" + messages[getRandomMessageIndex()] + " ");
        animating = 1;
        $(miiCnr).attr('src', 'assets/img/mii_talk.png');

        const bubbleAnimation = windowWidth < 600
            ? { opacity: 1, bottom: '100pt' }
            : { opacity: 1, bottom: '180pt' };

        const bubbleHideAnimation = windowWidth < 600
            ? { opacity: 0, bottom: '80pt' }
            : { opacity: 0, bottom: '150pt' };

        setLinksFadeOut(true);
        $("#speechBubble").show().animate(bubbleAnimation, 500, 'easeOutCirc', async function () {
            await waitForButt("#nextButton");
            $("#speechBubble").animate(bubbleHideAnimation, 500, 'easeOutCirc', function () {
                $(this).hide();
                setLinksFadeOut(false);
                animating = 0;
                $(miiCnr).attr('src', 'assets/img/mii_wave.png');
            });
        });
    });

    let carouselItems = [];
    let currentCarouselIndex = 0;
    let apisLoaded = 0;

    function renderCarousel() {
        const $container = $(".statusContainer");
        if ($container.find('.carouselItem').length === 0) {
            $container.empty();
            if (carouselItems.length === 0) return;
            const item = carouselItems[currentCarouselIndex];
            if (carouselItems.length == 1) {
                $(".statusContainer").css('min-height', 'auto', 'max-height', 'auto');
            }
            $container.append(item.html);

            if (carouselItems.length > 1) {
                let dots = '<span class="carouselDots">';
                for (let i = 0; i < carouselItems.length; i++) {
                    dots += `<span class="carouselDot${i === currentCarouselIndex ? ' active' : ''}"></span>`;
                }
                dots += '</span>';
                $container.append(`
                    <div class="carouselNav">
                        <button class="carouselPrev carouselBtn">➜</button>
                        ${dots}
                        <button class="carouselNext carouselBtn">➜</button>
                    </div>
                `);
            }
        } else {
            $container.find('.carouselItem').replaceWith(carouselItems[currentCarouselIndex].html);
            $container.find('.carouselDot').each(function(i) {
                if (i === currentCarouselIndex) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            });
        }
    }

    $(".statusContainer").on('click', '.carouselPrev', function(e) {
        e.stopPropagation();
        currentCarouselIndex = (currentCarouselIndex - 1 + carouselItems.length) % carouselItems.length;
        renderCarousel();
    });
    $(".statusContainer").on('click', '.carouselNext', function(e) {
        e.stopPropagation();
        currentCarouselIndex = (currentCarouselIndex + 1) % carouselItems.length;
        renderCarousel();
    });

    $(".statusContainer").on('click', '.carouselNav', function(e) {
        e.stopPropagation();
    });

    $.getJSON("https://api.lanyard.rest/v1/users/970448540335759461", function(data) {
        if (data.success && data.data && data.data.activities && data.data.activities.length > 0) {
            const activity = data.data.activities.find(act => 
                (act.type === 0 || act.type === 2) &&
                act.name !== "Nintendo Switch 2" &&
                (!act.assets || !act.assets.large_text || !act.assets.large_text.includes("Playing on Nintendo Switch 2")) &&
                act.name !== "Spotify"
            );
            if (activity) {
                let statusText = "";
                let imageUrl = "";
                if (activity.type === 0) {
                    statusText = `Discord: Playing ${activity.name}`;
                    if (activity.assets && activity.assets.large_image) {
                        if (activity.assets.large_image.startsWith("mp:external/")) {
                            imageUrl = "https://media.discordapp.net/" + activity.assets.large_image.replace("mp:external/", "");
                        } else {
                            imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                        }
                    }
                } else if (activity.type === 2) {
                    statusText = `Discord: Listening to ${activity.details} by ${activity.state}`;
                    if (activity.assets && activity.assets.large_image) {
                        if (activity.assets.large_image.startsWith("spotify:")) {
                            imageUrl = `https://i.scdn.co/image/${activity.assets.large_image.replace("spotify:", "")}`;
                        }
                    }
                }
                carouselItems.push({
                    html: `
                        <div class='carouselItem'>
                            <p class='statusText'>${statusText}</p>
                            ${imageUrl ? `<img class='discordActivityImage' src='${imageUrl}' alt='${activity.name} cover'>` : ""}
                        </div>
                    `
                });
            }
        }
        maybeRenderCarousel();
    });

    $.getJSON("https://lastfm-worker.twigscoolemail.workers.dev/", function(data) {
        const track = data.recenttracks.track[0];
        const trackName = track.name;
        const artistName = track.artist["#text"];
        const albumName = track.album["#text"];
        const trackUrl = track.url;
        const isNowPlaying = track.hasOwnProperty("@attr") && track["@attr"].nowplaying === "true";
        let imageUrl = track.image[2]["#text"];
        
        if (imageUrl === "") {
            imageUrl = "assets/img/album_placeholder.png";
        }

        if (isNowPlaying) {
            carouselItems.push({
                html: `
                    <div class='carouselItem'>
                        <p class='statusText'>Now Playing: ${trackName} by ${artistName}</p>
                        <img class='albumCover' src='${imageUrl}' alt='${trackName} album cover'>
                    </div>
                `
            });
        }

        maybeRenderCarousel();
    });

    $.getJSON("https://nxapi-presence.fancy.org.uk/api/presence/3f6826999dd8ff52", function(data) {
        const isOnline = data.friend.presence.state;
        const game = data.friend.presence.game.name;  
        const gameImg = data.friend.presence.game.imageUri;

        if (isOnline == "ONLINE") {
            carouselItems.push({
                html: `
                    <div class='carouselItem'>
                        <p class='statusText'>Nintendo Switch: Playing ${game}</p>
                        <img class='gameImage' src='${gameImg}' alt='${game} cover'>
                    </div>
                `
            });
        }
        maybeRenderCarousel();
    });

    function maybeRenderCarousel() {
        apisLoaded++;
        if (apisLoaded >= 3) {
            if (carouselItems.length === 0) {
                carouselItems.push({
                    html: `
                        <div class='carouselItem'>
                            <p class='statusText'>No music, game, or Discord status available.</p>
                        </div>
                    `
                });
            }
            renderCarousel();
            var $container = $(".statusContainer");
            var visiblePart = 20;
            var containerHeight = $container.outerHeight();
            $container.css('bottom', '-' + (containerHeight - visiblePart) + 'px');
        }
    }

    setTimeout(function() {
        var $container = $(".statusContainer");
        var visiblePart = 20;
        var containerHeight = $container.outerHeight();
        $container.css('bottom', '-' + (containerHeight - visiblePart) + 'px');
    }, 500);

    function setLinksFadeOut(fade) {
        if ($(window).width() <= 768) {
            if (fade) {
                $('.linksContainer').addClass('fade-out');
            } else {
                $('.linksContainer').removeClass('fade-out');
            }
        } else {
            $('.linksContainer').removeClass('fade-out');
        }
    }
});

var statusToggle = false;

$(".statusContainer").on('click', function(e) {
    if ($(e.target).closest('.carouselNav, .carouselPrev, .carouselNext').length) {
        return;
    }
    var $container = $(".statusContainer");
    var containerHeight = $container.outerHeight();
    var visiblePart = 20;
    if (statusToggle == false) {
        $container.animate({
            bottom: '0px'
        }, 500, 'easeOutQuart');
        $container.addClass('expanded');
        if ($(window).width() <= 768) {
            $('.linksContainer').addClass('fade-out');
        }
    } else {    
        $container.animate({
            bottom: '-' + (containerHeight - visiblePart) + 'px'
        }, 500, 'easeOutQuart');
        $container.removeClass('expanded');
        if ($(window).width() <= 768) {
            $('.linksContainer').removeClass('fade-out');
        }
    }
    statusToggle = !statusToggle;
});

const aboutSections = [
    {
        id: 'btn-interests',
        title: 'General',
        content: `<h2 class="about-section-title">General</h2><p>Hey there, I'm twig.<br>
        I'm a musician, student, artist, dev, and generally strange being. <br> A site of a more avant garde aesthetic would better illustrate me as a person, but I wanted to make a Nintendo lookin site so we ended up with this.<br>
        I go by any pronouns, but mostly they/them.<br>
        I make music under the name "patchform", and do the rest of my online stuff is usually under "twig" or "twigform".<br>
        
        Feel free to reach out if you want to chat or collaborate on something. :)</p>`
    },
    {
        id: 'btn-skills',
        title: 'Interests',
        content: `<h2 class="about-section-title">Interests</h2><p>I'm into a lotta stuff, but i specifically like:<br>
        • Music (Breakcore / Mashcore specifically)<br>
        • Tech stuff<br>
        • Pallas Cats<br>
        • Games<br>
        • Strange and obscure things<br>
        • Too many other things to list... :(</p>`
    },
    {
        id: 'btn-projects',
        title: 'Projects',
        content: `<h2 class="about-section-title">Projects</h2>
        • Personal Website (you're here!)<br>
        • iiSU Launcher (Frontend)<br>
        • Very WIP JRPG (Gamemaker)<br>
        • A ton of scrapped stuff<br>
        • Other random stuff I'm too lazy to list here/try to remember<br>`
    },
    {
        id: 'btn-links',
        title: 'Links',
        content: `<h2 class="about-section-title">Links</h2>
        <a href="https://github.com/twigform" target="_blank">• GitHub <img src="assets/img/github.svg" alt="GitHub" style="width: 16px; height: 16px; vertical-align: middle;"></a><br>
        <a href="https://bsky.app/profile/twigform.bsky.social" target="_blank">• Bluesky <img src="assets/img/bsky.svg" alt="Bluesky" style="width: 16px; height: 16px; vertical-align: middle;"></a><br>
        <a href="#" id="discord-link">• Discord <img src="assets/img/discord.svg" alt="Discord" style="width: 16px; height: 16px; vertical-align: middle;"></a><br>
        <a href="https://nxapi-auth.fancy.org.uk/@twigform" target="_blank">• Nintendo <img src="assets/img/nintendo.svg" alt="Nintendo" style="width: 16px; height: 16px; vertical-align: middle;"></a><br>`
    }
];

let aboutCurrentIndex = 0;

function renderAboutDots() {
    let dots = '';
    for (let i = 0; i < aboutSections.length; i++) {
        dots += `<span class="about-dot${i === aboutCurrentIndex ? ' active' : ''}" data-index="${i}"></span>`;
    }
    $('#aboutCarouselDots').html(dots);
}

function updateAboutDots() {
    $('#aboutCarouselDots .about-dot').each(function(i) {
        if (i === aboutCurrentIndex) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
}

function renderAboutCarousel() {
    const section = aboutSections[aboutCurrentIndex];
    $('.about-carousel-content').html(section.content);
    updateAboutDots();
}

aboutSections.forEach((section, idx) => {
    $(`#${section.id}`).on('click', function(e) {
        e.stopPropagation();
        aboutCurrentIndex = idx;
        renderAboutCarousel();
    });
});

$('#aboutCarouselDots').on('click', '.about-dot', function(e) {
    e.stopPropagation();
    aboutCurrentIndex = parseInt($(this).attr('data-index'));
    renderAboutCarousel();
});

$(document).ready(function () {
    renderAboutDots();
    renderAboutCarousel();

    $(document).on('click', '#discord-link', function(e) {
        e.preventDefault();
        const $link = $(this);
        navigator.clipboard.writeText('patchform').then(function() {
            $link.text('• Username copied!');
            setTimeout(function() {
                $link.text('• Discord');
            }, 2000);
        });
    });
});

$(document).on('dragstart', function(e) {
    e.preventDefault();
});
$(document).on('drop', function(e) {
    e.preventDefault();
});

function spawnTwig() {
    if ($('.floating-twig').length > 0) return;

    const direction = Math.random() < 0.5 ? 'ltr' : 'rtl';
    const startTop = Math.random() * 60 + 10;

    let delta = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 10 + 10);
    let endTop = startTop + delta;
    endTop = Math.min(Math.max(endTop, 5), 85);

    const $img = $('<img/>', {
        src: 'assets/img/twig_bg_fly.png',
        class: 'floating-twig',
        css: {
            position: 'fixed',
            zIndex: 1,
            pointerEvents: 'none',
            width: '120pt',
            height: 'auto',
            top: `${startTop}vh`,
            left: direction === 'ltr' ? '-140pt' : 'calc(100vw + 20pt)',
            opacity: 1,
            transition: 'none',
            transform: 'rotate(0deg)',
            filter: 'drop-shadow(1px 2px 15px rgba(0,0,0,0.3))'
        }
    });
    $('body').append($img);

    setTimeout(() => {
        $img.css({
            transition: 'left 18s linear, top 18s linear, transform 18s linear',
            left: direction === 'ltr' ? 'calc(100vw + 20pt)' : '-140pt',
            top: `${endTop}vh`,
            transform: `rotate(${direction === 'ltr' ? 360 : -360}deg)`
        });
    }, 100);

    setTimeout(() => {
        $img.remove();
    }, 18500);
}

function scheduleTwig() {
    const nextTime = Math.random() * 20000 + 10000;
    setTimeout(() => {
        spawnTwig();
        scheduleTwig();
    }, nextTime);
}

scheduleTwig();
