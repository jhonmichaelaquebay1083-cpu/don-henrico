gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ─── 0. Loading Screen ───
    // Animation is entirely CSS-driven (8s cycle, see style.css "LOADING SCREEN — v6").
    // JS just kicks it off and cleans up at the end.
    (function () {
        const loader = document.getElementById('loader');
        if (!loader) return; // guard: only runs on index.html

        const video = document.querySelector('.hero-bg video');

        function finish() {
            loader.style.display = 'none';
            if (video) video.play().catch(function () {}); // silence autoplay-policy errors
        }

        if (prefersReducedMotion) {
            finish();
            return;
        }

        // Trigger the CSS animation sequence
        loader.classList.add('animate');

        // Hide loader + play video after the full 6.5s CSS animation completes
        setTimeout(finish, 6500);
    }());

    // ─── 0.5. Parallax Greenery ───
    // Side-positioned eucalyptus branches drift slower than scroll for a depth effect.
    if (!prefersReducedMotion) {
        document.querySelectorAll('.parallax-slow').forEach(function (el) {
            var section = el.closest('section') || el.parentElement;
            if (!section) return;
            gsap.to(el, {
                yPercent: -18,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    // ─── 1. Hamburger & Overlay Menu ───
    const hamburger = document.getElementById("hamburger-btn");
    const overlay = document.getElementById("nav-overlay");
    const navClose = document.getElementById("nav-close");
    const overlayLinks = document.querySelectorAll(".nav-overlay-link, .nav-overlay-cta");

    function openMenu() {
        hamburger.classList.add("active");
        hamburger.setAttribute("aria-expanded", "true");
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }

    function closeMenu() {
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
    }

    hamburger.addEventListener("click", () => {
        overlay.classList.contains("active") ? closeMenu() : openMenu();
    });
    navClose.addEventListener("click", closeMenu);

    overlayLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                e.preventDefault();
                closeMenu();
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                }, 300);
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("active")) closeMenu();
    });

    // ─── 2. Navbar visibility ───
    const navbar = document.querySelector(".navbar");
    const isSubpage = document.body.classList.contains("page-sub");

    gsap.set(navbar, { y: 0, opacity: 1 });

    if (isSubpage) {
        navbar.classList.add("scrolled");
    } else {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }, { passive: true });
        if (window.scrollY > 50) navbar.classList.add("scrolled");
    }

    // ─── 5. Section reveal animations ───
    if (!prefersReducedMotion) {
        // Hero text
        gsap.fromTo(".hero-text",
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: ".hero-banner", start: "top 70%", toggleActions: "play none none reverse" }
            }
        );

        // Welcome section
        gsap.fromTo(".welcome-media",
            { opacity: 0, x: -40 },
            {
                opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
                scrollTrigger: { trigger: ".welcome-section", start: "top 75%", toggleActions: "play none none reverse" }
            }
        );
        gsap.fromTo(".welcome-text",
            { opacity: 0, x: 40 },
            {
                opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.15,
                scrollTrigger: { trigger: ".welcome-section", start: "top 75%", toggleActions: "play none none reverse" }
            }
        );

        // Services (Only if on Home Page)
        const servicesSection = document.querySelector(".services-section");
        if (servicesSection && !isSubpage) {
            gsap.fromTo(".services-heading", { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
                scrollTrigger: { trigger: ".services-section", start: "top 75%", toggleActions: "play none none reverse" }
            });

            gsap.utils.toArray(".service-card-new").forEach((card, i) => {
                gsap.fromTo(card, { opacity: 0, y: 30 }, {
                    opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out",
                    scrollTrigger: { trigger: ".services-section", start: "top 65%", toggleActions: "play none none reverse" }
                });
            });
        }

        // Subpage Hero & Content Animations
        if (isSubpage) {
            gsap.fromTo(".subpage-hero .hero-content", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });

            gsap.utils.toArray(".service-card-expanded").forEach((card, i) => {
                gsap.fromTo(card, { opacity: 0, y: 50 }, {
                    opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
                    scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none reverse" }
                });
            });

            gsap.utils.toArray(".value-card").forEach((card, i) => {
                gsap.fromTo(card, { opacity: 0, y: 30 }, {
                    opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out",
                    scrollTrigger: { trigger: ".values-section", start: "top 80%", toggleActions: "play none none reverse" }
                });
            });
        }

        // Stats count-up
        document.querySelectorAll(".stat-number").forEach(stat => {
            const rawText = stat.textContent.trim();
            const numberMatch = rawText.match(/\d+/);
            if (!numberMatch) return;
            const endVal = parseInt(numberMatch[0], 10);
            const suffix = rawText.replace(numberMatch[0], "");
            stat.textContent = "0" + suffix;

            ScrollTrigger.create({
                trigger: stat,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: endVal, duration: 1.5, ease: "power2.out",
                        onUpdate: () => { stat.textContent = Math.floor(obj.val) + suffix; }
                    });
                }
            });
        });

        // CTA parallax
        const ctaBg = document.querySelector(".cta-bg");
        if (ctaBg) {
            gsap.to(ctaBg, {
                yPercent: isMobile ? 10 : 20, ease: "none",
                scrollTrigger: { trigger: ".cta-section", start: "top bottom", end: "bottom top", scrub: true }
            });
        }
        gsap.fromTo(".cta-content", { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
            scrollTrigger: { trigger: ".cta-section", start: "top 65%", toggleActions: "play none none reverse" }
        });

        // Gallery
        gsap.fromTo(".gallery-title", { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: ".gallery-section", start: "top 75%", toggleActions: "play none none reverse" }
        });

        gsap.utils.toArray(".scatter-item").forEach((item, i) => {
            gsap.fromTo(item, { opacity: 0, y: 40, scale: 0.96 }, {
                opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.08, ease: "power3.out",
                scrollTrigger: { trigger: ".gallery-scatter", start: "top 85%", toggleActions: "play none none reverse" }
            });
        });
    }

    // ─── 6. Scroll-Snap Dot Helper ───
    function initSnapDots(scrollContainer, dotsContainer, dotClass, slideSelector) {
        if (!scrollContainer || !dotsContainer) return;
        const slides = scrollContainer.querySelectorAll(slideSelector);
        if (slides.length === 0) return;

        slides.forEach(function (_, i) {
            var dot = document.createElement("button");
            dot.className = dotClass + (i === 0 ? " active" : "");
            dot.setAttribute("aria-label", "Slide " + (i + 1));
            dot.addEventListener("click", function () {
                slides[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
            });
            dotsContainer.appendChild(dot);
        });

        var scrollTimer;
        scrollContainer.addEventListener("scroll", function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                var scrollLeft = scrollContainer.scrollLeft;
                var slideWidth = slides[0].offsetWidth;
                var current = Math.round(scrollLeft / slideWidth);
                var dots = dotsContainer.querySelectorAll("." + dotClass);
                dots.forEach(function (d, i) {
                    d.classList.toggle("active", i === current);
                });
            }, 50);
        }, { passive: true });
    }

    // Init dots for gallery carousel (if carousel exists)
    const galleryCarousel = document.getElementById("gallery-carousel");
    if (galleryCarousel) {
        initSnapDots(
            galleryCarousel,
            document.getElementById("carousel-dots"),
            "carousel-dot",
            ".carousel-slide"
        );
    }

    // ─── 7. Service Modal ───
    // ─── 7. Service Modal ───
    const serviceData = {
        wedding: {
            img: "assets/wedding.jpg",
            label: "— Premium Venue",
            title: "Wedding Venue",
            desc: "Celebrate your love story in our breathtaking wedding venue. With lush gardens, an elegant function hall, and stunning poolside backdrops, every moment of your special day will be picture-perfect.",
            features: ["Function Hall (100+ Guests)", "Garden Ceremony Setup", "Bridal Suite", "Sound & Lighting System", "Catering Partnerships", "Overnight Accommodation"],
            price: "₱20,000",
            venueDesc: "An all-inclusive luxurious hall and garden space tailored for grand romantic celebrations.",
            amenities: [
                { title: "Layout & Furnishings", items: ["Function Hall", "Bridal Suite", "Tables & Chairs", "Stage & Podium", "Garden Seating"] },
                { title: "Entertainment", items: ["Sound System", "LED Projector", "Photography Spots"] },
                { title: "Dining & Catering", items: ["Kitchen Access", "Catering Partners", "Buffet Setup"] }
            ]
        },
        birthday: {
            img: "assets/bday.jpg",
            label: "— Fun & Celebration",
            title: "Birthday Party",
            desc: "Make birthdays truly special at Don Henrico. From intimate family gatherings to grand celebrations, our versatile spaces and entertainment amenities create the perfect party atmosphere.",
            features: ["Pool Party Setup", "Karaoke & Sound System", "Buffet Area", "Game Zone", "Custom Decorations", "Photography Spots"],
            price: "₱15,000",
            venueDesc: "A vibrant poolside setting perfect for lively parties and memorable gatherings.",
            amenities: [
                { title: "Entertainment", items: ["Pool Access", "Karaoke Setup", "Sound System", "Game Area"] },
                { title: "Comforts", items: ["Air Conditioning", "Free Wi-Fi", "Charging Stations", "Shower Area"] },
                { title: "Dining", items: ["Kitchen Access", "Bar Counter", "Dining Sets"] }
            ]
        },
        christening: {
            img: "assets/debut.jpg",
            label: "— Sacred Moments",
            title: "Christening",
            desc: "Welcome new life in a serene and beautiful setting. Our peaceful gardens and intimate spaces provide the perfect backdrop for christenings and baptismal celebrations.",
            features: ["Intimate Garden Setup", "Reception Area", "Dining Package Options", "Photo-ready Landscapes", "Guest Parking", "Children-friendly Spaces"],
            price: "₱12,000",
            venueDesc: "A peaceful and intimate garden setup ideal for welcoming the newest family member.",
            amenities: [
                { title: "Layout & Furnishings", items: ["Outdoor Gazebo", "Tables & Chairs", "Garden Seating"] },
                { title: "Comforts", items: ["Free Wi-Fi", "Air Conditioning", "Children-friendly Spaces"] },
                { title: "Safety", items: ["24/7 Security", "Secure Parking", "First Aid Kit"] }
            ]
        },
        overnight: {
            img: "assets/gallery 5.jpg",
            label: "— Private Retreat",
            title: "Overnight Stay",
            desc: "Escape the city and enjoy a peaceful overnight stay with family and friends. Our comfortable accommodations and exclusive access to resort amenities ensure a relaxing getaway.",
            features: ["Exclusive Resort Access", "Air-conditioned Rooms", "Night Swimming", "Kitchen & Grill Use", "Free Wi-Fi", "Secure Parking"],
            price: "₱25,000",
            venueDesc: "A complete private resort experience for families and groups wanting an extended stay.",
            amenities: [
                { title: "Comforts", items: ["Air-conditioned Rooms", "Clean Restrooms", "Shower Area", "Free Wi-Fi"] },
                { title: "Entertainment", items: ["Pool Access (Day & Night)", "Karaoke", "Billiards"] },
                { title: "Kitchen & Dining", items: ["Gas Stove", "Refrigerator", "BBQ Grill", "Dining Tables"] }
            ]
        }
    };

    const modal = document.getElementById("service-modal");
    const modalCard = document.getElementById("service-modal-card");
    const modalClose = document.getElementById("service-modal-close");
    const modalBackdrop = document.getElementById("service-modal-backdrop");

    function openServiceModal(serviceKey) {
        const data = serviceData[serviceKey];
        if (!data) return;

        document.getElementById("service-modal-img").src = data.img;
        document.getElementById("service-modal-img").alt = data.title;
        document.getElementById("service-modal-label").textContent = data.label;
        document.getElementById("service-modal-title").textContent = data.title;
        document.getElementById("service-modal-desc").textContent = data.desc;

        // Setup Pricing & Booking side
        const priceEl = document.getElementById("service-modal-price");
        const venueDescEl = document.getElementById("service-modal-venue-desc");
        if (priceEl) priceEl.textContent = data.price;
        if (venueDescEl) venueDescEl.textContent = data.venueDesc;

        // Features
        const featuresList = document.getElementById("service-modal-features");
        if (featuresList) {
            featuresList.innerHTML = "";
            data.features.forEach(f => {
                const li = document.createElement("li");
                li.textContent = f;
                featuresList.appendChild(li);
            });
        }

        // Amenities Accordion
        const amenitiesContainer = document.getElementById("service-modal-amenities");
        if (amenitiesContainer && data.amenities) {
            amenitiesContainer.innerHTML = "";
            data.amenities.forEach((group, index) => {
                const isActive = index === 0 ? "active" : "";
                const isExpanded = index === 0 ? "true" : "false";
                const icon = index === 0 ? "−" : "+";

                let itemsHtml = "";
                group.items.forEach(item => {
                    itemsHtml += `<div class="checklist-item"><span class="check-icon">&#10003;</span><span>${item}</span></div>`;
                });

                const accordionItem = `
                    <div class="accordion-item ${isActive}">
                        <button class="accordion-header" aria-expanded="${isExpanded}">
                            <h3>${group.title}</h3>
                            <span class="accordion-icon">${icon}</span>
                        </button>
                        <div class="accordion-body">
                            <div class="checklist-grid">
                                ${itemsHtml}
                            </div>
                        </div>
                    </div>
                `;
                amenitiesContainer.insertAdjacentHTML("beforeend", accordionItem);
            });
        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }

    function closeServiceModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
    }
    window.openServiceModal = openServiceModal;

    document.querySelectorAll(".service-card").forEach(card => {
        card.addEventListener("click", () => {
            openServiceModal(card.dataset.service);
        });
    });

    if (modalClose) modalClose.addEventListener("click", closeServiceModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeServiceModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) closeServiceModal();
    });

    // ─── 8. Amenities Accordion (Event Delegation) ───
    document.addEventListener("click", (e) => {
        const header = e.target.closest(".accordion-header");
        if (!header) return;

        const item = header.closest(".accordion-item");
        if (!item) return;

        const accordionContainer = item.closest(".amenities-accordion");
        if (!accordionContainer) return;

        const isActive = item.classList.contains("active");
        const icon = header.querySelector(".accordion-icon");

        // Close all siblings
        accordionContainer.querySelectorAll(".accordion-item").forEach(ai => {
            ai.classList.remove("active");
            const aiIcon = ai.querySelector(".accordion-icon");
            if (aiIcon) aiIcon.textContent = "+";
            ai.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
        });

        // Open clicked (if wasn't active)
        if (!isActive) {
            item.classList.add("active");
            if (icon) icon.textContent = "−";
            header.setAttribute("aria-expanded", "true");
        }
    });

    // ─── 9. Lightbox ───
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    const scatterItems = document.querySelectorAll(".scatter-item img");
    let lightboxImages = [];
    let lightboxIndex = 0;

    scatterItems.forEach(img => lightboxImages.push(img.src));

    function openLightbox(index) {
        lightboxIndex = index;
        lightboxImg.src = lightboxImages[lightboxIndex];
        lightboxImg.alt = scatterItems[lightboxIndex]?.alt || "";
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
    }

    function nextImage() {
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
    }
    function prevImage() {
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
    }

    document.querySelectorAll(".scatter-item").forEach((item, i) => {
        item.addEventListener("click", () => openLightbox(i));
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", prevImage);
    if (lightboxNext) lightboxNext.addEventListener("click", nextImage);

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Lightbox swipe
    let lbTouchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => { lbTouchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
        const diff = lbTouchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
    });

    // ─── 10. Smooth scroll ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href === "#") return;
            if (this.closest(".nav-overlay")) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
});
