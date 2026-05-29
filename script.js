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

        if (sessionStorage.getItem('loaderShown') || prefersReducedMotion) {
            finish();
            return;
        }

        // Trigger the CSS animation sequence
        loader.classList.add('animate');
        sessionStorage.setItem('loaderShown', 'true');

        // Hide loader + play video after the full 6.5s CSS animation completes
        setTimeout(finish, 6500);
    }());

    // ─── 0.5. Parallax Greenery ───
    // Diagonal corner leaves drift slower than scroll for a depth effect.
    if (!prefersReducedMotion) {
        document.querySelectorAll('.parallax-slow').forEach(function (el) {
            var section = el.closest('section') || el.parentElement;
            if (!section) return;
            // Top-right leaves drift up, bottom-left leaves drift down, so the
            // pair appears to drift apart noticeably as the user scrolls past.
            var direction = el.classList.contains('deco-greenery-bl') ? 80 : -80;
            gsap.to(el, {
                yPercent: direction,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });
        });

        // Recompute trigger positions once images finish loading (so the parallax
        // boundaries are correct — leaf <img>s may not have known dimensions at
        // DOMContentLoaded time).
        window.addEventListener('load', function () {
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
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
            title: "Wedding & Event Venue",
            desc: "Celebrate your love story in our breathtaking wedding venue. With lush gardens, an elegant function hall, and stunning poolside backdrops, every moment of your special day will be picture-perfect.",
            amenities: [
                { title: "Layout & Furnishings", items: ["Function Hall", "4 Villas (downstairs only)", "1 Private Room", "Tables with elegant white cloth & topper", "Monobloc chairs with white cover & ribbons", "Simple couch for the celebrant"] },
                { title: "Entertainment & Décor", items: ["Sound System", "Basic stage decoration", "Pool decoration", "Entrance decoration", "FREE swimming"] },
                { title: "Dining & Service", items: ["Food (5 main course, rice, drinks, dessert, water)", "Full silverware, glassware & folded table napkins", "3–4 waiters/waitresses"] }
            ],
            packages: [
                {
                    name: "50 Guests",
                    price: "₱65,000",
                    duration: "8-hour celebration",
                    guests: "50 pax",
                    desc: "Exclusive use of the whole resort with full catering and décor for 50 guests.",
                    inclusions: ["Whole Resort (Function Hall, 4 villas downstairs, 1 private room)", "Food for 50 guests (5 courses)", "3–4 waiters/waitresses", "Stage, pool & entrance decoration", "Sound System", "Tables with elegant white cloth & topper", "Full silverware, glassware & napkins", "50 chairs with white cover & ribbons", "Simple couch for the celebrant", "FREE swimming"],
                    paymentUrl: "#"
                },
                {
                    name: "100 Guests",
                    price: "₱80,000",
                    duration: "8-hour celebration",
                    guests: "100 pax",
                    desc: "Grand celebration with exclusive resort access, full catering and décor for 100 guests.",
                    inclusions: ["Whole Resort (Function Hall, 4 villas downstairs, 1 private room)", "Food for 100 guests (5 courses)", "3–4 waiters/waitresses", "Stage, pool & entrance decoration", "Sound System", "Tables with elegant white cloth & topper", "Full silverware, glassware & napkins", "100 chairs with white cover & ribbons", "Simple couch for the celebrant", "FREE swimming"],
                    paymentUrl: "#"
                }
            ]
        },
        birthday: {
            img: "assets/bday.jpg",
            label: "— Fun & Celebration",
            title: "Birthday Party",
            desc: "Make birthdays truly special at Don Henrico. From intimate family gatherings to grand celebrations, our versatile spaces and entertainment amenities create the perfect party atmosphere.",
            amenities: [
                { title: "Entertainment", items: ["Sound system / Videoke", "Pool Access", "Game Area"] },
                { title: "Comforts", items: ["1 Airconditioned room", "All villas downstairs only", "Tables & chairs with cover"] },
                { title: "Dining", items: ["Food (5 courses)", "Dessert", "Unlimited drinks (juice, water)", "Utensils", "Food attendant"] }
            ],
            packages: [
                {
                    name: "50 Guests",
                    price: "₱45,000",
                    duration: "8-hour party",
                    guests: "50 pax",
                    desc: "A full birthday celebration with themed décor, food, and entertainment for 50 guests.",
                    inclusions: ["8-hour party", "Themed party decoration", "Sound system / Videoke", "Food (5 courses)", "Dessert", "Tables & chairs with cover", "Utensils", "Unlimited drinks (juice, water)", "Food attendant", "1 airconditioned room", "All villas downstairs only"],
                    paymentUrl: "#"
                },
                {
                    name: "100 Guests",
                    price: "₱65,000",
                    duration: "8-hour party",
                    guests: "100 pax",
                    desc: "A grand birthday celebration with themed décor, food, and entertainment for 100 guests.",
                    inclusions: ["8-hour party", "Themed party decoration", "Sound system / Videoke", "Food (5 courses)", "Dessert", "Tables & chairs with cover", "Utensils", "Unlimited drinks (juice, water)", "Food attendant", "1 airconditioned room", "All villas downstairs only"],
                    paymentUrl: "#"
                }
            ]
        },
        christening: {
            img: "assets/debut.jpg",
            label: "— Sacred Moments",
            title: "Christening",
            desc: "Welcome new life in a serene and beautiful setting. Our peaceful gardens and intimate spaces provide the perfect backdrop for christenings and baptismal celebrations.",
            amenities: [
                { title: "Layout & Furnishings", items: ["Outdoor Gazebo", "Tables & Chairs", "Garden Seating"] },
                { title: "Comforts", items: ["Free Wi-Fi", "Air Conditioning", "Children-friendly Spaces"] },
                { title: "Safety", items: ["24/7 Security", "Secure Parking", "First Aid Kit"] }
            ],
            packages: [
                {
                    name: "Garden",
                    price: "₱12,000",
                    duration: "Half Day",
                    guests: "Up to 30 pax",
                    desc: "Intimate outdoor christening with garden seating and gazebo.",
                    inclusions: ["Outdoor Gazebo", "Garden Seating", "Tables & Chairs", "Photography Spots", "Children-friendly Area"],
                    paymentUrl: "#"
                },
                {
                    name: "Garden + Reception",
                    price: "₱22,000",
                    duration: "Full Day",
                    guests: "Up to 50 pax",
                    desc: "Garden ceremony followed by an indoor reception in the function hall.",
                    inclusions: ["Outdoor Gazebo", "Function Hall (reception)", "Tables, Chairs, Linens", "Sound System", "Kitchen Access", "Dedicated Coordinator"],
                    paymentUrl: "#"
                }
            ]
        },
        overnight: {
            img: "assets/gallery 5.jpg",
            label: "— Private Retreat",
            title: "Villa & Overnight Stay",
            desc: "Escape the city and enjoy a peaceful stay with family and friends. Choose from single villa rentals to exclusive full-resort access with all amenities included.",
            amenities: [
                { title: "Comforts", items: ["Air-conditioned Rooms", "Private CR per villa", "4 Common CR with shower", "3 Outdoor showers", "Free Wi-Fi"] },
                { title: "Entertainment", items: ["Pool Access", "Function Hall", "Sound system / Videoke"] },
                { title: "Essentials", items: ["CCTV secured cameras", "Parking", "Bring your own towels"] }
            ],
            packages: [
                {
                    name: "Single Villa (Day)",
                    price: "₱3,500",
                    duration: "10 AM – 8 AM (22 hrs)",
                    guests: "3 pax",
                    desc: "One villa (up and downstairs) with airconditioned room — perfect for a quick daytime getaway.",
                    inclusions: ["1 villa up & downstairs (aircon)", "3 persons", "Wi-Fi zone", "Parking", "CCTV secured cameras", "Bring your own towels"],
                    paymentUrl: "#"
                },
                {
                    name: "Single Villa (Night)",
                    price: "₱2,500",
                    duration: "4 PM – 8 AM",
                    guests: "3 pax",
                    desc: "Overnight single villa stay with airconditioned room.",
                    inclusions: ["1 villa up & downstairs (aircon)", "3 persons", "Wi-Fi zone", "Parking", "CCTV secured cameras", "Bring your own towels"],
                    paymentUrl: "#"
                },
                {
                    name: "Exclusive (Day)",
                    price: "₱15,000",
                    duration: "10 AM – 8 AM (22 hrs)",
                    guests: "16–20 pax",
                    desc: "Full exclusive resort access with 4 villas, function hall, and all amenities.",
                    inclusions: ["4 villas (3–4 guests upstairs/room)", "Private CR per villa + aircon", "4 common CR with shower", "3 outdoor showers", "Function Hall with sound system/videoke", "Bring your own towels"],
                    paymentUrl: "#"
                },
                {
                    name: "Exclusive (Night)",
                    price: "₱12,000",
                    duration: "5 PM – 8 AM",
                    guests: "16–20 pax",
                    desc: "Exclusive overnight resort access with all 4 villas and function hall.",
                    inclusions: ["4 villas (3–4 guests upstairs/room)", "Private CR per villa + aircon", "4 common CR with shower", "3 outdoor showers", "Function Hall with sound system/videoke", "Bring your own towels"],
                    paymentUrl: "#"
                }
            ]
        },
        rates: {
            img: "assets/gallery3.jpg",
            label: "— Walk-in Rates",
            title: "Entrance & Rental Rates",
            desc: "Planning a day swim, night swim, or need a venue? Check our entrance fees and rental rates for villas and the function hall.",
            amenities: [
                { title: "Pool & Facilities", items: ["Swimming Pool", "Free Wi-Fi", "Shower Area", "Parking", "CCTV secured"] },
                { title: "Villa Features", items: ["Air-conditioned Rooms", "Private CR per villa", "Up & Downstairs access"] },
                { title: "Function Hall", items: ["Spacious event space", "Sound system available", "Tables & Chairs"] }
            ],
            packages: [
                {
                    name: "Day Swim",
                    price: "₱120 – ₱140",
                    duration: "8 AM – 4 PM",
                    guests: "Per person",
                    desc: "Walk-in day swimming rates. Adults (10 yrs & above): ₱140. Kids (4–9 yrs): ₱120. Free Wi-Fi included.",
                    inclusions: ["Adult: ₱140 (10 yrs old & above)", "Kids: ₱120 (4–9 years old)", "Pool access", "Free Wi-Fi"],
                    paymentUrl: "#"
                },
                {
                    name: "Night Swim",
                    price: "₱130 – ₱150",
                    duration: "Evening",
                    guests: "Per person",
                    desc: "Walk-in night swimming rates. Adults (10 yrs & above): ₱150. Kids (4–9 yrs): ₱130. Free Wi-Fi included.",
                    inclusions: ["Adult: ₱150 (10 yrs old & above)", "Kids: ₱130 (4–9 years old)", "Pool access", "Free Wi-Fi"],
                    paymentUrl: "#"
                },
                {
                    name: "Villa & Hall",
                    price: "₱700 – ₱3,000",
                    duration: "Per use",
                    guests: "Varies",
                    desc: "Rent individual villas or the function hall for your event or stay.",
                    inclusions: ["Villa with Aircon (Up & Down): ₱1,200", "Small Villa (Downstairs only): ₱700", "Function Hall: ₱3,000"],
                    paymentUrl: "#"
                }
            ]
        }
    };

    const modal = document.getElementById("service-modal");
    const modalCard = document.getElementById("service-modal-card");
    const modalClose = document.getElementById("service-modal-close");
    const modalBackdrop = document.getElementById("service-modal-backdrop");

    // Helper — remove all child nodes (safer than innerHTML = "")
    function emptyNode(el) {
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    // Render a single package into the sidebar detail area.
    function renderPackage(pkg) {
        const priceEl     = document.getElementById("service-modal-price");
        const venueDescEl = document.getElementById("service-modal-venue-desc");
        const metaEl      = document.getElementById("service-modal-meta");
        const inclEl      = document.getElementById("service-modal-inclusions");
        if (priceEl)     priceEl.textContent = pkg.price;
        if (venueDescEl) venueDescEl.textContent = pkg.desc;
        if (metaEl) {
            emptyNode(metaEl);
            if (pkg.duration) {
                const dur = document.createElement("span");
                dur.textContent = pkg.duration;
                metaEl.appendChild(dur);
            }
            if (pkg.guests) {
                const g = document.createElement("span");
                g.textContent = pkg.guests;
                metaEl.appendChild(g);
            }
        }
        if (inclEl) {
            emptyNode(inclEl);
            (pkg.inclusions || []).forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                inclEl.appendChild(li);
            });
        }
        // Update "Book This Package" button href to the package-specific payment URL
        const bookBtn = document.getElementById("service-modal-book-btn");
        if (bookBtn) bookBtn.href = pkg.paymentUrl || "#";
    }

    function openServiceModal(serviceKey) {
        const data = serviceData[serviceKey];
        if (!data) return;

        document.getElementById("service-modal-img").src = data.img;
        document.getElementById("service-modal-img").alt = data.title;
        document.getElementById("service-modal-label").textContent = data.label;
        document.getElementById("service-modal-title").textContent = data.title;
        document.getElementById("service-modal-desc").textContent = data.desc;

        // Render package tabs + show first package by default
        const tabsEl = document.getElementById("service-modal-tabs");
        const packages = data.packages || [];
        if (tabsEl) {
            emptyNode(tabsEl);
            packages.forEach((pkg, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pkg-tab" + (i === 0 ? " active" : "");
                btn.setAttribute("role", "tab");
                btn.textContent = pkg.name;
                btn.addEventListener("click", function () {
                    tabsEl.querySelectorAll(".pkg-tab").forEach(t => t.classList.remove("active"));
                    btn.classList.add("active");
                    renderPackage(pkg);
                });
                tabsEl.appendChild(btn);
            });
            if (packages[0]) renderPackage(packages[0]);
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
    // View switching inside the service modal (details → form → payment → thanks)
    function showView(viewId) {
        var views = document.querySelectorAll('.modal-view');
        views.forEach(function (v) { v.classList.remove('modal-view-active'); });
        var target = document.getElementById(viewId);
        if (target) target.classList.add('modal-view-active');
        if (modalCard) modalCard.scrollTop = 0;
    }
    function showDetailsView()      { showView('modal-view-details'); }
    function showInquiryFormView()  { showView('modal-view-form'); }
    function showPaymentView()      { showView('modal-view-payment'); }
    function showThanksView()       { showView('modal-view-thanks'); }

    // Reset the modal to the details view every time it opens / closes
    function resetModalView() { showView('modal-view-details'); }

    window.openServiceModal     = function (k) { resetModalView(); openServiceModal(k); };
    window.closeServiceModal    = function () { closeServiceModal(); resetModalView(); };
    window.showDetailsView      = showDetailsView;
    window.showInquiryView      = showInquiryFormView;   // back-compat: button still calls showInquiryView()
    window.showInquiryFormView  = showInquiryFormView;
    window.showPaymentView      = showPaymentView;
    window.showThanksView       = showThanksView;

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
